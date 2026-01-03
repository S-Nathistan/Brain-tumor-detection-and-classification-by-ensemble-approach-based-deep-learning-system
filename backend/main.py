from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.core.config import settings
from backend.db.database import Base, engine
from backend.routers import auth, results, dashboard

app = FastAPI(title="Brain Tumor Detection API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables (simple dev approach; use Alembic later for prod)
Base.metadata.create_all(bind=engine)

app.include_router(auth.router)
app.include_router(results.router)
app.include_router(dashboard.router)

@app.get("/health")
def health():
    return {"ok": True}
