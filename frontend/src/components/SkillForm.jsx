import React, { useState } from 'react';
import {
  Sparkles,
  GraduationCap,
  Code2,
  Target,
  ArrowRight,
  Check,
  Languages,
  User
} from 'lucide-react';
import { api } from '../services/api';

const EDUCATION_OPTIONS = [
  'Below 10th',
  '10th Pass',
  '12th Pass',
  'ITI',
  'Diploma',
  'Graduate',
  'Post Graduate'
];

const TOP_10_INDIAN_LANGUAGES = [
  { code: 'English', name: 'English', native: 'English' },
  { code: 'Tamil', name: 'Tamil', native: 'தமிழ்' },
  { code: 'Hindi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'Telugu', name: 'Telugu', native: 'తెలుగు' },
  { code: 'Malayalam', name: 'Malayalam', native: 'മലയാളം' },
  { code: 'Kannada', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'Bengali', name: 'Bengali', native: 'বাংলা' },
  { code: 'Marathi', name: 'Marathi', native: 'मराठी' },
  { code: 'Gujarati', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'Punjabi', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' }
];

const POPULAR_SKILL_SUGGESTIONS = [
  'None / Beginner',
  'Basic Computer',
  'MS Office / Excel',
  'HTML & CSS',
  'JavaScript',
  'Python Basics',
  'Communication'
];

const POPULAR_CAREER_SUGGESTIONS = [
  'Full Stack Web Developer',
  'Frontend Developer',
  'Data Analyst',
  'Python Developer',
  'Graphic Designer',
  'Electrician',
  'Digital Marketer'
];

export default function SkillForm({ onSubmit, loading, initialData }) {
  const currentUser = api.getCurrentUser();

  const [learnerName, setLearnerName] = useState(
    initialData?.name || initialData?.learner_name || currentUser?.name || ''
  );

  const [highestEducation, setHighestEducation] = useState(
    initialData?.education || 'Graduate'
  );

  const [currentSkills, setCurrentSkills] = useState(
    initialData?.current_skills?.length ? initialData.current_skills.join(', ') : ''
  );

  const [careerAspiration, setCareerAspiration] = useState(
    initialData?.target_role || ''
  );

  const [preferredLanguage, setPreferredLanguage] = useState('English');

  const handleAddSkillChip = (skill) => {
    if (skill === 'None / Beginner') {
      setCurrentSkills('None');
      return;
    }
    const trimmed = currentSkills.trim();
    if (!trimmed || trimmed.toLowerCase() === 'none' || trimmed.toLowerCase() === 'beginner') {
      setCurrentSkills(skill);
    } else {
      const parts = trimmed.split(',').map(s => s.trim().toLowerCase());
      if (!parts.includes(skill.toLowerCase())) {
        setCurrentSkills(`${trimmed}, ${skill}`);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!careerAspiration.trim()) {
      alert('Please enter your career aspiration.');
      return;
    }

    const skillsArray = currentSkills
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    onSubmit({
      name: learnerName.trim() || 'Learner',
      learner_name: learnerName.trim() || 'Learner',
      highest_education: highestEducation,
      education_level: highestEducation,
      current_skills: skillsArray.length ? skillsArray : [currentSkills.trim() || 'Beginner'],
      experience_level: 'Beginner',
      career_aspiration: careerAspiration.trim(),
      target_role: careerAspiration.trim(),
      preferred_language: preferredLanguage,
      target_timeline: '3-6 Months',
      hours_per_week: 12,
      preferred_learning_style: 'Step-by-step practical pathway'
    });
  };

  return (
    <div className="questionnaire-container">
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div className="questionnaire-badge">
          <Sparkles size={14} color="#2563eb" />
          <span>AI Pathway Architect</span>
        </div>
        <h1 className="font-heading questionnaire-title">
          Personalized Career Pathway Questionnaire
        </h1>
        <p className="questionnaire-subtitle">
          Provide your educational background, current skills, career ambition, and learning language.
          The AI engine will construct a personalized learning pathway tailored specifically for you.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="clean-panel questionnaire-panel">

          {/* 1. Full Name for Certificate */}
          <div>
            <div className="questionnaire-section-header">
              <div className="questionnaire-icon-box" style={{ background: '#e0e7ff', color: '#4338ca' }}>
                <User size={18} />
              </div>
              <div>
                <h3 className="questionnaire-section-title">
                  1. Your Full Name
                </h3>
                <p className="questionnaire-section-desc">
                  This exact name will be stamped on your verified Certificate of Completion.
                </p>
              </div>
            </div>

            <input
              type="text"
              required
              placeholder="Enter your full name..."
              className="form-input"
              value={learnerName}
              onChange={(e) => setLearnerName(e.target.value)}
              style={{ fontSize: '0.96rem', padding: '13px 16px', borderRadius: '12px' }}
            />
          </div>

          {/* 2. Highest Education (Fixed Step Numbering) */}
          <div>
            <div className="questionnaire-section-header">
              <div className="questionnaire-icon-box" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                <GraduationCap size={18} />
              </div>
              <div>
                <h3 className="questionnaire-section-title">
                  2. Highest Education
                </h3>
                <p className="questionnaire-section-desc">
                  Helps our AI calibrate module depth and real-world project complexity.
                </p>
              </div>
            </div>

            <div className="questionnaire-education-grid">
              {EDUCATION_OPTIONS.map((edu) => {
                const isSelected = highestEducation === edu;
                return (
                  <div
                    key={edu}
                    onClick={() => setHighestEducation(edu)}
                    className={`questionnaire-education-item ${isSelected ? 'selected' : ''}`}
                  >
                    <span>{edu}</span>
                    {isSelected && (
                      <Check size={16} color="#2563eb" style={{ flexShrink: 0 }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Current Skills */}
          <div>
            <div className="questionnaire-section-header">
              <div className="questionnaire-icon-box" style={{ background: '#f0f9ff', color: 'var(--accent-cyan)' }}>
                <Code2 size={18} />
              </div>
              <div>
                <h3 className="questionnaire-section-title">
                  3. What are your current skills?
                </h3>
                <p className="questionnaire-section-desc">
                  Type your skills or tap quick suggestion chips below to append.
                </p>
              </div>
            </div>

            <input
              type="text"
              required
              placeholder="e.g. Basic Computer, MS Excel, Drawing, None"
              className="form-input"
              value={currentSkills}
              onChange={(e) => setCurrentSkills(e.target.value)}
              style={{ fontSize: '0.96rem', padding: '13px 16px', borderRadius: '12px' }}
            />

            {/* Quick Suggestion Chips */}
            <div className="questionnaire-quick-chips">
              {POPULAR_SKILL_SUGGESTIONS.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => handleAddSkillChip(skill)}
                  className="questionnaire-chip"
                >
                  + {skill}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Career Aspiration */}
          <div>
            <div className="questionnaire-section-header">
              <div className="questionnaire-icon-box" style={{ background: '#ecfdf5', color: 'var(--accent-emerald)' }}>
                <Target size={18} />
              </div>
              <div>
                <h3 className="questionnaire-section-title">
                  4. What is your career aspiration?
                </h3>
                <p className="questionnaire-section-desc">
                  Type your target dream job or pick one of the popular pathways below.
                </p>
              </div>
            </div>

            <input
              type="text"
              required
              placeholder="e.g. Full Stack Web Developer, Data Analyst, Electrician"
              className="form-input"
              value={careerAspiration}
              onChange={(e) => setCareerAspiration(e.target.value)}
              style={{ fontSize: '0.96rem', padding: '13px 16px', borderRadius: '12px' }}
            />

            {/* Quick Suggestion Chips */}
            <div className="questionnaire-quick-chips">
              {POPULAR_CAREER_SUGGESTIONS.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setCareerAspiration(role)}
                  className={`questionnaire-chip ${careerAspiration.toLowerCase() === role.toLowerCase() ? 'active' : ''}`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Preferred Language for Learning */}
          <div>
            <div className="questionnaire-section-header">
              <div className="questionnaire-icon-box" style={{ background: '#fef3c7', color: '#b45309' }}>
                <Languages size={18} />
              </div>
              <div>
                <h3 className="questionnaire-section-title">
                  5. Preferred Language for Learning
                </h3>
                <p className="questionnaire-section-desc">
                  Your syllabus, interactive notes, and board exams will be tailored in this language.
                </p>
              </div>
            </div>

            <div className="questionnaire-language-grid">
              {TOP_10_INDIAN_LANGUAGES.map((lang) => {
                const isSelected = preferredLanguage === lang.code;
                return (
                  <div
                    key={lang.code}
                    onClick={() => setPreferredLanguage(lang.code)}
                    className={`questionnaire-language-item ${isSelected ? 'selected' : ''}`}
                  >
                    <div>
                      <div className="questionnaire-language-native" style={{ color: isSelected ? '#1d4ed8' : '#0f172a' }}>
                        {lang.native}
                      </div>
                      <div className="questionnaire-language-sub">
                        {lang.name}
                      </div>
                    </div>
                    {isSelected && (
                      <Check size={16} color="#2563eb" style={{ flexShrink: 0 }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit CTA */}
          <div style={{ textAlign: 'center', paddingTop: '8px' }}>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary questionnaire-submit-btn"
            >
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  <span className="animate-spin">⚙️</span>
                  <span>Generating Pathway in {preferredLanguage}...</span>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  <Sparkles size={18} />
                  <span>Generate Path</span>
                  <ArrowRight size={18} />
                </div>
              )}
            </button>
          </div>

        </div>
      </form>
    </div>
  );
}
