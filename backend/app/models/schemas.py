from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime

# --- Auth Schemas ---
class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)
    education: Optional[str] = "College / Graduate"
    current_skills: Optional[List[str]] = []
    target_role: Optional[str] = "Full Stack Web Developer"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    education: Optional[str] = ""
    current_skills: Optional[List[str]] = []
    target_role: Optional[str] = ""
    created_at: Optional[datetime] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# --- Roadmap Schemas ---
class UserProfileInput(BaseModel):
    highest_education: Optional[str] = Field(default="Graduate", description="Below 10th, 10th Pass, 12th Pass, ITI, Diploma, Graduate, Post Graduate")
    education_level: Optional[str] = ""
    field_of_study: Optional[str] = ""
    current_skills: List[str] = Field(default_factory=list, description="Current skills or knowledge")
    experience_level: str = Field(default="Beginner", description="Beginner, Intermediate, Advanced")
    career_aspiration: Optional[str] = Field(default="Full Stack Web Developer", description="Target career role in any field")
    target_role: Optional[str] = ""
    target_timeline: str = Field(default="3-6 Months", description="e.g. 1 Month, 3 Months, 6 Months, 1 Year")
    hours_per_week: int = Field(default=10, ge=1, le=80)
    preferred_language: str = Field(default="English", description="English, Tamil, Hindi, Telugu, Malayalam, Kannada, Bengali, Marathi, Gujarati, Punjabi")
    preferred_learning_style: Optional[str] = "Hands-on projects & Practical"
    ai_provider: Optional[str] = "groq"

class QuizQuestion(BaseModel):
    id: str
    question: str
    options: List[str]
    correct_answer_index: int
    explanation: str

class ResourceLink(BaseModel):
    title: str
    url: str
    type: str # "Official Documentation", "Video Tutorial", "Interactive Lab", "GitHub Repo"
    description: Optional[str] = ""

class InterviewQA(BaseModel):
    question: str
    answer: str
    difficulty: str # "Beginner", "Intermediate", "Advanced"

class ModuleSchema(BaseModel):
    id: str
    number: int
    phase: str # e.g. "Phase 1: Foundations & Core Principles"
    phase_description: Optional[str] = ""
    category_type: Optional[str] = "COURSE" # "COURSE", "PROJECT", "CERTIFICATION", "SPECIALIZATION", "SOFT SKILLS"
    title: str
    estimated_hours: int
    difficulty: str # "Beginner", "Intermediate", "Advanced"
    description: str
    key_topics: List[str]
    hands_on_project: str
    is_completed: bool = False
    has_notes: bool = False

class RoadmapSchema(BaseModel):
    id: str
    user_id: Optional[str] = None
    title: str
    subtitle: Optional[str] = ""
    overview_narrative: Optional[str] = ""
    target_role: str
    user_profile: Dict[str, Any]
    skill_gap_summary: str
    total_estimated_hours: int
    total_modules: int
    completed_modules: int = 0
    progress_percentage: float = 0.0
    modules: List[ModuleSchema]
    created_at: datetime = Field(default_factory=datetime.utcnow)
    ai_model_used: Optional[str] = "Groq LLaMA/GPT-OSS"

class ProgressUpdateRequest(BaseModel):
    module_id: str
    is_completed: bool

# --- Deep Module Notes Schemas ---
class ModuleNotesDetail(BaseModel):
    module_id: str
    roadmap_id: str
    title: str
    overview: str
    deep_theory_markdown: str
    code_snippets: List[Dict[str, str]] # list of { "title": "...", "language": "...", "code": "...", "explanation": "..." }
    practical_lab_task: Dict[str, Any] # { "task_title": "...", "instructions": ["..."], "expected_output": "..." }
    curated_resources: List[ResourceLink]
    interview_questions: List[InterviewQA]
    quiz_questions: List[QuizQuestion]
    generated_at: datetime = Field(default_factory=datetime.utcnow)

class AskMentorInput(BaseModel):
    module_id: str
    roadmap_id: str
    question: str
    context: Optional[str] = ""

class AskMentorResponse(BaseModel):
    answer: str
    suggested_followups: List[str] = []

# --- Course Final Assessment & Certificate Schemas ---
class AssessmentQuestionSchema(BaseModel):
    id: str
    number: int
    module_title: Optional[str] = ""
    question: str
    options: List[str]
    correct_answer_index: Optional[int] = None
    explanation: Optional[str] = ""

class AssessmentSchema(BaseModel):
    id: str
    roadmap_id: str
    target_role: str
    language: str
    total_questions: int = 50
    passing_score: int = 30
    questions: List[AssessmentQuestionSchema]
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AssessmentSubmissionRequest(BaseModel):
    answers: Dict[str, int] # question_id: selected_index

class QuestionReview(BaseModel):
    id: str
    number: int
    question: str
    options: List[str]
    selected_option_index: Optional[int] = None
    correct_answer_index: int
    is_correct: bool
    explanation: str

class CertificateSchema(BaseModel):
    id: str
    roadmap_id: str
    user_id: Optional[str] = "learner"
    user_name: str
    target_role: str
    course_title: str
    score: int
    total: int = 50
    percentage: float
    issue_date: datetime = Field(default_factory=datetime.utcnow)
    verification_code: str

class AssessmentResultSchema(BaseModel):
    score: int
    total: int = 50
    passed: bool
    percentage: float
    passing_score: int = 30
    certificate: Optional[CertificateSchema] = None
    reviews: List[QuestionReview] = []

class UpdateCertificateNameRequest(BaseModel):
    user_name: str = Field(..., min_length=1, max_length=100)


