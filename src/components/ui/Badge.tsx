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
  I: 'bg-amber-500/20 text-amber-400 border-amber-400/40',
  J: 'bg-lime-500/20 text-lime-400 border-lime-400/40',
  K: 'bg-sky-500/20 text-sky-400 border-sky-400/40',
  L: 'bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-400/40',
  M: 'bg-rose-500/20 text-rose-400 border-rose-400/40',
  N: 'bg-indigo-500/20 text-indigo-400 border-indigo-400/40',
  O: 'bg-emerald-500/20 text-emerald-400 border-emerald-400/40',
  P: 'bg-orange-600/20 text-orange-400 border-orange-400/40',
  Q: 'bg-violet-500/20 text-violet-400 border-violet-400/40',
  R: 'bg-cyan-500/20 text-cyan-400 border-cyan-400/40',
  S: 'bg-pink-500/20 text-pink-400 border-pink-400/40',
  T: 'bg-teal-500/20 text-teal-400 border-teal-400/40',
  U: 'bg-yellow-500/20 text-yellow-400 border-yellow-400/40',
  V: 'bg-red-600/20 text-red-400 border-red-400/40',
  W: 'bg-blue-600/20 text-blue-400 border-blue-400/40',
  X: 'bg-green-600/20 text-green-400 border-green-400/40',
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
  disabled,
  focused,
  size = 'md',
}: {
  scheme: RhymeSchemeColor;
  selected: boolean;
  onClick?: () => void;
  disabled?: boolean;
  focused?: boolean;
  size?: 'sm' | 'md';
}) {
  const sizeClasses = size === 'sm' ? 'w-6 h-6 text-[10px]' : 'w-8 h-8 text-[var(--fs-p-sm)]';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${sizeClasses} rounded-md flex items-center justify-center
        font-bold
        transition-all duration-[var(--duration-fast)] ease-[var(--ease-standard)]
        ${schemeColors[scheme]}
        ${selected ? 'ring-2 ring-stone-brown ring-offset-2 ring-offset-background' : ''}
        ${focused ? 'ring-2 ring-accent ring-offset-1 ring-offset-background' : ''}
        ${disabled ? 'opacity-30 cursor-not-allowed' : selected ? '' : 'opacity-60 hover:opacity-100'}
      `}
    >
      {scheme}
    </button>
  );
}
