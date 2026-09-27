const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '').replace(/\/api$/, '')}/api`
  : 'http://127.0.0.1:8000/api';

function getAuthHeaders() {
  const token = localStorage.getItem('learnmate_token') || localStorage.getItem('skillpath_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

export const api = {
  // Auth
  async register(userData) {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Registration failed');
    if (data.access_token) {
      localStorage.setItem('learnmate_token', data.access_token);
      localStorage.setItem('learnmate_user', JSON.stringify(data.user));
    }
    return data;
  },

  async login(credentials) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Login failed');
    if (data.access_token) {
      localStorage.setItem('learnmate_token', data.access_token);
      localStorage.setItem('learnmate_user', JSON.stringify(data.user));
    }
    return data;
  },

  getCurrentUser() {
    const stored = localStorage.getItem('learnmate_user') || localStorage.getItem('skillpath_user');
    return stored ? JSON.parse(stored) : null;
  },

  logout() {
    localStorage.removeItem('learnmate_token');
    localStorage.removeItem('learnmate_user');
    localStorage.removeItem('skillpath_token');
    localStorage.removeItem('skillpath_user');
  },

  // Health
  async getHealth() {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      return await res.json();
    } catch {
      return { status: 'offline', database: { connected: false } };
    }
  },

  // Roadmaps
  async generateRoadmap(profile) {
    const res = await fetch(`${API_BASE_URL}/roadmap/generate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(profile)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Failed to generate roadmap');
    return data;
  },

  async getRoadmaps() {
    try {
      const res = await fetch(`${API_BASE_URL}/roadmap`, {
        headers: getAuthHeaders()
      });
      if (res.ok) return await res.json();
      const res2 = await fetch(`${API_BASE_URL}/roadmaps`, { headers: getAuthHeaders() });
      if (res2.ok) return await res2.json();
      return [];
    } catch (err) {
      console.warn('Failed to fetch roadmaps:', err);
      return [];
    }
  },

  async claimRoadmap(roadmapId) {
    try {
      const res = await fetch(`${API_BASE_URL}/roadmap/claim/${roadmapId}`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Could not claim roadmap:', e);
    }
    return null;
  },

  async getUserCertificates() {
    try {
      const res = await fetch(`${API_BASE_URL}/roadmap/user/certificates`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) return [];
      return await res.json();
    } catch (err) {
      console.warn('Failed to fetch certificates:', err);
      return [];
    }
  },

  async getRoadmap(roadmapId) {
    const res = await fetch(`${API_BASE_URL}/roadmap/${roadmapId}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to load roadmap');
    return await res.json();
  },

  async updateProgress(roadmapId, moduleId, isCompleted) {
    const res = await fetch(`${API_BASE_URL}/roadmap/${roadmapId}/progress`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ module_id: moduleId, is_completed: isCompleted })
    });
    if (!res.ok) throw new Error('Failed to update progress');
    return await res.json();
  },

  async deleteRoadmap(roadmapId) {
    const res = await fetch(`${API_BASE_URL}/roadmap/${roadmapId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete roadmap');
    return await res.json();
  },

  // Module Notes & Mentor
  async getModuleNotes(roadmapId, moduleId, forceRefresh = false) {
    const url = `${API_BASE_URL}/roadmap/${roadmapId}/module/${moduleId}/notes${forceRefresh ? '?force_refresh=true' : ''}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Failed to generate module notes');
    return data;
  },

  async askMentor(roadmapId, moduleId, question, context = '') {
    const res = await fetch(`${API_BASE_URL}/roadmap/${roadmapId}/module/${moduleId}/ask`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ roadmap_id: roadmapId, module_id: moduleId, question, context })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Failed to consult mentor');
    return data;
  },

  // Final Assessment & Certification
  async getAssessment(roadmapId, forceRefresh = false) {
    const url = `${API_BASE_URL}/roadmap/${roadmapId}/assessment${forceRefresh ? '?force_refresh=true' : ''}`;
    const res = await fetch(url, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Failed to load course assessment');
    return data;
  },

  async submitAssessment(roadmapId, answers) {
    const res = await fetch(`${API_BASE_URL}/roadmap/${roadmapId}/assessment/submit`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ answers })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Failed to submit assessment');
    return data;
  },

  async getCertificate(roadmapId) {
    const res = await fetch(`${API_BASE_URL}/roadmap/${roadmapId}/certificate`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) return null;
    return await res.json();
  },

  async updateCertificateName(roadmapId, userName) {
    const res = await fetch(`${API_BASE_URL}/roadmap/${roadmapId}/certificate/name`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ user_name: userName })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Failed to update certificate name');
    return data;
  },

  // Live Jobs Market
  async getRoadmapJobs(roadmapId, location = 'India') {
    const res = await fetch(`${API_BASE_URL}/jobs/roadmap/${roadmapId}?location=${encodeURIComponent(location)}`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Failed to fetch live jobs');
    return data;
  },

  async searchLiveJobs(role, skills = '', location = 'India') {
    const res = await fetch(`${API_BASE_URL}/jobs/search?role=${encodeURIComponent(role)}&skills=${encodeURIComponent(skills)}&location=${encodeURIComponent(location)}`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Failed to search live jobs');
    return data;
  },

  async getJobsStatus() {
    try {
      const res = await fetch(`${API_BASE_URL}/jobs/status`);
      return await res.json();
    } catch {
      return null;
    }
  }
};

