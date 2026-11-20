import React from 'react';

export default function EvidenceTag({ type = 'EXTRACTED', confidence, explanation }) {
  let textColor = 'var(--text-secondary)';

  if (type === 'AI') {
    textColor = '#D97706'; // Sutral Amber/Gold
  } else if (type === 'EXTRACTED') {
    textColor = '#DC2626'; // Sutral Command Red
  } else if (type === 'VERIFIED') {
    textColor = '#16A34A'; // Sutral Green
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5 font-extrabold text-[10px] uppercase tracking-wider">
        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: textColor }} />
        <span style={{ color: textColor }}>
          {type === 'AI' ? `AI MODEL (${confidence}% CONFIDENCE)` : type}
        </span>
      </div>

      {explanation && (
        <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
          {explanation}
        </p>
      )}
    </div>
  );
}
