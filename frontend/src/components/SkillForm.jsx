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
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '40px 20px 80px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>
          Personalized Career Pathway Questionnaire
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto' }}>
          Provide your educational background, current skills, career ambition, and learning language.
          The AI engine will construct a personalized learning pathway tailored specifically for you.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="clean-panel" style={{ padding: '36px', display: 'flex', flexDirection: 'column', gap: '32px', background: '#ffffff' }}>

          {/* 1. Full Name for Certificate */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#e0e7ff',
                color: '#4338ca',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <User size={18} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                1. Your Full Name
              </h3>
            </div>

            <input
              type="text"
              required
              placeholder="Enter your full name as it should appear on your Certificate of Completion..."
              className="form-input"
              value={learnerName}
              onChange={(e) => setLearnerName(e.target.value)}
              style={{ fontSize: '0.95rem', padding: '14px 16px' }}
            />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <GraduationCap size={18} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
                1. Highest Education
              </h3>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
              gap: '10px'
            }}>
              {EDUCATION_OPTIONS.map((edu) => (
                <div
                  key={edu}
                  onClick={() => setHighestEducation(edu)}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid',
                    borderColor: highestEducation === edu ? 'var(--primary)' : 'var(--border-color)',
                    background: highestEducation === edu ? 'var(--primary-light)' : '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s',
                    color: highestEducation === edu ? 'var(--primary)' : 'var(--text-primary)',
                    fontWeight: highestEducation === edu ? 600 : 500
                  }}
                >
                  <span style={{ fontSize: '0.9rem' }}>{edu}</span>
                  {highestEducation === edu && (
                    <Check size={16} color="var(--primary)" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 2. What are your current skills? (Direct text input) */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#f0f9ff',
                color: 'var(--accent-cyan)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Code2 size={18} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
                2. What are your current skills?
              </h3>
            </div>

            <input
              type="text"
              required
              placeholder="Type your current skills or knowledge (e.g. Basic Computer, MS Excel, Drawing, English, Electrical basics, None)..."
              className="form-input"
              value={currentSkills}
              onChange={(e) => setCurrentSkills(e.target.value)}
              style={{ fontSize: '0.95rem', padding: '14px 16px' }}
            />
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '6px', margin: '6px 0 0' }}>
              You can separate multiple skills with commas. If you have no prior skills, simply type "None" or "Beginner".
            </p>
          </div>

          {/* 3. What is your career aspiration? (Direct text input) */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#ecfdf5',
                color: 'var(--accent-emerald)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Target size={18} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
                3. What is your career aspiration?
              </h3>
            </div>

            <input
              type="text"
              required
              placeholder="Type your target career or dream job (e.g. Electrician, Web Developer, Graphic Designer, Accountant, Chef, Bank PO)..."
              className="form-input"
              value={careerAspiration}
              onChange={(e) => setCareerAspiration(e.target.value)}
              style={{ fontSize: '0.95rem', padding: '14px 16px' }}
            />
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '6px', margin: '6px 0 0' }}>
              Type any career goal across any domain or industry.
            </p>
          </div>

          {/* 4. Preferred Language for Learning (Top 10 Indian Languages) */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#fef3c7',
                color: '#b45309',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Languages size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  4. Preferred Language for Learning
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                  Your complete roadmap, detailed study notes, and quizzes will be generated in this language.
                </p>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))',
              gap: '10px'
            }}>
              {TOP_10_INDIAN_LANGUAGES.map((lang) => {
                const isSelected = preferredLanguage === lang.code;
                return (
                  <div
                    key={lang.code}
                    onClick={() => setPreferredLanguage(lang.code)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid',
                      borderColor: isSelected ? 'var(--primary)' : 'var(--border-color)',
                      background: isSelected ? 'var(--primary-light)' : '#ffffff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 700, color: isSelected ? 'var(--primary)' : '#0f172a' }}>
                        {lang.native}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {lang.name}
                      </div>
                    </div>
                    {isSelected && (
                      <Check size={16} color="var(--primary)" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit CTA */}
          <div style={{ textAlign: 'center', paddingTop: '10px' }}>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{
                fontSize: '1.05rem',
                padding: '14px 36px',
                borderRadius: 'var(--radius-md)',
                minWidth: '280px'
              }}
            >
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="animate-spin">⚙️</span>
                  <span>Generating Pathway in {preferredLanguage}...</span>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
