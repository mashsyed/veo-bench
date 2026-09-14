import os
import logging
from google.cloud import storage
from app.config import settings

logger = logging.getLogger(__name__)

GCS_BUCKET_NAME = "veobench-media-assets-cs-poc"

class GCSService:
    def __init__(self):
        self.bucket_name = GCS_BUCKET_NAME
        self.client = None
        try:
            self.client = storage.Client(project=settings.GCP_PROJECT_ID)
        except Exception as e:
            logger.warning(f"GCS client initialization notice: {e}")

    def upload_file(self, local_file_path: str, gcs_blob_name: str, content_type: str = "video/mp4") -> str:
        """
        Uploads a local file to GCS bucket and returns the public HTTPS URL.
        Falls back gracefully to local static URL if GCS upload fails.
        """
        if not os.path.exists(local_file_path):
            return f"/static/generated/{os.path.basename(local_file_path)}"

        if self.client:
            try:
                bucket = self.client.bucket(self.bucket_name)
                blob = bucket.blob(gcs_blob_name)
                blob.upload_from_filename(local_file_path, content_type=content_type)
                public_url = f"https://storage.googleapis.com/{self.bucket_name}/{gcs_blob_name}"
                logger.info(f"Successfully uploaded {local_file_path} to GCS: {public_url}")
                return public_url
            except Exception as e:
                logger.error(f"GCS upload failed for {local_file_path}: {e}")

        # Fallback to local static path
        filename = os.path.basename(local_file_path)
        return f"/static/generated/{filename}"

gcs_service = GCSService()
