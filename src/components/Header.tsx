'use client';

import React from 'react';
import { useAppStore } from '@/store';
import { Tabs } from '@/components/ui/Tabs';
import { PencilSimple, Copy } from '@phosphor-icons/react';

export function Header() {
  const { activeTab, setActiveTab } = useAppStore();

  const tabs = [
    {
      id: 'writer',
      label: 'Lyrics Writer',
      icon: <PencilSimple size={18} weight="bold" />,
    },
    {
      id: 'copycat',
      label: 'COPYCAT',
      icon: <Copy size={18} weight="bold" />,
    },
  ];

  return (
    <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container-page py-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                <span className="text-white font-bold text-xl" style={{ fontFamily: 'var(--font-headline)' }}>
                  D
                </span>
              </div>
              <h1 className="fs-h-sm tracking-wide" style={{ fontFamily: 'var(--font-headline)' }}>
                DICTONE
              </h1>
            </div>
            <span className="hidden md:block text-[var(--fs-p-sm)] text-muted-foreground italic">
              Great artists steal.
            </span>
          </div>

          {/* Navigation */}
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onChange={(tab) => setActiveTab(tab as 'writer' | 'copycat')}
          />
        </div>
      </div>
    </header>
  );
}
