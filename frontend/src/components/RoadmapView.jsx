import React, { useState } from 'react';
import {
  Target,
  Clock,
  TrendingUp,
  CheckCircle2,
  RefreshCw,
  GraduationCap,
  Award,
  Lock,
  Unlock,
  FileCheck2,
  ChevronLeft,
  LayoutGrid,
  GitFork,
  BookOpen,
  Wrench,
  Sparkles,
  Users,
  Check,
  Trophy,
  ArrowRight,
  Briefcase
} from 'lucide-react';
import ModuleCard from './ModuleCard';
import LiveJobBoard from './LiveJobBoard';

export default function RoadmapView({
  roadmap,
  onOpenNotes,
  onToggleComplete,
  onNewPath,
  onOpenAssessment,
  certificate,
  onOpenCertificate
}) {
  const [activePhaseFilter, setActivePhaseFilter] = useState('All');
  const [viewMode, setViewMode] = useState('pathway'); // 'pathway' | 'grid'
  const [showJobsDrawer, setShowJobsDrawer] = useState(false);

  if (!roadmap) return null;

  // Extract distinct phases
  const distinctPhases = [...new Set(roadmap.modules.map(m => m.phase))];
  const phases = ['All', ...distinctPhases];

  // Group modules by phase for structured pathway rendering
  const groupedPhases = [];
  roadmap.modules.forEach((mod) => {
    let group = groupedPhases.find(g => g.phase === mod.phase);
    if (!group) {
      group = {
        phase: mod.phase,
        phase_description: mod.phase_description || '',
        modules: []
      };
      groupedPhases.push(group);
    }
    group.modules.push(mod);
  });

  // Filter modules/phases based on active filter
  const displayedPhases = activePhaseFilter === 'All'
    ? groupedPhases
    : groupedPhases.filter(g => g.phase === activePhaseFilter);

  const filteredModules = activePhaseFilter === 'All'
    ? roadmap.modules
    : roadmap.modules.filter(m => m.phase === activePhaseFilter);

  const completedCount = roadmap.completed_modules || roadmap.modules.filter(m => m.is_completed).length;
  const totalCount = roadmap.total_modules || roadmap.modules.length;
  const progressPct = roadmap.progress_percentage ?? Math.round((completedCount / totalCount) * 100);

  // Helper for center node icon
  const getNodeIcon = (module) => {
    if (module.is_completed) return <Check size={20} strokeWidth={2.6} />;
    const cat = String(module.category_type || '').toUpperCase();
    if (cat.includes('PROJECT')) return <Wrench size={19} />;
    if (cat.includes('CERT')) return <Award size={19} />;
    if (cat.includes('SPEC')) return <Sparkles size={19} />;
    if (cat.includes('SOFT')) return <Users size={19} />;
    return <BookOpen size={19} />;
  };

  // Running counter for alternating zigzag across entire pathway
  let globalModuleCounter = 0;

  return (
    <div className="roadmap-container">

      {/* Top Back & Exploration Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <button
          onClick={onNewPath}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--primary)',
            fontSize: '0.88rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            padding: '6px 0'
          }}
        >
          <ChevronLeft size={18} />
          <span>Explore Roadmaps & Pathways</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowJobsDrawer(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)',
              border: '1px solid rgba(6, 182, 212, 0.45)',
              color: 'var(--accent-cyan)',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 0 16px rgba(6, 182, 212, 0.2)',
              transition: 'all 0.2s ease'
            }}
          >
            <span style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: '#10b981',
              boxShadow: '0 0 8px #10b981'
            }} />
            <Briefcase size={14} />
            <span>Live Job Openings</span>
          </button>

          <button
            onClick={onNewPath}
            className="btn btn-secondary"
            style={{ fontSize: '0.78rem', padding: '6px 12px' }}
          >
            <RefreshCw size={13} /> <span>Modify / New</span>
          </button>
        </div>
      </div>

      {/* Main Journey Header Card (Executive Mastery Cockpit) */}
      <div className="clean-panel roadmap-hero-card">
        {/* Ambient Top Light Flare */}
        <div style={{
          position: 'absolute',
          top: '-60px',
          right: '-40px',
          width: '280px',
          height: '280px',
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.12) 0%, rgba(2, 132, 199, 0.05) 50%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          {/* Subtitle Pill / Jewel Badge */}
          <div style={{ marginBottom: '12px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(37, 99, 235, 0.08)',
              color: '#1d4ed8',
              padding: '4px 14px',
              borderRadius: '9999px',
              fontSize: '0.76rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              border: '1px solid rgba(191, 219, 254, 0.9)',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.08)'
            }}>
              <Sparkles size={12} color="#2563eb" />
              {roadmap.subtitle || `Career Acceleration Track • ${roadmap.target_role}`}
            </span>
          </div>

          {/* Title with Royal Sapphire Gradient */}
          <h1 className="font-heading roadmap-hero-title">
            <span style={{
              background: 'linear-gradient(135deg, #0f172a 20%, #1e40af 60%, #0284c7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 2px 8px rgba(37, 99, 235, 0.12))'
            }}>
              {roadmap.title}
            </span>
          </h1>

          {/* Narrative Description */}
          <p className="roadmap-hero-desc">
            {roadmap.overview_narrative || roadmap.skill_gap_summary ||
              `This comprehensive pathway is an end-to-end, industry-aligned career roadmap designed to transform learners from fundamental principles to production-grade architecture, hands-on physical/cloud integration, security standards, and professional readiness.`
            }
          </p>

          {/* Skill Gap & Baseline Chips */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            flexWrap: 'wrap',
            paddingTop: '14px',
            borderTop: '1px solid rgba(226, 232, 240, 0.8)'
          }}>
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>Profile Baseline:</span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(241, 245, 249, 0.85)',
              border: '1px solid rgba(226, 232, 240, 0.9)',
              color: '#1e293b',
              padding: '4px 12px',
              borderRadius: '9999px',
              fontSize: '0.78rem',
              fontWeight: 600
            }}>
              <GraduationCap size={13} color="#2563eb" /> {roadmap.user_profile?.education_level || 'Learner Baseline'}
            </span>
            {roadmap.user_profile?.current_skills?.map((sk, i) => (
              <span key={i} style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: 'rgba(239, 246, 255, 0.85)',
                border: '1px solid rgba(191, 219, 254, 0.85)',
                color: '#1d4ed8',
                padding: '4px 12px',
                borderRadius: '9999px',
                fontSize: '0.78rem',
                fontWeight: 600
              }}>
                {sk}
              </span>
            ))}

            {roadmap.skill_gap_summary && (
              <div style={{
                width: '100%',
                maxWidth: '780px',
                margin: '14px auto 0',
                background: 'rgba(239, 246, 255, 0.75)',
                border: '1px solid rgba(191, 219, 254, 0.9)',
                borderRadius: '12px',
                padding: '12px 18px',
                fontSize: '0.86rem',
                color: '#1e3a8a',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                justifyContent: 'center',
                boxShadow: '0 2px 10px rgba(37, 99, 235, 0.05)'
              }}>
                <TrendingUp size={16} color="#2563eb" style={{ flexShrink: 0 }} />
                <span><strong>Target Delta Focus:</strong> {roadmap.skill_gap_summary}</span>
              </div>
            )}
          </div>
        </div>
      </div>      {/* "Your Progress" Mastery Meter Card */}
      <div className="clean-panel roadmap-progress-card" style={{
        padding: '24px 30px',
        marginBottom: '32px',
        background: 'rgba(255, 255, 255, 0.88)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.95)',
        boxShadow: '0 12px 36px -8px rgba(15, 23, 42, 0.07)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '9px',
              background: progressPct === 100 ? 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)' : 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
              border: `1px solid ${progressPct === 100 ? '#a7f3d0' : '#bfdbfe'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: progressPct === 100 ? '#059669' : '#1d4ed8'
            }}>
              {progressPct === 100 ? <Award size={17} /> : <TrendingUp size={17} />}
            </div>
            <h2 className="font-heading roadmap-progress-title" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Curriculum Mastery Progress
            </h2>
          </div>
          <span className="roadmap-progress-badge" style={{
            fontSize: '0.92rem',
            fontWeight: 800,
            padding: '4px 14px',
            borderRadius: '9999px',
            background: progressPct === 100 ? 'rgba(236, 253, 245, 0.9)' : 'rgba(239, 246, 255, 0.9)',
            border: `1px solid ${progressPct === 100 ? 'rgba(167, 243, 208, 0.9)' : 'rgba(191, 219, 254, 0.9)'}`,
            color: progressPct === 100 ? '#059669' : '#1d4ed8'
          }}>
            {progressPct}% Completed ({completedCount} / {totalCount} Milestones)
          </span>
        </div>

        {/* Multi-Stop Radiant Progress Bar */}
        <div style={{
          width: '100%',
          height: '10px',
          background: 'rgba(226, 232, 240, 0.8)',
          borderRadius: '9999px',
          overflow: 'hidden',
          marginBottom: '16px'
        }}>
          <div style={{
            height: '100%',
            width: `${progressPct}%`,
            background: progressPct === 100
              ? 'linear-gradient(90deg, #059669 0%, #10b981 100%)'
              : 'linear-gradient(90deg, #1d4ed8 0%, #2563eb 40%, #0284c7 70%, #10b981 100%)',
            borderRadius: '9999px',
            boxShadow: progressPct === 100 ? '0 0 12px rgba(16, 185, 129, 0.4)' : '0 0 12px rgba(37, 99, 235, 0.4)',
            transition: 'width 0.4s ease'
          }} />
        </div>

        {/* Meta Stats Row */}
        <div className="roadmap-progress-stats" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          paddingTop: '14px',
          borderTop: '1px solid rgba(226, 232, 240, 0.8)',
          fontSize: '0.84rem',
          color: '#64748b'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={15} color="#2563eb" />
            <span>Estimated Duration: <strong style={{ color: '#0f172a' }}>~{roadmap.total_estimated_hours} total hours</strong></span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Target size={15} color="#0284c7" />
            <span>Target Timeline: <strong style={{ color: '#0f172a' }}>{roadmap.user_profile?.target_timeline || '3-6 Months'}</strong></span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Award size={15} color={progressPct === 100 ? '#059669' : '#94a3b8'} />
            <span>Exam Status: <strong style={{ color: progressPct === 100 ? '#059669' : '#64748b' }}>
              {progressPct === 100 ? (certificate ? 'Certified ✓' : 'Unlocked (Ready for Exam)') : 'Locked until 100%'}
            </strong></span>
          </div>
        </div>
      </div>

      {/* Filter and View Mode Switcher */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '26px'
      }}>
        {/* Phase Filter Buttons */}
        <div className="roadmap-phase-pills" style={{
          display: 'flex',
          background: 'rgba(255, 255, 255, 0.72)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(226, 232, 240, 0.9)',
          borderRadius: '9999px',
          padding: '4px',
          gap: '4px',
          overflowX: 'auto',
          maxWidth: '100%',
          boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch'
        }}>
          {phases.map((phase) => (
            <button
              key={phase}
              onClick={() => setActivePhaseFilter(phase)}
              style={{
                flexShrink: 0,
                padding: '7px 16px',
                borderRadius: '9999px',
                border: 'none',
                background: activePhaseFilter === phase
                  ? 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)'
                  : 'transparent',
                color: activePhaseFilter === phase ? '#ffffff' : '#475569',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.18s ease',
                boxShadow: activePhaseFilter === phase ? '0 3px 12px rgba(37, 99, 235, 0.3)' : 'none'
              }}
            >
              {phase.length > 25 ? `${phase.slice(0, 24)}...` : phase}
            </button>
          ))}
        </div>

        {/* View Mode Toggle: Pathway vs Grid */}
        <div style={{
          display: 'flex',
          background: 'rgba(255, 255, 255, 0.72)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(226, 232, 240, 0.9)',
          borderRadius: '9999px',
          padding: '4px',
          gap: '4px',
          boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)'
        }}>
          <button
            onClick={() => setViewMode('pathway')}
            style={{
              padding: '7px 15px',
              borderRadius: '9999px',
              border: 'none',
              background: viewMode === 'pathway' ? 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)' : 'transparent',
              color: viewMode === 'pathway' ? '#ffffff' : '#64748b',
              boxShadow: viewMode === 'pathway' ? '0 3px 10px rgba(37, 99, 235, 0.3)' : 'none',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.18s ease'
            }}
          >
            <GitFork size={14} />
            <span>Pathway View</span>
          </button>

          <button
            onClick={() => setViewMode('grid')}
            style={{
              padding: '7px 15px',
              borderRadius: '9999px',
              border: 'none',
              background: viewMode === 'grid' ? 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)' : 'transparent',
              color: viewMode === 'grid' ? '#ffffff' : '#64748b',
              boxShadow: viewMode === 'grid' ? '0 3px 10px rgba(37, 99, 235, 0.3)' : 'none',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.18s ease'
            }}
          >
            <LayoutGrid size={14} />
            <span>Grid View</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 1. VISUAL PATHWAY TIMELINE VIEW                                */}
      {/* ============================================================== */}
      {viewMode === 'pathway' && (
        <div className="pathway-container">
          {/* Continuous Center Spine Line */}
          <div className="pathway-spine" />

          {displayedPhases.map((phaseGroup, phaseIdx) => {
            return (
              <div key={phaseGroup.phase || phaseIdx} style={{ position: 'relative' }}>
                {/* Phase Section Header Banner */}
                <div className="pathway-phase-section">
                  <div className="pathway-phase-header-card">
                    <span className="pathway-phase-title">
                      {phaseGroup.phase}
                    </span>
                  </div>
                  {phaseGroup.phase_description && (
                    <p className="pathway-phase-description">
                      {phaseGroup.phase_description}
                    </p>
                  )}
                </div>

                {/* Modules in this Phase (Alternating Zig-Zag) */}
                {phaseGroup.modules.map((module) => {
                  const currentIdx = globalModuleCounter++;
                  const isLeft = currentIdx % 2 === 0;

                  return (
                    <div
                      key={module.id}
                      className={`pathway-row ${isLeft ? 'pathway-row-left' : 'pathway-row-right'}`}
                    >
                      {/* Left or Right Module Card */}
                      <div className="pathway-col">
                        <ModuleCard
                          module={module}
                          onOpenNotes={onOpenNotes}
                          onToggleComplete={onToggleComplete}
                          isPathway={true}
                        />

                        {/* Connector line connecting card edge to center node */}
                        <div
                          className={`pathway-connector ${isLeft ? 'pathway-connector-left' : 'pathway-connector-right'} ${module.is_completed ? 'completed' : ''}`}
                        />
                      </div>

                      {/* Center Node on the Spine */}
                      <div className="pathway-node-anchor">
                        <div className={`pathway-circle-node ${module.is_completed ? 'completed' : ''}`}>
                          {getNodeIcon(module)}
                        </div>
                      </div>

                      {/* Opposite Spacer Column */}
                      <div className="pathway-spacer" />
                    </div>
                  );
                })}
              </div>
            );
          })}

          {/* Final Milestone: Official Certification Assessment Node */}
          <div style={{ position: 'relative', marginTop: '54px' }}>
            {/* Centered Final Milestone Banner */}
            <div className="pathway-phase-section" style={{ marginBottom: '24px' }}>
              <div className="pathway-phase-header-card" style={{
                background: progressPct === 100
                  ? 'rgba(236, 253, 245, 0.95)'
                  : 'rgba(255, 255, 255, 0.92)',
                border: `1px solid ${progressPct === 100
                    ? 'rgba(167, 243, 208, 0.9)'
                    : 'rgba(191, 219, 254, 0.9)'
                  }`,
                boxShadow: progressPct === 100
                  ? '0 10px 30px rgba(16, 185, 129, 0.15)'
                  : '0 10px 30px rgba(37, 99, 235, 0.08)'
              }}>
                <span className="pathway-phase-title" style={{
                  color: progressPct === 100 ? '#059669' : '#1d4ed8',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  justifyContent: 'center',
                  fontSize: '1.05rem',
                  fontWeight: 800
                }}>
                  <Trophy size={18} color={progressPct === 100 ? '#059669' : '#2563eb'} />
                  <span>Capstone Milestone &bull; Official Board Examination</span>
                </span>
              </div>
            </div>

            {/* Central Trophy Node & Card */}
            <div className="pathway-capstone-row" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <div style={{ width: '100%', maxWidth: '840px', margin: '0 auto', position: 'relative', zIndex: 3 }}>
                <div className="clean-panel roadmap-capstone-card" style={{
                  background: progressPct === 100
                    ? (certificate ? 'linear-gradient(135deg, rgba(236, 253, 245, 0.94) 0%, rgba(209, 250, 229, 0.88) 100%)' : 'linear-gradient(135deg, rgba(239, 246, 255, 0.94) 0%, rgba(219, 234, 254, 0.88) 100%)')
                    : 'rgba(255, 255, 255, 0.88)',
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${progressPct === 100
                      ? (certificate ? 'rgba(167, 243, 208, 0.95)' : 'rgba(191, 219, 254, 0.95)')
                      : 'rgba(226, 232, 240, 0.9)'
                    }`,
                  borderRadius: '24px',
                  padding: '32px 34px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '24px',
                  boxShadow: progressPct === 100
                    ? '0 20px 50px -10px rgba(16, 185, 129, 0.2)'
                    : '0 16px 40px -10px rgba(15, 23, 42, 0.08)'
                }}>
                  <div className="pathway-capstone-inner" style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                    <div style={{
                      width: '58px',
                      height: '58px',
                      borderRadius: '16px',
                      background: progressPct === 100
                        ? (certificate ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)')
                        : 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                      color: progressPct === 100 ? '#ffffff' : '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: progressPct === 100 ? '0 8px 24px rgba(16, 185, 129, 0.35)' : 'none'
                    }}>
                      {progressPct === 100 ? (certificate ? <Award size={30} /> : <Unlock size={28} />) : <Lock size={26} />}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                        <span className={`badge ${progressPct === 100
                            ? (certificate ? 'badge-emerald' : 'badge-primary')
                            : 'badge-secondary'
                          }`} style={{ fontSize: '0.74rem' }}>
                          {progressPct === 100
                            ? (certificate ? 'Verified Credential Earned' : 'Examination Ready')
                            : 'Examination Locked'}
                        </span>
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          50 Multiple-Choice Questions &bull; Pass Mark: 30 / 50 (60%)
                        </span>
                      </div>

                      <h3 className="font-heading" style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
                        {certificate
                          ? `Certified in ${roadmap.target_role} (${certificate.score}/50 - ${certificate.percentage}%)`
                          : `${roadmap.target_role} Official Certification Exam`}
                      </h3>

                      <p style={{ fontSize: '0.88rem', color: '#475569', margin: 0, maxWidth: '580px', lineHeight: 1.55 }}>
                        {progressPct === 100
                          ? (certificate
                            ? `Congratulations! You passed the official evaluation. Your verifiable tamper-proof credentials are issued and can be viewed or downloaded anytime.`
                            : `All ${totalCount} pathway milestones completed! The official 50-MCQ evaluation is now unlocked. Score at least 30 marks to earn your official completion certificate.`)
                          : `Complete all ${totalCount} pathway milestones to unlock the final 50-question comprehensive evaluation. Progress: ${completedCount} of ${totalCount} (${progressPct}%).`}
                      </p>
                    </div>
                  </div>

                  <div className="roadmap-capstone-actions">
                    {progressPct === 100 ? (
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        {certificate && (
                          <button
                            onClick={onOpenCertificate}
                            className="btn"
                            style={{
                              fontSize: '0.92rem',
                              padding: '12px 22px',
                              gap: '8px',
                              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                              color: '#ffffff',
                              borderRadius: '12px',
                              boxShadow: '0 6px 18px rgba(16, 185, 129, 0.35)'
                            }}
                          >
                            <Award size={18} />
                            <span>View Certificate</span>
                          </button>
                        )}

                        <button
                          onClick={onOpenAssessment}
                          className={certificate ? "btn btn-secondary" : "btn btn-primary"}
                          style={{ fontSize: '0.92rem', padding: '12px 22px', gap: '8px', borderRadius: '12px' }}
                        >
                          <FileCheck2 size={18} />
                          <span>{certificate ? 'Retake Exam' : 'Take Certification Exam'}</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        disabled
                        className="btn btn-secondary"
                        style={{ fontSize: '0.88rem', padding: '11px 18px', opacity: 0.65, cursor: 'not-allowed', gap: '7px', borderRadius: '11px' }}
                      >
                        <Lock size={15} />
                        <span>Locked ({completedCount}/{totalCount} Completed)</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* 2. CLASSIC GRID VIEW (Optional for quick card scanning)        */}
      {/* ============================================================== */}
      {viewMode === 'grid' && (
        <div>
          {/* Final Exam Bar */}
          <div className="clean-panel" style={{
            padding: '26px 32px',
            marginBottom: '32px',
            background: progressPct === 100
              ? (certificate ? 'linear-gradient(135deg, rgba(236, 253, 245, 0.94) 0%, rgba(209, 250, 229, 0.88) 100%)' : 'linear-gradient(135deg, rgba(239, 246, 255, 0.94) 0%, rgba(219, 234, 254, 0.88) 100%)')
              : 'rgba(255, 255, 255, 0.88)',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${progressPct === 100
                ? (certificate ? 'rgba(167, 243, 208, 0.95)' : 'rgba(191, 219, 254, 0.95)')
                : 'rgba(226, 232, 240, 0.9)'
              }`,
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '20px',
            boxShadow: progressPct === 100 ? '0 16px 36px -6px rgba(16, 185, 129, 0.16)' : '0 10px 30px -5px rgba(15, 23, 42, 0.06)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                background: progressPct === 100
                  ? (certificate ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)')
                  : 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                color: progressPct === 100 ? '#ffffff' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: progressPct === 100 ? '0 6px 18px rgba(16, 185, 129, 0.3)' : 'none'
              }}>
                {progressPct === 100 ? (certificate ? <Award size={26} /> : <Unlock size={24} />) : <Lock size={24} />}
              </div>

              <div>
                <h3 className="font-heading" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
                  {certificate
                    ? `Certified in ${roadmap.target_role} (${certificate.score}/50)`
                    : `${roadmap.target_role} Official Certification Exam`}
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#64748b', margin: 0 }}>
                  {progressPct === 100
                    ? `The final 50-MCQ AI examination is unlocked.`
                    : `Complete all ${totalCount} milestones to unlock.`}
                </p>
              </div>
            </div>

            <div>
              {progressPct === 100 ? (
                <button
                  onClick={onOpenAssessment}
                  className="btn btn-primary"
                  style={{ fontSize: '0.92rem', padding: '11px 22px', gap: '8px', borderRadius: '12px' }}
                >
                  <FileCheck2 size={18} />
                  <span>Take Certification Exam</span>
                </button>
              ) : (
                <button
                  disabled
                  className="btn btn-secondary"
                  style={{ fontSize: '0.88rem', padding: '10px 18px', opacity: 0.65, cursor: 'not-allowed', gap: '6px', borderRadius: '11px' }}
                >
                  <Lock size={15} />
                  <span>Locked</span>
                </button>
              )}
            </div>
          </div>

          {/* Module Cards Grid */}
          <div className="roadmap-modules-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
            gap: '24px'
          }}>
            {filteredModules.map((mod) => (
              <ModuleCard
                key={mod.id}
                module={mod}
                onOpenNotes={onOpenNotes}
                onToggleComplete={onToggleComplete}
                isPathway={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* Live Jobs Slide-over Drawer */}
      {showJobsDrawer && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.78)',
          backdropFilter: 'blur(8px)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'flex-end',
          animation: 'fadeIn 0.2s ease'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '820px',
            height: '100%',
            background: '#f8fafc',
            boxShadow: '-10px 0 40px rgba(15, 23, 42, 0.3)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <LiveJobBoard
              roadmap={roadmap}
              onClose={() => setShowJobsDrawer(false)}
              isDrawer={true}
            />
          </div>
        </div>
      )}

    </div>
  );
}
