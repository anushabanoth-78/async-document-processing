# Async Document Processing Workflow System

A full-stack internship project for uploading documents, processing them asynchronously, tracking live progress, reviewing extracted data, finalizing approved records, and exporting results.

## Overview

This project is designed around a realistic document operations workflow:

- users upload one or more documents
- the backend stores file metadata and creates processing jobs
- background workers process files asynchronously
- progress updates are streamed back to the UI
- reviewers inspect and edit extracted fields
- finalized records can be exported as JSON or CSV

The main goal is to demonstrate clean system design with `Next.js`, `FastAPI`, `PostgreSQL`, `Redis`, and `Celery`.

## Use Case

The recommended scenario for this project is invoice processing for an operations or accounts team.

Example extracted fields:

- vendor name
- invoice number
- invoice date
- total amount
- tax amount
- currency
- payment status

## Core Features

- multi-document upload
- async background processing
- job status tracking
- realtime or near-realtime progress updates
- searchable document dashboard
- detail page for extracted output
- editable review workflow
- retry for failed jobs
- finalize approved records
- export as JSON and CSV

## Frontend Screens

The frontend should include these screens:

### 1. Dashboard

Route: `/` or `/documents`

Purpose:

- show all uploaded documents
- search by filename or invoice number
- filter by status
- sort by upload date or status
- display progress and job state

### 2. Upload Page

Route: `/upload`

Purpose:

- upload one or more documents
- show selected file list
- submit files for background processing

### 3. Document Detail Page

Route: `/documents/[id]`

Purpose:

- show file metadata
- show processing state
- show extracted data
- show progress timeline
- show failure state if processing fails

### 4. Review Page

Route: `/documents/[id]/review`

Purpose:

- edit extracted invoice fields
- save reviewed output
- prepare the document for finalization

### 5. Export Page or Export Actions

Route: `/documents/[id]/export`

Purpose:

- export finalized data as JSON
- export finalized data as CSV

## Suggested FastAPI Routes

### Documents

- `POST /api/documents/upload`
- `GET /api/documents`
- `GET /api/documents/{id}`

### Jobs

- `GET /api/jobs/{id}`
- `POST /api/jobs/{id}/retry`
- `GET /api/jobs/{id}/events`
- `GET /api/jobs/{id}/stream`

### Review and Finalization

- `PUT /api/documents/{id}/review`
- `POST /api/documents/{id}/finalize`

### Export

- `GET /api/documents/{id}/export/json`
- `GET /api/documents/{id}/export/csv`

### Health Check

- `GET /health`

## Suggested Job Lifecycle

```text
Queued -> Processing -> Completed -> Finalized
                    \-> Failed -> Retry -> Queued
```

## Suggested Progress Events

- `job_queued`
- `job_started`
- `document_parsing_started`
- `document_parsing_completed`
- `field_extraction_started`
- `field_extraction_completed`
- `job_completed`
- `job_failed`

## Recommended Tech Stack

### Frontend

- `Next.js`
- `TypeScript`
- `Tailwind CSS`
- `TanStack Query`
- `React Hook Form`

### Backend

- `FastAPI`
- `Pydantic`
- `SQLAlchemy` or `SQLModel`
- `Alembic`

### Async and Realtime

- `Celery`
- `Redis`
- `Redis Pub/Sub`
- `Server-Sent Events` or `WebSocket`

### Database

- `PostgreSQL`

## File Structure

This repository currently contains the Next.js frontend scaffold. The structure below shows both the current frontend and the recommended backend layout.

### Root Structure

```text
async-document-processor/
  app/                  # Next.js App Router pages
  public/               # static assets
  backend/              # FastAPI backend (recommended)
  package.json          # frontend dependencies and scripts
  tsconfig.json         # TypeScript config
  next.config.ts        # Next.js config
  README.md             # project documentation
```

### Frontend Structure

```text
app/
  layout.tsx                    # root layout
  page.tsx                      # dashboard landing page
  globals.css                   # global styles
  upload/
    page.tsx                    # upload screen
  documents/
    page.tsx                    # document list dashboard
    [id]/
      page.tsx                  # document detail page
      review/
        page.tsx                # review and edit page
      export/
        page.tsx                # export page
```

### Backend Structure

```text
backend/
  app/
    main.py                     # FastAPI entry point
    api/
      documents.py              # upload, list, detail routes
      jobs.py                   # job status, retry, events, stream
      review.py                 # reviewed output and finalize routes
      export.py                 # JSON and CSV export routes
      health.py                 # health check route
    models/
      document.py               # database model for documents
      job.py                    # database model for processing jobs
      result.py                 # database model for extracted results
    schemas/
      document.py               # request and response schemas
      job.py                    # job schemas
      review.py                 # review and finalize schemas
      export.py                 # export response schemas if needed
    services/
      document_service.py       # upload and document orchestration
      job_service.py            # job creation and tracking
      review_service.py         # save reviewed output
      export_service.py         # JSON and CSV generation
      storage_service.py        # local file storage handling
      pubsub_service.py         # Redis Pub/Sub publishing
    workers/
      celery_app.py             # Celery config
      tasks.py                  # background processing tasks
```

### Route Mapping

Frontend pages and backend APIs should match like this:

```text
/upload                      -> POST /api/documents/upload
/documents                   -> GET /api/documents
/documents/[id]              -> GET /api/documents/{id}
/documents/[id]/review       -> PUT /api/documents/{id}/review
/documents/[id]/export       -> GET /api/documents/{id}/export/json
                              GET /api/documents/{id}/export/csv
job progress widgets         -> GET /api/jobs/{id}
                              GET /api/jobs/{id}/events
                              GET /api/jobs/{id}/stream
retry actions                -> POST /api/jobs/{id}/retry
```

### Notes on Structure

- keep `FastAPI` as the main backend API instead of duplicating routes inside Next.js
- keep business logic inside `services/`, not directly in route files
- keep background task logic inside `workers/`
- keep schemas separate from database models
- use the `app/` folder in Next.js only for UI pages and frontend logic

## Getting Started

### Frontend

Install dependencies and run the Next.js app:

```bash
npm install
npm run dev
```

Frontend runs at:

```text
http://localhost:3000
```

### Backend

If your FastAPI app is in a `backend/` folder, a typical local setup is:

```bash
pip install fastapi uvicorn celery redis sqlalchemy alembic python-multipart psycopg2-binary
uvicorn app.main:app --reload
```

Backend usually runs at:

```text
http://localhost:8000
```

## Development Order

Build the project in this order:

1. Create the dashboard and upload page.
2. Create document detail and review pages.
3. Implement document upload and listing APIs.
4. Implement async job processing with Celery.
5. Add Redis Pub/Sub progress updates.
6. Implement review, finalize, and export flows.

## Current Status

- Next.js frontend is initialized
- default starter page should be replaced with the dashboard
- FastAPI backend should provide the main API surface
- Next.js API routes are optional and not required if FastAPI is used directly

## Notes

- document processing must happen in background workers, not in request handlers
- exports should only be available for finalized documents
- failed jobs should be retryable
- progress updates should be visible from the dashboard and detail page
