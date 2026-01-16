'use client';

import React from 'react';
import { useAppStore } from '@/store';
import { Header } from '@/components/Header';
import { LyricsEditor } from '@/components/lyrics/LyricsEditor';
import { SchemeSelector } from '@/components/lyrics/SchemeSelector';
import { WordPanel } from '@/components/lyrics/WordPanel';
import { CopycatSearch } from '@/components/copycat/CopycatSearch';
import { Card } from '@/components/ui/Card';

export default function Home() {
  const { activeTab } = useAppStore();

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Dot grid background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          opacity: 0.075,
        }}
      />
      <Header />

      <main className="flex-1 container-page py-6 md:py-8 relative">
        {activeTab === 'writer' ? (
          <LyricsWriterView />
        ) : (
          <CopycatView />
        )}
      </main>
    </div>
  );
}

function LyricsWriterView() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)] min-h-[500px]">
      {/* Left sidebar - Scheme selector */}
      <div className="lg:col-span-3 xl:col-span-2 order-2 lg:order-1">
        <Card className="h-full p-4">
          <h3 className="fs-h-sm mb-4">Controls</h3>
          <SchemeSelector />
        </Card>
      </div>

      {/* Main editor */}
      <div className="lg:col-span-6 xl:col-span-7 order-1 lg:order-2">
        <Card className="h-full overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border">
            <h2 className="fs-h-sm">Notepad</h2>
            <p className="text-[var(--fs-p-sm)] text-muted-foreground mt-1">
              Select any word to find rhymes and highlight schemes
            </p>
          </div>
          <div className="flex-1 overflow-hidden">
            <LyricsEditor />
          </div>
        </Card>
      </div>

      {/* Right sidebar - Word Panel */}
      <div className="lg:col-span-3 xl:col-span-3 order-3 hidden lg:block">
        <Card className="h-full overflow-hidden flex flex-col">
          <div className="p-3 border-b border-border">
            <h3 className="fs-h-sm">Word Helper</h3>
          </div>
          <div className="flex-1 overflow-hidden">
            <WordPanel />
          </div>
        </Card>
      </div>
    </div>
  );
}

function CopycatView() {
  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-200px)] min-h-[600px]">
      <Card className="h-full p-6">
        <CopycatSearch />
      </Card>
    </div>
  );
}
