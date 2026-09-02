import os
from google.cloud import storage
from app.core.config import settings

def create_bucket():
    project_id = settings.GCP_PROJECT_ID
    bucket_name = settings.GCS_BUCKET_NAME
    # Ensure credentials are set
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = os.path.abspath(settings.GOOGLE_APPLICATION_CREDENTIALS)
    
    try:
        storage_client = storage.Client(project=project_id)
        print(f"Attempting to create bucket '{bucket_name}' in project '{project_id}'...")
        bucket = storage_client.create_bucket(bucket_name, location="US")
        print(f"Bucket '{bucket.name}' created successfully.")
    except Exception as e:
        print(f"Error creating bucket: {e}")

if __name__ == "__main__":
    create_bucket()
