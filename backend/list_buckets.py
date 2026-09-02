import os
from google.cloud import storage
from app.core.config import settings

def list_buckets():
    project_id = settings.GCP_PROJECT_ID
    # Ensure credentials are set
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = settings.GOOGLE_APPLICATION_CREDENTIALS
    
    try:
        storage_client = storage.Client(project=project_id)
        buckets = list(storage_client.list_buckets())
        print(f"Buckets in project {project_id}:")
        for bucket in buckets:
            print(f" - {bucket.name}")
        
        if not buckets:
            print("No buckets found in this project.")
            
    except Exception as e:
        print(f"Error listing buckets: {e}")

if __name__ == "__main__":
    list_buckets()
