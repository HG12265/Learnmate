import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  MapPin, 
  ExternalLink, 
  Building2, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  AlertCircle, 
  Share2, 
  TrendingUp, 
  X 
} from 'lucide-react';
import { api } from '../services/api';

export default function LiveJobBoard({ roadmap, onClose, isDrawer = false }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const targetRole = roadmap?.target_role || roadmap?.career_aspiration || 'Software Engineer';

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      let data;
      if (roadmap?.id) {
        data = await api.getRoadmapJobs(roadmap.id);
      } else {
        data = await api.searchLiveJobs(targetRole);
      }
      setJobs(data.jobs || []);
    } catch (err) {
      console.error('Failed to load course jobs:', err);
      setError('Unable to load job openings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [roadmap?.id]);

  const handleCopyLink = (job) => {
    if (job?.apply_url) {
      navigator.clipboard.writeText(job.apply_url);
      setCopiedId(job.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: '#f8fafc',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      color: '#0f172a'
    }}>
      {/* Clean Minimal Header */}
      <div style={{
        padding: '22px 28px',
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
            border: '1px solid #bfdbfe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#2563eb',
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.12)'
          }}>
            <Briefcase size={22} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h2 style={{
                fontSize: '1.3rem',
                fontWeight: 800,
                color: '#0f172a',
                margin: 0,
                letterSpacing: '-0.02em'
              }}>
                Live Job Openings
              </h2>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                color: '#059669',
                padding: '2px 9px',
                borderRadius: '9999px',
                fontSize: '0.72rem',
                fontWeight: 700
              }}>
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#10b981',
                  boxShadow: '0 0 6px #10b981'
                }} />
                MATCHED TO CURRICULUM
              </span>
            </div>

            <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '3px 0 0' }}>
              Verified career opportunities tailored for <strong style={{ color: '#1d4ed8' }}>{targetRole}</strong>
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            title="Close"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: '#f1f5f9',
              border: '1px solid #e2e8f0',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Jobs List Body */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px 28px',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px'
      }}>
        {/* Loading Skeletons */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[1, 2, 3].map(i => (
              <div
                key={i}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '14px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px'
                }}
              >
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#f1f5f9' }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ width: '45%', height: '18px', background: '#f1f5f9', borderRadius: '4px' }} />
                    <div style={{ width: '30%', height: '14px', background: '#f8fafc', borderRadius: '4px' }} />
                  </div>
                </div>
                <div style={{ width: '80%', height: '14px', background: '#f8fafc', borderRadius: '4px' }} />
              </div>
            ))}
          </div>
        )}

        {/* Error Notice */}
        {!loading && error && (
          <div style={{
            padding: '32px',
            textAlign: 'center',
            background: '#ffffff',
            border: '1px solid #fecaca',
            borderRadius: '14px'
          }}>
            <AlertCircle size={36} color="#ef4444" style={{ margin: '0 auto 10px' }} />
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#991b1b', margin: '0 0 6px' }}>
              Could not load live openings
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 16px' }}>{error}</p>
            <button
              onClick={fetchJobs}
              style={{
                padding: '8px 18px',
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && jobs.length === 0 && (
          <div style={{
            padding: '44px 24px',
            textAlign: 'center',
            background: '#ffffff',
            border: '1px dashed #cbd5e1',
            borderRadius: '14px'
          }}>
            <Briefcase size={36} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#334155', margin: '0 0 6px' }}>
              No openings currently loaded for this course
            </h4>
            <button
              onClick={fetchJobs}
              style={{
                padding: '8px 18px',
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
                marginTop: '12px'
              }}
            >
              Reload Opportunities
            </button>
          </div>
        )}

        {/* Curated Job Cards (2 to 5 strictly relevant jobs) */}
        {!loading && !error && jobs.map(job => {
          const matchScore = job.match_score || 88;
          const matchColor = matchScore >= 90 ? '#059669' : '#0284c7';
          const matchBg = matchScore >= 90 ? '#ecfdf5' : '#f0f9ff';
          const matchBorder = matchScore >= 90 ? '#a7f3d0' : '#bae6fd';

          return (
            <div
              key={job.id}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#93c5fd';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(37, 99, 235, 0.08)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.04)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {/* Header: Company Avatar/Logo, Title, Match Score */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '16px',
                flexWrap: 'wrap'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: 1, minWidth: '260px' }}>
                  {/* Company Initial Badge */}
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '10px',
                    background: '#eff6ff',
                    border: '1px solid #dbeafe',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    color: '#2563eb',
                    fontSize: '1.15rem',
                    flexShrink: 0
                  }}>
                    {job.company?.charAt(0) || 'C'}
                  </div>

                  {/* Title & Company */}
                  <div>
                    <h3 style={{
                      fontSize: '1.15rem',
                      fontWeight: 800,
                      color: '#0f172a',
                      margin: '0 0 6px',
                      lineHeight: 1.3
                    }}>
                      {job.title}
                    </h3>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '12px',
                      fontSize: '0.82rem',
                      color: '#64748b'
                    }}>
                      <span style={{ fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Building2 size={14} color="#64748b" />
                        {job.company}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={13} color="#94a3b8" />
                        {job.location}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={13} color="#94a3b8" />
                        {job.posted_relative}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Match Score Badge */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 12px',
                  borderRadius: '9999px',
                  background: matchBg,
                  border: `1px solid ${matchBorder}`,
                  color: matchColor,
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  flexShrink: 0
                }}>
                  <TrendingUp size={14} />
                  <span>{matchScore}% Course Match</span>
                </div>
              </div>

              {/* Skills Match Tags */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px',
                padding: '10px 14px',
                background: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #f1f5f9'
              }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>
                  Covered in Course:
                </span>
                {job.skills_matched && job.skills_matched.length > 0 ? (
                  job.skills_matched.map(skill => (
                    <span
                      key={skill}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        background: '#ecfdf5',
                        border: '1px solid #a7f3d0',
                        color: '#065f46',
                        fontSize: '0.74rem',
                        fontWeight: 700
                      }}
                    >
                      <CheckCircle2 size={11} color="#059669" />
                      {skill}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                    Foundation aligned
                  </span>
                )}

                {job.skills_bonus && job.skills_bonus.length > 0 && (
                  <>
                    <span style={{ color: '#cbd5e1', margin: '0 2px' }}>•</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>
                      Recommended:
                    </span>
                    {job.skills_bonus.map(bonus => (
                      <span
                        key={bonus}
                        style={{
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: '#f1f5f9',
                          border: '1px solid #e2e8f0',
                          color: '#475569',
                          fontSize: '0.74rem',
                          fontWeight: 600
                        }}
                      >
                        +{bonus}
                      </span>
                    ))}
                  </>
                )}
              </div>

              {/* Description Snippet */}
              {job.description && (
                <p style={{
                  fontSize: '0.84rem',
                  lineHeight: '1.5',
                  color: '#475569',
                  margin: 0
                }}>
                  {job.description}
                </p>
              )}

              {/* Bottom Action Bar */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                paddingTop: '12px',
                borderTop: '1px solid #f1f5f9'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {job.salary && (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: '#059669',
                      background: '#ecfdf5',
                      padding: '3px 10px',
                      borderRadius: '6px',
                      border: '1px solid #a7f3d0'
                    }}>
                      <DollarSign size={13} />
                      {job.salary}
                    </span>
                  )}

                  <span style={{
                    fontSize: '0.76rem',
                    color: '#64748b',
                    background: '#f1f5f9',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0'
                  }}>
                    {job.job_type || 'Full-time'}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => handleCopyLink(job)}
                    title="Copy direct apply link"
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      color: copiedId === job.id ? '#059669' : '#64748b',
                      padding: '8px 12px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Share2 size={13} />
                    <span>{copiedId === job.id ? 'Copied' : 'Share'}</span>
                  </button>

                  <a
                    href={job.apply_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 18px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                      color: '#ffffff',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                      boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.35)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 2px 6px rgba(37, 99, 235, 0.25)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <span>Apply on Portal</span>
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
