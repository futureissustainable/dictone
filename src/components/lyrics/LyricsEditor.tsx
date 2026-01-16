'use client';

import React, { useRef, useCallback, useState, useLayoutEffect } from 'react';
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
  const measureRef = useRef<HTMLDivElement>(null);
  const [selection, setSelection] = useState<{ start: number; end: number; word: string } | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [highlightRects, setHighlightRects] = useState<Array<{
    top: number;
    left: number;
    width: number;
    height: number;
    color: string;
    opacity: number;
    startIndex: number;
  }>>([]);

  // Calculate highlight positions using a hidden measurement div
  useLayoutEffect(() => {
    if (!measureRef.current || !lyrics) {
      setHighlightRects([]);
      return;
    }

    const measure = measureRef.current;
    const rects: typeof highlightRects = [];

    // Sort rhyme words by position
    const sortedWords = [...rhymeWords].sort((a, b) => a.startIndex - b.startIndex);

    sortedWords.forEach((rhymeWord) => {
      // Create a range to measure the word position
      const textBefore = lyrics.substring(0, rhymeWord.startIndex);
      const word = lyrics.substring(rhymeWord.startIndex, rhymeWord.endIndex);

      // Clear and rebuild measurement div
      measure.textContent = '';

      // Add text before the word
      const beforeSpan = document.createElement('span');
      beforeSpan.textContent = textBefore;
      measure.appendChild(beforeSpan);

      // Add the word we want to measure
      const wordSpan = document.createElement('span');
      wordSpan.textContent = word;
      measure.appendChild(wordSpan);

      // Get the word's bounding rect relative to the measure div
      const measureRect = measure.getBoundingClientRect();
      const wordRect = wordSpan.getBoundingClientRect();

      rects.push({
        top: wordRect.top - measureRect.top,
        left: wordRect.left - measureRect.left,
        width: wordRect.width,
        height: wordRect.height,
        color: RHYME_COLORS[rhymeWord.scheme],
        opacity: ACCENT_OPACITY[rhymeWord.accentLevel],
        startIndex: rhymeWord.startIndex,
      });
    });

    setHighlightRects(rects);
  }, [lyrics, rhymeWords]);

  // Sync scroll between textarea and highlight overlay
  const handleScroll = useCallback(() => {
    if (textareaRef.current && measureRef.current) {
      const scrollTop = textareaRef.current.scrollTop;
      const scrollLeft = textareaRef.current.scrollLeft;
      measureRef.current.style.transform = `translate(${-scrollLeft}px, ${-scrollTop}px)`;
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

        const lineHeight = 24;
        const charWidth = 9.6;
        const x = charIndex * charWidth + 16;
        const y = (lineIndex + 1) * lineHeight;

        setTooltipPosition({ x: Math.min(x, 300), y });
        setShowTooltip(true);

        fetchSuggestionsForWord(selectedText);
      }
    } else {
      setShowTooltip(false);
      setSelection(null);
    }
  }, [lyrics, fetchSuggestionsForWord]);

  // Handle clicking on highlight to remove
  const handleHighlightClick = useCallback((startIndex: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    removeRhymeWord(startIndex);
  }, [removeRhymeWord]);

  // Add rhyme highlight to selected word
  const handleAddHighlight = useCallback(() => {
    if (selection) {
      const lines = lyrics.split('\n');
      let globalIndex = 0;
      let lineIndex = 0;

      for (let i = 0; i < lines.length; i++) {
        if (globalIndex + lines[i].length >= selection.start) {
          lineIndex = i;
          break;
        }
        globalIndex += lines[i].length + 1;
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

  return (
    <div className="relative h-full overflow-hidden">
      {/* Hidden div for measuring text positions - must match textarea exactly */}
      <div
        ref={measureRef}
        aria-hidden="true"
        className="absolute top-0 left-0 p-4 whitespace-pre-wrap break-words pointer-events-none opacity-0"
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--fs-p-lg)',
          lineHeight: '1.5',
          width: '100%',
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
        }}
      />

      {/* Highlight backgrounds layer - positioned behind text */}
      <div
        className="absolute inset-0 p-4 pointer-events-none overflow-hidden"
        style={{ zIndex: 1 }}
      >
        <div style={{ position: 'relative' }}>
          {highlightRects.map((rect, idx) => (
            <div
              key={`bg-${idx}`}
              className="absolute rounded"
              style={{
                top: rect.top - 2,
                left: rect.left - 2,
                width: rect.width + 4,
                height: rect.height + 2,
                backgroundColor: rect.color,
                opacity: rect.opacity,
              }}
            />
          ))}
        </div>
      </div>

      {/* Main textarea - visible text, editable */}
      <textarea
        ref={textareaRef}
        value={lyrics}
        onChange={(e) => setLyrics(e.target.value)}
        onScroll={handleScroll}
        onSelect={handleSelect}
        onMouseUp={handleSelect}
        onKeyUp={handleSelect}
        placeholder="Start writing your lyrics here...

Select any word to highlight it with a rhyme scheme color.
Words with the same color are part of the same rhyme scheme."
        className="
          w-full h-full p-4 resize-none
          bg-transparent border-none outline-none
          whitespace-pre-wrap break-words
          relative
        "
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--fs-p-lg)',
          lineHeight: '1.5',
          color: 'var(--foreground)',
          caretColor: 'var(--accent)',
          zIndex: 2,
        }}
      />

      {/* Clickable areas for removing highlights */}
      <div
        className="absolute inset-0 p-4 pointer-events-none overflow-hidden"
        style={{ zIndex: 3 }}
      >
        {highlightRects.map((rect, idx) => (
          <div
            key={`click-${idx}`}
            onClick={(e) => handleHighlightClick(rect.startIndex, e)}
            className="absolute pointer-events-auto cursor-pointer hover:ring-2 hover:ring-white/50 rounded"
            title="Click to remove highlight"
            style={{
              top: rect.top - 2,
              left: rect.left - 2,
              width: rect.width + 4,
              height: rect.height + 2,
            }}
          />
        ))}
      </div>

      {/* Selection tooltip */}
      {showTooltip && selection && (
        <div
          className="absolute bg-card border border-border rounded-lg shadow-xl p-2 animate-fade-in"
          style={{
            top: tooltipPosition.y + 8,
            left: Math.min(tooltipPosition.x, 200),
            zIndex: 10,
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
