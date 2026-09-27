import React, { useState, useRef } from 'react';
import { ArrowRight, BookOpen, Award, Sparkles, ShieldCheck } from 'lucide-react';

export default function HeroLanding({ onStartJourney }) {
  const [activeCard, setActiveCard] = useState(0);
  const dockRef = useRef(null);

  const scrollToCard = (index) => {
    if (!dockRef.current) return;
    const cards = dockRef.current.children;
    if (cards[index]) {
      cards[index].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      setActiveCard(index);
    }
  };

  const handleDockScroll = (e) => {
    const el = e.currentTarget;
    const scrollLeft = el.scrollLeft;
    const cardWidth = el.children[0]?.offsetWidth || 300;
    const newIndex = Math.round(scrollLeft / cardWidth);
    if (newIndex !== activeCard && newIndex >= 0 && newIndex <= 2) {
      setActiveCard(newIndex);
    }
  };

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      overflow: 'hidden',
      background: '#f8fafc'
    }}>
      {/* Vivid Background Visual Covering Hero */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'url(/hero_universal_bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center 15%',
        zIndex: 0
      }} />

      {/* Gentle Radial Vignette for Contrast (Image is crisp and clearly visible) */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.35) 30%, rgba(248, 250, 252, 0.75) 75%, rgba(248, 250, 252, 0.94) 100%)',
        zIndex: 1
      }} />

      {/* Main Hero Content */}
      <div className="hero-content-container">
        {/* Floating Top Badge */}
        <div className="hero-top-badge">
          <span style={{
            display: 'inline-block',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#10b981',
            boxShadow: '0 0 8px #10b981'
          }} />
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
            <span className="badge-text-full">Next-Gen Learning & Career Companion</span>
            <span className="badge-text-short">AI Career Companion</span>
          </span>
          <span style={{ color: '#cbd5e1' }}>•</span>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#2563eb', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Sparkles size={13} /> Powered by AI
          </span>
        </div>

        {/* Universal Inspiring Headline with Pristine Royal Gradient */}
        <h1 className="hero-h1 font-heading" style={{
          fontSize: 'clamp(2.3rem, 5.2vw, 3.8rem)',
          fontWeight: 900,
          color: '#0f172a',
          lineHeight: 1.15,
          letterSpacing: '-0.035em',
          maxWidth: '920px',
          margin: '0 auto 18px',
        }}>
          Master Any Discipline. <br />
          <span style={{
            background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #0284c7 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'inline-block',
            filter: 'drop-shadow(0 3px 12px rgba(37, 99, 235, 0.22))'
          }}>
            Shape Your Dream Career.
          </span>
        </h1>

        {/* Minimal & Universal Subtitle */}
        <p className="hero-subtitle" style={{
          fontSize: '1.14rem',
          color: '#1e293b',
          fontWeight: 500,
          maxWidth: '720px',
          margin: '0 auto 32px',
          lineHeight: 1.65,
          textShadow: '0 1px 12px rgba(255, 255, 255, 0.95)'
        }}>
          LearnMate maps your existing knowledge to your career aspirations. We calculate your exact skill gap and synthesize a step-by-step, personalized curriculum tailored for true professional mastery.
        </p>

        {/* Start Journey CTA Button */}
        <div className="hero-cta-container" style={{ display: 'flex', justifyContent: 'center', marginBottom: '46px' }}>
          <button
            onClick={onStartJourney}
            className="hero-cta-btn"
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 12px 34px -4px rgba(37, 99, 235, 0.55)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 28px -4px rgba(37, 99, 235, 0.45)';
            }}
          >
            <span>Start Journey</span>
            <ArrowRight size={20} />
          </button>
        </div>

        {/* ======================================================== */}
        {/* Sleek Floating Frosted-Glass Visual Showcase Dock */}
        {/* ======================================================== */}
        <div 
          id="how-it-works" 
          ref={dockRef}
          onScroll={handleDockScroll}
          className="feature-showcase-dock"
        >
          {/* Feature 1: Gap Analysis */}
          <div
            className="feature-showcase-card"
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#ffffff';
              e.currentTarget.style.borderColor = '#93c5fd';
              e.currentTarget.style.boxShadow = '0 16px 36px -6px rgba(37, 99, 235, 0.16)';
              e.currentTarget.style.transform = 'translateY(-4px)';
              const img = e.currentTarget.querySelector('.feature-card-img');
              if (img) img.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.78)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.9)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
              const img = e.currentTarget.querySelector('.feature-card-img');
              if (img) img.style.transform = 'scale(1)';
            }}
          >
            {/* Visual Art Header */}
            <div className="feature-card-img-box" style={{ background: '#eff6ff' }}>
              <img 
                src="/feature_gap_analysis.jpg" 
                alt="Personalized Skill Gap Radar"
                className="feature-card-img"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.45s ease'
                }}
              />
              <div style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                zIndex: 2,
                fontSize: '0.68rem',
                fontWeight: 800,
                letterSpacing: '0.06em',
                color: '#1d4ed8',
                background: 'rgba(255, 255, 255, 0.94)',
                backdropFilter: 'blur(8px)',
                padding: '4px 10px',
                borderRadius: '9999px',
                border: '1px solid rgba(191, 219, 254, 0.9)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}>
                01 • DELTA ENGINE
              </div>
            </div>

            {/* Content */}
            <div style={{ padding: '2px 4px 6px' }}>
              <h3 style={{ fontSize: '1.14rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
                Personalized Gap Analysis
              </h3>
              <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.55, margin: '0 0 12px' }}>
                Maps your current knowledge against your dream career, creating an optimized roadmap without repeating fundamentals.
              </p>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.74rem',
                fontWeight: 700,
                color: '#2563eb',
                background: '#eff6ff',
                padding: '4px 10px',
                borderRadius: '6px'
              }}>
                <Sparkles size={13} />
                <span>Zero-Redundancy Curriculum</span>
              </div>
            </div>
          </div>

          {/* Feature 2: In-Depth Study Notes */}
          <div
            className="feature-showcase-card"
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#ffffff';
              e.currentTarget.style.borderColor = '#86efac';
              e.currentTarget.style.boxShadow = '0 16px 36px -6px rgba(16, 185, 129, 0.16)';
              e.currentTarget.style.transform = 'translateY(-4px)';
              const img = e.currentTarget.querySelector('.feature-card-img');
              if (img) img.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.78)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.9)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
              const img = e.currentTarget.querySelector('.feature-card-img');
              if (img) img.style.transform = 'scale(1)';
            }}
          >
            {/* Visual Art Header */}
            <div className="feature-card-img-box" style={{ background: '#ecfdf5' }}>
              <img 
                src="/feature_study_labs.jpg" 
                alt="In-Depth Study Labs & AI Mentor"
                className="feature-card-img"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.45s ease'
                }}
              />
              <div style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                zIndex: 2,
                fontSize: '0.68rem',
                fontWeight: 800,
                letterSpacing: '0.06em',
                color: '#059669',
                background: 'rgba(255, 255, 255, 0.94)',
                backdropFilter: 'blur(8px)',
                padding: '4px 10px',
                borderRadius: '9999px',
                border: '1px solid rgba(167, 243, 208, 0.9)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}>
                02 • STUDY LABS
              </div>
            </div>

            {/* Content */}
            <div style={{ padding: '2px 4px 6px' }}>
              <h3 style={{ fontSize: '1.14rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
                Conceptual Study Labs
              </h3>
              <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.55, margin: '0 0 12px' }}>
                Master subjects with structured blueprints, practical real-world case studies, and an interactive 24/7 AI mentor.
              </p>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.74rem',
                fontWeight: 700,
                color: '#059669',
                background: '#ecfdf5',
                padding: '4px 10px',
                borderRadius: '6px'
              }}>
                <BookOpen size={13} />
                <span>Blueprints & AI Doubts Solver</span>
              </div>
            </div>
          </div>

          {/* Feature 3: Milestones & Credentials */}
          <div
            className="feature-showcase-card"
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#ffffff';
              e.currentTarget.style.borderColor = '#fde047';
              e.currentTarget.style.boxShadow = '0 16px 36px -6px rgba(245, 158, 11, 0.16)';
              e.currentTarget.style.transform = 'translateY(-4px)';
              const img = e.currentTarget.querySelector('.feature-card-img');
              if (img) img.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.78)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.9)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
              const img = e.currentTarget.querySelector('.feature-card-img');
              if (img) img.style.transform = 'scale(1)';
            }}
          >
            {/* Visual Art Header */}
            <div className="feature-card-img-box" style={{ background: '#fefce8' }}>
              <img 
                src="/feature_credentials.jpg" 
                alt="Verified Milestones & Credentials"
                className="feature-card-img"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.45s ease'
                }}
              />
              <div style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                zIndex: 2,
                fontSize: '0.68rem',
                fontWeight: 800,
                letterSpacing: '0.06em',
                color: '#d97706',
                background: 'rgba(255, 255, 255, 0.94)',
                backdropFilter: 'blur(8px)',
                padding: '4px 10px',
                borderRadius: '9999px',
                border: '1px solid rgba(253, 224, 71, 0.9)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}>
                03 • CREDENTIALS
              </div>
            </div>

            {/* Content */}
            <div style={{ padding: '2px 4px 6px' }}>
              <h3 style={{ fontSize: '1.14rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
                Verified Credentials
              </h3>
              <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.55, margin: '0 0 12px' }}>
                Validate your competence through milestone assessments and earn officially authenticated completion certificates.
              </p>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.74rem',
                fontWeight: 700,
                color: '#d97706',
                background: '#fefce8',
                padding: '4px 10px',
                borderRadius: '6px'
              }}>
                <ShieldCheck size={13} />
                <span>Officially Verifiable Certs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Swipe Pagination Dots */}
        <div className="mobile-swipe-indicator">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            background: 'rgba(255, 255, 255, 0.88)',
            backdropFilter: 'blur(10px)',
            borderRadius: '9999px',
            border: '1px solid rgba(226, 232, 240, 0.85)',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.05)'
          }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', marginRight: '4px' }}>
              Swipe
            </span>
            {[0, 1, 2].map((idx) => (
              <button
                key={idx}
                onClick={() => scrollToCard(idx)}
                style={{
                  width: activeCard === idx ? '22px' : '7px',
                  height: '7px',
                  borderRadius: '9999px',
                  background: activeCard === idx ? '#2563eb' : '#cbd5e1',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  transition: 'all 0.25s ease'
                }}
                aria-label={`Go to feature slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
