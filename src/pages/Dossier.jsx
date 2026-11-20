import React, { useState } from 'react';
import { Printer, ShieldCheck, Award, FileCheck, CheckCircle2, Download, Loader2 } from 'lucide-react';
import CaseHeader from '../components/CaseHeader';
import { useCase } from '../context/CaseContext';
import { api } from '../api/client';

const DEFAULT_ENTITIES = [
  { name: 'Vikram Singh (alias Vicky Chhabra)', role: 'Primary suspect', detail: 'R/o Sector 22-C, Chandigarh. SIM: +91 98765 43210. Aadhaar verified.' },
  { name: 'Amit Kumar', role: 'Accomplice / transit broker', detail: 'R/o Sector 34-A, Chandigarh. SIM: +91 98765 01234. Tower overlap verified.' },
  { name: 'Harpreet Singh', role: 'Victim / complainant', detail: 'R/o Sector 19-B, Chandigarh. UPI: harpreet.s19@okaxis. Loss: ₹1,50,000.' },
  { name: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', role: 'Primary deposit wallet', detail: 'WazirX. Origin IP resolves to Sector 22-C, Chandigarh.' },
  { name: '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc', role: 'Transit wallet (Hop-3)', detail: 'Ethereum mainnet. Receives post-midnight transfers.' },
];

const DEFAULT_TIMELINE = [
  { date: '10 Aug 2026, 14:30', event: 'Phishing link delivered via SMS', detail: 'Victim receives utility billing SMS. Clicks chandigarh.utility-billing-portal.in.' },
  { date: '10 Aug 2026, 14:32', event: 'Hop 1 — UPI debit (₹1,50,000)', detail: 'Funds phished from Axis Bank Sector 19. Deposited to SBI Sector 17 (Vikram Singh).' },
  { date: '10 Aug 2026, 15:10', event: 'Hop 2 — Crypto conversion', detail: 'SBI funds converted to ETH via WazirX. Wallet: 0x71C7…976F.' },
  { date: '11 Aug 2026, 01:22', event: 'Hop 3 — Post-midnight transfer', detail: '0.046 ETH transferred to Amit Kumar wallet 0x3c44…3bc.' },
  { date: '12 Aug 2026, 09:15', event: 'Hop 4 — Off-ramp intercept', detail: 'Funds routed to CoinDCX. Emergency asset freeze directive active.' },
  { date: '12 Aug 2026, 11:30', event: 'Deepfake extortion media identified', detail: 'V_Threat_Call_CH_0818.mp4 contains biometric face overlay and voice clone (96%, 94% confidence).' },
];

const DEFAULT_CHAIN = [
  { exhibit: 'A-1', name: 'FIR Scan (CC/CH/2026/0818)', hash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b', ref: 'Digital Trust Registry' },
  { exhibit: 'A-2', name: 'Airtel CDR — Vikram Singh / Amit Kumar', hash: '7c4f0b2f8a5c2d3b4e9f7c1d5a8b0c2e3f4a5b6c', ref: 'Telecom Signature Log' },
  { exhibit: 'A-3', name: 'Ethereum Ledger (Block #20349122, #20352011)', hash: 'd3f2e1a098bc7da25019dcfd9018e3c7db17c802', ref: 'On-chain Block Proof' },
  { exhibit: 'A-4', name: 'V_Threat_Call_CH_0818.mp4 — Forensic output', hash: '8f96e20349b1c7da2019ffcd9018e3c7db17c802', ref: 'Deepfake analysis verified' },
];

export default function Dossier({ entities = DEFAULT_ENTITIES, timeline = DEFAULT_TIMELINE, chain = DEFAULT_CHAIN }) {
  const { caseId } = useCase();
  const [generating, setGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [notes, setNotes] = useState(
    'Identified complete money laundering trail from phished UPI transfer through multi-hop Ethereum network. Telecom records confirm post-midnight coordination. Deepfake media confirms extortion attempt. Assets partially frozen pending validation.'
  );

  const safeEntities = Array.isArray(entities) && entities.length > 0 ? entities : DEFAULT_ENTITIES;
  const safeTimeline = Array.isArray(timeline) && timeline.length > 0 ? timeline : DEFAULT_TIMELINE;
  const safeChain = Array.isArray(chain) && chain.length > 0 ? chain : DEFAULT_CHAIN;

  const handleGeneratePdf = async () => {
    try {
      setGenerating(true);
      const targetCaseId = caseId || 'KG-2026-0818';
      const res = await api.dossier.generate(targetCaseId);
      if (res?.data?.downloadUrl) {
        window.open(res.data.downloadUrl, '_blank');
      } else {
        const fallbackUrl = api.dossier.getDownloadUrl(targetCaseId);
        window.open(fallbackUrl, '_blank');
      }
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.warn('PDF Dossier generation fallback to print dialog:', err.message);
      window.print();
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ backgroundColor: 'var(--bg-app)' }}>
      {/* ── Header Bar ── */}
      <CaseHeader moduleName="Judicial Prosecution Dossier" />

      {/* ── Action Toolbar ── */}
      <div className="no-print border-b px-6 py-2.5 flex flex-wrap items-center justify-between gap-4 select-none"
           style={{ backgroundColor: 'var(--bg-workspace)', borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center gap-4 text-xs font-extrabold uppercase tracking-wider">
          <span className="flex items-center gap-1.5 text-[#DC2626]">
            <span className="w-2 h-2 rounded-full bg-[#DC2626]" /> EVIDENCE RECORD VERIFIED
          </span>
          <span className="hidden sm:inline" style={{ color: 'var(--text-tertiary)' }}>
            OFFICIAL PROSECUTION DOSSIER · PROOF OF CUSTODY INTEGRITY
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleGeneratePdf}
            disabled={generating}
            className="flex items-center gap-2 px-3 py-1.5 rounded text-xs font-extrabold uppercase tracking-wide border transition-all duration-150 cursor-pointer disabled:opacity-50"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              borderColor: downloadSuccess ? '#16A34A' : 'var(--border-medium)',
              color: downloadSuccess ? '#16A34A' : 'var(--text-primary)'
            }}
          >
            {generating ? (
              <>
                <Loader2 size={13} className="animate-spin text-[#DC2626]" />
                <span>Compiling Dossier…</span>
              </>
            ) : downloadSuccess ? (
              <>
                <CheckCircle2 size={13} className="text-[#16A34A]" />
                <span>Dossier Downloaded</span>
              </>
            ) : (
              <>
                <Download size={13} />
                <span>Court-Admissible PDF (BSA Sec 63)</span>
              </>
            )}
          </button>

          <button
            onClick={() => window.print()}
            className="btn-premium flex items-center gap-2 px-4 py-1.5 rounded text-xs font-extrabold uppercase text-white shadow hover:bg-[#B91C1C] transition-colors duration-150 cursor-pointer"
            style={{ backgroundColor: 'var(--status-critical)' }}
          >
            <Printer size={14} />
            Print Preview
          </button>
        </div>
      </div>

      {/* ── Document canvas ── */}
      <div className="flex-1 overflow-y-auto py-8 px-4 sm:px-6 min-w-0" style={{ backgroundColor: 'var(--bg-app)' }}>
        <div className="max-w-4xl mx-auto w-full surface-document select-text print-page rounded border shadow-md relative overflow-hidden"
             style={{ padding: '48px 56px', backgroundColor: 'var(--bg-workspace)', borderColor: 'var(--border-subtle)' }}>

          {/* Top Decorative Official Seal / Emblem Header */}
          <div className="text-center pb-6 mb-8 border-b-2 relative" style={{ borderColor: 'var(--border-medium)' }}>
            
            {/* Government Seal Icon Badge */}
            <div className="flex justify-center mb-3">
              <div className="w-14 h-14 rounded-full border-2 border-[#D97706] p-1 flex items-center justify-center bg-black/10">
                <div className="w-full h-full rounded-full border border-[#D97706] flex flex-col items-center justify-center text-[#D97706] font-serif text-[9px] font-bold">
                  <span>POLICE</span>
                  <Award size={14} />
                  <span>CHANDIGARH</span>
                </div>
              </div>
            </div>

            <p className="text-[10px] font-extrabold uppercase tracking-widest mb-2" style={{ color: 'var(--text-tertiary)' }}>
              State of Chandigarh &nbsp;·&nbsp; Office of the Superintendent of Police (Cyber)
            </p>
            <h1 className="text-xl font-extrabold mb-1 tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Judicial Prosecution Case Dossier
            </h1>
            <p className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
              For presentation before the Court of Chief Judicial Magistrate, Chandigarh UT
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-4 text-xs font-extrabold" style={{ color: '#DC2626' }}>
              <span>Case Ref: CH-CY-2026-0818</span>
              <span>•</span>
              <span>FIR: 0142/2026</span>
              <span>•</span>
              <span>Compiled: 18 Aug 2026</span>
            </div>
          </div>

          {/* Section 1: Overview */}
          <section className="mb-8">
            <h2 className="text-xs font-extrabold mb-4 uppercase tracking-wider border-b pb-2 flex items-center justify-between"
                style={{ color: 'var(--text-primary)', borderColor: 'var(--border-subtle)' }}>
              <span>1. Prima Facie Case Particulars</span>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">Emergency Asset Lock Applied</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              <div className="md:col-span-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                <p>
                  This case concerns a phishing-driven UPI auto-debit redirection fraud resulting in wrongful loss of{' '}
                  <strong style={{ color: 'var(--status-critical)' }}>₹1,50,000</strong> from complainant Harpreet Singh.
                  Traced funds were converted to Ethereum via WazirX and laundered across multiple wallet hops.
                  Coercion was attempted through deepfake video and synthetic voice recordings.
                </p>
              </div>
              <div className="md:pl-4 border-t md:border-t-0 md:border-l pt-3 md:pt-0" style={{ borderColor: 'var(--border-subtle)' }}>
                <p className="text-[10px] font-extrabold uppercase tracking-wider mb-2" style={{ color: 'var(--text-tertiary)' }}>
                  Statutory Offenses Charged
                </p>
                <ul className="space-y-1 font-bold text-xs" style={{ color: 'var(--text-primary)' }}>
                  <li className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-[#DC2626]" /> Cheating by Impersonation</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-[#DC2626]" /> Cyber Extortion & Coercion</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-[#DC2626]" /> Identity Theft (Sec 66C/66D)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 2: Entities */}
          <section className="mb-8">
            <h2 className="text-xs font-extrabold mb-4 uppercase tracking-wider border-b pb-2" style={{ color: 'var(--text-primary)', borderColor: 'var(--border-subtle)' }}>
              2. Identified Entities & Suspect Matrix
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse min-w-[500px]">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'var(--border-medium)' }}>
                    {['Entity', 'Role', 'Associated Data'].map(h => (
                      <th key={h} className="text-left pb-2 pr-4 font-extrabold uppercase tracking-wider text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {safeEntities.map((e, i) => (
                    <tr key={i} className="border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                      <td className="py-2.5 pr-4 font-bold" style={{ color: 'var(--text-primary)' }}>{e.name || ''}</td>
                      <td className="py-2.5 pr-4 font-semibold" style={{ color: 'var(--text-secondary)' }}>{e.role || ''}</td>
                      <td className="py-2.5" style={{ color: 'var(--text-secondary)' }}>{e.detail || ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 3: Timeline */}
          <section className="mb-8">
            <h2 className="text-xs font-extrabold mb-4 uppercase tracking-wider border-b pb-2" style={{ color: 'var(--text-primary)', borderColor: 'var(--border-subtle)' }}>
              3. Investigative Synopsis — Confidential
            </h2>
            <div className="space-y-4 pl-1">
              {safeTimeline.map((t, i) => (
                <div key={i} className="flex gap-4 text-xs border-l-2 pl-4 relative" style={{ borderColor: '#DC2626' }}>
                  <span className="w-36 font-extrabold shrink-0 text-[11px]" style={{ color: '#DC2626' }}>{t.date || ''}</span>
                  <div>
                    <p className="font-extrabold mb-0.5" style={{ color: 'var(--text-primary)' }}>{t.event || ''}</p>
                    <p className="leading-relaxed font-medium text-[11px]" style={{ color: 'var(--text-secondary)' }}>{t.detail || ''}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 4: Chain of Custody */}
          <section className="mb-8">
            <h2 className="text-xs font-extrabold mb-4 uppercase tracking-wider border-b pb-2 flex items-center justify-between"
                style={{ color: 'var(--text-primary)', borderColor: 'var(--border-subtle)' }}>
              <span>4. Evidence Chain of Custody Registry</span>
              <span className="text-[10px] font-mono text-[#16A34A] flex items-center gap-1">
                <FileCheck size={11} /> Cryptographically Hash Sealed
              </span>
            </h2>
            <div className="space-y-2">
              {safeChain.map((c, i) => (
                <div key={i} className="flex items-start gap-4 text-xs py-2.5 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                  <span className="font-extrabold shrink-0 text-[11px]" style={{ color: '#DC2626' }}>Exh. {c.exhibit || ''}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate" style={{ color: 'var(--text-primary)' }}>{c.name || ''}</p>
                    <p className="text-[10px] font-mono mt-0.5 truncate" style={{ color: 'var(--text-tertiary)' }}>SHA-256: {c.hash || ''}</p>
                  </div>
                  <span className="font-extrabold shrink-0 text-[11px]" style={{ color: '#16A34A' }}>{c.ref || ''}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Section 5: Analyst Notes */}
          <section className="mb-8 no-print">
            <h2 className="text-xs font-extrabold mb-3 uppercase tracking-wider border-b pb-2" style={{ color: 'var(--text-primary)', borderColor: 'var(--border-subtle)' }}>
              5. Remarks & Statutory Observations
            </h2>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={4}
              className="w-full text-xs leading-relaxed outline-none p-3 rounded border font-medium"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderColor: 'var(--border-medium)',
                color: 'var(--text-primary)',
              }}
            />
          </section>

          {/* Official Signatory Block */}
          <div className="pt-8 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
            <div className="flex justify-between items-end text-xs">
              <div>
                <div className="mb-6 pb-1 border-b w-40" style={{ borderColor: 'var(--border-medium)' }} />
                <p className="text-[10px] font-extrabold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Reviewing Officer</p>
                <p className="text-[10px] font-bold mt-0.5" style={{ color: 'var(--text-secondary)' }}>ID: CY-IC-NODAL-01</p>
              </div>

              <div className="text-right">
                <p className="text-[10px] font-extrabold uppercase text-[#D97706] mb-1">● CRYPTOGRAPHICALLY SECURED & SEALED</p>
                <div className="mb-4 pb-1 border-b w-44 ml-auto" style={{ borderColor: 'var(--border-medium)' }} />
                <p className="font-extrabold text-sm" style={{ color: 'var(--text-primary)' }}>SP Amrita Sehgal</p>
                <p className="text-[10px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>I4C Cyber Nodal Officer</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
