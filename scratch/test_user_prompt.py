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

user_img_path = "/Users/mashsyed/.gemini/antigravity/brain/4ec6a48e-8cc3-4639-a364-462aab398c8b/.user_uploaded/media_1789427806668.jpg"
with open(user_img_path, "rb") as f:
    img_bytes = f.read()

start_img = types.Image(image_bytes=img_bytes, mime_type="image/jpeg")

user_prompt = """Minimal truck left, not too slow and not too fast. Camera body slides sideways at a deliberately restrained pace — total lateral travel strictly limited to 7.5-10% of frame width over the full clip. No rotation. Scene drifts imperceptibly right. Extremely subtle 3D lateral parallax, almost imperceptible. Unhurried, glacial pace. Static scene except for natural elements already present — apply irregular, gust- or current-driven motion native to each element: brief, uneven, non-repeating movement interspersed with moments of near-stillness. Avoid rhythmic, looping, or uniform motion across elements. If humans are present, continue whatever action is implied by their pose in the source image — motion should be subtle, restrained, and physically continuous with the source pose, not a new or different action. No new geography, no hallucinated terrain. Preserve exact scene content. All text, signage, and lettering visible in the source image is to be treated as a fixed surface texture. Do not alter, reinterpret, or hallucinate any letters, numbers, or symbols. Reproduce only what is present in the source frame"""

logger.info("Testing user prompt with SINGLE start image (no last_frame)...")

source = types.GenerateVideosSource(
    prompt=user_prompt,
    image=start_img
)

config = types.GenerateVideosConfig(
    person_generation="dont_allow",
    aspect_ratio="16:9",
    duration_seconds=4,
    negative_prompt="morphing walls, new structures, people appearing, texture flickering, sudden cuts, blur"
)

op = client.models.generate_videos(
    model="veo-3.1-lite-generate-001",
    source=source,
    config=config
)
logger.info(f"Operation launched: {op.name}")

while not op.done:
    time.sleep(5)
    logger.info("Polling operation status...")
    op = client.operations.get(op)

logger.info("Operation complete!")
res = op.response
if res and hasattr(res, "generated_videos") and res.generated_videos:
    video_bytes = res.generated_videos[0].video.video_bytes
    out_path = "/Users/mashsyed/.gemini/antigravity/scratch/expedia-genmedia-pipeline/scratch/user_beach_veo_output.mp4"
    with open(out_path, "wb") as f:
        f.write(video_bytes)
    logger.info(f"SUCCESS! Wrote {len(video_bytes)} bytes of REAL VEO VIDEO to {out_path}")
