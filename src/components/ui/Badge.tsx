'use client';

import React from 'react';
import type { RhymeSchemeColor, AccentLevel } from '@/lib/types';

interface BadgeProps {
  scheme: RhymeSchemeColor;
  accentLevel?: AccentLevel;
  children: React.ReactNode;
  onClick?: () => void;
  removable?: boolean;
  onRemove?: () => void;
}

const schemeColors: Record<RhymeSchemeColor, string> = {
  A: 'bg-rhyme-a/20 text-rhyme-a border-rhyme-a/40',
  B: 'bg-rhyme-b/20 text-rhyme-b border-rhyme-b/40',
  C: 'bg-rhyme-c/20 text-rhyme-c border-rhyme-c/40',
  D: 'bg-rhyme-d/20 text-rhyme-d border-rhyme-d/40',
  E: 'bg-rhyme-e/20 text-rhyme-e border-rhyme-e/40',
  F: 'bg-rhyme-f/20 text-rhyme-f border-rhyme-f/40',
  G: 'bg-rhyme-g/20 text-rhyme-g border-rhyme-g/40',
  H: 'bg-rhyme-h/20 text-rhyme-h border-rhyme-h/40',
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
}: {
  scheme: RhymeSchemeColor;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        w-8 h-8 rounded-md flex items-center justify-center
        font-bold text-[var(--fs-p-sm)]
        transition-all duration-[var(--duration-fast)] ease-[var(--ease-standard)]
        ${schemeColors[scheme]}
        ${selected ? 'ring-2 ring-white ring-offset-2 ring-offset-background' : 'opacity-60 hover:opacity-100'}
      `}
    >
      {scheme}
    </button>
  );
}
