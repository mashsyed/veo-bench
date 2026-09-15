import os
from google import genai

project_id = "cs-poc-xbm3l5p9n29nrv0hx1ynd7s"
location = "us-central1"

client = genai.Client(
    vertexai=True,
    project=project_id,
    location=location
)

candidate_names = [
    "veo-3.1-omni-flash-001",
    "veo-omni-flash-001",
    "omni-flash-001",
    "omni-flash",
    "veo-3.1-omni-flash",
    "gemini-2.0-flash",
    "gemini-2.5-flash"
]

print("Testing model names...")
for name in candidate_names:
    try:
        # Check if client can reference model
        print(f"Checking {name}...")
    except Exception as e:
        print(f"Error {name}: {e}")
