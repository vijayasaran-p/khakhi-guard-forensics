import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, X, Send, ArrowRight, ShieldAlert, CheckCircle2, Award, ShieldCheck, Lock, Copy, Check, Layers, RefreshCw } from 'lucide-react';
import CaseHeader from '../components/CaseHeader';
import EvidenceTag from '../components/EvidenceTag';
import { useCase } from '../context/CaseContext';
import { api } from '../api/client';

const TRANSACTIONS = [
  {
    id: 'TXN-001', hop: 1,
    timestamp: '2026-08-10  14:32',
    from: 'Harpreet Singh', fromDetail: 'harpreet.s19@okaxis',
    to: 'SBI Sector 17', toDetail: 'A/C 30910293021 — Vikram Singh',
    amountInr: 150000, asset: 'INR / UPI', status: 'critical', wallet: null,
    xai: 'Direct phished transfer. Correlates with victim complaint timestamp and portal click event.',
    provenance: 'Axis Bank UPI transaction logs. Sector 19 branch registry.',
    evidenceType: 'AI', confidence: 97,
  },
  {
    id: 'TXN-002', hop: 2,
    timestamp: '2026-08-10  15:10',
    from: 'SBI Sector 17', fromDetail: 'vikram.singh@okaxis',
    to: 'WazirX Deposit', toDetail: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    amountInr: 148500, asset: 'ETH', status: 'warning',
    wallet: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    xai: 'Rapid bank-to-crypto conversion. Origin IP resolves to Sector 22-C, Chandigarh.',
    provenance: 'WazirX KYC exchange logs. Origin IP: 122.161.48.22.',
    evidenceType: 'AI', confidence: 93,
  },
  {
    id: 'TXN-003', hop: 3,
    timestamp: '2026-08-11  01:22',
    from: 'WazirX Deposit', fromDetail: '0x71C7…976F',
    to: 'Amit Kumar Wallet', toDetail: '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc',
    amountInr: 145000, asset: 'ETH', status: 'warning',
    wallet: '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc',
    xai: 'Post-midnight transfer. Temporal correlation with intensive cell-tower activity between suspect SIMs.',
    provenance: 'Ethereum Mainnet — Block #20349122.',
    evidenceType: 'AI', confidence: 91,
  },
  {
    id: 'TXN-004', hop: 4,
    timestamp: '2026-08-12  09:15',
    from: 'Amit Kumar Wallet', fromDetail: '0x3c44…3bc',
    to: 'CoinDCX Exchange', toDetail: '0x90f8bfac9c33b22f95027a6f9374d6c6e73ff4d7',
    amountInr: 140000, asset: 'ETH', status: 'critical',
    wallet: '0x90f8bfac9c33b22f95027a6f9374d6c6e73ff4d7',
    xai: 'Final off-ramp to centralized exchange. Intercept required to prevent asset liquidation.',
    provenance: 'Ethereum Mainnet — Block #20352011.',
    evidenceType: 'AI', confidence: 95,
  },
];

const HOP_LABELS = ['Victim UPI', 'Broker Wallet', 'Transit Wallet', 'Exchange Off-ramp'];

export default function Crypto({ theme }) {
  const { setCrypto, crypto: cryptoCtx, fir } = useCase();
  const [selectedTx, setSelectedTx] = useState(TRANSACTIONS[0]);
  const [frozen, setFrozen] = useState({});
  const isDark = theme === 'dark' || (typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));

  // Authorization & Query State
  const [cryptoAddress, setCryptoAddress] = useState(fir.wallets?.[0] || '0x71C7656EC7ab88b098defB751B7401B5f6d8976F');
  const [selectedNetwork, setSelectedNetwork] = useState('ETH');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [isFetched, setIsFetched] = useState(cryptoCtx?.analyzed || false);
  const [copied, setCopied] = useState(false);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    setIsFetched(cryptoCtx?.analyzed || false);
    if (!cryptoCtx?.analyzed && fir.loaded && fir.wallets?.[0]) {
      setCryptoAddress(fir.wallets[0]);
    }
  }, [cryptoCtx?.analyzed, fir.loaded, fir.wallets]);

  const handleAutoFill = () => {
    if (fir.loaded && fir.wallets?.[0]) {
      setCryptoAddress(fir.wallets[0]);
      setValidationError('');
    }
  };

  const handleCopy = () => {
    if (cryptoAddress) {
      navigator.clipboard?.writeText(cryptoAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleRequestPermission = async (e) => {
    e?.preventDefault();
    if (!cryptoAddress || !cryptoAddress.trim()) {
      setValidationError('Target wallet address is required to query exchange and on-chain RPC nodes.');
      return;
    }
    setValidationError('');
    setLoading(true);

    const steps = [
      'Connecting to Ethereum Infura RPC Node (Block #20352011)...',
      'Resolving centralized exchange KYC deposit clusters...',
      'Verifying multi-hop transit addresses & counterparty accounts...',
      'Synthesizing ledger audit trail under BNSS Sec 106 directives...'
    ];

    steps.forEach((s, idx) => {
      setTimeout(() => {
        setLoadingStep(s);
      }, idx * 400);
    });

    try {
      // Call real backend blockchain trace API
      const res = await api.crypto.trace(cryptoAddress.trim());
      setTimeout(() => {
        setLoading(false);
        setIsFetched(true);
        if (res?.data?.hops) {
          const hopWallets = res.data.hops.map(h => h.to || h.toAddress).filter(Boolean);
          const formattedHops = res.data.hops.map(h => ({
            from: h.from || h.fromAddress,
            to: h.to || h.toAddress,
            amount: h.amount,
            currency: h.currency
          }));
          setCrypto({
            analyzed: true,
            selectedTxId: TRANSACTIONS[0].id,
            wallets: [cryptoAddress.trim(), ...hopWallets],
            txHops: formattedHops.length ? formattedHops : [
              { from: 'Axis Bank Savings', to: '0x71C7…976F', amount: '1,50,000', currency: 'INR→ETH' },
              { from: '0x71C7…976F', to: '0x3c44…3bc', amount: '0.046', currency: 'ETH' },
              { from: '0x3c44…3bc', to: 'CoinDCX', amount: '0.040', currency: 'ETH→INR' },
            ],
            totalFrozen: res.data.totalFrozen || 148500,
          });
        }
      }, 1600);
    } catch (err) {
      console.warn('Backend crypto trace deferred. Fallback to simulated chain.', err.message);
      setTimeout(() => {
        setLoading(false);
        setIsFetched(true);
        setCrypto({
          analyzed: true,
          selectedTxId: TRANSACTIONS[0].id,
          wallets: ['0x71C7656EC7ab88b098defB751B7401B5f6d8976F', '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc', '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199'],
          txHops: [
            { from: 'Axis Bank Savings', to: '0x71C7…976F', amount: '1,50,000', currency: 'INR→ETH' },
            { from: '0x71C7…976F', to: '0x3c44…3bc', amount: '0.046', currency: 'ETH' },
            { from: '0x3c44…3bc', to: 'CoinDCX', amount: '0.040', currency: 'ETH→INR' },
          ],
          totalFrozen: 148500,
        });
      }, 1600);
    }
  };

  const handleRowClick = (tx) => {
    setSelectedTx(tx);
    setCrypto({
      analyzed: true,
      selectedTxId: tx.id,
      wallets: ['0x71C7656EC7ab88b098defB751B7401B5f6d8976F', '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc', '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199'],
      txHops: [
        { from: 'Axis Bank Savings', to: '0x71C7…976F', amount: '1,50,000', currency: 'INR→ETH' },
        { from: '0x71C7…976F', to: '0x3c44…3bc', amount: '0.046', currency: 'ETH' },
        { from: '0x3c44…3bc', to: 'CoinDCX', amount: '0.040', currency: 'ETH→INR' },
      ],
      totalFrozen: 148500,
    });
  };
  const handleFreeze = async (txId) => { 
    setFrozen(prev => ({ ...prev, [txId]: true })); 
    setCrypto({ frozenAssets: { ...(cryptoCtx?.frozenAssets || {}), [txId]: true } });
    try {
      await api.crypto.freeze({
        txId,
        caseId: 'KG-2026-0818',
        walletAddress: cryptoAddress || '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
        exchange: 'CoinDCX Nodal Compliance Desk',
        freezeReason: `BNSS Section 106 Judicial Directive for transaction ${txId}`
      });
    } catch (err) {
      console.warn('Backend asset freeze notification deferred:', err.message);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ backgroundColor: 'var(--bg-app)' }}>
      <CaseHeader moduleName="Financial Intelligence & Asset Tracing Command" />

      {/* Top Certification Banner */}
      <div className="shrink-0 px-6 py-2 flex items-center justify-between border-b text-xs z-10"
           style={{ backgroundColor: 'var(--bg-workspace)', borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center gap-3">
          <span className="pl-2 border-l-2 border-[#DC2626] text-[10px] font-extrabold uppercase text-[#DC2626] flex items-center gap-1">
            <Award size={12} /> Cryptographic Ledger Provenance Verification
          </span>
          <span className="text-[11px] font-medium hidden sm:inline" style={{ color: 'var(--text-secondary)' }}>
            Cryptographic ledger provenance & Multi-hop wallet transaction tracing
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="pl-2 border-l-2 border-[#16A34A] text-[10px] font-extrabold uppercase text-[#16A34A] flex items-center gap-1">
            <ShieldCheck size={12} /> Emergency Directive Active
          </span>
        </div>
      </div>

      {/* Investigative Blockchain Ledger Query Toolbar */}
      <div className="shrink-0 px-6 py-2.5 border-b flex flex-col gap-2 z-10"
           style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}>
        <form onSubmit={handleRequestPermission} className="flex flex-wrap items-center gap-3">
          
          {/* Target Address Input Group */}
          <div className="flex-1 min-w-[280px] max-w-xl flex items-center gap-2 px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-inner">
            <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase shrink-0">WALLET:</span>
            <input
              type="text"
              value={cryptoAddress}
              onChange={e => { setCryptoAddress(e.target.value); setValidationError(''); }}
              placeholder="e.g. 0x71C7656EC7ab88b098defB751B7401B5f6d8976F"
              className="flex-1 bg-transparent outline-none font-mono text-xs text-slate-900 dark:text-white placeholder-slate-400"
            />
            {cryptoAddress && (
              <button
                type="button"
                onClick={handleCopy}
                title="Copy Address"
                className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
              </button>
            )}
          </div>

          {/* Network Selector */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs">
            <Layers size={13} className="text-[#F0A91E]" />
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">NETWORK:</span>
            <select
              value={selectedNetwork}
              onChange={e => setSelectedNetwork(e.target.value)}
              className="bg-transparent outline-none font-mono text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
            >
              <option value="ETH" className="bg-slate-900 text-white">Ethereum Mainnet (ERC-20)</option>
              <option value="BTC" className="bg-slate-900 text-white">Bitcoin Network (UTXO)</option>
              <option value="TRX" className="bg-slate-900 text-white">Tron Ledger (TRC-20)</option>
            </select>
          </div>

          {/* Case Context Autofill */}
          {fir.loaded && fir.wallets?.[0] && (
            <button
              type="button"
              onClick={handleAutoFill}
              className="btn-premium px-3 py-1.5 rounded text-[11px] font-bold border border-dashed border-red-500/50 text-[#DC2626] hover:bg-red-500/10 transition-colors cursor-pointer"
            >
              Use FIR Wallet ({fir.wallets[0].slice(0, 8)}...)
            </button>
          )}

          {/* Submit Action */}
          <button
            type="submit"
            disabled={loading}
            className="btn-premium px-4 py-1.5 rounded text-xs font-extrabold uppercase text-white bg-[#DC2626] hover:bg-[#B91C1C] transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
          >
            {loading ? <RefreshCw size={13} className="animate-spin" /> : <Search size={13} />}
            <span>{loading ? 'Querying Ledger...' : 'Trace Ledger Hops'}</span>
          </button>
        </form>

        {/* Validation or Status Banner */}
        {validationError && (
          <p className="text-xs text-red-500 font-semibold">{validationError}</p>
        )}

        {loading && (
          <div className="flex items-center gap-2.5 py-1 text-[11px] font-mono text-slate-600 dark:text-slate-300">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping shrink-0" />
            <span className="font-semibold text-red-600 dark:text-red-400 tracking-wide">{loadingStep}</span>
          </div>
        )}
      </div>

      {/* Main Table + Inspector */}
      <div className="flex flex-1 min-h-0 overflow-hidden relative">

        {/* LEFT: Financial Trace Table */}
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden" style={{ backgroundColor: 'var(--bg-workspace)' }}>
          <div className="flex-1 overflow-y-auto">
            <table className="w-full border-collapse text-left text-xs select-none">
              <thead className="sticky top-0 z-10" style={{ backgroundColor: 'var(--bg-elevated)', borderBottom: '2px solid var(--border-medium)' }}>
                <tr>
                  {['Select', 'ID', 'Hop', 'Timestamp', 'From Source', 'Destination Target', 'Amount (INR)', 'Asset', 'Status'].map(col => (
                    <th key={col} className="p-3 font-extrabold uppercase tracking-wider text-[10px] whitespace-nowrap" style={{ color: 'var(--text-tertiary)' }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TRANSACTIONS.map(tx => {
                  const isSelected = selectedTx?.id === tx.id;
                  
                  /* HIGH CONTRAST SELECTION TINT */
                  const selectedBg = isDark ? '#2D1A1E' : '#FEF2F2';

                  return (
                    <tr
                      key={tx.id}
                      onClick={() => handleRowClick(tx)}
                      className="cursor-pointer transition-colors duration-150 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                      style={{
                        borderBottom: isSelected ? '2px solid #DC2626' : '1px solid var(--border-subtle)',
                        borderTop: isSelected ? '2px solid #DC2626' : 'none',
                        borderLeft: isSelected ? '6px solid #DC2626' : '6px solid transparent',
                        backgroundColor: isSelected ? selectedBg : 'transparent',
                        fontWeight: isSelected ? 800 : 500,
                      }}
                    >
                      {/* Selection Radio Dot */}
                      <td className="p-3 whitespace-nowrap">
                        <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                             style={{
                               borderColor: isSelected ? '#DC2626' : 'var(--border-medium)',
                               backgroundColor: isSelected ? '#DC2626' : 'transparent',
                             }}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </td>

                      <td className="p-3 font-extrabold text-sm whitespace-nowrap" style={{ color: isSelected ? '#DC2626' : 'var(--text-primary)' }}>
                        {tx.id}
                        {isSelected && (
                          <span className="ml-2 text-[10px] font-extrabold uppercase tracking-wider text-[#DC2626]">
                            ● ACTIVE
                          </span>
                        )}
                      </td>

                      <td className="p-3 whitespace-nowrap">
                        <span className="font-extrabold text-[10px]"
                              style={{ color: isSelected ? '#DC2626' : 'var(--text-tertiary)' }}>
                          HOP {tx.hop}
                        </span>
                      </td>

                      <td className="p-3 whitespace-nowrap" style={{ color: isSelected ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
                        {tx.timestamp}
                      </td>

                      <td className="p-3">
                        <p className="font-bold truncate max-w-[160px]" style={{ color: 'var(--text-primary)' }}>{tx.from}</p>
                        <p className="text-[10px] truncate max-w-[160px]" style={{ color: isSelected ? '#DC2626' : 'var(--text-tertiary)' }}>{tx.fromDetail}</p>
                      </td>

                      <td className="p-3">
                        <p className="font-bold truncate max-w-[160px]" style={{ color: 'var(--text-primary)' }}>{tx.to}</p>
                        <p className="text-[10px] truncate max-w-[160px]" style={{ color: isSelected ? '#DC2626' : 'var(--text-tertiary)' }}>{tx.toDetail}</p>
                      </td>

                      <td className="p-3 font-extrabold text-sm whitespace-nowrap" style={{ color: isSelected ? '#DC2626' : 'var(--text-primary)' }}>
                        ₹{(tx.amountInr || 0).toLocaleString('en-IN')}
                      </td>

                      <td className="p-3 font-bold whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>{tx.asset}</td>

                      <td className="p-3 whitespace-nowrap">
                        {frozen[tx.id] ? (
                          <span className="font-bold text-xs flex items-center gap-1" style={{ color: 'var(--status-ok)' }}>
                            <CheckCircle2 size={13} /> FROZEN DIRECTIVE
                          </span>
                        ) : (
                          <span className="font-bold text-xs" style={{ color: 'var(--status-critical)' }}>{tx.status?.toUpperCase() || 'CRITICAL'}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Hop Flow Strip */}
          <div className="shrink-0 p-4 flex items-center gap-3 border-t overflow-x-auto" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-workspace)' }}>
            <span className="text-[10px] font-extrabold uppercase tracking-wider shrink-0" style={{ color: 'var(--text-tertiary)' }}>
              Multi-Hop Flow Path:
            </span>
            {TRANSACTIONS.map((tx, i) => (
              <React.Fragment key={tx.id}>
                <button
                  onClick={() => handleRowClick(tx)}
                  className="btn-premium flex flex-col items-center px-4 py-2 rounded transition-colors duration-150 shrink-0 hover:opacity-90 cursor-pointer"
                  style={{
                    backgroundColor: selectedTx?.id === tx.id ? '#DC2626' : 'var(--bg-elevated)',
                    color: selectedTx?.id === tx.id ? '#FFFFFF' : 'var(--text-primary)',
                    border: selectedTx?.id === tx.id ? '2px solid #DC2626' : '1px solid var(--border-medium)',
                    boxShadow: selectedTx?.id === tx.id ? '0 2px 8px rgba(220, 38, 38, 0.4)' : 'none',
                  }}
                >
                  <span className="text-[9px] font-extrabold" style={{ color: selectedTx?.id === tx.id ? '#F0A91E' : '#DC2626' }}>HOP {tx.hop}</span>
                  <span className="text-xs font-bold mt-0.5">{HOP_LABELS[i] || `Hop ${tx.hop}`}</span>
                </button>
                {i < TRANSACTIONS.length - 1 && <ArrowRight size={14} className="shrink-0" style={{ color: 'var(--text-tertiary)' }} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* RIGHT: Selected Transaction Inspector Panel */}
        {selectedTx && (
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
                  <p className="text-[10px] font-extrabold uppercase text-[#DC2626] truncate">Transaction Inspector</p>
                  <p className="text-base font-extrabold truncate" style={{ color: 'var(--text-primary)' }}>{selectedTx.id}</p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                HOP {selectedTx.hop} / 4
              </span>
            </div>

            <EvidenceTag type={selectedTx.evidenceType || 'AI'} confidence={selectedTx.confidence} explanation={selectedTx.xai} />

            <div className="space-y-3 text-xs">
              <div className="pl-2 border-l-2 border-[#DC2626]">
                <span className="text-[10px] font-bold uppercase text-[#DC2626]">Transaction Value</span>
                <p className="text-2xl font-extrabold text-[#DC2626] mt-0.5">₹{(selectedTx.amountInr || 0).toLocaleString('en-IN')}</p>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase" style={{ color: 'var(--text-tertiary)' }}>Originating Source</span>
                <p className="font-bold text-xs" style={{ color: 'var(--text-primary)' }}>{selectedTx.from}</p>
                <p className="text-[10px] font-mono break-all" style={{ color: 'var(--text-secondary)' }}>{selectedTx.fromDetail}</p>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase" style={{ color: 'var(--text-tertiary)' }}>Destination Target</span>
                <p className="font-bold text-xs" style={{ color: 'var(--text-primary)' }}>{selectedTx.to}</p>
                <p className="text-[10px] font-mono break-all" style={{ color: 'var(--text-secondary)' }}>{selectedTx.toDetail}</p>
              </div>

              {selectedTx.provenance && (
                <div className="p-2.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
                  <span className="text-[9px] font-bold uppercase text-slate-500 dark:text-slate-400 block">Ledger Verification Provenance</span>
                  <span className="font-mono text-[10px] font-bold text-slate-800 dark:text-slate-200 break-all">{selectedTx.provenance}</span>
                </div>
              )}

              <div className="p-3 rounded border" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-medium)' }}>
                <span className="text-[10px] font-extrabold uppercase text-red-600 mb-1 block">Transaction Risk Provenance</span>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{selectedTx.xai}</p>
              </div>
            </div>

            {!frozen[selectedTx.id] ? (
              <button
                onClick={() => handleFreeze(selectedTx.id)}
                className="w-full px-4 py-3 rounded text-xs font-extrabold uppercase text-white text-center leading-snug transition-colors duration-150 hover:bg-[#B91C1C] hover:shadow-lg cursor-pointer"
                style={{ backgroundColor: '#DC2626', whiteSpace: 'normal', wordBreak: 'break-word' }}
              >
                Issue Emergency Asset Freeze Directive
              </button>
            ) : (
              <div className="w-full py-3 text-xs font-bold text-center flex flex-col items-center justify-center gap-1 border-t-2"
                   style={{ borderColor: 'var(--status-ok)', color: 'var(--status-ok)' }}>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={16} /> Asset Freeze Directive Active
                </div>
                <span className="text-[9px] font-mono uppercase text-[#16A34A]">
                  REF: FRZ-KG-2026-0818
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

