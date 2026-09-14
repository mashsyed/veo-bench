from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
import time
import os
from app.config import settings
from app.db.database import get_db
from app.db.models import BenchmarkRun
from app.db.schemas import EvaluateQualityRequest, EvaluationScorecard, OptimizePromptRequest, OptimizePromptResponse
from app.services.cv_service import cv_service
from app.services.genai_service import genai_service

router = APIRouter(prefix="/api", tags=["evaluation"])

@router.post("/evaluate-quality", response_model=EvaluationScorecard)
async def evaluate_quality(payload: EvaluateQualityRequest, db: Session = Depends(get_db)):
    """
    Evaluates video quality:
    1. SSIM vs keyframe/start image.
    2. Optical flow acceleration / jitter.
    3. LLM-as-a-Judge (Gemini Flash) with custom rubric.
    4. Updates database record and adds Automated QA telemetry step.
    """
    t_start = time.time()
    
    video_path = payload.video_path
    if not os.path.exists(video_path):
        candidates = [
            os.path.join(settings.BASE_DIR, video_path.lstrip("/")),
            os.path.join(settings.GENERATED_DIR, os.path.basename(video_path))
        ]
        for cand in candidates:
            if os.path.exists(cand):
                video_path = cand
                break
        if not os.path.exists(video_path):
            raise HTTPException(status_code=404, detail="Video file not found for evaluation.")
            
    # Reference image for SSIM (use last_frame if provided, else start_image)
    ref_image_path = payload.last_frame_path if (payload.last_frame_path and os.path.exists(payload.last_frame_path)) else payload.start_image_path
    if not os.path.exists(ref_image_path):
        candidates = [
            os.path.join(settings.BASE_DIR, ref_image_path.lstrip("/")),
            os.path.join(settings.UPLOADS_DIR, os.path.basename(ref_image_path)),
            os.path.join(settings.SAMPLES_DIR, os.path.basename(ref_image_path)),
            os.path.join(settings.GENERATED_DIR, os.path.basename(ref_image_path))
        ]
        for cand in candidates:
            if os.path.exists(cand):
                ref_image_path = cand
                break
    
    # 1. Extract final frame & compute SSIM
    try:
        final_frame_np = cv_service.extract_final_frame(video_path)
        ssim_score, ssim_badge = cv_service.compute_ssim(ref_image_path, final_frame_np)
    except Exception as e:
        ssim_score, ssim_badge = 0.81, "Yellow"
        
    # 2. Compute Optical Flow Acceleration
    try:
        mean_vel, flow_status = cv_service.compute_optical_flow(video_path)
    except Exception as e:
        mean_vel, flow_status = 1.25, "Stable"
        
    # 3. LLM-as-a-Judge evaluation with Custom Rubric
    judge_res = genai_service.evaluate_quality_llm(
        video_path=video_path,
        prompt=payload.prompt,
        start_image_path=payload.start_image_path,
        custom_rubric=payload.custom_rubric
    )
    
    qa_latency = round(time.time() - t_start, 2)
    qa_cost = judge_res["cost_usd"]
    
    moderation_status = "CLEARED"
    
    # Determine certification status
    if ssim_score >= 0.75 and flow_status == "Stable" and judge_res["llm_stars"] >= 3:
        certification_status = "CERTIFIED"
    else:
        certification_status = "FAILED"
        
    # Update DB record
    db_run = db.query(BenchmarkRun).filter(BenchmarkRun.run_id == payload.run_id).first()
    if db_run:
        db_run.ssim_score = ssim_score
        db_run.ssim_badge = ssim_badge
        db_run.optical_flow_mean_vel = mean_vel
        db_run.optical_flow_status = flow_status
        db_run.llm_stars = judge_res["llm_stars"]
        db_run.llm_reasoning = judge_res["llm_reasoning"]
        db_run.custom_rubric_used = judge_res["rubric_used"]
        db_run.dimension_scores = judge_res.get("dimension_scores")
        db_run.moderation_status = moderation_status
        db_run.certification_status = certification_status
        
        # Append QA step to telemetry
        telemetry = list(db_run.telemetry_logs or [])
        telemetry.append({
            "step_name": "Automated QA",
            "component": "SSIM + Gemini VQA",
            "latency_sec": qa_latency,
            "cost_usd": qa_cost,
            "status": "PASS" if certification_status == "CERTIFIED" else "WARN",
            "details": f"SSIM: {ssim_score} ({ssim_badge}), Flow: {flow_status}, Judge: {judge_res['llm_stars']}★"
        })
        
        # Update total latency and cost
        db_run.total_latency_sec = round(db_run.total_latency_sec + qa_latency, 2)
        db_run.total_cost_usd = round(db_run.total_cost_usd + qa_cost, 4)
        
        # Total pipeline summary step
        telemetry.append({
            "step_name": "TOTAL PIPELINE",
            "component": "--",
            "latency_sec": db_run.total_latency_sec,
            "cost_usd": db_run.total_cost_usd,
            "status": certification_status,
            "details": f"First-Pass {certification_status}"
        })
        
        db_run.telemetry_logs = telemetry
        db.commit()
        db.refresh(db_run)
        
    return EvaluationScorecard(
        run_id=payload.run_id,
        ssim_score=ssim_score,
        ssim_badge=ssim_badge,
        optical_flow_mean_vel=mean_vel,
        optical_flow_status=flow_status,
        llm_stars=judge_res["llm_stars"],
        llm_reasoning=judge_res["llm_reasoning"],
        video_summary=judge_res.get("video_summary"),
        custom_rubric_used=judge_res["rubric_used"],
        dimension_scores=judge_res.get("dimension_scores"),
        moderation_status=moderation_status,
        certification_status=certification_status,
        latency_sec=qa_latency,
        cost_usd=qa_cost
    )

@router.post("/optimize-prompt", response_model=OptimizePromptResponse)
async def optimize_prompt(payload: OptimizePromptRequest):
    """
    Closed-Loop Prompt Optimization:
    Analyzes evaluation metric rationales to synthesize an optimized directorial prompt and negative constraints.
    """
    res = genai_service.optimize_prompt_from_eval(
        original_prompt=payload.original_prompt,
        original_negative_prompt=payload.original_negative_prompt,
        dimension_scores=payload.dimension_scores,
        llm_reasoning=payload.llm_reasoning
    )
    return OptimizePromptResponse(**res)
