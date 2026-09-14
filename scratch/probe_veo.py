import os
import sys
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

os.environ["GOOGLE_GENAI_USE_VERTEXAI"] = "true"
os.environ["GOOGLE_CLOUD_PROJECT"] = "cs-poc-xbm3l5p9n29nrv0hx1ynd7s"

from google import genai
from google.genai import types

models = [
    "veo-3.1-lite-generate-preview",
    "veo-3.1-generate-preview",
    "veo-3.1-fast-generate-preview",
    "veo-2.0-generate-001",
    "veo-001-preview"
]

locations = ["us-central1", "us-east4", "global"]

sample_img_path = "/Users/mashsyed/.gemini/antigravity/scratch/expedia-genmedia-pipeline/backend/static/samples/luxury_suite.jpg"
with open(sample_img_path, "rb") as f:
    img_bytes = f.read()

for loc in locations:
    client = genai.Client(vertexai=True, project="cs-poc-xbm3l5p9n29nrv0hx1ynd7s", location=loc)
    for model in models:
        logger.info(f"Testing location={loc}, model={model}...")
        try:
            # Using the new source argument
            src = types.GenerateVideosSource(
                prompt="A smooth camera push in towards the luxurious hotel bed",
                image=types.Image(image_bytes=img_bytes, mime_type="image/jpeg")
            )
            config = types.GenerateVideosConfig(duration_seconds=4)
            op = client.models.generate_videos(model=model, source=src, config=config)
            logger.info(f"SUCCESS! Created operation for {model} in {loc}: {op.name}")
            break
        except Exception as e:
            msg = str(e)
            if "404" in msg or "NOT_FOUND" in msg:
                logger.info(f"404 Not Found for {model} in {loc}")
            else:
                logger.error(f"Error for {model} in {loc}: {e}")
