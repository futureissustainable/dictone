'use client';

import React, { useRef, useCallback, useMemo, useState } from 'react';
import { useAppStore } from '@/store';
import type { RhymeWord } from '@/lib/types';
import { RHYME_COLORS, ACCENT_OPACITY } from '@/lib/types';

export function LyricsEditor() {
  const {
    lyrics,
    setLyrics,
    rhymeWords,
    addRhymeWord,
    removeRhymeWord,
    selectedScheme,
    accentLevel,
    fetchSuggestionsForWord,
  } = useAppStore();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [selection, setSelection] = useState<{ start: number; end: number; word: string } | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Sync scroll between textarea and overlay
  const handleScroll = useCallback(() => {
    if (textareaRef.current && overlayRef.current) {
      overlayRef.current.scrollTop = textareaRef.current.scrollTop;
      overlayRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, []);

  // Handle text selection
  const handleSelect = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start !== end) {
      const selectedText = lyrics.substring(start, end).trim();
      // Check if selection is a single word
      if (selectedText && !selectedText.includes(' ') && !selectedText.includes('\n')) {
        setSelection({ start, end, word: selectedText });

        // Calculate tooltip position
        const textBeforeSelection = lyrics.substring(0, start);
        const lines = textBeforeSelection.split('\n');
        const lineIndex = lines.length - 1;
        const charIndex = lines[lineIndex].length;

        // Rough calculation for position
        const lineHeight = 24;
        const charWidth = 9.6;
        const x = charIndex * charWidth + 16;
        const y = (lineIndex + 1) * lineHeight;

        setTooltipPosition({ x: Math.min(x, 300), y });
        setShowTooltip(true);

        // Fetch suggestions for the selected word
        fetchSuggestionsForWord(selectedText);
      }
    } else {
      setShowTooltip(false);
      setSelection(null);
    }
  }, [lyrics, fetchSuggestionsForWord]);

  // Handle clicking on highlighted word to remove
  const handleHighlightClick = useCallback((rhymeWord: RhymeWord, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    removeRhymeWord(rhymeWord.startIndex);
  }, [removeRhymeWord]);

  // Add rhyme highlight to selected word
  const handleAddHighlight = useCallback(() => {
    if (selection) {
      // Find the exact word boundaries
      const lines = lyrics.split('\n');
      let globalIndex = 0;
      let lineIndex = 0;

      for (let i = 0; i < lines.length; i++) {
        if (globalIndex + lines[i].length >= selection.start) {
          lineIndex = i;
          break;
        }
        globalIndex += lines[i].length + 1; // +1 for newline
      }

      addRhymeWord({
        word: selection.word,
        startIndex: selection.start,
        endIndex: selection.end,
        lineIndex,
        scheme: selectedScheme,
        accentLevel,
        isManual: true,
      });

      setShowTooltip(false);
      setSelection(null);
    }
  }, [selection, selectedScheme, accentLevel, lyrics, addRhymeWord]);

  // Render the highlighted overlay
  const renderHighlightedText = useMemo(() => {
    if (!lyrics) return null;

    // Sort rhyme words by start index
    const sortedWords = [...rhymeWords].sort((a, b) => a.startIndex - b.startIndex);

    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    sortedWords.forEach((rhymeWord, idx) => {
      // Add text before this highlight
      if (rhymeWord.startIndex > lastIndex) {
        elements.push(
          <span key={`text-${idx}`}>
            {lyrics.substring(lastIndex, rhymeWord.startIndex)}
          </span>
        );
      }

      // Add highlighted word
      const color = RHYME_COLORS[rhymeWord.scheme];
      const opacity = ACCENT_OPACITY[rhymeWord.accentLevel];

      elements.push(
        <span
          key={`highlight-${idx}`}
          onClick={(e) => handleHighlightClick(rhymeWord, e)}
          className="rhyme-highlight cursor-pointer relative group"
          style={{
            backgroundColor: color,
            opacity,
            color: '#fff',
          }}
          title={`Scheme ${rhymeWord.scheme} - Click to remove`}
        >
          {lyrics.substring(rhymeWord.startIndex, rhymeWord.endIndex)}
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center text-[8px]">
            x
          </span>
        </span>
      );

      lastIndex = rhymeWord.endIndex;
    });

    // Add remaining text
    if (lastIndex < lyrics.length) {
      elements.push(
        <span key="text-end">{lyrics.substring(lastIndex)}</span>
      );
    }

    return elements;
  }, [lyrics, rhymeWords, handleHighlightClick]);

  return (
    <div className="relative h-full">
      {/* Overlay for highlights */}
      <div
        ref={overlayRef}
        className="absolute inset-0 p-4 pointer-events-none overflow-hidden whitespace-pre-wrap break-words"
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--fs-p-lg)',
          lineHeight: '1.5',
          color: 'transparent',
        }}
      >
        {renderHighlightedText}
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={lyrics}
        onChange={(e) => setLyrics(e.target.value)}
        onScroll={handleScroll}
        onSelect={handleSelect}
        onMouseUp={handleSelect}
        placeholder="Start writing your lyrics here...

Select any word to highlight it with a rhyme scheme color.
Words with the same color are part of the same rhyme scheme."
        className="
          w-full h-full p-4 resize-none
          bg-transparent border-none outline-none
          text-foreground caret-accent
          whitespace-pre-wrap break-words
        "
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--fs-p-lg)',
          lineHeight: '1.5',
          color: 'var(--foreground)',
          caretColor: 'var(--accent)',
        }}
      />

      {/* Clickable overlay for highlighted words */}
      <div
        className="absolute inset-0 p-4 overflow-hidden pointer-events-none"
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--fs-p-lg)',
          lineHeight: '1.5',
        }}
      >
        {rhymeWords.map((rhymeWord, idx) => {
          const textBefore = lyrics.substring(0, rhymeWord.startIndex);
          const lines = textBefore.split('\n');
          const lineIndex = lines.length - 1;
          const charOffset = lines[lineIndex].length;

          return (
            <span
              key={`click-${idx}`}
              onClick={(e) => handleHighlightClick(rhymeWord, e)}
              className="pointer-events-auto cursor-pointer absolute"
              style={{
                top: lineIndex * 24 + 16,
                left: charOffset * 9.6 + 16,
                width: (rhymeWord.endIndex - rhymeWord.startIndex) * 9.6,
                height: 24,
              }}
            />
          );
        })}
      </div>

      {/* Selection tooltip */}
      {showTooltip && selection && (
        <div
          className="absolute z-10 bg-card border border-border rounded-lg shadow-xl p-2 animate-fade-in"
          style={{
            top: tooltipPosition.y + 8,
            left: Math.min(tooltipPosition.x, 200),
          }}
        >
          <p className="text-[var(--fs-p-sm)] text-muted-foreground mb-2">
            Add &quot;{selection.word}&quot; to scheme:
          </p>
          <button
            onClick={handleAddHighlight}
            className="px-3 py-1.5 rounded bg-accent text-linen text-[var(--fs-p-sm)] font-medium hover:bg-accent-hover transition-colors"
          >
            Add to {selectedScheme}
          </button>
        </div>
      )}
    </div>
  );
}
