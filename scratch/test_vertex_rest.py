import os
import sys
import json
import time
import requests
import google.auth
import google.auth.transport.requests

def test_vertex_rest():
    credentials, project = google.auth.default(scopes=["https://www.googleapis.com/auth/cloud-platform"])
    auth_req = google.auth.transport.requests.Request()
    credentials.refresh(auth_req)
    token = credentials.token

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    project_id = "cs-poc-xbm3l5p9n29nrv0hx1ynd7s"
    location = "us-central1"
    
    models = [
        "veo-3.1-lite-generate-preview",
        "veo-3.1-generate-preview",
        "veo-3.1-fast-generate-preview",
        "veo-2.0-generate-001"
    ]

    sample_img_path = "/Users/mashsyed/.gemini/antigravity/scratch/expedia-genmedia-pipeline/backend/static/samples/luxury_suite.jpg"
    with open(sample_img_path, "rb") as f:
        import base64
        img_b64 = base64.b64encode(f.read()).decode("utf-8")

    for model in models:
        url = f"https://{location}-aiplatform.googleapis.com/v1/projects/{project_id}/locations/{location}/publishers/google/models/{model}:predictLongRunning"
        
        payload = {
            "instances": [
                {
                    "prompt": "A smooth camera push in towards the luxurious hotel bed, realistic lighting and motion",
                    "image": {
                        "bytesBase64Encoded": img_b64,
                        "mimeType": "image/jpeg"
                    }
                }
            ],
            "parameters": {
                "sampleCount": 1,
                "durationSeconds": 4,
                "aspectRatio": "16:9"
            }
        }

        print(f"\n--- Testing model={model} via REST at {url} ---")
        res = requests.post(url, headers=headers, json=payload)
        print(f"HTTP Status: {res.status_code}")
        print(f"Response: {res.text[:500]}")

if __name__ == "__main__":
    test_vertex_rest()
