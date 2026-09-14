from pydantic import BaseModel
from typing import Optional, List, Any, Dict
from datetime import datetime

class PreflightRequest(BaseModel):
    image_data: Optional[str] = None # Base64
    image_filename: Optional[str] = None

class PreflightResponse(BaseModel):
    has_faces: bool
    is_hospitality_sensitive: bool
    recommended_safety_threshold: str
    details: Dict[str, Any]
    latency_sec: float
    cost_usd: float
    saved_path: Optional[str] = None
    relative_url: Optional[str] = None

class KeyframeCropRequest(BaseModel):
    image_path_or_data: str
    zoom_percent: float = 0.06 # Range 0.03 to 0.15

class KeyframeCropResponse(BaseModel):
    last_frame_path: str
    last_frame_base64: str
    crop_box: Dict[str, int]
    latency_sec: float

class GenerateVideoRequest(BaseModel):
    start_image_path: str
    last_frame_path: Optional[str] = None
    use_last_frame: bool = True
    asset_classification: str = "Interior Suite"
    zoom_percent: float = 0.06
    
    model_name: str = "veo-3.1-fast-generate-preview"
    resolution: str = "720p"
    duration_seconds: float = 4.0
    aspect_ratio: str = "16:9"
    seed: int = 4242
    seed_locked: bool = False
    
    directorial_prompt: str = "Smooth linear camera push-in along optical axis. Static architecture, locked horizon, subtle ambient light."
    negative_prompt: str = "lateral pan, horizontal sweep, camera rotation, roll, tilt, morphing walls, new structures, people appearing, texture flickering"
    enhance_prompt: bool = False
    
    person_generation: str = "dont_allow"
    safety_setting: str = "BLOCK_ONLY_HIGH"
    custom_rubric: Optional[str] = None
    mock_mode: Optional[bool] = None

class EvaluateQualityRequest(BaseModel):
    run_id: str
    start_image_path: str
    last_frame_path: Optional[str] = None
    video_path: str
    prompt: str
    negative_prompt: Optional[str] = None
    custom_rubric: Optional[str] = None

class EvaluationScorecard(BaseModel):
    run_id: str
    ssim_score: float
    ssim_badge: str # Green, Yellow, Red
    optical_flow_mean_vel: float
    optical_flow_status: str # Stable, Jitter Detected
    llm_stars: int # 1 to 5
    llm_reasoning: str
    video_summary: Optional[str] = None
    custom_rubric_used: str
    dimension_scores: Optional[Dict[str, Any]] = None
    moderation_status: str # CLEARED, FALSE-POSITIVE BLOCKED
    certification_status: str # CERTIFIED, FAILED
    latency_sec: float
    cost_usd: float

class TelemetryStep(BaseModel):
    step_name: str
    component: str
    latency_sec: float
    cost_usd: float
    status: str # PASS, WARN, FAIL
    details: str

class BenchmarkRunResponse(BaseModel):
    run_id: str
    created_at: datetime
    model_name: str
    resolution: str
    duration_seconds: float
    total_latency_sec: float
    total_cost_usd: float
    ssim_score: Optional[float]
    ssim_badge: Optional[str]
    optical_flow_status: Optional[str]
    llm_stars: Optional[int]
    llm_reasoning: Optional[str]
    certification_status: str
    telemetry_logs: List[TelemetryStep]

    class Config:
        from_attributes = True

class SessionSummaryTelemetry(BaseModel):
    total_runs: int
    total_spend_usd: float
    avg_first_pass_yield_pct: float
    mean_latency_sec: float
    mock_mode: bool
    gcp_project_id: str
    gcp_region: str

class OptimizePromptRequest(BaseModel):
    original_prompt: str
    original_negative_prompt: Optional[str] = None
    dimension_scores: Optional[Dict[str, Any]] = None
    llm_reasoning: Optional[str] = None

class OptimizePromptResponse(BaseModel):
    optimized_prompt: str
    optimized_negative_prompt: str
    optimization_rationale: str
    latency_sec: float
