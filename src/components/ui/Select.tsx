'use client';

import React from 'react';
import { CaretDown } from '@phosphor-icons/react';

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function Select({ label, options, value, onChange, placeholder }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[var(--fs-p-sm)] font-medium text-foreground">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`
            w-full px-4 py-2.5 rounded-lg appearance-none
            bg-muted border border-border
            text-foreground text-[var(--fs-p-lg)]
            focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
            transition-all duration-[var(--duration-fast)] ease-[var(--ease-standard)]
            cursor-pointer pr-10
          `}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <CaretDown
          size={20}
          weight="bold"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
        />
      </div>
    </div>
  );
}
