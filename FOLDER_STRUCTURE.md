# Frontend and Backend Folder Structure

This file describes the recommended folder structure for the `async-document-processor` project.

## Frontend Structure

The frontend uses `Next.js` App Router.

```text
async-document-processor/
  app/
    layout.tsx
    page.tsx
    globals.css
    upload/
      page.tsx
    documents/
      page.tsx
      [id]/
        page.tsx
        review/
          page.tsx
        export/
          page.tsx
  public/
  package.json
  tsconfig.json
  next.config.ts
```

### Frontend Folder Explanation

- `app/layout.tsx`
  Root layout for the full application.

- `app/page.tsx`
  Main landing page. This can be your dashboard or redirect to `/documents`.

- `app/globals.css`
  Global styles for the frontend.

- `app/upload/page.tsx`
  Upload screen for one or more invoice or document files.

- `app/documents/page.tsx`
  Dashboard page that lists all uploaded documents.

- `app/documents/[id]/page.tsx`
  Detail page for a single document with file info, status, and extracted data.

- `app/documents/[id]/review/page.tsx`
  Review and edit page for correcting extracted fields.

- `app/documents/[id]/export/page.tsx`
  Export page or export action screen for downloading JSON or CSV.

- `public/`
  Static files such as icons, logos, and images.

## Recommended Frontend Route Map

```text
/                         -> dashboard
/upload                   -> upload page
/documents                -> documents list
/documents/[id]           -> document details
/documents/[id]/review    -> review and edit
/documents/[id]/export    -> export actions
```

## Backend Structure

The backend uses `FastAPI` and should be kept separate from the frontend.

```text
async-document-processor/
  backend/
    app/
      main.py
      api/
        documents.py
        jobs.py
        review.py
        export.py
        health.py
      models/
        document.py
        job.py
        result.py
      schemas/
        document.py
        job.py
        review.py
        export.py
      services/
        document_service.py
        job_service.py
        review_service.py
        export_service.py
        storage_service.py
        pubsub_service.py
      workers/
        celery_app.py
        tasks.py
      db/
        base.py
        session.py
      core/
        config.py
  requirements.txt
```

### Backend Folder Explanation

- `backend/app/main.py`
  Entry point for the FastAPI application.

- `backend/app/api/`
  API route files grouped by feature.

- `backend/app/models/`
  Database models for documents, jobs, and extracted results.

- `backend/app/schemas/`
  Pydantic request and response schemas.

- `backend/app/services/`
  Business logic layer. Keep route handlers thin and place logic here.

- `backend/app/workers/`
  Celery configuration and background task processing.

- `backend/app/db/`
  Database connection setup and shared ORM base.

- `backend/app/core/`
  Core project configuration such as environment settings.

## Recommended FastAPI Route Map

```text
POST   /api/documents/upload
GET    /api/documents
GET    /api/documents/{id}

GET    /api/jobs/{id}
POST   /api/jobs/{id}/retry
GET    /api/jobs/{id}/events
GET    /api/jobs/{id}/stream

PUT    /api/documents/{id}/review
POST   /api/documents/{id}/finalize

GET    /api/documents/{id}/export/json
GET    /api/documents/{id}/export/csv

GET    /health
```

## Recommended Full Project Structure

```text
async-document-processor/
  app/
    layout.tsx
    page.tsx
    globals.css
    upload/
      page.tsx
    documents/
      page.tsx
      [id]/
        page.tsx
        review/
          page.tsx
        export/
          page.tsx
  public/
  backend/
    app/
      main.py
      api/
      models/
      schemas/
      services/
      workers/
      db/
      core/
  package.json
  tsconfig.json
  next.config.ts
  requirements.txt
  README.md
  FOLDER_STRUCTURE.md
```

## Notes

- Keep the frontend and backend clearly separated.
- Use `FastAPI` as the main backend API.
- Do not put core backend business logic inside frontend files.
- Keep background processing inside Celery workers.
- Use the frontend only for UI, forms, tables, and realtime status display.
