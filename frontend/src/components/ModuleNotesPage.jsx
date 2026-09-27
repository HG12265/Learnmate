import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Clock,
  Copy,
  Check,
  RefreshCw,
  Send,
  MessageSquare,
  Sparkles,
  Code2,
  Wrench,
  BookOpen,
  Bot,
  Download
} from 'lucide-react';
import { api } from '../services/api';
import confetti from 'canvas-confetti';
import MarkdownContent from './MarkdownContent';
import ChatMarkdown from './ChatMarkdown';

export default function ModuleNotesPage({
  module,
  roadmapId,
  onBack,
  onToggleComplete
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notes, setNotes] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);

  // Chatbot State
  const [mentorQuestion, setMentorQuestion] = useState('');
  const [mentorLoading, setMentorLoading] = useState(false);
  const [mentorChatHistory, setMentorChatHistory] = useState([]);
  const [copiedChatIndex, setCopiedChatIndex] = useState(null);

  useEffect(() => {
    if (module && roadmapId) {
      loadNotes(false);
      setMentorChatHistory([]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [module?.id, roadmapId]);

  const loadNotes = async (forceRefresh = false) => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getModuleNotes(roadmapId, module.id, forceRefresh);
      setNotes(data);
    } catch (err) {
      setError(err.message || 'Failed to load module notes');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (code, index) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyChat = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedChatIndex(index);
    setTimeout(() => setCopiedChatIndex(null), 2000);
  };

  const handleAskMentor = async (e) => {
    e?.preventDefault();
    if (!mentorQuestion.trim() || mentorLoading) return;

    const q = mentorQuestion.trim();
    setMentorQuestion('');
    const newChat = [...mentorChatHistory, { sender: 'user', text: q }];
    setMentorChatHistory(newChat);
    setMentorLoading(true);

    try {
      const res = await api.askMentor(roadmapId, module.id, q, notes?.overview || module.description);
      setMentorChatHistory([
        ...newChat,
        {
          sender: 'mentor',
          text: res.answer,
          followups: res.suggested_followups || []
        }
      ]);
    } catch (err) {
      setMentorChatHistory([
        ...newChat,
        {
          sender: 'mentor',
          text: 'There was an issue answering your question. Please try asking again.'
        }
      ]);
    } finally {
      setMentorLoading(false);
    }
  };

  const handleMarkComplete = () => {
    const newState = !module.is_completed;
    onToggleComplete(module.id, newState);
    if (newState) {
      confetti({ particleCount: 70, spread: 60 });
    }
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 24px 80px' }}>

      {/* Top Navigation Bar (Frosted Glass Executive Bar) */}
      <div className="clean-panel" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '32px',
        padding: '16px 24px',
        background: 'rgba(255, 255, 255, 0.88)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.95)',
        boxShadow: '0 10px 30px -5px rgba(15, 23, 42, 0.06)',
        borderRadius: '20px',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        <button
          onClick={onBack}
          className="btn btn-secondary"
          style={{
            fontSize: '0.86rem',
            padding: '8px 16px',
            gap: '8px',
            borderRadius: '9999px',
            background: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid rgba(226, 232, 240, 0.9)'
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Roadmap</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 14px',
            borderRadius: '9999px',
            background: 'rgba(37, 99, 235, 0.08)',
            color: '#1d4ed8',
            border: '1px solid rgba(191, 219, 254, 0.9)',
            fontSize: '0.78rem',
            fontWeight: 800,
            letterSpacing: '0.03em'
          }}>
            <Sparkles size={12} color="#2563eb" /> Module #{module.number < 10 ? `0${module.number}` : module.number}
          </span>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '5px 14px',
            borderRadius: '9999px',
            background: 'rgba(240, 249, 255, 0.85)',
            color: '#0284c7',
            border: '1px solid rgba(186, 230, 253, 0.9)',
            fontSize: '0.78rem',
            fontWeight: 700
          }}>
            {module.phase}
          </span>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '5px 14px',
            borderRadius: '9999px',
            background: 'rgba(254, 252, 232, 0.85)',
            color: '#d97706',
            border: '1px solid rgba(254, 240, 138, 0.9)',
            fontSize: '0.78rem',
            fontWeight: 700
          }}>
            <Clock size={12} /> {module.estimated_hours} Hours
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handleDownloadPDF}
            disabled={loading || !notes}
            className="btn btn-secondary"
            title="Download Notes as PDF"
            style={{
              fontSize: '0.82rem',
              padding: '8px 14px',
              gap: '6px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid rgba(226, 232, 240, 0.9)'
            }}
          >
            <Download size={14} color="#2563eb" />
            <span>Download PDF</span>
          </button>

          <button
            onClick={() => loadNotes(true)}
            disabled={loading}
            className="btn btn-secondary"
            title="Regenerate notes"
            style={{
              fontSize: '0.82rem',
              padding: '8px 13px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid rgba(226, 232, 240, 0.9)'
            }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Regenerate</span>
          </button>

          <button
            onClick={handleMarkComplete}
            className="btn"
            style={{
              fontSize: '0.86rem',
              padding: '9px 18px',
              borderRadius: '10px',
              fontWeight: 700,
              gap: '7px',
              background: module.is_completed
                ? 'rgba(236, 253, 245, 0.95)'
                : 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              color: module.is_completed ? '#059669' : '#ffffff',
              border: module.is_completed ? '1px solid rgba(167, 243, 208, 0.95)' : 'none',
              boxShadow: module.is_completed ? 'none' : '0 4px 14px rgba(16, 185, 129, 0.35)'
            }}
          >
            {module.is_completed ? (
              <>
                <CheckCircle2 size={16} color="#059669" />
                <span>Completed ✓</span>
              </>
            ) : (
              <>
                <Circle size={16} color="#ffffff" />
                <span>Mark as Completed</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid: Content (Left) + Side Chatbot (Right) */}
      <div className="notes-main-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 420px',
        gap: '32px',
        alignItems: 'start'
      }}>

        {/* LEFT COLUMN: Clean In-depth Content */}
        <div className="notes-content-col">
          {/* Print-Only Professional Document Header */}
          <div className="print-only" style={{
            display: 'none',
            marginBottom: '28px',
            paddingBottom: '16px',
            borderBottom: '3px solid #0f172a'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
                  LEARNMATE
                </h1>
                <p style={{ fontSize: '0.85rem', color: '#475569', margin: 0, fontWeight: 600 }}>
                  Official Curriculum Study Notes & Hands-on Lab Guide
                </p>
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.82rem', color: '#334155' }}>
                <div><strong>Module {module.number}:</strong> {module.title}</div>
                <div><strong>Phase:</strong> {module.phase} &bull; <strong>Study Time:</strong> {module.estimated_hours} Hours</div>
              </div>
            </div>
          </div>
          {loading ? (
            <div className="clean-panel" style={{
              padding: '60px 30px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px'
            }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                border: '3px solid var(--primary-light)',
                borderTopColor: 'var(--primary)',
                animation: 'spin 1s linear infinite'
              }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>
                Generating Comprehensive Module Notes & Examples...
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                Analyzing curriculum requirements and synthesizing structured notes in your selected language.
              </p>
            </div>
          ) : error ? (
            <div style={{
              background: '#fff1f2',
              border: '1px solid #fecdd3',
              borderRadius: 'var(--radius-md)',
              padding: '24px',
              textAlign: 'center'
            }}>
              <p style={{ color: '#be123c', marginBottom: '14px' }}>{error}</p>
              <button onClick={() => loadNotes(true)} className="btn btn-primary">
                Try Again
              </button>
            </div>
          ) : notes ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              {/* Module Header Title */}
              <div>
                <h1 className="font-heading" style={{
                  fontSize: 'clamp(2rem, 3.8vw, 2.6rem)',
                  fontWeight: 900,
                  color: '#0f172a',
                  lineHeight: 1.2,
                  marginBottom: '16px',
                  letterSpacing: '-0.025em'
                }}>
                  <span style={{
                    background: 'linear-gradient(135deg, #0f172a 20%, #1e40af 60%, #0284c7 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    {notes.title || module.title}
                  </span>
                </h1>

                {/* Summary Card */}
                {notes.overview && (
                  <div style={{
                    background: 'rgba(239, 246, 255, 0.85)',
                    border: '1px solid rgba(191, 219, 254, 0.9)',
                    borderLeft: '5px solid #2563eb',
                    borderRadius: '16px',
                    padding: '18px 22px',
                    fontSize: '0.98rem',
                    color: '#1e3a8a',
                    lineHeight: 1.65,
                    boxShadow: '0 4px 16px rgba(37, 99, 235, 0.05)'
                  }}>
                    <strong style={{ color: '#1e40af', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', fontSize: '0.84rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      <Sparkles size={14} color="#2563eb" /> Module Executive Brief:
                    </strong>
                    <p style={{ margin: 0, color: '#334155' }}>{notes.overview}</p>
                  </div>
                )}
              </div>

              {/* Main Learning Content / Theory */}
              <div className="clean-panel" style={{
                padding: '36px',
                background: 'rgba(255, 255, 255, 0.88)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.95)',
                boxShadow: '0 12px 36px -8px rgba(15, 23, 42, 0.06)',
                borderRadius: '24px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '22px', paddingBottom: '14px', borderBottom: '1px solid rgba(226, 232, 240, 0.8)' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                    border: '1px solid #bfdbfe',
                    color: '#1d4ed8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.12)'
                  }}>
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      01 &bull; Core Theory & Foundations
                    </span>
                    <h2 className="font-heading" style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '2px 0 0' }}>
                      Conceptual Breakdown
                    </h2>
                  </div>
                </div>

                <MarkdownContent content={notes.deep_theory_markdown} />
              </div>

              {/* Practical Examples (macOS Terminal Style) */}
              {notes.code_snippets?.length > 0 && (
                <div className="clean-panel" style={{
                  padding: '36px',
                  background: 'rgba(255, 255, 255, 0.88)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.95)',
                  boxShadow: '0 12px 36px -8px rgba(15, 23, 42, 0.06)',
                  borderRadius: '24px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '22px', paddingBottom: '14px', borderBottom: '1px solid rgba(226, 232, 240, 0.8)' }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                      border: '1px solid #bae6fd',
                      color: '#0284c7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(2, 132, 199, 0.12)'
                    }}>
                      <Code2 size={20} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        02 &bull; Production Code Lab
                      </span>
                      <h2 className="font-heading" style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '2px 0 0' }}>
                        Practical Implementations
                      </h2>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {notes.code_snippets.map((snippet, idx) => (
                      <div key={idx} style={{
                        background: '#090d16',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        boxShadow: '0 12px 30px -5px rgba(15, 23, 42, 0.25)',
                        border: '1px solid #1e293b'
                      }}>
                        {/* macOS Header Bar */}
                        <div style={{
                          padding: '12px 18px',
                          background: '#131b2e',
                          borderBottom: '1px solid #1e293b',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {/* macOS Window Control Dots */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
                              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
                              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                            </div>

                            <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#e2e8f0', letterSpacing: '-0.01em' }}>
                              {snippet.title}
                            </span>
                          </div>

                          <button
                            onClick={() => handleCopyCode(snippet.code, idx)}
                            style={{
                              background: 'rgba(51, 65, 85, 0.8)',
                              border: '1px solid rgba(71, 85, 105, 0.8)',
                              color: '#ffffff',
                              padding: '5px 12px',
                              borderRadius: '8px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            {copiedIndex === idx ? (
                              <>
                                <Check size={13} color="#4ade80" />
                                <span style={{ color: '#4ade80' }}>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy size={13} />
                                <span>Copy Code</span>
                              </>
                            )}
                          </button>
                        </div>

                        <pre style={{
                          padding: '20px 22px',
                          margin: 0,
                          overflowX: 'auto',
                          fontSize: '0.9rem',
                          lineHeight: 1.65,
                          color: '#93c5fd',
                          background: '#090d16',
                          fontFamily: 'Fira Code, monospace',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word'
                        }}>
                          <code>{snippet.code}</code>
                        </pre>

                        {snippet.explanation && (
                          <div style={{
                            padding: '14px 20px',
                            background: '#0f172a',
                            borderTop: '1px solid #1e293b',
                            fontSize: '0.84rem',
                            color: '#94a3b8',
                            lineHeight: 1.55
                          }}>
                            <strong style={{ color: '#e2e8f0' }}>Code Breakdown: </strong>
                            {snippet.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Practical Hands-on Challenge */}
              {notes.practical_lab_task && (
                <div className="clean-panel" style={{
                  padding: '36px',
                  background: 'rgba(255, 255, 255, 0.88)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.95)',
                  boxShadow: '0 12px 36px -8px rgba(15, 23, 42, 0.06)',
                  borderRadius: '24px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid rgba(226, 232, 240, 0.8)' }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                      border: '1px solid #a7f3d0',
                      color: '#059669',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(16, 185, 129, 0.12)'
                    }}>
                      <Wrench size={20} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        03 &bull; Hands-on Blueprint
                      </span>
                      <h2 className="font-heading" style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '2px 0 0' }}>
                        Applied Lab Challenge
                      </h2>
                    </div>
                  </div>

                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '14px' }}>
                    {notes.practical_lab_task.task_title}
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                    {notes.practical_lab_task.instructions?.map((step, sIdx) => (
                      <div key={sIdx} style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        background: 'rgba(248, 250, 252, 0.85)',
                        padding: '12px 18px',
                        borderRadius: '12px',
                        border: '1px solid rgba(226, 232, 240, 0.9)'
                      }}>
                        <span style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.76rem',
                          fontWeight: 800,
                          flexShrink: 0
                        }}>
                          {sIdx + 1}
                        </span>
                        <span style={{ fontSize: '0.92rem', color: '#1e293b', marginTop: '2px', lineHeight: 1.5 }}>
                          {step}
                        </span>
                      </div>
                    ))}
                  </div>

                  {notes.practical_lab_task.expected_output && (
                    <div style={{
                      background: 'rgba(236, 253, 245, 0.85)',
                      border: '1px solid rgba(167, 243, 208, 0.95)',
                      borderRadius: '14px',
                      padding: '16px 20px',
                      boxShadow: '0 2px 10px rgba(16, 185, 129, 0.06)'
                    }}>
                      <strong style={{ color: '#065f46', fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle2 size={15} color="#059669" /> Expected Lab Outcome:
                      </strong>
                      <p style={{ margin: '6px 0 0', fontSize: '0.9rem', color: '#047857', lineHeight: 1.5 }}>
                        {notes.practical_lab_task.expected_output}
                      </p>
                    </div>
                  )}
                </div>
              )}

            </div>
          ) : null}
        </div>

        {/* RIGHT COLUMN: Dedicated Sticky Side Chatbot for Doubts */}
        <div className="notes-chatbot-col no-print" style={{
          position: 'sticky',
          top: '90px',
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 120px)',
          background: 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.95)',
          borderRadius: '24px',
          boxShadow: '0 16px 40px -8px rgba(15, 23, 42, 0.08)',
          overflow: 'hidden'
        }}>
          {/* Chatbot Header */}
          <div style={{
            padding: '18px 22px',
            borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
            background: 'rgba(248, 250, 252, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
              }}>
                <Bot size={20} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 className="font-heading" style={{ fontSize: '0.96rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    AI Research Mentor
                  </h3>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: '#059669',
                    background: '#ecfdf5',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    border: '1px solid #a7f3d0'
                  }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} /> Online
                  </span>
                </div>
                <p style={{ fontSize: '0.74rem', color: '#64748b', margin: '2px 0 0' }}>
                  24/7 Deep Technical Guidance
                </p>
              </div>
            </div>

            {mentorChatHistory.length > 0 && (
              <button
                onClick={() => setMentorChatHistory([])}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '6px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
              >
                Clear
              </button>
            )}
          </div>

          {/* Messages Container */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            background: 'rgba(255, 255, 255, 0.5)'
          }}>
            {mentorChatHistory.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 14px', color: '#64748b' }}>
                <div style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 14px',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.15)'
                }}>
                  <MessageSquare size={26} />
                </div>
                <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
                  Have questions about this module?
                </h4>
                <p style={{ fontSize: '0.82rem', margin: '0 0 20px', lineHeight: 1.55 }}>
                  Ask doubts regarding code examples, practical edge cases, or industry interview scenarios.
                </p>

                {/* Quick suggestions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
                  {[
                    'Explain this concept in simple terms with an analogy',
                    'Show an industry real-world use case for this',
                    'What interview questions are asked on this topic?'
                  ].map((sugg, sIdx) => (
                    <button
                      key={sIdx}
                      onClick={() => setMentorQuestion(sugg)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.9)',
                        border: '1px solid rgba(226, 232, 240, 0.95)',
                        padding: '10px 14px',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: '#1d4ed8',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease',
                        boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#93c5fd';
                        e.currentTarget.style.transform = 'translateX(2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(226, 232, 240, 0.95)';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                    >
                      💡 {sugg}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              mentorChatHistory.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'stretch',
                    maxWidth: msg.sender === 'user' ? '85%' : '100%',
                    background: msg.sender === 'user' ? 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)' : 'rgba(255, 255, 255, 0.95)',
                    color: msg.sender === 'user' ? '#ffffff' : '#0f172a',
                    padding: '14px 18px',
                    borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    border: msg.sender === 'user' ? 'none' : '1px solid rgba(226, 232, 240, 0.95)',
                    boxShadow: msg.sender === 'user' ? '0 4px 14px rgba(37, 99, 235, 0.25)' : '0 4px 14px rgba(15, 23, 42, 0.04)',
                    fontSize: '0.88rem',
                    lineHeight: 1.6
                  }}
                >
                  {msg.sender === 'user' ? (
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.72rem', opacity: 0.8, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        You
                      </strong>
                      <div style={{ whiteSpace: 'pre-line' }}>{msg.text}</div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', paddingBottom: '6px', borderBottom: '1px solid rgba(226, 232, 240, 0.8)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Bot size={15} color="#2563eb" />
                          <strong style={{ fontSize: '0.78rem', color: '#1d4ed8', fontWeight: 800 }}>
                            AI Mentor
                          </strong>
                        </div>

                        <button
                          onClick={() => handleCopyChat(msg.text, i)}
                          title="Copy answer"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#64748b',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.72rem',
                            padding: '2px 6px',
                            borderRadius: '4px'
                          }}
                        >
                          {copiedChatIndex === i ? (
                            <>
                              <Check size={12} color="#059669" />
                              <span style={{ color: '#059669', fontWeight: 700 }}>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy size={12} />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Clean Markdown rendering for Assistant */}
                      <ChatMarkdown content={msg.text} />

                      {msg.followups?.length > 0 && (
                        <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(226, 232, 240, 0.8)' }}>
                          <span style={{ fontSize: '0.72rem', color: '#2563eb', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
                            Follow-up topics:
                          </span>
                          {msg.followups.map((f, fi) => (
                            <button
                              key={fi}
                              onClick={() => setMentorQuestion(f)}
                              style={{
                                display: 'block',
                                background: 'none',
                                border: 'none',
                                color: '#1d4ed8',
                                fontSize: '0.78rem',
                                textAlign: 'left',
                                cursor: 'pointer',
                                padding: '4px 0',
                                fontWeight: 600
                              }}
                            >
                              → {f}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}

            {mentorLoading && (
              <div style={{
                alignSelf: 'flex-start',
                background: 'rgba(255, 255, 255, 0.95)',
                padding: '12px 18px',
                borderRadius: '16px',
                fontSize: '0.84rem',
                color: '#475569',
                border: '1px solid rgba(226, 232, 240, 0.95)',
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span className="animate-spin" style={{ display: 'inline-block' }}>✨</span>
                <span>Synthesizing mentorship response...</span>
              </div>
            )}
          </div>

          {/* Chatbot Input Box */}
          <form onSubmit={handleAskMentor} style={{
            padding: '14px 18px',
            borderTop: '1px solid rgba(226, 232, 240, 0.8)',
            background: 'rgba(248, 250, 252, 0.85)',
            display: 'flex',
            gap: '10px',
            alignItems: 'center'
          }}>
            <input
              type="text"
              placeholder="Ask mentor a doubt about this module..."
              value={mentorQuestion}
              onChange={(e) => setMentorQuestion(e.target.value)}
              style={{ 
                flex: 1,
                fontSize: '0.88rem', 
                padding: '11px 16px',
                borderRadius: '12px',
                border: '1px solid rgba(203, 213, 225, 0.9)',
                background: '#ffffff',
                color: '#0f172a',
                outline: 'none',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.03)'
              }}
            />
            <button
              type="submit"
              disabled={mentorLoading || !mentorQuestion.trim()}
              className="btn btn-primary"
              style={{ 
                padding: '11px 18px', 
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)' 
              }}
            >
              <Send size={16} />
            </button>
          </form>

        </div>

      </div>

    </div>
  );
}
