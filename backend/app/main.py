import os
import cv2
import numpy as np
from PIL import Image
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.db.database import Base, engine, init_db
from app.api import preflight, keyframe, video, eval, telemetry

# Create DB tables and run migrations
init_db()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="VeoBench: Generative Media Evaluation & Model Certification Platform for MarTech"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory=settings.STATIC_DIR), name="static")

# Include API routers
app.include_router(preflight.router)
app.include_router(keyframe.router)
app.include_router(video.router)
app.include_router(eval.router)
app.include_router(telemetry.router)

def create_default_samples():
    """Generates synthetic high-res sample hospitality assets for testing."""
    os.makedirs(settings.SAMPLES_DIR, exist_ok=True)
    
    samples = {
        "luxury_suite.jpg": ("Luxury Suite Interior", (180, 140, 110), (220, 190, 160)),
        "infinity_pool.jpg": ("Oceanfront Infinity Pool", (200, 120, 50), (240, 180, 100)),
        "resort_facade.jpg": ("Resort Architecture Facade", (100, 120, 140), (160, 180, 200))
    }
    
    for filename, (title, color1, color2) in samples.items():
        sample_path = os.path.join(settings.SAMPLES_DIR, filename)
        if not os.path.exists(sample_path):
            img = np.zeros((1080, 1920, 3), dtype=np.uint8)
            # Create a rich smooth architectural gradient background
            for y in range(1080):
                ratio = y / 1080.0
                r = int(color1[0] * (1 - ratio) + color2[0] * ratio)
                g = int(color1[1] * (1 - ratio) + color2[1] * ratio)
                b = int(color1[2] * (1 - ratio) + color2[2] * ratio)
                img[y, :] = (b, g, r)
                
            # Add structural architecture lines & horizon
            cv2.line(img, (0, 650), (1920, 650), (255, 255, 255), 3) # Horizon
            cv2.rectangle(img, (200, 250), (1720, 650), (255, 255, 255), 2) # Architectural frame
            cv2.rectangle(img, (400, 350), (1520, 650), (255, 255, 255), 2) # Inner frame
            
            # Title watermark
            cv2.putText(img, f"EXPEDIA VEOBENCH SAMPLE: {title.upper()}", (450, 120),
                        cv2.FONT_HERSHEY_SIMPLEX, 1.2, (255, 255, 255), 3, cv2.LINE_AA)
            cv2.putText(img, "1080p Master Keyframe Asset (3% - 15% Push-In Zone)", (580, 180),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (230, 230, 230), 2, cv2.LINE_AA)
            
            cv2.imwrite(sample_path, img)

@app.on_event("startup")
def startup_event():
    create_default_samples()

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "mock_mode": settings.MOCK_VERTEX_API,
        "gcp_project": settings.GCP_PROJECT_ID,
        "gcp_region": settings.GCP_REGION
    }

# Serve compiled React Frontend SPA in single-container Cloud Run deployment mode
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))
if os.path.exists(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="frontend")

