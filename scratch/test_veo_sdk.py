import os
import sys
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

os.environ["GOOGLE_GENAI_USE_VERTEXAI"] = "true"
os.environ["GOOGLE_CLOUD_PROJECT"] = "cs-poc-xbm3l5p9n29nrv0hx1ynd7s"

from google import genai
from google.genai import types

def test_veo():
    client = genai.Client(
        vertexai=True,
        project="cs-poc-xbm3l5p9n29nrv0hx1ynd7s",
        location="us-central1"
    )
    
    sample_img_path = "/Users/mashsyed/.gemini/antigravity/scratch/expedia-genmedia-pipeline/backend/static/samples/luxury_suite.jpg"
    with open(sample_img_path, "rb") as f:
        img_bytes = f.read()
        
    start_img = types.Image(image_bytes=img_bytes, mime_type="image/jpeg")
    
    config = types.GenerateVideosConfig(
        person_generation="dont_allow",
        aspect_ratio="16:9",
        duration_seconds=4
    )
    
    logger.info("Calling client.models.generate_videos with veo-2.0-generate-001...")
    try:
        operation = client.models.generate_videos(
            model="veo-2.0-generate-001",
            prompt="A smooth camera push in towards the luxurious hotel bed, realistic lighting, motion in palms outside",
            image=start_img,
            config=config
        )
        logger.info(f"Operation started: {operation.name}")
        
        while not operation.done:
            import time
            time.sleep(5)
            logger.info("Polling operation...")
            operation = client.operations.get(operation)
            
        logger.info("Operation complete!")
        result = operation.response
        logger.info(f"Result type: {type(result)}")
        logger.info(f"Result dict/dir: {dir(result)}")
        if hasattr(result, "__dict__"):
            logger.info(f"Result __dict__: {result.__dict__}")
        logger.info(f"Raw result repr: {repr(result)}")
        
    except Exception as e:
        logger.error(f"Veo SDK test failed: {e}", exc_info=True)

if __name__ == "__main__":
    test_veo()
