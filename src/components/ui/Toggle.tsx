'use client';

import React from 'react';

interface ToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label?: string;
}

export function Toggle({ enabled, onChange, label }: ToggleProps) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={`
          relative w-11 h-6 rounded-full
          transition-all duration-[var(--duration-fast)] ease-[var(--ease-standard)]
          ${enabled ? 'bg-accent' : 'bg-muted'}
        `}
      >
        <span
          className={`
            absolute top-1 left-1 w-4 h-4 rounded-full bg-white
            transition-transform duration-[var(--duration-fast)] ease-[var(--ease-standard)]
            ${enabled ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </button>
      {label && (
        <span className="text-[var(--fs-p-sm)] text-foreground">{label}</span>
      )}
    </label>
  );
}
