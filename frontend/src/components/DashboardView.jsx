import React, { useState, useEffect } from 'react';
import { 
  GitFork, 
  Award, 
  Clock, 
  CheckCircle2, 
  Trash2, 
  ArrowRight, 
  PlusCircle, 
  GraduationCap, 
  Target, 
  Calendar,
  RefreshCw, 
  Trophy, 
  BookOpen, 
  Briefcase,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Compass
} from 'lucide-react';
import { api } from '../services/api';
import LiveJobBoard from './LiveJobBoard';

export default function DashboardView({ 
  user, 
  onSelectRoadmap, 
  onCreateNewPath, 
  onOpenCertificate 
}) {
  const [roadmaps, setRoadmaps] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('paths'); // 'paths' | 'certificates' | 'jobs'
  const [selectedJobRoadmapId, setSelectedJobRoadmapId] = useState(null);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [fetchedRoadmaps, fetchedCerts] = await Promise.all([
        api.getRoadmaps(),
        api.getUserCertificates()
      ]);
      setRoadmaps(Array.isArray(fetchedRoadmaps) ? fetchedRoadmaps : []);
      setCertificates(Array.isArray(fetchedCerts) ? fetchedCerts : []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleDeleteRoadmap = async (e, roadmapId, role) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete your learning pathway for "${role}"?`)) {
      try {
        await api.deleteRoadmap(roadmapId);
        setRoadmaps(prev => prev.filter(r => r.id !== roadmapId));
      } catch (err) {
        alert(`Failed to delete roadmap: ${err.message}`);
      }
    }
  };

  // Compute aggregate user statistics
  const totalPaths = roadmaps.length;
  const totalCompletedModules = roadmaps.reduce((acc, r) => acc + (r.completed_modules || 0), 0);
  const totalModules = roadmaps.reduce((acc, r) => acc + (r.total_modules || r.modules?.length || 0), 0);
  const totalHours = roadmaps.reduce((acc, r) => acc + (r.total_estimated_hours || 0), 0);
  const overallPct = totalModules > 0 ? Math.round((totalCompletedModules / totalModules) * 100) : 0;
  const totalCertificates = certificates.length;

  return (
    <div className="dashboard-container">
      
      {/* ============================================================== */}
      {/* Executive Learner Command Center Hero                          */}
      {/* ============================================================== */}
      <div className="dashboard-hero-panel">
        {/* Ambient Top Light Beam */}
        <div style={{
          position: 'absolute',
          top: '-60px',
          right: '-40px',
          width: '260px',
          height: '260px',
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.12) 0%, rgba(2, 132, 199, 0.05) 50%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }} />

        <div className="dashboard-hero-inner">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                borderRadius: '9999px',
                background: 'rgba(37, 99, 235, 0.08)',
                color: '#1d4ed8',
                border: '1px solid rgba(191, 219, 254, 0.8)',
                fontSize: '0.74rem',
                fontWeight: 800,
                letterSpacing: '0.04em',
                textTransform: 'uppercase'
              }}>
                <Sparkles size={12} color="#2563eb" /> Learner Command Center
              </span>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Account: <strong style={{ color: '#0f172a' }}>{user?.email || 'Active Learner'}</strong>
              </span>
            </div>

            <h1 className="font-heading dashboard-hero-title">
              Welcome back, <span style={{
                background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #0284c7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>{user?.name || 'Explorer'}</span>! 👋
            </h1>

            <p className="dashboard-hero-subtitle">
              Track your personalized pathways, pick up exactly where you left off, review completed modules in deep AI study labs, and validate your real credentials.
            </p>

            {/* Profile info badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '14px' }}>
              <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700 }}>Profile Baseline:</span>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(241, 245, 249, 0.85)',
                border: '1px solid rgba(226, 232, 240, 0.9)',
                color: '#1e293b',
                padding: '3px 10px',
                borderRadius: '9999px',
                fontSize: '0.74rem',
                fontWeight: 600
              }}>
                <GraduationCap size={13} color="#2563eb" /> {user?.education || 'Graduate'}
              </span>
              {user?.target_role && (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(239, 246, 255, 0.85)',
                  border: '1px solid rgba(191, 219, 254, 0.9)',
                  color: '#1d4ed8',
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  fontSize: '0.74rem',
                  fontWeight: 700
                }}>
                  <Target size={13} /> Target: {user.target_role}
                </span>
              )}
            </div>
          </div>

          <div>
            <button
              onClick={onCreateNewPath}
              className="btn btn-primary dashboard-create-btn"
            >
              <PlusCircle size={18} />
              <span>Create New Pathway</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4 Frosted Glass Stat Jewels (2x2 on Mobile, 4x1 on Desktop)    */}
      {/* ============================================================== */}
      <div className="dashboard-stats-grid">
        {/* Stat 1: Active Roadmaps */}
        <div className="dashboard-stat-card">
          <div className="dashboard-stat-header">
            <span className="dashboard-stat-label">
              Active Pathways
            </span>
            <div className="dashboard-stat-icon-box" style={{ 
              background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', 
              border: '1px solid #bfdbfe',
              color: '#1d4ed8', 
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.15)'
            }}>
              <GitFork size={17} />
            </div>
          </div>
          <div className="font-heading dashboard-stat-number">
            {totalPaths}
          </div>
          <div className="dashboard-stat-subtext">
            Custom career tracks
          </div>
        </div>

        {/* Stat 2: Modules Completed */}
        <div className="dashboard-stat-card">
          <div className="dashboard-stat-header">
            <span className="dashboard-stat-label">
              Mastery
            </span>
            <div className="dashboard-stat-icon-box" style={{ 
              background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', 
              border: '1px solid #a7f3d0',
              color: '#059669', 
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)'
            }}>
              <CheckCircle2 size={17} />
            </div>
          </div>
          <div className="font-heading dashboard-stat-number">
            {totalCompletedModules} <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#94a3b8' }}>/ {totalModules}</span>
          </div>
          <div className="dashboard-stat-subtext">
            <strong style={{ color: '#059669' }}>{overallPct}%</strong> milestones done
          </div>
        </div>

        {/* Stat 3: Certificates */}
        <div className="dashboard-stat-card">
          <div className="dashboard-stat-header">
            <span className="dashboard-stat-label">
              Credentials
            </span>
            <div className="dashboard-stat-icon-box" style={{ 
              background: 'linear-gradient(135deg, #fefce8 0%, #fef08a 100%)', 
              border: '1px solid #fde047',
              color: '#d97706', 
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.18)'
            }}>
              <Trophy size={17} />
            </div>
          </div>
          <div className="font-heading dashboard-stat-number" style={{ color: totalCertificates > 0 ? '#d97706' : '#0f172a' }}>
            {totalCertificates}
          </div>
          <div className="dashboard-stat-subtext">
            {totalCertificates > 0 ? 'Official earned' : 'Complete 100% to earn'}
          </div>
        </div>

        {/* Stat 4: Total Study Hours */}
        <div className="dashboard-stat-card">
          <div className="dashboard-stat-header">
            <span className="dashboard-stat-label">
              Duration
            </span>
            <div className="dashboard-stat-icon-box" style={{ 
              background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', 
              border: '1px solid #bae6fd',
              color: '#0284c7', 
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.15)'
            }}>
              <Clock size={17} />
            </div>
          </div>
          <div className="font-heading dashboard-stat-number">
            ~{totalHours}h
          </div>
          <div className="dashboard-stat-subtext">
            Structured study content
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* Floating Modern Tab Switcher                                   */}
      {/* ============================================================== */}
      <div className="dashboard-tabs-bar">
        <div className="dashboard-tabs-scroll">
          <button
            onClick={() => setActiveTab('paths')}
            className="dashboard-tab-btn"
            style={{
              background: activeTab === 'paths' ? 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)' : 'transparent',
              color: activeTab === 'paths' ? '#ffffff' : '#475569',
              boxShadow: activeTab === 'paths' ? '0 4px 14px rgba(37, 99, 235, 0.3)' : 'none'
            }}
          >
            <GitFork size={15} />
            <span className="dashboard-tab-text-full">My Learning Pathways ({roadmaps.length})</span>
            <span className="dashboard-tab-text-short">Pathways ({roadmaps.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('certificates')}
            className="dashboard-tab-btn"
            style={{
              background: activeTab === 'certificates' ? 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)' : 'transparent',
              color: activeTab === 'certificates' ? '#ffffff' : '#475569',
              boxShadow: activeTab === 'certificates' ? '0 4px 14px rgba(37, 99, 235, 0.3)' : 'none'
            }}
          >
            <Award size={15} />
            <span className="dashboard-tab-text-full">Verified Certificates ({certificates.length})</span>
            <span className="dashboard-tab-text-short">Certificates ({certificates.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('jobs')}
            className="dashboard-tab-btn"
            style={{
              background: activeTab === 'jobs' ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : 'transparent',
              color: activeTab === 'jobs' ? '#ffffff' : '#475569',
              boxShadow: activeTab === 'jobs' ? '0 4px 14px rgba(2, 132, 199, 0.3)' : 'none'
            }}
          >
            <Briefcase size={15} />
            <span className="dashboard-tab-text-full">Live Job Radar</span>
            <span className="dashboard-tab-text-short">Job Radar</span>
            <span style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: '#10b981',
              boxShadow: '0 0 6px #10b981'
            }} />
          </button>
        </div>

        <button
          onClick={loadDashboardData}
          className="btn btn-secondary dashboard-refresh-btn"
          title="Refresh Data"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          <span className="dashboard-tab-text-full">Refresh</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: SAVED LEARNING PATHWAYS                                 */}
      {/* ============================================================== */}
      {activeTab === 'paths' && (
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <RefreshCw size={28} className="animate-spin" color="var(--primary)" style={{ margin: '0 auto 12px' }} />
              <p style={{ color: '#64748b' }}>Loading your saved career pathways...</p>
            </div>
          ) : roadmaps.length === 0 ? (
            <div className="clean-panel" style={{ textAlign: 'center', padding: '60px 24px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                boxShadow: '0 4px 16px rgba(37, 99, 235, 0.2)'
              }}>
                <Compass size={32} />
              </div>
              <h3 className="font-heading" style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                No Career Pathways Yet
              </h3>
              <p style={{ color: '#64748b', maxWidth: '480px', margin: '0 auto 20px', fontSize: '0.94rem' }}>
                Tell us your target career goal and educational background, and our AI will build an ultra-detailed, step-by-step pathway for you.
              </p>
              <button onClick={onCreateNewPath} className="btn btn-primary" style={{ padding: '12px 26px', borderRadius: '12px' }}>
                <PlusCircle size={18} />
                <span>Create Your First Pathway</span>
              </button>
            </div>
          ) : (
            <div className="dashboard-pathways-grid">
              {roadmaps.map((rm) => {
                const completed = rm.completed_modules || rm.modules?.filter(m => m.is_completed).length || 0;
                const total = rm.total_modules || rm.modules?.length || 1;
                const pct = rm.progress_percentage ?? Math.round((completed / total) * 100);

                return (
                  <div 
                    key={rm.id}
                    className="dashboard-pathway-card"
                    onClick={() => onSelectRoadmap(rm.id)}
                  >
                    <div>
                      {/* Top Row: Target Role Badge + Delete */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '3px 10px',
                          borderRadius: '9999px',
                          background: pct === 100 ? '#ecfdf5' : '#eff6ff',
                          color: pct === 100 ? '#059669' : '#1d4ed8',
                          border: pct === 100 ? '1px solid #a7f3d0' : '1px solid #bfdbfe'
                        }}>
                          <Target size={11} /> {rm.target_role}
                        </span>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            padding: '3px 9px',
                            borderRadius: '9999px',
                            background: pct === 100 ? '#ecfdf5' : '#eff6ff',
                            color: pct === 100 ? '#059669' : '#1d4ed8',
                            border: pct === 100 ? '1px solid #a7f3d0' : '1px solid #bfdbfe'
                          }}>
                            {pct === 100 ? 'Completed ✓' : 'In Progress'}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteRoadmap(e, rm.id, rm.target_role)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#94a3b8',
                              padding: '5px',
                              cursor: 'pointer',
                              borderRadius: '6px',
                              transition: 'color 0.15s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                            title="Delete Pathway"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="font-heading dashboard-pathway-title">
                        {rm.title}
                      </h3>

                      {/* Summary / Narrative */}
                      <p className="dashboard-pathway-desc">
                        {rm.overview_narrative || rm.skill_gap_summary || 'Comprehensive structured career roadmap.'}
                      </p>

                      {/* Progress Bar */}
                      <div style={{ marginBottom: '14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700, marginBottom: '6px' }}>
                          <span style={{ color: '#475569' }}>Progress</span>
                          <span style={{ color: pct === 100 ? '#059669' : '#2563eb' }}>
                            {pct}% ({completed}/{total} Milestones)
                          </span>
                        </div>
                        <div style={{
                          width: '100%',
                          height: '7px',
                          background: 'rgba(226, 232, 240, 0.8)',
                          borderRadius: '9999px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            height: '100%',
                            width: `${pct}%`,
                            background: pct === 100 
                              ? 'linear-gradient(90deg, #059669 0%, #10b981 100%)' 
                              : 'linear-gradient(90deg, #1d4ed8 0%, #0284c7 100%)',
                            borderRadius: '9999px',
                            transition: 'width 0.4s ease'
                          }} />
                        </div>
                      </div>

                      {/* Meta Tags */}
                      <div className="dashboard-pathway-meta">
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Clock size={13} color="#2563eb" /> ~{rm.total_estimated_hours || 120}h total
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Calendar size={13} color="#059669" /> {rm.user_profile?.target_timeline || '3-6 Months'}
                        </span>
                      </div>
                    </div>

                    {/* Card Action Button */}
                    <div style={{ paddingTop: '12px', borderTop: '1px solid rgba(226, 232, 240, 0.7)' }}>
                      <button
                        type="button"
                        onClick={() => onSelectRoadmap(rm.id)}
                        className="btn dashboard-pathway-btn"
                        style={{ 
                          background: pct === 100 
                            ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)' 
                            : 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #0284c7 100%)',
                          boxShadow: pct === 100 ? '0 4px 14px rgba(16, 185, 129, 0.3)' : '0 4px 14px rgba(37, 99, 235, 0.32)'
                        }}
                      >
                        <BookOpen size={15} />
                        <span>Continue Learning Pathway</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: VERIFIED CERTIFICATES                                   */}
      {/* ============================================================== */}
      {activeTab === 'certificates' && (
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <RefreshCw size={28} className="animate-spin" color="var(--primary)" style={{ margin: '0 auto 12px' }} />
              <p style={{ color: '#64748b' }}>Checking verified certificates...</p>
            </div>
          ) : certificates.length === 0 ? (
            <div className="clean-panel" style={{ textAlign: 'center', padding: '60px 24px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #fefce8 0%, #fef08a 100%)',
                border: '1px solid #fde047',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                boxShadow: '0 4px 16px rgba(245, 158, 11, 0.2)'
              }}>
                <Award size={32} />
              </div>
              <h3 className="font-heading" style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                No Certificates Earned Yet
              </h3>
              <p style={{ color: '#64748b', maxWidth: '520px', margin: '0 auto 20px', fontSize: '0.94rem', lineHeight: 1.55 }}>
                Complete 100% of all milestones in any learning pathway to unlock the official 50-MCQ AI examination. Scoring 30/50 (60%) or higher awards you a verified Certificate of Mastery!
              </p>
              <button 
                onClick={() => setActiveTab('paths')} 
                className="btn btn-primary" 
                style={{ padding: '11px 24px', borderRadius: '11px' }}
              >
                <span>View Active Pathways</span>
                <ArrowRight size={15} />
              </button>
            </div>
          ) : (
            <div className="dashboard-pathways-grid">
              {certificates.map((cert) => (
                <div
                  key={cert.id || cert.verification_code}
                  className="dashboard-pathway-card"
                  style={{
                    border: '1px solid rgba(167, 243, 208, 0.9)'
                  }}
                >
                  <div>
                    {/* Top Row: Ribbon Badge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        padding: '4px 12px',
                        borderRadius: '9999px',
                        background: '#ecfdf5',
                        color: '#059669',
                        border: '1px solid #a7f3d0'
                      }}>
                        <ShieldCheck size={14} /> Official Verified
                      </span>
                      <span style={{ fontSize: '0.78rem', color: '#64748b', fontFamily: 'monospace', fontWeight: 600 }}>
                        ID: {cert.verification_code}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                      <img 
                        src="/learnmate_icon.png" 
                        alt="LearnMate Crest" 
                        style={{ width: '42px', height: '42px', objectFit: 'contain' }} 
                      />
                      <div>
                        <h3 className="font-heading" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                          {cert.target_role}
                        </h3>
                        <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '2px 0 0' }}>
                          Course: <strong>{cert.course_title}</strong>
                        </p>
                      </div>
                    </div>

                    {/* Score Bar */}
                    <div style={{
                      background: 'rgba(240, 253, 244, 0.7)',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      border: '1px solid #bbf7d0',
                      marginBottom: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#15803d' }}>
                        Examination Score: {cert.score} / {cert.total || 50} ({cert.percentage}%)
                      </span>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        background: '#15803d',
                        color: '#ffffff',
                        padding: '2px 8px',
                        borderRadius: '9999px'
                      }}>
                        PASSED
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenCertificate(cert)}
                    className="btn"
                    style={{
                      width: '100%',
                      padding: '11px',
                      borderRadius: '11px',
                      background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)'
                    }}
                  >
                    <Trophy size={16} />
                    <span>View Official Certificate & Badge</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: LIVE JOB RADAR                                          */}
      {/* ============================================================== */}
      {activeTab === 'jobs' && (
        <div>
          {/* Target Role Selector for Live Jobs */}
          {roadmaps.length > 0 && (
            <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>
                Select Career Pathway:
              </span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {roadmaps.map((rm) => {
                  const isSelected = (selectedJobRoadmapId || roadmaps[0]?.id) === rm.id;
                  return (
                    <button
                      key={rm.id}
                      onClick={() => setSelectedJobRoadmapId(rm.id)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '9999px',
                        border: 'none',
                        background: isSelected ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : 'rgba(255, 255, 255, 0.85)',
                        color: isSelected ? '#ffffff' : '#334155',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: isSelected ? '0 2px 8px rgba(2, 132, 199, 0.3)' : '0 1px 3px rgba(0,0,0,0.06)'
                      }}
                    >
                      {rm.target_role}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Embedded Live Job Board for selected roadmap */}
          <LiveJobBoard 
            roadmapId={selectedJobRoadmapId || roadmaps[0]?.id}
            targetRole={
              roadmaps.find(r => r.id === (selectedJobRoadmapId || roadmaps[0]?.id))?.target_role || 
              user?.target_role || 
              'Software Engineer'
            }
          />
        </div>
      )}

    </div>
  );
}
