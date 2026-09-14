import os
import sys
import time
import logging
from google import genai
from google.genai import types

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

project_id = "cs-poc-xbm3l5p9n29nrv0hx1ynd7s"
location = "us-central1"

client = genai.Client(
    vertexai=True,
    project=project_id,
    location=location
)

sample_img_path = "/Users/mashsyed/.gemini/antigravity/scratch/expedia-genmedia-pipeline/backend/static/samples/luxury_suite.jpg"
with open(sample_img_path, "rb") as f:
    img_bytes = f.read()

start_img = types.Image(image_bytes=img_bytes, mime_type="image/jpeg")

# Test veo-3.1-lite-generate-001 model
model_name = "veo-3.1-lite-generate-001"
logger.info(f"Testing real Veo generation with model='{model_name}'...")

try:
    source = types.GenerateVideosSource(
        prompt="A smooth optical push-in camera dolly movement into the luxury hotel room, palm trees swaying outside in the wind, soft water rippling",
        image=start_img
    )
    config = types.GenerateVideosConfig(
        person_generation="dont_allow",
        aspect_ratio="16:9",
        duration_seconds=4
    )
    
    op = client.models.generate_videos(
        model=model_name,
        source=source,
        config=config
    )
    logger.info(f"Operation launched successfully: {op.name}")
    
    while not op.done:
        time.sleep(5)
        logger.info("Polling operation status...")
        op = client.operations.get(op)
        
    logger.info("Operation complete!")
    res = op.response
    logger.info(f"Response object: {res}")
    
    if res and hasattr(res, "generated_videos") and res.generated_videos:
        video_bytes = res.generated_videos[0].video.video_bytes
        out_path = "/Users/mashsyed/.gemini/antigravity/scratch/expedia-genmedia-pipeline/scratch/real_veo_output.mp4"
        with open(out_path, "wb") as f:
            f.write(video_bytes)
        logger.info(f"SUCCESS! Wrote {len(video_bytes)} bytes of REAL VEO VIDEO to {out_path}")
    else:
        logger.error(f"Operation completed but response structure is: {res}")

except Exception as e:
    logger.error(f"Veo test failed: {e}", exc_info=True)
