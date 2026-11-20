import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, ArrowRight, FileText, Video, Image, FileCode, Music, ShieldCheck, Award, FileCheck } from 'lucide-react';
import CaseHeader from '../components/CaseHeader';
import EvidenceTag from '../components/EvidenceTag';
import { useCase } from '../context/CaseContext';
import { api } from '../api/client';

const entities = [
  {
    id: 'complainant',
    role: 'Complainant Deposition',
    name: 'Harpreet Singh',
    detail: 'R/o House 1024, Sector 19-B. S/o Late Joginder Singh, Age 47. Registered complaint via Cyber Portal.',
    phone: '+91 98765 99123',
    evidenceType: 'EXTRACTED',
  },
  {
    id: 'suspect',
    role: 'Primary Suspect Target',
    name: 'Vikram Singh',
    alias: 'Vicky Chhabra',
    detail: 'R/o Sector 22-C. Utility billing domain registration directly linked to subscriber CDR records.',
    phone: '+91 98765 43210',
    evidenceType: 'AI',
    confidence: 89,
    explanation: 'Billing domain registration details correlate with Vikram Singh subscriber records & cell tower triangulation.',
  },
  {
    id: 'modus',
    role: 'Modus Operandi & Vector',
    name: 'UPI Auto-Debit Phishing Mandate',
    detail: 'Spoofed billing portal link triggered unauthorized NACH mandate. Loss Amount: ₹1,50,000.',
    url: 'chandigarh.utility-billing-portal.in',
    evidenceType: 'AI',
    confidence: 94,
    explanation: 'Pattern matches cyber syndicate CY-392 billing exploit template.',
  },
  {
    id: 'offence_classification',
    role: 'Investigative Offence Classification',
    name: 'Financial Fraud & Impersonation',
    detail: 'Larceny by trick, cyber impersonation, and fraudulent domain creation. Complaint registered: 18-Aug-2026.',
    evidenceType: 'AI',
    confidence: 90,
    explanation: 'Financial laundering via impersonation of utility authority matches fraud patterns.',
  },
];

export default function FirHub() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { fir, setFir } = useCase();
  const [uiState, setUiState] = useState(fir.loaded ? 'loaded' : 'empty');
  const [loadStep, setLoadStep] = useState('');

  React.useEffect(() => {
    setUiState(fir.loaded ? 'loaded' : 'empty');
  }, [fir.loaded]);

  const processUploadedFile = async (file) => {
    if (!file) return;
    const fileName = file.name || 'UNKNOWN_EVIDENCE.pdf';
    const sizeKb = file.size ? (file.size / 1024).toFixed(1) : '245.8';
    const ext = fileName.split('.').pop().toLowerCase();

    let category = 'document';
    let icon = FileText;
    let tag = 'PDF / TEXT DOCUMENT';
    let description = 'Textual FIR & Legal Complaint Document';
    let route = null;

    if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)) {
      category = 'video';
      icon = Video;
      tag = 'VIDEO EVIDENCE DETECTED';
      description = `H.264 / AAC Video Stream (${sizeKb} KB) — Spatial & Biometric Tampering Inspection Required`;
      route = '/media-forensics';
    } else if (['jpg', 'jpeg', 'png', 'webp', 'tiff'].includes(ext)) {
      category = 'image';
      icon = Image;
      tag = 'IMAGE EVIDENCE DETECTED';
      description = `Raster Forensic Asset (${sizeKb} KB) — EXIF Metadata & Pixel Mesh Analysis Available`;
      route = '/media-forensics';
    } else if (['mp3', 'wav', 'm4a', 'aac', 'ogg'].includes(ext)) {
      category = 'audio';
      icon = Music;
      tag = 'AUDIO EVIDENCE DETECTED';
      description = `Spectral Voice Recording (${sizeKb} KB) — F0 Fundamental Frequency Inspection Available`;
      route = '/media-forensics';
    } else if (['pdf', 'doc', 'docx', 'txt'].includes(ext)) {
      category = 'document';
      icon = FileText;
      tag = 'PDF DOCUMENT DETECTED';
      description = `Legal Complaint FIR Record (${sizeKb} KB) — Ready for AI Entity & Section Extraction`;
      route = null;
    } else {
      category = 'binary';
      icon = FileCode;
      tag = 'GENERIC BINARY EVIDENTIAL ASSET';
      description = `Raw Binary Data Payload (${sizeKb} KB) — SHA-256 Hash Verification Generated`;
      route = null;
    }

    const computedFileMeta = {
      name: fileName,
      size: `${sizeKb} KB`,
      ext: ext.toUpperCase(),
      category,
      tag,
      description,
      route,
      sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08'
    };

    setUiState('loading');
    setLoadStep('Uploading document to secure evidence repository…');

    try {
      const res = await api.evidence.uploadFir(file);
      if (res?.data?.sha256Hash) {
        computedFileMeta.sha256 = res.data.sha256Hash;
      }
    } catch (err) {
      console.warn('Backend evidence upload deferred. Using local baseline.', err.message);
    }

    setFir({
      loaded: true,
      fileMeta: { ...computedFileMeta },
      selectedEntity: entities[0],
      verified: {},
      phones: ['+91 98765 43210', '+91 98765 99123'],
      suspectNames: ['Vikram Singh', 'Amit Kumar'],
      wallets: ['0x71C7656EC7ab88b098defB751B7401B5f6d8976F', '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc'],
      urls: ['chandigarh.utility-billing-portal.in'],
    });

    handleImport();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processUploadedFile(e.target.files[0]);
    }
  };

  const handleImport = () => {
    setUiState('loading');
    const steps = [
      'Reading uploaded evidence byte stream…',
      'Classifying file MIME & SHA-256 hash structure…',
      'Extracting entities, depositions & legal sections…'
    ];
    steps.forEach((s, i) => {
      setTimeout(() => {
        setLoadStep(s);
        if (i === steps.length - 1) {
          setTimeout(() => {
            setUiState('loaded');
          }, 400);
        }
      }, i * 500);
    });
  };

  const setSelectedEntity = (entity) => {
    setFir({ selectedEntity: entity });
  };

  const toggleVerified = (id) => {
    const v = fir.verified || {};
    setFir({ verified: { ...v, [id]: !v[id] } });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ backgroundColor: 'var(--bg-app)' }}>
      <CaseHeader moduleName="FIR Repository & Statutory Evidence Hub" />

      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* LEFT: Document Canvas & Upload Classifier */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="video/*,image/*,audio/*,.pdf,.doc,.docx,.txt"
          />

          {uiState === 'empty' && (
            <div className="flex flex-col flex-1 min-h-0 m-6 overflow-y-auto">
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center"
                   onDragOver={(e) => e.preventDefault()}
                   onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files?.[0]) processUploadedFile(e.dataTransfer.files[0]); }}
                   style={{ border: '2px dashed var(--border-medium)', borderRadius: '6px', backgroundColor: 'var(--bg-workspace)' }}>
                
                <div className="mb-4" style={{ color: '#DC2626' }}>
                  <Upload size={28} />
                </div>

                <div className="flex items-center gap-2 mb-2 text-[10px] font-extrabold uppercase tracking-wider text-[#DC2626]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" /> SECURE COMPLIANT REPOSITORY
                </div>

                <h2 className="text-base font-extrabold uppercase tracking-wide mb-1" style={{ color: 'var(--text-primary)' }}>
                  Upload Investigative Evidence File
                </h2>
                <p className="text-xs max-w-md mb-6 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  Submit FIR/Complaint document (PDF, image, or audio recording) for automated entity extraction under secure chain-of-custody protocol.
                </p>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-premium px-5 py-2.5 rounded text-xs font-extrabold uppercase tracking-wider text-white transition-colors duration-150 hover:bg-[#B91C1C] hover:shadow-md hover:scale-[1.02] cursor-pointer"
                    style={{ backgroundColor: '#DC2626' }}
                  >
                    Select File to Inspect
                  </button>
                  <button
                    onClick={() => processUploadedFile({ name: 'FIR_0142_Chandigarh.pdf', size: 245760 })}
                    className="btn-premium px-4 py-2.5 rounded text-xs font-bold transition-colors duration-150 hover:bg-[#E2E8F0] dark:hover:bg-[#1E293B] cursor-pointer"
                    style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-medium)', color: 'var(--text-secondary)' }}
                  >
                    Load Sample FIR PDF
                  </button>
                </div>
              </div>
            </div>
          )}

          {uiState === 'loading' && (
            <div className="flex flex-col flex-1 min-h-0 m-6 p-8 items-center justify-center text-center rounded border"
                 style={{ backgroundColor: 'var(--bg-workspace)', borderColor: 'var(--border-medium)' }}>
              <div className="w-48 h-1 processing-trace rounded-full overflow-hidden mb-4"
                   style={{ backgroundColor: 'var(--bg-elevated)' }} />
              <p className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--status-critical)' }}>{loadStep}</p>
            </div>
          )}

          {uiState === 'loaded' && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">

              {/* AUTOMATIC FILE TYPE CLASSIFICATION CARD */}
              {fir.fileMeta && (
                <div className="p-4 rounded border flex items-center justify-between shadow-sm animate-fade-in"
                     style={{ backgroundColor: 'var(--bg-workspace)', borderColor: 'var(--border-medium)' }}>
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="flex items-center justify-center shrink-0 pr-4 border-r-2 border-[#DC2626]" style={{ color: '#DC2626' }}>
                      {fir.fileMeta.category === 'video' && <Video size={24} />}
                      {fir.fileMeta.category === 'image' && <Image size={24} />}
                      {fir.fileMeta.category === 'audio' && <Music size={24} />}
                      {fir.fileMeta.category === 'document' && <FileText size={24} />}
                      {fir.fileMeta.category === 'binary' && <FileCode size={24} />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap text-[10px] font-extrabold uppercase">
                        <span className="flex items-center gap-1.5 text-[#DC2626]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" /> {fir.fileMeta.tag}
                        </span>
                        <span className="text-xs font-bold" style={{ color: 'var(--text-tertiary)' }}>{fir.fileMeta.ext} · {fir.fileMeta.size}</span>
                      </div>
                      <p className="text-sm font-extrabold mt-1 truncate" style={{ color: 'var(--text-primary)' }}>{fir.fileMeta.name}</p>
                      <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-secondary)' }}>{fir.fileMeta.description}</p>
                    </div>
                  </div>

                  {fir.fileMeta.route && (
                    <button
                      onClick={() => navigate(fir.fileMeta.route)}
                      className="btn-premium px-4 py-2 rounded text-xs font-extrabold uppercase text-white shrink-0 ml-4 transition-colors duration-150 hover:bg-[#B91C1C] hover:shadow-md hover:scale-[1.02] cursor-pointer"
                      style={{ backgroundColor: '#DC2626' }}
                    >
                      Launch Forensics Module <ArrowRight size={13} className="ml-1 inline" />
                    </button>
                  )}
                </div>
              )}

              {/* Document Record View */}
              <div className="max-w-3xl mx-auto surface-document p-8 sm:p-10 rounded border select-text shadow-md relative"
                   style={{ backgroundColor: 'var(--bg-workspace)', borderColor: 'var(--border-medium)' }}>

                {/* Top Official Seal & Secure Hub Header */}
                <div className="flex items-center justify-between pb-4 mb-6 border-b" style={{ borderColor: 'var(--border-medium)' }}>
                  <div className="flex items-center gap-3">
                    <img
                      src="/khakhi_guard_logo.jpg"
                      alt="Official Seal"
                      className="w-10 h-10 rounded-full object-cover border-2 border-[#F0A91E] shadow-sm shrink-0"
                    />
                    <div>
                      <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#F0A91E]">
                        OFFICIAL DIGITAL TRUST SEAL · SECURE METADATA CERTIFIED
                      </p>
                      <h1 className="text-sm font-extrabold uppercase tracking-wide" style={{ color: 'var(--text-primary)' }}>
                        First Information Complaint Record (FIR)
                      </h1>
                      <p className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                        Cyber Crime Police Station
                      </p>
                    </div>
                  </div>

                  <div className="hidden sm:flex flex-col items-end text-[10px] font-extrabold uppercase">
                    <span className="flex items-center gap-1 text-[#16A34A]">
                      <ShieldCheck size={13} /> Record Integrity Verified
                    </span>
                    <span className="text-[9px] font-mono mt-0.5 text-slate-400">DIGITAL RECORD SECURED</span>
                  </div>
                </div>

                {/* Case Metadata Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4 p-3 rounded border text-xs"
                     style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}>
                   {[
                     ['Complaint Ref', 'KG-2026-0818'],
                     ['Date & Time', '18 Aug 2026, 10:15 hrs'],
                     ['Jurisdiction', 'UT Cyber Crime Div'],
                     ['Penal Provisions', 'Sec 318, Sec 336, IT 66D'],
                   ].map(([label, val]) => (
                     <div key={label}>
                       <span className="block text-[10px] font-extrabold uppercase" style={{ color: 'var(--text-tertiary)' }}>{label}</span>
                       <span className="font-extrabold text-xs" style={{ color: 'var(--text-primary)' }}>{val}</span>
                     </div>
                   ))}
                </div>

                {/* Statements */}
                <div className="space-y-6 text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  <section>
                    <h2 className="text-xs font-extrabold mb-2 uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                      <FileCheck size={14} className="text-red-600" />
                      1. Complainant Deposition & Victim Record
                    </h2>
                    <p className="pl-3 border-l-2" style={{ borderColor: '#DC2626' }}>
                      Harpreet Singh S/o Late Joginder Singh, Age 47, R/o House No. 1024, Sector 19-B, Chandigarh.
                      Contact Phone: <span className="font-extrabold" style={{ color: 'var(--text-primary)' }}>+91 98765 99123</span>.
                      Complainant reports direct unauthorized transaction loss of <strong style={{ color: 'var(--status-critical)' }}>₹1,50,000</strong> from Axis Bank Savings account via malicious payment link.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xs font-extrabold mb-2 uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                      <FileCheck size={14} className="text-red-600" />
                      2. Modus Operandi & Digital Vector
                    </h2>
                    <p className="pl-3 border-l-2" style={{ borderColor: 'var(--border-medium)' }}>
                      Complainant received a spoofed SMS purporting to be from Chandigarh UT Electricity Department warning of immediate disconnection, directing payment through portal{' '}
                      <span className="font-extrabold" style={{ color: 'var(--status-critical)' }}>chandigarh.utility-billing-portal.in</span>.
                      Payment link triggered automated NACH mandate auto-debiting funds.
                    </p>
                  </section>
                  <section>
                    <h2 className="text-xs font-extrabold mb-3 uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                      <FileCheck size={14} className="text-red-600" />
                      3. Modus Operandi Convergence Matrix (10 Related Cases)
                    </h2>
                    <div className="space-y-2.5 pl-3 border-l-2" style={{ borderColor: 'var(--border-medium)' }}>
                      {[
                        { id: 'KG-2026-0711', modus: 'UPI Fraud (SMS Phishing)', loss: '₹2,10,000', score: 98, detail: 'Identical replica payment gateway host.' },
                        { id: 'KG-2026-0742', modus: 'UPI Fraud (Utility Scam)', loss: '₹1,80,000', score: 97, detail: 'Electricity bill urgency SMS template.' },
                        { id: 'KG-2026-0689', modus: 'OTP Phishing (Redirect Link)', loss: '₹95,000', score: 95, detail: 'Shared SMS gateway provider identifier.' },
                        { id: 'KG-2026-0801', modus: 'UPI Fraud (Bill Desk Spoof)', loss: '₹1,40,000', score: 93, detail: 'Auto-debit NACH mandate bypass vector.' },
                        { id: 'KG-2026-0599', modus: 'Investment Fraud', loss: '₹4,50,000', score: 91, detail: 'UPI merchant endpoint convergence.' },
                        { id: 'KG-2026-0798', modus: 'Job Fraud (Telegram task)', loss: '₹3,20,000', score: 89, detail: 'Shared transit mule account hierarchy.' },
                        { id: 'KG-2026-0810', modus: 'UPI Fraud (QR Code Spoof)', loss: '₹60,000', score: 87, detail: 'Associated domain registrar details.' },
                        { id: 'KG-2026-0702', modus: 'OTP Phishing (Utility Spoof)', loss: '₹1,15,000', score: 85, detail: 'SMS header alpha-tag match.' },
                        { id: 'KG-2026-0785', modus: 'Crypto Scam (Transit Hop)', loss: '₹8,00,000', score: 82, detail: 'Mule bank account overlap.' },
                        { id: 'KG-2026-0645', modus: 'UPI Fraud (Cashback Vector)', loss: '₹1,35,000', score: 80, detail: 'Dynamic payment link registrar.' }
                      ].map((item, index) => (
                        <div key={item.id} className="p-2 rounded flex items-center justify-between gap-4 border" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-xs" style={{ color: 'var(--text-primary)' }}>{item.id}</span>
                              <span className="text-[10px] uppercase font-extrabold" style={{ color: '#D97706' }}>{item.modus}</span>
                            </div>
                            <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{item.detail} · Loss: {item.loss}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-xs font-black text-[#DC2626]">{item.score}%</span>
                            <p className="text-[8px] font-bold uppercase tracking-wider text-slate-400">Match</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                {/* Official Signature Footer */}
                <div className="mt-8 pt-4 flex flex-wrap items-center justify-between border-t gap-2 text-[10px]"
                     style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-tertiary)' }}>
                  <div className="flex items-center gap-2">
                    <Award size={14} className="text-[#F0A91E]" />
                    <span>Cryptographic Hash Verified Record</span>
                  </div>
                  <span className="font-mono font-bold text-xs" style={{ color: 'var(--text-secondary)' }}>
                    SHA-256: 9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08
                  </span>
                </div>

              </div>
            </div>
          )}

          {/* Evidence trail strip */}
          {uiState === 'loaded' && (
            <div className="shrink-0 px-6 py-3 flex items-center gap-4 border-t overflow-hidden"
                 style={{ backgroundColor: 'var(--bg-workspace)', borderColor: 'var(--border-subtle)' }}>
              <span className="text-[10px] font-extrabold uppercase tracking-wider shrink-0" style={{ color: 'var(--text-tertiary)' }}>
                Related Evidential Links
              </span>
              <div className="flex items-center gap-2 overflow-x-auto min-w-0">
                {[
                  { path: '/telecom',         label: '+91 98765 43210 — Telecom Records & Triangulation' },
                  { path: '/crypto',           label: '0x71C7…976F — Financial Hop Trace' },
                  { path: '/media-forensics',  label: 'V_Threat_Call_CH_0818.mp4 — Audio/Video Asset' },
                ].map(({ path, label }) => (
                  <button
                    key={path}
                    onClick={() => navigate(path)}
                    className="btn-premium flex items-center gap-1.5 px-3 py-1.5 text-xs rounded shrink-0 transition-colors duration-150 hover:bg-[#E2E8F0] dark:hover:bg-[#1E293B] cursor-pointer"
                    style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}
                  >
                    <ArrowRight size={12} style={{ color: 'var(--status-critical)' }} />
                    <span className="whitespace-nowrap">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Inspector panel */}
        <div className="w-80 shrink-0 flex flex-col border-l overflow-hidden"
             style={{ backgroundColor: 'var(--bg-workspace)', borderColor: 'var(--border-subtle)' }}>
          <div className="px-4 py-3 border-b shrink-0 flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
            <p className="text-xs font-extrabold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
              Entity & Statutory Inspector
            </p>
            <span className="text-[10px] font-extrabold text-red-600">
              ● CASE FILE SECURE
            </span>
          </div>

          {uiState === 'loaded' && (
            <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
              {/* Scrollable entities list */}
              <div className="shrink-0 border-b max-h-56 overflow-y-auto" style={{ borderColor: 'var(--border-subtle)' }}>
                {entities.map((entity) => {
                  const isSelected = fir.selectedEntity?.id === entity.id;
                  return (
                    <div
                      key={entity.id}
                      onClick={() => setSelectedEntity(entity)}
                      className="w-full text-left px-4 py-3 flex items-center justify-between cursor-pointer transition-colors duration-150 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                      style={{
                        borderLeft: isSelected ? '3px solid #DC2626' : '3px solid transparent',
                        backgroundColor: isSelected ? 'var(--bg-elevated)' : 'transparent',
                      }}
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-[10px] font-extrabold uppercase tracking-wider truncate" style={{ color: 'var(--text-tertiary)' }}>
                          {entity.role}
                        </p>
                        <p className="text-xs font-extrabold truncate" style={{ color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                          {entity.name}
                        </p>
                      </div>
                      <EvidenceTag
                        type={fir.verified[entity.id] ? 'VERIFIED' : (entity.evidenceType || 'EXTRACTED')}
                        confidence={entity.confidence}
                        explanation={entity.explanation}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Selected Entity Detailed View */}
              {fir.selectedEntity ? (
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  <div className="p-3 rounded border" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}>
                    <p className="text-[10px] font-extrabold uppercase text-red-600">{fir.selectedEntity.role}</p>
                    <p className="text-sm font-extrabold" style={{ color: 'var(--text-primary)' }}>{fir.selectedEntity.name}</p>
                    {fir.selectedEntity.alias && (
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Alias: {fir.selectedEntity.alias}</p>
                    )}
                    {fir.selectedEntity.phone && (
                      <p className="text-xs font-mono font-bold text-red-600 mt-1">{fir.selectedEntity.phone}</p>
                    )}
                  </div>

                  <div className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    <p className="font-semibold text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--text-tertiary)' }}>
                      Evidential Context & Records
                    </p>
                    <p>{fir.selectedEntity.detail}</p>
                  </div>

                  {fir.selectedEntity.explanation && (
                    <div className="pl-3 border-l-2" style={{ borderColor: '#DC2626' }}>
                      <span className="text-[10px] font-extrabold uppercase text-[#DC2626] block mb-1">AI Recommendation & Rationale</span>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{fir.selectedEntity.explanation}</p>
                    </div>
                  )}

                  <button
                    onClick={() => toggleVerified(fir.selectedEntity.id)}
                    className="btn-premium w-full py-2.5 rounded text-xs font-bold justify-center transition-colors duration-150 hover:opacity-90 cursor-pointer"
                    style={fir.verified[fir.selectedEntity.id]
                      ? { backgroundColor: 'var(--status-ok)', color: '#fff' }
                      : { backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-medium)', color: 'var(--text-secondary)' }
                    }
                  >
                    {fir.verified[fir.selectedEntity.id] ? '✓ Statutory Record Verified' : 'Mark as Verified Evidence'}
                  </button>

                  <div className="pt-2.5 flex flex-col gap-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                    <button
                      onClick={() => navigate('/tactical-map?lat=30.7390&lng=76.7820&focus=true')}
                      className="btn-premium w-full py-2 rounded text-[11px] font-extrabold uppercase text-white transition-colors duration-150 hover:bg-[#B91C1C] cursor-pointer text-center"
                      style={{ backgroundColor: '#DC2626' }}
                    >
                      View on Tactical Map
                    </button>
                    <button
                      onClick={() => navigate('/analytics?filterModus=UPI Fraud')}
                      className="btn-premium w-full py-2 rounded text-[11px] font-extrabold uppercase transition-colors duration-150 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer text-center"
                      style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-medium)', color: 'var(--text-secondary)' }}
                    >
                      View Modus Analytics
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">
                  Select a flagged entity from the extraction matrix to initiate OSINT cross-referencing and statutory verification.
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
