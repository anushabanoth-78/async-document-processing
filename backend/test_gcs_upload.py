"""
Diagnostic script - tests GCS upload end-to-end.
Run from the backend/ directory:
    python test_gcs_upload.py
"""
import os
import sys

# Use the absolute path to the key file in the current project
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = os.path.join(os.path.dirname(__file__), "gcp-key.json")

from google.cloud import storage

PROJECT_ID  = "gen-lang-client-0917747785"
BUCKET_NAME = "async-document-processor"

print(f"Credentials: {os.environ['GOOGLE_APPLICATION_CREDENTIALS']}")
print(f"Project    : {PROJECT_ID}")
print(f"Bucket     : {BUCKET_NAME}")
print("-" * 60)

try:
    client = storage.Client(project=PROJECT_ID)
    print("[OK] GCS client created")
except Exception as e:
    print(f"[FAIL] GCS client creation failed: {e}")
    sys.exit(1)

try:
    bucket = client.bucket(BUCKET_NAME)
    blob_path = "test-folder/test-diagnostic.txt"
    blob = bucket.blob(blob_path)
    blob.upload_from_string("hello from diagnostic", content_type="text/plain")
    print(f"[OK] Upload succeeded! File is at gs://{BUCKET_NAME}/{blob_path}")
except Exception as e:
    print(f"[FAIL] Upload failed: {e}")
