import uuid
import logging
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException, status, Depends
from app.database import get_database
from app.models.schemas import UserProfileInput, RoadmapSchema, ModuleSchema, ProgressUpdateRequest
from app.services.ai_service import AIService
from app.auth import get_current_user_optional

logger = logging.getLogger("learnmate.roadmap")
router = APIRouter(prefix="/api/roadmap", tags=["Roadmaps"])

# In-memory storage fallback if MongoDB is not reachable
IN_MEMORY_ROADMAPS = {}

@router.post("/generate", response_model=RoadmapSchema)
async def generate_roadmap(
    profile: UserProfileInput,
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    try:
        profile_dict = profile.model_dump()
        # Ensure target_role and education are synchronized
        target_role = profile.career_aspiration or profile.target_role or "Professional Specialist"
        education = profile.highest_education or profile.education_level or "Graduate"
        profile_dict["target_role"] = target_role
        profile_dict["career_aspiration"] = target_role
        profile_dict["education_level"] = education
        profile_dict["highest_education"] = education

        ai_data = await AIService.generate_roadmap(
            profile_dict,
            preferred_provider=profile.ai_provider or "groq"
        )
        
        roadmap_id = f"rm-{uuid.uuid4().hex[:10]}"
        user_id = str(current_user["_id"]) if current_user else "anonymous"

        # Transform modules into ModuleSchema objects
        raw_modules = ai_data.get("modules", [])
        modules_list = []
        for idx, m in enumerate(raw_modules):
            mod_id = m.get("id") or f"mod-{idx + 1}"
            raw_cat = str(m.get("category_type") or "COURSE").upper()
            if "PROJECT" in raw_cat:
                cat_type = "PROJECT"
            elif "CERT" in raw_cat:
                cat_type = "CERTIFICATION"
            elif "SPEC" in raw_cat:
                cat_type = "SPECIALIZATION"
            elif "SOFT" in raw_cat:
                cat_type = "SOFT SKILLS"
            else:
                cat_type = "COURSE"

            modules_list.append(
                ModuleSchema(
                    id=mod_id,
                    number=m.get("number", idx + 1),
                    phase=m.get("phase", f"Phase {idx // 3 + 1}"),
                    phase_description=m.get("phase_description", ""),
                    category_type=cat_type,
                    title=m.get("title", f"Milestone {idx + 1}"),
                    estimated_hours=int(m.get("estimated_hours", 8)),
                    difficulty=m.get("difficulty", "Beginner" if idx < 3 else ("Intermediate" if idx < 8 else "Advanced")),
                    description=m.get("description", "Master foundational concepts."),
                    key_topics=m.get("key_topics", ["Core Concepts", "Implementation"]),
                    hands_on_project=m.get("hands_on_project", "Build a practical milestone task."),
                    is_completed=False,
                    has_notes=False
                )
            )

        roadmap_obj = RoadmapSchema(
            id=roadmap_id,
            user_id=user_id,
            title=ai_data.get("title", f"{target_role}: Your Journey from Basics to Advanced Development"),
            subtitle=ai_data.get("subtitle", f"A Structured Learning Pathway for {target_role}"),
            overview_narrative=ai_data.get("overview_narrative", ai_data.get("skill_gap_summary", "")),
            target_role=target_role,
            user_profile=profile_dict,
            skill_gap_summary=ai_data.get("skill_gap_summary", "Bridging foundational gaps to advanced production workflows."),
            total_estimated_hours=int(ai_data.get("total_estimated_hours", sum(m.estimated_hours for m in modules_list))),
            total_modules=len(modules_list),
            completed_modules=0,
            progress_percentage=0.0,
            modules=modules_list,
            created_at=datetime.utcnow(),
            ai_model_used=ai_data.get("ai_model_used", "Groq / Gemini AI Engine")
        )

        # Save to database
        db = get_database()
        if db is not None:
            roadmap_dict = roadmap_obj.model_dump()
            roadmap_dict["_id"] = roadmap_id
            await db.roadmaps.insert_one(roadmap_dict)
        else:
            IN_MEMORY_ROADMAPS[roadmap_id] = roadmap_obj.model_dump()

        return roadmap_obj

    except Exception as e:
        logger.error(f"Error generating roadmap: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate roadmap: {str(e)}"
        )

@router.get("s", response_model=List[RoadmapSchema])
@router.get("", response_model=List[RoadmapSchema])
async def list_roadmaps(current_user: Optional[dict] = Depends(get_current_user_optional)):
    db = get_database()
    user_id = str(current_user["_id"]) if current_user else None
    
    roadmaps = []
    if db is not None:
        if user_id:
            query = {"$or": [{"user_id": user_id}, {"user_id": current_user.get("email")}]}
        else:
            query = {}
        cursor = db.roadmaps.find(query).sort("created_at", -1).limit(50)
        async for doc in cursor:
            doc["id"] = doc.get("_id", doc.get("id"))
            roadmaps.append(RoadmapSchema(**doc))
    else:
        for r in IN_MEMORY_ROADMAPS.values():
            if not user_id or r.get("user_id") == user_id:
                roadmaps.append(RoadmapSchema(**r))
                
    return roadmaps

@router.post("/claim/{roadmap_id}", response_model=RoadmapSchema)
async def claim_roadmap(
    roadmap_id: str,
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Must be logged in to claim roadmap")
        
    db = get_database()
    user_id = str(current_user["_id"])
    if db is not None:
        roadmap_data = await db.roadmaps.find_one({"$or": [{"_id": roadmap_id}, {"id": roadmap_id}]})
        if not roadmap_data:
            raise HTTPException(status_code=404, detail="Roadmap not found")
        await db.roadmaps.update_one(
            {"$or": [{"_id": roadmap_id}, {"id": roadmap_id}]},
            {"$set": {"user_id": user_id}}
        )
        roadmap_data["user_id"] = user_id
        roadmap_data["id"] = roadmap_data.get("_id", roadmap_data.get("id"))
        return RoadmapSchema(**roadmap_data)
    else:
        roadmap_data = IN_MEMORY_ROADMAPS.get(roadmap_id)
        if not roadmap_data:
            raise HTTPException(status_code=404, detail="Roadmap not found")
        roadmap_data["user_id"] = user_id
        return RoadmapSchema(**roadmap_data)

@router.get("/{roadmap_id}", response_model=RoadmapSchema)
async def get_roadmap(roadmap_id: str):
    db = get_database()
    roadmap_data = None
    
    if db is not None:
        roadmap_data = await db.roadmaps.find_one({"$or": [{"_id": roadmap_id}, {"id": roadmap_id}]})
    else:
        roadmap_data = IN_MEMORY_ROADMAPS.get(roadmap_id)
        
    if not roadmap_data:
        raise HTTPException(status_code=404, detail="Roadmap not found")
        
    roadmap_data["id"] = roadmap_data.get("_id", roadmap_data.get("id"))
    return RoadmapSchema(**roadmap_data)

@router.patch("/{roadmap_id}/progress", response_model=RoadmapSchema)
async def update_progress(roadmap_id: str, update: ProgressUpdateRequest):
    db = get_database()
    roadmap_data = None
    
    if db is not None:
        roadmap_data = await db.roadmaps.find_one({"$or": [{"_id": roadmap_id}, {"id": roadmap_id}]})
    else:
        roadmap_data = IN_MEMORY_ROADMAPS.get(roadmap_id)
        
    if not roadmap_data:
        raise HTTPException(status_code=404, detail="Roadmap not found")
        
    modules = roadmap_data.get("modules", [])
    completed_count = 0
    
    for m in modules:
        if m.get("id") == update.module_id:
            m["is_completed"] = update.is_completed
        if m.get("is_completed"):
            completed_count += 1
            
    total = len(modules)
    progress_pct = round((completed_count / total * 100), 1) if total > 0 else 0.0
    
    roadmap_data["completed_modules"] = completed_count
    roadmap_data["progress_percentage"] = progress_pct
    roadmap_data["modules"] = modules
    
    if db is not None:
        await db.roadmaps.update_one(
            {"$or": [{"_id": roadmap_id}, {"id": roadmap_id}]},
            {"$set": {
                "modules": modules,
                "completed_modules": completed_count,
                "progress_percentage": progress_pct
            }}
        )
    else:
        IN_MEMORY_ROADMAPS[roadmap_id] = roadmap_data
        
    roadmap_data["id"] = roadmap_data.get("_id", roadmap_data.get("id"))
    return RoadmapSchema(**roadmap_data)

@router.delete("/{roadmap_id}")
async def delete_roadmap(roadmap_id: str):
    db = get_database()
    if db is not None:
        await db.roadmaps.delete_one({"$or": [{"_id": roadmap_id}, {"id": roadmap_id}]})
        await db.module_notes.delete_many({"roadmap_id": roadmap_id})
    else:
        IN_MEMORY_ROADMAPS.pop(roadmap_id, None)
    return {"message": "Roadmap deleted successfully"}
