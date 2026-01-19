'use client';

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = '', hoverable, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-card border border-border rounded-xl p-4
        transition-all duration-[var(--duration-fast)] ease-[var(--ease-standard)]
        ${hoverable ? 'hover:bg-card-hover cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
