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

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles # <--- ADD THIS IMPORT
import os # <--- ADD THIS IMPORT
from backend.routers import documents       # Add this import

from backend.core.config import settings
from backend.db.database import Base, engine
from backend.routers import auth, results, dashboard, patients

from backend.routers import auth
from backend.routers import results
from backend.routers import patients
from backend.routers import dashboard 

app = FastAPI(title="Brain Tumor Detection API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import backend.models.patient
import backend.models.audit_log
# Create tables (simple dev approach; use Alembic later for prod)
Base.metadata.create_all(bind=engine)

# --- ADD THESE TWO LINES TO SERVE IMAGES ---
os.makedirs("uploaded_mris", exist_ok=True)
app.mount("/uploaded_mris", StaticFiles(directory="uploaded_mris"), name="uploaded_mris")

os.makedirs("uploaded_docs", exist_ok=True)
app.mount("/uploaded_docs", StaticFiles(directory="uploaded_docs"), name="uploaded_docs")

app.include_router(auth.router)
app.include_router(results.router)
app.include_router(dashboard.router)
app.include_router(patients.router)
app.include_router(patients.router)
app.include_router(dashboard.router) 
app.include_router(documents.router)        # Add this line

@app.get("/health")
def health():
    return {"status": "ok", "message": "Backend is running!"}