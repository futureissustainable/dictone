'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/store';
import { fetchRhymes, fetchSoundsLike, fetchSynonyms, fetchAllRhymesWithScores } from '@/lib/api';
import type { RhymeSuggestion, RhymeSchemeColor, RhymeWithScore } from '@/lib/types';
import { SpinnerGap, MusicNote, Waveform, BookOpen, Copy, Check, Plus, ArrowsOut, TextAa } from '@phosphor-icons/react';
import { RhymesModal } from './RhymesModal';

type TabType = 'rhymes' | 'near' | 'synonyms';

export function WordPanel() {
  const {
    selectedWord,
    selectedScheme,
    autoHighlight,
    addRhymeWord,
    lyrics,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<TabType>('rhymes');
  const [suggestions, setSuggestions] = useState<RhymeSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedWord, setCopiedWord] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<TabType | null>(null);
  const [lastWord, setLastWord] = useState<string | null>(null);

  // Track the word to display (current selection or last selection)
  const displayWord = selectedWord || lastWord;

  // Update lastWord when selectedWord changes
  useEffect(() => {
    if (selectedWord) {
      setLastWord(selectedWord);
    }
  }, [selectedWord]);

  // Fetch data when word changes or tab changes
  useEffect(() => {
    const fetchData = async () => {
      if (!displayWord) return;
      setIsLoading(true);
      try {
        let results: RhymeSuggestion[];
        if (activeTab === 'rhymes') {
          results = await fetchRhymes(displayWord);
        } else if (activeTab === 'near') {
          results = await fetchSoundsLike(displayWord);
        } else {
          results = await fetchSynonyms(displayWord);
        }
        setSuggestions(results.slice(0, 20)); // Show more in the panel
      } catch {
        setSuggestions([]);
      }
      setIsLoading(false);
    };
    fetchData();
  }, [displayWord, activeTab]);

  const handleCopyWord = async (w: string) => {
    await navigator.clipboard.writeText(w);
    setCopiedWord(w);
    setTimeout(() => setCopiedWord(null), 1500);
  };

  const handleViewAll = () => {
    setShowModal(activeTab);
  };

  const getTabLabel = (tab: TabType) => {
    switch (tab) {
      case 'rhymes': return 'rhymes';
      case 'near': return 'near rhymes';
      case 'synonyms': return 'synonyms';
    }
  };

  if (!displayWord) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-4">
        <TextAa size={48} weight="light" className="text-muted-foreground/30 mb-3" />
        <p className="text-[var(--fs-p-sm)] text-muted-foreground">
          Select a word in the notepad to see rhymes, near rhymes, and synonyms
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="h-full flex flex-col">
        {/* Header with word */}
        <div className="px-3 py-2 border-b border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <span className="text-[var(--fs-p-sm)] text-muted-foreground">
              Word: <span className="font-semibold text-foreground">{displayWord}</span>
            </span>
            {!selectedWord && lastWord && (
              <span className="text-[10px] text-muted-foreground/60 italic">last selected</span>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border shrink-0">
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
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
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
                  <button
                    onClick={() => handleCopyWord(suggestion.word)}
                    className="p-1 rounded hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
                    title="Copy"
                  >
                    {copiedWord === suggestion.word ? (
                      <Check size={14} className="text-green-500" />
                    ) : (
                      <Copy size={14} className="text-muted-foreground" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-[var(--fs-p-sm)] text-muted-foreground">
              No {getTabLabel(activeTab)} found
            </div>
          )}
        </div>

        {/* View All button */}
        {suggestions.length > 0 && (
          <div className="px-2 py-2 border-t border-border shrink-0">
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
      {showModal && displayWord && (
        <RhymesModal
          word={displayWord}
          type={showModal}
          onClose={() => setShowModal(null)}
          onInsertWord={() => {}} // Panel doesn't need insert functionality
        />
      )}
    </>
  );
}
