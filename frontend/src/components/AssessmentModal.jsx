import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  Award, 
  HelpCircle, 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  RotateCcw, 
  Check, 
  AlertCircle,
  FileCheck
} from 'lucide-react';
import { api } from '../services/api';
import confetti from 'canvas-confetti';

export default function AssessmentModal({ 
  isOpen, 
  onClose, 
  roadmapId, 
  roadmapTitle, 
  targetRole,
  onCertificateIssued 
}) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [assessment, setAssessment] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    if (isOpen && roadmapId) {
      loadAssessment();
    }
  }, [isOpen, roadmapId]);

  const loadAssessment = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    setShowReview(false);
    setAnswers({});
    setCurrentIdx(0);

    try {
      const data = await api.getAssessment(roadmapId);
      setAssessment(data);
    } catch (err) {
      setError(err.message || 'Failed to load course assessment');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId, optionIndex) => {
    if (result) return; // Prevent change after submission
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleSubmitExam = async () => {
    const totalQ = assessment?.questions?.length || 50;
    const answeredCount = Object.keys(answers).length;

    if (answeredCount < totalQ) {
      const confirmUnanswered = window.confirm(
        `You have answered ${answeredCount} out of ${totalQ} questions. Are you sure you want to submit?`
      );
      if (!confirmUnanswered) return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await api.submitAssessment(roadmapId, answers);
      setResult(res);

      if (res.passed) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
        if (res.certificate && onCertificateIssued) {
          onCertificateIssued(res.certificate);
        }
      }
    } catch (err) {
      setError(err.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const questions = assessment?.questions || [];
  const currentQuestion = questions[currentIdx];
  const answeredCount = Object.keys(answers).length;
  const progressPct = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      background: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="clean-panel animate-fade-in" style={{
        maxWidth: '1000px',
        width: '100%',
        maxHeight: '92vh',
        background: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-xl)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative'
      }}>
        
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-color)',
          background: 'var(--bg-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-primary" style={{ fontSize: '0.74rem' }}>
                Course Final Assessment
              </span>
              <span className="badge badge-amber" style={{ fontSize: '0.74rem' }}>
                Pass Mark: 30 / 50
              </span>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 0' }}>
              {targetRole || 'Professional'} Certification Exam (50 MCQs)
            </h2>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                border: '3px solid var(--primary-light)',
                borderTopColor: 'var(--primary)',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px'
              }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>
                Preparing Your 50-Question Final Assessment...
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', maxWidth: '500px', margin: '8px auto 0' }}>
                The AI exam board is structuring 50 questions across all curriculum milestones in your selected language.
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
              <AlertCircle size={36} color="#be123c" style={{ margin: '0 auto 10px' }} />
              <p style={{ color: '#be123c', fontWeight: 600, marginBottom: '14px' }}>{error}</p>
              <button onClick={loadAssessment} className="btn btn-primary">
                Try Loading Again
              </button>
            </div>
          ) : result ? (
            /* Result Screen */
            <div>
              <div style={{
                background: result.passed ? '#ecfdf5' : '#fff1f2',
                border: `1px solid ${result.passed ? '#a7f3d0' : '#fecdd3'}`,
                borderRadius: 'var(--radius-lg)',
                padding: '36px 24px',
                textAlign: 'center',
                marginBottom: '28px'
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: result.passed ? '#d1fae5' : '#ffe4e6',
                  color: result.passed ? 'var(--accent-emerald)' : 'var(--accent-rose)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  {result.passed ? <Award size={36} /> : <XCircle size={36} />}
                </div>

                <h2 style={{
                  fontSize: '2rem',
                  fontWeight: 800,
                  color: result.passed ? '#065f46' : '#9f1239',
                  marginBottom: '8px'
                }}>
                  {result.passed ? 'Congratulations! You Passed!' : 'Assessment Not Cleared'}
                </h2>

                <p style={{
                  fontSize: '1.05rem',
                  color: result.passed ? '#047857' : '#be123c',
                  maxWidth: '600px',
                  margin: '0 auto 20px',
                  lineHeight: 1.5
                }}>
                  {result.passed 
                    ? `You scored ${result.score} out of 50 (${result.percentage}%). You have successfully met the passing threshold (>= 30 marks) and unlocked your official certificate!`
                    : `You scored ${result.score} out of 50 (${result.percentage}%). A minimum of 30 marks (60%) is required to earn your certificate. Please review your answers and retake the exam.`
                  }
                </p>

                {/* Score Stats */}
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '24px',
                  background: '#ffffff',
                  padding: '12px 28px',
                  borderRadius: 'var(--radius-full)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  marginBottom: '24px'
                }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Score</span>
                    <strong style={{ fontSize: '1.3rem', color: '#0f172a' }}>{result.score} / 50</strong>
                  </div>
                  <div style={{ height: '24px', width: '1px', background: '#e2e8f0' }} />
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Percentage</span>
                    <strong style={{ fontSize: '1.3rem', color: result.passed ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                      {result.percentage}%
                    </strong>
                  </div>
                  <div style={{ height: '24px', width: '1px', background: '#e2e8f0' }} />
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Status</span>
                    <strong style={{ fontSize: '1.3rem', color: result.passed ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                      {result.passed ? 'PASSED' : 'RETRY'}
                    </strong>
                  </div>
                </div>

                {/* Result Actions */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
                  {result.passed && result.certificate && (
                    <button
                      onClick={() => {
                        onClose();
                        if (onCertificateIssued) onCertificateIssued(result.certificate);
                      }}
                      className="btn btn-primary"
                      style={{ fontSize: '0.95rem', padding: '12px 24px' }}
                    >
                      <Award size={18} />
                      <span>View Official Certificate</span>
                    </button>
                  )}

                  {!result.passed && (
                    <button
                      onClick={loadAssessment}
                      className="btn btn-primary"
                      style={{ fontSize: '0.95rem', padding: '12px 24px' }}
                    >
                      <RotateCcw size={16} />
                      <span>Retake Assessment</span>
                    </button>
                  )}

                  <button
                    onClick={() => setShowReview(!showReview)}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.95rem', padding: '12px 20px' }}
                  >
                    <HelpCircle size={16} />
                    <span>{showReview ? 'Hide Answers' : 'Review All 50 Answers'}</span>
                  </button>
                </div>
              </div>

              {/* Review Section */}
              {showReview && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                    Detailed Question-by-Question Review
                  </h3>

                  {result.reviews?.map((rev, rIdx) => (
                    <div
                      key={rIdx}
                      style={{
                        padding: '18px 20px',
                        borderRadius: 'var(--radius-md)',
                        border: `1px solid ${rev.is_correct ? '#86efac' : '#fca5a5'}`,
                        background: rev.is_correct ? '#f0fdf4' : '#fff1f2'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                          Question {rev.number} of 50
                        </span>
                        <span className={`badge ${rev.is_correct ? 'badge-emerald' : 'badge-rose'}`} style={{ fontSize: '0.72rem' }}>
                          {rev.is_correct ? 'Correct (+1)' : 'Incorrect (0)'}
                        </span>
                      </div>

                      <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>
                        {rev.question}
                      </h4>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                        {rev.options?.map((opt, oIdx) => {
                          const isUserChoice = rev.selected_option_index === oIdx;
                          const isCorrect = rev.correct_answer_index === oIdx;

                          let bg = '#ffffff';
                          let border = '#e2e8f0';
                          let text = '#334155';

                          if (isCorrect) {
                            bg = '#dcfce7';
                            border = '#22c55e';
                            text = '#15803d';
                          } else if (isUserChoice && !rev.is_correct) {
                            bg = '#fee2e2';
                            border = '#ef4444';
                            text = '#b91c1c';
                          }

                          return (
                            <div
                              key={oIdx}
                              style={{
                                padding: '10px 14px',
                                borderRadius: 'var(--radius-sm)',
                                border: `1px solid ${border}`,
                                background: bg,
                                color: text,
                                fontSize: '0.88rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                              }}
                            >
                              <span>{String.fromCharCode(65 + oIdx)}. {opt}</span>
                              {isCorrect && (
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#15803d' }}>
                                  ✓ Correct Answer
                                </span>
                              )}
                              {isUserChoice && !isCorrect && (
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#b91c1c' }}>
                                  ✗ Your Choice
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {rev.explanation && (
                        <div style={{
                          background: 'rgba(255,255,255,0.7)',
                          padding: '10px 14px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.82rem',
                          color: '#475569',
                          lineHeight: 1.5
                        }}>
                          <strong>Explanation: </strong> {rev.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

            </div>
          ) : currentQuestion ? (
            /* Active Exam View */
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '28px', alignItems: 'start' }}>
              
              {/* Question Column */}
              <div>
                {/* Module Tag & Progress */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
                    {currentQuestion.module_title || `Question ${currentIdx + 1}`}
                  </span>

                  <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Question {currentIdx + 1} of {questions.length}
                  </span>
                </div>

                {/* Question Card */}
                <div className="clean-panel" style={{ padding: '24px', background: '#ffffff', marginBottom: '24px' }}>
                  <h3 style={{
                    fontSize: '1.18rem',
                    fontWeight: 700,
                    color: '#0f172a',
                    lineHeight: 1.5,
                    marginBottom: '20px'
                  }}>
                    {currentQuestion.question}
                  </h3>

                  {/* 4 Options */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {currentQuestion.options?.map((opt, oIdx) => {
                      const isSelected = answers[currentQuestion.id] === oIdx;

                      return (
                        <div
                          key={oIdx}
                          onClick={() => handleSelectOption(currentQuestion.id, oIdx)}
                          style={{
                            padding: '14px 18px',
                            borderRadius: 'var(--radius-md)',
                            border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border-color)'}`,
                            background: isSelected ? 'var(--primary-light)' : '#ffffff',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            transition: 'all 0.15s'
                          }}
                        >
                          <span style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            border: `2px solid ${isSelected ? 'var(--primary)' : '#cbd5e1'}`,
                            background: isSelected ? 'var(--primary)' : '#ffffff',
                            color: isSelected ? '#ffffff' : '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            flexShrink: 0
                          }}>
                            {String.fromCharCode(65 + oIdx)}
                          </span>

                          <span style={{
                            fontSize: '0.94rem',
                            color: isSelected ? 'var(--primary)' : '#1e293b',
                            fontWeight: isSelected ? 600 : 500,
                            lineHeight: 1.45
                          }}>
                            {opt}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Nav Buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button
                    onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                    disabled={currentIdx === 0}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.88rem' }}
                  >
                    <ChevronLeft size={16} />
                    <span>Previous</span>
                  </button>

                  {currentIdx < questions.length - 1 ? (
                    <button
                      onClick={() => setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1))}
                      className="btn btn-primary"
                      style={{ fontSize: '0.88rem' }}
                    >
                      <span>Next</span>
                      <ChevronRight size={16} />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmitExam}
                      disabled={submitting}
                      className="btn btn-primary"
                      style={{ fontSize: '0.88rem', background: 'var(--accent-emerald)' }}
                    >
                      <Send size={16} />
                      <span>{submitting ? 'Submitting...' : 'Finish & Submit Exam'}</span>
                    </button>
                  )}
                </div>

              </div>

              {/* Question Palette (1 to 50 Grid) */}
              <div style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>
                    Exam Palette
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {answeredCount} / {questions.length} answered
                  </span>
                </div>

                {/* Progress bar */}
                <div style={{
                  width: '100%',
                  height: '6px',
                  background: '#e2e8f0',
                  borderRadius: 'var(--radius-full)',
                  marginBottom: '14px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${progressPct}%`,
                    height: '100%',
                    background: 'var(--primary)',
                    borderRadius: 'var(--radius-full)',
                    transition: 'width 0.3s'
                  }} />
                </div>

                {/* 50 Bubbles */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: '6px',
                  maxHeight: '340px',
                  overflowY: 'auto',
                  paddingRight: '4px'
                }}>
                  {questions.map((q, idx) => {
                    const isAnswered = answers[q.id] !== undefined;
                    const isCurrent = currentIdx === idx;

                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentIdx(idx)}
                        style={{
                          aspectRatio: '1',
                          borderRadius: '6px',
                          border: isCurrent ? '2px solid #0f172a' : '1px solid var(--border-color)',
                          background: isAnswered ? 'var(--primary)' : '#ffffff',
                          color: isAnswered ? '#ffffff' : '#475569',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.15s'
                        }}
                        title={`Question ${idx + 1}: ${isAnswered ? 'Answered' : 'Unanswered'}`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>

                {/* Submit button on sidebar */}
                <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                  <button
                    onClick={handleSubmitExam}
                    disabled={submitting}
                    className="btn btn-primary"
                    style={{ width: '100%', fontSize: '0.84rem', padding: '10px' }}
                  >
                    <FileCheck size={16} />
                    <span>{submitting ? 'Grading...' : 'Submit Assessment'}</span>
                  </button>
                </div>

              </div>

            </div>
          ) : null}

        </div>

      </div>
    </div>
  );
}
