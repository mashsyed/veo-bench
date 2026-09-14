import unittest
import os
import sys
from fastapi.testclient import TestClient

# Add app to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app, create_default_samples
from app.config import settings

class TestVeoBenchPipeline(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        create_default_samples()
        cls.client = TestClient(app)

    def test_01_health_check(self):
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "healthy")
        self.assertEqual(data["app"], "VeoBench")

    def test_02_get_sample_images(self):
        response = self.client.get("/api/sample-images")
        self.assertEqual(response.status_code, 200)
        samples = response.json()
        self.assertGreaterEqual(len(samples), 1)
        self.assertIn("path", samples[0])

    def test_03_preflight_audit(self):
        sample_path = os.path.join(settings.SAMPLES_DIR, "luxury_suite.jpg")
        response = self.client.post("/api/preflight", json={"image_filename": "luxury_suite.jpg"})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("has_faces", data)
        self.assertIn("recommended_safety_threshold", data)

    def test_04_keyframe_crop(self):
        sample_path = os.path.join(settings.SAMPLES_DIR, "luxury_suite.jpg")
        payload = {
            "image_path_or_data": sample_path,
            "zoom_percent": 0.06
        }
        response = self.client.post("/api/keyframe-crop", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("last_frame_path", data)
        self.assertIn("last_frame_base64", data)
        self.assertTrue(data["last_frame_base64"].startswith("data:image/jpeg;base64,"))

    def test_05_generate_video_and_evaluate(self):
        sample_path = os.path.join(settings.SAMPLES_DIR, "luxury_suite.jpg")
        payload = {
            "start_image_path": sample_path,
            "zoom_percent": 0.06,
            "model_name": "veo-3.1-fast-generate-preview",
            "resolution": "720p",
            "duration_seconds": 3.0,
            "aspect_ratio": "16:9",
            "seed": 4242,
            "directorial_prompt": "Smooth linear camera push-in along optical axis.",
            "negative_prompt": "lateral pan, horizontal sweep",
            "use_last_frame": True
        }
        response = self.client.post("/api/generate-video", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("run_id", data)
        self.assertIn("video_path", data)
        self.assertTrue(os.path.exists(data["video_path"]))

        # Test Quality Evaluation on generated video
        eval_payload = {
            "run_id": data["run_id"],
            "start_image_path": sample_path,
            "last_frame_path": data["last_frame_url"],
            "video_path": data["video_path"],
            "prompt": payload["directorial_prompt"]
        }
        eval_resp = self.client.post("/api/evaluate-quality", json=eval_payload)
        self.assertEqual(eval_resp.status_code, 200)
        eval_data = eval_resp.json()
        self.assertGreaterEqual(eval_data["ssim_score"], 0.0)
        self.assertIn(eval_data["optical_flow_status"], ["Stable", "Jitter Detected"])
        self.assertGreaterEqual(eval_data["llm_stars"], 1)

    def test_06_telemetry_summary(self):
        response = self.client.get("/api/telemetry")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("total_runs", data)
        self.assertIn("total_spend_usd", data)

if __name__ == "__main__":
    unittest.main()
