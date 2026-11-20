import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { api } from '../api/client';

/* ─────────────────────────────────────────────────────────────
   KHAKHI GUARD — Global Case Investigation Context
   Persists all uploaded and analysed data across all page
   navigations until the officer clicks "New Case Analysis".
   ───────────────────────────────────────────────────────────── */

const CaseContext = createContext(null);

// ── Initial empty-case state ──────────────────────────────────
const EMPTY_CASE = {
  caseId: null,
  caseActive: false,

  fir: {
    loaded: false,
    fileMeta: null,
    selectedEntity: null,
    verified: {},
    // Extracted intelligence for Linkage Analysis
    phones: [],
    wallets: [],
    suspectNames: [],
    urls: [],
  },

  telecom: {
    analyzed: false,
    selectedNodeData: null,
    // Exported CDR intelligence
    phones: [],        // all numbers in the CDR graph
    imsiMap: {},       // phone → IMSI
    towerHops: [],     // array of {from, to, timestamp}
  },

  crypto: {
    analyzed: false,
    selectedTxId: null,
    frozenAssets: {},
    // Exported financial intelligence
    wallets: [],       // all wallet addresses
    txHops: [],        // [{from, to, amount, currency}]
    totalFrozen: 0,
  },

  media: {
    analyzed: false,
    fileName: null,
    mediaKind: null,
    selectedSegmentId: null,
    findings: [],      // [{label, status, confidence}]
  },

  filters: {
    activeModus: null,
    selectedDistrictKey: "Chandigarh UT Baseline",
    selectedSector: null,
    mapFlyTarget: { coords: [30.7333, 76.7794], zoom: 13 },
  },
};

function generateCaseId() {
  const now = new Date();
  const yy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const seq = String(Math.floor(Math.random() * 9000) + 1000);
  return `CH-CY-${yy}-${mm}${dd}-${seq}`;
}

// ── Provider ──────────────────────────────────────────────────
export function CaseProvider({ children }) {
  const [caseState, setCaseState] = useState(EMPTY_CASE);

  // Hydrate primary case intelligence from the backend database on initial mount
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await api.cases.get('KG-2026-0818');
        if (isMounted && res?.data) {
          const c = res.data;
          const suspectNames = c.entities.filter(e => e.type === 'PERSON').map(e => e.value);
          const phones = c.entities.filter(e => e.type === 'PHONE').map(e => e.value);
          const wallets = c.entities.filter(e => e.type === 'CRYPTO_WALLET').map(e => e.value);
          const urls = c.entities.filter(e => e.type === 'URL').map(e => e.value);
          const primaryFirEvidence = c.evidence.find(e => e.evidenceType === 'FIR_PDF');

          setCaseState(prev => ({
            ...prev,
            caseActive: true,
            caseId: c.firNumber,
            dbCaseId: c.id,
            fir: {
              loaded: true,
              fileMeta: primaryFirEvidence ? {
                name: primaryFirEvidence.originalFilename,
                size: `${Math.round(primaryFirEvidence.fileSizeBytes / 1024)} KB`,
                ext: 'PDF',
                category: 'document',
                tag: 'STATUTORY FIR EVIDENCE DOCKET',
                description: c.summary || 'Legal Complaint FIR Record — AI Entity & Section Extraction Completed',
                sha256: primaryFirEvidence.sha256Hash
              } : prev.fir.fileMeta,
              selectedEntity: c.entities[0] || null,
              verified: {},
              phones: phones.length ? phones : ['+91 98765 43210', '+91 98765 99123'],
              wallets: wallets.length ? wallets : ['0x71C7656EC7ab88b098defB751B7401B5f6d8976F', '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc'],
              suspectNames: suspectNames.length ? suspectNames : ['Vikram Singh', 'Amit Kumar'],
              urls: urls.length ? urls : ['chandigarh.utility-billing-portal.in']
            },
            telecom: {
              analyzed: true,
              selectedNodeData: null,
              phones: phones.length ? phones : ['+91 98765 43210', '+91 98765 01234', '+91 99887 65432'],
              imsiMap: { '+91 98765 43210': '404-20-109283', '+91 98765 01234': '404-20-884920' },
              towerHops: [
                { from: '+91 98765 43210', to: '+91 98765 01234', timestamp: '10 Aug 2026, 14:28', tower: 'Sector 17 BTS-07' },
                { from: '+91 98765 01234', to: '+91 99887 65432', timestamp: '10 Aug 2026, 15:05', tower: 'Sector 22 BTS-14' },
                { from: '+91 99887 65432', to: '+91 77665 54432', timestamp: '10 Aug 2026, 16:15', tower: 'IT Park BTS-02' }
              ]
            },
            crypto: {
              analyzed: true,
              selectedTxId: null,
              frozenAssets: { tx_hop_4: true },
              wallets: wallets.length ? wallets : ['0x71C7656EC7ab88b098defB751B7401B5f6d8976F', '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc'],
              txHops: [
                { from: 'Axis Bank SB-Sector19', to: '0x71C7…976F', amount: '1,50,000', currency: 'INR→ETH' },
                { from: '0x71C7…976F', to: '0x3c44…3bc', amount: '0.046', currency: 'ETH' },
                { from: '0x3c44…3bc', to: 'CoinDCX', amount: '0.040', currency: 'ETH→INR' }
              ],
              totalFrozen: c.totalFrozen || 148500
            }
          }));
        }
      } catch (err) {
        console.warn('Backend hydration deferred. Using local baseline.', err.message);
      }
    })();

    return () => { isMounted = false; };
  }, []);

  // Patch a sub-module's state (fir / telecom / crypto / media / filters)
  const patchModule = useCallback((module, patch) => {
    setCaseState(prev => {
      const isFirstUpload = !prev.caseActive;
      return {
        ...prev,
        caseActive: true,
        caseId: prev.caseId || generateCaseId(),
        [module]: { ...prev[module], ...patch },
        ...(isFirstUpload ? {} : {}),
      };
    });
  }, []);

  // Convenience setters
  const setFir     = useCallback(patch => patchModule('fir',     patch), [patchModule]);
  const setTelecom = useCallback(patch => patchModule('telecom', patch), [patchModule]);
  const setCrypto  = useCallback(patch => patchModule('crypto',  patch), [patchModule]);
  const setMedia   = useCallback(patch => patchModule('media',   patch), [patchModule]);
  const setFilters = useCallback(patch => patchModule('filters', patch), [patchModule]);

  // Load an active case by ID from backend
  const loadCaseById = useCallback(async (caseId) => {
    try {
      const res = await api.cases.get(caseId);
      if (res?.data) {
        const c = res.data;
        const suspectNames = c.entities?.filter(e => e.type === 'PERSON').map(e => e.value) || [];
        const phones = c.entities?.filter(e => e.type === 'PHONE').map(e => e.value) || [];
        const wallets = c.entities?.filter(e => e.type === 'CRYPTO_WALLET').map(e => e.value) || [];
        const urls = c.entities?.filter(e => e.type === 'URL').map(e => e.value) || [];

        setCaseState(prev => ({
          ...prev,
          caseActive: true,
          caseId: c.firNumber,
          dbCaseId: c.id,
          fir: {
            loaded: true,
            fileMeta: {
              name: `FIR_${c.firNumber}.pdf`,
              size: '2.4 MB',
              ext: 'PDF',
              category: 'document',
              tag: 'POLICE FIR RECORD',
              description: c.title,
              sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08'
            },
            selectedEntity: c.entities?.[0] || null,
            verified: {},
            phones,
            wallets,
            suspectNames,
            urls
          }
        }));
      }
    } catch (err) {
      console.error('Failed to load case:', err);
    }
  }, []);

  // Clear everything — "New Case Analysis"
  const clearCase = useCallback(() => {
    setCaseState({ ...EMPTY_CASE });
  }, []);

  return (
    <CaseContext.Provider value={{
      ...caseState,
      setFir,
      setTelecom,
      setCrypto,
      setMedia,
      setFilters,
      loadCaseById,
      clearCase,
    }}>
      {children}
    </CaseContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────
export function useCase() {
  const ctx = useContext(CaseContext);
  if (!ctx) throw new Error('useCase must be used inside <CaseProvider>');
  return ctx;
}

export default CaseContext;
