import os
import asyncio
from fastapi import UploadFile
from google.cloud import storage
from app.core.config import settings
import google.auth.exceptions

class StorageService:
    def __init__(self):
        self.bucket_name = settings.GCS_BUCKET_NAME
        self.project_id = settings.GCP_PROJECT_ID
        self._storage_client = None
        self.use_gcs = False

        # Use GCS if credentials and bucket name are configured
        if self.bucket_name and self.project_id and settings.GOOGLE_APPLICATION_CREDENTIALS:
            try:
                # Log credentials being used
                print(f"Initializing GCS client with project '{self.project_id}'")
                print(f"Credentials path: {settings.GOOGLE_APPLICATION_CREDENTIALS}")
                
                self._storage_client = storage.Client(project=self.project_id)
                self.bucket = self._storage_client.bucket(self.bucket_name)
                
                # We can't easily check for bucket existence without permissions, 
                # but we can try to get it.
                # Just assuming it works for now unless it throws an error in __init__.
                self.use_gcs = True
                print(f"GCS client initialized. Target bucket: {self.bucket_name}")
            except google.auth.exceptions.DefaultCredentialsError:
                print("GCP Credentials not found or invalid.")
                self.use_gcs = False
            except Exception as e:
                print(f"Error initializing GCS client: {e}")
                self.use_gcs = False
        else:
            print("GCS not fully configured (missing bucket name, project id, or credentials path).")

        if not self.use_gcs:
            self.UPLOAD_DIR = "uploads"
            os.makedirs(self.UPLOAD_DIR, exist_ok=True)
        else:
            self.UPLOAD_FOLDER = "documents"

    async def save_file(self, file: UploadFile) -> str:
        if self.use_gcs:
            try:
                # Read file content asynchronously, then upload synchronously
                contents = await file.read()
                import io
                # Use a folder prefix in GCS
                blob_path = f"{self.UPLOAD_FOLDER}/{file.filename}"
                blob = self.bucket.blob(blob_path)
                blob.upload_from_file(
                    io.BytesIO(contents),
                    content_type=file.content_type
                )
                print(f"Uploaded '{file.filename}' to GCS bucket '{self.bucket_name}' in folder '{self.UPLOAD_FOLDER}'.")
                return f"gs://{self.bucket_name}/{blob_path}"
            except Exception as e:
                print(f"GCS upload failed: {e}. Falling back to local storage.")
                # Fall through to local storage
                self.use_gcs = False
                self.UPLOAD_DIR = "uploads"
                os.makedirs(self.UPLOAD_DIR, exist_ok=True)

        # Local storage fallback
        import aiofiles
        file_path = os.path.join(self.UPLOAD_DIR, file.filename)
        async with aiofiles.open(file_path, 'wb') as out_file:
            # file may already be read above, seek back or re-read
            await file.seek(0)
            while content := await file.read(1024 * 1024):
                await out_file.write(content)
        return file_path

    async def get_file_content(self, file_path: str) -> bytes:
        """
        Retrieves the file content from GCS or local storage.
        """
        if file_path.startswith("gs://"):
            if not self.use_gcs:
                raise Exception("GCS is not configured but file path is gs://")
            
            # Extract bucket and blob path
            # gs://bucket-name/folder/filename.pdf
            parts = file_path.replace("gs://", "").split("/", 1)
            if len(parts) < 2:
                raise Exception(f"Invalid GCS path: {file_path}")
            
            blob_path = parts[1]
            blob = self.bucket.blob(blob_path)
            return blob.download_as_bytes()
        else:
            # Local file
            import aiofiles
            if not os.path.exists(file_path):
                raise Exception(f"Local file not found: {file_path}")
            
            async with aiofiles.open(file_path, mode='rb') as f:
                return await f.read()
