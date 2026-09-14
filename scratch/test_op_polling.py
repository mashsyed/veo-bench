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

source = types.GenerateVideosSource(
    prompt="A smooth optical push-in camera dolly movement into the luxury hotel room",
    image=start_img
)

config = types.GenerateVideosConfig(
    person_generation="dont_allow",
    aspect_ratio="16:9",
    duration_seconds=4
)

op = client.models.generate_videos(
    model="veo-3.1-lite-generate-001",
    source=source,
    config=config
)

logger.info(f"Operation launched: name={op.name}")
logger.info(f"Initial op dir: {dir(op)}")

while not op.done:
    time.sleep(4)
    op = client.operations.get(op)
    logger.info(f"Polled op.done={op.done}, op.response={getattr(op, 'response', 'NO_RESP_ATTR')}, op.error={getattr(op, 'error', 'NO_ERR_ATTR')}")

logger.info(f"Final op.response: {op.response}")
logger.info(f"Final op.__dict__: {op.__dict__ if hasattr(op, '__dict__') else 'NO_DICT'}")
