import os
import sys

sys.path.append("/Users/mashsyed/.gemini/antigravity/scratch/expedia-genmedia-pipeline/backend")
from app.services.genai_service import genai_service

video_path = "/Users/mashsyed/.gemini/antigravity/scratch/expedia-genmedia-pipeline/scratch/real_veo_output.mp4"
prompt = "A smooth optical push-in camera dolly movement into the luxury hotel room, palm trees swaying outside in the wind, soft ambient lighting"
image_path = "/Users/mashsyed/.gemini/antigravity/scratch/expedia-genmedia-pipeline/backend/static/samples/luxury_suite.jpg"

res = genai_service.evaluate_quality_llm(video_path, prompt, start_image_path=image_path)
print("\n--- Gemini Flash VQA Scorecard Output ---")
print("Stars:", res.get("llm_stars"))
print("Video Summary:", res.get("video_summary"))
print("Reasoning:", res.get("llm_reasoning"))
print("Dimension Scores:", res.get("dimension_scores"))
