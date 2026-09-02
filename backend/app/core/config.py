import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", 
        extra="ignore"
    )
    
    PROJECT_NAME: str = "Async Document Processor"
    
    # Postgres
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql+asyncpg://neondb_owner:npg_kHwLm0fO2yIe@ep-divine-block-ajsvrg5i-pooler.c-3.us-east-2.aws.neon.tech/neondb"
    ).replace("postgresql://", "postgresql+asyncpg://").split("?")[0]
    
    # Celery & Redis
    CELERY_BROKER_URL: str = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")
    CELERY_RESULT_BACKEND: str = os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/0")
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")

    # GCP Cloud Storage
    GCP_PROJECT_ID: Optional[str] = os.getenv("GCP_PROJECT_ID")
    GCS_BUCKET_NAME: Optional[str] = os.getenv("GCS_BUCKET_NAME")
    GOOGLE_APPLICATION_CREDENTIALS: Optional[str] = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if self.GOOGLE_APPLICATION_CREDENTIALS:
            # Ensure the path is absolute relative to the backend directory
            if not os.path.isabs(self.GOOGLE_APPLICATION_CREDENTIALS):
                # This file is in backend/app/core/config.py
                # We want the path relative to backend/
                backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
                abs_path = os.path.join(backend_dir, self.GOOGLE_APPLICATION_CREDENTIALS)
                if os.path.exists(abs_path):
                    self.GOOGLE_APPLICATION_CREDENTIALS = abs_path
            
            os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = self.GOOGLE_APPLICATION_CREDENTIALS

settings = Settings()
