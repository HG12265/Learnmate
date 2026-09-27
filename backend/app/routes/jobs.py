import logging
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, HTTPException
from app.database import get_database
from app.services.jobs_service import JobsService
from app.config import settings

logger = logging.getLogger("learnmate.jobs")
router = APIRouter(prefix="/api/jobs", tags=["Live Jobs"])

@router.get("/status")
async def get_jobs_status():
    """Returns the status of connected live job market data providers."""
    return {
        "remotive": {
            "status": "connected",
            "type": "Global Tech / Remote (Live Verified)",
            "keyless": True
        },
        "jobicy": {
            "status": "connected",
            "type": "Public Remote Tech Feed (Live Verified)",
            "keyless": True
        },
        "adzuna": {
            "configured": bool(settings.ADZUNA_APP_ID.strip() and settings.ADZUNA_APP_KEY.strip()),
            "country": settings.ADZUNA_COUNTRY,
            "description": "India & Global city-level live job listings (Naukri, Indeed, LinkedIn aggregator)"
        }
    }

@router.get("/roadmap/{roadmap_id}")
async def get_jobs_for_roadmap(
    roadmap_id: str,
    location: str = Query("India", description="Filter location (e.g. India, Bangalore, Chennai, Remote)")
):
    """
    Fetch real-time live job openings matching the specific target role and skills
    from this learning pathway.
    """
    db = get_database()
    try:
        data = await JobsService.get_jobs_for_roadmap(db, roadmap_id, location)
        return data
    except Exception as e:
        logger.error(f"Error fetching jobs for roadmap {roadmap_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to fetch live job listings")

@router.get("/search")
async def search_live_jobs(
    role: str = Query(..., description="Target role to search for (e.g. Full Stack Developer, Data Scientist)"),
    skills: Optional[str] = Query("", description="Comma-separated skills (e.g. React, Node.js, MongoDB)"),
    location: str = Query("India", description="Location or Remote"),
    limit: int = Query(25, ge=1, le=50)
):
    """
    Search live verified job openings matching any role and skill set.
    """
    db = get_database()
    skills_list = [s.strip() for s in skills.split(",") if s.strip()] if skills else []
    try:
        data = await JobsService.get_live_jobs(db, role, skills_list, location, limit)
        return data
    except Exception as e:
        logger.error(f"Error searching live jobs: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to search live job listings")
