# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# from backend.core.config import settings
# from backend.db.database import Base, engine
# from backend.routers import auth, results, dashboard

# app = FastAPI(title="Brain Tumor Detection API")

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=[settings.CORS_ORIGINS],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # Create tables (simple dev approach; use Alembic later for prod)
# Base.metadata.create_all(bind=engine)

# app.include_router(auth.router)
# app.include_router(results.router)
# app.include_router(dashboard.router)

# @app.get("/health")
# def health():
#     return {"ok": True}

# =================================================================================================

# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# from backend.core.config import settings
# from backend.db.database import Base, engine

# # Notice we are importing patients and dashboard here!
# from backend.routers import auth, results, patients, dashboard 

# app = FastAPI(title="Brain Tumor Detection API")

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=[settings.CORS_ORIGINS],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # Create tables (simple dev approach; use Alembic later for prod)
# Base.metadata.create_all(bind=engine)

# # This is where FastAPI registers the routes
# app.include_router(auth.router)
# app.include_router(results.router)
# app.include_router(patients.router)   # <--- Tells FastAPI to use the patients endpoints
# app.include_router(dashboard.router)  # <--- Tells FastAPI to use the dashboard endpoints

# @app.get("/health")
# def health():
#     return {"ok": True}


# ====================================================================================================

from contextlib import asynccontextmanager
import asyncio
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from fastapi.staticfiles import StaticFiles

from backend.core.config import settings, CORS_ORIGINS
from backend.core.detector import get_model_readiness
from backend.db.database import Base, engine

# ── Import all ORM models before routers so SQLAlchemy's mapper registry
# ── has every class resolved before any relationship string is evaluated.
import backend.models.user        # noqa: F401
import backend.models.admission   # noqa: F401  ← must precede result
import backend.models.result      # noqa: F401
import backend.models.patient     # noqa: F401
import backend.models.audit_log   # noqa: F401

from backend.routers import auth, results, dashboard, patients, documents, treatment_plans, admissions
from backend.update_db import update_db

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        update_db()
    except Exception as exc:
        logger.warning(f"DB migration check failed: {exc}")
    loop = asyncio.get_event_loop()
    try:
        logger.info("Preloading ML models at startup…")
        await loop.run_in_executor(None, lambda: get_model_readiness(load=True))
        logger.info("ML models ready.")
    except Exception as exc:
        logger.warning(f"Model preload failed: {exc}")
    yield


app = FastAPI(title="Brain Tumor Detection API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables — models already imported above, create_all sees all of them
Base.metadata.create_all(bind=engine)

# Serve MRI images: files stored as "uploads/<uuid>.jpg" in DB → mount so
# GET /uploaded_mris/uploads/<uuid>.jpg resolves from the uploads/ directory.
os.makedirs("uploads", exist_ok=True)
app.mount("/uploaded_mris/uploads", StaticFiles(directory="uploads"), name="uploaded_mris")

os.makedirs("uploads/avatars", exist_ok=True)
app.mount("/avatars", StaticFiles(directory="uploads/avatars"), name="avatars")

os.makedirs("uploaded_docs", exist_ok=True)
app.mount("/uploaded_docs", StaticFiles(directory="uploaded_docs"), name="uploaded_docs")

app.include_router(auth.router)
app.include_router(results.router)
app.include_router(dashboard.router)
app.include_router(patients.router)
app.include_router(documents.router)
app.include_router(treatment_plans.router)
app.include_router(admissions.router)

@app.get("/health")
def health():
    return {"status": "ok", "message": "Backend is running!"}


@app.get("/health/model")
def health_model(load: bool = False):
    readiness = get_model_readiness(load=load)
    return {
        "status": "ok" if readiness["ready"] else "degraded",
        "message": "Model is ready" if readiness["ready"] else "Model is not ready",
        **readiness,
    }