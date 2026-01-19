'use client';

import React, { useState, useEffect } from 'react';
import { X, SpinnerGap, Copy, Check, Plus } from '@phosphor-icons/react';
import { fetchAllRhymesWithScores, fetchSoundsLike, fetchSynonyms } from '@/lib/api';
import type { RhymeSuggestion } from '@/lib/types';

interface RhymesModalProps {
  word: string;
  type: 'rhymes' | 'near' | 'synonyms';
  onClose: () => void;
  onInsertWord: (word: string) => void;
}

export function RhymesModal({ word, type, onClose, onInsertWord }: RhymesModalProps) {
  const [results, setResults] = useState<RhymeSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedWord, setCopiedWord] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        let data: RhymeSuggestion[];
        if (type === 'rhymes') {
          data = await fetchAllRhymesWithScores(word, 200);
        } else if (type === 'near') {
          data = await fetchSoundsLike(word, 100);
        } else {
          data = await fetchSynonyms(word, 100);
        }
        setResults(data);
      } catch {
        setResults([]);
      }
      setIsLoading(false);
    };
    fetchData();
  }, [word, type]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleCopyWord = async (w: string) => {
    await navigator.clipboard.writeText(w);
    setCopiedWord(w);
    setTimeout(() => setCopiedWord(null), 1500);
  };

  const handleInsert = (w: string) => {
    onInsertWord(w);
  };

  // Convert raw score to 0-100 scale
  const getScorePercent = (score: number): number => {
    if (type === 'rhymes') {
      // For rhymes, scores typically range from 0-5000+
      // Perfect rhymes often have scores around 3000-5000
      const maxScore = 5000;
      return Math.min(100, Math.round((score / maxScore) * 100));
    }
    // For near rhymes and synonyms, similar logic
    const maxScore = 3000;
    return Math.min(100, Math.round((score / maxScore) * 100));
  };

  const getScoreColor = (percent: number): string => {
    if (percent >= 80) return 'text-green-400';
    if (percent >= 60) return 'text-lime-400';
    if (percent >= 40) return 'text-yellow-400';
    if (percent >= 20) return 'text-orange-400';
    return 'text-red-400';
  };

  const getTitle = () => {
    switch (type) {
      case 'rhymes': return 'All Rhymes';
      case 'near': return 'All Near Rhymes';
      case 'synonyms': return 'All Synonyms';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[80vh] bg-card border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
          <div>
            <h2 className="text-lg font-semibold">{getTitle()}</h2>
            <p className="text-[var(--fs-p-sm)] text-muted-foreground">
              for &ldquo;<span className="text-accent font-medium">{word}</span>&rdquo;
              {!isLoading && ` \u2022 ${results.length} results`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <SpinnerGap size={32} className="animate-spin text-accent" />
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {results.map((item, idx) => {
                const scorePercent = getScorePercent(item.score);
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      {/* Score */}
                      <span className={`text-sm font-mono font-bold w-8 ${getScoreColor(scorePercent)}`}>
                        {scorePercent}
                      </span>
                      {/* Word */}
                      <span className="font-medium">{item.word}</span>
                      {/* Syllables */}
                      {item.numSyllables && (
                        <span className="text-[10px] text-muted-foreground px-1.5 py-0.5 bg-muted rounded">
                          {item.numSyllables} syl
                        </span>
                      )}
                    </div>
                    {/* Actions */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleCopyWord(item.word)}
                        className="p-1.5 rounded hover:bg-muted transition-colors"
                        title="Copy"
                      >
                        {copiedWord === item.word ? (
                          <Check size={14} className="text-green-500" />
                        ) : (
                          <Copy size={14} className="text-muted-foreground" />
                        )}
                      </button>
                      <button
                        onClick={() => handleInsert(item.word)}
                        className="p-1.5 rounded hover:bg-muted transition-colors"
                        title="Insert"
                      >
                        <Plus size={14} className="text-accent" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              <p>No {type === 'rhymes' ? 'rhymes' : type === 'near' ? 'near rhymes' : 'synonyms'} found</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-border bg-muted/30 text-[11px] text-muted-foreground">
          Score: 100 = perfect match, 0 = weak match
        </div>
      </div>
    </div>
  );
}
