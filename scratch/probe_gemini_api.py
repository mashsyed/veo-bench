import os
import requests
import google.auth
import google.auth.transport.requests

credentials, project = google.auth.default(scopes=["https://www.googleapis.com/auth/cloud-platform"])
auth_req = google.auth.transport.requests.Request()
credentials.refresh(auth_req)
token = credentials.token

project_id = "cs-poc-xbm3l5p9n29nrv0hx1ynd7s"

headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json",
    "X-Goog-User-Project": project_id
}

url_pub = "https://us-central1-aiplatform.googleapis.com/v1beta1/publishers/google/models"
res_pub = requests.get(url_pub, headers=headers)
print("Vertex AI Publisher Models Status:", res_pub.status_code)

if res_pub.status_code == 200:
    import json
    data = res_pub.json()
    models = data.get("publisherModels", [])
    print(f"Total publisher models returned: {len(models)}")
    for m in models:
        name = m.get("name", "")
        if "veo" in name.lower() or "video" in name.lower() or "imagen" in name.lower():
            print("  FOUND ->", name)
else:
    print(res_pub.text[:500])
