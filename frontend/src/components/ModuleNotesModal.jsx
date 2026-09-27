import React, { useState, useEffect } from 'react';
import { 
  X, 
  BookOpen, 
  Code2, 
  Wrench, 
  BookMarked, 
  Award, 
  HelpCircle, 
  MessageSquare, 
  Copy, 
  Check, 
  Download, 
  RefreshCw, 
  ExternalLink,
  CheckCircle2,
  Sparkles,
  Send,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { api } from '../services/api';
import confetti from 'canvas-confetti';

export default function ModuleNotesModal({ 
  isOpen, 
  onClose, 
  module, 
  roadmapId, 
  onToggleComplete 
}) {
  const [activeTab, setActiveTab] = useState('theory');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notes, setNotes] = useState(null);
  
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [expandedQA, setExpandedQA] = useState({ 0: true });

  const [mentorQuestion, setMentorQuestion] = useState('');
  const [mentorLoading, setMentorLoading] = useState(false);
  const [mentorChatHistory, setMentorChatHistory] = useState([]);

  useEffect(() => {
    if (isOpen && module && roadmapId) {
      loadNotes(false);
      setUserAnswers({});
      setQuizSubmitted(false);
      setMentorChatHistory([]);
    }
  }, [isOpen, module?.id, roadmapId]);

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

  if (!isOpen || !module) return null;

  const handleCopyCode = (code, index) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSelectQuizOption = (questionId, optionIndex) => {
    if (quizSubmitted) return;
    setUserAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
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
          text: 'There was an issue connecting to the AI Mentor. Please try submitting your question again.' 
        }
      ]);
    } finally {
      setMentorLoading(false);
    }
  };

  const downloadMarkdown = () => {
    if (!notes) return;
    const content = `
# ${notes.title}
**Module for ${module.phase}**
Estimated Hours: ${module.estimated_hours}h | Level: ${module.difficulty}

## Overview
${notes.overview}

## Comprehensive Theory & Concepts
${notes.deep_theory_markdown}

## Practical Code Implementations
${notes.code_snippets?.map(c => `
### ${c.title} (${c.language})
\`\`\`${c.language}
${c.code}
\`\`\`
*Explanation:* ${c.explanation}
`).join('\n')}

## Hands-on Lab Challenge
### ${notes.practical_lab_task?.task_title}
${notes.practical_lab_task?.instructions?.map((inst, i) => `${i + 1}. ${inst}`).join('\n')}
*Expected Output:* ${notes.practical_lab_task?.expected_output}

## Curated Free Resources
${notes.curated_resources?.map(r => `- [${r.title}](${r.url}) (${r.type}): ${r.description}`).join('\n')}

## Top Interview Questions
${notes.interview_questions?.map(iq => `
### Q: ${iq.question} (${iq.difficulty})
**A:** ${iq.answer}
`).join('\n')}
    `.trim();

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${module.title.replace(/[^a-zA-Z0-9]/g, '_')}_notes.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleMarkCompleteWithConfetti = () => {
    const newState = !module.is_completed;
    onToggleComplete(module.id, newState);
    if (newState) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      background: 'rgba(15, 23, 42, 0.5)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div className="clean-panel animate-fade-in" style={{
        maxWidth: '1080px',
        width: '100%',
        height: '90vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        background: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-xl)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#ffffff'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                Module {module.number}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {module.phase}
              </span>
              <span className="badge badge-amber" style={{ fontSize: '0.7rem' }}>
                {module.estimated_hours} Hours
              </span>
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
              {notes?.title || module.title}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handleMarkCompleteWithConfetti}
              className={module.is_completed ? 'btn btn-secondary' : 'btn btn-primary'}
              style={{ fontSize: '0.82rem', padding: '8px 14px' }}
            >
              <CheckCircle2 size={16} color={module.is_completed ? 'var(--accent-emerald)' : '#ffffff'} />
              <span>{module.is_completed ? 'Completed' : 'Mark Completed'}</span>
            </button>

            <button
              onClick={downloadMarkdown}
              disabled={!notes}
              className="btn btn-secondary"
              title="Download Notes as Markdown"
              style={{ padding: '8px 12px' }}
            >
              <Download size={16} />
            </button>

            <button
              onClick={() => loadNotes(true)}
              disabled={loading}
              className="btn btn-secondary"
              title="Regenerate Notes with AI"
              style={{ padding: '8px 12px' }}
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>

            <button
              onClick={onClose}
              style={{
                background: 'var(--bg-secondary)',
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
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-color)',
          padding: '0 20px',
          overflowX: 'auto',
          gap: '4px'
        }}>
          {[
            { id: 'theory', label: 'Theory & Notes', icon: BookOpen },
            { id: 'code', label: 'Code & Systems', icon: Code2 },
            { id: 'lab', label: 'Hands-on Lab', icon: Wrench },
            { id: 'resources', label: 'Free Resources', icon: BookMarked },
            { id: 'interview', label: 'Interview Q&A', icon: Award },
            { id: 'quiz', label: 'Quick Quiz', icon: HelpCircle },
            { id: 'mentor', label: 'AI Mentor Chat', icon: MessageSquare }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 16px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                  color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s'
                }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Workspace Body */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '28px',
          background: '#ffffff'
        }}>
          {loading ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: '16px'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                border: '3px solid var(--primary-light)',
                borderTopColor: 'var(--primary)',
                animation: 'spin 1s linear infinite'
              }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
                Generating In-Depth Notes & Code Labs...
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Synthesizing architectural theory, code examples, interview questions and quiz.
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
            <div>
              
              {/* TAB 1: Theory */}
              {activeTab === 'theory' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{
                    background: 'var(--primary-light)',
                    border: '1px solid #bfdbfe',
                    borderRadius: 'var(--radius-md)',
                    padding: '18px 22px'
                  }}>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1e40af', marginBottom: '4px' }}>
                      Executive Summary:
                    </h4>
                    <p style={{ fontSize: '0.92rem', color: '#1e3a8a', margin: 0, lineHeight: 1.6 }}>
                      {notes.overview}
                    </p>
                  </div>

                  <div style={{
                    background: '#ffffff',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '24px',
                    lineHeight: 1.7,
                    fontSize: '0.95rem',
                    color: '#1e293b',
                    whiteSpace: 'pre-line'
                  }}>
                    {notes.deep_theory_markdown}
                  </div>
                </div>
              )}

              {/* TAB 2: Practical Code */}
              {activeTab === 'code' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Enterprise-grade, working code patterns tailored for this module:
                  </p>

                  {notes.code_snippets?.map((snippet, idx) => (
                    <div key={idx} style={{
                      background: '#0f172a',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      boxShadow: 'var(--shadow-md)'
                    }}>
                      <div style={{
                        padding: '10px 16px',
                        background: '#1e293b',
                        borderBottom: '1px solid #334155',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Code2 size={16} color="#38bdf8" />
                          <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#f8fafc' }}>{snippet.title}</span>
                          <span className="badge" style={{ background: '#0284c7', color: '#ffffff', fontSize: '0.65rem' }}>{snippet.language}</span>
                        </div>

                        <button
                          onClick={() => handleCopyCode(snippet.code, idx)}
                          style={{
                            background: '#334155',
                            border: 'none',
                            color: '#ffffff',
                            padding: '4px 10px',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          {copiedIndex === idx ? (
                            <>
                              <Check size={12} color="#4ade80" />
                              <span style={{ color: '#4ade80' }}>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy size={12} />
                              <span>Copy Code</span>
                            </>
                          )}
                        </button>
                      </div>

                      <pre style={{
                        padding: '18px 20px',
                        margin: 0,
                        overflowX: 'auto',
                        fontSize: '0.88rem',
                        lineHeight: 1.55,
                        color: '#93c5fd',
                        background: '#0b0f19'
                      }}>
                        <code>{snippet.code}</code>
                      </pre>

                      {snippet.explanation && (
                        <div style={{
                          padding: '12px 18px',
                          background: '#1e293b',
                          borderTop: '1px solid #334155',
                          fontSize: '0.82rem',
                          color: '#cbd5e1'
                        }}>
                          <strong style={{ color: '#ffffff' }}>Explanation: </strong>
                          {snippet.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 3: Hands-on Lab */}
              {activeTab === 'lab' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="clean-panel" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                      <Wrench size={20} color="var(--primary)" />
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                        {notes.practical_lab_task?.task_title || 'Hands-on Milestone Challenge'}
                      </h3>
                    </div>

                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '12px' }}>
                      Step-by-Step Implementation Instructions:
                    </h4>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                      {notes.practical_lab_task?.instructions?.map((inst, i) => (
                        <div key={i} style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '12px',
                          background: 'var(--bg-secondary)',
                          padding: '12px 16px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-color)'
                        }}>
                          <span style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: 'var(--primary-light)',
                            color: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            flexShrink: 0
                          }}>
                            {i + 1}
                          </span>
                          <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginTop: '2px' }}>
                            {inst}
                          </span>
                        </div>
                      ))}
                    </div>

                    {notes.practical_lab_task?.expected_output && (
                      <div style={{
                        background: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        borderRadius: 'var(--radius-sm)',
                        padding: '14px 18px'
                      }}>
                        <strong style={{ color: '#15803d', fontSize: '0.85rem' }}>Expected Output & Success Criteria:</strong>
                        <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: '#166534' }}>
                          {notes.practical_lab_task.expected_output}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: Free Resources */}
              {activeTab === 'resources' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                  {notes.curated_resources?.map((res, i) => (
                    <a
                      key={i}
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="clean-panel"
                      style={{
                        padding: '20px',
                        textDecoration: 'none',
                        color: 'inherit',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span className="badge badge-primary" style={{ fontSize: '0.68rem' }}>{res.type}</span>
                          <ExternalLink size={14} color="var(--primary)" />
                        </div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px', color: '#0f172a' }}>
                          {res.title}
                        </h4>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                          {res.description}
                        </p>
                      </div>
                      <span style={{ fontSize: '0.78rem', color: 'var(--primary)', marginTop: '12px', fontWeight: 600 }}>
                        Open Resource →
                      </span>
                    </a>
                  ))}
                </div>
              )}

              {/* TAB 5: Top Interview Q&A */}
              {activeTab === 'interview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    Common technical interview questions for this module:
                  </p>

                  {notes.interview_questions?.map((qa, i) => {
                    const isExpanded = expandedQA[i];
                    return (
                      <div
                        key={i}
                        style={{
                          background: '#ffffff',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-md)',
                          overflow: 'hidden'
                        }}
                      >
                        <div
                          onClick={() => setExpandedQA(prev => ({ ...prev, [i]: !prev[i] }))}
                          style={{
                            padding: '16px 20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            userSelect: 'none',
                            background: isExpanded ? 'var(--bg-secondary)' : '#ffffff'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span className="badge badge-amber" style={{ fontSize: '0.65rem' }}>{qa.difficulty}</span>
                            <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>{qa.question}</span>
                          </div>
                          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </div>

                        {isExpanded && (
                          <div style={{
                            padding: '16px 20px',
                            background: '#ffffff',
                            borderTop: '1px solid var(--border-color)',
                            fontSize: '0.9rem',
                            color: 'var(--text-secondary)',
                            lineHeight: 1.6
                          }}>
                            <strong style={{ color: 'var(--accent-emerald)', display: 'block', marginBottom: '6px' }}>
                              Recommended Answer:
                            </strong>
                            {qa.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* TAB 6: Quick Quiz */}
              {activeTab === 'quiz' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>
                      Test your understanding before marking this module complete:
                    </p>
                    {quizSubmitted && (
                      <button
                        onClick={() => { setQuizSubmitted(false); setUserAnswers({}); }}
                        className="btn btn-secondary"
                        style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                      >
                        Retake Quiz
                      </button>
                    )}
                  </div>

                  {notes.quiz_questions?.map((q, qIndex) => {
                    const selectedOption = userAnswers[q.id];
                    const isCorrect = selectedOption === q.correct_answer_index;
                    return (
                      <div key={q.id || qIndex} className="clean-panel" style={{ padding: '20px' }}>
                        <h4 style={{ fontSize: '0.98rem', fontWeight: 700, marginBottom: '14px', color: '#0f172a' }}>
                          {qIndex + 1}. {q.question}
                        </h4>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {q.options?.map((opt, oIndex) => {
                            let optionBorder = 'var(--border-color)';
                            let optionBg = '#ffffff';
                            
                            if (quizSubmitted) {
                              if (oIndex === q.correct_answer_index) {
                                optionBorder = 'var(--accent-emerald)';
                                optionBg = '#ecfdf5';
                              } else if (selectedOption === oIndex) {
                                optionBorder = 'var(--accent-rose)';
                                optionBg = '#fff1f2';
                              }
                            } else if (selectedOption === oIndex) {
                              optionBorder = 'var(--primary)';
                              optionBg = 'var(--primary-light)';
                            }

                            return (
                              <div
                                key={oIndex}
                                onClick={() => handleSelectQuizOption(q.id, oIndex)}
                                style={{
                                  padding: '12px 16px',
                                  borderRadius: 'var(--radius-sm)',
                                  border: `1px solid ${optionBorder}`,
                                  background: optionBg,
                                  cursor: quizSubmitted ? 'default' : 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  fontSize: '0.88rem',
                                  transition: 'all 0.15s',
                                  color: '#0f172a'
                                }}
                              >
                                <span>{opt}</span>
                                {quizSubmitted && oIndex === q.correct_answer_index && (
                                  <Check size={16} color="var(--accent-emerald)" />
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {quizSubmitted && (
                          <div style={{
                            marginTop: '12px',
                            padding: '10px 14px',
                            borderRadius: 'var(--radius-sm)',
                            background: isCorrect ? '#ecfdf5' : '#fff1f2',
                            fontSize: '0.82rem',
                            color: isCorrect ? '#047857' : '#be123c'
                          }}>
                            <strong>{isCorrect ? 'Correct! ' : 'Incorrect. '}</strong>
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {!quizSubmitted && notes.quiz_questions?.length > 0 && (
                    <button
                      onClick={() => {
                        setQuizSubmitted(true);
                        const allCorrect = notes.quiz_questions.every(q => userAnswers[q.id] === q.correct_answer_index);
                        if (allCorrect) {
                          confetti({ particleCount: 50, spread: 60 });
                        }
                      }}
                      className="btn btn-primary"
                      style={{ alignSelf: 'flex-start', padding: '10px 24px' }}
                    >
                      Submit Answers
                    </button>
                  )}
                </div>
              )}

              {/* TAB 7: AI Mentor Doubt Assistant */}
              {activeTab === 'mentor' && (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
                  <div style={{
                    background: 'var(--primary-light)',
                    border: '1px solid #bfdbfe',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <Sparkles size={20} color="var(--primary)" />
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e40af' }}>
                        AI Technical Mentor
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#1e3a8a' }}>
                        Have any doubts or questions about this module? Ask below for instant guidance.
                      </div>
                    </div>
                  </div>

                  <div style={{
                    minHeight: '260px',
                    maxHeight: '400px',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    padding: '14px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)'
                  }}>
                    {mentorChatHistory.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                        <MessageSquare size={32} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
                        <p style={{ fontSize: '0.88rem', margin: 0 }}>
                          No questions asked yet. Type your doubt below.
                        </p>
                      </div>
                    ) : (
                      mentorChatHistory.map((msg, i) => (
                        <div
                          key={i}
                          style={{
                            alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                            maxWidth: '85%',
                            background: msg.sender === 'user' ? 'var(--primary)' : '#ffffff',
                            color: msg.sender === 'user' ? '#ffffff' : '#0f172a',
                            padding: '12px 16px',
                            borderRadius: 'var(--radius-md)',
                            border: msg.sender === 'user' ? 'none' : '1px solid var(--border-color)',
                            boxShadow: 'var(--shadow-sm)',
                            fontSize: '0.88rem',
                            lineHeight: 1.5,
                            whiteSpace: 'pre-line'
                          }}
                        >
                          <strong style={{ display: 'block', fontSize: '0.75rem', opacity: 0.8, marginBottom: '4px' }}>
                            {msg.sender === 'user' ? 'You' : 'AI Mentor'}
                          </strong>
                          {msg.text}

                          {msg.followups?.length > 0 && (
                            <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
                              <span style={{ fontSize: '0.72rem', color: 'var(--primary)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                                Suggested Follow-ups:
                              </span>
                              {msg.followups.map((f, fi) => (
                                <button
                                  key={fi}
                                  onClick={() => { setMentorQuestion(f); }}
                                  style={{
                                    display: 'block',
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--primary)',
                                    fontSize: '0.78rem',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    padding: '2px 0'
                                  }}
                                >
                                  → {f}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                    {mentorLoading && (
                      <div style={{
                        alignSelf: 'flex-start',
                        background: '#ffffff',
                        padding: '10px 16px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.82rem',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border-color)'
                      }}>
                        AI Mentor is preparing an explanation...
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleAskMentor} style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="Ask a question about this module..."
                      className="form-input"
                      value={mentorQuestion}
                      onChange={(e) => setMentorQuestion(e.target.value)}
                    />
                    <button
                      type="submit"
                      disabled={mentorLoading || !mentorQuestion.trim()}
                      className="btn btn-primary"
                      style={{ padding: '0 20px' }}
                    >
                      <Send size={16} />
                    </button>
                  </form>
                </div>
              )}

            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
