import os

# Auto-load .env file if present in backend directory
try:
    from dotenv import load_dotenv
    env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
    if os.path.exists(env_path):
        load_dotenv(dotenv_path=env_path)
except ImportError:
    pass

class Settings:
    PROJECT_NAME: str = "VeoBench"
    VERSION: str = "1.0.0"
    GCP_PROJECT_ID: str = os.getenv("GOOGLE_CLOUD_PROJECT", os.getenv("GCP_PROJECT", "cs-poc-xbm3l5p9n29nrv0hx1ynd7s"))
    GCP_REGION: str = os.getenv("GOOGLE_CLOUD_REGION", os.getenv("LOCATION", "us-central1"))
    USE_VERTEXAI: bool = os.getenv("GOOGLE_GENAI_USE_VERTEXAI", "true").lower() in ("true", "1", "yes")
    MOCK_VERTEX_API: bool = os.getenv("MOCK_VERTEX_API", "false" if os.getenv("GOOGLE_CLOUD_PROJECT") or os.getenv("GOOGLE_GENAI_USE_VERTEXAI") else "true").lower() in ("true", "1", "yes")
    GEMINI_JUDGE_MODEL: str = os.getenv("GEMINI_JUDGE_MODEL", "gemini-3.8-flash")
    
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    STATIC_DIR: str = os.path.join(BASE_DIR, "static")
    UPLOADS_DIR: str = os.path.join(STATIC_DIR, "uploads")
    GENERATED_DIR: str = os.path.join(STATIC_DIR, "generated")
    SAMPLES_DIR: str = os.path.join(STATIC_DIR, "samples")
    
    # Model Pricing
    COST_VEO_FAST_720P: float = 0.2500
    COST_VEO_MASTER_1080P: float = 0.7500
    COST_VEO_LITE_720P: float = 0.1000
    COST_GEMINI_OMNI_FLASH: float = 0.1500
    COST_GEMINI_FLASH_1M_INPUT: float = 0.075 / 1000000
    COST_GEMINI_FLASH_1M_OUTPUT: float = 0.300 / 1000000

    DATABASE_URL: str = f"sqlite:///{os.path.join(BASE_DIR, 'veobench.db')}"

settings = Settings()

# Ensure directories exist
os.makedirs(settings.UPLOADS_DIR, exist_ok=True)
os.makedirs(settings.GENERATED_DIR, exist_ok=True)
os.makedirs(settings.SAMPLES_DIR, exist_ok=True)
