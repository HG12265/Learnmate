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
  Download,
  HelpCircle,
  Award,
  ExternalLink,
  FileText
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
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [error, setError] = useState('');
  const [notes, setNotes] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [mobileTab, setMobileTab] = useState('notes'); // 'notes' | 'mentor'

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

  const handleDownloadPDF = async () => {
    if (downloadingPdf || !notes) return;
    setDownloadingPdf(true);

    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const element = document.getElementById('learnmate-pdf-document-template');
      if (!element) {
        window.print();
        return;
      }

      const cleanTitle = (notes.title || module.title || 'Module')
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .substring(0, 35);

      const opt = {
        margin: [10, 10, 10, 10],
        filename: `LEARNMATE_Module_${module.number}_${cleanTitle}_Study_Notes.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          scrollY: 0,
          windowWidth: 800
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'], avoid: ['.pdf-avoid-break', 'pre', 'h2', 'h3'] }
      };

      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error('PDF export error, falling back to print dialog:', err);
      window.print();
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <div className="notes-container">

      {/* Top Navigation Bar (Frosted Glass Executive Bar) */}
      <div className="clean-panel notes-nav-bar">
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

        <div className="notes-nav-tags" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
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

        <div className="notes-nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handleDownloadPDF}
            disabled={downloadingPdf || loading || !notes}
            className="btn btn-secondary"
            title="Download Comprehensive Notes as PDF"
            style={{
              fontSize: '0.82rem',
              padding: '8px 14px',
              gap: '6px',
              borderRadius: '10px',
              background: downloadingPdf ? 'rgba(239, 246, 255, 0.95)' : 'rgba(255, 255, 255, 0.9)',
              border: downloadingPdf ? '1px solid #93c5fd' : '1px solid rgba(226, 232, 240, 0.9)',
              color: downloadingPdf ? '#1d4ed8' : '#334155',
              cursor: downloadingPdf ? 'wait' : 'pointer'
            }}
          >
            <Download size={14} color="#2563eb" className={downloadingPdf ? 'animate-bounce' : ''} />
            <span>{downloadingPdf ? 'Generating PDF...' : 'Download PDF'}</span>
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

      {/* Mobile Tab Switcher (Study Notes vs AI Research Mentor) */}
      <div className="notes-mobile-switcher">
        <button
          onClick={() => setMobileTab('notes')}
          className={`notes-mobile-tab ${mobileTab === 'notes' ? 'active' : ''}`}
        >
          <BookOpen size={16} />
          <span>Study Notes</span>
        </button>
        <button
          onClick={() => setMobileTab('mentor')}
          className={`notes-mobile-tab ${mobileTab === 'mentor' ? 'active' : ''}`}
        >
          <Bot size={16} />
          <span>AI Research Mentor</span>
          {mentorChatHistory.length > 0 && (
            <span style={{
              background: mobileTab === 'mentor' ? 'rgba(255, 255, 255, 0.28)' : '#2563eb',
              color: '#ffffff',
              fontSize: '0.68rem',
              padding: '1px 6px',
              borderRadius: '9999px',
              fontWeight: 800
            }}>
              {mentorChatHistory.length}
            </span>
          )}
        </button>
      </div>

      {/* Main Grid: Content (Left) + Side Chatbot (Right) */}
      <div className="notes-main-grid">

        {/* LEFT COLUMN: Clean In-depth Content */}
        <div className={`notes-content-col ${mobileTab === 'mentor' ? 'mobile-hidden' : ''}`}>
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
                <h1 className="font-heading notes-page-title" style={{
                  fontSize: 'clamp(1.9rem, 3.8vw, 2.5rem)',
                  fontWeight: 900,
                  color: '#0f172a',
                  lineHeight: 1.25,
                  marginBottom: '16px',
                  letterSpacing: '-0.025em',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word'
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
                  <div className="notes-brief-card" style={{
                    background: 'rgba(239, 246, 255, 0.85)',
                    border: '1px solid rgba(191, 219, 254, 0.9)',
                    borderLeft: '5px solid #2563eb',
                    borderRadius: '16px',
                    padding: '18px 22px',
                    fontSize: '0.98rem',
                    color: '#1e3a8a',
                    lineHeight: 1.65,
                    boxShadow: '0 4px 16px rgba(37, 99, 235, 0.05)',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word'
                  }}>
                    <strong style={{ color: '#1e40af', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', fontSize: '0.84rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      <Sparkles size={14} color="#2563eb" /> Module Executive Brief:
                    </strong>
                    <p style={{ margin: 0, color: '#334155' }}>{notes.overview}</p>
                  </div>
                )}
              </div>

              {/* Main Learning Content / Theory */}
              <div className="clean-panel notes-section-card" style={{
                background: 'rgba(255, 255, 255, 0.88)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.95)',
                boxShadow: '0 12px 36px -8px rgba(15, 23, 42, 0.06)'
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
                <div className="clean-panel notes-section-card" style={{
                  background: 'rgba(255, 255, 255, 0.88)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.95)',
                  boxShadow: '0 12px 36px -8px rgba(15, 23, 42, 0.06)'
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

                        <pre className="notes-code-pre" style={{
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
                <div className="clean-panel notes-section-card" style={{
                  background: 'rgba(255, 255, 255, 0.88)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.95)',
                  boxShadow: '0 12px 36px -8px rgba(15, 23, 42, 0.06)'
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

              {/* 04 • Technical Interview Questions & Answers */}
              {notes.interview_questions?.length > 0 && (
                <div className="clean-panel notes-section-card" style={{
                  background: 'rgba(255, 255, 255, 0.88)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.95)',
                  boxShadow: '0 12px 36px -8px rgba(15, 23, 42, 0.06)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid rgba(226, 232, 240, 0.8)' }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)',
                      border: '1px solid #c7d2fe',
                      color: '#4338ca',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(67, 56, 202, 0.12)'
                    }}>
                      <HelpCircle size={20} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#4338ca', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        04 &bull; Interview Preparation
                      </span>
                      <h2 className="font-heading" style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '2px 0 0' }}>
                        Technical Interview Q&A (Top 5)
                      </h2>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {notes.interview_questions.map((qa, qIdx) => (
                      <div key={qIdx} style={{
                        border: '1px solid rgba(226, 232, 240, 0.9)',
                        borderRadius: '14px',
                        padding: '18px 20px',
                        background: 'rgba(248, 250, 252, 0.75)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '8px' }}>
                          <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#1e3a8a', margin: 0, lineHeight: 1.45 }}>
                            Q{qIdx + 1}: {qa.question}
                          </h4>
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: '9999px',
                            background: qa.difficulty === 'Beginner' ? '#ecfdf5' : qa.difficulty === 'Advanced' ? '#fef2f2' : '#eff6ff',
                            color: qa.difficulty === 'Beginner' ? '#059669' : qa.difficulty === 'Advanced' ? '#dc2626' : '#2563eb',
                            border: '1px solid rgba(203, 213, 225, 0.8)',
                            flexShrink: 0
                          }}>
                            {qa.difficulty}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.92rem', color: '#334155', lineHeight: 1.6 }}>
                          {qa.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 05 • Knowledge Check & Revision Quiz */}
              {notes.quiz_questions?.length > 0 && (
                <div className="clean-panel notes-section-card" style={{
                  background: 'rgba(255, 255, 255, 0.88)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.95)',
                  boxShadow: '0 12px 36px -8px rgba(15, 23, 42, 0.06)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid rgba(226, 232, 240, 0.8)' }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                      border: '1px solid #fcd34d',
                      color: '#b45309',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(217, 119, 6, 0.12)'
                    }}>
                      <Award size={20} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        05 &bull; Knowledge Assessment
                      </span>
                      <h2 className="font-heading" style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '2px 0 0' }}>
                        Module Revision Quiz
                      </h2>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    {notes.quiz_questions.map((quiz, qzIdx) => (
                      <div key={qzIdx} style={{
                        border: '1px solid rgba(226, 232, 240, 0.9)',
                        borderRadius: '14px',
                        padding: '18px 20px',
                        background: 'rgba(255, 255, 255, 0.85)'
                      }}>
                        <h4 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px', lineHeight: 1.45 }}>
                          {qzIdx + 1}. {quiz.question}
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', marginBottom: '12px' }}>
                          {quiz.options?.map((opt, oIdx) => {
                            const isCorrect = oIdx === quiz.correct_answer_index;
                            return (
                              <div key={oIdx} style={{
                                padding: '10px 14px',
                                borderRadius: '10px',
                                border: isCorrect ? '1.5px solid #10b981' : '1px solid #e2e8f0',
                                background: isCorrect ? '#ecfdf5' : '#ffffff',
                                color: isCorrect ? '#065f46' : '#334155',
                                fontSize: '0.86rem',
                                fontWeight: isCorrect ? 700 : 500,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                              }}>
                                <span style={{
                                  width: '20px',
                                  height: '20px',
                                  borderRadius: '50%',
                                  background: isCorrect ? '#10b981' : '#f1f5f9',
                                  color: isCorrect ? '#ffffff' : '#64748b',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.72rem',
                                  fontWeight: 800,
                                  flexShrink: 0
                                }}>
                                  {String.fromCharCode(65 + oIdx)}
                                </span>
                                <span style={{ flex: 1 }}>{opt}</span>
                                {isCorrect && <CheckCircle2 size={15} color="#10b981" />}
                              </div>
                            );
                          })}
                        </div>
                        {quiz.explanation && (
                          <div style={{
                            fontSize: '0.82rem',
                            color: '#475569',
                            background: '#f8fafc',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            border: '1px solid #f1f5f9'
                          }}>
                            <strong style={{ color: '#059669' }}>Explanation: </strong>
                            {quiz.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 06 • Curated References & Official Documentation */}
              {notes.curated_resources?.length > 0 && (
                <div className="clean-panel notes-section-card" style={{
                  background: 'rgba(255, 255, 255, 0.88)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.95)',
                  boxShadow: '0 12px 36px -8px rgba(15, 23, 42, 0.06)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid rgba(226, 232, 240, 0.8)' }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
                      border: '1px solid #fbcfe8',
                      color: '#db2777',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(219, 39, 119, 0.12)'
                    }}>
                      <FileText size={20} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#db2777', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        06 &bull; Further Learning
                      </span>
                      <h2 className="font-heading" style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '2px 0 0' }}>
                        Curated References & Docs
                      </h2>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                    {notes.curated_resources.map((res, rIdx) => (
                      <a
                        key={rIdx}
                        href={res.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          textDecoration: 'none',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          padding: '14px 16px',
                          borderRadius: '12px',
                          background: '#ffffff',
                          border: '1px solid rgba(226, 232, 240, 0.95)',
                          transition: 'all 0.18s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#93c5fd';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 6px 16px rgba(37, 99, 235, 0.08)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'rgba(226, 232, 240, 0.95)';
                          e.currentTarget.style.transform = 'none';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#2563eb', background: '#eff6ff', padding: '2px 8px', borderRadius: '6px' }}>
                              {res.type || 'Resource'}
                            </span>
                            <ExternalLink size={14} color="#64748b" />
                          </div>
                          <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', margin: '0 0 4px', lineHeight: 1.4 }}>
                            {res.title}
                          </h4>
                          {res.description && (
                            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, lineHeight: 1.45 }}>
                              {res.description}
                            </p>
                          )}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Mobile Quick Jump Card to AI Research Mentor */}
              <div className="clean-panel notes-section-card notes-mobile-switcher" style={{
                background: 'linear-gradient(135deg, rgba(239, 246, 255, 0.95) 0%, rgba(219, 234, 254, 0.9) 100%)',
                border: '1px solid rgba(191, 219, 254, 0.95)',
                textAlign: 'center',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                }}>
                  <Bot size={22} />
                </div>
                <h3 className="font-heading" style={{ fontSize: '1.08rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Have Questions or Doubts?
                </h3>
                <p style={{ fontSize: '0.84rem', color: '#475569', margin: 0, lineHeight: 1.5 }}>
                  Ask our AI Research Mentor for simplified analogies, code examples, or interview practice on this module.
                </p>
                <button
                  onClick={() => {
                    setMobileTab('mentor');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '11px', borderRadius: '12px', gap: '8px', fontSize: '0.88rem' }}
                >
                  <MessageSquare size={16} />
                  <span>Open AI Research Mentor</span>
                </button>
              </div>

            </div>
          ) : null}
        </div>

        {/* RIGHT COLUMN: Dedicated Sticky Side Chatbot for Doubts */}
        <div className={`notes-chatbot-col no-print ${mobileTab === 'notes' ? 'mobile-hidden' : ''}`}>
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setMobileTab('notes')}
                className="btn btn-secondary notes-mobile-switcher"
                style={{
                  padding: '5px 10px',
                  borderRadius: '8px',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  gap: '4px'
                }}
              >
                <ArrowLeft size={13} />
                <span>Notes</span>
              </button>

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

      {/* Dedicated High-Definition Document Template for Direct PDF Export & Print */}
      {notes && (
        <div style={{ position: 'absolute', left: '-9999px', top: 0, width: '800px', pointerEvents: 'none' }}>
          <div id="learnmate-pdf-document-template" style={{
            width: '800px',
            background: '#ffffff',
            color: '#0f172a',
            padding: '28px 32px',
            boxSizing: 'border-box',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          }}>
            {/* 1. Header Banner */}
            <div style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #2563eb 100%)',
              borderRadius: '14px',
              padding: '22px 26px',
              color: '#ffffff',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.02em' }}>
                      LEARNMATE
                    </span>
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '6px',
                      background: 'rgba(255, 255, 255, 0.2)',
                      border: '1px solid rgba(255, 255, 255, 0.35)',
                      textTransform: 'uppercase'
                    }}>
                      AI Engine
                    </span>
                  </div>
                  <p style={{ fontSize: '0.82rem', margin: '4px 0 0', opacity: 0.9, letterSpacing: '0.02em' }}>
                    OFFICIAL TECHNICAL CURRICULUM &bull; COMPREHENSIVE STUDY GUIDE
                  </p>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.78rem', opacity: 0.9 }}>
                  <div style={{ fontWeight: 800, color: '#93c5fd' }}>ACADEMIC VERIFICATION</div>
                  <div>REF: {module.id ? module.id.slice(0, 8).toUpperCase() : 'LM-MOD'}</div>
                </div>
              </div>

              <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.2)', marginBottom: '14px' }} />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '8px 12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', opacity: 0.8 }}>Module</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>Module {module.number}</div>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '8px 12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', opacity: 0.8 }}>Phase</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{module.phase}</div>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '8px 12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', opacity: 0.8 }}>Study Time</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>{module.estimated_hours} Hours</div>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '8px 12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', opacity: 0.8 }}>Generated</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                </div>
              </div>
            </div>

            {/* 2. Module Title */}
            <h1 style={{
              fontSize: '1.75rem',
              fontWeight: 900,
              color: '#0f172a',
              lineHeight: 1.25,
              margin: '0 0 14px',
              letterSpacing: '-0.02em'
            }}>
              {notes.title || module.title}
            </h1>

            {/* 3. Executive Overview */}
            {notes.overview && (
              <div style={{
                background: '#f0f7ff',
                border: '1px solid #bfdbfe',
                borderLeft: '5px solid #2563eb',
                borderRadius: '12px',
                padding: '16px 20px',
                marginBottom: '24px'
              }}>
                <strong style={{ color: '#1e40af', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
                  Module Executive Brief & Learning Objectives:
                </strong>
                <p style={{ margin: 0, fontSize: '0.94rem', color: '#1e293b', lineHeight: 1.6 }}>
                  {notes.overview}
                </p>
              </div>
            )}

            {/* 4. Theory & Deep Foundations */}
            <div style={{ marginBottom: '26px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 900, color: '#ffffff', background: '#2563eb', padding: '3px 8px', borderRadius: '6px' }}>01</span>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Core Theory & Conceptual Foundations
                </h2>
              </div>
              <div style={{ fontSize: '0.95rem', color: '#1e293b', lineHeight: 1.65 }}>
                <MarkdownContent content={notes.deep_theory_markdown} />
              </div>
            </div>

            {/* 5. Production Code Lab */}
            {notes.code_snippets?.length > 0 && (
              <div style={{ marginBottom: '26px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 900, color: '#ffffff', background: '#0284c7', padding: '3px 8px', borderRadius: '6px' }}>02</span>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Production Code Labs & Implementations
                  </h2>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {notes.code_snippets.map((snip, sIdx) => (
                    <div key={sIdx} className="pdf-avoid-break" style={{
                      borderRadius: '12px',
                      border: '1px solid #334155',
                      overflow: 'hidden',
                      background: '#090d16'
                    }}>
                      <div style={{ padding: '9px 16px', background: '#1e293b', color: '#f8fafc', fontWeight: 700, fontSize: '0.84rem' }}>
                        {snip.title}
                      </div>
                      <pre style={{
                        padding: '14px 18px',
                        margin: 0,
                        fontSize: '0.82rem',
                        lineHeight: 1.55,
                        color: '#93c5fd',
                        background: '#090d16',
                        fontFamily: 'Fira Code, monospace',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word'
                      }}>
                        <code>{snip.code}</code>
                      </pre>
                      {snip.explanation && (
                        <div style={{ padding: '10px 16px', background: '#0f172a', color: '#cbd5e1', fontSize: '0.8rem', borderTop: '1px solid #1e293b' }}>
                          <strong style={{ color: '#38bdf8' }}>Breakdown: </strong>
                          {snip.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. Applied Hands-on Lab Challenge */}
            {notes.practical_lab_task && (
              <div className="pdf-avoid-break" style={{ marginBottom: '26px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 900, color: '#ffffff', background: '#059669', padding: '3px 8px', borderRadius: '6px' }}>03</span>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Applied Hands-on Lab Challenge
                  </h2>
                </div>

                <div style={{ border: '1px solid #cbd5e1', borderRadius: '12px', padding: '16px 20px', background: '#f8fafc' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 12px' }}>
                    {notes.practical_lab_task.task_title}
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                    {notes.practical_lab_task.instructions?.map((inst, iIdx) => (
                      <div key={iIdx} style={{ display: 'flex', gap: '10px', fontSize: '0.88rem', color: '#1e293b' }}>
                        <span style={{ fontWeight: 800, color: '#2563eb' }}>{iIdx + 1}.</span>
                        <span>{inst}</span>
                      </div>
                    ))}
                  </div>
                  {notes.practical_lab_task.expected_output && (
                    <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '12px 16px', borderRadius: '8px', fontSize: '0.86rem', color: '#065f46' }}>
                      <strong>Expected Outcome: </strong>
                      {notes.practical_lab_task.expected_output}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 7. Technical Interview Q&A (Top 5) */}
            {notes.interview_questions?.length > 0 && (
              <div style={{ marginBottom: '26px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 900, color: '#ffffff', background: '#4338ca', padding: '3px 8px', borderRadius: '6px' }}>04</span>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    High-Impact Technical Interview Q&A (Top 5)
                  </h2>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {notes.interview_questions.map((qa, qIdx) => (
                    <div key={qIdx} className="pdf-avoid-break" style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      padding: '14px 18px',
                      background: '#faf5ff'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <strong style={{ color: '#4338ca', fontSize: '0.92rem' }}>Q{qIdx + 1}: {qa.question}</strong>
                        <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: '#e0e7ff', color: '#3730a3' }}>{qa.difficulty}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.88rem', color: '#334155', lineHeight: 1.55 }}>
                        {qa.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 8. Module Revision Quiz */}
            {notes.quiz_questions?.length > 0 && (
              <div style={{ marginBottom: '26px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 900, color: '#ffffff', background: '#b45309', padding: '3px 8px', borderRadius: '6px' }}>05</span>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Knowledge Check & Revision Quiz
                  </h2>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {notes.quiz_questions.map((quiz, qzIdx) => (
                    <div key={qzIdx} className="pdf-avoid-break" style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      padding: '14px 18px',
                      background: '#ffffff'
                    }}>
                      <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.92rem', marginBottom: '8px' }}>
                        {qzIdx + 1}. {quiz.question}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', marginBottom: '8px' }}>
                        {quiz.options?.map((opt, oIdx) => {
                          const isCorrect = oIdx === quiz.correct_answer_index;
                          return (
                            <div key={oIdx} style={{
                              padding: '6px 10px',
                              borderRadius: '6px',
                              border: isCorrect ? '1.5px solid #10b981' : '1px solid #e2e8f0',
                              background: isCorrect ? '#ecfdf5' : '#f8fafc',
                              fontSize: '0.8rem',
                              fontWeight: isCorrect ? 700 : 500,
                              color: isCorrect ? '#065f46' : '#334155'
                            }}>
                              {String.fromCharCode(65 + oIdx)}. {opt} {isCorrect ? '✓ (Correct)' : ''}
                            </div>
                          );
                        })}
                      </div>
                      {quiz.explanation && (
                        <div style={{ fontSize: '0.78rem', color: '#475569', background: '#f8fafc', padding: '6px 10px', borderRadius: '6px' }}>
                          <strong style={{ color: '#059669' }}>Explanation: </strong> {quiz.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 9. Curated References */}
            {notes.curated_resources?.length > 0 && (
              <div className="pdf-avoid-break" style={{ marginBottom: '26px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 900, color: '#ffffff', background: '#db2777', padding: '3px 8px', borderRadius: '6px' }}>06</span>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Curated Academic & Industry Documentation
                  </h2>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {notes.curated_resources.map((res, rIdx) => (
                    <div key={rIdx} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px', background: '#ffffff' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: '0.86rem', color: '#0f172a' }}>{res.title}</strong>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#2563eb' }}>{res.type}</span>
                      </div>
                      <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px' }}>{res.url}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 10. Official Document Footer */}
            <div style={{
              marginTop: '36px',
              paddingTop: '16px',
              borderTop: '2px solid #cbd5e1',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.74rem',
              color: '#64748b'
            }}>
              <span>LEARNMATE AI Engine &bull; Official Curriculum Study Notes</span>
              <span>Verified Academic Content &bull; Page End</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
