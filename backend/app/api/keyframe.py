from fastapi import APIRouter, HTTPException
import time
import os
import cv2
import uuid
from app.config import settings
from app.db.schemas import KeyframeCropRequest, KeyframeCropResponse
from app.services.cv_service import cv_service

router = APIRouter(prefix="/api", tags=["keyframe"])

@router.post("/keyframe-crop", response_model=KeyframeCropResponse)
async def crop_keyframe(payload: KeyframeCropRequest):
    """
    Accepts an image path and zoom_percent (0.03 to 0.15).
    Computes centered coordinates along optical axis, crops frame, and resizes back to original dimensions.
    Returns last_frame path and base64 preview.
    """
    t0 = time.time()
    image_path = payload.image_path_or_data
    
    if not os.path.exists(image_path):
        # Check if relative to static
        alt_path = os.path.join(settings.BASE_DIR, image_path.lstrip("/"))
        if os.path.exists(alt_path):
            image_path = alt_path
        else:
            # Fallback sample
            image_path = os.path.join(settings.SAMPLES_DIR, "luxury_suite.jpg")
            if not os.path.exists(image_path):
                raise HTTPException(status_code=404, detail="Source image file not found.")
                
    try:
        cropped_np, b64_str, crop_box = cv_service.crop_keyframe(image_path, payload.zoom_percent)
        
        # Save cropped frame to static generated directory
        file_id = str(uuid.uuid4())[:8]
        last_frame_filename = f"last_frame_{file_id}.jpg"
        last_frame_path = os.path.join(settings.GENERATED_DIR, last_frame_filename)
        cv2.imwrite(last_frame_path, cropped_np)
        
        latency = round(time.time() - t0, 3)
        
        return KeyframeCropResponse(
            last_frame_path=last_frame_path,
            last_frame_base64=f"data:image/jpeg;base64,{b64_str}",
            crop_box=crop_box,
            latency_sec=latency
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Keyframe crop failed: {str(e)}")
