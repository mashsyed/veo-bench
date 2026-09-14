from fastapi import APIRouter, Depends, Response, HTTPException
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy.orm import Session
import io
import csv
import os
from typing import List
from app.config import settings
from app.db.database import get_db
from app.db.models import BenchmarkRun
from app.db.schemas import SessionSummaryTelemetry, BenchmarkRunResponse

router = APIRouter(prefix="/api", tags=["telemetry"])

@router.get("/telemetry", response_model=SessionSummaryTelemetry)
def get_telemetry_summary(db: Session = Depends(get_db)):
    """
    Calculates cumulative session telemetry metrics.
    """
    runs = db.query(BenchmarkRun).all()
    total_runs = len(runs)
    total_spend = sum(r.total_cost_usd or 0.0 for r in runs)
    
    if total_runs > 0:
        certified_count = sum(1 for r in runs if r.certification_status == "CERTIFIED")
        avg_yield = round((certified_count / total_runs) * 100.0, 1)
        mean_latency = round(sum(r.total_latency_sec or 0.0 for r in runs) / total_runs, 2)
    else:
        avg_yield = 100.0
        mean_latency = 0.0
        
    return SessionSummaryTelemetry(
        total_runs=total_runs,
        total_spend_usd=round(total_spend, 4),
        avg_first_pass_yield_pct=avg_yield,
        mean_latency_sec=mean_latency,
        mock_mode=settings.MOCK_VERTEX_API,
        gcp_project_id=settings.GCP_PROJECT_ID,
        gcp_region=settings.GCP_REGION
    )

@router.get("/runs", response_model=List[BenchmarkRunResponse])
def list_benchmark_runs(db: Session = Depends(get_db)):
    """Lists recent benchmark test runs."""
    runs = db.query(BenchmarkRun).order_by(BenchmarkRun.created_at.desc()).limit(20).all()
    return runs

@router.get("/sample-images")
def get_sample_images():
    """Lists built-in hospitality sample images."""
    samples = [
        {
            "id": "sample-suite",
            "name": "Luxury Suite Interior",
            "classification": "Interior Suite",
            "path": "/static/samples/luxury_suite.jpg",
            "abs_path": os.path.join(settings.SAMPLES_DIR, "luxury_suite.jpg")
        },
        {
            "id": "sample-pool",
            "name": "Oceanfront Infinity Pool",
            "classification": "Pool/Waterfront",
            "path": "/static/samples/infinity_pool.jpg",
            "abs_path": os.path.join(settings.SAMPLES_DIR, "infinity_pool.jpg")
        },
        {
            "id": "sample-facade",
            "name": "Resort Architecture Facade",
            "classification": "Exterior Facade",
            "path": "/static/samples/resort_facade.jpg",
            "abs_path": os.path.join(settings.SAMPLES_DIR, "resort_facade.jpg")
        }
    ]
    return samples

@router.get("/export/csv")
def export_telemetry_csv(db: Session = Depends(get_db)):
    """Exports session benchmark runs to CSV file."""
    runs = db.query(BenchmarkRun).order_by(BenchmarkRun.created_at.desc()).all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    writer.writerow([
        "Run ID", "Created At", "Asset Classification", "Model Name", "Resolution", 
        "Duration (s)", "Seed", "Directorial Prompt", "SSIM Score", "SSIM Badge", 
        "Optical Flow Mean Vel", "Flow Status", "LLM Judge Stars", "LLM Reasoning", 
        "Status", "Total Latency (s)", "Total Cost ($)"
    ])
    
    for r in runs:
        writer.writerow([
            r.run_id, r.created_at.isoformat() if r.created_at else "", r.asset_classification,
            r.model_name, r.resolution, r.duration_seconds, r.seed, r.directorial_prompt,
            r.ssim_score, r.ssim_badge, r.optical_flow_mean_vel, r.optical_flow_status,
            r.llm_stars, r.llm_reasoning, r.certification_status, r.total_latency_sec, r.total_cost_usd
        ])
        
    output.seek(0)
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode("utf-8")),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=veobench_benchmark_report.csv"}
    )

@router.get("/export/markdown")
def export_telemetry_markdown(db: Session = Depends(get_db)):
    """Exports session benchmark report as a formatted Markdown scorecard."""
    runs = db.query(BenchmarkRun).order_by(BenchmarkRun.created_at.desc()).all()
    
    total_runs = len(runs)
    total_spend = sum(r.total_cost_usd or 0.0 for r in runs)
    certified_count = sum(1 for r in runs if r.certification_status == "CERTIFIED")
    avg_yield = round((certified_count / total_runs * 100.0), 1) if total_runs > 0 else 100.0
    mean_latency = round(sum(r.total_latency_sec or 0.0 for r in runs) / total_runs, 2) if total_runs > 0 else 0.0

    md = f"""# VeoBench Model Certification Report
**Target GCP Project:** `{settings.GCP_PROJECT_ID}` | **Region:** `{settings.GCP_REGION}`
**Execution Mode:** `{'Mock Telemetry' if settings.MOCK_VERTEX_API else 'Live Vertex AI API'}`

## 📊 Executive Telemetry Summary
| Metric | Value |
|---|---|
| **Total Benchmark Runs** | `{total_runs}` |
| **Cumulative Spend ($)** | `${total_spend:.4f}` |
| **First-Pass Yield (%)** | `{avg_yield}%` |
| **Mean Pipeline Latency** | `{mean_latency}s` |

---

## 🔬 Benchmark Run Log & Evaluation Scorecards

"""
    for r in runs:
        md += f"""### Run ID: `{r.run_id}` ({r.asset_classification})
- **Timestamp:** {r.created_at}
- **Model / Resolution:** `{r.model_name}` ({r.resolution}) | **Duration:** {r.duration_seconds}s | **Seed:** `{r.seed}`
- **Directorial Prompt:** *"{r.directorial_prompt}"*
- **Negative Prompt:** *"{r.negative_prompt}"*

#### Scorecard Metrics:
- **SSIM (Structural Similarity):** `{r.ssim_score if r.ssim_score is not None else 'N/A'}` (Badge: `{r.ssim_badge}`)
- **Optical Flow Velocity:** `{r.optical_flow_mean_vel if r.optical_flow_mean_vel is not None else 'N/A'}` (Status: `{r.optical_flow_status}`)
- **LLM Judge Score:** `{"★" * (r.llm_stars or 0)}` ({r.llm_stars}/5)
- **Judge Reasoning:** {r.llm_reasoning or 'N/A'}
- **Certification Status:** `{r.certification_status}`
- **Latency & Cost:** `{r.total_latency_sec}s` | `${r.total_cost_usd:.4f}`

---
"""

    return StreamingResponse(
        io.BytesIO(md.encode("utf-8")),
        media_type="text/markdown",
        headers={"Content-Disposition": "attachment; filename=veobench_benchmark_report.md"}
    )
