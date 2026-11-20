import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CaseProvider } from './context/CaseContext';
import Sidebar from './components/Sidebar';
import FirHub from './pages/FirHub';
import Telecom from './pages/Telecom';
import Crypto from './pages/Crypto';
import TacticalMap from './pages/TacticalMap';
import AnalyticsPage from './pages/AnalyticsPage';
import CaseRecordsPage from './pages/CaseRecordsPage';
import MediaForensics from './pages/MediaForensics';
import Dossier from './pages/Dossier';
import LinkageAnalysis from './pages/LinkageAnalysis';

export default function App() {
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (theme === 'dark') {
      root.classList.add('dark');
      body.classList.add('dark');
      body.style.backgroundColor = '#050b14';
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
      body.style.backgroundColor = '#eef1f6';
    }
  }, [theme]);

  return (
    <CaseProvider>
      <Router>
        <div className={`flex h-screen w-screen overflow-hidden text-[var(--text-primary)] bg-[var(--bg-app)] transition-colors duration-200 ${theme}`}>
          
          {/* Left Sidebar Navigation */}
          <div className="print:hidden">
            <Sidebar theme={theme} toggleTheme={toggleTheme} />
          </div>

          {/* Right Content Workspace */}
          <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-[var(--bg-app)]">
            <Routes>
              <Route path="/fir-hub"         element={<FirHub theme={theme} />} />
              <Route path="/telecom"          element={<Telecom theme={theme} />} />
              <Route path="/crypto"           element={<Crypto theme={theme} />} />
              <Route path="/tactical-map"     element={<TacticalMap theme={theme} />} />
              <Route path="/analytics"        element={<AnalyticsPage theme={theme} />} />
              <Route path="/case-records"     element={<CaseRecordsPage theme={theme} />} />
              <Route path="/media-forensics"  element={<MediaForensics theme={theme} />} />
              <Route path="/dossier"          element={<Dossier theme={theme} />} />
              <Route path="/linkage"          element={<LinkageAnalysis theme={theme} />} />
              <Route path="*" element={<Navigate to="/fir-hub" replace />} />
            </Routes>
          </main>

        </div>
      </Router>
    </CaseProvider>
  );
}
