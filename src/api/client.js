/**
 * KHAKHI GUARD — Central Law Enforcement API Service Client
 * Connects frontend to the Express + TypeScript backend.
 */

const API_BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5000';

function getAuthToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('khakhi_guard_token');
}

export function setAuthToken(token) {
  if (typeof window === 'undefined') return;
  if (token) localStorage.setItem('khakhi_guard_token', token);
  else localStorage.removeItem('khakhi_guard_token');
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    ...(options.headers || {})
  };

  const token = getAuthToken();
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If payload is not FormData, default to application/json
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers
    });

    if (!res.ok) {
      let errMessage = `HTTP ${res.status}: ${res.statusText}`;
      try {
        const errJson = await res.json();
        errMessage = errJson.error || errJson.message || errMessage;
      } catch (_) {}
      throw new Error(errMessage);
    }

    // Check if response is JSON
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await res.json();
    }
    return res;
  } catch (err) {
    console.warn(`[API Error] ${options.method || 'GET'} ${endpoint}:`, err.message);
    throw err;
  }
}

export const api = {
  // Auth
  auth: {
    login: (email, password) => request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    me: () => request('/api/auth/me')
  },

  // Cases
  cases: {
    list: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/api/cases${q ? `?${q}` : ''}`);
    },
    get: (id) => request(`/api/cases/${id}`),
    create: (data) => request('/api/cases', { method: 'POST', body: JSON.stringify(data) })
  },

  // Evidence
  evidence: {
    uploadFir: (file, caseId) => {
      const formData = new FormData();
      formData.append('file', file);
      if (caseId) formData.append('caseId', caseId);
      return request('/api/evidence/fir', { method: 'POST', body: formData });
    },
    uploadCdr: (file, caseId) => {
      const formData = new FormData();
      formData.append('file', file);
      if (caseId) formData.append('caseId', caseId);
      return request('/api/evidence/cdr', { method: 'POST', body: formData });
    },
    uploadMedia: (file, caseId) => {
      const formData = new FormData();
      formData.append('file', file);
      if (caseId) formData.append('caseId', caseId);
      return request('/api/evidence/media', { method: 'POST', body: formData });
    },
    getStatus: (evidenceId) => request(`/api/evidence/${evidenceId}`)
  },

  // Telecom
  telecom: {
    getHops: (caseId) => request(`/api/telecom/cdr/${caseId || 'KG-2026-0818'}`),
    query: (params) => request('/api/telecom/query', { method: 'POST', body: JSON.stringify(params) })
  },

  // Crypto
  crypto: {
    trace: (walletAddress) => request(`/api/crypto/trace/${walletAddress}`),
    freeze: (data) => request('/api/crypto/freeze', { method: 'POST', body: JSON.stringify(data) })
  },

  // Linkage Analysis
  linkage: {
    getGraph: (caseId) => request(`/api/linkage/${caseId || 'KG-2026-0818'}`)
  },

  // Analytics
  analytics: {
    getSummary: () => request('/api/analytics/summary')
  },

  // Maps
  maps: {
    getThreatMatrix: () => request('/api/maps/threat-matrix')
  },

  // Dossier
  dossier: {
    generate: (caseId) => request(`/api/cases/${caseId || 'KG-2026-0818'}/dossier/generate`, { method: 'POST' }),
    getDownloadUrl: (caseId, storagePath) => `${API_BASE_URL}/api/cases/${caseId || 'KG-2026-0818'}/dossier/download?path=${encodeURIComponent(storagePath || '')}`
  }
};
