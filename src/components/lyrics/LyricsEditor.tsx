'use client';

import React, { useRef, useCallback, useState, useLayoutEffect, useMemo } from 'react';
import { useAppStore } from '@/store';
import { RHYME_COLORS, ACCENT_OPACITY } from '@/lib/types';
import { countSyllables, getBracketRegions, isInsideBrackets } from '@/lib/rhyme-utils';
import { SchemeBadge } from '@/components/ui/Badge';

// Count syllables in a line, excluding bracketed content
function countLineSyllables(line: string): number {
  const bracketRegions = getBracketRegions(line);
  let cleanLine = line;

  // Remove bracketed content (process in reverse to maintain indices)
  for (let i = bracketRegions.length - 1; i >= 0; i--) {
    const region = bracketRegions[i];
    cleanLine = cleanLine.slice(0, region.start) + cleanLine.slice(region.end);
  }

  // Extract words and count syllables
  const words = cleanLine.match(/[a-zA-Z]+(?:'[a-zA-Z]+)?/g) || [];
  return words.reduce((sum, word) => sum + countSyllables(word), 0);
}

export function LyricsEditor() {
  const {
    lyrics,
    setLyrics,
    rhymeWords,
    addRhymeWord,
    removeRhymeWord,
    selectedScheme,
    accentLevel,
    focusedScheme,
    setSelectedWord,
  } = useAppStore();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [selection, setSelection] = useState<{ start: number; end: number; word: string } | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [scrollOffset, setScrollOffset] = useState({ top: 0, left: 0 });
  const [highlightRects, setHighlightRects] = useState<Array<{
    top: number;
    left: number;
    width: number;
    height: number;
    color: string;
    opacity: number;
    startIndex: number;
    scheme: string;
  }>>([]);

  // Get bracket regions for graying out
  const bracketRegions = useMemo(() => getBracketRegions(lyrics), [lyrics]);

  // Calculate syllable counts per line
  const lineSyllables = useMemo(() => {
    const lines = lyrics.split('\n');
    return lines.map(line => countLineSyllables(line));
  }, [lyrics]);

  // Calculate highlight positions using a hidden measurement div
  useLayoutEffect(() => {
    if (!measureRef.current || !textareaRef.current) {
      setHighlightRects([]);
      return;
    }

    const currentLyrics = lyrics;
    if (!currentLyrics) {
      setHighlightRects([]);
      return;
    }

    const measure = measureRef.current;
    const textarea = textareaRef.current;
    const rects: typeof highlightRects = [];

    const computedStyle = window.getComputedStyle(textarea);
    const paddingTop = parseFloat(computedStyle.paddingTop);
    const paddingLeft = parseFloat(computedStyle.paddingLeft);

    const sortedWords = [...rhymeWords].sort((a, b) => a.startIndex - b.startIndex);

    sortedWords.forEach((rhymeWord) => {
      if (rhymeWord.startIndex >= currentLyrics.length || rhymeWord.endIndex > currentLyrics.length) {
        return;
      }

      // Skip if focused on a different scheme
      if (focusedScheme && rhymeWord.scheme !== focusedScheme) {
        return;
      }

      const textBefore = currentLyrics.substring(0, rhymeWord.startIndex);
      const word = currentLyrics.substring(rhymeWord.startIndex, rhymeWord.endIndex);

      measure.textContent = '';

      const beforeSpan = document.createElement('span');
      beforeSpan.textContent = textBefore;
      measure.appendChild(beforeSpan);

      const wordSpan = document.createElement('span');
      wordSpan.textContent = word;
      measure.appendChild(wordSpan);

      const measureRect = measure.getBoundingClientRect();
      const wordRect = wordSpan.getBoundingClientRect();

      rects.push({
        top: wordRect.top - measureRect.top + paddingTop,
        left: wordRect.left - measureRect.left + paddingLeft,
        width: wordRect.width,
        height: wordRect.height,
        color: RHYME_COLORS[rhymeWord.scheme],
        opacity: focusedScheme ? ACCENT_OPACITY[rhymeWord.accentLevel] : ACCENT_OPACITY[rhymeWord.accentLevel] * 0.8,
        startIndex: rhymeWord.startIndex,
        scheme: rhymeWord.scheme,
      });
    });

    setHighlightRects(rects);
  }, [lyrics, rhymeWords, focusedScheme]);

  // Sync scroll
  const handleScroll = useCallback(() => {
    if (textareaRef.current) {
      setScrollOffset({
        top: textareaRef.current.scrollTop,
        left: textareaRef.current.scrollLeft,
      });
    }
  }, []);

  // Handle text selection - show context menu
  const handleSelect = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start !== end) {
      const selectedText = lyrics.substring(start, end).trim();
      // Check if selection is a single word and not inside brackets
      if (selectedText && !selectedText.includes(' ') && !selectedText.includes('\n') && !isInsideBrackets(lyrics, start)) {
        setSelection({ start, end, word: selectedText });

        // Get cursor position for context menu
        const rect = textarea.getBoundingClientRect();
        const textBeforeSelection = lyrics.substring(0, start);
        const lines = textBeforeSelection.split('\n');
        const lineIndex = lines.length - 1;
        const charIndex = lines[lineIndex].length;

        const lineHeight = 24;
        const charWidth = 9.6;

        // Position menu near the selected word
        const x = Math.min(rect.left + charIndex * charWidth + 16, rect.right - 150);
        const y = rect.top + (lineIndex + 1) * lineHeight - scrollOffset.top + 8;

        setMenuPosition({ x, y });
        setShowMenu(true);
        setSelectedWord(selectedText);
      }
    } else {
      setShowMenu(false);
      setSelection(null);
    }
  }, [lyrics, scrollOffset.top, setSelectedWord]);

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

      setShowMenu(false);
      setSelection(null);
    }
  }, [selection, selectedScheme, accentLevel, lyrics, addRhymeWord]);

  // Close menu when clicking outside
  const handleTextareaClick = useCallback(() => {
    if (showMenu) {
      // Small delay to allow selection to be processed first
      setTimeout(() => {
        const textarea = textareaRef.current;
        if (textarea && textarea.selectionStart === textarea.selectionEnd) {
          setShowMenu(false);
          setSelection(null);
        }
      }, 10);
    }
  }, [showMenu]);

  return (
    <div className="relative h-full overflow-hidden flex">
      {/* Main editor area */}
      <div className="flex-1 relative">
        {/* Hidden div for measuring text positions */}
        <div
          ref={measureRef}
          aria-hidden="true"
          className="absolute top-0 left-0 whitespace-pre-wrap break-words pointer-events-none opacity-0"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--fs-p-lg)',
            lineHeight: '1.5',
            width: 'calc(100% - 32px)',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
          }}
        />

        {/* Bracket overlay - grays out bracketed content */}
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden"
          style={{ zIndex: 1 }}
        >
          <div style={{
            position: 'relative',
            transform: `translate(${-scrollOffset.left}px, ${-scrollOffset.top}px)`
          }}>
            {/* This is handled via CSS on the textarea with custom styling */}
          </div>
        </div>

        {/* Highlight backgrounds layer */}
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden"
          style={{ zIndex: 1 }}
        >
          <div style={{
            position: 'relative',
            transform: `translate(${-scrollOffset.left}px, ${-scrollOffset.top}px)`
          }}>
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

        {/* Main textarea */}
        <textarea
          ref={textareaRef}
          value={lyrics}
          onChange={(e) => setLyrics(e.target.value)}
          onScroll={handleScroll}
          onSelect={handleSelect}
          onMouseUp={handleSelect}
          onKeyUp={handleSelect}
          onClick={handleTextareaClick}
          placeholder="Start writing your lyrics here...

Select any word to highlight it with a rhyme scheme color.
Words with the same color are part of the same rhyme scheme.

Use [brackets] for annotations - they won't count toward rhymes."
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
          className="absolute inset-0 pointer-events-none overflow-hidden"
          style={{ zIndex: 3 }}
        >
          <div style={{
            position: 'relative',
            transform: `translate(${-scrollOffset.left}px, ${-scrollOffset.top}px)`
          }}>
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
        </div>
      </div>

      {/* Syllable count margin */}
      <div
        className="w-10 border-l border-border/30 overflow-hidden flex-shrink-0"
        style={{
          paddingTop: '16px', // Match textarea padding
        }}
      >
        <div
          style={{
            transform: `translateY(${-scrollOffset.top}px)`,
          }}
        >
          {lineSyllables.map((count, idx) => (
            <div
              key={idx}
              className="h-[24px] flex items-center justify-center text-[10px] text-muted-foreground/50 tabular-nums"
              style={{ lineHeight: '1.5' }}
            >
              {count > 0 ? count : ''}
            </div>
          ))}
        </div>
      </div>

      {/* Context menu for marking word */}
      {showMenu && selection && menuPosition && (
        <div
          className="fixed bg-card border border-border rounded-lg shadow-xl p-2 animate-fade-in z-50"
          style={{
            top: menuPosition.y,
            left: menuPosition.x,
          }}
        >
          <button
            onClick={handleAddHighlight}
            className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-muted transition-colors text-[var(--fs-p-sm)] font-medium whitespace-nowrap"
          >
            <span>Mark as</span>
            <SchemeBadge scheme={selectedScheme} selected size="sm" />
          </button>
        </div>
      )}
    </div>
  );
}
