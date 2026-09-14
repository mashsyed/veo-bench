import os
import sys

sys.path.append("/Users/mashsyed/.gemini/antigravity/scratch/expedia-genmedia-pipeline/backend")
from app.services.genai_service import genai_service

video_path = "/Users/mashsyed/.gemini/antigravity/scratch/expedia-genmedia-pipeline/scratch/user_beach_veo_output.mp4"
prompt = "Minimal truck left, not too slow and not too fast. Camera body slides sideways at a deliberately restrained pace"
image_path = "/Users/mashsyed/.gemini/antigravity/brain/4ec6a48e-8cc3-4639-a364-462aab398c8b/.user_uploaded/media_1789427806668.jpg"

res = genai_service.evaluate_quality_llm(video_path, prompt, start_image_path=image_path)
print("\n--- Gemini Flash VQA Scorecard Output ---")
print("Stars:", res.get("llm_stars"))
print("Video Summary:", res.get("video_summary"))
print("Reasoning:", res.get("llm_reasoning"))
print("Dimension Scores:", res.get("dimension_scores"))
