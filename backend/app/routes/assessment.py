import uuid
import logging
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, HTTPException, status, Depends, Query
from app.database import get_database
from pydantic import BaseModel
from app.models.schemas import (
    AssessmentSchema,
    AssessmentQuestionSchema,
    AssessmentSubmissionRequest,
    AssessmentResultSchema,
    QuestionReview,
    CertificateSchema
)
from app.services.ai_service import AIService
from app.auth import get_current_user_optional

logger = logging.getLogger("learnmate.assessment")
router = APIRouter(prefix="/api/roadmap", tags=["Course Assessment & Certification"])

# In-memory storage fallback if MongoDB is offline
IN_MEMORY_ASSESSMENTS = {}
IN_MEMORY_CERTIFICATES = {}

@router.get("/{roadmap_id}/assessment", response_model=AssessmentSchema)
async def get_or_create_assessment(
    roadmap_id: str,
    force_refresh: bool = Query(False, description="Force fresh AI generation of questions"),
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    db = get_database()

    # 1. Fetch parent roadmap
    roadmap_data = None
    if db is not None:
        roadmap_data = await db.roadmaps.find_one({"$or": [{"_id": roadmap_id}, {"id": roadmap_id}]})
    else:
        from app.routes.roadmap import IN_MEMORY_ROADMAPS
        roadmap_data = IN_MEMORY_ROADMAPS.get(roadmap_id)

    if not roadmap_data:
        raise HTTPException(status_code=404, detail="Roadmap not found")

    # 2. Verify all modules are completed
    modules = roadmap_data.get("modules", [])
    total_modules = len(modules)
    completed_modules = sum(1 for m in modules if m.get("is_completed"))

    if total_modules == 0 or completed_modules < total_modules:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Course assessment is locked! Complete all {total_modules} modules before unlocking the final 50-MCQ exam. (Completed: {completed_modules}/{total_modules})"
        )

    # 3. Check for existing cached assessment
    cached_assessment = None
    if not force_refresh:
        if db is not None:
            cached_assessment = await db.assessments.find_one({"roadmap_id": roadmap_id})
        else:
            cached_assessment = IN_MEMORY_ASSESSMENTS.get(roadmap_id)

    if not cached_assessment:
        logger.info(f"Generating 50-MCQ AI Assessment for roadmap {roadmap_id}...")
        raw_questions = await AIService.generate_course_assessment(roadmap_data, total_questions=50)

        assessment_id = f"asm-{uuid.uuid4().hex[:10]}"
        user_profile = roadmap_data.get("user_profile", {})
        language = user_profile.get("preferred_language") or "English"

        assessment_record = {
            "_id": assessment_id,
            "id": assessment_id,
            "roadmap_id": roadmap_id,
            "target_role": roadmap_data.get("target_role", "Professional"),
            "language": language,
            "total_questions": len(raw_questions),
            "passing_score": 30,
            "questions": raw_questions,
            "created_at": datetime.utcnow()
        }

        if db is not None:
            await db.assessments.update_one(
                {"roadmap_id": roadmap_id},
                {"$set": assessment_record},
                upsert=True
            )
        else:
            IN_MEMORY_ASSESSMENTS[roadmap_id] = assessment_record

        cached_assessment = assessment_record

    # 4. Return sanitized questions (omit correct_answer_index so client cannot inspect answers)
    sanitized_questions = []
    for q in cached_assessment.get("questions", []):
        sanitized_questions.append(
            AssessmentQuestionSchema(
                id=q.get("id"),
                number=q.get("number"),
                module_title=q.get("module_title", ""),
                question=q.get("question"),
                options=q.get("options", []),
                correct_answer_index=None, # Hidden during exam taking
                explanation=""             # Hidden until submission
            )
        )

    return AssessmentSchema(
        id=cached_assessment.get("id") or str(cached_assessment.get("_id")),
        roadmap_id=roadmap_id,
        target_role=cached_assessment.get("target_role", ""),
        language=cached_assessment.get("language", "English"),
        total_questions=len(sanitized_questions),
        passing_score=cached_assessment.get("passing_score", 30),
        questions=sanitized_questions,
        created_at=cached_assessment.get("created_at", datetime.utcnow())
    )

@router.post("/{roadmap_id}/assessment/submit", response_model=AssessmentResultSchema)
async def submit_assessment(
    roadmap_id: str,
    payload: AssessmentSubmissionRequest,
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    db = get_database()

    # 1. Fetch full assessment with answer keys
    cached_assessment = None
    if db is not None:
        cached_assessment = await db.assessments.find_one({"roadmap_id": roadmap_id})
    else:
        cached_assessment = IN_MEMORY_ASSESSMENTS.get(roadmap_id)

    if not cached_assessment:
        raise HTTPException(status_code=404, detail="Assessment not found. Please start the exam first.")

    # 2. Fetch parent roadmap for user details
    roadmap_data = None
    if db is not None:
        roadmap_data = await db.roadmaps.find_one({"$or": [{"_id": roadmap_id}, {"id": roadmap_id}]})
    else:
        from app.routes.roadmap import IN_MEMORY_ROADMAPS
        roadmap_data = IN_MEMORY_ROADMAPS.get(roadmap_id)

    # 3. Grade the assessment
    questions = cached_assessment.get("questions", [])
    total_count = len(questions)
    score = 0
    reviews = []

    user_answers = payload.answers or {}

    for q in questions:
        qid = q.get("id")
        user_choice = user_answers.get(qid)
        correct_idx = q.get("correct_answer_index", 0)

        is_correct = False
        if user_choice is not None and int(user_choice) == int(correct_idx):
            is_correct = True
            score += 1

        reviews.append(
            QuestionReview(
                id=qid,
                number=q.get("number", 1),
                question=q.get("question", ""),
                options=q.get("options", []),
                selected_option_index=user_choice,
                correct_answer_index=correct_idx,
                is_correct=is_correct,
                explanation=q.get("explanation", "Standard domain answer.")
            )
        )

    passed = score >= 30
    percentage = round((score / total_count * 100), 1) if total_count > 0 else 0.0

    # 4. If passed, issue certificate
    certificate_obj = None
    if passed:
        cert_id = f"CERT-{uuid.uuid4().hex[:8].upper()}"
        verif_code = f"LM-{roadmap_id[-6:].upper()}-{uuid.uuid4().hex[:6].upper()}"

        user_name = "Learner"
        if current_user and current_user.get("name"):
            user_name = current_user.get("name")
        elif roadmap_data and roadmap_data.get("user_profile", {}).get("name"):
            user_name = roadmap_data["user_profile"]["name"]
        elif roadmap_data and roadmap_data.get("user_profile", {}).get("learner_name"):
            user_name = roadmap_data["user_profile"]["learner_name"]

        target_role = roadmap_data.get("target_role", "Professional Specialist") if roadmap_data else "Professional"
        course_title = roadmap_data.get("title", f"Path to {target_role}") if roadmap_data else f"Mastery in {target_role}"

        certificate_record = {
            "_id": cert_id,
            "id": cert_id,
            "roadmap_id": roadmap_id,
            "user_id": str(current_user["_id"]) if current_user else "anonymous",
            "user_name": user_name,
            "target_role": target_role,
            "course_title": course_title,
            "score": score,
            "total": total_count,
            "percentage": percentage,
            "issue_date": datetime.utcnow(),
            "verification_code": verif_code
        }

        if db is not None:
            await db.certificates.update_one(
                {"roadmap_id": roadmap_id},
                {"$set": certificate_record},
                upsert=True
            )
        else:
            IN_MEMORY_CERTIFICATES[roadmap_id] = certificate_record

        certificate_obj = CertificateSchema(**certificate_record)

    return AssessmentResultSchema(
        score=score,
        total=total_count,
        passed=passed,
        percentage=percentage,
        passing_score=30,
        certificate=certificate_obj,
        reviews=reviews
    )

class UpdateCertificateNameRequest(BaseModel):
    user_name: str

@router.patch("/{roadmap_id}/certificate/name", response_model=CertificateSchema)
async def update_certificate_name(roadmap_id: str, payload: UpdateCertificateNameRequest):
    db = get_database()
    new_name = payload.user_name.strip()
    if not new_name:
        raise HTTPException(status_code=400, detail="Name cannot be empty")
        
    if db is not None:
        cert = await db.certificates.find_one({"roadmap_id": roadmap_id})
        if not cert:
            raise HTTPException(status_code=404, detail="Certificate not found")
        await db.certificates.update_one(
            {"roadmap_id": roadmap_id},
            {"$set": {"user_name": new_name}}
        )
        cert["user_name"] = new_name
        cert["id"] = cert.get("_id", cert.get("id"))
        return CertificateSchema(**cert)
    else:
        cert = IN_MEMORY_CERTIFICATES.get(roadmap_id)
        if not cert:
            raise HTTPException(status_code=404, detail="Certificate not found")
        cert["user_name"] = new_name
        return CertificateSchema(**cert)

@router.get("/user/certificates", response_model=List[CertificateSchema])
async def get_user_certificates(current_user: Optional[dict] = Depends(get_current_user_optional)):
    db = get_database()
    user_id = str(current_user["_id"]) if current_user else None
    
    certs = []
    if db is not None:
        if user_id:
            user_roadmaps = await db.roadmaps.find({"$or": [{"user_id": user_id}, {"user_id": current_user.get("email")}]}).to_list(100)
            roadmap_ids = [str(r.get("_id", r.get("id"))) for r in user_roadmaps]
            
            cursor = db.certificates.find({
                "$or": [
                    {"user_id": user_id},
                    {"roadmap_id": {"$in": roadmap_ids}}
                ]
            }).sort("issue_date", -1)
            async for doc in cursor:
                doc["id"] = doc.get("_id", doc.get("id"))
                certs.append(CertificateSchema(**doc))
        else:
            cursor = db.certificates.find().sort("issue_date", -1).limit(20)
            async for doc in cursor:
                
                doc["id"] = doc.get("_id", doc.get("id"))
                certs.append(CertificateSchema(**doc))
    else:
        for c in IN_MEMORY_CERTIFICATES.values():
            if not user_id or c.get("user_id") == user_id:
                certs.append(CertificateSchema(**c))
                
    return certs

@router.get("/{roadmap_id}/certificate", response_model=Optional[CertificateSchema])
async def get_certificate(roadmap_id: str):
    db = get_database()
    cert = None
    if db is not None:
        cert = await db.certificates.find_one({"roadmap_id": roadmap_id})
    else:
        cert = IN_MEMORY_CERTIFICATES.get(roadmap_id)

    if not cert:
        return None

    cert["id"] = cert.get("_id", cert.get("id"))
    return CertificateSchema(**cert)

