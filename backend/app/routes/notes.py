import logging
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, HTTPException, status, Query
from app.database import get_database
from app.models.schemas import ModuleNotesDetail, AskMentorInput, AskMentorResponse, ResourceLink, InterviewQA, QuizQuestion
from app.services.ai_service import AIService

logger = logging.getLogger("learnmate.notes")
router = APIRouter(prefix="/api/roadmap", tags=["Module Notes & AI Mentor"])

IN_MEMORY_NOTES = {}

@router.post("/{roadmap_id}/module/{module_id}/notes", response_model=ModuleNotesDetail)
async def get_or_generate_module_notes(
    roadmap_id: str,
    module_id: str,
    force_refresh: bool = Query(False, description="Force re-generation with AI")
):
    db = get_database()
    cache_key = f"{roadmap_id}_{module_id}"
    
    # 1. Check if cached in MongoDB
    if not force_refresh:
        if db is not None:
            cached = await db.module_notes.find_one({"roadmap_id": roadmap_id, "module_id": module_id})
            if cached:
                logger.info(f"Loaded cached notes for {cache_key} from MongoDB")
                return ModuleNotesDetail(**cached)
        elif cache_key in IN_MEMORY_NOTES:
            return ModuleNotesDetail(**IN_MEMORY_NOTES[cache_key])

    # 2. Fetch parent roadmap and target module metadata
    roadmap_data = None
    if db is not None:
        roadmap_data = await db.roadmaps.find_one({"$or": [{"_id": roadmap_id}, {"id": roadmap_id}]})
    else:
        from app.routes.roadmap import IN_MEMORY_ROADMAPS
        roadmap_data = IN_MEMORY_ROADMAPS.get(roadmap_id)

    if not roadmap_data:
        raise HTTPException(status_code=404, detail="Parent roadmap not found")

    target_module = None
    for m in roadmap_data.get("modules", []):
        if m.get("id") == module_id:
            target_module = m
            break

    if not target_module:
        raise HTTPException(status_code=404, detail="Module not found in this roadmap")

    target_role = roadmap_data.get("target_role", "Software Engineer")
    user_profile = roadmap_data.get("user_profile", {})
    provider = user_profile.get("ai_provider", "groq")

    # 3. Call AI Service to generate comprehensive study notes
    try:
        raw_notes = await AIService.generate_module_notes(
            module_info=target_module,
            target_role=target_role,
            user_profile=user_profile,
            preferred_provider=provider
        )

        # Parse & construct structured Pydantic object
        resources = [
            ResourceLink(
                title=r.get("title", "Resource"),
                url=r.get("url", "https://developer.mozilla.org"),
                type=r.get("type", "Official Documentation"),
                description=r.get("description", "")
            )
            for r in raw_notes.get("curated_resources", [])
        ]

        interview_qs = [
            InterviewQA(
                question=q.get("question", "What is the core concept?"),
                answer=q.get("answer", "Detailed explanation..."),
                difficulty=q.get("difficulty", "Intermediate")
            )
            for q in raw_notes.get("interview_questions", [])
        ]

        quiz_qs = [
            QuizQuestion(
                id=q.get("id", f"q-{i}"),
                question=q.get("question", ""),
                options=q.get("options", ["A", "B", "C", "D"]),
                correct_answer_index=int(q.get("correct_answer_index", 0)),
                explanation=q.get("explanation", "Core concept rationale.")
            )
            for i, q in enumerate(raw_notes.get("quiz_questions", []))
        ]

        notes_obj = ModuleNotesDetail(
            module_id=module_id,
            roadmap_id=roadmap_id,
            title=raw_notes.get("title", target_module.get("title")),
            overview=raw_notes.get("overview", target_module.get("description")),
            deep_theory_markdown=raw_notes.get("deep_theory_markdown", "### Detailed Notes\nStudy content..."),
            code_snippets=raw_notes.get("code_snippets", []),
            practical_lab_task=raw_notes.get("practical_lab_task", {"task_title": "Lab Challenge", "instructions": [], "expected_output": ""}),
            curated_resources=resources,
            interview_questions=interview_qs,
            quiz_questions=quiz_qs,
            generated_at=datetime.utcnow()
        )

        # 4. Save to MongoDB
        notes_dict = notes_obj.model_dump()
        if db is not None:
            await db.module_notes.update_one(
                {"roadmap_id": roadmap_id, "module_id": module_id},
                {"$set": notes_dict},
                upsert=True
            )
            # Mark module as having notes in parent roadmap
            await db.roadmaps.update_one(
                {"$or": [{"_id": roadmap_id}, {"id": roadmap_id}], "modules.id": module_id},
                {"$set": {"modules.$.has_notes": True}}
            )
        else:
            IN_MEMORY_NOTES[cache_key] = notes_dict

        return notes_obj

    except Exception as e:
        logger.error(f"Error generating module notes: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate module notes: {str(e)}"
        )

@router.post("/{roadmap_id}/module/{module_id}/ask", response_model=AskMentorResponse)
async def ask_mentor(
    roadmap_id: str,
    module_id: str,
    payload: AskMentorInput
):
    db = get_database()
    module_title = "Module Study"
    notes_overview = payload.context or ""
    
    if db is not None:
        notes = await db.module_notes.find_one({"roadmap_id": roadmap_id, "module_id": module_id})
        if notes:
            module_title = notes.get("title", module_title)
            notes_overview = notes.get("overview", notes_overview)

    result = await AIService.ask_mentor(
        module_title=module_title,
        question=payload.question,
        notes_overview=notes_overview
    )

    return AskMentorResponse(
        answer=result.get("answer", "Here is guidance on your question..."),
        suggested_followups=result.get("suggested_followups", [])
    )
