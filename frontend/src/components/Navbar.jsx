import React, { useState, useEffect } from 'react';
import { LogIn, LogOut, User, LayoutDashboard, PlusCircle, Sparkles, BookOpen, Award, Briefcase, Smartphone } from 'lucide-react';

export default function Navbar({ 
  user, 
  currentView, 
  isHome = false,
  onOpenAuth, 
  onLogout, 
  onLogoClick, 
  onDashboardClick, 
  onNewPathClick,
  onStartJourney
}) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);

  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const isStandalone = typeof window !== 'undefined' && (
    window.matchMedia('(display-mode: standalone)').matches || 
    window.navigator.standalone === true
  );

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    window.addEventListener('appinstalled', () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSPrompt(true);
    }
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else if (onStartJourney) {
      onStartJourney();
    }
  };

  return (
    <header className={`navbar-header ${isHome ? 'is-home' : 'not-home'}`}>
      <div className="navbar-inner">
        {/* Brand: 3D LEARNMATE Logo + Tagline */}
        <div 
          onClick={user ? onDashboardClick : onLogoClick} 
          className="navbar-brand-badge"
          title={user ? "Go to Dashboard" : "LearnMate Home"}
        >
          <div 
            className="navbar-logo-box"
            style={{
              position: 'relative',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <img 
              src="/learnmate_icon.png" 
              alt="LearnMate Logo" 
              className="navbar-logo-img"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 4px 10px rgba(37, 99, 235, 0.3))',
                transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}
            />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="font-heading navbar-brand-title" style={{
                fontSize: '1.38rem',
                fontWeight: 900,
                letterSpacing: '-0.03em',
                background: 'linear-gradient(135deg, #0f172a 0%, #1e40af 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1
              }}>
                LEARNMATE
              </span>
              <span className="navbar-brand-pill" style={{
                fontSize: '0.66rem',
                fontWeight: 800,
                letterSpacing: '0.05em',
                padding: '2px 7px',
                borderRadius: '6px',
                background: 'rgba(37, 99, 235, 0.1)',
                color: '#1d4ed8',
                border: '1px solid rgba(37, 99, 235, 0.2)',
                textTransform: 'uppercase'
              }}>
                AI Engine
              </span>
            </div>
            <p className="navbar-brand-subtitle">
              Hyper-Personalized Career Roadmap & Notes Engine
            </p>
          </div>
        </div>

        {/* Center Navigation Bar */}
        {user ? (
          <nav className="navbar-center-nav" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255, 255, 255, 0.75)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(226, 232, 240, 0.85)',
            padding: '4px 6px',
            borderRadius: '9999px',
            boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)'
          }}>
            <button
              onClick={onDashboardClick}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '7px 18px',
                borderRadius: '9999px',
                border: 'none',
                background: currentView === 'dashboard' ? 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)' : 'transparent',
                color: currentView === 'dashboard' ? '#ffffff' : '#334155',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: currentView === 'dashboard' ? '0 3px 12px rgba(37, 99, 235, 0.3)' : 'none'
              }}
            >
              <LayoutDashboard size={15} />
              <span>Dashboard</span>
            </button>

            <button
              onClick={onNewPathClick}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 16px',
                borderRadius: '9999px',
                border: 'none',
                background: currentView === 'form' ? 'rgba(37, 99, 235, 0.12)' : 'transparent',
                color: currentView === 'form' ? '#1d4ed8' : '#475569',
                fontSize: '0.86rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              <PlusCircle size={15} />
              <span>New Path</span>
            </button>
          </nav>
        ) : (
          <nav className="navbar-center-nav" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            padding: '4px 6px',
            borderRadius: '9999px',
            boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)'
          }}>
            <button 
              onClick={() => scrollToSection('how-it-works')}
              className="nav-link-pill"
            >
              <Sparkles size={14} color="#2563eb" />
              <span>Gap Analysis</span>
            </button>
            <button 
              onClick={() => scrollToSection('how-it-works')}
              className="nav-link-pill"
            >
              <BookOpen size={14} color="#059669" />
              <span>Study Labs</span>
            </button>
            <button 
              onClick={() => scrollToSection('how-it-works')}
              className="nav-link-pill"
            >
              <Award size={14} color="#d97706" />
              <span>Credentials</span>
            </button>
          </nav>
        )}

        {/* Right side: User Profile + Logout OR Sign In */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {!isStandalone && (isInstallable || isIOS) && (
            <button 
              onClick={handleInstallClick}
              className="btn-install-app"
              title="Install Learnmate App"
            >
              <Smartphone size={15} />
              <span className="install-btn-text-full">Install App</span>
              <span className="install-btn-text-short">Install</span>
            </button>
          )}

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div 
                onClick={onDashboardClick}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(255, 255, 255, 0.85)',
                  border: '1px solid var(--border-color)',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)'
                }}
                title="View your dashboard"
              >
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.78rem',
                  fontWeight: 800
                }}>
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="navbar-user-name" style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {user.name}
                </span>
              </div>

              <button 
                onClick={onLogout} 
                className="btn btn-secondary" 
                title="Sign Out"
                style={{ padding: '7px 12px', fontSize: '0.82rem', gap: '6px', background: 'rgba(255, 255, 255, 0.85)' }}
              >
                <LogOut size={15} color="var(--accent-rose)" />
                <span className="navbar-signout-text">Sign Out</span>
              </button>
            </div>
          ) : (
            <button 
              onClick={onOpenAuth} 
              className="navbar-auth-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.9rem',
                fontWeight: 700,
                padding: '9px 22px',
                borderRadius: '11px',
                border: 'none',
                background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #0284c7 100%)',
                color: '#ffffff',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(37, 99, 235, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.3)',
                transition: 'all 0.22s ease',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 6px 22px rgba(37, 99, 235, 0.45)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(37, 99, 235, 0.35)';
              }}
            >
              <LogIn size={15} />
              <span className="auth-btn-text-full">Sign In / Register</span>
              <span className="auth-btn-text-short">Sign In</span>
            </button>
          )}
        </div>

      </div>

      {showIOSPrompt && (
        <div 
          onClick={() => setShowIOSPrompt(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 99999
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              maxWidth: '380px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📲</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>
              Install Learnmate App
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5, marginBottom: '16px' }}>
              Add Learnmate to your iOS Home Screen for instant offline access and a full-screen experience:
            </p>
            <div style={{ textAlign: 'left', background: '#f8fafc', padding: '14px', borderRadius: '12px', fontSize: '0.86rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
              <div>1️⃣ Tap the <strong>Share</strong> icon in Safari's bottom toolbar.</div>
              <div>2️⃣ Scroll down and choose <strong>Add to Home Screen</strong>.</div>
              <div>3️⃣ Tap <strong>Add</strong> in the top-right corner.</div>
            </div>
            <button
              onClick={() => setShowIOSPrompt(false)}
              className="navbar-auth-btn"
              style={{ width: '100%', justifyContent: 'center', padding: '11px', borderRadius: '12px' }}
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
