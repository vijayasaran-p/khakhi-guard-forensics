import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, MapPin, ShieldCheck, Lock, FileSpreadsheet, RotateCcw, Filter, X, ArrowUpRight } from 'lucide-react';
import CaseHeader from '../components/CaseHeader';
import { api } from '../api/client';
import { useCase } from '../context/CaseContext';

const DEFAULT_CASE_RECORDS = [
  { id: 'FIR-2026-0818', station: 'Sector 17 PS', crime: 'UPI Auto-Debit Phishing', victim: 'Harpreet Singh (47y M)', accused: 'Vikram Singh (32y M)', amount: '₹1,50,000', status: 'Open', priority: 'Critical', penalSection: 'Sec 318, 336 BNSS', date: '18 Aug 2026', coords: [30.7390, 76.7820] },
  { id: 'FIR-2026-0812', station: 'Sector 34 PS', crime: 'Cryptocurrency Laundering', victim: 'Rajesh Kumar (52y M)', accused: 'Amit Kumar (29y M)', amount: '₹1,48,500', status: 'Under Investigation', priority: 'High', penalSection: 'Sec 111 BNSS, IT 66D', date: '12 Aug 2026', coords: [30.7220, 76.7680] },
  { id: 'FIR-2026-0805', station: 'Sector 19 PS', crime: 'Bulk Gateway Impersonation', victim: 'Sunita Sharma (39y F)', accused: 'Bulk Gateway UT', amount: '₹85,000', status: 'Open', priority: 'Medium', penalSection: 'Sec 319 BNSS', date: '05 Aug 2026', coords: [30.7300, 76.7880] },
  { id: 'FIR-2026-0728', station: 'Mohali Sec 70', crime: 'SIM Swap Banking Fraud', victim: 'Gurpreet Kaur (44y F)', accused: 'Vicky Chhabra (32y M)', amount: '₹3,20,000', status: 'Closed', priority: 'High', penalSection: 'IT Act Sec 66C/66D', date: '28 Jul 2026', coords: [30.7050, 76.7180] },
  { id: 'FIR-2026-0715', station: 'Panchkula Sec 5', crime: 'Deepfake Extortion Call', victim: 'Anil Mehta (61y M)', accused: 'Unknown Syndicate', amount: '₹50,000', status: 'Under Investigation', priority: 'Critical', penalSection: 'Sec 308(2) BNSS', date: '15 Jul 2026', coords: [30.6940, 76.8600] },
];

export default function CaseRecordsPage({ caseRecords = DEFAULT_CASE_RECORDS }) {
  const navigate = useNavigate();
  const { loadCaseById } = useCase();
  const [dbCases, setDbCases] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [stationFilter, setStationFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await api.cases.list();
        if (isMounted && res?.data?.length > 0) {
          const mapped = res.data.map(c => ({
            id: c.firNumber,
            dbId: c.id,
            station: c.policeStation,
            crime: c.title,
            victim: c.complainantName ? `${c.complainantName} (Complainant)` : 'Victim Record',
            accused: c.accusedName ? `${c.accusedName} (Accused)` : 'Syndicate Operator',
            amount: `₹${(c.financialExposure || 0).toLocaleString('en-IN')}`,
            status: c.status === 'IN_PROGRESS' ? 'Under Investigation' : c.status === 'COURT_PROCEEDINGS' ? 'Court' : c.status,
            priority: c.priority === 'CRITICAL' ? 'Critical' : c.priority === 'HIGH' ? 'High' : 'Medium',
            penalSection: 'Sec 318, 336 BNSS',
            date: c.incidentDate ? new Date(c.incidentDate).toLocaleDateString('en-GB') : '10 Aug 2026',
            coords: [30.7390, 76.7820]
          }));
          setDbCases(mapped);
        }
      } catch (err) {
        console.warn('Backend cases fetch deferred. Using baseline cases.', err.message);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  const activeRecordsPool = dbCases.length > 0 ? dbCases : (Array.isArray(caseRecords) && caseRecords.length > 0 ? caseRecords : DEFAULT_CASE_RECORDS);
  const safeRecords = activeRecordsPool;

  const filtered = safeRecords.filter(c => {
    if (!c) return false;
    const q = (search || '').toLowerCase().trim();
    const idStr = (c.id || '').toLowerCase();
    const crimeStr = (c.crime || '').toLowerCase();
    const victimStr = (c.victim || '').toLowerCase();
    const stationStr = (c.station || '').toLowerCase();
    const accusedStr = (c.accused || '').toLowerCase();
    const sectionStr = (c.penalSection || '').toLowerCase();

    const matchSearch = !q || idStr.includes(q) || crimeStr.includes(q) || victimStr.includes(q) || stationStr.includes(q) || accusedStr.includes(q) || sectionStr.includes(q);
    const matchStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchStation = stationFilter === 'All' || c.station === stationFilter;
    const matchPriority = priorityFilter === 'All' || c.priority === priorityFilter;

    return matchSearch && matchStatus && matchStation && matchPriority;
  });

  const activeFiltersCount = (statusFilter !== 'All' ? 1 : 0) + (stationFilter !== 'All' ? 1 : 0) + (priorityFilter !== 'All' ? 1 : 0) + (search ? 1 : 0);

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('All');
    setStationFilter('All');
    setPriorityFilter('All');
  };

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ backgroundColor: 'var(--bg-app)' }}>
      <CaseHeader moduleName="Case Master Repositories" />

      {/* Official Law Enforcement Banner & Control Bar */}
      <div className="shrink-0 px-6 py-2.5 border-b flex flex-col gap-2.5 select-none"
           style={{ backgroundColor: 'var(--bg-workspace)', borderColor: 'var(--border-subtle)' }}>
        
        {/* Row 1: Search & Status Indicators */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[260px] max-w-lg px-3 py-1.5 rounded text-xs border shadow-inner"
               style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-medium)' }}>
            <Search size={14} style={{ color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              placeholder="Search by FIR ID, complainant, accused, penal section, or station..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none text-xs font-semibold"
              style={{ color: 'var(--text-primary)' }}
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-xs font-bold text-slate-400 hover:text-slate-200 cursor-pointer">
                ×
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#DC2626]">
              <ShieldCheck size={14} />
              <span>CCTNS Master Ledger Synchronized</span>
            </div>
            <span className="text-[11px] font-mono text-slate-500">
              Showing {filtered.length} of {safeRecords.length} records
            </span>
          </div>
        </div>

        {/* Row 2: Structured Investigative Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs">
          <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider flex items-center gap-1">
            <Filter size={12} /> FILTERS:
          </span>

          {/* Status Filter */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded border text-xs"
               style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}>
            <span className="text-[10px] font-bold text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-transparent outline-none font-bold cursor-pointer text-slate-800 dark:text-slate-200"
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Under Investigation">Under Investigation</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          {/* Station Filter */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded border text-xs"
               style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}>
            <span className="text-[10px] font-bold text-slate-500">Station:</span>
            <select
              value={stationFilter}
              onChange={e => setStationFilter(e.target.value)}
              className="bg-transparent outline-none font-bold cursor-pointer text-slate-800 dark:text-slate-200"
            >
              <option value="All">All Stations</option>
              <option value="Sector 17 PS">Sector 17 PS</option>
              <option value="Sector 34 PS">Sector 34 PS</option>
              <option value="Sector 19 PS">Sector 19 PS</option>
              <option value="Mohali Sec 70">Mohali Sec 70</option>
              <option value="Panchkula Sec 5">Panchkula Sec 5</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded border text-xs"
               style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}>
            <span className="text-[10px] font-bold text-slate-500">Priority:</span>
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              className="bg-transparent outline-none font-bold cursor-pointer text-slate-800 dark:text-slate-200"
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
            </select>
          </div>

          {/* Active Filter Pill & Reset */}
          {activeFiltersCount > 0 && (
            <button
              onClick={resetFilters}
              className="btn-premium px-2.5 py-1 rounded text-[10px] font-bold uppercase text-red-600 border border-red-500/40 hover:bg-red-500/10 transition-colors flex items-center gap-1 cursor-pointer ml-auto"
            >
              <X size={12} /> Clear Filters ({activeFiltersCount})
            </button>
          )}
        </div>
      </div>

      {/* Case Table Area */}
      <div className="flex-1 min-h-0 overflow-y-auto p-6">
        <div className="rounded border overflow-hidden shadow-sm flex flex-col" style={{ backgroundColor: 'var(--bg-workspace)', borderColor: 'var(--border-subtle)' }}>
          
          <div className="overflow-x-auto min-w-full pb-2">
            <table className="w-full text-left border-collapse text-xs select-none min-w-[1050px]">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--border-medium)', backgroundColor: 'var(--bg-elevated)' }}>
                  {['FIR ID', 'Police Station', 'Crime Classification', 'Penal Provisions', 'Complainant / Victim', 'Accused Party', 'Amount Loss', 'Status', 'Date', 'Actions'].map(h => (
                    <th key={h} className="p-3.5 font-extrabold uppercase tracking-wider text-[10px] whitespace-nowrap" style={{ color: 'var(--text-tertiary)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? (
                  filtered.map(row => (
                    <tr key={row.id} className="border-b transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/60" style={{ borderColor: 'var(--border-subtle)' }}>
                      <td className="p-3.5 font-mono font-bold text-xs whitespace-nowrap" style={{ color: '#DC2626' }}>
                        {row.id}
                      </td>
                      <td className="p-3.5 font-semibold whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>
                        {row.station}
                      </td>
                      <td className="p-3.5 font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {row.crime}
                      </td>
                      <td className="p-3.5 font-mono text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {row.penalSection}
                      </td>
                      <td className="p-3.5" style={{ color: 'var(--text-secondary)' }}>
                        {row.victim}
                      </td>
                      <td className="p-3.5 font-semibold" style={{ color: '#DC2626' }}>
                        {row.accused}
                      </td>
                      <td className="p-3.5 font-mono font-bold whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>
                        {row.amount}
                      </td>
                      
                      {/* Ultra-Professional Law Enforcement Status Indicator */}
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 pl-2 w-max border-l-2"
                             style={{ borderColor: row.status === 'Open' ? '#DC2626' : row.status === 'Closed' ? '#16A34A' : '#D97706' }}>
                          <span className="font-extrabold text-[10px] uppercase tracking-wider"
                                style={{ color: row.status === 'Open' ? '#DC2626' : row.status === 'Closed' ? '#16A34A' : '#D97706' }}>
                            {row.status}
                          </span>
                        </div>
                      </td>

                      <td className="p-3.5 whitespace-nowrap font-mono text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                        {row.date}
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <button
                          onClick={() => {
                            const [lat, lng] = row.coords || [30.7390, 76.7820];
                            navigate(`/tactical-map?lat=${lat}&lng=${lng}&focus=true`);
                          }}
                          className="btn-premium px-3 py-1.5 rounded text-[10px] font-extrabold uppercase transition-colors duration-150 hover:bg-[#B91C1C] hover:text-white flex items-center gap-1.5 cursor-pointer shadow-sm"
                          style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-medium)', color: '#DC2626' }}
                        >
                          <MapPin size={12} /> Map View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="p-12 text-center select-none">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <FileSpreadsheet size={36} style={{ color: 'var(--text-tertiary)' }} />
                        <p className="text-sm font-extrabold" style={{ color: 'var(--text-primary)' }}>
                          No Case Records Match Criteria
                        </p>
                        <p className="text-xs max-w-sm" style={{ color: 'var(--text-secondary)' }}>
                          No case records match the applied filters. Verify FIR registration number or adjust the status/date parameters.
                        </p>
                        <button
                          onClick={resetFilters}
                          className="mt-2 px-3 py-1.5 rounded text-xs font-extrabold uppercase text-white bg-[#DC2626] hover:bg-[#B91C1C] transition-colors duration-150 flex items-center gap-1.5 cursor-pointer"
                        >
                          <RotateCcw size={12} /> Reset Search & Filters
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}
