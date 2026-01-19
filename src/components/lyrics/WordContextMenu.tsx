'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/store';
import { fetchRhymes, fetchSoundsLike, fetchSynonyms } from '@/lib/api';
import type { RhymeSuggestion, RhymeSchemeColor } from '@/lib/types';
import { SpinnerGap, MusicNote, Waveform, BookOpen, Copy, Check, Plus, ArrowsOut } from '@phosphor-icons/react';
import { RhymesModal } from './RhymesModal';

interface WordContextMenuProps {
  word: string;
  position: { x: number; y: number };
  onClose: () => void;
  onAddToScheme: (scheme: RhymeSchemeColor) => void;
  onInsertWord: (word: string) => void;
  selectedScheme: RhymeSchemeColor;
}

type TabType = 'rhymes' | 'near' | 'synonyms';

export function WordContextMenu({
  word,
  position,
  onClose,
  onAddToScheme,
  onInsertWord,
  selectedScheme,
}: WordContextMenuProps) {
  const { autoHighlight } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabType>('rhymes');
  const [suggestions, setSuggestions] = useState<RhymeSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedWord, setCopiedWord] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<TabType | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fetch data when word changes or tab changes
  useEffect(() => {
    const fetchData = async () => {
      if (!word) return;
      setIsLoading(true);
      try {
        let results: RhymeSuggestion[];
        if (activeTab === 'rhymes') {
          results = await fetchRhymes(word);
        } else if (activeTab === 'near') {
          results = await fetchSoundsLike(word);
        } else {
          results = await fetchSynonyms(word);
        }
        setSuggestions(results.slice(0, 6)); // Limit to 6 suggestions for compact view
      } catch {
        setSuggestions([]);
      }
      setIsLoading(false);
    };
    fetchData();
  }, [word, activeTab]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) && !showModal) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose, showModal]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !showModal) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose, showModal]);

  const handleCopyWord = async (w: string) => {
    await navigator.clipboard.writeText(w);
    setCopiedWord(w);
    setTimeout(() => setCopiedWord(null), 1500);
  };

  const handleInsert = (w: string) => {
    onInsertWord(w);
    onClose();
  };

  const handleViewAll = () => {
    setShowModal(activeTab);
  };

  const handleModalInsert = (w: string) => {
    onInsertWord(w);
  };

  // Calculate menu position to keep it within viewport
  const menuStyle: React.CSSProperties = {
    position: 'absolute',
    top: position.y + 4,
    left: Math.max(8, Math.min(position.x - 160, window.innerWidth - 340)),
    zIndex: 50,
  };

  const getTabLabel = (tab: TabType) => {
    switch (tab) {
      case 'rhymes': return 'rhymes';
      case 'near': return 'near rhymes';
      case 'synonyms': return 'synonyms';
    }
  };

  return (
    <>
      <div
        ref={menuRef}
        className="w-[320px] bg-card border border-border rounded-xl shadow-2xl overflow-hidden animate-fade-in"
        style={menuStyle}
      >
        {/* Header with word */}
        <div className="px-3 py-2 border-b border-border bg-muted/50">
          <div className="flex items-center justify-between">
            <span className="text-[var(--fs-p-sm)] text-muted-foreground">
              Selected: <span className="font-medium text-foreground">{word}</span>
            </span>
            {!autoHighlight && (
              <button
                onClick={() => onAddToScheme(selectedScheme)}
                className="flex items-center gap-1 px-2 py-1 rounded bg-accent/20 text-accent text-[11px] font-medium hover:bg-accent/30 transition-colors"
              >
                <Plus size={12} weight="bold" />
                {selectedScheme}
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab('rhymes')}
            className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 text-[11px] font-medium transition-colors ${
              activeTab === 'rhymes'
                ? 'text-accent border-b-2 border-accent bg-accent/5'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <MusicNote size={12} weight="fill" />
            Rhymes
          </button>
          <button
            onClick={() => setActiveTab('near')}
            className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 text-[11px] font-medium transition-colors ${
              activeTab === 'near'
                ? 'text-accent border-b-2 border-accent bg-accent/5'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Waveform size={12} weight="fill" />
            Near
          </button>
          <button
            onClick={() => setActiveTab('synonyms')}
            className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 text-[11px] font-medium transition-colors ${
              activeTab === 'synonyms'
                ? 'text-accent border-b-2 border-accent bg-accent/5'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <BookOpen size={12} weight="fill" />
            Synonyms
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[180px] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <SpinnerGap size={24} className="animate-spin text-accent" />
            </div>
          ) : suggestions.length > 0 ? (
            <div className="p-1">
              {suggestions.map((suggestion, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--fs-p-sm)] font-medium">
                      {suggestion.word}
                    </span>
                    {suggestion.numSyllables && (
                      <span className="text-[10px] text-muted-foreground px-1 py-0.5 bg-muted rounded">
                        {suggestion.numSyllables}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleCopyWord(suggestion.word)}
                      className="p-1 rounded hover:bg-muted transition-colors"
                      title="Copy"
                    >
                      {copiedWord === suggestion.word ? (
                        <Check size={14} className="text-green-500" />
                      ) : (
                        <Copy size={14} className="text-muted-foreground" />
                      )}
                    </button>
                    <button
                      onClick={() => handleInsert(suggestion.word)}
                      className="px-2 py-0.5 rounded bg-accent text-linen text-[11px] font-medium hover:bg-accent-hover transition-colors"
                    >
                      Insert
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-[var(--fs-p-sm)] text-muted-foreground">
              No {getTabLabel(activeTab)} found
            </div>
          )}
        </div>

        {/* View All button */}
        {suggestions.length > 0 && (
          <div className="px-2 py-2 border-t border-border">
            <button
              onClick={handleViewAll}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/50 hover:bg-muted text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowsOut size={14} />
              View All {getTabLabel(activeTab).charAt(0).toUpperCase() + getTabLabel(activeTab).slice(1)}
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <RhymesModal
          word={word}
          type={showModal}
          onClose={() => setShowModal(null)}
          onInsertWord={handleModalInsert}
        />
      )}
    </>
  );
}
