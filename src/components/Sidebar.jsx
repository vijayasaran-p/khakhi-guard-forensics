import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  FileText, PhoneCall, Wallet, Map, BarChart2,
  FolderOpen, Video, ClipboardCheck, Sun, Moon,
  ChevronLeft, ChevronRight, Network, Plus, Circle
} from 'lucide-react';
import { useCase } from '../context/CaseContext';

/* ─────────────────────────────────────────────────────────────
   KHAKHI GUARD — Official Law Enforcement Navigation
   MHA I4C Cyber Division Command Hierarchy
   ───────────────────────────────────────────────────────────── */
const navItems = [
  { path: '/fir-hub',         label: 'FIR & Complaint Registry',        icon: FileText,      moduleKey: 'fir' },
  { path: '/telecom',         label: 'CDR & Cellular Triangulation',     icon: PhoneCall,     moduleKey: 'telecom' },
  { path: '/crypto',          label: 'Financial Intelligence & Freeze',  icon: Wallet,        moduleKey: 'crypto' },
  { path: '/linkage',         label: 'Linkage Intelligence Analysis',    icon: Network,       moduleKey: null },
  { path: '/tactical-map',    label: 'Geo-Spatial Threat Matrix',        icon: Map,           moduleKey: null },
  { path: '/analytics',       label: 'Crime Pattern & Demographics',     icon: BarChart2,     moduleKey: null },
  { path: '/case-records',    label: 'Case Master Repositories',         icon: FolderOpen,    moduleKey: null },
  { path: '/media-forensics', label: 'Deepfake & Biometric Verify',      icon: Video,         moduleKey: 'media' },
  { path: '/dossier',         label: 'Judicial Prosecution Dossier',     icon: ClipboardCheck,moduleKey: null },
];

/* ── Inline SVG KG Shield Symbol ──────────────────────────────
   Monochrome-printable. Designed for rubber stamp, emboss,
   mono laser print, or any single-ink context. No gradients.
   ───────────────────────────────────────────────────────────── */
function KGShield({ size = 36, color = '#F0A91E' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="KHAKHI GUARD Shield"
    >
      {/* Outer bold shield outline */}
      <path
        d="M50 5 L88 20 L88 58 C88 80 72 98 50 106 C28 98 12 80 12 58 L12 20 Z"
        fill={color}
      />
      {/* Inner cutout creates the "frame" */}
      <path
        d="M50 14 L81 27 L81 58 C81 76 67 92 50 99 C33 92 19 76 19 58 L19 27 Z"
        fill="#050B14"
      />

      {/* ── K glyph (left half of shield interior) ── */}
      {/* Vertical spine */}
      <rect x="24" y="28" width="7" height="42" rx="1.5" fill={color} />
      {/* Upper arm of K */}
      <path d="M31 28 L52 42 L47 49 L31 38 Z" fill={color} />
      {/* Lower arm of K */}
      <path d="M31 70 L52 56 L47 49 L31 60 Z" fill={color} />

      {/* Thin vertical divider between K and G */}
      <rect x="55" y="28" width="2" height="42" rx="1" fill={color} opacity="0.35" />

      {/* ── G glyph (right half) ── */}
      {/* Arc of G — drawn as a stroked path so it's bold & legible */}
      <path
        d="M76 38 C74 31 68 26 59 26 C49 26 42 33 42 49 C42 65 49 72 59 72 C67 72 73 67 75 61 L65 61 L65 55 L80 55 L80 62 C77 73 69 79 59 79 C44 79 34 68 34 49 C34 30 44 19 59 19 C70 19 78 25 81 35 Z"
        fill={color}
      />

      {/* Bottom text bar */}
      <rect x="12" y="100" width="76" height="6" rx="1" fill={color} opacity="0.6" />

      {/* Micro corner classification dots */}
      <circle cx="20" cy="20" r="2" fill={color} opacity="0.5" />
      <circle cx="80" cy="20" r="2" fill={color} opacity="0.5" />
    </svg>
  );
}

export default function Sidebar({ theme, toggleTheme }) {
  const [open, setOpen] = useState(true);
  const isDark = theme === 'dark';
  const { caseActive, caseId, fir, telecom, crypto, media, clearCase } = useCase();

  const BG          = isDark ? '#070D1E' : '#0F172A';
  const ACTIVE_BG   = '#F0A91E';
  const ACTIVE_TEXT = '#050B14';

  // Which modules have data loaded
  const moduleStatus = { fir: fir.loaded, telecom: telecom.analyzed, crypto: crypto.analyzed, media: media.analyzed };

  return (
    <aside
      style={{
        width: open ? '248px' : '64px',
        backgroundColor: BG,
        borderRight: '4px solid #DC2626',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflowX: 'hidden',
        overflowY: 'auto',
        zIndex: 50,
        transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        userSelect: 'none',
      }}
    >
      {/* ── BRAND HEADER ── */}
      <div style={{
        height: '68px',
        padding: open ? '0 14px' : '0 12px',
        borderBottom: '1px solid rgba(220, 38, 38, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: open ? 'flex-start' : 'center',
        gap: '10px',
        flexShrink: 0,
      }}>
        <div style={{ flexShrink: 0, lineHeight: 0 }}>
          <KGShield size={open ? 38 : 32} color="#F0A91E" />
        </div>

        {open && (
          <div style={{ overflow: 'hidden' }}>
            <div style={{
              color: '#F0A91E',
              fontSize: '13.5px',
              fontWeight: 900,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              lineHeight: 1.1,
            }}>
              KHAKHI GUARD
            </div>
            <div style={{
              color: 'rgba(255,255,255,0.7)',
              fontSize: '9px',
              fontWeight: 700,
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
              marginTop: '3px',
            }}>
              MHA I4C · Cyber Command
            </div>
          </div>
        )}
      </div>

      {/* ── ACTIVE CASE INDICATOR ── */}
      {caseActive && open && (
        <div style={{
          margin: '10px 10px 2px 10px',
          padding: '8px 10px',
          borderLeft: '2px solid #DC2626',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              width: '7px', height: '7px', borderRadius: '50%',
              backgroundColor: '#4ADE80', flexShrink: 0,
              boxShadow: '0 0 6px #4ADE80',
            }} />
            <span style={{ fontSize: '9px', fontWeight: 800, color: '#4ADE80', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Live Case Active
            </span>
          </div>
          <div style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.8)', marginTop: '3px', fontFamily: 'monospace' }}>
            {caseId}
          </div>
        </div>
      )}

      {caseActive && !open && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
          <span style={{
            width: '8px', height: '8px', borderRadius: '50%',
            backgroundColor: '#4ADE80',
            boxShadow: '0 0 6px #4ADE80',
            display: 'block',
          }} />
        </div>
      )}

      {/* ── NAV MENU ── */}
      <nav style={{ flex: 1, padding: open ? '8px 8px' : '8px 6px', overflowY: 'auto' }} className="space-y-0.5">
        {navItems.map(({ path, label, icon: Icon, moduleKey }) => {
          const hasData = moduleKey ? moduleStatus[moduleKey] : false;
          return (
            <NavLink
              key={path}
              to={path}
              title={!open ? label : undefined}
              style={{ textDecoration: 'none', display: 'block' }}
            >
              {({ isActive }) => (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: open ? '8px 12px' : '9px',
                  justifyContent: open ? 'flex-start' : 'center',
                  borderRadius: '4px',
                  backgroundColor: isActive ? ACTIVE_BG : 'transparent',
                  color: isActive ? ACTIVE_TEXT : 'rgba(255,255,255,0.68)',
                  fontWeight: isActive ? 800 : 600,
                  fontSize: '11px',
                  letterSpacing: '0.03em',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  transition: 'all 0.12s ease',
                  boxShadow: isActive ? '0 2px 8px rgba(240,169,30,0.3)' : 'none',
                  position: 'relative',
                }}>
                  <Icon
                    size={15}
                    strokeWidth={isActive ? 2.5 : 1.75}
                    style={{ flexShrink: 0, color: isActive ? ACTIVE_TEXT : 'rgba(255,255,255,0.8)' }}
                  />
                  {open && (
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>
                      {label}
                    </span>
                  )}
                  {/* Module data loaded indicator dot */}
                  {hasData && open && (
                    <span style={{
                      width: '6px', height: '6px', borderRadius: '50%',
                      backgroundColor: isActive ? '#050B14' : '#4ADE80',
                      flexShrink: 0,
                      opacity: 0.9,
                    }} />
                  )}
                  {hasData && !open && (
                    <span style={{
                      position: 'absolute', top: '6px', right: '6px',
                      width: '5px', height: '5px', borderRadius: '50%',
                      backgroundColor: '#4ADE80',
                    }} />
                  )}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* ── FOOTER CONTROLS ── */}
      <div style={{ borderTop: '1px solid rgba(220, 38, 38, 0.3)', padding: open ? '10px' : '10px 8px', flexShrink: 0 }}>

        {/* NEW CASE ANALYSIS BUTTON */}
        {caseActive && (
          <button
            onClick={clearCase}
            title="Clear all uploaded data and start a new case"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              justifyContent: open ? 'flex-start' : 'center',
              width: '100%',
              padding: '8px 10px',
              borderLeft: '2px solid #DC2626',
              color: '#DC2626',
              fontSize: '10px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              cursor: 'pointer',
              marginBottom: '6px',
              whiteSpace: 'nowrap',
              transition: 'background-color 150ms',
            }}
            className="hover:bg-slate-800/50"
          >
            <Plus size={13} strokeWidth={2.5} style={{ flexShrink: 0 }} />
            {open && <span>New Case Analysis</span>}
          </button>
        )}

        {/* Dark/Light mode toggle */}
        <button
          onClick={toggleTheme}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            justifyContent: open ? 'flex-start' : 'center',
            width: '100%',
            padding: '7px 10px',
            borderRadius: '4px',
            color: 'rgba(255,255,255,0.85)',
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            marginBottom: '4px',
            whiteSpace: 'nowrap',
            transition: 'background-color 150ms',
          }}
          className="hover:bg-slate-800/50"
        >
          {isDark
            ? <Sun size={14} style={{ color: '#F0A91E', flexShrink: 0 }} />
            : <Moon size={14} style={{ color: '#94A3B8', flexShrink: 0 }} />
          }
          {open && <span>{isDark ? 'Light Command' : 'Dark Command'}</span>}
        </button>

        {/* Officer Badge */}
        {open && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 10px',
            backgroundColor: 'rgba(255,255,255,0.04)',
            borderRadius: '4px',
            marginBottom: '6px',
          }}>
            <div style={{
              width: '22px', height: '22px', borderRadius: '50%',
              backgroundColor: '#DC2626', color: '#FFFFFF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '10px', fontWeight: 900, flexShrink: 0,
            }}>
              A
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.2 }}>
                SP Amrita Sehgal
              </div>
              <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                KHAKHI GUARD Commander
              </div>
            </div>
          </div>
        )}

        {/* Collapse toggle */}
        <button
          onClick={() => setOpen(o => !o)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            padding: '4px',
            borderRadius: '4px',
            color: 'rgba(255,255,255,0.7)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            transition: 'background-color 150ms',
          }}
          className="hover:bg-slate-800/50"
        >
          {open ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
        </button>
      </div>
    </aside>
  );
}
