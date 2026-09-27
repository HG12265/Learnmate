import React from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Wrench, 
  ArrowRight,
  Code2,
  Award,
  Sparkles,
  Users,
  Compass,
  Cpu
} from 'lucide-react';

export default function ModuleCard({ 
  module, 
  onOpenNotes, 
  onToggleComplete,
  isPathway = false 
}) {
  const getDifficultyBadge = (diff) => {
    switch (diff?.toLowerCase()) {
      case 'beginner': return 'badge-emerald';
      case 'intermediate': return 'badge-cyan';
      case 'advanced': return 'badge-rose';
      default: return 'badge-primary';
    }
  };

  const getCategoryClass = (cat) => {
    const c = String(cat || 'COURSE').toUpperCase();
    if (c.includes('PROJECT')) return 'cat-project';
    if (c.includes('CERT')) return 'cat-certification';
    if (c.includes('SPEC')) return 'cat-specialization';
    if (c.includes('SOFT')) return 'cat-soft-skills';
    return 'cat-course';
  };

  const getCategoryIcon = (cat) => {
    const c = String(cat || 'COURSE').toUpperCase();
    if (c.includes('PROJECT')) return <Wrench size={12} />;
    if (c.includes('CERT')) return <Award size={12} />;
    if (c.includes('SPEC')) return <Sparkles size={12} />;
    if (c.includes('SOFT')) return <Users size={12} />;
    return <BookOpen size={12} />;
  };

  const categoryLabel = module.category_type || 'COURSE';

  return (
    <div 
      className={`pathway-card ${module.is_completed ? 'completed' : ''}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%'
      }}
    >
      <div>
        {/* Top Header Row: Category Badge + Milestone Number */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '12px' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className={`cat-badge ${getCategoryClass(categoryLabel)}`}>
              {getCategoryIcon(categoryLabel)}
              <span>{categoryLabel}</span>
            </span>

            <span style={{ 
              fontSize: '0.75rem', 
              color: 'var(--text-muted)', 
              fontWeight: 700 
            }}>
              #{module.number < 10 ? `0${module.number}` : module.number}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className={`badge ${getDifficultyBadge(module.difficulty)}`} style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
              {module.difficulty}
            </span>
            <span className="badge badge-amber" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
              <Clock size={11} /> {module.estimated_hours}h
            </span>
          </div>
        </div>

        {/* Milestone Title */}
        <h3 style={{ 
          fontSize: '1.18rem', 
          fontWeight: 800, 
          lineHeight: 1.3,
          marginBottom: '8px',
          color: '#0f172a'
        }}>
          {module.title}
        </h3>

        {/* Milestone Description */}
        <p style={{ 
          fontSize: '0.88rem', 
          color: 'var(--text-secondary)', 
          marginBottom: '14px', 
          lineHeight: 1.55 
        }}>
          {module.description}
        </p>

        {/* Core Topics Chips */}
        {module.key_topics && module.key_topics.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <span style={{ 
              fontSize: '0.68rem', 
              color: '#64748b', 
              textTransform: 'uppercase', 
              letterSpacing: '0.05em', 
              display: 'block', 
              marginBottom: '7px', 
              fontWeight: 800 
            }}>
              Curriculum Competencies:
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {module.key_topics.map((topic, i) => (
                <span 
                  key={i}
                  style={{
                    background: 'rgba(241, 245, 249, 0.85)',
                    color: '#334155',
                    border: '1px solid rgba(226, 232, 240, 0.9)',
                    borderRadius: '8px',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    padding: '3px 9px'
                  }}
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Practical Task / Lab Highlight Box */}
        {module.hands_on_project && (
          <div style={{
            background: module.is_completed ? 'rgba(240, 253, 244, 0.9)' : 'rgba(239, 246, 255, 0.85)',
            border: `1px solid ${module.is_completed ? 'rgba(167, 243, 208, 0.95)' : 'rgba(191, 219, 254, 0.9)'}`,
            borderRadius: '12px',
            padding: '12px 14px',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)'
          }}>
            <div style={{
              width: '26px',
              height: '26px',
              borderRadius: '7px',
              background: module.is_completed ? '#dcfce7' : '#dbeafe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginTop: '1px'
            }}>
              <Wrench size={13} color={module.is_completed ? '#15803d' : '#2563eb'} />
            </div>
            <div>
              <span style={{ 
                fontSize: '0.72rem', 
                color: module.is_completed ? '#15803d' : '#1d4ed8', 
                fontWeight: 800, 
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                display: 'block',
                marginBottom: '2px'
              }}>
                Hands-on Lab Task:
              </span>
              <span style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.45 }}>
                {module.hands_on_project}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Card Actions Footer */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '16px',
        borderTop: '1px solid rgba(226, 232, 240, 0.8)',
        marginTop: '8px'
      }}>
        {/* Completion Toggle */}
        <button
          type="button"
          onClick={() => onToggleComplete(module.id, !module.is_completed)}
          style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            cursor: 'pointer',
            color: module.is_completed ? '#059669' : '#64748b',
            fontSize: '0.82rem',
            fontWeight: 700,
            transition: 'color 0.2s',
            padding: '6px 4px'
          }}
        >
          {module.is_completed ? (
            <>
              <CheckCircle2 size={19} color="#059669" />
              <span style={{ color: '#059669' }}>Completed</span>
            </>
          ) : (
            <>
              <Circle size={19} color="#94a3b8" />
              <span>Mark Done</span>
            </>
          )}
        </button>

        {/* Start Learning / Open Notes Button */}
        <button
          type="button"
          onClick={() => onOpenNotes(module)}
          className="btn"
          style={{ 
            fontSize: '0.82rem', 
            padding: '9px 16px',
            gap: '7px',
            borderRadius: '10px',
            fontWeight: 700,
            background: module.is_completed 
              ? 'rgba(255, 255, 255, 0.95)' 
              : 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #0284c7 100%)',
            color: module.is_completed ? '#1e293b' : '#ffffff',
            border: module.is_completed ? '1px solid rgba(203, 213, 225, 0.9)' : 'none',
            boxShadow: module.is_completed ? 'none' : '0 4px 14px rgba(37, 99, 235, 0.35)'
          }}
        >
          <BookOpen size={14} color={module.is_completed ? '#2563eb' : '#ffffff'} />
          <span>{module.has_notes ? 'Study Lab & Notes' : 'Start Learning'}</span>
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}
