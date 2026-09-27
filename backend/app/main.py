import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import connect_to_mongo, close_mongo_connection, db_instance
from app.routes.auth_routes import router as auth_router
from app.routes.roadmap import router as roadmap_router
from app.routes.notes import router as notes_router
from app.routes.assessment import router as assessment_router
from app.routes.jobs import router as jobs_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("learnmate.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to MongoDB
    logger.info("Initializing LearnMate Backend...")
    await connect_to_mongo()
    yield
    # Shutdown: Close MongoDB connection
    logger.info("Shutting down LearnMate Backend...")
    await close_mongo_connection()

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="AI-Powered Personalized Learning Roadmap & In-Depth Notes Generator",
    lifespan=lifespan
)

# Enable CORS for all local dev origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(auth_router)
app.include_router(roadmap_router)
app.include_router(notes_router)
app.include_router(assessment_router)
app.include_router(jobs_router)

@app.get("/")
async def root():
    return {
        "status": "online",
        "app": "LEARNMATE AI Engine",
        "version": settings.VERSION,
        "docs": "/docs"
    }

@app.get("/api/health")
async def health():
    return {
        "status": "healthy",
        "database": {
            "connected": db_instance.is_connected,
            "database_name": settings.DATABASE_NAME if db_instance.is_connected else "offline_memory_fallback"
        },
        "ai_providers": {
            "groq": "configured",
            "gemini": "configured"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
