import React from 'react';
import { X, Trash2, ArrowRight, FolderHeart, Calendar, Clock, CheckCircle2 } from 'lucide-react';

export default function SavedRoadmaps({ 
  isOpen, 
  onClose, 
  roadmaps, 
  onSelectRoadmap, 
  onDeleteRoadmap 
}) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 90,
      background: 'rgba(5, 7, 12, 0.7)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      justifyContent: 'flex-end'
    }}>
      <div className="glass-panel animate-fade-in" style={{
        width: '100%',
        maxWidth: '480px',
        height: '100vh',
        borderRadius: 0,
        borderLeft: '1px solid rgba(99, 102, 241, 0.25)',
        background: 'rgba(10, 14, 23, 0.95)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.7)'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid var(--border-glass)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FolderHeart size={22} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
              Saved Learning Pathways ({roadmaps?.length || 0})
            </h3>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: 'none',
              color: 'var(--text-secondary)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* List of roadmaps */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          {roadmaps?.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <FolderHeart size={44} style={{ margin: '0 auto 14px', opacity: 0.4 }} />
              <p style={{ fontSize: '0.95rem', marginBottom: '8px' }}>No saved paths yet!</p>
              <p style={{ fontSize: '0.8rem' }}>
                Fill out the questionnaire to generate your first AI-tailored career path.
              </p>
            </div>
          ) : (
            roadmaps?.map((rm) => {
              const completed = rm.completed_modules || 0;
              const total = rm.total_modules || rm.modules?.length || 1;
              const pct = rm.progress_percentage ?? Math.round((completed / total) * 100);

              return (
                <div
                  key={rm.id}
                  style={{
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: 'var(--radius-md)',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    transition: 'all 0.2s'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
                        {rm.target_role}
                      </h4>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete path for ${rm.target_role}?`)) {
                            onDeleteRoadmap(rm.id);
                          }
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: '4px'
                        }}
                        title="Delete path"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0 0 8px' }}>
                      {rm.title}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} /> {rm.total_estimated_hours}h
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={12} color="var(--accent-emerald)" /> {completed}/{total} modules
                      </span>
                    </div>
                  </div>

                  {/* Progress Line */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Mastery</span>
                      <span style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>{pct}%</span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '6px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      borderRadius: 'var(--radius-full)',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${pct}%`,
                        background: 'var(--primary-gradient)',
                        borderRadius: 'var(--radius-full)'
                      }} />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onSelectRoadmap(rm);
                      onClose();
                    }}
                    className="btn btn-secondary"
                    style={{
                      width: '100%',
                      padding: '8px',
                      fontSize: '0.82rem',
                      justifyContent: 'center'
                    }}
                  >
                    <span>Continue Learning</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
