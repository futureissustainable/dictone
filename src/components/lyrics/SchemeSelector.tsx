'use client';

import React from 'react';
import { useAppStore } from '@/store';
import type { RhymeSchemeColor } from '@/lib/types';
import { SchemeBadge } from '@/components/ui/Badge';
import { Toggle } from '@/components/ui/Toggle';
import { Eraser, Sparkle, SlidersHorizontal } from '@phosphor-icons/react';

const SCHEMES: RhymeSchemeColor[] = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
  'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
  'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
];

export function SchemeSelector() {
  const {
    selectedScheme,
    setSelectedScheme,
    autoHighlight,
    setAutoHighlight,
    clearRhymeWords,
    rhymeWords,
    focusedScheme,
    setFocusedScheme,
    runAutoHighlight,
    rhymeSensitivity,
    setRhymeSensitivity,
  } = useAppStore();

  // Get schemes that are actually used in the text
  const usedSchemes = new Set(rhymeWords.map(w => w.scheme));

  // Handle scheme click - toggle focus or select scheme
  const handleSchemeClick = (scheme: RhymeSchemeColor) => {
    if (autoHighlight) {
      // In auto mode, clicking toggles focus on the scheme
      if (focusedScheme === scheme) {
        setFocusedScheme(null);
      } else {
        setFocusedScheme(scheme);
      }
    } else {
      // In manual mode, select the scheme for manual highlighting
      setSelectedScheme(scheme);
      // Also allow focusing in manual mode
      if (focusedScheme === scheme) {
        setFocusedScheme(null);
      } else if (usedSchemes.has(scheme)) {
        setFocusedScheme(scheme);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Auto-highlight toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkle size={18} weight="fill" className="text-accent" />
          <span className="text-[var(--fs-p-sm)] font-medium">Auto-detect</span>
        </div>
        <Toggle enabled={autoHighlight} onChange={setAutoHighlight} />
      </div>

      {/* Sensitivity slider - only show when auto-detect is enabled */}
      {autoHighlight && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <SlidersHorizontal size={14} className="text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground">Sensitivity</span>
            </div>
            <span className="text-[10px] text-muted-foreground tabular-nums">
              {rhymeSensitivity.toFixed(1)}
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="5"
            step="0.1"
            value={rhymeSensitivity}
            onChange={(e) => setRhymeSensitivity(parseFloat(e.target.value))}
            className="w-full h-1 bg-muted rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-accent [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
          />
          <div className="flex justify-between text-[9px] text-muted-foreground/60">
            <span>Loose</span>
            <span>Strict</span>
          </div>
        </div>
      )}

      {/* Scheme selector / focus mode */}
      <div>
        <p className="text-[var(--fs-p-sm)] text-muted-foreground mb-2">
          {autoHighlight ? 'Focus on Scheme' : 'Rhyme Scheme'}
        </p>
        <div className="flex flex-wrap gap-2">
          {SCHEMES.map((scheme) => {
            const isUsed = usedSchemes.has(scheme);
            const isFocused = focusedScheme === scheme;
            return (
              <SchemeBadge
                key={scheme}
                scheme={scheme}
                selected={autoHighlight ? isFocused : selectedScheme === scheme}
                onClick={() => handleSchemeClick(scheme)}
                disabled={autoHighlight && !isUsed}
                focused={isFocused}
              />
            );
          })}
        </div>
        {autoHighlight && (
          <p className="text-[11px] text-muted-foreground mt-2">
            Click a scheme to focus on it
          </p>
        )}
      </div>

      {/* Clear / Detect button */}
      <button
        onClick={rhymeWords.length > 0 ? clearRhymeWords : runAutoHighlight}
        className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg w-full
          bg-muted text-muted-foreground hover:text-foreground
          transition-colors text-[var(--fs-p-sm)] font-medium uppercase tracking-wide"
      >
        {rhymeWords.length > 0 ? (
          <>
            <Eraser size={18} />
            CLEAR {rhymeWords.length}
          </>
        ) : (
          <>
            <Sparkle size={18} />
            Detect
          </>
        )}
      </button>
    </div>
  );
}
