import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
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
  FileCheck,
  RefreshCw,
  Clock,
  ShieldCheck,
  Target,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import confetti from 'canvas-confetti';

export default function AssessmentPage({ 
  roadmap, 
  onBack, 
  onCertificateIssued,
  onOpenCertificate
}) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [assessment, setAssessment] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    if (roadmap?.id) {
      loadAssessment(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setLoading(false);
    }
  }, [roadmap?.id]);

  const loadAssessment = async (forceRefresh = false) => {
    setLoading(true);
    setError('');
    setResult(null);
    setShowReview(false);
    setAnswers({});
    setCurrentIdx(0);

    try {
      const data = await api.getAssessment(roadmap.id, forceRefresh);
      setAssessment(data);
    } catch (err) {
      setError(err.message || 'Failed to load course assessment');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId, optionIndex) => {
    if (result) return; // Prevent selection changes after test is submitted
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
      const res = await api.submitAssessment(roadmap.id, answers);
      setResult(res);

      if (res.passed) {
        confetti({
          particleCount: 140,
          spread: 80,
          origin: { y: 0.5 }
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

  const questions = assessment?.questions || [];
  const currentQuestion = questions[currentIdx];
  const answeredCount = Object.keys(answers).length;
  const progressPct = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 24px 80px' }}>
      
      {/* Top Page Navigation Bar (Official Board of Examination Header) */}
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
          onClick={() => {
            if (Object.keys(answers).length > 0 && !result) {
              const confirmExit = window.confirm("Are you sure you want to leave? Your exam progress will not be saved until submitted.");
              if (!confirmExit) return;
            }
            onBack();
          }}
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
            <ShieldCheck size={13} color="#2563eb" /> {roadmap?.target_role || 'Professional'} Official Board Exam
          </span>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '5px 14px',
            borderRadius: '9999px',
            background: 'rgba(254, 252, 232, 0.85)',
            color: '#d97706',
            border: '1px solid rgba(254, 240, 138, 0.9)',
            fontSize: '0.78rem',
            fontWeight: 700
          }}>
            50 MCQs &bull; Pass Mark: 30 / 50 (60%)
          </span>
          {assessment?.language && (
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
              Language: {assessment.language}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {!result && (
            <button
              onClick={() => {
                const confirmRefresh = window.confirm("Regenerating will fetch a fresh zero-duplicate 50-MCQ set. Continue?");
                if (confirmRefresh) loadAssessment(true);
              }}
              disabled={loading || submitting}
              className="btn btn-secondary"
              title="Generate fresh zero-duplicate questions"
              style={{ 
                fontSize: '0.82rem', 
                padding: '8px 14px', 
                gap: '6px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid rgba(226, 232, 240, 0.9)'
              }}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Regenerate Fresh 50 MCQs</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Page Area */}
      {loading ? (
        <div className="clean-panel" style={{
          padding: '80px 30px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '18px',
          background: 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.95)',
          borderRadius: '24px',
          boxShadow: '0 20px 50px -10px rgba(15, 23, 42, 0.08)'
        }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            border: '4px solid #dbeafe',
            borderTopColor: '#2563eb',
            animation: 'spin 1s linear infinite'
          }} />
          <h2 className="font-heading" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Synthesizing 50 Official Examination Questions...
          </h2>
          <p style={{ fontSize: '0.92rem', color: '#64748b', maxWidth: '580px', textAlign: 'center', margin: 0, lineHeight: 1.6 }}>
            Generating domain-accurate, milestone-aligned evaluation questions for <strong style={{ color: '#0f172a' }}>{roadmap?.target_role}</strong> in {roadmap?.user_profile?.preferred_language || 'your selected language'}.
          </p>
        </div>
      ) : error ? (
        <div style={{
          background: 'rgba(255, 241, 242, 0.9)',
          border: '1px solid rgba(254, 205, 211, 0.9)',
          borderRadius: '20px',
          padding: '40px 24px',
          textAlign: 'center',
          backdropFilter: 'blur(16px)'
        }}>
          <AlertCircle size={44} color="#be123c" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.25rem', color: '#be123c', fontWeight: 800, marginBottom: '8px' }}>
            Unable to Load Exam
          </h3>
          <p style={{ color: '#9f1239', fontSize: '0.92rem', marginBottom: '20px' }}>{error}</p>
          <button onClick={() => loadAssessment(true)} className="btn btn-primary" style={{ borderRadius: '12px' }}>
            Try Generating Again
          </button>
        </div>
      ) : result ? (
        /* Full-Page Exam Results View */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          <div className="clean-panel" style={{
            background: result.passed 
              ? 'linear-gradient(135deg, rgba(236, 253, 245, 0.95) 0%, rgba(209, 250, 229, 0.9) 100%)' 
              : 'linear-gradient(135deg, rgba(254, 242, 242, 0.95) 0%, rgba(254, 226, 226, 0.9) 100%)',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${result.passed ? 'rgba(167, 243, 208, 0.95)' : 'rgba(254, 202, 202, 0.95)'}`,
            borderRadius: '24px',
            padding: '48px 36px',
            textAlign: 'center',
            boxShadow: result.passed ? '0 20px 50px -10px rgba(16, 185, 129, 0.2)' : '0 20px 50px -10px rgba(239, 68, 68, 0.15)'
          }}>
            <div style={{
              width: '76px',
              height: '76px',
              borderRadius: '22px',
              background: result.passed ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: result.passed ? '0 8px 24px rgba(16, 185, 129, 0.4)' : '0 8px 24px rgba(239, 68, 68, 0.35)'
            }}>
              {result.passed ? <Award size={44} /> : <XCircle size={44} />}
            </div>

            <h1 className="font-heading" style={{
              fontSize: 'clamp(2rem, 3.8vw, 2.5rem)',
              fontWeight: 900,
              color: result.passed ? '#065f46' : '#991b1b',
              marginBottom: '10px',
              letterSpacing: '-0.025em'
            }}>
              {result.passed ? 'Official Certification Examination Passed!' : 'Examination Not Cleared'}
            </h1>

            <p style={{
              fontSize: '1.08rem',
              color: result.passed ? '#047857' : '#991b1b',
              maxWidth: '680px',
              margin: '0 auto 28px',
              lineHeight: 1.6
            }}>
              {result.passed 
                ? `Outstanding performance! You scored ${result.score} out of 50 (${result.percentage}%). You have surpassed the official evaluation threshold (>= 30/50) and earned your officially verified Certificate of Mastery in ${roadmap?.target_role}.`
                : `You scored ${result.score} out of 50 (${result.percentage}%). A minimum score of 30 marks (60%) is required to earn your official credentials. Review the detailed explanations below and retake the test.`
              }
            </p>

            {/* Score Stats Badge Group */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '32px',
              background: 'rgba(255, 255, 255, 0.94)',
              backdropFilter: 'blur(16px)',
              padding: '16px 36px',
              borderRadius: '9999px',
              boxShadow: '0 8px 24px -4px rgba(15, 23, 42, 0.08), inset 0 1px 2px rgba(255, 255, 255, 1)',
              border: '1px solid rgba(255, 255, 255, 0.95)',
              marginBottom: '32px',
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}>
              <div>
                <span style={{ fontSize: '0.74rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800, display: 'block' }}>
                  Total Score
                </span>
                <strong style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a' }}>
                  {result.score} <span style={{ fontSize: '1.05rem', color: '#94a3b8' }}>/ 50</span>
                </strong>
              </div>
              <div style={{ height: '32px', width: '1px', background: 'rgba(226, 232, 240, 0.9)' }} />
              <div>
                <span style={{ fontSize: '0.74rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800, display: 'block' }}>
                  Percentage
                </span>
                <strong style={{ fontSize: '1.6rem', fontWeight: 900, color: result.passed ? '#059669' : '#e11d48' }}>
                  {result.percentage}%
                </strong>
              </div>
              <div style={{ height: '32px', width: '1px', background: 'rgba(226, 232, 240, 0.9)' }} />
              <div>
                <span style={{ fontSize: '0.74rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800, display: 'block' }}>
                  Official Standing
                </span>
                <strong style={{ fontSize: '1.6rem', fontWeight: 900, color: result.passed ? '#059669' : '#e11d48' }}>
                  {result.passed ? 'AUTHENTICATED' : 'RETAKE REQUIRED'}
                </strong>
              </div>
            </div>

            {/* Result Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
              {result.passed && (
                <button
                  onClick={onOpenCertificate}
                  className="btn"
                  style={{ 
                    fontSize: '1rem', 
                    padding: '14px 32px', 
                    gap: '8px', 
                    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                    color: '#ffffff',
                    borderRadius: '13px',
                    fontWeight: 800,
                    boxShadow: '0 8px 24px -4px rgba(16, 185, 129, 0.45)'
                  }}
                >
                  <Award size={20} />
                  <span>View Official Verified Certificate</span>
                </button>
              )}

              <button
                onClick={() => loadAssessment(true)}
                className="btn btn-secondary"
                style={{ 
                  fontSize: '0.96rem', 
                  padding: '14px 28px', 
                  gap: '8px',
                  borderRadius: '13px',
                  background: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid rgba(226, 232, 240, 0.95)'
                }}
              >
                <RotateCcw size={18} />
                <span>{result.passed ? 'Retake Exam (Fresh 50 MCQs)' : 'Retake Examination'}</span>
              </button>

              <button
                onClick={() => setShowReview(!showReview)}
                className="btn btn-secondary"
                style={{ 
                  fontSize: '0.96rem', 
                  padding: '14px 28px', 
                  gap: '8px',
                  borderRadius: '13px',
                  background: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid rgba(226, 232, 240, 0.95)'
                }}
              >
                <HelpCircle size={18} />
                <span>{showReview ? 'Hide Explanations' : 'Review All 50 Questions & Explanations'}</span>
              </button>
            </div>
          </div>

          {/* Detailed Question Review List */}
          {showReview && (
            <div className="clean-panel" style={{
              padding: '36px',
              background: 'rgba(255, 255, 255, 0.88)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.95)',
              borderRadius: '24px',
              boxShadow: '0 16px 40px -8px rgba(15, 23, 42, 0.07)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid rgba(226, 232, 240, 0.8)' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                  border: '1px solid #bfdbfe',
                  color: '#1d4ed8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <HelpCircle size={20} />
                </div>
                <div>
                  <h2 className="font-heading" style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Detailed Question-by-Question Evaluation
                  </h2>
                  <p style={{ fontSize: '0.86rem', color: '#64748b', margin: '2px 0 0' }}>
                    Review every question, your selected answer, the verified correct option, and comprehensive AI explanation.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {result.reviews?.map((rev, rIdx) => (
                  <div
                    key={rIdx}
                    style={{
                      padding: '24px 26px',
                      borderRadius: '16px',
                      border: `1px solid ${rev.is_correct ? 'rgba(167, 243, 208, 0.95)' : 'rgba(254, 202, 202, 0.95)'}`,
                      background: rev.is_correct ? 'rgba(240, 253, 244, 0.85)' : 'rgba(254, 242, 242, 0.85)',
                      boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Question #{rev.number < 10 ? `0${rev.number}` : rev.number} of 50
                      </span>
                      <span className={`badge ${rev.is_correct ? 'badge-emerald' : 'badge-rose'}`} style={{ fontSize: '0.76rem', fontWeight: 700 }}>
                        {rev.is_correct ? '✓ Correct (+1 Mark)' : '✗ Incorrect (0 Marks)'}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.08rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px', lineHeight: 1.5 }}>
                      {rev.question}
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px', marginBottom: '16px' }}>
                      {rev.options?.map((opt, oIdx) => {
                        const isUserChoice = rev.selected_option_index === oIdx;
                        const isCorrect = rev.correct_answer_index === oIdx;

                        let bg = 'rgba(255, 255, 255, 0.92)';
                        let border = 'rgba(226, 232, 240, 0.9)';
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
                              padding: '12px 16px',
                              borderRadius: '10px',
                              border: `1px solid ${border}`,
                              background: bg,
                              color: text,
                              fontSize: '0.88rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                            }}
                          >
                            <span><strong>{String.fromCharCode(65 + oIdx)}.</strong> {opt}</span>
                            {isCorrect && (
                              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#15803d', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                                ✓ Correct Option
                              </span>
                            )}
                            {isUserChoice && !isCorrect && (
                              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#b91c1c', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                                ✗ Your Answer
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {rev.explanation && (
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.92)',
                        border: '1px solid rgba(226, 232, 240, 0.95)',
                        padding: '14px 18px',
                        borderRadius: '10px',
                        fontSize: '0.86rem',
                        color: '#334155',
                        lineHeight: 1.6
                      }}>
                        <strong style={{ color: '#0f172a' }}>AI Explanation: </strong> {rev.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      ) : currentQuestion ? (
        /* Standalone Full-Page Examination Hall */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 340px',
          gap: '32px',
          alignItems: 'start'
        }}>
          
          {/* Left Column: Active Question & Interactive Choices */}
          <div>
            {/* Header info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 14px',
                borderRadius: '9999px',
                background: 'rgba(37, 99, 235, 0.08)',
                color: '#1d4ed8',
                border: '1px solid rgba(191, 219, 254, 0.9)',
                fontSize: '0.8rem',
                fontWeight: 800,
                letterSpacing: '0.03em'
              }}>
                <Sparkles size={13} color="#2563eb" /> {currentQuestion.module_title || `Curriculum Section ${Math.ceil((currentIdx + 1) / 10)}`}
              </span>

              <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                Question {currentIdx + 1} of {questions.length}
              </span>
            </div>

            {/* Main Question Card (Frosted Glass Hall) */}
            <div className="clean-panel" style={{
              padding: '36px',
              background: 'rgba(255, 255, 255, 0.88)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.95)',
              borderRadius: '24px',
              boxShadow: '0 16px 40px -8px rgba(15, 23, 42, 0.07)',
              marginBottom: '28px'
            }}>
              <h2 className="font-heading" style={{
                fontSize: '1.35rem',
                fontWeight: 800,
                color: '#0f172a',
                lineHeight: 1.55,
                marginBottom: '28px',
                letterSpacing: '-0.01em'
              }}>
                {currentQuestion.question}
              </h2>

              {/* 4 Interactive Option Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {currentQuestion.options?.map((opt, oIdx) => {
                  const isSelected = answers[currentQuestion.id] === oIdx;

                  return (
                    <div
                      key={oIdx}
                      onClick={() => handleSelectOption(currentQuestion.id, oIdx)}
                      style={{
                        padding: '18px 22px',
                        borderRadius: '16px',
                        border: isSelected ? '2px solid #2563eb' : '1px solid rgba(226, 232, 240, 0.95)',
                        background: isSelected ? 'linear-gradient(135deg, rgba(239, 246, 255, 0.95) 0%, rgba(219, 234, 254, 0.9) 100%)' : 'rgba(255, 255, 255, 0.9)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        transition: 'all 0.18s ease',
                        boxShadow: isSelected ? '0 8px 24px -4px rgba(37, 99, 235, 0.25)' : '0 2px 6px rgba(15, 23, 42, 0.02)',
                        transform: isSelected ? 'translateY(-1px)' : 'none'
                      }}
                    >
                      <span style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        border: isSelected ? '2px solid #2563eb' : '1px solid #cbd5e1',
                        background: isSelected ? 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)' : '#ffffff',
                        color: isSelected ? '#ffffff' : '#475569',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.92rem',
                        fontWeight: 900,
                        flexShrink: 0,
                        boxShadow: isSelected ? '0 3px 10px rgba(37, 99, 235, 0.3)' : 'none'
                      }}>
                        {String.fromCharCode(65 + oIdx)}
                      </span>

                      <span style={{
                        fontSize: '1rem',
                        color: isSelected ? '#1d4ed8' : '#1e293b',
                        fontWeight: isSelected ? 700 : 500,
                        lineHeight: 1.5,
                        flex: 1
                      }}>
                        {opt}
                      </span>

                      {isSelected && (
                        <CheckCircle2 size={22} color="#2563eb" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Navigation Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                disabled={currentIdx === 0}
                className="btn btn-secondary"
                style={{ 
                  fontSize: '0.92rem', 
                  padding: '12px 24px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid rgba(226, 232, 240, 0.95)'
                }}
              >
                <ChevronLeft size={18} />
                <span>Previous Question</span>
              </button>

              {currentIdx < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1))}
                  className="btn btn-primary"
                  style={{ 
                    fontSize: '0.92rem', 
                    padding: '12px 28px',
                    borderRadius: '12px'
                  }}
                >
                  <span>Next Question</span>
                  <ChevronRight size={18} />
                </button>
              ) : (
                <button
                  onClick={handleSubmitExam}
                  disabled={submitting}
                  className="btn"
                  style={{ 
                    fontSize: '0.95rem', 
                    padding: '13px 30px', 
                    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                    color: '#ffffff',
                    borderRadius: '12px',
                    fontWeight: 800,
                    boxShadow: '0 6px 20px rgba(16, 185, 129, 0.35)'
                  }}
                >
                  <Send size={18} />
                  <span>{submitting ? 'Grading Answers...' : 'Finish & Submit Examination'}</span>
                </button>
              )}
            </div>

          </div>

          {/* Right Column: Dedicated Sticky Exam Palette Sidebar */}
          <div className="clean-panel" style={{
            position: 'sticky',
            top: '90px',
            background: 'rgba(255, 255, 255, 0.88)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.95)',
            borderRadius: '24px',
            padding: '24px',
            boxShadow: '0 16px 40px -8px rgba(15, 23, 42, 0.08)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 className="font-heading" style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Question Palette
              </h3>
              <span style={{ 
                fontSize: '0.8rem', 
                fontWeight: 800, 
                color: '#1d4ed8',
                background: 'rgba(37, 99, 235, 0.08)',
                padding: '3px 10px',
                borderRadius: '9999px',
                border: '1px solid rgba(191, 219, 254, 0.8)'
              }}>
                {answeredCount} / {questions.length} Answered
              </span>
            </div>

            {/* Completion Progress Bar */}
            <div style={{
              width: '100%',
              height: '8px',
              background: 'rgba(226, 232, 240, 0.8)',
              borderRadius: '9999px',
              marginBottom: '18px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${progressPct}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #1d4ed8 0%, #0284c7 100%)',
                borderRadius: '9999px',
                transition: 'width 0.3s ease'
              }} />
            </div>

            {/* 50 Numbered Question Bubbles Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '8px',
              maxHeight: '380px',
              overflowY: 'auto',
              paddingRight: '4px',
              marginBottom: '20px'
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
                      borderRadius: '9px',
                      border: isCurrent ? '2px solid #1d4ed8' : (isAnswered ? '1px solid #93c5fd' : '1px solid rgba(226, 232, 240, 0.9)'),
                      background: isAnswered ? 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)' : (isCurrent ? 'rgba(239, 246, 255, 0.95)' : '#ffffff'),
                      color: isAnswered ? '#ffffff' : (isCurrent ? '#1d4ed8' : '#64748b'),
                      fontWeight: 800,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s ease',
                      boxShadow: isCurrent ? '0 0 0 3px rgba(37,99,235,0.18)' : (isAnswered ? '0 2px 6px rgba(37,99,235,0.2)' : 'none')
                    }}
                    title={`Question ${idx + 1}: ${isAnswered ? 'Answered' : 'Unanswered'}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Sidebar CTA */}
            <div style={{ paddingTop: '16px', borderTop: '1px solid rgba(226, 232, 240, 0.8)' }}>
              <button
                onClick={handleSubmitExam}
                disabled={submitting}
                className="btn btn-primary"
                style={{ 
                  width: '100%', 
                  fontSize: '0.92rem', 
                  padding: '12px',
                  borderRadius: '12px',
                  boxShadow: '0 4px 16px rgba(37, 99, 235, 0.35)'
                }}
              >
                <FileCheck size={18} />
                <span>{submitting ? 'Grading...' : 'Submit Examination'}</span>
              </button>
            </div>

          </div>

        </div>
      ) : (
        <div className="clean-panel" style={{
          padding: '60px 24px',
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.95)',
          boxShadow: '0 16px 40px -8px rgba(15, 23, 42, 0.07)'
        }}>
          <AlertCircle size={44} color="#f59e0b" style={{ margin: '0 auto 16px' }} />
          <h3 className="font-heading" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
            Assessment Questions Preparing
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.92rem', marginBottom: '22px', maxWidth: '480px', margin: '0 auto 22px' }}>
            The 50 official examination questions are being compiled. Click below to load or synthesize the questions now.
          </p>
          <button onClick={() => loadAssessment(true)} className="btn btn-primary" style={{ padding: '12px 26px' }}>
            <RefreshCw size={16} />
            <span>Load / Synthesize 50 Questions</span>
          </button>
        </div>
      )}

    </div>
  );
}
