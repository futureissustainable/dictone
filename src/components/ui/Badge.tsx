'use client';

import React from 'react';
import type { RhymeSchemeColor, AccentLevel } from '@/lib/types';
import { RHYME_UNDERLINE_STYLES } from '@/lib/types';

interface BadgeProps {
  scheme: RhymeSchemeColor;
  accentLevel?: AccentLevel;
  children: React.ReactNode;
  onClick?: () => void;
  removable?: boolean;
  onRemove?: () => void;
}

// Maps scheme letter to base color (A-H use colors a-h, I-P reuse a-h, Q-X reuse a-h)
const getBaseColor = (scheme: RhymeSchemeColor): string => {
  const schemeIndex = scheme.charCodeAt(0) - 'A'.charCodeAt(0);
  const colorIndex = schemeIndex % 8;
  const colors = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  return colors[colorIndex];
};

const schemeColors: Record<RhymeSchemeColor, string> = {
  A: 'bg-rhyme-a/20 text-rhyme-a border-rhyme-a/40',
  B: 'bg-rhyme-b/20 text-rhyme-b border-rhyme-b/40',
  C: 'bg-rhyme-c/20 text-rhyme-c border-rhyme-c/40',
  D: 'bg-rhyme-d/20 text-rhyme-d border-rhyme-d/40',
  E: 'bg-rhyme-e/20 text-rhyme-e border-rhyme-e/40',
  F: 'bg-rhyme-f/20 text-rhyme-f border-rhyme-f/40',
  G: 'bg-rhyme-g/20 text-rhyme-g border-rhyme-g/40',
  H: 'bg-rhyme-h/20 text-rhyme-h border-rhyme-h/40',
  // I-P reuse colors a-h with dashed underline
  I: 'bg-rhyme-a/20 text-rhyme-a border-rhyme-a/40',
  J: 'bg-rhyme-b/20 text-rhyme-b border-rhyme-b/40',
  K: 'bg-rhyme-c/20 text-rhyme-c border-rhyme-c/40',
  L: 'bg-rhyme-d/20 text-rhyme-d border-rhyme-d/40',
  M: 'bg-rhyme-e/20 text-rhyme-e border-rhyme-e/40',
  N: 'bg-rhyme-f/20 text-rhyme-f border-rhyme-f/40',
  O: 'bg-rhyme-g/20 text-rhyme-g border-rhyme-g/40',
  P: 'bg-rhyme-h/20 text-rhyme-h border-rhyme-h/40',
  // Q-X reuse colors a-h with dotted underline
  Q: 'bg-rhyme-a/20 text-rhyme-a border-rhyme-a/40',
  R: 'bg-rhyme-b/20 text-rhyme-b border-rhyme-b/40',
  S: 'bg-rhyme-c/20 text-rhyme-c border-rhyme-c/40',
  T: 'bg-rhyme-d/20 text-rhyme-d border-rhyme-d/40',
  U: 'bg-rhyme-e/20 text-rhyme-e border-rhyme-e/40',
  V: 'bg-rhyme-f/20 text-rhyme-f border-rhyme-f/40',
  W: 'bg-rhyme-g/20 text-rhyme-g border-rhyme-g/40',
  X: 'bg-rhyme-h/20 text-rhyme-h border-rhyme-h/40',
};

const accentOpacity: Record<AccentLevel, string> = {
  normal: 'opacity-50',
  medium: 'opacity-75',
  heavy: 'opacity-100',
};

export function Badge({
  scheme,
  accentLevel = 'heavy',
  children,
  onClick,
  removable,
  onRemove,
}: BadgeProps) {
  return (
    <span
      onClick={onClick}
      className={`
        inline-flex items-center gap-1 px-2 py-0.5 rounded
        text-[var(--fs-p-sm)] font-medium border
        transition-all duration-[var(--duration-fast)] ease-[var(--ease-standard)]
        ${schemeColors[scheme]}
        ${accentOpacity[accentLevel]}
        ${onClick ? 'cursor-pointer hover:brightness-110' : ''}
      `}
    >
      {children}
      {removable && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 hover:text-white"
        >
          x
        </button>
      )}
    </span>
  );
}

export function SchemeBadge({
  scheme,
  selected,
  onClick,
  disabled = false,
  focused = false,
}: {
  scheme: RhymeSchemeColor;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
  focused?: boolean;
}) {
  const underlineStyle = RHYME_UNDERLINE_STYLES[scheme];
  const baseColor = getBaseColor(scheme);

  // Get underline class based on style
  const getUnderlineClass = () => {
    switch (underlineStyle) {
      case 'dashed':
        return 'border-b-2 border-dashed';
      case 'dotted':
        return 'border-b-2 border-dotted';
      default:
        return 'border-b-2 border-solid';
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-8 h-8 rounded-md flex items-center justify-center
        font-bold text-[var(--fs-p-sm)]
        transition-all duration-[var(--duration-fast)] ease-[var(--ease-standard)]
        ${schemeColors[scheme]}
        ${selected || focused ? 'ring-2 ring-stone-brown ring-offset-2 ring-offset-background' : ''}
        ${disabled ? 'opacity-20 cursor-not-allowed' : 'opacity-60 hover:opacity-100'}
        ${getUnderlineClass()}
      `}
      style={{
        borderBottomColor: `var(--rhyme-${baseColor})`,
      }}
    >
      {scheme}
    </button>
  );
}
