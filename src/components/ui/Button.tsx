'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = `
    inline-flex items-center justify-center gap-2
    font-medium rounded-lg
    transition-all duration-[var(--duration-fast)] ease-[var(--ease-standard)]
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const variants = {
    primary: 'bg-accent text-white hover:bg-accent-hover active:scale-[0.98]',
    secondary: 'bg-muted text-foreground hover:bg-card-hover active:scale-[0.98]',
    ghost: 'bg-transparent text-foreground hover:bg-muted active:scale-[0.98]',
    outline: 'border border-border bg-transparent text-foreground hover:bg-muted active:scale-[0.98]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-[var(--fs-p-sm)]',
    md: 'px-4 py-2 text-[var(--fs-p-sm)]',
    lg: 'px-6 py-3 text-[var(--fs-p-lg)]',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
