import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import HeroLanding from './components/HeroLanding';
import SkillForm from './components/SkillForm';
import RoadmapView from './components/RoadmapView';
import DashboardView from './components/DashboardView';
import ModuleNotesPage from './components/ModuleNotesPage';
import AssessmentPage from './components/AssessmentPage';
import CertificateModal from './components/CertificateModal';
import { api } from './services/api';

export default function App() {
  const [user, setUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Navigation view: 'home' | 'form' | 'dashboard' | 'roadmap' | 'notes' | 'assessment'
  const [view, setView] = useState('home');

  const [currentRoadmap, setCurrentRoadmap] = useState(null);
  const [activeModuleForNotes, setActiveModuleForNotes] = useState(null);
  const [generatingRoadmap, setGeneratingRoadmap] = useState(false);

  // Certificate State
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [certificate, setCertificate] = useState(null);

  useEffect(() => {
    const existingUser = api.getCurrentUser();
    if (existingUser) {
      setUser(existingUser);
      // Auto-open Dashboard on returning visit if user is logged in
      setView('dashboard');
    }
  }, []);

  // When roadmap changes, check if certificate was already earned
  useEffect(() => {
    if (currentRoadmap?.id) {
      api.getCertificate(currentRoadmap.id)
        .then(cert => {
          if (cert) setCertificate(cert);
          else setCertificate(null);
        })
        .catch(() => setCertificate(null));
    } else {
      setCertificate(null);
    }
  }, [currentRoadmap?.id]);

  const handleStartJourney = () => {
    if (user) {
      setView('dashboard');
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const handleAuthSuccess = async (authenticatedUser) => {
    setUser(authenticatedUser);
    // If user generated an anonymous roadmap prior to logging in, claim it to their account
    if (currentRoadmap?.id) {
      try {
        await api.claimRoadmap(currentRoadmap.id);
      } catch (e) {
        console.warn('Could not claim anonymous roadmap:', e);
      }
    }
    // Navigate straight to Dashboard so user sees all their saved pathways and certificates!
    setView('dashboard');
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setCurrentRoadmap(null);
    setActiveModuleForNotes(null);
    setCertificate(null);
    setView('home');
  };

  const handleGenerateRoadmap = async (profileData) => {
    setGeneratingRoadmap(true);
    try {
      const newRoadmap = await api.generateRoadmap(profileData);
      setCurrentRoadmap(newRoadmap);
      setCertificate(null);
      setView('roadmap');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      alert(`Roadmap generation error: ${err.message}`);
    } finally {
      setGeneratingRoadmap(false);
    }
  };

  // Open an existing saved roadmap WITHOUT re-generating
  const handleSelectSavedRoadmap = async (roadmapId) => {
    try {
      const loadedRoadmap = await api.getRoadmap(roadmapId);
      setCurrentRoadmap(loadedRoadmap);
      setView('roadmap');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      alert(`Failed to open saved pathway: ${err.message}`);
    }
  };

  const handleToggleComplete = async (moduleId, isCompleted) => {
    if (!currentRoadmap) return;
    try {
      const updated = await api.updateProgress(currentRoadmap.id, moduleId, isCompleted);
      setCurrentRoadmap(updated);
      if (activeModuleForNotes?.id === moduleId) {
        setActiveModuleForNotes(prev => prev ? { ...prev, is_completed: isCompleted } : null);
      }
    } catch (err) {
      console.error('Progress update failed:', err);
    }
  };

  const handleOpenModuleNotes = (mod) => {
    setActiveModuleForNotes(mod);
    setView('notes');
  };

  const handleOpenCertificateModal = (cert) => {
    setCertificate(cert);
    setIsCertificateModalOpen(true);
  };

  return (
    <div className="app-main-canvas">
      {/* Minimalist Professional Navbar with Dashboard Navigation */}
      <Navbar
        user={user}
        currentView={view}
        isHome={view === 'home'}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onLogoClick={() => setView(user ? 'dashboard' : 'home')}
        onDashboardClick={() => setView('dashboard')}
        onNewPathClick={() => setView('form')}
        onStartJourney={handleStartJourney}
      />

      {/* Main Views */}
      <main style={{ flex: 1 }}>
        {view === 'home' && (
          <HeroLanding onStartJourney={handleStartJourney} />
        )}

        {view === 'dashboard' && user && (
          <DashboardView
            user={user}
            onSelectRoadmap={handleSelectSavedRoadmap}
            onCreateNewPath={() => setView('form')}
            onOpenCertificate={handleOpenCertificateModal}
          />
        )}

        {view === 'form' && (
          <SkillForm
            onSubmit={handleGenerateRoadmap}
            loading={generatingRoadmap}
            initialData={user}
          />
        )}

        {view === 'roadmap' && currentRoadmap && (
          <RoadmapView
            roadmap={currentRoadmap}
            onOpenNotes={handleOpenModuleNotes}
            onToggleComplete={handleToggleComplete}
            onNewPath={() => setView(user ? 'dashboard' : 'form')}
            onOpenAssessment={() => setView('assessment')}
            certificate={certificate}
            onOpenCertificate={() => setIsCertificateModalOpen(true)}
          />
        )}

        {view === 'notes' && activeModuleForNotes && currentRoadmap && (
          <ModuleNotesPage
            module={activeModuleForNotes}
            roadmapId={currentRoadmap.id}
            onBack={() => setView('roadmap')}
            onToggleComplete={handleToggleComplete}
          />
        )}

        {view === 'assessment' && currentRoadmap && (
          <AssessmentPage
            roadmap={currentRoadmap}
            onBack={() => setView('roadmap')}
            onCertificateIssued={(cert) => {
              setCertificate(cert);
              setIsCertificateModalOpen(true);
            }}
            onOpenCertificate={() => setIsCertificateModalOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer style={{
        padding: '24px',
        borderTop: '1px solid var(--border-color)',
        textAlign: 'center',
        color: 'var(--text-secondary)',
        fontSize: '0.85rem',
        background: 'var(--bg-secondary)'
      }}>
        <p style={{ margin: '0 0 4px', fontWeight: 600, color: '#0f172a' }}>
          LEARNMATE &bull; Hyper-Personalized Career Roadmap & Notes Engine
        </p>
        <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          FastAPI &bull; React &bull; MongoDB &bull; Groq & Gemini AI
        </p>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Verified Certificate Modal */}
      {certificate && (
        <CertificateModal
          isOpen={isCertificateModalOpen}
          onClose={() => setIsCertificateModalOpen(false)}
          certificate={certificate}
        />
      )}
    </div>
  );
}

