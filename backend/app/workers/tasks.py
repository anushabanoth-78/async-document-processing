import asyncio
import time
from app.workers.celery_app import celery_app
from app.db.session import async_session_maker
from app.models.job import Job, JobStatus
from app.models.result import Result
from app.services.pubsub_service import PubSubService
from datetime import datetime

from sqlalchemy.future import select
from app.models.document import Document
from app.services.storage_service import StorageService
import io
import pypdf
import re
import docx

async def process_document_async(job_id: int):
    storage_service = StorageService()
    async with async_session_maker() as session:
        # Load Job and Document
        job = await session.get(Job, job_id)
        if not job:
            return
        
        doc_res = await session.execute(select(Document).where(Document.id == job.document_id))
        doc = doc_res.scalars().first()

        try:
            # 1. Start Job
            job.status = JobStatus.PROCESSING
            job.started_at = datetime.utcnow()
            job.current_stage = "job_started"
            job.progress_percentage = 10
            
            if doc:
                doc.current_status = "processing"
            
            await session.commit()
            await PubSubService.publish_job_progress(job_id, job.status, job.progress_percentage, job.current_stage)

            # 2. Real Parsing
            job.current_stage = "document_parsing_started"
            job.progress_percentage = 20
            await session.commit()
            await PubSubService.publish_job_progress(job_id, job.status, job.progress_percentage, job.current_stage)

            if not doc or not doc.stored_file_path:
                raise Exception("Document or file path not found")

            # Get content from storage service
            file_content = await storage_service.get_file_content(doc.stored_file_path)
            
            # Extract text based on file type
            raw_text = ""
            page_count = 0
            if doc.stored_file_path.lower().endswith(".pdf"):
                pdf_reader = pypdf.PdfReader(io.BytesIO(file_content))
                page_count = len(pdf_reader.pages)
                for page in pdf_reader.pages:
                    raw_text += page.extract_text() + "\n"
            elif doc.stored_file_path.lower().endswith((".doc", ".docx")):
                doc_obj = docx.Document(io.BytesIO(file_content))
                page_count = 1 # python-docx doesn't easily provide page count
                for para in doc_obj.paragraphs:
                    raw_text += para.text + "\n"
            else:
                # Fallback for other text files (though now restricted by API)
                raw_text = file_content.decode("utf-8", errors="ignore")
                page_count = 1

            job.current_stage = "document_parsing_completed"
            job.progress_percentage = 40
            await session.commit()
            await PubSubService.publish_job_progress(job_id, job.status, job.progress_percentage, job.current_stage)

            # 3. Basic Intelligence (Rule-based or Pattern Matching)
            job.current_stage = "field_extraction_started"
            job.progress_percentage = 60
            await session.commit()
            await PubSubService.publish_job_progress(job_id, job.status, job.progress_percentage, job.current_stage)

            # --- INTELLIGENT EXTRACTION LOGIC ---
            text_lower = raw_text.lower()
            
            # 1. Detect Document Type & Currency
            doc_type = "generic"
            currency = "USD"
            if "₹" in raw_text or "inr" in text_lower:
                currency = "INR"
            elif "€" in raw_text or "eur" in text_lower:
                currency = "EUR"
            elif "£" in raw_text or "gbp" in text_lower:
                currency = "GBP"

            if "invoice" in text_lower or "bill" in text_lower:
                doc_type = "invoice"
            elif "ticket" in text_lower or "boarding" in text_lower or "seat" in text_lower:
                doc_type = "ticket"
            elif "receipt" in text_lower:
                doc_type = "receipt"

            # 2. Extract Potential Ticket/Invoice Numbers
            ticket_match = re.search(r'(?:ticket|invoice|receipt|no|number|#)[:\s]*([a-z0-9\-\/#]+)', text_lower)
            ticket_id = ticket_match.group(1).upper() if ticket_match else f"EXT-{doc.id}"

            # 3. Extract Financials
            # Look for "TOTAL: ₹..." or "Amount: ₹..."
            total_match = re.search(r'(?:total|amount|sum|payable)[:\s]*[\$€£₹]?\s*(\d+(?:[\.,]\d{2})?)', text_lower)
            total_amount = float(total_match.group(1).replace(',', '')) if total_match else 0.0

            subtotal_match = re.search(r'(?:subtotal|sub-total)[:\s]*[\$€£₹]?\s*(\d+(?:[\.,]\d{2})?)', text_lower)
            subtotal = float(subtotal_match.group(1).replace(',', '')) if subtotal_match else 0.0

            tax_match = re.search(r'(?:tax|vat|gst)[:\s]*[\$€£₹]?\s*(\d+(?:[\.,]\d{2})?)', text_lower)
            tax_amount = float(tax_match.group(1).replace(',', '')) if tax_match else 0.0

            discount_match = re.search(r'(?:discount|off)[:\s]*\-?[\$€£₹]?\s*(\d+(?:[\.,]\d{2})?)', text_lower)
            discount = float(discount_match.group(1).replace(',', '')) if discount_match else 0.0

            # 4. Extract Metadata
            date_match = re.search(r'(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})', text_lower)
            doc_date = date_match.group(1) if date_match else datetime.utcnow().strftime("%Y-%m-%d")

            time_match = re.search(r'(\d{1,2}:\d{2}:\d{2}(?:\s?[ap]m)?)', text_lower)
            doc_time = time_match.group(1).upper() if time_match else None

            phone_match = re.search(r'(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text_lower)
            phone = phone_match.group(0) if phone_match else None

            # 5. Extract Vendor/Carrier
            lines = [l.strip() for l in raw_text.split('\n') if l.strip()]
            vendor = lines[0] if lines else "Unknown"

            # 6. Extract Line Items (Regex-based attempt)
            # Pattern: Name followed by price and quantity
            # Example: Power Bank ₹2699.25 1 x ₹2699.25 each
            items = []
            item_pattern = re.compile(r'([a-z\s]+)\s*[₹\$€£]?\s*(\d+(?:\.\d{2})?)\s*(\d+)\s*x\s*[₹\$€£]?\s*\d+(?:\.\d{2})?\s*each', re.IGNORECASE)
            for match in item_pattern.finditer(raw_text):
                items.append({
                    "description": match.group(1).strip(),
                    "price": float(match.group(2)),
                    "quantity": int(match.group(3)),
                    "total": float(match.group(2)) * int(match.group(3))
                })

            extracted_data = {
                "document_type": doc_type,
                "vendor_name": vendor,
                "id_number": ticket_id,
                "date": doc_date,
                "time": doc_time,
                "phone": phone,
                "total_amount": total_amount,
                "subtotal": subtotal,
                "tax_amount": tax_amount,
                "discount": discount,
                "currency": currency,
                "line_items": items,
                "metadata": {
                    "filename": doc.original_filename,
                    "file_size_kb": round(len(file_content) / 1024, 2),
                    "page_count": page_count,
                    "extracted_at": datetime.utcnow().isoformat()
                },
                "content_preview": raw_text[:1000].replace('\n', ' ') + "..."
            }

            # Add type-specific fields
            if doc_type == "ticket":
                seat_match = re.search(r'seat[:\s]*([a-z0-9]+)', text_lower)
                gate_match = re.search(r'gate[:\s]*([a-z0-9]+)', text_lower)
                if seat_match: extracted_data["seat"] = seat_match.group(1).upper()
                if gate_match: extracted_data["gate"] = gate_match.group(1).upper()

            job.current_stage = "field_extraction_completed"
            job.progress_percentage = 80
            await session.commit()
            await PubSubService.publish_job_progress(job_id, job.status, job.progress_percentage, job.current_stage)
            
            # 4. Save Extracted Results
            result = Result(
                document_id=job.document_id,
                raw_text=raw_text,
                structured_output_json=extracted_data,
                reviewed_output_json=extracted_data,
            )
            session.add(result)

            # 5. Complete Job
            job.status = JobStatus.COMPLETED
            job.completed_at = datetime.utcnow()
            job.current_stage = "job_completed"
            job.progress_percentage = 100
            
            if doc:
                doc.current_status = "completed"
                
            await session.commit()
            await PubSubService.publish_job_progress(job_id, job.status, job.progress_percentage, job.current_stage)

        except Exception as e:
            job.status = JobStatus.FAILED
            job.error_message = str(e)
            job.completed_at = datetime.utcnow()
            job.current_stage = "job_failed"
            
            if doc:
                doc.current_status = "failed"
                
            await session.commit()
            await PubSubService.publish_job_progress(job_id, job.status, job.progress_percentage, job.current_stage)

@celery_app.task(name="app.workers.tasks.process_document")
def process_document(job_id: int):
    try:
        # On Windows, the proactor event loop can sometimes cause issues 
        # when closed abruptly. Using a dedicated loop management strategy.
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            loop.run_until_complete(process_document_async(job_id))
        finally:
            # Important for cleaning up asyncpg connections correctly on Windows
            loop.run_until_complete(loop.shutdown_asyncgens())
            loop.close()
    except Exception as e:
        print(f"Celery task wrapper error: {e}")
