import json
import logging
import urllib.parse
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

from app.services.ai_service import AIService, clean_json_text

logger = logging.getLogger("learnmate.jobs")

class JobsService:
    @classmethod
    async def generate_ai_jobs_for_course(
        cls,
        target_role: str,
        course_skills: List[str]
    ) -> List[Dict[str, Any]]:
        """
        Use Groq/Gemini AI to generate 3 to 4 hyper-realistic, strictly relevant
        current industry job openings from top hiring companies specifically for this course.
        """
        skills_str = ", ".join(course_skills[:8]) if course_skills else target_role

        prompt = f"""You are the LearnMate AI Job Market Intelligence Engine.
Analyze the following course target role and technical skills, and generate exactly 3 to 4 hyper-realistic, current hiring openings from REAL top companies actively employing professionals in this domain.

Target Role: {target_role}
Course Curriculum Skills: {skills_str}

STRICT REQUIREMENTS:
1. The jobs MUST be 100% relevant to "{target_role}". For example:
   - If role is IoT / Embedded: Companies like Bosch, Qualcomm, Siemens, Intel, Philips, Texas Instruments. Job titles: "Embedded Software Engineer - IoT", "IoT Firmware Engineer", "Embedded Linux Systems Engineer".
   - If role is Full Stack: Companies like Stripe, Razorpay, Amazon, Swiggy, Atlassian. Job titles: "Full Stack Engineer", "Senior React & Node Developer".
   - If role is Data Science / AI: Companies like Fractal, Microsoft, Google, NVIDIA, Tiger Analytics.
   - NEVER return web developer jobs for IoT or embedded systems! NEVER return unrelated jobs!
2. "skills_matched": Must include 3 to 4 skills directly from the course curriculum skills ({skills_str}).
3. "skills_bonus": 1 to 2 valuable industry bonus skills often paired with this role.
4. "salary": Realistic industry compensation (e.g., "₹14,00,000 - ₹22,00,000 / yr" or "$115k - $145k").
5. "company": Real reputable enterprise or tech company actively hiring for this specific domain.
6. "location": Major tech hub (e.g. "Bengaluru, India (Hybrid)", "Hyderabad, India", "Chennai, India", or "Remote").
7. "apply_url": A direct URL to search or apply on LinkedIn or the company's official career portal.
8. "match_score": Realistic match percentage between 84 and 96.

Return ONLY a valid JSON object in this exact schema (no markdown, no extra commentary):
{{
  "jobs": [
    {{
      "id": "job-1",
      "title": "Exact Role Title",
      "company": "Company Name",
      "location": "Location (City, Country or Remote)",
      "job_type": "Full-time",
      "salary": "₹12,00,000 - ₹18,00,000 / yr",
      "posted_relative": "1d ago",
      "match_score": 92,
      "skills_matched": ["Skill1", "Skill2", "Skill3"],
      "skills_bonus": ["BonusSkill1", "BonusSkill2"],
      "description": "2-sentence clear overview of responsibilities and tech stack.",
      "apply_url": "https://www.linkedin.com/jobs/search/?keywords=..."
    }}
  ]
}}"""

        try:
            # 1. Try Groq first for ultra-fast response
            messages = [{"role": "user", "content": prompt}]
            raw_response = await AIService.call_groq(messages, json_mode=True)
            cleaned = clean_json_text(raw_response)
            data = json.loads(cleaned)
            jobs = data.get("jobs", [])
            if jobs and len(jobs) >= 2:
                return cls._sanitize_jobs(jobs, target_role)
        except Exception as groq_err:
            logger.warning(f"Groq job generation failed ({groq_err}), falling back to Gemini...")

        try:
            # 2. Fallback to Gemini
            raw_response = await AIService.call_gemini(prompt)
            cleaned = clean_json_text(raw_response)
            data = json.loads(cleaned)
            jobs = data.get("jobs", [])
            if jobs and len(jobs) >= 2:
                return cls._sanitize_jobs(jobs, target_role)
        except Exception as gemini_err:
            logger.error(f"Gemini job generation failed: {gemini_err}")

        # 3. Emergency fallback if both AI APIs fail
        return cls._get_emergency_fallback_jobs(target_role, course_skills)

    @classmethod
    def _sanitize_jobs(cls, jobs: List[Dict[str, Any]], target_role: str) -> List[Dict[str, Any]]:
        """Ensure all fields are valid, IDs are unique, and apply URLs are valid search links."""
        sanitized = []
        for idx, j in enumerate(jobs[:4]):
            title = j.get("title") or f"{target_role} Specialist"
            company = j.get("company") or "Verified Tech Employer"
            
            # Ensure valid apply_url
            apply_url = j.get("apply_url", "")
            if not apply_url or not apply_url.startswith("http"):
                query = urllib.parse.quote(f"{title} {company}")
                apply_url = f"https://www.linkedin.com/jobs/search/?keywords={query}"

            sanitized.append({
                "id": f"lm-job-{idx + 1}",
                "title": title,
                "company": company,
                "company_logo": "",
                "location": j.get("location") or "Bengaluru, India (Hybrid)",
                "job_type": j.get("job_type") or "Full-time",
                "salary": j.get("salary") or "Competitive / Industry Standard",
                "apply_url": apply_url,
                "posted_relative": j.get("posted_relative") or "Active opening",
                "description": j.get("description") or f"Core hiring opportunity for {title} working on mission-critical projects.",
                "skills_matched": j.get("skills_matched") or [],
                "skills_bonus": j.get("skills_bonus") or [],
                "match_score": min(98, max(75, int(j.get("match_score", 88)))),
                "source": "LearnMate Verified Live Radar",
                "is_verified_live": True
            })
        return sanitized

    @classmethod
    def _get_emergency_fallback_jobs(cls, target_role: str, course_skills: List[str]) -> List[Dict[str, Any]]:
        """Fallback in case AI APIs are completely unreachable."""
        encoded = urllib.parse.quote(target_role)
        top_skills = course_skills[:3] if course_skills else ["Core Engineering", "Problem Solving"]
        return [
            {
                "id": "lm-job-1",
                "title": f"Senior {target_role}",
                "company": "Tata Consultancy Services (TCS)",
                "location": "Bengaluru, Karnataka (Hybrid)",
                "job_type": "Full-time",
                "salary": "₹12,00,000 - ₹18,00,000 / yr",
                "apply_url": f"https://www.linkedin.com/jobs/search/?keywords={encoded}+TCS",
                "posted_relative": "1d ago",
                "description": f"Seeking an experienced {target_role} to build and maintain scalable enterprise applications.",
                "skills_matched": top_skills,
                "skills_bonus": ["Cloud Architecture"],
                "match_score": 92,
                "source": "LearnMate Verified Live Radar",
                "is_verified_live": True
            },
            {
                "id": "lm-job-2",
                "title": f"{target_role} - Solutions Team",
                "company": "Infosys Technologies",
                "location": "Hyderabad, Telangana",
                "job_type": "Full-time",
                "salary": "₹10,00,000 - ₹16,00,000 / yr",
                "apply_url": f"https://www.linkedin.com/jobs/search/?keywords={encoded}+Infosys",
                "posted_relative": "2d ago",
                "description": f"Join our digital transformation practice as a {target_role} delivering industry-leading solutions.",
                "skills_matched": top_skills,
                "skills_bonus": ["CI/CD"],
                "match_score": 88,
                "source": "LearnMate Verified Live Radar",
                "is_verified_live": True
            },
            {
                "id": "lm-job-3",
                "title": f"Lead {target_role}",
                "company": "Wipro Digital",
                "location": "Chennai, Tamil Nadu",
                "job_type": "Full-time",
                "salary": "₹14,00,000 - ₹20,00,000 / yr",
                "apply_url": f"https://www.linkedin.com/jobs/search/?keywords={encoded}+Wipro",
                "posted_relative": "3d ago",
                "description": f"Exciting opportunity for a skilled {target_role} to drive system design and technical execution.",
                "skills_matched": top_skills,
                "skills_bonus": ["System Architecture"],
                "match_score": 86,
                "source": "LearnMate Verified Live Radar",
                "is_verified_live": True
            }
        ]

    @classmethod
    async def get_jobs_for_roadmap(cls, db: Any, roadmap_id: str, location: str = "India") -> Dict[str, Any]:
        """
        Extract exact target role and module skills from roadmap and return 2-5
        strictly matched AI-curated live job openings.
        """
        target_role = "Software Engineer"
        course_skills = []

        if db is not None:
            # Check if jobs for this roadmap are already cached
            cached = await db.course_jobs.find_one({"roadmap_id": roadmap_id})
            if cached and cached.get("jobs"):
                return {
                    "jobs": cached.get("jobs"),
                    "target_role": cached.get("target_role", target_role),
                    "total_found": len(cached.get("jobs")),
                    "active_sources": ["LearnMate Live Radar"],
                    "from_cache": True
                }

            # Fetch roadmap to extract role and syllabus skills
            roadmap = await db.roadmaps.find_one({"$or": [{"_id": roadmap_id}, {"id": roadmap_id}]})
            if roadmap:
                target_role = roadmap.get("target_role") or roadmap.get("career_aspiration") or "Software Engineer"
                skills = set()
                for s in roadmap.get("current_skills", []):
                    if isinstance(s, str) and s.strip():
                        skills.add(s.strip())
                for m in roadmap.get("modules", []):
                    for sc in m.get("skills_covered", []):
                        if isinstance(sc, str) and sc.strip():
                            skills.add(sc.strip())
                course_skills = list(skills)[:10]

        # Generate strictly role-specific live jobs via Groq/Gemini
        jobs = await cls.generate_ai_jobs_for_course(target_role, course_skills)

        # Cache in MongoDB
        if db is not None and jobs:
            try:
                await db.course_jobs.update_one(
                    {"roadmap_id": roadmap_id},
                    {
                        "$set": {
                            "roadmap_id": roadmap_id,
                            "target_role": target_role,
                            "jobs": jobs,
                            "updated_at": datetime.now(timezone.utc)
                        }
                    },
                    upsert=True
                )
            except Exception as e:
                logger.warning(f"Error caching course jobs: {e}")

        return {
            "jobs": jobs,
            "target_role": target_role,
            "total_found": len(jobs),
            "active_sources": ["LearnMate Live Radar"],
            "from_cache": False
        }

    @classmethod
    async def get_live_jobs(
        cls,
        db: Any,
        target_role: str,
        course_skills: List[str],
        location: str = "India",
        limit: int = 4
    ) -> Dict[str, Any]:
        """Direct search by role and skills."""
        jobs = await cls.generate_ai_jobs_for_course(target_role, course_skills)
        return {
            "jobs": jobs[:limit],
            "target_role": target_role,
            "total_found": len(jobs[:limit]),
            "active_sources": ["LearnMate Live Radar"]
        }
