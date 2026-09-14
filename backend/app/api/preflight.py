from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from sqlalchemy.orm import Session
import os
import uuid
import base64
from app.config import settings
from app.db.schemas import PreflightRequest, PreflightResponse
from app.services.genai_service import genai_service

router = APIRouter(prefix="/api", tags=["preflight"])

@router.post("/preflight", response_model=PreflightResponse)
async def run_preflight(file: UploadFile = File(None), image_path: str = None):
    """
    Accepts an uploaded image or local path and audits false-positive risk & face density via Gemini 2.5 Flash.
    """
    target_path = image_path
    
    if file:
        file_id = str(uuid.uuid4())[:8]
        filename = f"upload_{file_id}_{file.filename}"
        target_path = os.path.join(settings.UPLOADS_DIR, filename)
        contents = await file.read()
        with open(target_path, "wb") as f:
            f.write(contents)
            
    if not target_path or not os.path.exists(target_path):
        # Fallback to default sample if no path given
        target_path = os.path.join(settings.SAMPLES_DIR, "luxury_suite.jpg")
        if not os.path.exists(target_path):
            raise HTTPException(status_code=400, detail="Image file not provided or path does not exist.")
            
    res = genai_service.run_preflight_audit(target_path)
    rel_url = f"/static/uploads/{os.path.basename(target_path)}" if "uploads" in target_path else f"/static/samples/{os.path.basename(target_path)}"
    
    return PreflightResponse(
        has_faces=res["has_faces"],
        is_hospitality_sensitive=res["is_hospitality_sensitive"],
        recommended_safety_threshold=res["recommended_safety_threshold"],
        details=res["details"],
        latency_sec=res["latency_sec"],
        cost_usd=res["cost_usd"],
        saved_path=target_path,
        relative_url=rel_url
    )
