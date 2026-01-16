'use client';

import React from 'react';
import { useAppStore } from '@/store';
import type { RhymeSchemeColor, AccentLevel } from '@/lib/types';
import { SchemeBadge } from '@/components/ui/Badge';
import { Toggle } from '@/components/ui/Toggle';
import { Eraser, Sparkle } from '@phosphor-icons/react';

const SCHEMES: RhymeSchemeColor[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const ACCENT_LEVELS: { value: AccentLevel; label: string }[] = [
  { value: 'normal', label: 'Light' },
  { value: 'medium', label: 'Medium' },
  { value: 'heavy', label: 'Heavy' },
];

export function SchemeSelector() {
  const {
    selectedScheme,
    setSelectedScheme,
    accentLevel,
    setAccentLevel,
    autoHighlight,
    setAutoHighlight,
    clearRhymeWords,
    rhymeWords,
  } = useAppStore();

  return (
    <div className="space-y-4">
      {/* Auto-highlight toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkle size={18} weight="fill" className="text-accent" />
          <span className="text-[var(--fs-p-sm)] font-medium">Auto-detect rhymes</span>
        </div>
        <Toggle enabled={autoHighlight} onChange={setAutoHighlight} />
      </div>

      {/* Manual controls */}
      <div className={autoHighlight ? 'opacity-50 pointer-events-none' : ''}>
        {/* Scheme selector */}
        <div>
          <p className="text-[var(--fs-p-sm)] text-muted-foreground mb-2">
            Rhyme Scheme
          </p>
          <div className="flex flex-wrap gap-2">
            {SCHEMES.map((scheme) => (
              <SchemeBadge
                key={scheme}
                scheme={scheme}
                selected={selectedScheme === scheme}
                onClick={() => setSelectedScheme(scheme)}
              />
            ))}
          </div>
        </div>

        {/* Accent level */}
        <div className="mt-4">
          <p className="text-[var(--fs-p-sm)] text-muted-foreground mb-2">
            Accent Level
          </p>
          <div className="flex gap-2">
            {ACCENT_LEVELS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setAccentLevel(value)}
                className={`
                  px-3 py-1.5 rounded-md text-[var(--fs-p-sm)] font-medium
                  transition-all duration-[var(--duration-fast)]
                  ${
                    accentLevel === value
                      ? 'bg-accent text-linen'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }
                `}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Clear button */}
      {rhymeWords.length > 0 && (
        <button
          onClick={clearRhymeWords}
          className="flex items-center gap-2 px-3 py-2 rounded-lg w-full
            bg-muted text-muted-foreground hover:text-foreground
            transition-colors text-[var(--fs-p-sm)]"
        >
          <Eraser size={18} />
          Clear all highlights ({rhymeWords.length})
        </button>
      )}
    </div>
  );
}
