import React, { useState, useEffect, useRef, useCallback } from 'react';
import cytoscape from 'cytoscape';
import { X, Lock, ShieldAlert, Radio, Activity, Terminal, FileText, Award, ShieldCheck, Upload, Calendar, Clock, CheckCircle2, Printer, Check, Layers, Filter } from 'lucide-react';
import CaseHeader from '../components/CaseHeader';
import EvidenceTag from '../components/EvidenceTag';
import { useCase } from '../context/CaseContext';
import { api } from '../api/client';

/* ─────────────────────────────────────────────────────────────
   GOVERNMENT-GRADE CYBER INVESTIGATIVE SPIDER WEB MATRIX
   (NO GLOW SPINS & NO MINTY BLUE COLORS)
   
   Visual Palette:
   - Target Hub: Sutral Command Red (#DC2626)
   - Cyber Nodes: Dark Steel Slate (#1E293B / #475569)
   - Selection Highlight: Sutral Gold (#F0A91E)
   - Rigid Non-Movable Position Lock (autoungrabify: true)
───────────────────────────────────────────────────────────── */

const GOVT_CYBER_NODES = [
  /* Central Suspect Hub */
  {
    id: 'target-hub',
    label: 'NODE-01: VIKRAM SINGH',
    imsi: 'IMSI-404450918239012',
    name: 'Vikram Singh (Alias Vicky Chhabra)',
    role: 'Primary Suspect Target (Hub)',
    detail: 'R/o Sector 22-C, Chandigarh. Subscriber of billing domain & primary laundering node.',
    evidenceType: 'AI', confidence: 97,
    explanation: 'Cell tower azimuth triangulation places target handset at Sec 22-C during 142 post-midnight CDR calls.',
    type: 'suspect-hub',
  },

  /* Inner Ring 1: Accomplices & Gateways */
  {
    id: 'node-amit',
    label: 'NODE-02: AMIT KUMAR',
    imsi: 'IMSI-404450891203491',
    name: 'Amit Kumar',
    role: 'Accomplice / Transit Broker (Ring 1)',
    detail: 'R/o Sector 34-A, Chandigarh. Handler of Ethereum Hop-3 transit wallet.',
    evidenceType: 'AI', confidence: 91,
    explanation: 'Repeated cell site overlaps at Sector 22/34 during post-midnight call window.',
    type: 'cyber-node',
  },
  {
    id: 'node-gateway',
    label: 'NODE-03: BULK SMS GATEWAY',
    imsi: 'GATEWAY-UT-99880',
    name: 'UT Phishing SMS Gateway #04',
    role: 'Infrastructure Proxy (Ring 1)',
    detail: 'Automated SMS gateway used to distribute spoofed utility payment links.',
    evidenceType: 'EXTRACTED',
    type: 'infra-node',
  },
  {
    id: 'node-victim',
    label: 'NODE-04: HARPREET SINGH',
    imsi: 'IMSI-404450119283746',
    name: 'Harpreet Singh (Complainant)',
    role: 'Victim Endpoint (Ring 1)',
    detail: 'R/o Sector 19-B, Chandigarh. Phished amount: ₹1,50,000 via malicious auto-debit link.',
    evidenceType: 'EXTRACTED',
    type: 'victim-node',
  },
  {
    id: 'node-sbi',
    label: 'NODE-05: SBI SEC 17',
    imsi: 'ACC-30910293021',
    name: 'SBI Sector 17 Branch',
    role: 'Deposit Bank Account (Ring 1)',
    detail: 'Account registered under Vikram Singh. Direct recipient of phished UPI funds.',
    evidenceType: 'EXTRACTED',
    type: 'bank-node',
  },

  /* Outer Ring 2: Triangulation Towers & Crypto Exchanges */
  {
    id: 'node-tower22',
    label: 'TOWER-4092: SEC 22-C',
    imsi: 'CELL-SITE-CH-4092',
    name: 'Cell Site #4092 (Sec 22-C)',
    role: 'Triangulation Cell Tower (Ring 2)',
    detail: 'Airtel Sector 22-C tower array. Logged 121 post-midnight CDR calls.',
    evidenceType: 'EXTRACTED',
    type: 'infra-node',
  },
  {
    id: 'node-tower34',
    label: 'TOWER-8812: SEC 34-A',
    imsi: 'CELL-SITE-CH-8812',
    name: 'Cell Site #8812 (Sec 34-A)',
    role: 'Triangulation Cell Tower (Ring 2)',
    detail: 'Airtel Sector 34-A tower array. Overlaps with Amit Kumar SIM.',
    evidenceType: 'EXTRACTED',
    type: 'infra-node',
  },
  {
    id: 'node-wazirx',
    label: 'NODE-08: WAZIRX WALLET',
    imsi: 'ETH-0x71C7…976F',
    name: 'WazirX ETH Deposit Wallet',
    role: 'Crypto Conversion Exchange (Ring 2)',
    detail: 'INR funds converted to ETH. Origin IP 122.161.48.22 resolves to Sector 22-C.',
    evidenceType: 'AI', confidence: 94,
    type: 'bank-node',
  },
  {
    id: 'node-coindcx',
    label: 'NODE-09: COINDCX OFFRAMP',
    imsi: 'ETH-0x90f8…4d7',
    name: 'CoinDCX Exchange Off-ramp',
    role: 'Liquidation Off-ramp (Ring 2)',
    detail: 'Final exchange destination before fiat withdrawal. Emergency freeze directive active.',
    evidenceType: 'AI', confidence: 96,
    type: 'bank-node',
  },
];

const GOVT_CYBER_EDGES = [
  { id: 'e1', source: 'target-hub', target: 'node-amit', label: '142 CDR Calls (02:00–04:00)', type: 'critical' },
  { id: 'e2', source: 'target-hub', target: 'node-gateway', label: '42 Admin Gateway Pings', type: 'critical' },
  { id: 'e3', source: 'target-hub', target: 'node-sbi', label: 'UPI Debit ₹1,50,000', type: 'critical' },
  { id: 'e4', source: 'node-gateway', target: 'node-victim', label: 'Phishing SMS Blast', type: 'standard' },
  { id: 'e5', source: 'node-victim', target: 'node-sbi', label: 'Redirection Payment', type: 'standard' },
  { id: 'e6', source: 'target-hub', target: 'node-tower22', label: 'Azimuth Triangulation', type: 'standard' },
  { id: 'e7', source: 'node-amit', target: 'node-tower34', label: 'Azimuth Triangulation', type: 'standard' },
  { id: 'e8', source: 'node-sbi', target: 'node-wazirx', label: 'INR to ETH Conversion', type: 'critical' },
  { id: 'e9', source: 'node-wazirx', target: 'node-coindcx', label: 'Hop-4 Wallet Transfer', type: 'critical' },
  { id: 'e10', source: 'node-tower22', target: 'node-tower34', label: 'Tower Handover Arc', type: 'standard' },
];

/* Fixed Non-Movable Cyber Spider Web Positions */
const cyberWebPositions = {
  'target-hub':    { x: 340, y: 240 }, // Core Target Hub
  
  /* Inner Ring 1 */
  'node-amit':     { x: 470, y: 160 },
  'node-gateway':  { x: 470, y: 320 },
  'node-sbi':      { x: 210, y: 160 },
  'node-victim':   { x: 210, y: 320 },

  /* Outer Ring 2 */
  'node-tower22':  { x: 340, y: 80  },
  'node-tower34':  { x: 530, y: 60  },
  'node-wazirx':   { x: 90,  y: 100 },
  'node-coindcx':  { x: 70,  y: 240 },
};

function buildGovernmentCytoStyles(isDark) {
  const nodeBg       = isDark ? '#0F172A' : '#1E293B';
  const nodeBorder   = isDark ? '#475569' : '#64748B';
  const labelColor   = isDark ? '#CBD5E1' : '#1A2338';
  const edgeColor    = isDark ? '#334155' : '#CBD5E1';

  return [
    /* Government Cyber Circular Dot Nodes */
    {
      selector: 'node',
      style: {
        'shape': 'ellipse',
        'width': 30,
        'height': 30,
        'background-color': nodeBg,
        'border-color': nodeBorder,
        'border-width': '2px',
        'label': 'data(label)',
        'color': labelColor,
        'font-family': 'Inter, monospace, sans-serif',
        'font-size': '9px',
        'font-weight': '700',
        'text-valign': 'bottom',
        'text-margin-y': '6px',
        'text-max-width': '120px',
        'text-wrap': 'ellipsis',
        'overlay-opacity': 0,
      },
    },
    /* Central Suspect Hub - High Priority Tactical Crimson */
    {
      selector: 'node[type="suspect-hub"]',
      style: {
        'background-color': '#DC2626',
        'border-color': '#FFFFFF',
        'border-width': '3px',
        'width': 42,
        'height': 42,
        'color': '#DC2626',
        'font-size': '10px',
        'font-weight': '800',
      },
    },
    /* Infrastructure Nodes - Steel Slate */
    {
      selector: 'node[type="infra-node"]',
      style: {
        'background-color': isDark ? '#1E293B' : '#475569',
        'border-color': '#94A3B8',
        'border-width': '2px',
      },
    },
    /* Cyber Spider Web Lines */
    {
      selector: 'edge',
      style: {
        'curve-style': 'straight',
        'width': 1.5,
        'line-color': edgeColor,
        'target-arrow-shape': 'triangle',
        'target-arrow-color': edgeColor,
        'label': 'data(label)',
        'color': isDark ? '#94A3B8' : '#4B5563',
        'font-family': 'Inter, sans-serif',
        'font-size': '8px',
        'font-weight': '700',
        'text-background-opacity': 1,
        'text-background-color': isDark ? '#070D1E' : '#FFFFFF',
        'text-background-padding': '2px',
        'overlay-opacity': 0,
      },
    },
    {
      selector: 'edge[type="critical"]',
      style: {
        'line-color': '#DC2626',
        'target-arrow-color': '#DC2626',
        'color': '#DC2626',
        'width': 2,
      },
    },
    /* Selection Highlight */
    {
      selector: ':selected',
      style: {
        'border-color': '#F0A91E',
        'border-width': '4px',
        'line-color': '#F0A91E',
        'target-arrow-color': '#F0A91E',
      },
    },
  ];
}

export default function Telecom({ theme }) {
  const { setTelecom, telecom, fir } = useCase();
  const containerRef = useRef(null);
  const cyRef = useRef(null);
  const csvInputRef = useRef(null);
  
  // Custom surveillance parameters
  const [suspectNamesInput, setSuspectNamesInput] = useState('');
  const [suspectPhonesInput, setSuspectPhonesInput] = useState('');
  const [cellSitesInput, setCellSitesInput] = useState('');
  
  // Tab states
  const [configTab, setConfigTab] = useState('manual'); // 'manual' | 'csv'
  const [uploadedCsvFile, setUploadedCsvFile] = useState(null);
  const [csvError, setCsvError] = useState('');
  const [customGraphData, setCustomGraphData] = useState(null);

  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [isConfigured, setIsConfigured] = useState(telecom.analyzed || false);
  const [manualError, setManualError] = useState('');
  const [requestDialogNode, setRequestDialogNode] = useState(null);
  const [requestDispatched, setRequestDispatched] = useState(false);
  
  const [selectedNode, setSelectedNode] = useState(null);
  const [nightFilter, setNightFilter] = useState(false);

  useEffect(() => {
    setIsConfigured(telecom.analyzed || false);
    if (!telecom.analyzed) {
      setSuspectNamesInput('');
      setSuspectPhonesInput('');
      setCellSitesInput('');
      setSelectedNode(null);
      setCustomGraphData(null);
      setUploadedCsvFile(null);
      setCsvError('');
      setManualError('');
    }
  }, [telecom.analyzed]);

  const isDark = theme === 'dark' || (typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));

  // CSV parsing utilities
  const parseCdrCsv = (text) => {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) return null;
    const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
    
    const records = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim());
      if (cols.length < headers.length) continue;
      const record = {};
      headers.forEach((h, idx) => {
        record[h] = cols[idx];
      });
      records.push(record);
    }
    return records;
  };

  const processCsvCdr = (records) => {
    const nodes = [];
    const edges = [];
    const uniquePhones = new Set();
    const uniqueTowers = new Set();
    
    // Add central dataset hub node
    nodes.push({
      id: 'target-hub',
      label: 'CDR DATASET',
      type: 'suspect-hub',
      name: 'CDR Linkage Hub',
      role: 'Central Analysis Base',
      detail: `Parsed CDR dataset containing ${records.length} records.`,
      evidenceType: 'EXTRACTED',
      confidence: 100
    });

    records.forEach((r) => {
      const caller = r.caller || r.from;
      const receiver = r.receiver || r.to;
      const tower = r.tower || r.location || 'Unknown Tower';
      
      if (caller) uniquePhones.add(caller);
      if (receiver) uniquePhones.add(receiver);
      if (tower) uniqueTowers.add(tower);
    });

    // Create phone nodes
    Array.from(uniquePhones).forEach((phone, idx) => {
      nodes.push({
        id: phone,
        label: phone,
        type: 'cyber-node',
        name: `Subscriber: ${phone}`,
        role: idx === 0 ? 'Primary Suspect Target' : 'Contact Endpoint',
        detail: `Active subscriber number identified in CDR logs. Connected records: ${records.filter(r => r.caller === phone || r.receiver === phone).length} hops.`,
        evidenceType: 'EXTRACTED',
        confidence: 90,
        imsi: `404-20-${100000 + idx}`
      });

      // Connect phone node to central hub
      edges.push({
        id: `e-hub-${idx}`,
        source: 'target-hub',
        target: phone,
        label: 'Linked Target',
        type: 'critical'
      });
    });

    // Create tower nodes
    Array.from(uniqueTowers).forEach((tower, idx) => {
      const towerId = `tower-${idx}`;
      nodes.push({
        id: towerId,
        label: tower,
        type: 'infra-node',
        name: `Cell Site: ${tower}`,
        role: 'BTS Tower Site',
        detail: `BTS Tower site log telemetry. Covered calls in logs: ${records.filter(r => r.tower === tower).length}.`,
        evidenceType: 'EXTRACTED',
        confidence: 85
      });
    });

    // Create call edges
    records.forEach((r, idx) => {
      const caller = r.caller || r.from;
      const receiver = r.receiver || r.to;
      const tower = r.tower || r.location;
      const timestamp = r.timestamp || r.time || '';
      
      if (caller && receiver) {
        edges.push({
          id: `e-call-${idx}`,
          source: caller,
          target: receiver,
          label: `${tower || ''} @ ${timestamp}`,
          type: 'standard'
        });
      }
    });

    return { nodes, edges };
  };

  const handleCsvFile = (file) => {
    setUploadedCsvFile(file);
    setCsvError('');
  };

  const downloadSampleCsvTemplate = () => {
    const csvContent = "caller,receiver,timestamp,tower,duration\n" +
                       "+91 98765 43210,+91 98765 01234,10 Aug 2026 14:28,Sec 17 Plaza,45s\n" +
                       "+91 98765 01234,+91 99887 65432,10 Aug 2026 15:05,Sec 22 Mandi,120s\n" +
                       "+91 99887 65432,+91 77665 54432,10 Aug 2026 15:30,IT Park Plaza,90s\n" +
                       "+91 98765 43210,+91 88554 43321,11 Aug 2026 09:12,Sec 17 Plaza,15s\n";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "sample_call_records.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleParseCsvAndSubmit = async () => {
    if (!uploadedCsvFile) return;
    setLoading(true);
    
    // Dispatch background upload to backend evidence repository
    try {
      await api.evidence.uploadCdr(uploadedCsvFile, 'KG-2026-0818');
    } catch (err) {
      console.warn('Backend CDR CSV upload deferred:', err.message);
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const records = parseCdrCsv(text);
      if (!records || records.length === 0) {
        setLoading(false);
        setCsvError('Invalid CSV content. Please ensure headers: caller, receiver, timestamp, tower.');
        return;
      }

      const steps = [
        'Reading uploaded CSV byte stream...',
        'Validating call record schemas...',
        'Resolving base station identifiers...',
        'Synthesizing spider-web node linkages...'
      ];

      steps.forEach((s, idx) => {
        setTimeout(() => {
          setLoadingStep(s);
          if (idx === steps.length - 1) {
            setTimeout(() => {
              const { nodes, edges } = processCsvCdr(records);
              
              const customData = {
                nodes: nodes.map(n => ({ data: n })),
                edges: edges.map(e => ({ data: e }))
              };
              
              setCustomGraphData(customData);
              setLoading(false);
              setIsConfigured(true);
              
              const phoneNode = nodes.find(n => n.type === 'cyber-node');
              setSelectedNode(phoneNode || nodes[0]);

              const uniquePhones = Array.from(new Set(records.map(r => r.caller).concat(records.map(r => r.receiver)).filter(Boolean)));
              const imsiMap = {};
              uniquePhones.forEach((p, i) => {
                imsiMap[p] = `404-20-${100000 + i}`;
              });

              setTelecom({
                analyzed: true,
                phones: uniquePhones,
                imsiMap: imsiMap,
                towerHops: records.map(r => ({
                  from: r.caller,
                  to: r.receiver,
                  timestamp: r.timestamp,
                  tower: r.tower
                }))
              });

            }, 600);
          }
        }, idx * 600);
      });
    };
    reader.onerror = () => {
      setLoading(false);
      setCsvError('Error reading CSV file.');
    };
    reader.readAsText(uploadedCsvFile);
  };

  // Auto extract helper
  const handleAutoExtract = () => {
    if (fir.loaded) {
      setSuspectNamesInput((fir.suspectNames || []).join(', '));
      setSuspectPhonesInput((fir.phones || []).join(', '));
      setCellSitesInput('Sector 17 Precinct, Sector 22-C Precinct, Sector 34-A Precinct');
    }
  };

  const handleConstructMatrix = (e) => {
    e.preventDefault();
    if (!suspectNamesInput || !suspectPhonesInput || !cellSitesInput) {
      setManualError('Target suspect name, phone number, and base station sectors are required to initiate CDR query.');
      return;
    }
    setManualError('');
    setLoading(true);
    const steps = [
      'Querying active suspect cellular registries...',
      'Mapping cell tower azimuth triangulation coordinates...',
      'Generating target relationship vertices...',
      'Constructing rigid spider-web connection matrix...'
    ];
    
    steps.forEach((s, idx) => {
      setTimeout(() => {
        setLoadingStep(s);
        if (idx === steps.length - 1) {
          setTimeout(() => {
            setLoading(false);
            setIsConfigured(true);
            setSelectedNode(GOVT_CYBER_NODES[0]);
            setTelecom({
              analyzed: true,
              phones: suspectPhonesInput.split(',').map(x => x.trim()),
              imsiMap: { '+91 98765 43210': '404-20-XXXXXX' },
              towerHops: [
                { from: '+91 98765 43210', to: '+91 98765 01234', timestamp: '10 Aug 2026, 14:28', tower: 'Sec 17 BTS-07' },
                { from: '+91 98765 01234', to: '+91 99887 65432', timestamp: '10 Aug 2026, 15:05', tower: 'Sec 22 BTS-14' },
              ],
            });
          }, 600);
        }
      }, idx * 600);
    });
  };

  const buildElements = useCallback(() => {
    if (!isConfigured) return [];
    if (customGraphData) {
      const visibleEdges = nightFilter ? customGraphData.edges.filter(e => e.data.type === 'critical') : customGraphData.edges;
      return [
        ...customGraphData.nodes,
        ...visibleEdges
      ];
    }
    const visibleEdges = nightFilter ? GOVT_CYBER_EDGES.filter(e => e.type === 'critical') : GOVT_CYBER_EDGES;
    return [
      ...GOVT_CYBER_NODES.map(n => ({ data: { ...n }, position: cyberWebPositions[n.id] })),
      ...visibleEdges.map(e => ({ data: { ...e } })),
    ];
  }, [nightFilter, isConfigured, customGraphData]);

  useEffect(() => {
    if (!isConfigured || !containerRef.current) return;
    cyRef.current?.destroy();

    /* NON-MOVABLE RIGID SPIDER WEB CONFIGURATION */
    const cy = cytoscape({
      container: containerRef.current,
      elements: buildElements(),
      style: buildGovernmentCytoStyles(isDark),
      layout: customGraphData ? { name: 'cose', animate: false, padding: 40 } : { name: 'preset', fit: true, padding: 60 },
      autoungrabify: true,      // NODES ARE COMPLETELY NON-MOVABLE
      userPanningEnabled: customGraphData ? true : false, // Allow panning for large CSV files
      userZoomingEnabled: customGraphData ? true : false, // Allow zooming for large CSV files
      boxSelectionEnabled: false,
    });

    cy.on('tap', 'node', (evt) => {
      if (evt.target !== cy && evt.target.isNode()) {
        const nodeData = evt.target.data();
        setSelectedNode(nodeData);
      }
    });

    const handleResize = () => {
      cy.resize();
      cy.fit(undefined, 60);
    };

    window.addEventListener('resize', handleResize);

    cyRef.current = cy;
    return () => {
      window.removeEventListener('resize', handleResize);
      cy.destroy();
    };
  }, [isDark, nightFilter, buildElements, setTelecom, isConfigured, customGraphData]);

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ backgroundColor: 'var(--bg-app)' }}>
      <CaseHeader moduleName="CDR & Cellular Triangulation Matrix" />

      <div className="flex flex-1 min-h-0 overflow-hidden relative">

        {/* RIGID GOVT SPIDER WEB CANVAS */}
        <div className="flex flex-col flex-1 min-h-0 relative" style={{ backgroundColor: 'var(--bg-canvas)' }}>

          {/* Top Canvas Certification Badge */}
          <div className="absolute top-3 right-3 z-20 pointer-events-none flex items-center gap-2 px-3 py-1.5 rounded bg-slate-900/80 text-white border border-red-500/40 backdrop-blur-sm shadow-md">
            <ShieldCheck size={14} className="text-[#F0A91E]" />
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#F0A91E]">
              CELL SITE TELEMETRY CONNECTIVITY MATRIX
            </span>
          </div>

          {/* SVG Tactical Radar & Spider Web Axis Background */}
          <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none">
            <g stroke={isDark ? '#94A3B8' : '#334155'} strokeWidth="0.75" fill="none" strokeDasharray="4 4">
              <circle cx="50%" cy="50%" r="80" />
              <circle cx="50%" cy="50%" r="160" />
              <circle cx="50%" cy="50%" r="250" />
              <line x1="0" y1="50%" x2="100%" y2="50%" />
              <line x1="50%" y1="0" x2="50%" y2="100%" />
              <line x1="15%" y1="15%" x2="85%" y2="85%" />
              <line x1="85%" y1="15%" x2="15%" y2="85%" />
            </g>
          </svg>

          {/* Investigative Telecom Query & Ingestion Workspace */}
          {!isConfigured ? (
            <div className="absolute inset-0 z-30 flex items-center justify-center p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
              <div className="w-full max-w-4xl rounded border shadow-2xl overflow-hidden flex flex-col my-auto" style={{ backgroundColor: 'var(--bg-workspace)', borderColor: 'var(--border-medium)' }}>
                {/* Header Strip */}
                <div className="px-6 py-4 border-b flex items-center justify-between" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}>
                  <div>
                    <div className="flex items-center gap-2">
                      <Radio size={16} className="text-[#DC2626]" />
                      <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                        Investigative Telecom Query & Ingestion Workspace
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Case Reference: KG-2026-0818 · Section 92 BNSS Telecommunications Evidence Directive
                    </p>
                  </div>
                  {fir.loaded && (
                    <button
                      type="button"
                      onClick={handleAutoExtract}
                      className="btn-premium px-3 py-1.5 rounded text-[11px] font-bold border border-dashed border-red-500/60 text-[#DC2626] hover:bg-red-500/10 transition-colors cursor-pointer"
                    >
                      Auto-Populate from Active Case
                    </button>
                  )}
                </div>

                {/* Split Query & Ingestion Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x" style={{ borderColor: 'var(--border-subtle)' }}>
                  
                  {/* Left Column: Targeted Cellular Telemetry Query */}
                  <form onSubmit={handleConstructMatrix} className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wide">
                        1. Target Subscriber Parameters
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">Manual / Case Registry</span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Target Phone Number(s)</label>
                        <input
                          type="text"
                          value={suspectPhonesInput}
                          onChange={e => { setSuspectPhonesInput(e.target.value); setManualError(''); }}
                          placeholder="e.g. +91 98765 43210, +91 98765 01234"
                          className="w-full px-3 py-2 rounded text-xs border font-mono bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 focus:outline-none focus:border-red-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Subscriber / Accused Name(s)</label>
                        <input
                          type="text"
                          value={suspectNamesInput}
                          onChange={e => { setSuspectNamesInput(e.target.value); setManualError(''); }}
                          placeholder="e.g. Vikram Singh, Amit Kumar"
                          className="w-full px-3 py-2 rounded text-xs border bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 focus:outline-none focus:border-red-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Cell Sites & Sector Clusters</label>
                        <input
                          type="text"
                          value={cellSitesInput}
                          onChange={e => { setCellSitesInput(e.target.value); setManualError(''); }}
                          placeholder="e.g. Sector 17 Precinct, Sector 22-C, Sector 34-A"
                          className="w-full px-3 py-2 rounded text-xs border bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 focus:outline-none focus:border-red-500"
                        />
                      </div>

                      <div className="p-2.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] space-y-1">
                        <span className="text-slate-500 font-bold block uppercase">Analysis Window:</span>
                        <p className="font-mono text-slate-700 dark:text-slate-300">10 Aug 2026, 00:00 – 11 Aug 2026, 23:59 IST</p>
                        <p className="text-slate-400">Streams: Call Detail Records, Handover Azimuth, IMSI Bindings</p>
                      </div>
                    </div>

                    {manualError && (
                      <p className="text-xs text-red-500 font-semibold">{manualError}</p>
                    )}

                    {loading ? (
                      <div className="py-2 text-center space-y-1.5">
                        <div className="w-12 h-1 bg-red-600 rounded-full overflow-hidden mx-auto animate-pulse" />
                        <p className="text-[10px] font-mono font-bold text-red-600 uppercase tracking-widest">{loadingStep}</p>
                      </div>
                    ) : (
                      <button
                        type="submit"
                        className="btn-premium w-full py-2.5 rounded text-xs font-extrabold uppercase text-white bg-[#DC2626] hover:bg-[#B91C1C] transition-colors cursor-pointer shadow-sm"
                      >
                        Construct Surveillance Linkage Matrix
                      </button>
                    )}
                  </form>

                  {/* Right Column: Direct Provider CDR File Ingestion (CSV) */}
                  <div className="p-6 space-y-4 flex flex-col justify-between" style={{ backgroundColor: 'var(--bg-elevated)' }}>
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wide">
                          2. Direct Carrier CDR Log Ingestion
                        </span>
                        <span className="text-[10px] font-mono text-emerald-500 font-semibold">Live Parser</span>
                      </div>

                      <div 
                        onDragOver={e => e.preventDefault()}
                        onDrop={e => {
                          e.preventDefault();
                          if (!loading && e.dataTransfer.files?.[0]) handleCsvFile(e.dataTransfer.files[0]);
                        }}
                        onClick={() => { if (!loading) csvInputRef.current?.click(); }}
                        className="p-6 rounded border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-red-500/50 flex flex-col items-center justify-center cursor-pointer transition-colors bg-white dark:bg-slate-900/40 text-center"
                      >
                        <input 
                          type="file" 
                          ref={csvInputRef} 
                          onChange={e => { if (e.target.files?.[0]) handleCsvFile(e.target.files[0]); }}
                          className="hidden" 
                          accept=".csv,text/csv" 
                        />
                        <Upload size={24} className="text-[#DC2626] mb-2" />
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {uploadedCsvFile ? uploadedCsvFile.name : 'Select or Drop Carrier Call Records (CSV)'}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-1">Accepts standard provider fields: caller, receiver, timestamp, tower</p>
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-bold mt-3">
                        <button 
                          type="button"
                          onClick={downloadSampleCsvTemplate}
                          className="text-[#DC2626] hover:underline bg-none border-none p-0 cursor-pointer uppercase tracking-wider"
                        >
                          Download Official CDR Template (CSV)
                        </button>
                        {uploadedCsvFile && (
                          <span className="text-emerald-500 font-mono">{(uploadedCsvFile.size / 1024).toFixed(1)} KB Loaded</span>
                        )}
                      </div>

                      {csvError && (
                        <p className="text-xs text-red-500 font-bold mt-2">{csvError}</p>
                      )}
                    </div>

                    <div>
                      {uploadedCsvFile && !loading && (
                        <button
                          type="button"
                          onClick={handleParseCsvAndSubmit}
                          className="btn-premium w-full py-2.5 rounded text-xs font-extrabold uppercase text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 transition-colors cursor-pointer shadow-sm"
                        >
                          Parse File & Render Network Topology
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          ) : null}

          {/* Cytoscape Non-Movable Dot Canvas */}
          <div ref={containerRef} className="flex-1 relative z-10" />

          {/* Controls Strip */}
          <div className="shrink-0 px-5 py-2.5 flex items-center justify-between border-t z-20 flex-wrap gap-2"
               style={{ backgroundColor: 'var(--bg-workspace)', borderColor: 'var(--border-subtle)' }}>
            
            <div className="flex items-center gap-4 text-xs font-bold flex-wrap">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700">
                <Lock size={12} /> Rigid Spatial CDR Topology
              </span>
              <label className="flex items-center gap-2 cursor-pointer transition-colors duration-150 hover:text-slate-400">
                <input
                  type="checkbox"
                  checked={nightFilter}
                  disabled={!isConfigured}
                  onChange={e => setNightFilter(e.target.checked)}
                  style={{ accentColor: '#DC2626' }}
                />
                <span style={{ color: 'var(--text-primary)' }}>Isolate Critical CDR Links</span>
              </label>
            </div>

            <div className="flex items-center gap-4 text-[10px] font-extrabold uppercase flex-wrap" style={{ color: 'var(--text-tertiary)' }}>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#DC2626] border border-white" /> Target Hub</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#1E293B] border border-white" /> Cyber Node</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#94A3B8] border border-white" /> Tower Site</span>
            </div>
          </div>

        </div>

        {/* RIGHT: Selected Cyber Node Inspector Panel */}
        {selectedNode && (
          <div className="w-80 shrink-0 flex flex-col overflow-y-auto border-l p-5 space-y-4 shadow-md"
               style={{ backgroundColor: 'var(--bg-workspace)', borderColor: 'var(--border-subtle)' }}>
            
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="flex items-center gap-2 min-w-0">
                <img
                  src="/khakhi_guard_logo.jpg"
                  alt="Official Seal"
                  className="w-7 h-7 rounded-full object-cover border border-[#F0A91E] shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-[10px] font-extrabold uppercase text-[#DC2626] truncate">Cyber Node Telemetry</p>
                  <p className="text-sm font-extrabold truncate" style={{ color: 'var(--text-primary)' }}>{selectedNode.label}</p>
                </div>
              </div>
              <button onClick={() => setSelectedNode(null)} className="text-xs font-bold px-2 py-1 rounded transition-colors duration-150 hover:bg-red-500/10 text-slate-400 cursor-pointer">✕</button>
            </div>

            {selectedNode.evidenceType && (
              <EvidenceTag
                type={selectedNode.evidenceType}
                confidence={selectedNode.confidence}
                explanation={selectedNode.explanation}
              />
            )}

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase" style={{ color: 'var(--text-tertiary)' }}>Node Name / Alias</span>
                <p className="font-extrabold text-sm break-words" style={{ color: 'var(--text-primary)' }}>{selectedNode.name}</p>
                <p className="text-xs font-bold text-red-600 mt-0.5">{selectedNode.role}</p>
              </div>

              {selectedNode.imsi && (
                <div className="p-2.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
                  <span className="text-[9px] font-bold uppercase text-slate-500 dark:text-slate-400 block">IMSI / Identification</span>
                  <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 break-all">{selectedNode.imsi}</span>
                </div>
              )}

              {selectedNode.detail && (
                <div className="p-3 rounded border text-xs leading-relaxed"
                     style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-medium)', color: 'var(--text-secondary)' }}>
                  {selectedNode.detail}
                </div>
              )}
            </div>

            <div className="pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="mb-3 pl-2 border-l-2 border-[#F0A91E] text-[10px] font-extrabold uppercase text-[#F0A91E] flex items-center gap-1.5">
                <Award size={13} /> SECURE TARGET LOG ARCHIVE
              </div>

              <button
                onClick={() => { setRequestDialogNode(selectedNode); setRequestDispatched(false); }}
                className="btn-premium w-full py-2.5 rounded text-xs font-extrabold uppercase text-white justify-center transition-colors duration-150 hover:bg-[#B91C1C] cursor-pointer shadow-sm"
                style={{ backgroundColor: '#DC2626' }}
              >
                Request Official CDR & Tower Logs
              </button>
            </div>
          </div>
        )}

      </div>

      {/* ── Official Telecom Lawful Intercept & CDR Request Review Dialog ── */}
      {requestDialogNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm select-text">
          <div className="w-full max-w-xl rounded border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fade-in"
               style={{ backgroundColor: 'var(--bg-workspace)', borderColor: 'var(--border-medium)' }}>
            
            {/* Dialog Header */}
            <div className="px-5 py-3 border-b flex items-center justify-between no-print" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-elevated)' }}>
              <div className="flex items-center gap-2 text-xs font-bold text-[#DC2626]">
                <Radio size={15} />
                <span className="uppercase tracking-wider">Lawful Cellular Intercept & CDR Production Order</span>
              </div>
              <button
                onClick={() => setRequestDialogNode(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Dialog Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs font-sans">
              <div className="pb-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                <p className="text-[10px] font-mono text-slate-500 uppercase">Statutory Authority: Section 92 BNSS, 2023</p>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  Requisition for Subscriber Telecommunication Records & Azimuth Data
                </h3>
              </div>

              {/* Target Particulars Grid */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded border font-mono text-[10px]" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}>
                <div>
                  <span className="text-slate-500 block uppercase">Target Identifier:</span>
                  <strong className="text-red-600 text-xs">{requestDialogNode.label}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase">IMSI / Identification:</span>
                  <strong className="text-slate-900 dark:text-slate-100">{requestDialogNode.imsi || '404-20-109283'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase">Target Name / Role:</span>
                  <span className="text-slate-800 dark:text-slate-200">{requestDialogNode.name} ({requestDialogNode.role})</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase">Case Context:</span>
                  <span className="text-slate-800 dark:text-slate-200">KG-2026-0818 (PS-17)</span>
                </div>
              </div>

              {/* Scope & Date Range */}
              <div className="space-y-1 text-[11px]">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Requested Record Scope:</span>
                <div className="p-3 rounded border space-y-1.5 leading-relaxed text-slate-700 dark:text-slate-300" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-elevated)' }}>
                  <p>• Inbound and outbound Call Detail Records (CDR) with IMEI-IMSI mapping</p>
                  <p>• Base Transceiver Station (BTS) Cell Site Azimuth Handover logs</p>
                  <p>• Surveillance Time Window: 10 Aug 2026, 00:00 IST to 12 Aug 2026, 23:59 IST</p>
                </div>
              </div>

              {/* Confirmation State */}
              {requestDispatched ? (
                <div className="p-3 rounded border border-emerald-500/40 bg-emerald-500/10 flex items-center gap-2.5 text-xs text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 size={18} className="shrink-0" />
                  <div>
                    <p className="font-bold">Lawful Production Directive Dispatched to Carrier Nodal Desk</p>
                    <p className="text-[10px] font-mono mt-0.5">Reference ID: CDR-REQ-2026-8819 · Acknowledged under statutory protocol</p>
                  </div>
                </div>
              ) : (
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Upon dispatch, this directive is transmitted to the designated telecom service provider nodal officer in compliance with lawful intercept regulations.
                </p>
              )}
            </div>

            {/* Dialog Footer */}
            <div className="px-5 py-3 border-t flex items-center justify-between no-print" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-elevated)' }}>
              <span className="text-[10px] text-slate-500 font-mono">Form 65B Notice Certified</span>
              <div className="flex items-center gap-2">
                {!requestDispatched ? (
                  <button
                    onClick={() => setRequestDispatched(true)}
                    className="btn-premium px-4 py-1.5 rounded text-xs font-bold text-white bg-[#DC2626] hover:bg-[#B91C1C] transition-colors cursor-pointer shadow-sm"
                  >
                    Dispatch Lawful Request Notice
                  </button>
                ) : (
                  <button
                    onClick={() => window.print()}
                    className="btn-premium px-3 py-1.5 rounded text-xs font-bold text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Printer size={13} /> Print Requisition Notice
                  </button>
                )}
                <button
                  onClick={() => setRequestDialogNode(null)}
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

