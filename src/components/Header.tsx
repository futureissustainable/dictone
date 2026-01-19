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
      label: 'Notepad',
      icon: <PencilSimple size={18} weight="bold" />,
      useHeadlineFont: true,
    },
    {
      id: 'copycat',
      label: 'Copycat',
      icon: <Copy size={18} weight="bold" />,
      useHeadlineFont: true,
    },
  ];

  return (
    <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container-page py-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <h1 className="fs-h-sm tracking-wide" style={{ fontFamily: 'var(--font-headline)' }}>
              DICTONE
            </h1>
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
