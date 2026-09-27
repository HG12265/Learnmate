import json
import logging
import re
import httpx
from typing import Dict, Any, Optional
from app.config import settings
from app.services.prompt_templates import (
    get_roadmap_system_prompt,
    get_roadmap_user_prompt,
    get_module_notes_prompt,
    get_ask_mentor_prompt,
    get_assessment_batch_prompt
)

logger = logging.getLogger("learnmate.ai_service")

def clean_json_text(text: str) -> str:
    """Extract and parse json even if wrapped in markdown code blocks or conversational text"""
    text = text.strip()
    if "```json" in text:
        text = text.split("```json")[1].split("```")[0].strip()
    elif "```" in text:
        text = text.split("```")[1].split("```")[0].strip()
    
    # Try to find first { and last }
    first_brace = text.find("{")
    last_brace = text.rfind("}")
    if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
        text = text[first_brace:last_brace + 1]
    return text

class AIService:
    @staticmethod
    async def call_groq(messages: list, model: Optional[str] = None, json_mode: bool = True) -> str:
        model_to_use = model or settings.GROQ_DEFAULT_MODEL
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {settings.GROQ_API_KEY}",
            "Content-Type": "application/json",
            "User-Agent": "LearnMate-AI/1.0"
        }
        payload = {
            "model": model_to_use,
            "messages": messages,
            "temperature": 0.3,
            "max_tokens": 4096
        }
        if json_mode:
            payload["response_format"] = {"type": "json_object"}
            
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(url, headers=headers, json=payload)
            if resp.status_code != 200:
                logger.warning(f"Groq primary model {model_to_use} failed ({resp.status_code}): {resp.text}. Retrying with fast model...")
                # Retry with backup Groq model
                payload["model"] = settings.GROQ_FAST_MODEL
                resp = await client.post(url, headers=headers, json=payload)
                resp.raise_for_status()
                
            data = resp.json()
            return data["choices"][0]["message"]["content"]

    @staticmethod
    async def call_gemini(prompt: str) -> str:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
        headers = {"Content-Type": "application/json"}
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": 0.3,
                "responseMimeType": "application/json"
            }
        }
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(url, headers=headers, json=payload)
            if resp.status_code != 200:
                logger.warning(f"Gemini 2.5 failed ({resp.status_code}): {resp.text}. Retrying with gemini-flash-latest...")
                fallback_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key={settings.GEMINI_API_KEY}"
                resp = await client.post(fallback_url, headers=headers, json=payload)
                resp.raise_for_status()
                
            data = resp.json()
            return data["candidates"][0]["content"]["parts"][0]["text"]

    @classmethod
    async def generate_roadmap(cls, profile: dict, preferred_provider: str = "groq") -> Dict[str, Any]:
        system_prompt = get_roadmap_system_prompt()
        user_prompt = get_roadmap_user_prompt(profile)
        
        raw_content = None
        used_provider = "Groq"

        # Try Preferred Provider First
        if preferred_provider == "gemini":
            try:
                logger.info("Generating roadmap using Gemini...")
                combined = f"{system_prompt}\n\n{user_prompt}"
                raw_content = await cls.call_gemini(combined)
                used_provider = "Gemini 2.5 Flash"
            except Exception as e:
                logger.error(f"Gemini failed: {e}. Falling back to Groq.")

        if not raw_content:
            try:
                logger.info("Generating roadmap using Groq...")
                messages = [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ]
                raw_content = await cls.call_groq(messages, json_mode=True)
                used_provider = "Groq High-Speed (OpenAI-120B / Qwen)"
            except Exception as e:
                logger.error(f"Groq failed: {e}. Trying Gemini as fallback...")
                try:
                    combined = f"{system_prompt}\n\n{user_prompt}"
                    raw_content = await cls.call_gemini(combined)
                    used_provider = "Gemini 2.5 Flash (Fallback)"
                except Exception as e2:
                    logger.error(f"Both AI providers failed: {e2}")

        if raw_content:
            try:
                cleaned = clean_json_text(raw_content)
                parsed = json.loads(cleaned)
                parsed["ai_model_used"] = used_provider
                return parsed
            except Exception as e:
                logger.error(f"JSON parsing error: {e}. Raw content: {raw_content[:300]}")

        # Fallback structured roadmap if both APIs have network issues
        return cls._generate_deterministic_roadmap(profile)

    @classmethod
    async def generate_module_notes(cls, module_info: dict, target_role: str, user_profile: dict, preferred_provider: str = "groq") -> Dict[str, Any]:
        prompt = get_module_notes_prompt(module_info, target_role, user_profile)
        raw_content = None

        if preferred_provider == "gemini":
            try:
                raw_content = await cls.call_gemini(prompt)
            except Exception as e:
                logger.error(f"Gemini notes generation failed: {e}")

        if not raw_content:
            try:
                messages = [
                    {"role": "system", "content": "You are a master engineering educator. Return clean JSON."},
                    {"role": "user", "content": prompt}
                ]
                raw_content = await cls.call_groq(messages, json_mode=True)
            except Exception as e:
                logger.error(f"Groq notes generation failed: {e}. Trying Gemini...")
                try:
                    raw_content = await cls.call_gemini(prompt)
                except Exception as e2:
                    logger.error(f"Both AI failed for module notes: {e2}")

        if raw_content:
            try:
                cleaned = clean_json_text(raw_content)
                return json.loads(cleaned)
            except Exception as e:
                logger.error(f"Module notes JSON parsing failed: {e}")

        return cls._generate_fallback_module_notes(module_info, target_role)

    @classmethod
    async def ask_mentor(cls, module_title: str, question: str, notes_overview: str) -> Dict[str, Any]:
        prompt = get_ask_mentor_prompt(module_title, question, notes_overview)
        try:
            messages = [
                {"role": "system", "content": "You are a friendly senior mentor. Return JSON."},
                {"role": "user", "content": prompt}
            ]
            raw = await cls.call_groq(messages, json_mode=True)
            cleaned = clean_json_text(raw)
            return json.loads(cleaned)
        except Exception as e:
            logger.warning(f"Groq mentor failed ({e}), trying Gemini...")
            try:
                raw = await cls.call_gemini(prompt)
                cleaned = clean_json_text(raw)
                return json.loads(cleaned)
            except Exception as e2:
                return {
                    "answer": f"Great question regarding {module_title}! Key takeaway: Focus on isolating the problem into minimal reproducible examples, check documentation, and build incrementally.",
                    "suggested_followups": ["How do I debug this locally?", "What are the common production anti-patterns?"]
                }

    @staticmethod
    def _generate_deterministic_roadmap(profile: dict) -> dict:
        target = profile.get("target_role", "IoT Innovator & Embedded Systems Developer")
        skills = ", ".join(profile.get("current_skills", [])) or "basic computing & logic"
        language = profile.get("preferred_language", "English")

        is_tamil = "tamil" in language.lower()
        
        title = f"{target}: அடிப்படைகள் முதல் உயர்நிலை வரையிலான முழுமையான கற்றல் பாதை" if is_tamil else f"{target}: Your Journey from Basics to Advanced Development"
        subtitle = f"{target} க்கான கட்டமைப்புடன் கூடிய தொழில்முறை கற்றல் பாதை" if is_tamil else f"A Structured Learning Pathway for {target}"
        narrative = (
            f"இந்த விரிவான கற்றல் பாதை {target} துறையில் நீங்கள் சிறந்து விளங்க தேவையான அனைத்து அடிப்படைக் கொள்கைகள், செயல்முறைப் பயிற்சிகள், கிளவுட் ஒருங்கிணைப்பு மற்றும் தொழில்துறைத் தரநிலைகளை உங்களுக்கு படிப் படியாகக் கற்றுத்தரும் வகையில் வடிவமைக்கப்பட்டுள்ளது."
            if is_tamil else
            f"The {target} pathway is an end-to-end, industry-aligned career roadmap designed to transform learners from fundamental principles to production-grade architecture, hands-on physical/cloud integration, security standards, and professional readiness."
        )
        gap_summary = (
            f"{skills} அறிவிலிருந்து தொடங்கி {target} துறைக்குத் தேவையான நடைமுறைத் திறன்கள் மற்றும் நிஜ உலக பணிச்சூழல் தரநிலைகளை இந்த திட்டம் முழுமையாக பூர்த்தி செய்கிறது."
            if is_tamil else
            f"Starting from prior baseline in {skills}, this pathway bridges core conceptual knowledge with enterprise-grade implementation, practical prototyping, and scalable system deployment."
        )

        return {
            "title": title,
            "subtitle": subtitle,
            "overview_narrative": narrative,
            "target_role": target,
            "skill_gap_summary": gap_summary,
            "total_estimated_hours": 128,
            "ai_model_used": "LearnMate Core Pathway Engine",
            "modules": [
                # Phase 1: Foundational Digital & Core Skills
                {
                    "id": "mod-1",
                    "number": 1,
                    "phase": "Phase 1: Foundational Digital & Core Principles",
                    "phase_description": "This initial phase equips you with fundamental programming, logic, and electronic/domain concepts.",
                    "category_type": "COURSE",
                    "title": f"Digital Literacy & Introduction to {target} Logic",
                    "estimated_hours": 6,
                    "difficulty": "Beginner",
                    "description": "Establish core computational thinking, input-output logic, and primary domain terminologies essential for mastery.",
                    "key_topics": ["Computational Logic", "Data Types & Variables", "Control Structures", "System Architecture Overview"],
                    "hands_on_project": "Build an interactive logic simulator or foundational terminal application."
                },
                {
                    "id": "mod-2",
                    "number": 2,
                    "phase": "Phase 1: Foundational Digital & Core Principles",
                    "phase_description": "This initial phase equips you with fundamental programming, logic, and electronic/domain concepts.",
                    "category_type": "COURSE",
                    "title": "Basic Electrical, Signal & Component Fundamentals",
                    "estimated_hours": 8,
                    "difficulty": "Beginner",
                    "description": "Understand voltage, current, resistance, Ohm's law, digital vs analog signals, and foundational sensor interfaces.",
                    "key_topics": ["Ohm's & Kirchhoff's Laws", "Analog vs Digital Signals", "Sensors & Actuators", "Circuit Safety"],
                    "hands_on_project": "Simulate a multi-sensor voltage divider circuit with real-time readings."
                },
                {
                    "id": "mod-3",
                    "number": 3,
                    "phase": "Phase 1: Foundational Digital & Core Principles",
                    "phase_description": "This initial phase equips you with fundamental programming, logic, and electronic/domain concepts.",
                    "category_type": "COURSE",
                    "title": f"Introduction to Core Scripting & Tooling for {target}",
                    "estimated_hours": 10,
                    "difficulty": "Beginner",
                    "description": "Write clean, modular scripts to process data streams, handle files, and automate fundamental tasks.",
                    "key_topics": ["Syntax & Functions", "Data Structures", "Module Management", "Error Handling & Debugging"],
                    "hands_on_project": "Develop an automated data ingest script with CSV/JSON parsing."
                },

                # Phase 2: Core Practical Competencies
                {
                    "id": "mod-4",
                    "number": 4,
                    "phase": "Phase 2: Core Practical Competencies",
                    "phase_description": "This phase provides in-depth hands-on skills in controllers, frameworks, and system communication.",
                    "category_type": "COURSE",
                    "title": f"Understanding {target} Ecosystem & Architecture",
                    "estimated_hours": 12,
                    "difficulty": "Intermediate",
                    "description": "Deep-dive into multi-tier architectures: device perception layer, network layer, data management layer, and application layer.",
                    "key_topics": ["Perception & Edge Layer", "Network Topologies", "Data Ingestion Pipeline", "System Modularity"],
                    "hands_on_project": "Architect an end-to-end system blueprint diagram with interface specifications."
                },
                {
                    "id": "mod-5",
                    "number": 5,
                    "phase": "Phase 2: Core Practical Competencies",
                    "phase_description": "This phase provides in-depth hands-on skills in controllers, frameworks, and system communication.",
                    "category_type": "COURSE",
                    "title": "Microcontroller & Embedded System Programming",
                    "estimated_hours": 14,
                    "difficulty": "Intermediate",
                    "description": "Master firmware development, GPIO pin management, interrupt handling, timers, and peripheral communications (I2C, SPI, UART).",
                    "key_topics": ["GPIO & Interrupts", "I2C / SPI / UART Buses", "Memory & Flash Constraints", "Low-Power Modes"],
                    "hands_on_project": "Program an ESP32/microcontroller to poll temperature/humidity sensors and emit alert interrupts."
                },
                {
                    "id": "mod-6",
                    "number": 6,
                    "phase": "Phase 2: Core Practical Competencies",
                    "phase_description": "This phase provides in-depth hands-on skills in controllers, frameworks, and system communication.",
                    "category_type": "COURSE",
                    "title": "Communication Protocols & Network Engineering",
                    "estimated_hours": 12,
                    "difficulty": "Intermediate",
                    "description": "Implement lightweight messaging protocols including MQTT, WebSockets, HTTP REST APIs, and wireless protocols (Wi-Fi, BLE).",
                    "key_topics": ["MQTT Broker & Topics", "HTTP REST vs WebSockets", "BLE Advertising & GATT", "Packet Optimization"],
                    "hands_on_project": "Establish an active MQTT publisher/subscriber link streaming telemetry data to a local broker."
                },

                # Phase 3: Practical Applications & Cloud Integration
                {
                    "id": "mod-7",
                    "number": 7,
                    "phase": "Phase 3: Practical Applications & Cloud Integration",
                    "phase_description": "You will systematically build connected systems, integrate cloud brokers, and write automation scripts.",
                    "category_type": "PROJECT",
                    "title": "Hands-on Project: Smart Environmental Monitoring System",
                    "estimated_hours": 14,
                    "difficulty": "Intermediate",
                    "description": "Design and build a complete end-to-end sensing system with live metric streaming, threshold triggers, and real-time dashboard display.",
                    "key_topics": ["Telemetry Ingestion", "Threshold Alert Logic", "Live Charting", "State Persistence"],
                    "hands_on_project": "Deploy an environmental monitoring prototype pushing telemetry data into a live web dashboard."
                },
                {
                    "id": "mod-8",
                    "number": 8,
                    "phase": "Phase 3: Practical Applications & Cloud Integration",
                    "phase_description": "You will systematically build connected systems, integrate cloud brokers, and write automation scripts.",
                    "category_type": "CERTIFICATION",
                    "title": "Cloud Platform Fundamentals (AWS IoT / Azure IoT Hub / ThingsBoard)",
                    "estimated_hours": 12,
                    "difficulty": "Intermediate",
                    "description": "Connect devices securely to enterprise cloud platforms, manage digital device shadows, configure serverless triggers, and store time-series data.",
                    "key_topics": ["Device Provisioning & X.509 Certs", "Device Twins / Shadows", "Serverless Rule Engines", "Time-Series Data Stores"],
                    "hands_on_project": "Authenticate a simulated fleet of 10 virtual devices into a cloud IoT gateway with automated telemetry alerts."
                },
                {
                    "id": "mod-9",
                    "number": 9,
                    "phase": "Phase 3: Practical Applications & Cloud Integration",
                    "phase_description": "You will systematically build connected systems, integrate cloud brokers, and write automation scripts.",
                    "category_type": "PROJECT",
                    "title": "Advanced Project: Building a Smart Automation Prototype",
                    "estimated_hours": 16,
                    "difficulty": "Advanced",
                    "description": "Develop a multi-node automation network with bi-directional remote commands, fail-safe modes, and scheduled background workers.",
                    "key_topics": ["Bi-directional Remote Control", "Fail-safe Hardware Watchdogs", "State Synchronization", "Mobile/Web Remote Interface"],
                    "hands_on_project": "Build and demonstrate a smart automation system with remote relay control and latency under 150ms."
                },

                # Phase 4: Advanced Industry Exposure
                {
                    "id": "mod-10",
                    "number": 10,
                    "phase": "Phase 4: Advanced Industry Exposure & Scalability",
                    "phase_description": "Focus on edge computing, security standards, TLS handshakes, and enterprise industrial protocols.",
                    "category_type": "COURSE",
                    "title": f"{target} Security, TLS & Data Privacy Best Practices",
                    "estimated_hours": 10,
                    "difficulty": "Advanced",
                    "description": "Harden connected endpoints against cyber attacks, enforce TLS/SSL encryption, secure boot routines, and eliminate vulnerable firmware flaws.",
                    "key_topics": ["Hardware Root of Trust", "mTLS Authentication", "Over-The-Air (OTA) Secure Updates", "OWASP Embedded Top 10"],
                    "hands_on_project": "Perform a security audit on device firmware and implement encrypted credential storage."
                },
                {
                    "id": "mod-11",
                    "number": 11,
                    "phase": "Phase 4: Advanced Industry Exposure & Scalability",
                    "phase_description": "Focus on edge computing, security standards, TLS handshakes, and enterprise industrial protocols.",
                    "category_type": "SPECIALIZATION",
                    "title": f"Introduction to Edge Computing & TinyML for {target}",
                    "estimated_hours": 12,
                    "difficulty": "Advanced",
                    "description": "Run lightweight ML inference models directly on edge microcontrollers without relying on constant cloud round-trips.",
                    "key_topics": ["Quantization & Model Pruning", "TensorFlow Lite for Microcontrollers", "Anomaly Detection at the Edge", "Real-Time Latency Reduction"],
                    "hands_on_project": "Deploy a vibration anomaly detection model on an edge node."
                },
                {
                    "id": "mod-12",
                    "number": 12,
                    "phase": "Phase 4: Advanced Industry Exposure & Scalability",
                    "phase_description": "Focus on edge computing, security standards, TLS handshakes, and enterprise industrial protocols.",
                    "category_type": "SPECIALIZATION",
                    "title": "Industrial Applications & Production Standards (IIoT)",
                    "estimated_hours": 12,
                    "difficulty": "Advanced",
                    "description": "Understand industrial field buses, Modbus / CAN bus / OPC-UA protocols, predictive maintenance, and SCADA integration.",
                    "key_topics": ["Modbus RTU/TCP & CAN Bus", "OPC Unified Architecture", "Predictive Maintenance Algorithms", "Industrial High-Availability"],
                    "hands_on_project": "Simulate a Modbus PLC data gateway publishing machinery metrics to an industrial analytics hub."
                },

                # Phase 5: Soft Skills & Career Readiness
                {
                    "id": "mod-13",
                    "number": 13,
                    "phase": "Phase 5: Soft Skill Development & Career Readiness",
                    "phase_description": "Equips you with professional communication, technical documentation, and interview problem-solving excellence.",
                    "category_type": "SOFT SKILLS",
                    "title": "Effective Technical Communication & System Documentation",
                    "estimated_hours": 6,
                    "difficulty": "Beginner",
                    "description": "Write clear engineering specifications, user manuals, API reference docs, and deliver compelling technical presentations.",
                    "key_topics": ["Technical Spec Writing", "Architecture Diagrams (C4 / UML)", "Release Notes & Changelogs", "Stakeholder Communication"],
                    "hands_on_project": "Draft a complete engineering design document (EDD) for your portfolio projects."
                },
                {
                    "id": "mod-14",
                    "number": 14,
                    "phase": "Phase 5: Soft Skill Development & Career Readiness",
                    "phase_description": "Equips you with professional communication, technical documentation, and interview problem-solving excellence.",
                    "category_type": "SOFT SKILLS",
                    "title": f"Problem Solving, Design Thinking & Technical Interview Mastery for {target}",
                    "estimated_hours": 8,
                    "difficulty": "Intermediate",
                    "description": "Prepare for technical interviews, whiteboard system design, behavioral questions, and showcase your GitHub/portfolio.",
                    "key_topics": ["System Design Interviews", "Root Cause Analysis (5 Whys)", "Portfolio Presentation", "Behavioral & Situational Questions"],
                    "hands_on_project": "Conduct a mock interview case study defense and publish an interactive GitHub repository showcase."
                }
            ]
        }

    @staticmethod
    def _generate_fallback_module_notes(module_info: dict, target_role: str) -> dict:
        title = module_info.get("title", "Module Overview")
        return {
            "title": title,
            "overview": f"Comprehensive guide to mastering {title} in your path toward becoming a professional {target_role}.",
            "deep_theory_markdown": f"## 1. Introduction to {title}\nThis module establishes the foundational principles and best practices required in real-world environments.\n\n### Key Principles:\n- **Modular Design**: Breaking systems into independent components.\n- **Error Resilience**: Graceful error handling and fault tolerance.\n- **Performance**: Minimizing latency and resource consumption.\n\n```python\n# Example architecture\ndef initialize_system():\n    print('System initialized successfully')\n```",
            "code_snippets": [
                {
                    "title": "Production Implementation Example",
                    "language": "python",
                    "code": "# Enterprise implementation pattern\nimport time\n\ndef execute_task(task_id: str):\n    \"\"\"Simulates a robust processing pipeline\"\"\"\n    print(f'Starting task: {task_id}')\n    return {'status': 'success', 'task_id': task_id}\n",
                    "explanation": "Demonstrates clean documentation, type hints, and structured response dictionary."
                }
            ],
            "practical_lab_task": {
                "task_title": f"{title} Practical Challenge",
                "instructions": [
                    "Step 1: Setup a new local repository or project workspace.",
                    "Step 2: Implement the core modules as outlined.",
                    "Step 3: Test edge cases and handle unexpected inputs.",
                    "Step 4: Commit your code with meaningful commit messages."
                ],
                "expected_output": "A fully functional and verified module ready for integration."
            },
            "curated_resources": [
                {
                    "title": "Official Documentation & Reference",
                    "url": "https://developer.mozilla.org",
                    "type": "Official Documentation",
                    "description": "Authoritative guide and reference material."
                },
                {
                    "title": "FreeCodeCamp & GitHub Guides",
                    "url": "https://www.freecodecamp.org",
                    "type": "Interactive Lab",
                    "description": "Step-by-step interactive exercises and open source examples."
                }
            ],
            "interview_questions": [
                {
                    "question": f"What are the most common bottlenecks encountered when implementing {title}?",
                    "answer": "Common bottlenecks include unoptimized I/O operations, improper memory allocation, and lack of connection pooling. Mitigate them by profiling early and utilizing asynchronous event loops.",
                    "difficulty": "Intermediate"
                }
            ],
            "quiz_questions": [
                {
                    "id": "q1",
                    "question": f"Which design principle is most critical for {title}?",
                    "options": ["Single Responsibility Principle", "Hardcoding configurations", "Skipping unit tests", "Blocking main threads"],
                    "correct_answer_index": 0,
                    "explanation": "Single Responsibility ensures each component has only one reason to change, maximizing maintainability."
                }
            ]
        }

    @classmethod
    async def generate_course_assessment(cls, roadmap_data: dict, total_questions: int = 50) -> list:
        target_role = roadmap_data.get("target_role", "Professional Specialist")
        user_profile = roadmap_data.get("user_profile", {})
        language = user_profile.get("preferred_language") or "English"
        modules = roadmap_data.get("modules", [])
        provider = user_profile.get("ai_provider") or "groq"

        # Split modules into 2 distinct curriculum phases to ensure wide topic coverage
        mid = max(1, len(modules) // 2)
        mod_subset_1 = modules[:mid] if modules else []
        mod_subset_2 = modules[mid:] if len(modules) > 1 else modules

        batches = [
            {
                "count": 25,
                "start_num": 1,
                "subset": mod_subset_1,
                "focus": "Foundations, Core Competencies, Concepts & Basic Workflows"
            },
            {
                "count": 25,
                "start_num": 26,
                "subset": mod_subset_2,
                "focus": "Advanced Systems, Troubleshooting, Real-world Integration & Capstone Mastery"
            }
        ]

        all_raw_questions = []
        seen_question_keys = set()

        def normalize_q(text: str) -> str:
            return re.sub(r'[^\w]', '', text.lower()).strip()

        for b in batches:
            existing_summaries = [q.get("question", "")[:60] for q in all_raw_questions]

            prompt = get_assessment_batch_prompt(
                target_role=target_role,
                language=language,
                modules_subset=b["subset"] if b["subset"] else modules,
                focus_description=b["focus"],
                count=b["count"],
                start_num=b["start_num"],
                existing_questions_summary=existing_summaries if existing_summaries else None
            )
            raw_content = None

            if provider == "gemini":
                try:
                    raw_content = await cls.call_gemini(prompt)
                except Exception as e:
                    logger.warning(f"Gemini assessment batch {b['start_num']} failed: {e}")

            if not raw_content:
                try:
                    messages = [
                        {"role": "system", "content": "You are a professional certification exam controller. Return valid JSON only."},
                        {"role": "user", "content": prompt}
                    ]
                    raw_content = await cls.call_groq(messages, json_mode=True)
                except Exception as e:
                    logger.warning(f"Groq assessment batch {b['start_num']} failed: {e}")
                    if provider != "gemini":
                        try:
                            raw_content = await cls.call_gemini(prompt)
                        except Exception as e2:
                            logger.error(f"Both AI failed for assessment batch: {e2}")

            batch_questions = []
            if raw_content:
                try:
                    cleaned = clean_json_text(raw_content)
                    parsed = json.loads(cleaned)
                    items = parsed.get("questions") if isinstance(parsed, dict) else parsed
                    if isinstance(items, list):
                        for q in items:
                            if isinstance(q, dict) and "question" in q and "options" in q and len(q["options"]) == 4:
                                q_norm = normalize_q(q["question"])
                                if q_norm and q_norm not in seen_question_keys:
                                    seen_question_keys.add(q_norm)
                                    batch_questions.append(q)
                except Exception as e:
                    logger.error(f"Assessment JSON parse error: {e}")

            # Supplement missing questions if any duplicate was removed or AI returned fewer
            needed = b["count"] - len(batch_questions)
            if needed > 0:
                logger.info(f"Supplementing {needed} unique questions for batch starting at {b['start_num']}")
                fallback_items = cls._generate_fallback_assessment_questions(
                    target_role=target_role,
                    language=language,
                    modules=b["subset"] if b["subset"] else modules,
                    count=needed,
                    start_num=b["start_num"] + len(batch_questions),
                    seen_keys=seen_question_keys
                )
                batch_questions.extend(fallback_items)

            all_raw_questions.extend(batch_questions[:b["count"]])

        # Final pass: Guarantee exactly total_questions with 100% unique question strings
        final_list = []
        for idx, q in enumerate(all_raw_questions[:total_questions]):
            num = idx + 1
            mod_idx = idx % len(modules) if modules else 0
            mod_title = modules[mod_idx].get("title", f"Module {mod_idx + 1}") if modules else f"Module {mod_idx + 1}"
            
            raw_correct = q.get("correct_answer_index", 0)
            try:
                correct_idx = int(raw_correct) if 0 <= int(raw_correct) <= 3 else 0
            except Exception:
                correct_idx = 0

            final_list.append({
                "id": f"q-{num}",
                "number": num,
                "module_title": q.get("module_title") or mod_title,
                "question": q.get("question", f"Assessment Question {num} on {mod_title}"),
                "options": q.get("options", ["Option A", "Option B", "Option C", "Option D"]),
                "correct_answer_index": correct_idx,
                "explanation": q.get("explanation", "Standard domain answer supported by industry protocols.")
            })

        return final_list

    @staticmethod
    def _generate_fallback_assessment_questions(
        target_role: str,
        language: str,
        modules: list,
        count: int,
        start_num: int,
        seen_keys: set = None
    ) -> list:
        if seen_keys is None:
            seen_keys = set()

        question_templates = [
            "What is the primary industry standard or protocol when implementing '{topic}' in {role}?",
            "How should a specialist troubleshoot unexpected errors during '{topic}' phase?",
            "Which key consideration ensures maximum safety and performance when executing '{topic}'?",
            "When optimizing '{topic}', what is the recommended procedure according to best practices?",
            "What is a critical anti-pattern to avoid when working with '{topic}' in {role}?",
            "Which core calculation or specification rule governs '{topic}' in real-world scenarios?",
            "In production environments, why is '{topic}' essential for overall system reliability?"
        ]

        results = []
        i = 0
        template_idx = 0

        while len(results) < count and template_idx < 200:
            num = start_num + len(results)
            mod_idx = (num - 1) % len(modules) if modules else 0
            mod = modules[mod_idx] if modules else {}
            mod_title = mod.get("title", f"Core Milestone {mod_idx + 1}")
            topics = mod.get("key_topics", ["Core Principle", "Standard Workflow", "Safety Protocol", "System Optimization"])
            topic = topics[(num + template_idx) % len(topics)] if topics else "Core Standard"

            tmpl = question_templates[template_idx % len(question_templates)]
            q_text = tmpl.format(topic=topic, role=target_role)

            norm_key = re.sub(r'[^\w]', '', q_text.lower()).strip()
            template_idx += 1

            if norm_key in seen_keys:
                continue

            seen_keys.add(norm_key)

            options = [
                f"Adhering strictly to verified industry specifications and safety protocols for {topic}.",
                f"Bypassing standard verification steps to accelerate immediate delivery.",
                f"Utilizing unverified third-party tools without diagnostic testing.",
                f"Ignoring error logging and standard diagnostic inspection."
            ]

            results.append({
                "id": f"q-{num}",
                "number": num,
                "module_title": mod_title,
                "question": q_text,
                "options": options,
                "correct_answer_index": 0,
                "explanation": f"In {target_role}, adhering to established protocols for {topic} ensures reliability, quality, and safety compliance."
            })

        return results


