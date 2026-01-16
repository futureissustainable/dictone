'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/store';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { POPULAR_ARTISTS } from '@/lib/types';
import {
  MagnifyingGlass,
  SpinnerGap,
  Copy,
  Check,
  MusicNote,
  User,
  Quotes,
} from '@phosphor-icons/react';

export function CopycatSearch() {
  const {
    copycatSearchWord,
    setCopycatSearchWord,
    copycatArtist,
    setCopycatArtist,
    copycatResults,
    isCopycatLoading,
    copycatError,
    searchCopycat,
  } = useAppStore();

  const [copiedLine, setCopiedLine] = useState<string | null>(null);

  const handleCopyLine = async (line: string) => {
    await navigator.clipboard.writeText(line);
    setCopiedLine(line);
    setTimeout(() => setCopiedLine(null), 2000);
  };

  const artistOptions = POPULAR_ARTISTS.map((artist) => ({
    value: artist,
    label: artist,
  }));

  // Highlight the matched word in the line
  const highlightWord = (line: string, word: string) => {
    const regex = new RegExp(`(${word})`, 'gi');
    const parts = line.split(regex);

    return parts.map((part, idx) =>
      part.toLowerCase() === word.toLowerCase() ? (
        <span key={idx} className="bg-accent/30 text-accent px-1 rounded">
          {part}
        </span>
      ) : (
        <span key={idx}>{part}</span>
      )
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h2 className="fs-h-lg mb-2">COPYCAT</h2>
        <p className="text-muted-foreground">
          Find bars containing specific words from your favorite artists
        </p>
      </div>

      {/* Search form */}
      <div className="space-y-4 mb-6">
        <Select
          label="Select Artist"
          options={artistOptions}
          value={copycatArtist}
          onChange={setCopycatArtist}
        />

        <Input
          label="Search Word"
          placeholder="Enter a word (e.g., real, money, love)"
          value={copycatSearchWord}
          onChange={(e) => setCopycatSearchWord(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && searchCopycat()}
          leftIcon={<MagnifyingGlass size={18} />}
        />

        <Button
          onClick={searchCopycat}
          disabled={!copycatSearchWord.trim() || isCopycatLoading}
          className="w-full"
          size="lg"
        >
          {isCopycatLoading ? (
            <>
              <SpinnerGap size={20} className="animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <MagnifyingGlass size={20} weight="bold" />
              Search Bars
            </>
          )}
        </Button>
      </div>

      {/* Error message */}
      {copycatError && (
        <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
          {copycatError}
        </div>
      )}

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        {copycatResults.length > 0 ? (
          <div className="space-y-3">
            <p className="text-[var(--fs-p-sm)] text-muted-foreground mb-4">
              Found {copycatResults.length} bars containing &quot;{copycatSearchWord}&quot;
            </p>

            {copycatResults.map((result, idx) => (
              <Card key={idx} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Quote icon and line */}
                    <div className="flex items-start gap-2 mb-3">
                      <Quotes
                        size={20}
                        weight="fill"
                        className="text-accent flex-shrink-0 mt-0.5"
                      />
                      <p className="text-foreground leading-relaxed">
                        {highlightWord(result.line, result.matchedWord)}
                      </p>
                    </div>

                    {/* Song info */}
                    <div className="flex items-center gap-4 text-[var(--fs-p-sm)] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MusicNote size={14} />
                        {result.song}
                      </span>
                      <span className="flex items-center gap-1">
                        <User size={14} />
                        {result.artist}
                      </span>
                    </div>
                  </div>

                  {/* Copy button */}
                  <button
                    onClick={() => handleCopyLine(result.line)}
                    className="p-2 rounded-lg hover:bg-muted transition-colors flex-shrink-0"
                    title="Copy line"
                  >
                    {copiedLine === result.line ? (
                      <Check size={20} className="text-green-500" />
                    ) : (
                      <Copy size={20} className="text-muted-foreground" />
                    )}
                  </button>
                </div>
              </Card>
            ))}
          </div>
        ) : !isCopycatLoading && !copycatError ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <MusicNote size={48} className="mb-4 opacity-50" />
            <p className="text-[var(--fs-p-lg)]">Search for a word to find matching bars</p>
            <p className="text-[var(--fs-p-sm)] mt-2 max-w-md">
              Select an artist and enter a word to discover how they&apos;ve used it in their songs
            </p>
          </div>
        ) : null}
      </div>

      {/* Note about API limitations */}
      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-[var(--fs-p-sm)] text-muted-foreground">
          Note: Results depend on available lyrics from lyrics.ovh API. Some songs may not be available.
        </p>
      </div>
    </div>
  );
}
