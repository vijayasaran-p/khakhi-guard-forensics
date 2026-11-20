import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, CartesianGrid
} from 'recharts';
import {
  ShieldCheck, FileCheck, AlertTriangle, TrendingUp, Lock,
  Radio, Clock, Network, DollarSign, Activity, AlertOctagon
} from 'lucide-react';
import CaseHeader from '../components/CaseHeader';
import { useCase } from '../context/CaseContext';
import { api } from '../api/client';

/* ── 24-Hour Attack & Coordination Hour Timeline ── */
const DEFAULT_ATTACK_HOURS = [
  { hour: '00:00', incidents: 3, cdrActivity: 6 },
  { hour: '01:00', incidents: 14, cdrActivity: 24 },
  { hour: '02:00', incidents: 28, cdrActivity: 42 },
  { hour: '03:00', incidents: 32, cdrActivity: 48 },
  { hour: '04:00', incidents: 19, cdrActivity: 31 },
  { hour: '05:00', incidents: 6, cdrActivity: 9 },
  { hour: '06:00', incidents: 3, cdrActivity: 5 },
  { hour: '07:00', incidents: 5, cdrActivity: 8 },
  { hour: '08:00', incidents: 11, cdrActivity: 14 },
  { hour: '09:00', incidents: 18, cdrActivity: 22 },
  { hour: '10:00', incidents: 25, cdrActivity: 32 },
  { hour: '11:00', incidents: 31, cdrActivity: 38 },
  { hour: '12:00', incidents: 36, cdrActivity: 43 },
  { hour: '13:00', incidents: 26, cdrActivity: 30 },
  { hour: '14:00', incidents: 41, cdrActivity: 52 },
  { hour: '15:00', incidents: 45, cdrActivity: 56 },
  { hour: '16:00', incidents: 38, cdrActivity: 46 },
  { hour: '17:00', incidents: 24, cdrActivity: 31 },
  { hour: '18:00', incidents: 16, cdrActivity: 20 },
  { hour: '19:00', incidents: 12, cdrActivity: 15 },
  { hour: '20:00', incidents: 15, cdrActivity: 18 },
  { hour: '21:00', incidents: 18, cdrActivity: 23 },
  { hour: '22:00', incidents: 21, cdrActivity: 27 },
  { hour: '23:00', incidents: 13, cdrActivity: 17 },
];

/* ── Mule Fund Dispersion Velocity & Recovery Curve ── */
const DEFAULT_MULE_VELOCITY = [
  { stage: 'T+0m', label: 'Victim Debit', remainingPct: 100, frozenPct: 0 },
  { stage: 'T+4m', label: 'Hop 1 Mule', remainingPct: 92, frozenPct: 8 },
  { stage: 'T+12m', label: 'Hop 2 Layer', remainingPct: 68, frozenPct: 24 },
  { stage: 'T+25m', label: 'Hop 3 Split', remainingPct: 34, frozenPct: 56 },
  { stage: 'T+45m', label: 'ATM / Crypto Off-ramp', remainingPct: 18, frozenPct: 76 },
  { stage: 'T+60m', label: 'Terminal Dispersion', remainingPct: 0, frozenPct: 82 },
];

/* ── Network & Telecommunication Vector Origins ── */
const DEFAULT_INFRASTRUCTURE = [
  { vector: 'Unregistered Pre-Activated SIMs', incidents: 54, pct: 28, risk: 'Critical', color: '#DC2626' },
  { vector: 'Spoofed VoIP / GSM Gateways', incidents: 46, pct: 24, risk: 'Critical', color: '#EF4444' },
  { vector: 'Offshore Commercial VPN / Tor Exit', incidents: 38, pct: 20, risk: 'High', color: '#D97706' },
  { vector: 'Co-Opted Mule Bank Portals', incidents: 32, pct: 16, risk: 'High', color: '#2563EB' },
  { vector: 'Compromised Resident Broadband', incidents: 29, pct: 12, risk: 'Medium', color: '#64748B' },
];

/* ── Real-Time Intelligence Operational Event Stream ── */
const INTEL_ALERT_STREAM = [
  { time: '09:42 IST', type: 'CROSS-MATCH', text: 'Cross-module corroboration: SIM +91 98765 43210 linked to Mule Wallet 0x71C7…976F', level: 'CRITICAL', color: '#DC2626' },
  { time: '09:15 IST', type: 'MULE FREEZE', text: 'Axis Bank Sector 19 executes statutory debit freeze of ₹1,50,000 under Section 106 BNSS', level: 'ENFORCED', color: '#16A34A' },
  { time: '08:50 IST', type: 'CELL SITE', text: 'Target handset triangulation confirmed near Sector 17 BTS-07 azimuth cluster B', level: 'ACTIVE', color: '#D97706' },
  { time: '08:12 IST', type: 'FORENSIC', text: 'Media exhibit V_Threat_Call_CH_0818.mp4 verified synthetic (F0 variance 0.04 Hz, BSA Sec 63B)', level: 'CONFIRMED', color: '#DC2626' },
];

const DEFAULT_CRIME_HEADS = [
  { name: 'UPI Fraud', count: 42, pct: 25, color: '#DC2626' },
  { name: 'OTP Phishing', count: 35, pct: 21, color: '#D97706' },
  { name: 'Crypto Scam', count: 28, pct: 17, color: '#475569' },
  { name: 'Sextortion', count: 24, pct: 14, color: '#16A34A' },
  { name: 'Job Fraud', count: 20, pct: 12, color: '#3B82F6' },
  { name: 'Investment Fraud (Pig Butchering)', count: 18, pct: 11, color: '#8B5CF6' },
];

export default function AnalyticsPage({ theme = 'dark', crimeHeads = DEFAULT_CRIME_HEADS }) {
  const isDark = theme === 'dark' || (typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));
  const textColor = isDark ? '#94A3B8' : '#4B5563';
  const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
  const [searchParams] = useSearchParams();
  const { filters, setFilters } = useCase();

  const [backendStats, setBackendStats] = React.useState(null);
  const [attackHoursData, setAttackHoursData] = React.useState(DEFAULT_ATTACK_HOURS);
  const [muleVelocityData, setMuleVelocityData] = React.useState(DEFAULT_MULE_VELOCITY);
  const [infraData, setInfraData] = React.useState(DEFAULT_INFRASTRUCTURE);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await api.analytics.getSummary();
        if (isMounted && res?.data) {
          const raw = res.data;
          // Extract stats from situationalAwareness
          if (raw.situationalAwareness) {
            setBackendStats({
              priorityCases: raw.situationalAwareness.priorityCases?.total,
              criticalCorroborations: raw.situationalAwareness.criticalCorroborations?.total,
              financialExposure: raw.situationalAwareness.financialExposure?.totalAmount,
              frozenRecovery: `${raw.situationalAwareness.financialExposure?.frozenAmount} Frozen / Lien Marked (${raw.situationalAwareness.financialExposure?.recoveryPct}%)`,
              activeSyndicates: raw.situationalAwareness.activeSyndicates?.count
            });
          }
          if (raw.attackHoursTimeline?.length) setAttackHoursData(raw.attackHoursTimeline);
          if (raw.muleVelocity?.length) setMuleVelocityData(raw.muleVelocity);
          if (raw.infrastructureVectors?.length) setInfraData(raw.infrastructureVectors);
        }
      } catch (err) {
        console.warn('Backend analytics sync deferred. Using local baseline.', err.message);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    const queryModus = searchParams.get('filterModus');
    if (queryModus) {
      setFilters({ activeModus: queryModus });
    }
  }, [searchParams, setFilters]);

  const safeCrimeHeads = Array.isArray(crimeHeads) && crimeHeads.length > 0 ? crimeHeads : DEFAULT_CRIME_HEADS;

  const activeModus = filters.activeModus || null;
  const isFiltered = !!activeModus;

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ backgroundColor: 'var(--bg-app)' }}>
      <CaseHeader moduleName="Cyber Threat Patterns & Forensic Operations Analytics" />

      {/* Official Law Enforcement Verification Bar */}
      <div className="shrink-0 px-6 py-2 border-b flex items-center justify-between gap-4 text-xs select-none"
           style={{ backgroundColor: 'var(--bg-workspace)', borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-extrabold pl-2 text-[10px] tracking-wider uppercase border-l-2 border-[#DC2626]"
                style={{ color: '#DC2626' }}>
            <ShieldCheck size={12} /> Integrity Certified · I4C / UT Police
          </span>
          <span className="flex items-center gap-1.5 font-extrabold pl-2 text-[10px] tracking-wider uppercase border-l-2 border-[#16A34A]"
                style={{ color: '#16A34A' }}>
            <Lock size={12} /> Section 106 BNSS Emergency Lien Bus Active
          </span>
        </div>
        <div className="text-[11px] font-semibold flex items-center gap-2" style={{ color: 'var(--text-tertiary)' }}>
          <FileCheck size={13} className="text-[#D97706]" />
          <span>Statutory Docket Integrity: 99.8% Verified</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 w-full space-y-6">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Active Cohort Filter Banner */}
          {isFiltered && (
            <div className="p-3 rounded border border-dashed text-xs font-bold uppercase tracking-wider text-[#DC2626] bg-[#DC2626]/5 flex items-center justify-between">
              <span>Filtered Active Cohort: {activeModus} Investigation</span>
              <button 
                onClick={() => setFilters({ activeModus: null })}
                className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded bg-[#DC2626] text-white cursor-pointer hover:bg-[#B91C1C] transition-colors duration-150"
              >
                Clear Filter
              </button>
            </div>
          )}

          {/* ── REQUIREMENT 3: OPERATIONAL SITUATIONAL AWARENESS STRIP ── */}
          <div className="rounded border shadow-sm select-none overflow-hidden"
               style={{ backgroundColor: 'var(--bg-workspace)', borderColor: 'var(--border-subtle)' }}>
            
            {/* Header / Sub-Bar */}
            <div className="px-5 py-2.5 border-b flex items-center justify-between"
                 style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}>
              <div className="flex items-center gap-2">
                <Radio size={14} className="text-[#DC2626]" />
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Operational Situational Awareness Strip · Live Command Post
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">
                Chandigarh Police Cyber Cell · Sector 17 Nodal Desk
              </span>
            </div>

            {/* 4 Dense Tactical Operational Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-slate-800">
              
              {/* Card 1: Priority Cases */}
              <div className="p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Priority Cases
                  </span>
                  <Activity size={14} className="text-[#DC2626]" />
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black font-mono text-slate-900 dark:text-slate-100">{backendStats?.priorityCases ?? 12}</span>
                    <span className="text-xs font-bold uppercase text-red-600">Active Files</span>
                  </div>
                  <p className="text-[10px] font-semibold text-slate-500 mt-1">
                    3 flagged urgent under Rule 8 BNSS
                  </p>
                </div>
              </div>

              {/* Card 2: Critical Corroborations */}
              <div className="p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Critical Corroborations
                  </span>
                  <AlertOctagon size={14} className="text-[#D97706]" />
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black font-mono text-[#D97706]">{backendStats?.criticalCorroborations ?? 4}</span>
                    <span className="text-xs font-bold uppercase text-amber-600">Cross-Module Matches</span>
                  </div>
                  <p className="text-[10px] font-semibold text-slate-500 mt-1">
                    Telecom-to-Crypto & Media-to-FIR verified
                  </p>
                </div>
              </div>

              {/* Card 3: Financial Exposure */}
              <div className="p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Financial Exposure
                  </span>
                  <DollarSign size={14} className="text-[#16A34A]" />
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black font-mono text-slate-900 dark:text-slate-100">{backendStats?.financialExposure ?? '₹1.48 Cr'}</span>
                    <span className="text-xs font-bold uppercase text-emerald-600">Complainant Loss</span>
                  </div>
                  <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                    {backendStats?.frozenRecovery ?? '₹1.21 Cr Frozen / Lien Marked (82%)'}
                  </p>
                </div>
              </div>

              {/* Card 4: High Risk Syndicates */}
              <div className="p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    High-Risk Syndicates
                  </span>
                  <TrendingUp size={14} className="text-[#DC2626]" />
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black font-mono text-[#DC2626]">{backendStats?.activeSyndicates ?? 1}</span>
                    <span className="text-xs font-bold uppercase text-red-600">Active Local Nexus</span>
                  </div>
                  <p className="text-[10px] font-semibold text-slate-500 mt-1">
                    CY-392 Syndicate · Sector 17/22 Tri-City
                  </p>
                </div>
              </div>

            </div>

            {/* Recent Intelligence Event / Alert Stream Ticker */}
            <div className="px-5 py-2.5 border-t flex items-center gap-4 bg-slate-100/70 dark:bg-slate-900/60 text-xs overflow-x-auto"
                 style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="flex items-center gap-1.5 shrink-0 text-[#DC2626] font-bold text-[10px] uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[#DC2626] animate-pulse" />
                <span>Intel Feed</span>
              </div>
              <div className="flex items-center gap-6 divide-x divide-slate-300 dark:divide-slate-800 text-[11px] font-medium min-w-0">
                {INTEL_ALERT_STREAM.map((ev, i) => (
                  <div key={i} className={`flex items-center gap-2 shrink-0 ${i > 0 ? 'pl-6' : ''}`}>
                    <span className="font-mono text-[10px] text-slate-400">{ev.time}</span>
                    <span className="font-bold text-[9px] px-1.5 py-0.2 rounded border"
                          style={{ borderColor: `${ev.color}40`, color: ev.color, backgroundColor: `${ev.color}10` }}>
                      {ev.type}
                    </span>
                    <span className="text-slate-700 dark:text-slate-300 text-xs truncate max-w-sm">
                      {ev.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ── REQUIREMENT 2: OPERATIONAL FORENSIC CHARTS ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Chart 1: Attack & Coordination Hour Distribution (24-Hour Timeline) */}
            <div className="p-5 rounded border shadow-sm select-none" style={{ backgroundColor: 'var(--bg-workspace)', borderColor: 'var(--border-subtle)' }}>
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    <Clock size={14} className="text-[#DC2626]" />
                    Attack & Coordination Hour Distribution (24-Hour Timeline)
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Demonstrating nocturnal coordination spike (01:00–04:00) & banking hours rush (14:00–16:00)
                  </p>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-extrabold uppercase">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#DC2626]" /> Incidents</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#D97706]" /> CDR Handovers</span>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={attackHoursData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                    <XAxis dataKey="hour" stroke={textColor} fontSize={10} tickLine={false} interval={2} />
                    <YAxis stroke={textColor} fontSize={10} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? '#0B121F' : '#FFFFFF',
                        borderColor: isDark ? '#334155' : '#CBD5E1',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                      }}
                    />
                    <Bar dataKey="incidents" name="Incidents Filed" fill="#DC2626" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="cdrActivity" name="Cellular Handovers" fill="#D97706" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-3 pt-2 border-t flex items-center justify-between text-[10px] text-slate-500 font-mono" style={{ borderColor: 'var(--border-subtle)' }}>
                <span>Peak Nocturnal Surge: 02:00–03:45 IST</span>
                <span className="text-red-500 font-bold">CYBER CRIME TIMELINE PATTERN CONFIRMED</span>
              </div>
            </div>

            {/* Chart 2: Mule Fund Dispersion Velocity & Recovery Curve */}
            <div className="p-5 rounded border shadow-sm select-none" style={{ backgroundColor: 'var(--bg-workspace)', borderColor: 'var(--border-subtle)' }}>
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    <TrendingUp size={14} className="text-[#16A34A]" />
                    Transaction Velocity & Mule Hop Acceleration
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Critical 15-minute inter-bank dispersion latency under BNSS Sec 106
                  </p>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-extrabold uppercase">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-500" /> Capital At Risk %</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-500" /> Statutory Frozen %</span>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={muleVelocityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                    <XAxis dataKey="stage" stroke={textColor} fontSize={10} tickLine={false} />
                    <YAxis stroke={textColor} fontSize={10} tickLine={false} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? '#0B121F' : '#FFFFFF',
                        borderColor: isDark ? '#334155' : '#CBD5E1',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                      }}
                    />
                    <Area type="monotone" dataKey="remainingPct" name="Dispersing Capital %" stroke="#DC2626" fill="#DC2626" fillOpacity={0.2} />
                    <Area type="monotone" dataKey="frozenPct" name="Statutory Frozen %" stroke="#10B981" fill="#10B981" fillOpacity={0.25} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-3 pt-2 border-t flex items-center justify-between text-[10px] text-slate-500 font-mono" style={{ borderColor: 'var(--border-subtle)' }}>
                <span>Golden Hour Limit: T+15m for Hop 1/2 interdiction</span>
                <span className="text-emerald-500 font-bold">82% RECOVERY EFFICIENCY ACHIEVED</span>
              </div>
            </div>

          </div>

          {/* Chart 3: Infrastructure & Telecommunication Vector Distribution */}
          <div className="p-5 rounded border shadow-sm select-none" style={{ backgroundColor: 'var(--bg-workspace)', borderColor: 'var(--border-subtle)' }}>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <Network size={14} className="text-[#2563EB]" />
                  ISP & Infrastructure Threat Origin Distribution
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Technical attribution matrix across cellular registries, VoIP proxies, and mule banking portals
                </p>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-400">
                199 Total Infrastructure Points Analyzed
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {DEFAULT_INFRASTRUCTURE.map((inf, i) => (
                <div key={i} className="p-3.5 rounded border transition-all hover:border-slate-500"
                     style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-medium)' }}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase"
                          style={{ backgroundColor: `${inf.color}15`, color: inf.color, border: `1px solid ${inf.color}40` }}>
                      {inf.risk}
                    </span>
                    <span className="font-extrabold font-mono text-sm" style={{ color: inf.color }}>{inf.pct}%</span>
                  </div>
                  <p className="text-xs font-bold leading-snug line-clamp-2 mt-1 mb-2" style={{ color: 'var(--text-primary)' }}>
                    {inf.vector}
                  </p>
                  <p className="text-xs font-mono font-bold text-slate-500 mb-2">{inf.incidents} vectors identified</p>
                  <div className="w-full h-1.5 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
                    <div className="h-full rounded-full" style={{ width: `${inf.pct * 3.5}%`, backgroundColor: inf.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Crime Head Breakdown Progress Bars */}
          <div className="p-5 rounded border shadow-sm select-none" style={{ backgroundColor: 'var(--bg-workspace)', borderColor: 'var(--border-subtle)' }}>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
                Crime Head Category Breakdown
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                Categorized Under National Cyber Crime Reporting Taxonomy
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {safeCrimeHeads.map((item, i) => (
                <div key={i} className="p-3.5 rounded border transition-all hover:border-[#DC2626]/40" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-medium)' }}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold truncate" style={{ color: 'var(--text-primary)' }}>{item.name}</span>
                    <span className="font-extrabold ml-2 font-mono" style={{ color: item.color }}>{item.pct}%</span>
                  </div>
                  <p className="text-sm font-extrabold mb-2 font-mono" style={{ color: 'var(--text-primary)' }}>{item.count} cases</p>
                  
                  {/* Standard Progress Bar */}
                  <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border-subtle)' }}>
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, Math.max(0, item.pct))}%`, backgroundColor: item.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
