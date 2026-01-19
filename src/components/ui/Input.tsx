'use client';

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Input({
  label,
  error,
  leftIcon,
  rightIcon,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[var(--fs-p-sm)] font-medium text-foreground">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {leftIcon}
          </span>
        )}
        <input
          className={`
            w-full px-4 py-2.5 rounded-lg
            bg-muted border border-border
            text-foreground text-[var(--fs-p-lg)]
            placeholder:text-muted-foreground
            focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
            transition-all duration-[var(--duration-fast)] ease-[var(--ease-standard)]
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon ? 'pr-10' : ''}
            ${error ? 'border-red-500 focus:ring-red-500' : ''}
            ${className}
          `}
          {...props}
        />
        {rightIcon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {rightIcon}
          </span>
        )}
      </div>
      {error && (
        <span className="text-[var(--fs-p-sm)] text-red-500">{error}</span>
      )}
    </div>
  );
}
