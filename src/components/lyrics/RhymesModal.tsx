'use client';

import React, { useState, useEffect } from 'react';
import { fetchAllRhymesWithScores, fetchSoundsLike, fetchSynonyms } from '@/lib/api';
import type { RhymeSuggestion } from '@/lib/types';
import { SpinnerGap, X, Copy, Check } from '@phosphor-icons/react';

interface RhymesModalProps {
  word: string;
  type: 'rhymes' | 'near' | 'synonyms';
  onClose: () => void;
  onInsertWord: (word: string) => void;
}

export function RhymesModal({ word, type, onClose, onInsertWord }: RhymesModalProps) {
  const [suggestions, setSuggestions] = useState<RhymeSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedWord, setCopiedWord] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        let results: RhymeSuggestion[];
        if (type === 'rhymes') {
          results = await fetchAllRhymesWithScores(word, 200);
        } else if (type === 'near') {
          results = await fetchSoundsLike(word, 100);
        } else {
          results = await fetchSynonyms(word, 100);
        }
        setSuggestions(results);
      } catch {
        setSuggestions([]);
      }
      setIsLoading(false);
    };
    fetchData();
  }, [word, type]);

  const handleCopyWord = async (w: string) => {
    await navigator.clipboard.writeText(w);
    setCopiedWord(w);
    setTimeout(() => setCopiedWord(null), 1500);
  };

  const getTitle = () => {
    switch (type) {
      case 'rhymes': return `All Rhymes for "${word}"`;
      case 'near': return `Near Rhymes for "${word}"`;
      case 'synonyms': return `Synonyms for "${word}"`;
    }
  };

  // Calculate score percentage (0-100) for rhymes
  const getScorePercentage = (score: number): number => {
    // Datamuse scores vary widely, normalize to 0-100
    const maxScore = suggestions.length > 0 ? Math.max(...suggestions.map(s => s.score)) : 1;
    return Math.round((score / maxScore) * 100);
  };

  const getScoreColor = (percentage: number): string => {
    if (percentage >= 80) return 'text-green-400';
    if (percentage >= 60) return 'text-lime-400';
    if (percentage >= 40) return 'text-yellow-400';
    if (percentage >= 20) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h2 className="text-[var(--fs-h-sm)] font-semibold">{getTitle()}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-muted transition-colors"
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
          ) : suggestions.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {suggestions.map((suggestion, idx) => {
                const scorePercent = type === 'rhymes' ? getScorePercentage(suggestion.score) : null;
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {scorePercent !== null && (
                        <span className={`text-[10px] font-mono w-8 ${getScoreColor(scorePercent)}`}>
                          {scorePercent}
                        </span>
                      )}
                      <span className="text-[var(--fs-p-sm)] font-medium truncate">
                        {suggestion.word}
                      </span>
                      {suggestion.numSyllables && (
                        <span className="text-[10px] text-muted-foreground px-1 py-0.5 bg-muted rounded shrink-0">
                          {suggestion.numSyllables}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
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
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-[var(--fs-p-sm)] text-muted-foreground">
              No results found
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-border text-[var(--fs-p-sm)] text-muted-foreground">
          {suggestions.length} results
        </div>
      </div>
    </div>
  );
}
