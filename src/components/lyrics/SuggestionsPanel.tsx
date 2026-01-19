'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/store';
import { fetchRhymes, fetchSoundsLike, fetchRhymesBySyllables } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { MagnifyingGlass, SpinnerGap, Copy, Check } from '@phosphor-icons/react';
import type { RhymeSuggestion } from '@/lib/types';

export function SuggestionsPanel() {
  const {
    suggestions,
    isLoadingSuggestions,
    selectedWord,
    setLyrics,
    lyrics,
  } = useAppStore();

  const [searchWord, setSearchWord] = useState('');
  const [syllableFilter, setSyllableFilter] = useState<number | null>(null);
  const [copiedWord, setCopiedWord] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'rhymes' | 'slant'>('rhymes');
  const [localSuggestions, setLocalSuggestions] = useState<RhymeSuggestion[]>([]);
  const [isLocalLoading, setIsLocalLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchWord.trim()) return;

    setIsLocalLoading(true);
    try {
      let results: RhymeSuggestion[];
      if (activeTab === 'rhymes') {
        results = syllableFilter
          ? await fetchRhymesBySyllables(searchWord, syllableFilter)
          : await fetchRhymes(searchWord);
      } else {
        results = await fetchSoundsLike(searchWord);
      }
      setLocalSuggestions(results);
    } catch {
      setLocalSuggestions([]);
    }
    setIsLocalLoading(false);
  };

  const handleCopyWord = async (word: string) => {
    await navigator.clipboard.writeText(word);
    setCopiedWord(word);
    setTimeout(() => setCopiedWord(null), 2000);
  };

  const handleInsertWord = (word: string) => {
    // Insert at cursor or at end
    setLyrics(lyrics + (lyrics ? ' ' : '') + word);
  };

  const displaySuggestions = searchWord ? localSuggestions : suggestions;
  const isLoading = searchWord ? isLocalLoading : isLoadingSuggestions;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <h3 className="fs-h-sm mb-2">Rhyme Suggestions</h3>
        <p className="text-[var(--fs-p-sm)] text-muted-foreground">
          {selectedWord
            ? `Showing rhymes for "${selectedWord}"`
            : 'Select a word in your lyrics or search below'}
        </p>
      </div>

      {/* Search */}
      <div className="space-y-3 mb-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="Search for rhymes..."
              value={searchWord}
              onChange={(e) => setSearchWord(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              leftIcon={<MagnifyingGlass size={18} />}
            />
          </div>
          <Button onClick={handleSearch} disabled={!searchWord.trim()}>
            Find
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('rhymes')}
            className={`px-3 py-1.5 rounded text-[var(--fs-p-sm)] font-medium transition-colors ${
              activeTab === 'rhymes'
                ? 'bg-accent text-linen'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            Perfect Rhymes
          </button>
          <button
            onClick={() => setActiveTab('slant')}
            className={`px-3 py-1.5 rounded text-[var(--fs-p-sm)] font-medium transition-colors ${
              activeTab === 'slant'
                ? 'bg-accent text-linen'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            Slant Rhymes
          </button>
        </div>

        {/* Syllable filter */}
        <div className="flex items-center gap-2">
          <span className="text-[var(--fs-p-sm)] text-muted-foreground">Syllables:</span>
          <div className="flex gap-1">
            {[null, 1, 2, 3, 4].map((count) => (
              <button
                key={count ?? 'all'}
                onClick={() => setSyllableFilter(count)}
                className={`px-2 py-1 rounded text-[var(--fs-p-sm)] transition-colors ${
                  syllableFilter === count
                    ? 'bg-accent text-linen'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {count ?? 'All'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <SpinnerGap size={32} className="animate-spin text-accent" />
          </div>
        ) : displaySuggestions.length > 0 ? (
          displaySuggestions
            .filter((s) => !syllableFilter || s.numSyllables === syllableFilter)
            .map((suggestion, idx) => (
              <Card key={idx} hoverable className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-foreground">
                      {suggestion.word}
                    </span>
                    {suggestion.numSyllables && (
                      <span className="ml-2 text-[var(--fs-p-sm)] text-muted-foreground">
                        {suggestion.numSyllables} syl
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleCopyWord(suggestion.word)}
                      className="p-1.5 rounded hover:bg-muted transition-colors"
                      title="Copy word"
                    >
                      {copiedWord === suggestion.word ? (
                        <Check size={16} className="text-green-500" />
                      ) : (
                        <Copy size={16} className="text-muted-foreground" />
                      )}
                    </button>
                    <button
                      onClick={() => handleInsertWord(suggestion.word)}
                      className="px-2 py-1 rounded bg-accent/20 text-accent text-[var(--fs-p-sm)] hover:bg-accent/30 transition-colors"
                    >
                      Insert
                    </button>
                  </div>
                </div>
              </Card>
            ))
        ) : (searchWord || selectedWord) && !isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No rhymes found</p>
            <p className="text-[var(--fs-p-sm)] mt-1">
              Try a different word or check spelling
            </p>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>Search for a word to find rhymes</p>
            <p className="text-[var(--fs-p-sm)] mt-1">
              Or select a word in your lyrics
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
