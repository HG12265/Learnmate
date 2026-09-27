# 🎓 LearnMate — AI-Powered Personalized Career Roadmaps & Study Labs

LearnMate is a next-generation career mastery and educational intelligence platform. Powered by AI and structured curriculum frameworks, LearnMate generates customized step-by-step learning roadmaps, interactive study labs, AI research mentorship, and official 50-MCQ certification examinations for any technical discipline.

---

## ✨ Key Features

- 🗺️ **Personalized Career Roadmaps**: Dynamic, milestone-driven visual paths with difficulty filtering (Beginner, Intermediate, Advanced) and capstone milestones.
- 🧪 **AI-Powered Interactive Study Labs**: In-depth module guides, structured takeaways, real-world case studies, macOS-styled executable code blocks, and an embedded 24/7 AI Mentor.
- 📝 **Official Board of Examination (50-MCQ Exam Hall)**: Timed, zero-duplicate 50-question assessment with an interactive 50-question navigation palette, instant scoring, and AI explanation reviews.
- 📜 **Official Cryptographic Certificates**: Verifiable credentials upon passing the 30/50 competency threshold.
- 💎 **Executive Glassmorphism UI**: High-end frosted glass aesthetics, responsive mobile & desktop navigation, and fluid micro-interactions.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: Vanilla CSS Design System with Frosted Glassmorphism Tokens
- **Icons**: Lucide React
- **Celebration Effects**: Canvas Confetti

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **Database**: MongoDB (Motor Async Driver)
- **AI Engine**: Google Gemini API
- **Server**: Uvicorn ASGI

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- MongoDB running on `localhost:27017`

### 1. Clone & Setup
```bash
git clone https://github.com/HG12265/Learnmate.git
cd Learnmate
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory:
```env
MONGO_URI=mongodb://localhost:27017
DB_NAME=learnmate_db
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=your_jwt_secret_key
```

Run the backend server:
```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

Visit `http://localhost:5173` to explore LearnMate.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
