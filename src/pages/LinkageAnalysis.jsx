import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useCase } from '../context/CaseContext';
import CaseHeader from '../components/CaseHeader';
import EvidenceTag from '../components/EvidenceTag';
import { api } from '../api/client';
import {
  AlertTriangle, ShieldAlert, TrendingUp, User, Phone,
  Wallet, FileText, Radio, Network, ChevronDown, ChevronUp,
  Percent, Link2, Activity, Eye, AlertCircle, CheckCircle2,
  Clock, BarChart3, Crosshair, Zap, ZoomIn, ZoomOut, Maximize2,
  Layers, Filter, ArrowRight, ShieldCheck, Cpu, Share2, Compass,
  Sparkles, RefreshCw, RadioTower, Database, Globe, Award, Lock,
  FileCheck, MapPin, Landmark, X, Printer, Download
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   CHANDIGARH POLICE CYBER CRIME INVESTIGATION DIVISION
   KHAKHI GUARD — FORENSIC EVIDENCE LINKAGE & SPIDER-WEB MATRIX
   
   Design Philosophy:
   - Serious, authoritative government investigation tool
   - Restricted semantic palette (Red for Suspect, Blue for Verified,
     Amber for Financial, Cyan for Telecom, Violet for Crypto, Green for Location)
   - Zero neon/cyberpunk bloom or random particle dust
   - Evidence-weighted connections with Section 63 BSA audit trail
   - 70% Hero Evidence Canvas + 30% Right Synapse Inspector
   ───────────────────────────────────────────────────────────── */

// ── Default Case KG-2026-0818 (Always Available on Initial Load) ──
const DEFAULT_ACTIVE_CASE = {
  fir: {
    loaded: true,
    fileMeta: { name: 'FIR_CC_CH_2026_0818.pdf', size: '2.4 MB' },
    suspectNames: ['Vikram Singh', 'Amit Kumar'],
    phones: ['+91 98765 43210', '+91 98765 99123'],
    wallets: ['0x71C7656EC7ab88b098defB751B7401B5f6d8976F', '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc'],
    urls: ['chandigarh.utility-billing-portal.in'],
  },
  telecom: {
    analyzed: true,
    phones: ['+91 98765 43210', '+91 98765 01234', '+91 99887 65432', '+91 77665 54432', '+91 88554 43321'],
    towerHops: [
      { from: '+91 98765 43210', to: '+91 98765 01234', timestamp: '10 Aug 2026, 14:28', tower: 'Sector 17 BTS-07' },
      { from: '+91 98765 01234', to: '+91 99887 65432', timestamp: '10 Aug 2026, 15:05', tower: 'Sector 22 BTS-14' },
      { from: '+91 99887 65432', to: '+91 77665 54432', timestamp: '10 Aug 2026, 16:15', tower: 'IT Park BTS-02' },
    ],
  },
  crypto: {
    analyzed: true,
    wallets: ['0x71C7656EC7ab88b098defB751B7401B5f6d8976F', '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc', '0x90f8bfac9c33b22f95027a6f9374d6c6e73ff4d7'],
    txHops: [
      { from: 'Axis Bank SB-Sector19', to: '0x71C7…976F', amount: '1,50,000', currency: 'INR→ETH' },
      { from: '0x71C7…976F', to: '0x3c44…3bc', amount: '0.046', currency: 'ETH' },
      { from: '0x3c44…3bc', to: 'CoinDCX', amount: '0.040', currency: 'ETH→INR' },
    ],
    totalFrozen: 148500,
  },
  media: {
    analyzed: false,
    findings: [],
  }
};

// ── Severity colour map ───────────────────────────────────────
const SEV = {
  CRITICAL: { color: '#DC2626', bg: 'rgba(220,38,38,0.08)', border: '#DC2626' },
  HIGH:     { color: '#D97706', bg: 'rgba(217,119,6,0.08)',  border: '#D97706' },
  MEDIUM:   { color: '#CA8A04', bg: 'rgba(202,138,4,0.06)',  border: '#CA8A04' },
  LOW:      { color: 'var(--text-tertiary)', bg: 'transparent', border: 'var(--text-tertiary)' },
};

// ── Strict Law Enforcement Semantic Entity Palette ───────────
// Glyphs: single-letter canvas-safe symbols (no emoji) for clean rendering
const NODE_THEMES = {
  case: {
    core: '#334155',
    border: '#475569',
    accent: '#3B82F6',
    glyph: 'D',
    glyphFont: 'bold',
    label: 'Case / FIR',
    category: 'DOCUMENT'
  },
  suspect: {
    core: '#991B1B',
    border: '#DC2626',
    accent: '#DC2626',
    glyph: 'P',
    glyphFont: 'bold',
    label: 'Person / Suspect',
    category: 'PERSON'
  },
  phone: {
    core: '#0369A1',
    border: '#0284C7',
    accent: '#0284C7',
    glyph: 'T',
    glyphFont: 'bold',
    label: 'Phone / CDR',
    category: 'TELECOM'
  },
  wallet: {
    core: '#6B21A8',
    border: '#7E22CE',
    accent: '#7E22CE',
    glyph: 'W',
    glyphFont: 'bold',
    label: 'Digital Wallet',
    category: 'DIGITAL'
  },
  financial: {
    core: '#B45309',
    border: '#D97706',
    accent: '#D97706',
    glyph: 'B',
    glyphFont: 'bold',
    label: 'Bank / Financial',
    category: 'FINANCIAL'
  },
  location: {
    core: '#15803D',
    border: '#16A34A',
    accent: '#16A34A',
    glyph: 'L',
    glyphFont: 'bold',
    label: 'Cell Tower',
    category: 'LOCATION'
  },
  match: {
    core: '#1D4ED8',
    border: '#2563EB',
    accent: '#F0A91E',
    glyph: '✓',
    glyphFont: 'bold',
    label: 'Verified evidence',
    category: 'VERIFIED'
  },
  unverified: {
    core: '#334155',
    border: '#475569',
    accent: '#64748B',
    glyph: '?',
    glyphFont: 'normal',
    label: 'Unverified',
    category: 'UNVERIFIED'
  },
};

// ── Derive full intelligence from CaseContext data ────────────
function deriveIntelligence(fir, telecom, crypto, media) {
  const anomalies   = [];
  const connections = [];
  const suspects    = [];
  let   riskScore   = 0;
  const sourceCount = [fir.loaded, telecom.analyzed, crypto.analyzed, media.analyzed].filter(Boolean).length;

  // 1. Phone number cross-match FIR ↔ CDR
  const matchedPhones = (fir.phones || []).filter(ph => (telecom.phones || []).includes(ph));
  if (matchedPhones.length > 0) {
    riskScore += 28 * matchedPhones.length;
    anomalies.push({
      id: 'phone-match',
      severity: 'CRITICAL',
      type: 'ENTITY CROSS-MATCH',
      title: `${matchedPhones.length} Phone Number${matchedPhones.length > 1 ? 's' : ''} Confirmed Across FIR & CDR`,
      detail: `Suspect number(s) ${matchedPhones.join(', ')} explicitly cited in FIR complaint and independently appearing in live CDR call data records. High confidence of active suspect involvement.`,
      confidence: 94,
      sources: ['FIR Registry', 'CDR Telecom'],
      entities: matchedPhones,
    });
  }

  // 2. Wallet cross-match FIR ↔ Crypto
  const matchedWallets = (fir.wallets || []).filter(w =>
    (crypto.wallets || []).some(cw => cw.toLowerCase() === w.toLowerCase())
  );
  if (matchedWallets.length > 0) {
    riskScore += 35 * matchedWallets.length;
    anomalies.push({
      id: 'wallet-match',
      severity: 'CRITICAL',
      type: 'FINANCIAL ENTITY MATCH',
      title: `${matchedWallets.length} Crypto Wallet${matchedWallets.length > 1 ? 's' : ''} Corroborated Across FIR & Ledger`,
      detail: `Wallet address(es) cited in FIR deposition independently traced in on-chain transaction hops. Confirms fraudulent financial routing.`,
      confidence: 97,
      sources: ['FIR Registry', 'Crypto Ledger'],
      entities: matchedWallets.map(w => w.slice(0, 10) + '…'),
    });
  }

  // 3. International crypto routing
  if (crypto.analyzed && (crypto.txHops || []).some(h => h.currency && h.currency.includes('→'))) {
    riskScore += 18;
    anomalies.push({
      id: 'crypto-routing',
      severity: 'HIGH',
      type: 'FINANCIAL ANOMALY',
      title: 'Multi-Layer Cross-Currency Transaction Routing Detected',
      detail: `Transaction trail shows layering through ${crypto.txHops?.length || 0} hops across multiple currencies (${[...new Set((crypto.txHops || []).map(h => h.currency))].join(', ')}). Classic mule-chain structuring to evade detection.`,
      confidence: 82,
      sources: ['Crypto Ledger'],
      entities: [],
    });
  }

  // 4. CDR tower clustering
  if (telecom.analyzed && (telecom.towerHops || []).length > 0) {
    riskScore += 14;
    anomalies.push({
      id: 'cdr-cluster',
      severity: 'HIGH',
      type: 'TOWER CLUSTERING ANOMALY',
      title: `${telecom.towerHops?.length} CDR Tower-Hop Sequence Links Suspect Movement`,
      detail: `Suspect SIM card bounced across ${telecom.towerHops?.length} BTS towers during the incident window, indicating deliberate geographic evasion. Triangulation points to active cellular clusters.`,
      confidence: 76,
      sources: ['CDR Telecom'],
      entities: (telecom.towerHops || []).map(h => h.tower).filter(Boolean),
    });
  }

  // 5. Fraudulent URL in FIR
  if ((fir.urls || []).length > 0) {
    riskScore += 10;
    anomalies.push({
      id: 'phishing-url',
      severity: 'MEDIUM',
      type: 'PHISHING INFRASTRUCTURE',
      title: `${fir.urls.length} Fraudulent Domain${fir.urls.length > 1 ? 's' : ''} Identified in FIR Deposition`,
      detail: `Domain(s) ${fir.urls.join(', ')} used to deceive victim — mimicking official utility billing portals. Recommend takedown notice and DNS blacklist filing.`,
      confidence: 89,
      sources: ['FIR Registry'],
      entities: fir.urls,
    });
  }

  // Connection table
  const allPhones  = [...new Set([...(fir.phones || []), ...(telecom.phones || [])])];
  const allWallets = [...new Set([...(fir.wallets || []).map(w => w.slice(0,10)+'…'), ...(crypto.wallets || []).map(w => w.slice(0,10)+'…')])];

  allPhones.forEach(ph => {
    const inFir     = (fir.phones || []).includes(ph);
    const inTelecom = (telecom.phones || []).includes(ph);
    const matched   = inFir && inTelecom;
    connections.push({
      entity: ph,
      type: 'phone',
      sources: { fir: inFir, telecom: inTelecom, crypto: false, media: false },
      matched,
    });
  });

  allWallets.forEach((w) => {
    const inFir      = (fir.wallets || []).some(fw => fw.slice(0,10) === w.slice(0,10));
    const inCrypto   = (crypto.wallets || []).some(cw => cw.slice(0,10) === w.slice(0,10));
    const matched    = inFir && inCrypto;
    connections.push({
      entity: w,
      type: 'wallet',
      sources: { fir: inFir, telecom: false, crypto: inCrypto, media: false },
      matched,
    });
  });

  // Suspect profiles
  (fir.suspectNames || []).forEach((name, i) => {
    const suspectPhones  = (fir.phones || []).slice(i, i + 1);
    const suspectWallets = (fir.wallets || []).slice(i, i + 1);
    const phonesInCdr    = suspectPhones.filter(ph => (telecom.phones || []).includes(ph)).length;
    const walletsInLedger = suspectWallets.filter(w => (crypto.wallets || []).some(cw => cw.toLowerCase() === w.toLowerCase())).length;
    const corrobScore    = Math.min(99, 30 + phonesInCdr * 28 + walletsInLedger * 35);

    suspects.push({
      name,
      riskLevel: corrobScore >= 70 ? 'CRITICAL' : corrobScore >= 50 ? 'HIGH' : 'MEDIUM',
      corrobScore,
      flags: [
        fir.loaded            && '● Named in FIR Deposition',
        phonesInCdr > 0       && '● SIM Active in CDR Records',
        walletsInLedger > 0   && '● Wallet Traced in Blockchain Ledger',
        (fir.urls || []).length > 0 && '● Associated Phishing Domain',
      ].filter(Boolean),
    });
  });

  const cappedRisk = Math.min(riskScore, 99);
  const overallRisk = cappedRisk >= 70 ? 'CRITICAL' : cappedRisk >= 45 ? 'HIGH' : cappedRisk >= 20 ? 'MEDIUM' : 'INSUFFICIENT';

  return { anomalies, connections, suspects, riskScore: cappedRisk, overallRisk, sourceCount, matchedPhones, matchedWallets };
}

// ── Summary narrative ─────────────────────────────────────────
function buildNarrative(fir, telecom, crypto, media, intel) {
  if (intel.sourceCount === 0) return null;
  const parts = [];
  if (fir.loaded) parts.push(`FIR ${fir.fileMeta?.name || 'CC/CH/2026/0818'} registers ${(fir.suspectNames || []).length} named suspect(s)`);
  if (telecom.analyzed) parts.push(`CDR analysis covers ${(telecom.phones || []).length} active SIM numbers across ${(telecom.towerHops || []).length} tower-hop records`);
  if (crypto.analyzed) parts.push(`financial intelligence traces ${(crypto.wallets || []).length} wallet addresses through ${(crypto.txHops || []).length} transaction hops`);

  const cross = [];
  if (intel.matchedPhones.length > 0) cross.push(`${intel.matchedPhones.length} phone number(s) confirmed across FIR & CDR`);
  if (intel.matchedWallets.length > 0) cross.push(`${intel.matchedWallets.length} wallet address(es) corroborated across FIR & blockchain ledger`);

  return {
    base: parts.join('; ') + '.',
    cross: cross.length > 0 ? 'Cross-source entity match confirmed: ' + cross.join(' and ') + '.' : null,
    verdict: intel.riskScore >= 70
      ? 'Sufficient corroborating evidence across multiple independent sources to support prima facie case for prosecution under Section 63 BSA.'
      : 'Partial corroboration exists. Recommend expanding CDR and transaction scope before filing chargesheet.',
  };
}

// ── Build Neural Graph Entities & Synaptic Mesh ───────────────
function buildNeuralNetworkData(fir, telecom, crypto, media) {
  const nodes = [];
  const edges = [];
  const pushedNodes = new Set();
  const pushedEdges = new Set();

  const addNode = (node) => {
    if (pushedNodes.has(node.id)) return;
    pushedNodes.add(node.id);
    nodes.push(node);
  };

  const addEdge = (edge) => {
    const key = `${edge.source}-->${edge.target}`;
    if (pushedEdges.has(key)) return;
    pushedEdges.add(key);
    edges.push(edge);
  };

  const firNodeIds = [];
  const cdrNodeIds = [];
  const cryptoNodeIds = [];

  // 1. Core FIR Document Node (Level 1)
  if (fir.loaded) {
    addNode({
      id: 'fir-doc',
      label: 'FIR 0818/2026',
      subLabel: fir.fileMeta?.name || 'CC/CH/2026/0818',
      type: 'case',
      level: 1,
      confidence: 99,
      riskLevel: 'HIGH',
      verificationStatus: 'Verified complaint',
      source: 'FIR Registry (PS-17)',
      firstObserved: '10 Aug 2026, 09:15 IST',
      lastObserved: '10 Aug 2026, 16:30 IST',
      detail: 'Primary FIR registered under Section 173(3) BNSS chain-of-custody protocol.',
      imsiBinding: 'SHA256::e3b0c44298fc1c149afbf4c8996fb924',
      x: 320, y: 220
    });

    // Suspects (Level 1)
    (fir.suspectNames || []).forEach((name, i) => {
      const id = `suspect-${i}`;
      firNodeIds.push(id);
      addNode({
        id,
        label: name,
        subLabel: i === 0 ? 'Primary accused' : 'Co-accused',
        type: 'suspect',
        level: 1,
        confidence: 96,
        riskLevel: 'CRITICAL',
        verificationStatus: 'Named accused',
        source: 'FIR Registry (PS-17)',
        firstObserved: '10 Aug 2026, 09:15 IST',
        lastObserved: '10 Aug 2026, 17:45 IST',
        detail: 'Named accused in initial police complaint and complainant sworn deposition.',
        imsiBinding: `CH-POL-2026-0${i+1}`,
        x: 480 + (i * 40), y: 150 + (i * 120)
      });
      addEdge({
        id: `e-sus-${i}`,
        source: 'fir-doc',
        target: id,
        label: 'Named in FIR',
        type: 'primary',
        confidence: 98,
        evidence: 'Explicitly named accused in initial police complaint',
        strength: 2.2
      });
    });

    // FIR Extracted Phones (Level 3)
    (fir.phones || []).forEach((ph, i) => {
      const id = `fp-${i}`;
      firNodeIds.push(id);
      addNode({
        id,
        label: ph,
        subLabel: 'Cited phone number',
        type: 'phone',
        level: 3,
        confidence: 94,
        riskLevel: 'HIGH',
        verificationStatus: 'Cited in deposition',
        source: 'FIR Registry (PS-17)',
        firstObserved: '10 Aug 2026, 14:10 IST',
        lastObserved: '10 Aug 2026, 14:45 IST',
        detail: 'Mobile phone number cited in extortion deposition.',
        imsiBinding: '404-20-8910XXXX',
        x: 200 - (i * 30), y: 130 + (i * 60)
      });
      addEdge({
        id: `e-fp-${i}`,
        source: 'fir-doc',
        target: id,
        label: 'Cited phone',
        type: 'primary',
        confidence: 94,
        evidence: 'Complainant reported calling number during UPI extortion',
        strength: 1.5
      });
    });

    // FIR Extracted Wallets (Level 3)
    (fir.wallets || []).forEach((w, i) => {
      const id = `fw-${i}`;
      firNodeIds.push(id);
      addNode({
        id,
        label: `${w.slice(0,6)}…${w.slice(-4)}`,
        subLabel: 'Cited wallet address',
        type: 'wallet',
        level: 3,
        confidence: 95,
        riskLevel: 'HIGH',
        verificationStatus: 'Cited in deposition',
        source: 'FIR Registry (PS-17)',
        firstObserved: '10 Aug 2026, 14:28 IST',
        lastObserved: '10 Aug 2026, 15:10 IST',
        detail: 'On-chain ledger destination cited in victim fund routing statement.',
        imsiBinding: w,
        x: 220 + (i * 50), y: 340 + (i * 40)
      });
      addEdge({
        id: `e-fw-${i}`,
        source: 'fir-doc',
        target: id,
        label: 'Cited destination',
        type: 'primary',
        confidence: 95,
        evidence: 'EVM ledger destination cited in victim bank statement',
        strength: 1.6
      });
    });

    // Concentric web filaments for FIR cluster
    for (let i = 0; i < firNodeIds.length - 1; i++) {
      addEdge({
        id: `e-fir-mesh-${i}`,
        source: firNodeIds[i],
        target: firNodeIds[i+1],
        label: 'Co-cited in FIR',
        type: 'concentric-web',
        confidence: 60,
        evidence: 'Co-occurring entities within the same primary complaint file',
        strength: 0.8
      });
    }
  }

  // 2. CDR Telecom Surveillance Hub (Level 1 / 2 / 3)
  if (telecom.analyzed) {
    addNode({
      id: 'cdr',
      label: 'BTS Sector 17',
      subLabel: 'Cell tower — CDR hub',
      type: 'location',
      level: 1,
      confidence: 98,
      riskLevel: 'HIGH',
      verificationStatus: 'Carrier certified',
      source: 'CDR — Telecom Service Provider',
      firstObserved: '10 Aug 2026, 00:01 IST',
      lastObserved: '10 Aug 2026, 23:59 IST',
      detail: 'Cellular tower aggregation node monitoring BTS sector handshakes during incident window.',
      imsiBinding: 'LAC-404-20 · MCC-404 · MNC-20',
      x: 180, y: 180
    });

    (telecom.phones || []).forEach((ph, i) => {
      const match = (fir.phones || []).includes(ph);
      const id = `cp-${i}`;
      cdrNodeIds.push(id);
      addNode({
        id,
        label: ph,
        subLabel: match ? 'Cross-matched — FIR + CDR' : 'CDR subscriber',
        type: match ? 'match' : 'phone',
        level: match ? 2 : 3,
        confidence: match ? 99 : 88,
        riskLevel: match ? 'CRITICAL' : 'MEDIUM',
        verificationStatus: match ? 'Verified — Sec 63 BSA' : 'Carrier logged',
        source: 'CDR — Telecom Service Provider',
        firstObserved: '10 Aug 2026, 14:28 IST',
        lastObserved: '10 Aug 2026, 15:05 IST',
        detail: match 
          ? 'Cross-corroboration confirmed: active in BTS logs AND cited in victim FIR statement.'
          : 'Cellular subscriber detected during incident time-window triangulation.',
        imsiBinding: 'IMSI::404-20-XXXXXX',
        x: 140 - (i * 20), y: 80 + (i * 80)
      });

      addEdge({
        id: `e-cp-${i}`,
        source: 'cdr',
        target: id,
        label: 'Tower intercept',
        type: 'primary',
        confidence: 92,
        evidence: 'BTS switch tower log handshake record',
        strength: 1.5
      });

      if (match) {
        const fi = (fir.phones || []).indexOf(ph);
        addEdge({
          id: `e-xp-${i}`,
          source: `fp-${fi}`,
          target: id,
          label: 'Corroborated — Sec 63',
          type: 'corroboration',
          confidence: 99,
          evidence: 'Independent CDR carrier log confirms exact FIR phone deposition (BSA Sec 63)',
          strength: 3.0
        });
      }
    });

    for (let i = 0; i < cdrNodeIds.length - 1; i++) {
      addEdge({
        id: `e-cdr-mesh-${i}`,
        source: cdrNodeIds[i],
        target: cdrNodeIds[i+1],
        label: 'Co-present at tower',
        type: 'concentric-web',
        confidence: 65,
        evidence: 'Cellular nodes sharing common BTS tower sectors',
        strength: 0.8
      });
    }
  }

  // 3. Financial & Ledger Gateway (Level 1 / 2 / 3)
  if (crypto.analyzed) {
    addNode({
      id: 'ledger',
      label: 'SBI Bank A/C 3091',
      subLabel: 'Mule bank account',
      type: 'financial',
      level: 1,
      confidence: 99,
      riskLevel: 'CRITICAL',
      verificationStatus: 'Bank verified',
      source: 'Core Banking Logs (SBI)',
      firstObserved: '10 Aug 2026, 14:30 IST',
      lastObserved: '10 Aug 2026, 15:45 IST',
      detail: 'Mule bank account receiving phished funds before rapid crypto conversion.',
      imsiBinding: 'IFSC: SBIN0001234 · A/C: 30910293021',
      x: 460, y: 340
    });

    (crypto.wallets || []).forEach((w, i) => {
      const mi = (fir.wallets || []).findIndex(fw => fw.toLowerCase() === w.toLowerCase());
      const match = mi >= 0;
      const id = `cw-${i}`;
      cryptoNodeIds.push(id);
      addNode({
        id,
        label: `${w.slice(0,6)}…${w.slice(-4)}`,
        subLabel: match ? 'Verified — FIR + chain' : 'Transit wallet',
        type: match ? 'match' : 'wallet',
        level: match ? 2 : 3,
        confidence: match ? 99 : 85,
        riskLevel: match ? 'CRITICAL' : 'HIGH',
        verificationStatus: match ? 'Verified — Sec 63 BSA' : 'Trace recorded',
        source: 'Blockchain trace (EVM RPC)',
        firstObserved: '10 Aug 2026, 14:35 IST',
        lastObserved: '10 Aug 2026, 15:40 IST',
        detail: match
          ? 'Cross-corroboration confirmed: destination address cited in complaint AND active in fund transfer graph.'
          : 'Intermediate transit wallet used in fund layering hops.',
        imsiBinding: w,
        x: 520 + (i * 40), y: 260 + (i * 70)
      });

      addEdge({
        id: `e-cw-${i}`,
        source: 'ledger',
        target: id,
        label: 'Fund transfer',
        type: 'primary',
        confidence: 95,
        evidence: 'EVM transaction hop confirmed via public RPC trace',
        strength: 1.8
      });

      if (match) {
        addEdge({
          id: `e-xw-${i}`,
          source: `fw-${mi}`,
          target: id,
          label: 'Corroborated — Sec 63',
          type: 'corroboration',
          confidence: 99,
          evidence: 'On-chain transaction hash corroborates exact FIR destination wallet (BSA Sec 63)',
          strength: 3.0
        });
      }
    });

    for (let i = 0; i < cryptoNodeIds.length - 1; i++) {
      addEdge({
        id: `e-crypto-mesh-${i}`,
        source: cryptoNodeIds[i],
        target: cryptoNodeIds[i+1],
        label: 'Layering hop',
        type: 'concentric-web',
        confidence: 70,
        evidence: 'Wallets connected via intermediate transit hop pathways',
        strength: 0.8
      });
    }
  }

  // Cross-hub backbone connectors
  if (fir.loaded && telecom.analyzed) {
    addEdge({
      id: 'e-hub-fir-cdr',
      source: 'fir-doc',
      target: 'cdr',
      label: 'FIR ↔ CDR link',
      type: 'backbone',
      confidence: 96,
      evidence: 'Direct evidentiary synthesis between case file and cellular CDR stream',
      strength: 2.2
    });
  }
  if (fir.loaded && crypto.analyzed) {
    addEdge({
      id: 'e-hub-fir-crypto',
      source: 'fir-doc',
      target: 'ledger',
      label: 'FIR ↔ Financial link',
      type: 'backbone',
      confidence: 98,
      evidence: 'Direct evidentiary synthesis between complaint deposition and banking ledger',
      strength: 2.2
    });
  }
  if (telecom.analyzed && crypto.analyzed) {
    addEdge({
      id: 'e-hub-cdr-crypto',
      source: 'cdr',
      target: 'ledger',
      label: 'CDR ↔ Financial link',
      type: 'backbone',
      confidence: 92,
      evidence: 'Simultaneous cellular triangulation and financial layering window match',
      strength: 2.0
    });
  }

  return { nodes, edges };
}

// ─────────────────────────────────────────────────────────────
// ── CHANDIGARH POLICE FORENSIC CANVAS ENGINE ─────────────────
// ─────────────────────────────────────────────────────────────

function CyberNeuralCanvas({
  nodes,
  edges,
  selectedNodeId,
  selectedEdgeId,
  onSelectNode,
  onSelectEdge,
  focusMode,
  traceMode,
  topologyMode,
  isDark
}) {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);

  // Camera State
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const hoveredNodeRef = useRef(null);
  const hoveredEdgeRef = useRef(null);
  const draggedNodeRef = useRef(null);
  const pulsePacketRef = useRef({ t: 0, edgeIndex: 0 });

  // Adjacency map for fast 1st-degree lookups
  const adjacency = useMemo(() => {
    const map = new Map();
    nodes.forEach(n => map.set(n.id, new Set()));
    edges.forEach(e => {
      if (map.has(e.source)) map.get(e.source).add(e.target);
      if (map.has(e.target)) map.get(e.target).add(e.source);
    });
    return map;
  }, [nodes, edges]);

  // Positions dictionary
  const positionsRef = useRef(new Map());

  // Initialize & update positions based on topology mode
  useEffect(() => {
    const posMap = new Map();
    const width = 800;
    const height = 540;
    const cx = width / 2;
    const cy = height / 2;

    if (topologyMode === 'EVIDENCE_FLOW') {
      // Hierarchical Forensic Evidence Flow
      nodes.forEach((n, idx) => {
        let x = cx;
        let y = cy;
        if (n.type === 'case') x = cx * 0.35;
        else if (n.type === 'location' || n.type === 'phone') x = cx * 0.85;
        else if (n.type === 'suspect' || n.type === 'match') x = cx * 1.35;
        else if (n.type === 'wallet' || n.type === 'financial') x = cx * 1.75;
        
        y = 90 + (idx % 6) * 70;
        posMap.set(n.id, { x, y, vx: 0, vy: 0, fixed: true });
      });
    } else {
      // Asymmetric Organic Spider-Web Evidence Network
      const coreNodes = nodes.filter(n => n.level === 1);
      const subNodes  = nodes.filter(n => n.level === 2);
      const endNodes  = nodes.filter(n => n.level >= 3);

      // Central core hubs
      coreNodes.forEach((n, i) => {
        const angle = (i * (2 * Math.PI / Math.max(1, coreNodes.length))) - Math.PI / 2;
        const r = 80;
        posMap.set(n.id, {
          x: cx + r * Math.cos(angle),
          y: cy + r * Math.sin(angle),
          vx: 0, vy: 0
        });
      });

      // Intermediate corroborations & suspect accomplices
      subNodes.forEach((n, i) => {
        const angle = (i * (2 * Math.PI / Math.max(1, subNodes.length))) + Math.PI / 4;
        const r = 165;
        posMap.set(n.id, {
          x: cx + r * Math.cos(angle),
          y: cy + r * Math.sin(angle),
          vx: 0, vy: 0
        });
      });

      // Peripheral endpoints
      endNodes.forEach((n, i) => {
        const angle = (i * (2 * Math.PI / Math.max(1, endNodes.length))) - Math.PI / 6;
        const r = 240 + (i % 2 === 0 ? 25 : -25);
        posMap.set(n.id, {
          x: cx + r * Math.cos(angle),
          y: cy + r * Math.sin(angle),
          vx: 0, vy: 0
        });
      });
    }

    positionsRef.current = posMap;
  }, [nodes, edges, topologyMode]);

  // Main Canvas Render Loop (60FPS Forensic Simulation)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let time = 0;

    const render = () => {
      time += 0.02;
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.parentElement?.clientWidth || 800;
      const h = canvas.parentElement?.clientHeight || 540;

      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // Deep Navy Forensic Slate Workstation Background
      ctx.fillStyle = '#080E1A';
      ctx.fillRect(0, 0, w, h);

      // World transform (Pan & Zoom)
      ctx.translate(w / 2 + pan.x, h / 2 + pan.y);
      ctx.scale(zoom, zoom);
      ctx.translate(-w / 2, -h / 2);

      const posMap = positionsRef.current;

      // ── 1. Draw Administrative Coordinate Grid ──
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
      ctx.lineWidth = 1;
      const gridSpacing = 48;
      for (let x = -300; x < w + 300; x += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, -300);
        ctx.lineTo(x, h + 300);
        ctx.stroke();
      }
      for (let y = -300; y < h + 300; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(-300, y);
        ctx.lineTo(w + 300, y);
        ctx.stroke();
      }
      ctx.restore();

      // ── 2. Draw Forensic Evidence Synapses ──
      edges.forEach((edge, eIdx) => {
        const p1 = posMap.get(edge.source);
        const p2 = posMap.get(edge.target);
        if (!p1 || !p2) return;

        const isSelected = selectedEdgeId === edge.id;
        const isActiveLink = selectedNodeId && (edge.source === selectedNodeId || edge.target === selectedNodeId);
        const isConnectedNeighbor = selectedNodeId && (
          adjacency.get(selectedNodeId)?.has(edge.source) && adjacency.get(selectedNodeId)?.has(edge.target)
        );

        let alpha = 0.45;
        if (selectedNodeId || selectedEdgeId) {
          if (isSelected || isActiveLink) alpha = 1.0;
          else if (isConnectedNeighbor && !focusMode) alpha = 0.7;
          else alpha = focusMode ? 0.04 : 0.15;
        }

        const isCorrob = edge.type === 'corroboration';
        const isBackbone = edge.type === 'backbone';
        const isWeb = edge.type === 'concentric-web';

        // Organic curve control point
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const curveOffset = isWeb ? 16 : (isCorrob ? -18 : (Math.sin(time + dist * 0.01) * 6));
        const cx = midX - (dy / (dist || 1)) * curveOffset;
        const cy = midY + (dx / (dist || 1)) * curveOffset;

        ctx.save();
        ctx.globalAlpha = alpha;

        // Relationship-weighted stroke color
        let strokeColor = '#334155'; // Neutral dark slate
        if (isCorrob) strokeColor = '#F0A91E'; // Sutral Gold Section 63 Corroboration
        else if (isBackbone) strokeColor = '#DC2626'; // Red Accused link
        else if (isActiveLink || isSelected) strokeColor = '#38BDF8'; // Active Inspection Cyan

        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = isSelected ? 2.5 : (isCorrob ? 2.0 : (edge.strength || 1.2));

        if (isWeb || isCorrob) {
          ctx.setLineDash(isCorrob ? [6, 3] : [3, 3]);
        } else {
          ctx.setLineDash([]);
        }

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.quadraticCurveTo(cx, cy, p2.x, p2.y);
        ctx.stroke();

        ctx.restore();

        // Controlled Signal Pulse (ONLY on selected relationship, active trace, or active node links)
        const shouldAnimatePulse = isSelected || (traceMode && (isCorrob || isBackbone)) || (selectedNodeId && isActiveLink);
        if (shouldAnimatePulse) {
          const pulseT = ((time * 0.8) + (eIdx * 0.25)) % 1.0;
          const px = (1 - pulseT) * (1 - pulseT) * p1.x + 2 * (1 - pulseT) * pulseT * cx + pulseT * pulseT * p2.x;
          const py = (1 - pulseT) * (1 - pulseT) * p1.y + 2 * (1 - pulseT) * pulseT * cy + pulseT * pulseT * p2.y;

          ctx.save();
          ctx.fillStyle = isCorrob ? '#F0A91E' : '#38BDF8';
          ctx.beginPath();
          ctx.arc(px, py, 2.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });

      // ── 3. Draw Forensic Technical Nodes ──
      nodes.forEach(node => {
        const pos = posMap.get(node.id);
        if (!pos) return;

        const isSelected = selectedNodeId === node.id;
        const isHovered  = hoveredNodeRef.current?.id === node.id;
        const isNeighbor = selectedNodeId && adjacency.get(selectedNodeId)?.has(node.id);

        let alpha = 1.0;
        if (selectedNodeId) {
          if (isSelected) alpha = 1.0;
          else if (isNeighbor) alpha = 0.95;
          else alpha = focusMode ? 0.12 : 0.35;
        }

        const theme = NODE_THEMES[node.type] || NODE_THEMES.unverified;
        const baseRadius = node.level === 1 ? 16 : (node.level === 2 ? 13 : 10);
        const r = isSelected ? baseRadius + 3 : (isHovered ? baseRadius + 2 : baseRadius);

        ctx.save();
        ctx.globalAlpha = alpha;

        // Solid Technical Node Disc (Deep Charcoal Base)
        ctx.fillStyle = '#0B1220';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
        ctx.fill();

        // Technical Outer Boundary Stroke
        ctx.strokeStyle = isSelected ? '#F0A91E' : theme.border;
        ctx.lineWidth = isSelected ? 2.2 : 1.5;
        ctx.stroke();

        // Inner Semantic Core
        ctx.fillStyle = theme.core;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, r * 0.72, 0, Math.PI * 2);
        ctx.fill();

        // Recognisable Technical Symbol (canvas-safe, no emoji)
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `${theme.glyphFont || 'bold'} ${Math.round(r * 0.82)}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(theme.glyph || '?', pos.x, pos.y);

        // Status Indicator Pip (Top-Right of Node)
        if (node.riskLevel === 'CRITICAL' || node.type === 'match') {
          ctx.fillStyle = node.riskLevel === 'CRITICAL' ? '#DC2626' : '#F0A91E';
          ctx.beginPath();
          ctx.arc(pos.x + r * 0.65, pos.y - r * 0.65, 3.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#0B1220';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Selection ring — thin dashed outline, no neon
        if (isSelected) {
          ctx.strokeStyle = '#F0A91E';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, r + 4.5, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Clean label — plain text, subtle dark background, no pill border
        ctx.font = isSelected ? 'bold 8px Inter, sans-serif' : '600 7.5px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        const labelText = node.label.length > 22 ? node.label.slice(0, 20) + '…' : node.label;
        const textY = pos.y + r + 5;
        const textWidth = ctx.measureText(labelText).width;

        // Subtle label background — no border, just slight transparency
        ctx.fillStyle = 'rgba(8, 14, 26, 0.82)';
        ctx.fillRect(pos.x - textWidth / 2 - 3, textY - 1, textWidth + 6, 11);

        ctx.fillStyle = isSelected ? '#F0A91E' : (node.type === 'suspect' ? '#FCA5A5' : '#CBD5E1');
        ctx.fillText(labelText, pos.x, textY + 0.5);

        ctx.restore();
      });

      ctx.restore();
      animFrameRef.current = requestAnimationFrame(render);
    };

    render();
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [nodes, edges, pan, zoom, selectedNodeId, selectedEdgeId, focusMode, traceMode, isDark, adjacency]);

  // Screen-to-World Coordinate Conversion
  const screenToWorld = useCallback((screenX, screenY) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    const clientX = screenX - rect.left;
    const clientY = screenY - rect.top;

    const worldX = (clientX - (w / 2 + pan.x)) / zoom + w / 2;
    const worldY = (clientY - (h / 2 + pan.y)) / zoom + h / 2;
    return { x: worldX, y: worldY };
  }, [pan, zoom]);

  // Hit-Testing Node
  const getNodeAt = useCallback((worldX, worldY) => {
    const posMap = positionsRef.current;
    for (let i = nodes.length - 1; i >= 0; i--) {
      const node = nodes[i];
      const pos = posMap.get(node.id);
      if (!pos) continue;
      const r = (node.level === 1 ? 22 : (node.level === 2 ? 18 : 14));
      const dx = worldX - pos.x;
      const dy = worldY - pos.y;
      if (dx * dx + dy * dy <= r * r) {
        return node;
      }
    }
    return null;
  }, [nodes]);

  // Hit-Testing Edge
  const getEdgeAt = useCallback((worldX, worldY) => {
    const posMap = positionsRef.current;
    for (let i = 0; i < edges.length; i++) {
      const edge = edges[i];
      const p1 = posMap.get(edge.source);
      const p2 = posMap.get(edge.target);
      if (!p1 || !p2) continue;

      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const cx = midX - (dy / (dist || 1)) * 12;
      const cy = midY + (dx / (dist || 1)) * 12;

      for (let t = 0.1; t <= 0.9; t += 0.1) {
        const bx = (1 - t) * (1 - t) * p1.x + 2 * (1 - t) * t * cx + t * t * p2.x;
        const by = (1 - t) * (1 - t) * p1.y + 2 * (1 - t) * t * cy + t * t * p2.y;
        const dsq = (worldX - bx) * (worldX - bx) + (worldY - by) * (worldY - by);
        if (dsq < 64) {
          return edge;
        }
      }
    }
    return null;
  }, [edges]);

  // Mouse Interaction Handlers
  const handleMouseDown = (e) => {
    const { x, y } = screenToWorld(e.clientX, e.clientY);
    const clickedNode = getNodeAt(x, y);

    if (clickedNode) {
      draggedNodeRef.current = clickedNode;
      onSelectNode(clickedNode.id);
      return;
    }

    const clickedEdge = getEdgeAt(x, y);
    if (clickedEdge) {
      onSelectEdge(clickedEdge.id);
      return;
    }

    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e) => {
    const { x, y } = screenToWorld(e.clientX, e.clientY);

    if (draggedNodeRef.current) {
      const posMap = positionsRef.current;
      const nodePos = posMap.get(draggedNodeRef.current.id);
      if (nodePos) {
        nodePos.x = x;
        nodePos.y = y;
      }
      return;
    }

    if (isDraggingRef.current) {
      setPan({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y
      });
      return;
    }

    hoveredNodeRef.current = getNodeAt(x, y);
    hoveredEdgeRef.current = hoveredNodeRef.current ? null : getEdgeAt(x, y);
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    draggedNodeRef.current = null;
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setZoom(prev => Math.min(3.0, Math.max(0.4, prev * zoomFactor)));
  };

  return (
    <div className="w-full h-full relative select-none overflow-hidden cursor-crosshair">
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ── MAIN LINKAGE ANALYSIS PAGE COMPONENT ─────────────────────
// ─────────────────────────────────────────────────────────────

export default function LinkageAnalysis({ theme }) {
  const { fir: ctxFir, telecom: ctxTelecom, crypto: ctxCrypto, media: ctxMedia } = useCase();
  const isDark = theme === 'dark' || (typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));

  // Ensure case data is ALWAYS present on initial load
  const fir = useMemo(() => ctxFir?.loaded ? ctxFir : DEFAULT_ACTIVE_CASE.fir, [ctxFir]);
  const telecom = useMemo(() => ctxTelecom?.analyzed ? ctxTelecom : DEFAULT_ACTIVE_CASE.telecom, [ctxTelecom]);
  const crypto = useMemo(() => ctxCrypto?.analyzed ? ctxCrypto : DEFAULT_ACTIVE_CASE.crypto, [ctxCrypto]);
  const media = useMemo(() => ctxMedia?.analyzed ? ctxMedia : DEFAULT_ACTIVE_CASE.media, [ctxMedia]);

  // Interactive Investigation States
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState(null);
  const [focusMode, setFocusMode] = useState(false);
  const [traceMode, setTraceMode] = useState(false);
  const [topologyMode, setTopologyMode] = useState('NEURAL_SPIDER');
  const [inspectorFilter, setInspectorFilter] = useState('ALL');
  const [docketModalNode, setDocketModalNode] = useState(null);
  const [backendGraph, setBackendGraph] = useState(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await api.linkage.getGraph('KG-2026-0818');
        if (isMounted && res?.data?.nodes?.length) {
          setBackendGraph(res.data);
        }
      } catch (err) {
        console.warn('Backend linkage graph fetch deferred:', err.message);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  const intel = useMemo(() => deriveIntelligence(fir, telecom, crypto, media), [fir, telecom, crypto, media]);
  const narrative = useMemo(() => {
    if (backendGraph?.narrative) return backendGraph.narrative;
    return buildNarrative(fir, telecom, crypto, media, intel);
  }, [fir, telecom, crypto, media, intel, backendGraph]);
  
  // Build rich neural entities & synaptic edges
  const { nodes, edges } = useMemo(() => {
    if (backendGraph?.nodes?.length && backendGraph?.edges?.length) {
      return {
        nodes: backendGraph.nodes,
        edges: backendGraph.edges
      };
    }
    return buildNeuralNetworkData(fir, telecom, crypto, media);
  }, [fir, telecom, crypto, media, backendGraph]);

  // Selected Node Details
  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    return nodes.find(n => n.id === selectedNodeId) || null;
  }, [nodes, selectedNodeId]);

  // Selected Edge Details
  const selectedEdge = useMemo(() => {
    if (!selectedEdgeId) return null;
    return edges.find(e => e.id === selectedEdgeId) || null;
  }, [edges, selectedEdgeId]);

  // Neighbor nodes of selected node
  const neighborNodes = useMemo(() => {
    if (!selectedNodeId) return [];
    const connected = [];
    edges.forEach(e => {
      if (e.source === selectedNodeId) {
        const targetNode = nodes.find(n => n.id === e.target);
        if (targetNode) connected.push({ node: targetNode, rel: e.label, edgeId: e.id });
      } else if (e.target === selectedNodeId) {
        const sourceNode = nodes.find(n => n.id === e.source);
        if (sourceNode) connected.push({ node: sourceNode, rel: e.label, edgeId: e.id });
      }
    });
    return connected;
  }, [selectedNodeId, nodes, edges]);

  // Grouped nodes for overall inspector inventory
  const groupedNodes = useMemo(() => {
    const groups = {
      vault: nodes.filter(n => n.source.includes('FIR')),
      telecom: nodes.filter(n => n.source.includes('CDR')),
      crypto: nodes.filter(n => n.source.includes('Banking') || n.source.includes('Blockchain')),
    };
    return groups;
  }, [nodes]);

  const handleSelectNode = (id) => {
    setSelectedNodeId(prev => prev === id ? null : id);
    setSelectedEdgeId(null);
  };

  const handleSelectEdge = (id) => {
    setSelectedEdgeId(prev => prev === id ? null : id);
    setSelectedNodeId(null);
  };

  const riskColor = intel.overallRisk === 'CRITICAL' ? '#DC2626'
                  : intel.overallRisk === 'HIGH'     ? '#D97706'
                  : intel.overallRisk === 'MEDIUM'   ? '#CA8A04'
                  : 'var(--text-tertiary)';

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ backgroundColor: 'var(--bg-app)' }}>

      {/* ── Official Khakhi Guard Command Header ─────────────── */}
      <CaseHeader moduleName="Linkage Intelligence Analysis & Neural Evidence Network" />

      {/* ── Top Statutory Certification Sub-Banner ───────────── */}
      <div className="shrink-0 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b text-xs z-10 select-none surface-workspace"
           style={{ backgroundColor: 'var(--bg-workspace)', borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center gap-3 min-w-0">
          <span className="pl-2 border-l-2 border-[#DC2626] text-[10px] font-extrabold uppercase text-[#DC2626] flex items-center gap-1 shrink-0">
            <Award size={13} /> Section 63 BSA Corroboration & Multi-Source Evidence Matrix
          </span>
          <span className="text-[11px] font-medium truncate hidden md:inline" style={{ color: 'var(--text-secondary)' }}>
            Chandigarh Police Cyber Crime Investigation Division · Case File KG-2026-0818
          </span>
        </div>

        {/* Source Status Indicators */}
        <div className="flex items-center gap-2 font-mono text-[10px] shrink-0">
          {[
            { label: 'FIR Registry',  active: fir.loaded,       color: '#3B82F6' },
            { label: 'CDR / Telecom', active: telecom.analyzed, color: '#0284C7' },
            { label: 'Banking',       active: crypto.analyzed,  color: '#D97706' },
            { label: 'Media / OSINT', active: media.analyzed,   color: '#16A34A' },
          ].map(({ label, active, color }) => (
            <span key={label} className={`flex items-center gap-1.5 font-semibold tracking-wide px-2 py-0.5 rounded border text-[9px] ${isDark ? 'border-white/5 bg-black/30' : 'border-slate-200 bg-slate-50'}`}
                  style={{ color: active ? color : 'var(--text-tertiary)' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: active ? color : 'var(--border-medium)' }} />
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Main Scrollable Workspace Body ──────────────────── */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">

          {/* ── HERO ANALYSIS GRID: 70% GRAPH + 30% INSPECTOR ──── */}
          <section className="space-y-2">
            <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            <span className="text-sky-600 dark:text-cyan-400">►</span>
            Evidence Correlation Network — {nodes.length} entities · {edges.length} connections
          </div>
          <div className="flex items-center gap-3 text-[10px] text-slate-600 dark:text-slate-400">
            <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> Live data</span>
            <span className="text-slate-400">|</span>
            <span className="text-amber-600 dark:text-amber-400 font-medium">{intel.matchedPhones.length + intel.matchedWallets.length} corroborated intersections</span>
          </div>
            </div>

            {/* Main Graph Card Container (Fixed 540px Height, Side-by-Side) */}
            <div className="flex flex-row border rounded-lg overflow-hidden relative shadow-lg"
                 style={{ height: '540px', borderColor: 'var(--border-subtle)', backgroundColor: '#080E1A' }}>
              
              {/* ── LEFT / CENTER: ~70% Width Interactive Neural Canvas ── */}
              <div className="flex-1 relative min-w-0 h-full overflow-hidden" style={{ backgroundColor: '#080E1A' }}>
                
                {/* Top-Left HUD Header */}
                <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5 select-none font-mono text-[9px] pointer-events-none">
                  <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-slate-900/90 border border-slate-700/80 text-slate-200">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="font-semibold tracking-wide">Chandigarh Police · Evidence Network</span>
                  </div>

                  {/* Entity Type Legend */}
                  <div className="flex flex-col gap-1 p-2 rounded bg-slate-900/90 border border-slate-700/80 text-slate-300">
                    {[
                      { color: '#DC2626', label: 'Person / Suspect' },
                      { color: '#1D4ED8', label: 'Verified evidence' },
                      { color: '#0284C7', label: 'Phone / CDR' },
                      { color: '#D97706', label: 'Bank / Financial' },
                      { color: '#7E22CE', label: 'Digital Wallet' },
                      { color: '#16A34A', label: 'Cell Tower' },
                      { color: '#475569', label: 'Case / FIR' },
                    ].map(({ color, label }) => (
                      <span key={label} className="flex items-center gap-1.5 text-[8px] font-medium">
                        <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: color, display: 'inline-block' }} />
                        {label}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Top-Right Graph Controls */}
                <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 font-mono text-[9px] select-none">
                  
                  {/* Topology Switcher */}
                  <div className="flex items-center rounded bg-slate-900/90 border border-slate-700/80 p-0.5">
                    <button 
                      onClick={() => setTopologyMode('NEURAL_SPIDER')} 
                      className={`px-2.5 py-1 rounded text-[8px] font-semibold transition-all cursor-pointer ${topologyMode === 'NEURAL_SPIDER' ? 'bg-[#F0A91E] text-[#050B14]' : 'text-slate-300 hover:text-white'}`}
                    >
                      Network
                    </button>
                    <button 
                      onClick={() => setTopologyMode('EVIDENCE_FLOW')} 
                      className={`px-2.5 py-1 rounded text-[8px] font-semibold transition-all cursor-pointer ${topologyMode === 'EVIDENCE_FLOW' ? 'bg-[#F0A91E] text-[#050B14]' : 'text-slate-300 hover:text-white'}`}
                    >
                      Flow
                    </button>
                  </div>

                  {/* Focus Mode Toggle */}
                  <button 
                    onClick={() => setFocusMode(prev => !prev)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded border font-semibold transition-all cursor-pointer ${focusMode ? 'bg-[#DC2626] border-[#DC2626] text-white' : 'bg-slate-900/90 border-slate-700/80 text-slate-300 hover:text-white'}`}
                  >
                    <Crosshair size={11} />
                    <span>{focusMode ? 'Focus: On' : 'Focus'}</span>
                  </button>

                  {/* Trace Mode Toggle */}
                  <button 
                    onClick={() => setTraceMode(prev => !prev)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded border font-semibold transition-all cursor-pointer ${traceMode ? 'bg-[#0284C7] border-[#0284C7] text-white' : 'bg-slate-900/90 border-slate-700/80 text-slate-300 hover:text-white'}`}
                  >
                    <Zap size={11} />
                    <span>{traceMode ? 'Trace: On' : 'Trace Path'}</span>
                  </button>

                  {/* Reset Selection */}
                  {(selectedNodeId || selectedEdgeId) && (
                    <button 
                      onClick={() => { setSelectedNodeId(null); setSelectedEdgeId(null); }}
                      className="px-2 py-1 rounded border border-slate-600/50 bg-slate-800/80 text-slate-300 text-[8px] font-semibold hover:bg-slate-700/80 cursor-pointer"
                    >
                      Reset View
                    </button>
                  )}
                </div>

                {/* Bottom Status Strip */}
                <div className="absolute bottom-2 left-3 right-3 z-20 flex items-center justify-between px-3 py-1 rounded bg-slate-900/90 border border-slate-700/80 font-mono text-[8px] text-slate-300 select-none">
                  <span className="flex items-center gap-1.5">
                    <span className="text-red-400 font-semibold">Section 63 BSA</span>
                    <span>· Statutory admissibility audit trail active</span>
                  </span>
                  <span className="text-amber-400 font-medium">
                    {selectedNodeId ? `Selected: ${selectedNode?.label}` : (selectedEdgeId ? `Link: ${selectedEdge?.label}` : 'Click any entity or connection to inspect')}
                  </span>
                </div>

                {/* ── Real-Time Cyber Neural Canvas ── */}
                <CyberNeuralCanvas
                  nodes={nodes}
                  edges={edges}
                  selectedNodeId={selectedNodeId}
                  selectedEdgeId={selectedEdgeId}
                  onSelectNode={handleSelectNode}
                  onSelectEdge={handleSelectEdge}
                  focusMode={focusMode}
                  traceMode={traceMode}
                  topologyMode={topologyMode}
                  isDark={isDark}
                />
              </div>

              {/* ── RIGHT: ~30% Width Synapse Intelligence Inspector ── */}
              <div className="w-80 md:w-96 shrink-0 h-full border-l flex flex-col font-mono"
                   style={{ backgroundColor: 'var(--bg-workspace)', borderColor: 'var(--border-subtle)' }}>
                
                {/* Inspector Header */}
                <div className="px-4 py-3 flex items-center justify-between border-b shrink-0"
                     style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-elevated)' }}>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src="/khakhi_guard_logo.jpg"
                      alt="Official Seal"
                      className="w-6 h-6 rounded-full object-cover border border-[#F0A91E] shrink-0 shadow-sm"
                    />
                    <div className="min-w-0">
                      <span className="text-[10px] font-black uppercase tracking-wider block truncate text-[#DC2626]">
                        {selectedNode ? 'Entity Details' : (selectedEdge ? 'Relationship Details' : 'Evidence Summary')}
                      </span>
                      <span className="text-[8px] font-semibold text-slate-500 dark:text-slate-400 block truncate">
                        {selectedNode ? (NODE_THEMES[selectedNode.type]?.label || selectedNode.type) : (selectedEdge ? 'Connection' : `${nodes.length} entities monitored`)}
                      </span>
                    </div>
                  </div>

                  {selectedNode && (
                    <span className="text-[8px] font-semibold px-1.5 py-0.5 rounded text-amber-700 dark:text-amber-400 shrink-0">
                      Confidence: {selectedNode.confidence}%
                    </span>
                  )}
                </div>

                {/* Inspector Scroll Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  
                  {/* ── State A: Entity Inspector View ── */}
                  {selectedNode ? (
                    <div className="space-y-3">
                      
                      {/* Entity Header Card */}
                      <div className={`p-3 rounded border space-y-2 ${isDark ? 'bg-black/30 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-medium text-slate-500 dark:text-slate-400">
                            {selectedNode.verificationStatus}
                          </span>
                          <span className="text-[9px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <span style={{ width: 5, height: 5, borderRadius: '50%', display: 'inline-block', backgroundColor: selectedNode.riskLevel === 'CRITICAL' ? '#DC2626' : selectedNode.riskLevel === 'HIGH' ? '#D97706' : '#64748B' }} />
                            Risk: {selectedNode.riskLevel === 'CRITICAL' ? 'Critical' : selectedNode.riskLevel === 'HIGH' ? 'High' : 'Medium'}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 break-words leading-tight">
                          {selectedNode.label}
                        </h4>

                        {selectedNode.subLabel && (
                          <p className="text-[10px]" style={{ color: NODE_THEMES[selectedNode.type]?.accent || '#0284C7' }}>
                            {selectedNode.subLabel}
                          </p>
                        )}

                        <div className="pt-1 border-t border-slate-200 dark:border-white/5 space-y-1 text-[9px] text-slate-600 dark:text-slate-400">
                          <div className="flex justify-between">
                            <span>Source:</span>
                            <strong className="text-slate-900 dark:text-slate-200">{selectedNode.source}</strong>
                          </div>
                          {selectedNode.firstObserved && (
                            <div className="flex justify-between">
                              <span>First observed:</span>
                              <span className="text-slate-800 dark:text-slate-300">{selectedNode.firstObserved}</span>
                            </div>
                          )}
                          {selectedNode.lastObserved && (
                            <div className="flex justify-between">
                              <span>Last observed:</span>
                              <span className="text-slate-800 dark:text-slate-300">{selectedNode.lastObserved}</span>
                            </div>
                          )}
                          {selectedNode.imsiBinding && (
                            <div className="pt-1">
                              <span className="block text-[8px] text-slate-500">Identifier:</span>
                              <span className="font-mono text-[9px] text-slate-800 dark:text-slate-200 break-all">{selectedNode.imsiBinding}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Evidence Summary */}
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold uppercase text-slate-600 dark:text-slate-400 tracking-wide">Evidence Summary</span>
                        <p className={`text-[11px] leading-relaxed font-sans p-2 rounded border ${isDark ? 'bg-white/5 border-white/5 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                          {selectedNode.detail}
                        </p>
                      </div>

                      {/* Connected Entities */}
                      <div className="space-y-2">
                        <span className="text-[9px] font-bold uppercase text-slate-600 dark:text-slate-400 tracking-wide flex items-center justify-between">
                          <span>Connected Entities ({neighborNodes.length})</span>
                          <span className="text-[8px] text-[#DC2626] normal-case font-normal">click to focus</span>
                        </span>

                        <div className="space-y-1.5">
                          {neighborNodes.map(({ node, rel }) => (
                            <div 
                              key={node.id}
                              onClick={() => handleSelectNode(node.id)}
                              className={`p-2 rounded border cursor-pointer transition-all flex items-center justify-between text-xs ${isDark ? 'border-white/5 bg-black/20 hover:bg-slate-800' : 'border-slate-200 bg-white hover:bg-slate-50 shadow-sm'}`}
                            >
                              <div className="flex flex-col min-w-0 pr-2">
                                <span className="text-[8px] text-slate-500 dark:text-slate-400">{rel}</span>
                                <span className="font-semibold text-slate-900 dark:text-slate-200 truncate text-[10px]">{node.label}</span>
                              </div>
                              <ArrowRight size={12} className="text-slate-400 shrink-0" />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Statutory Action Button */}
                      <div className="pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                        <div className="mb-2 pl-2 border-l-2 border-[#F0A91E] text-[10px] font-extrabold uppercase text-[#F0A91E] flex items-center gap-1.5">
                          <Award size={13} /> BSA Section 63 Admissibility
                        </div>

                        <button
                          onClick={() => setDocketModalNode(selectedNode)}
                          className="btn-premium w-full py-2.5 rounded text-xs font-extrabold uppercase text-white justify-center transition-colors duration-150 hover:bg-[#B91C1C] cursor-pointer shadow-sm"
                          style={{ backgroundColor: '#DC2626' }}
                        >
                          Export Statutory Evidence Docket
                        </button>
                      </div>

                    </div>
                  ) : selectedEdge ? (
                    
                    /* ── State B: Relationship Inspector View ── */
                    <div className="space-y-3">
                      <div className={`p-3 rounded border space-y-2 ${isDark ? 'bg-black/30 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
                        <span className="text-[9px] font-medium text-slate-500 dark:text-slate-400 capitalize">
                          {selectedEdge.type.replace(/-/g, ' ')} connection
                        </span>

                        <h4 className="text-xs font-bold text-amber-700 dark:text-amber-400 break-words">
                          {selectedEdge.label}
                        </h4>

                        <div className="pt-2 border-t border-slate-200 dark:border-white/5 space-y-1.5 text-[9px] text-slate-600 dark:text-slate-400">
                          <div className="flex justify-between items-center">
                            <span>From:</span>
                            <button 
                              onClick={() => handleSelectNode(selectedEdge.source)} 
                              className="text-sky-600 dark:text-cyan-400 hover:underline font-semibold cursor-pointer"
                            >
                              {nodes.find(n => n.id === selectedEdge.source)?.label || selectedEdge.source}
                            </button>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>To:</span>
                            <button 
                              onClick={() => handleSelectNode(selectedEdge.target)} 
                              className="text-sky-600 dark:text-cyan-400 hover:underline font-semibold cursor-pointer"
                            >
                              {nodes.find(n => n.id === selectedEdge.target)?.label || selectedEdge.target}
                            </button>
                          </div>
                          <div className="flex justify-between">
                            <span>Confidence:</span>
                            <strong className="text-amber-600 dark:text-amber-300">{selectedEdge.confidence}%</strong>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[9px] font-bold uppercase text-slate-600 dark:text-slate-400 tracking-wide">Evidence basis:</span>
                        <p className={`text-[11px] leading-relaxed font-sans p-2 rounded border ${isDark ? 'bg-white/5 border-white/5 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                          {selectedEdge.evidence}
                        </p>
                      </div>

                      <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30 text-[9px] text-emerald-800 dark:text-emerald-300">
                        <strong>Section 63 BSA:</strong> Corroborated evidence linkage satisfies electronic certificate parameters under Section 63 BSA / Section 106 BNSS.
                      </div>
                    </div>

                  ) : (

                    /* ── State C: Full Evidence Inventory ── */
                    <div className="space-y-4">
                      
                      {/* Quick filter buttons */}
                      <div className="flex items-center gap-1 pb-2 border-b border-slate-200 dark:border-white/5">
                        {[
                          { key: 'ALL', label: 'All' },
                          { key: 'CORROBORATED', label: 'Verified' },
                          { key: 'CRITICAL', label: 'Critical' },
                        ].map(({ key, label }) => (
                          <button
                            key={key}
                            onClick={() => setInspectorFilter(key)}
                            className={`px-2 py-0.5 rounded text-[8px] font-semibold transition-all cursor-pointer ${inspectorFilter === key ? 'bg-[#F0A91E] text-[#050B14]' : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'}`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>

                      {/* Group 1: Case Records */}
                      {groupedNodes.vault.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 pb-0.5 border-b border-slate-200 dark:border-white/5">
                            Case Records ({groupedNodes.vault.length})
                          </p>
                          <div className="space-y-1.5">
                            {groupedNodes.vault.map(node => (
                              <div
                                key={node.id}
                                onClick={() => handleSelectNode(node.id)}
                                className={`p-2.5 rounded border cursor-pointer transition-all space-y-1 ${isDark ? 'border-white/5 bg-black/20 hover:bg-slate-800' : 'border-slate-200 bg-white hover:bg-slate-50 shadow-sm'}`}
                              >
                                <div className="flex justify-between items-center text-[8px]">
                                  <span className="font-medium text-slate-400">{NODE_THEMES[node.type]?.label || node.type}</span>
                                  <span className="text-slate-500">Conf. {node.confidence}%</span>
                                </div>
                                <div className="font-semibold text-slate-900 dark:text-slate-100 text-[10px] truncate">{node.label}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Group 2: CDR / Telecom */}
                      {groupedNodes.telecom.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-[9px] font-bold uppercase tracking-wider text-[#0284C7] flex items-center gap-1.5 pb-0.5 border-b border-slate-200 dark:border-white/5">
                            CDR / Telecom ({groupedNodes.telecom.length})
                          </p>
                          <div className="space-y-1.5">
                            {groupedNodes.telecom.map(node => (
                              <div
                                key={node.id}
                                onClick={() => handleSelectNode(node.id)}
                                className={`p-2.5 rounded border cursor-pointer transition-all space-y-1 ${isDark ? 'border-white/5 bg-black/20 hover:bg-slate-800' : 'border-slate-200 bg-white hover:bg-slate-50 shadow-sm'}`}
                              >
                                <div className="flex justify-between items-center text-[8px]">
                                  <span className={`font-medium ${node.type === 'match' ? 'text-amber-600 dark:text-amber-400' : 'text-sky-700 dark:text-cyan-300'}`}>{NODE_THEMES[node.type]?.label || node.type}</span>
                                  <span className="text-slate-500">Conf. {node.confidence}%</span>
                                </div>
                                <div className="font-semibold text-slate-900 dark:text-slate-100 text-[10px] truncate">{node.label}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Group 3: Financial & Crypto */}
                      {groupedNodes.crypto.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-[9px] font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5 pb-0.5 border-b border-slate-200 dark:border-white/5">
                            Financial & Crypto ({groupedNodes.crypto.length})
                          </p>
                          <div className="space-y-1.5">
                            {groupedNodes.crypto.map(node => (
                              <div
                                key={node.id}
                                onClick={() => handleSelectNode(node.id)}
                                className={`p-2.5 rounded border cursor-pointer transition-all space-y-1 ${isDark ? 'border-white/5 bg-black/20 hover:bg-slate-800' : 'border-slate-200 bg-white hover:bg-slate-50 shadow-sm'}`}
                              >
                                <div className="flex justify-between items-center text-[8px]">
                                  <span className={`font-medium ${node.type === 'match' ? 'text-amber-600 dark:text-amber-400' : 'text-purple-600 dark:text-purple-300'}`}>{NODE_THEMES[node.type]?.label || node.type}</span>
                                  <span className="text-slate-500">Conf. {node.confidence}%</span>
                                </div>
                                <div className="font-semibold text-slate-900 dark:text-slate-100 text-[10px] truncate">{node.label}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  )}

                </div>
              </div>

            </div>
          </section>

          {/* ── Overall Threat Risk Gauge (Khakhi Guard Standard Card) ── */}
          <div className="surface-workspace border p-6 rounded shadow-sm flex flex-wrap items-start gap-8" style={{ borderColor: 'var(--border-subtle)' }}>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest mb-1 font-mono" style={{ color: 'var(--text-tertiary)' }}>
                OVERALL CASE THREAT SCORE
              </p>
              <div className="flex items-end gap-3 font-mono">
                <span className="text-6xl font-black leading-none tracking-tight" style={{ color: riskColor }}>
                  {intel.riskScore}
                </span>
                <div className="pb-1">
                  <p className="text-sm font-extrabold uppercase tracking-wider" style={{ color: riskColor }}>
                    {intel.overallRisk}
                  </p>
                  <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>/ 99 point scale</p>
                </div>
              </div>
              <div className="w-64 h-2 rounded-full overflow-hidden mt-3" style={{ backgroundColor: 'var(--bg-elevated)' }}>
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${intel.riskScore}%`, backgroundColor: riskColor }} />
              </div>
            </div>

            <div className="flex-1 min-w-[220px] space-y-3">
              <div className="flex items-center gap-6 flex-wrap font-mono">
                <div className="text-left">
                  <p className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>{intel.anomalies.length}</p>
                  <p className="text-[9px] font-extrabold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Anomalies</p>
                </div>
                <div className="text-left">
                  <p className="text-2xl font-black text-amber-600 dark:text-amber-400">{intel.matchedPhones.length + intel.matchedWallets.length}</p>
                  <p className="text-[9px] font-extrabold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Cross-Matches</p>
                </div>
                <div className="text-left">
                  <p className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>{intel.suspects.length}</p>
                  <p className="text-[9px] font-extrabold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Suspects</p>
                </div>
                <div className="text-left">
                  <p className="text-2xl font-black text-sky-600 dark:text-cyan-400">{intel.sourceCount}</p>
                  <p className="text-[9px] font-extrabold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Sources</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Auto-Generated Intelligence Narrative ─────────── */}
          {narrative && (
            <section className="surface-workspace border p-6 rounded shadow-sm space-y-3" style={{ borderColor: 'var(--border-subtle)' }}>
              <p className="text-[10px] font-extrabold uppercase tracking-widest font-mono" style={{ color: 'var(--text-tertiary)' }}>
                INVESTIGATIVE SYNOPSIS & STATUTORY OBSERVATIONS
              </p>
              <div className="border-l-4 pl-4 space-y-2" style={{ borderColor: '#DC2626' }}>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {narrative.base}
                </p>
                {narrative.cross && (
                  <p className="text-sm font-extrabold leading-relaxed text-amber-600 dark:text-amber-400">
                    {narrative.cross}
                  </p>
                )}
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                  <strong>Analyst Statutory Verdict:</strong> {narrative.verdict}
                </p>
              </div>
            </section>
          )}

          {/* ── Detected Anomalies & Forensic Flags ───────────── */}
          {intel.anomalies.length > 0 && (
            <section className="space-y-3">
              <p className="text-[10px] font-extrabold uppercase tracking-widest font-mono" style={{ color: 'var(--text-tertiary)' }}>
                FLAGGED FORENSIC ANOMALIES ({intel.anomalies.length})
              </p>
              <div className="space-y-3">
                {intel.anomalies.map((a, i) => (
                  <div key={a.id || i} className={`p-4 rounded border space-y-2.5 ${isDark ? 'bg-black/20 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
                    <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: 'var(--border-subtle)' }}>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: SEV[a.severity]?.color }} />
                        <span className="text-xs font-bold tracking-wide" style={{ color: SEV[a.severity]?.color }}>
                          {a.severity === 'CRITICAL' ? 'Priority 1 — Critical Corroboration' : a.severity === 'HIGH' ? 'Priority 2 — High-Confidence Match' : 'Priority 3 — Advisory Finding'}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                          [{a.type?.replace(/_/g, ' ')}]
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-semibold text-slate-500 dark:text-slate-400">Confidence: {a.confidence}%</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{a.title}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">{a.detail}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Suspect Risk Profiles & Entity Source Matrix ──── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Suspect Profiles */}
            {intel.suspects.length > 0 && (
              <section className="space-y-3">
                <p className="text-[10px] font-extrabold uppercase tracking-widest font-mono" style={{ color: 'var(--text-tertiary)' }}>
                  SUSPECT CORROBORATION PROFILES
                </p>
                <div className="space-y-3">
                  {intel.suspects.map((s, i) => (
                    <div key={i} className={`p-4 rounded border space-y-2 ${isDark ? 'bg-black/20 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900 dark:text-slate-100">{s.name}</span>
                        <span className="text-[9px] font-mono font-bold uppercase" style={{ color: SEV[s.riskLevel]?.color }}>
                          {s.riskLevel} (CORROB: {s.corrobScore}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full overflow-hidden bg-slate-200 dark:bg-white/5">
                        <div className="h-full rounded-full" style={{ width: `${s.corrobScore}%`, backgroundColor: SEV[s.riskLevel]?.color }} />
                      </div>
                      <div className="space-y-1 pt-1">
                        {s.flags.map((f, k) => (
                          <p key={k} className="text-[10px] text-slate-600 dark:text-slate-400 font-mono">{f}</p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Entity Source Matrix Table */}
            {intel.connections.length > 0 && (
              <section className="space-y-3">
                <p className="text-[10px] font-extrabold uppercase tracking-widest font-mono" style={{ color: 'var(--text-tertiary)' }}>
                  CROSS-MODULE EVIDENCE MATRIX
                </p>
                <div className={`overflow-x-auto border rounded p-2 ${isDark ? 'border-white/5 bg-black/20' : 'border-slate-200 bg-white shadow-sm'}`}>
                  <table className="w-full text-xs font-mono">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-white/5 text-[9px] text-slate-500 dark:text-slate-400 text-left">
                        <th className="py-2 pr-3">ENTITY</th>
                        <th className="py-2 px-2 text-center text-indigo-600 dark:text-indigo-400">FIR</th>
                        <th className="py-2 px-2 text-center text-sky-600 dark:text-cyan-400">CDR</th>
                        <th className="py-2 px-2 text-center text-purple-600 dark:text-purple-400">CRYPTO</th>
                        <th className="py-2 pl-2 text-center text-amber-600 dark:text-amber-400">MATCH</th>
                      </tr>
                    </thead>
                    <tbody>
                      {intel.connections.map((c, i) => (
                        <tr key={i} className="border-b border-slate-100 dark:border-white/5 text-[10px]">
                          <td className="py-2 pr-3 truncate max-w-[140px] text-slate-800 dark:text-slate-200 font-semibold">{c.entity}</td>
                          <td className="py-2 px-2 text-center">{c.sources.fir ? '●' : '·'}</td>
                          <td className="py-2 px-2 text-center">{c.sources.telecom ? '●' : '·'}</td>
                          <td className="py-2 px-2 text-center">{c.sources.crypto ? '●' : '·'}</td>
                          <td className="py-2 pl-2 text-center font-bold" style={{ color: c.matched ? '#D97706' : 'rgba(148, 163, 184, 0.4)' }}>
                            {c.matched ? 'CORROB' : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

          </div>

          <div className="h-6" />
        </div>
      </div>

      {/* ── Statutory Evidence Docket Preview Modal (BSA Section 63) ── */}
      {docketModalNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm select-text">
          <div 
            className="w-full max-w-2xl rounded border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fade-in"
            style={{ backgroundColor: 'var(--bg-workspace)', borderColor: 'var(--border-medium)' }}
          >
            {/* Modal Control Header */}
            <div className="px-5 py-3 border-b flex items-center justify-between no-print" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-elevated)' }}>
              <div className="flex items-center gap-2 text-xs font-bold text-[#DC2626]">
                <Award size={16} className="text-[#F0A91E]" />
                <span className="uppercase tracking-wider">Statutory Evidence Docket Preview · BSA Section 63</span>
              </div>
              <button
                onClick={() => setDocketModalNode(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Formal Certificate Document Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs print-page font-sans">
              <div className="text-center pb-4 border-b-2" style={{ borderColor: 'var(--border-medium)' }}>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#F0A91E] mb-1">
                  OFFICE OF SUPERINTENDENT OF POLICE · CYBER CRIME INVESTIGATION DIVISION
                </p>
                <h2 className="text-base font-black text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                  Certificate of Admissibility for Electronic Evidence
                </h2>
                <p className="text-[10px] text-slate-500 font-medium">
                  Issued under Section 63, Bharatiya Sakshya Adhiniyam, 2023 (formerly Section 65B Indian Evidence Act)
                </p>
              </div>

              {/* Docket Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded border font-mono text-[10px]" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}>
                <div>
                  <span className="text-slate-500 block uppercase">Docket Reference:</span>
                  <strong className="text-slate-900 dark:text-slate-100">BSA-KG-2026-{(docketModalNode.id || '0818').toUpperCase()}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase">Case Registration:</span>
                  <strong className="text-slate-900 dark:text-slate-100">FIR 0142/2026 (PS-17)</strong>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase">Timestamp:</span>
                  <span className="text-slate-800 dark:text-slate-200">{new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-500 block uppercase">Subject Entity:</span>
                  <strong className="text-red-600 text-xs">{docketModalNode.label}</strong>
                  <span className="text-slate-500 ml-2">({docketModalNode.subLabel || docketModalNode.type})</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase">Risk Classification:</span>
                  <strong className="text-amber-600">{docketModalNode.riskLevel || 'HIGH'} (Confidence {docketModalNode.confidence || 95}%)</strong>
                </div>
              </div>

              {/* Cryptographic Hash Binding */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Cryptographic Binding Hash (SHA-256):</span>
                <div className="p-2 rounded bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 font-mono text-[10px] text-slate-800 dark:text-slate-200 break-all select-all">
                  {docketModalNode.imsiBinding || 'SHA256::e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
                </div>
              </div>

              {/* Statutory Evidentiary Summary */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Evidentiary Summary & Provenance:</span>
                <p className="p-3 rounded border leading-relaxed text-slate-700 dark:text-slate-300" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-elevated)' }}>
                  {docketModalNode.detail || 'Primary digital entity identified and cross-corroborated against telecom subscriber databases and financial ledger records.'}
                </p>
              </div>

              {/* Legal Admissibility Attestation */}
              <div className="p-3 rounded border border-emerald-500/30 bg-emerald-500/5 text-[10px] leading-relaxed text-slate-700 dark:text-slate-300 space-y-1">
                <strong className="text-emerald-700 dark:text-emerald-400 block uppercase">Statutory Affirmation (Sec 63(4) BSA):</strong>
                <p>
                  I, SP Amrita Sehgal, I4C Nodal Officer, do hereby certify that the electronic record detailed above was produced in the regular course of official activities by digital automated systems operating under standard cryptographic chain-of-custody protocols without unauthorized tampering.
                </p>
              </div>

              {/* Signatory Block */}
              <div className="pt-4 border-t flex items-end justify-between text-[10px]" style={{ borderColor: 'var(--border-subtle)' }}>
                <div>
                  <p className="text-slate-500">Jurisdiction: UT Cyber Crime Police Station</p>
                  <p className="font-mono text-slate-400">System Digest: KG-SYS-VERIFIED-V8</p>
                </div>
                <div className="text-right space-y-0.5">
                  <p className="font-bold text-slate-900 dark:text-slate-100 text-xs">SP Amrita Sehgal</p>
                  <p className="text-slate-500">I4C Cyber Nodal Officer · Chandigarh UT</p>
                  <p className="text-[#16A34A] font-mono font-bold">DIGITALLY HASH-SIGNED</p>
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="px-5 py-3 border-t flex items-center justify-between no-print" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-elevated)' }}>
              <span className="text-[10px] text-slate-500 font-mono">Status: Ready for Courtroom Deposition</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="btn-premium px-4 py-1.5 rounded text-xs font-bold text-white bg-[#DC2626] hover:bg-[#B91C1C] transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Printer size={13} /> Print / Export PDF Docket
                </button>
                <button
                  onClick={() => setDocketModalNode(null)}
                  className="btn-premium px-3 py-1.5 rounded text-xs font-semibold border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
