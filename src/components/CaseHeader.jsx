import React from 'react';
import { Radio } from 'lucide-react';

export default function CaseHeader({ moduleName = 'KHAKHI GUARD Command Center' }) {
  return (
    <header className="shrink-0 z-40 select-none shadow-sm relative"
            style={{
              backgroundColor: '#DC2626', // Sutral Command Red Bar
              borderBottom: '4px solid #B91C1C',
              color: '#FFFFFF',
            }}>
      <div className="px-6 py-2.5 flex items-center justify-between gap-4">
        
        {/* Left: KHAKHI GUARD Emblem & Module Title */}
        <div className="flex items-center gap-3 min-w-0">
          
          {/* KHAKHI GUARD EMBLEM WITH LOGO IMAGE */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-black/25 text-white font-extrabold text-xs tracking-wider border border-white/20 shrink-0 shadow-sm">
            <img
              src="/khakhi_guard_logo.jpg"
              alt="KHAKHI GUARD Emblem Logo"
              className="w-5 h-5 rounded-full object-cover border border-[#F0A91E] shrink-0"
            />
            <span className="text-[#F0A91E]">CASE FILE: KG-2026-0818</span>
          </div>

          <span className="w-px h-4 bg-white/30 shrink-0" />

          <h1 className="text-sm font-extrabold tracking-wide uppercase truncate" style={{ color: '#FFFFFF' }}>
            {moduleName}
          </h1>
        </div>

        {/* Right Status Indicator */}
        <div className="flex items-center gap-3 shrink-0 text-xs font-bold">
          <div className="flex items-center gap-2 px-3 py-1 rounded bg-black/25 text-white border border-white/20 text-[10px] font-extrabold tracking-widest uppercase">
            <span className="w-2 h-2 rounded-full bg-[#4ADE80] animate-pulse" />
            <span>KHAKHI LIVE COMMAND</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded bg-black/20 text-white/90 text-xs font-semibold">
            <Radio size={13} className="text-[#F0A91E]" />
            <span>Cyber Investigation Command</span>
          </div>
        </div>

      </div>
    </header>
  );
}
