from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base

class BenchmarkRun(Base):
    __tablename__ = "benchmark_runs"

    id = Column(Integer, primary_key=True, index=True)
    run_id = Column(String(50), unique=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    asset_classification = Column(String(50), default="Interior Suite")
    start_image_path = Column(String(255))
    last_frame_path = Column(String(255), nullable=True)
    zoom_percent = Column(Float, default=0.06)
    
    # Model parameters
    model_name = Column(String(100))
    resolution = Column(String(10))
    duration_seconds = Column(Float)
    aspect_ratio = Column(String(10))
    seed = Column(Integer)
    seed_locked = Column(Boolean, default=False)
    
    directorial_prompt = Column(Text)
    negative_prompt = Column(Text)
    enhance_prompt = Column(Boolean, default=False)
    person_generation = Column(String(50), default="dont_allow")
    safety_setting = Column(String(50), default="BLOCK_ONLY_HIGH")
    use_last_frame = Column(Boolean, default=True)
    
    # Output & Evaluation
    video_path = Column(String(255), nullable=True)
    total_latency_sec = Column(Float, default=0.0)
    total_cost_usd = Column(Float, default=0.0)
    
    ssim_score = Column(Float, nullable=True)
    ssim_badge = Column(String(20), nullable=True) # Green, Yellow, Red
    
    optical_flow_mean_vel = Column(Float, nullable=True)
    optical_flow_status = Column(String(50), nullable=True) # Stable, Jitter Detected
    
    llm_stars = Column(Integer, nullable=True) # 1-5
    llm_reasoning = Column(Text, nullable=True)
    custom_rubric_used = Column(Text, nullable=True)
    dimension_scores = Column(JSON, nullable=True)
    
    moderation_status = Column(String(50), default="CLEARED") # CLEARED, FALSE-POSITIVE BLOCKED
    certification_status = Column(String(50), default="CERTIFIED") # CERTIFIED, REJECTED
    
    # Step telemetry JSON
    telemetry_logs = Column(JSON, default=list)
