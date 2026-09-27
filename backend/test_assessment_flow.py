import asyncio
import sys
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')
from app.models.schemas import UserProfileInput, RoadmapSchema, ModuleSchema, AssessmentSubmissionRequest
from app.routes.assessment import get_or_create_assessment, submit_assessment, get_certificate, IN_MEMORY_ASSESSMENTS
from app.routes.roadmap import IN_MEMORY_ROADMAPS
from fastapi import HTTPException

async def run_test():
    print("=== Testing Assessment & Certification Flow ===")

    # 1. Setup mock roadmap with 3 modules
    roadmap_id = "test-rm-101"
    modules = [
        ModuleSchema(
            id=f"mod-{i}",
            number=i,
            phase=f"Phase {i}",
            title=f"Core Milestone {i}",
            estimated_hours=10,
            difficulty="Beginner",
            description=f"Mastery of {i}",
            key_topics=[f"Topic {i}.1", f"Topic {i}.2"],
            hands_on_project=f"Build task {i}",
            is_completed=False
        )
        for i in range(1, 4)
    ]

    roadmap = RoadmapSchema(
        id=roadmap_id,
        title="Pathway to Electrician",
        target_role="Electrician",
        user_profile={
            "preferred_language": "Tamil",
            "highest_education": "ITI",
            "current_skills": ["Basics"]
        },
        skill_gap_summary="Gap analysis...",
        total_estimated_hours=30,
        total_modules=3,
        completed_modules=1,
        progress_percentage=33.3,
        modules=modules
    )
    IN_MEMORY_ROADMAPS[roadmap_id] = roadmap.model_dump()

    # Test 1: Assessment locked when incomplete
    print("Test 1: Verifying assessment is LOCKED when incomplete...")
    try:
        await get_or_create_assessment(roadmap_id=roadmap_id, current_user=None)
        print("FAIL: Assessment should be locked!")
    except HTTPException as e:
        print(f"PASS: Correctly locked with status {e.status_code}: {e.detail}")

    # Test 2: Mark all modules complete and unlock assessment
    print("\nTest 2: Marking all modules complete and generating 50 MCQs...")
    for m in modules:
        m.is_completed = True
    roadmap.completed_modules = 3
    roadmap.progress_percentage = 100.0
    IN_MEMORY_ROADMAPS[roadmap_id] = roadmap.model_dump()

    assessment = await get_or_create_assessment(roadmap_id=roadmap_id, current_user=None)
    print(f"PASS: Assessment generated with {len(assessment.questions)} questions!")
    print(f"Sample Question 1: {assessment.questions[0].question}")
    print(f"Options count: {len(assessment.questions[0].options)}")
    assert len(assessment.questions) == 50, f"Expected 50 questions, got {len(assessment.questions)}"
    assert assessment.questions[0].correct_answer_index is None, "Correct answers must be hidden from client!"

    # Test 3: Submitting answers with failing score (< 30)
    print("\nTest 3: Submitting failing score (20 / 50)...")
    raw_saved = IN_MEMORY_ASSESSMENTS[roadmap_id]
    mock_answers_fail = {}
    for idx, q in enumerate(raw_saved["questions"]):
        correct_opt = q["correct_answer_index"]
        if idx < 20:
            mock_answers_fail[q["id"]] = correct_opt # 20 correct
        else:
            mock_answers_fail[q["id"]] = (correct_opt + 1) % 4 # 30 wrong

    fail_res = await submit_assessment(
        roadmap_id=roadmap_id,
        payload=AssessmentSubmissionRequest(answers=mock_answers_fail),
        current_user={"_id": "u1", "name": "Gowtham"}
    )
    print(f"PASS: Score = {fail_res.score}/50, Passed = {fail_res.passed}, Certificate = {fail_res.certificate}")
    assert fail_res.score == 20
    assert not fail_res.passed
    assert fail_res.certificate is None

    # Test 4: Submitting passing score (>= 30) -> e.g. 35 / 50
    print("\nTest 4: Submitting passing score (35 / 50)...")
    mock_answers_pass = {}
    for idx, q in enumerate(raw_saved["questions"]):
        correct_opt = q["correct_answer_index"]
        if idx < 35:
            mock_answers_pass[q["id"]] = correct_opt # 35 correct
        else:
            mock_answers_pass[q["id"]] = (correct_opt + 1) % 4 # 15 wrong

    pass_res = await submit_assessment(
        roadmap_id=roadmap_id,
        payload=AssessmentSubmissionRequest(answers=mock_answers_pass),
        current_user={"_id": "u1", "name": "Gowtham"}
    )
    print(f"PASS: Score = {pass_res.score}/50, Passed = {pass_res.passed}")
    print(f"PASS: Certificate issued: ID={pass_res.certificate.id}, Code={pass_res.certificate.verification_code}")
    assert pass_res.score == 35
    assert pass_res.passed
    assert pass_res.certificate is not None
    assert pass_res.certificate.user_name == "Gowtham"

    # Test 5: Fetch Certificate endpoint
    print("\nTest 5: Retrieving certificate...")
    cert = await get_certificate(roadmap_id=roadmap_id)
    print(f"PASS: Certificate verified: {cert.course_title} for {cert.user_name} ({cert.score}/50)")
    assert cert.id == pass_res.certificate.id

    print("\n=== ALL ASSESSMENT & CERTIFICATION TESTS PASSED SUCCESSFULLY! ===")

if __name__ == "__main__":
    asyncio.run(run_test())
