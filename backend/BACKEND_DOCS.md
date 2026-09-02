# Backend Documentation - Async Document Processor

This document provides an overview of the backend architecture, setup instructions, and API endpoints for the Async Document Processor project.

## Architecture Overview

The backend is built with **FastAPI** and follows an asynchronous architecture to handle long-running document processing tasks without blocking the main API thread.

### Key Components

- **FastAPI**: The main web framework for the API.
- **PostgreSQL**: Relational database for storing document metadata, job statuses, and extracted results.
- **Redis**: Used as a message broker for Celery and for real-time progress updates via Pub/Sub.
- **Celery**: Distributed task queue for asynchronous document processing.
- **Google Cloud Storage (GCS)**: Cloud storage for uploaded documents.
- **SQLAlchemy (Async)**: ORM for asynchronous database interactions.

## Project Structure

```text
backend/
├── app/
│   ├── api/            # API route definitions
│   ├── core/           # Configuration and settings
│   ├── db/             # Database connection and session management
│   ├── models/         # SQLAlchemy database models
│   ├── schemas/        # Pydantic request/response schemas
│   ├── services/       # Business logic and orchestration
│   └── workers/        # Celery application and background tasks
├── main.py             # Entry point for the FastAPI application
└── .env                # Environment variables configuration
```

## Setup Instructions

### Prerequisites

- Python 3.10+
- PostgreSQL
- Redis
- Google Cloud Project with a GCS bucket

### Installation

1.  **Clone the repository and navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Create and activate a virtual environment:**
    ```bash
    python -m venv .venv
    source .venv/bin/activate  # On Windows: .venv\Scripts\activate
    ```

3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Configure Environment Variables:**
    Create a `.env` file in the `backend/` directory and populate it with your credentials:
    ```env
    DATABASE_URL=postgresql+asyncpg://user:password@host/dbname
    REDIS_URL=rediss://default:password@host:port
    CELERY_BROKER_URL=rediss://default:password@host:port
    CELERY_RESULT_BACKEND=rediss://default:password@host:port
    GCP_PROJECT_ID=your-project-id
    GCS_BUCKET_NAME=your-bucket-name
    GOOGLE_APPLICATION_CREDENTIALS=gcp-key.json
    ```

### Running the Application

1.  **Start the FastAPI server:**
    ```bash
    $env:PYTHONPATH="."; python main.py
    ```
    The API will be available at `http://localhost:8000`.

2.  **Start the Celery worker:**
    ```bash
    celery -A app.workers.celery_app worker --loglevel=info
    ```

## API Endpoints

### Documents

- `POST /api/documents/upload`: Upload one or more documents. Returns `DocumentResponse` with `latest_job_id`.
- `GET /api/documents`: List all uploaded documents.
- `GET /api/documents/{id}`: Get details for a specific document.
- `GET /api/documents/{id}/job`: Get the latest job for a specific document.

### Jobs

- `GET /api/jobs/{id}`: Get the current status and progress of a processing job.
- `POST /api/jobs/{id}/retry`: Retry a failed processing job.
- `GET /api/jobs/{id}/stream`: Real-time Server-Sent Events (SSE) stream for job progress.

### Review & Finalization

- `PUT /api/documents/{id}/review`: Update the extracted fields of a document.
- `POST /api/documents/{id}/finalize`: Mark a document as finalized and lock its state.

### Export

- `GET /api/documents/{id}/export/json`: Export the finalized result as a JSON file.
- `GET /api/documents/{id}/export/csv`: Export the finalized result as a CSV file.

## Document Processing Workflow

1.  **Upload**: User uploads a file. The system stores it in GCS and creates a `Document` and a `Job` (status: `queued`).
2.  **Asynchronous Processing**: A Celery task is triggered. It updates the job status to `processing` and emits progress events via Redis Pub/Sub.
3.  **Extraction**: The worker parses the document and extracts structured data, saving it to the `extracted_results` table.
4.  **Completion**: On success, the job and document status are set to `completed`.
5.  **Review**: The user reviews the extracted data and makes corrections if necessary.
6.  **Finalization**: The user finalizes the document, setting its status to `finalized`.
7.  **Export**: The finalized data can now be exported in JSON or CSV format.

## Improvements Made

- **Asynchronous Task Management**: Implemented a full Celery-based async pipeline.
- **Real-time Updates**: Added Redis Pub/Sub and SSE for near-real-time progress tracking in the UI.
- **Robust Storage**: Integrated GCS with folder-based organization.
- **State Consistency**: Improved status updates across `Document`, `Job`, and `Result` tables during the lifecycle.
- **Robust Export**: Enhanced CSV export to handle nested JSON structures through automatic flattening.
- **Connection Management**: Added proper cleanup for Redis connections during application shutdown.
