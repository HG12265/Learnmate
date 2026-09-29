import React, { useState, useEffect } from 'react';
import { X, Printer, Award, ShieldCheck, CheckCircle2, Edit2, Check, Download } from 'lucide-react';
import { api } from '../services/api';

export default function CertificateModal({ isOpen, onClose, certificate }) {
  if (!isOpen || !certificate) return null;

  const [userName, setUserName] = useState(certificate.user_name || '');
  const [isEditingName, setIsEditingName] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [downloadingCert, setDownloadingCert] = useState(false);

  useEffect(() => {
    if (certificate && certificate.user_name) {
      setUserName(certificate.user_name);
    }
  }, [certificate]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCertificate = async () => {
    if (downloadingCert) return;
    setDownloadingCert(true);
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const element = document.querySelector('.certificate-paper');
      if (!element) {
        window.print();
        return;
      }
      const opt = {
        margin: [5, 5, 5, 5],
        filename: `LEARNMATE_Certificate_${(userName || certificate.user_name || 'Learner').replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
      };
      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error('Certificate PDF export error, falling back to print:', err);
      window.print();
    } finally {
      setDownloadingCert(false);
    }
  };

  const handleSaveName = async () => {
    if (!userName.trim()) return;
    setSavingName(true);
    try {
      const updated = await api.updateCertificateName(certificate.roadmap_id, userName.trim());
      if (updated && updated.user_name) {
        certificate.user_name = updated.user_name;
        setUserName(updated.user_name);
      }
      setIsEditingName(false);
    } catch (err) {
      alert('Failed to update certificate name: ' + err.message);
    } finally {
      setSavingName(false);
    }
  };

  const formattedDate = certificate.issue_date 
    ? new Date(certificate.issue_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

  return (
    <div className="certificate-modal-overlay" style={{
      position: 'fixed',
      inset: 0,
      zIndex: 110,
      background: 'rgba(255, 255, 255, 0.45)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      overflowY: 'auto'
    }}>
      <div style={{ maxWidth: '940px', width: '100%', position: 'relative' }}>
        
        {/* Top Floating Action Bar (Hidden on print) */}
        <div className="no-print" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          background: '#ffffff',
          padding: '12px 20px',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-md)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={20} color="var(--accent-emerald)" />
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
              Official Verified Credential
            </span>
            <span className="badge badge-emerald" style={{ fontSize: '0.74rem' }}>
              Credential ID: {certificate.verification_code}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handleDownloadCertificate}
              disabled={downloadingCert}
              className="btn btn-primary"
              style={{ fontSize: '0.85rem', padding: '8px 16px', gap: '6px' }}
            >
              <Download size={15} className={downloadingCert ? 'animate-bounce' : ''} />
              <span>{downloadingCert ? 'Generating PDF...' : 'Download PDF'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="btn btn-secondary"
              title="Print Certificate"
              style={{ fontSize: '0.85rem', padding: '8px 12px', gap: '6px', background: '#f8fafc' }}
            >
              <Printer size={15} />
              <span>Print</span>
            </button>

            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Certificate Paper Container */}
        <div 
          className="certificate-paper"
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            padding: '48px',
            border: '12px solid #0f172a',
            outline: '2px solid #d97706',
            outlineOffset: '-8px',
            position: 'relative',
            textAlign: 'center',
            color: '#0f172a'
          }}
        >
          {/* Subtle Background Watermark */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(#f1f5f9 1.5px, transparent 1.5px)',
            backgroundSize: '24px 24px',
            opacity: 0.6,
            pointerEvents: 'none'
          }} />

          {/* Certificate Header Branding */}
          <div style={{ position: 'relative', zIndex: 1, marginBottom: '24px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '6px 18px',
              background: '#0f172a',
              color: '#ffffff',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.85rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '16px'
            }}>
              <Award size={16} color="#fbbf24" />
              <span>LEARNMATE BOARD OF EXAMINATION & CERTIFICATION</span>
            </div>

            <h1 style={{
              fontSize: '2.4rem',
              fontWeight: 900,
              color: '#0f172a',
              letterSpacing: '-0.02em',
              margin: '0 0 6px',
              textTransform: 'uppercase'
            }}>
              Certificate of Completion & Mastery
            </h1>

            <div style={{
              height: '3px',
              width: '120px',
              background: '#d97706',
              margin: '0 auto 20px',
              borderRadius: '2px'
            }} />

            <p style={{ fontSize: '1rem', color: '#64748b', fontStyle: 'italic', margin: 0 }}>
              This is to certify that
            </p>
          </div>

          {/* Recipient Name with Inline Edit Option */}
          <div style={{ position: 'relative', zIndex: 1, marginBottom: '20px' }}>
            {isEditingName ? (
              <div className="no-print" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter recipient name"
                  style={{
                    fontSize: '1.8rem',
                    fontWeight: 800,
                    color: '#1e3a8a',
                    padding: '4px 12px',
                    borderRadius: '6px',
                    border: '2px solid var(--primary)',
                    textAlign: 'center',
                    outline: 'none'
                  }}
                  autoFocus
                />
                <button
                  onClick={handleSaveName}
                  disabled={savingName}
                  className="btn btn-primary"
                  style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                >
                  <Check size={16} />
                  <span>{savingName ? 'Saving...' : 'Save'}</span>
                </button>
                <button
                  onClick={() => { setUserName(certificate.user_name || ''); setIsEditingName(false); }}
                  className="btn"
                  style={{ padding: '8px 12px', fontSize: '0.85rem', background: '#f1f5f9', color: '#64748b' }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  fontSize: '2.6rem',
                  fontWeight: 800,
                  color: '#1e3a8a',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  borderBottom: '2px solid #e2e8f0',
                  display: 'inline-block',
                  padding: '0 36px 6px'
                }}>
                  {userName || certificate.user_name || 'Learner'}
                </div>
                <button
                  onClick={() => setIsEditingName(true)}
                  className="no-print"
                  title="Edit Certificate Name"
                  style={{
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '6px',
                    cursor: 'pointer',
                    color: '#475569',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Edit2 size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Course Details */}
          <div style={{ position: 'relative', zIndex: 1, maxWidth: '680px', margin: '0 auto 32px' }}>
            <p style={{ fontSize: '1.05rem', color: '#334155', lineHeight: 1.6, margin: '0 0 12px' }}>
              has successfully completed all required curriculum modules and demonstrated domain mastery in
            </p>

            <h2 style={{
              fontSize: '1.8rem',
              fontWeight: 800,
              color: '#0f172a',
              margin: '0 0 12px'
            }}>
              {certificate.target_role}
            </h2>

            <p style={{ fontSize: '0.92rem', color: '#64748b', margin: 0 }}>
              Course Pathway: <strong>{certificate.course_title}</strong>
            </p>

            {/* Assessment Score Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              marginTop: '16px',
              padding: '8px 20px',
              background: '#f0fdf4',
              border: '1px solid #86efac',
              borderRadius: 'var(--radius-full)'
            }}>
              <CheckCircle2 size={16} color="#15803d" />
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#15803d' }}>
                Final Assessment Score: {certificate.score} / {certificate.total || 50} ({certificate.percentage}%) • Passed
              </span>
            </div>
          </div>

          {/* Certificate Footer (Signatures & Verification) */}
          <div style={{
            position: 'relative',
            zIndex: 1,
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            alignItems: 'end',
            paddingTop: '24px',
            borderTop: '1px solid #e2e8f0',
            gap: '20px'
          }}>
            {/* Left: Issue Date */}
            <div style={{ textAlign: 'left' }}>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', display: 'block' }}>
                Date of Issue
              </span>
              <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>
                {formattedDate}
              </strong>
            </div>

            {/* Center: Official Seal Badge */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '74px',
                height: '74px',
                borderRadius: '50%',
                border: '2px solid #d97706',
                margin: '0 auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#fffbeb',
                color: '#b45309',
                flexDirection: 'column',
                boxShadow: '0 4px 12px rgba(217, 119, 6, 0.15)'
              }}>
                <img 
                  src="/learnmate_icon.png" 
                  alt="Official Seal" 
                  style={{ width: '36px', height: '36px', objectFit: 'contain', marginBottom: '2px' }} 
                />
                <span style={{ fontSize: '0.52rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#b45309' }}>OFFICIAL</span>
              </div>
            </div>

            {/* Right: Signature & Verification */}
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontSize: '1.1rem',
                fontFamily: 'cursive',
                color: '#1e3a8a',
                marginBottom: '4px'
              }}>
                LearnMate Academic Board
              </div>
              <div style={{ height: '1px', background: '#cbd5e1', width: '160px', marginLeft: 'auto', marginBottom: '4px' }} />
              <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'block' }}>
                Authorized Verification
              </span>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontFamily: 'Fira Code, monospace' }}>
                ID: {certificate.verification_code}
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
