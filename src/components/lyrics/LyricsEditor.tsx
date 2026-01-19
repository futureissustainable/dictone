'use client';

import React, { useRef, useCallback, useState, useLayoutEffect, useMemo } from 'react';
import { useAppStore } from '@/store';
import { RHYME_COLORS, ACCENT_OPACITY, RHYME_UNDERLINE_STYLES, getDistanceOpacity, getContentLineDistance } from '@/lib/types';
import type { RhymeSchemeColor, UnderlineStyle } from '@/lib/types';
import { countSyllables } from '@/lib/rhyme-utils';

// Helper to check if a position is inside brackets
function isInsideBrackets(text: string, position: number): boolean {
  let depth = 0;
  for (let i = 0; i < position; i++) {
    if (text[i] === '[') depth++;
    else if (text[i] === ']') depth--;
  }
  return depth > 0;
}

// Helper to count syllables excluding bracketed content
function countLineSyllables(line: string): number {
  // Remove bracketed content before counting
  const withoutBrackets = line.replace(/\[.*?\]/g, '');
  const words = withoutBrackets.trim().split(/\s+/).filter(w => w.length > 0);
  return words.reduce((total, word) => total + countSyllables(word), 0);
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
    autoHighlight,
  } = useAppStore();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [selection, setSelection] = useState<{ start: number; end: number; word: string } | null>(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [showMenu, setShowMenu] = useState(false);
  const [scrollOffset, setScrollOffset] = useState({ top: 0, left: 0 });
  const [highlightRects, setHighlightRects] = useState<Array<{
    top: number;
    left: number;
    width: number;
    height: number;
    color: string;
    opacity: number;
    distanceOpacity: number;
    startIndex: number;
    scheme: RhymeSchemeColor;
    underlineStyle: UnderlineStyle;
  }>>([]);

  // Calculate highlight positions using a hidden measurement div
  useLayoutEffect(() => {
    if (!measureRef.current || !textareaRef.current) {
      setHighlightRects([]);
      return;
    }

    // Use current lyrics from textarea to ensure sync
    const currentLyrics = lyrics;
    if (!currentLyrics) {
      setHighlightRects([]);
      return;
    }

    const measure = measureRef.current;
    const textarea = textareaRef.current;
    const rects: typeof highlightRects = [];

    // Get textarea's padding
    const computedStyle = window.getComputedStyle(textarea);
    const paddingTop = parseFloat(computedStyle.paddingTop);
    const paddingLeft = parseFloat(computedStyle.paddingLeft);

    // Sort rhyme words by position
    const sortedWords = [...rhymeWords].sort((a, b) => a.startIndex - b.startIndex);

    // Pre-calculate minimum line distance for each word to another word in the same scheme
    // Excludes empty lines (verse separators) from the count
    const getMinDistanceForWord = (word: typeof sortedWords[0]) => {
      const sameSchemeWords = sortedWords.filter(
        w => w.scheme === word.scheme && w.startIndex !== word.startIndex
      );
      if (sameSchemeWords.length === 0) return 0; // Only word in scheme, full opacity

      let minDistance = Infinity;
      for (const other of sameSchemeWords) {
        // Use content-aware distance that ignores empty lines
        const distance = getContentLineDistance(currentLyrics, word.lineIndex, other.lineIndex);
        if (distance < minDistance) minDistance = distance;
      }
      return minDistance;
    };

    sortedWords.forEach((rhymeWord) => {
      // Validate the rhyme word positions are still valid
      if (rhymeWord.startIndex >= currentLyrics.length || rhymeWord.endIndex > currentLyrics.length) {
        return;
      }

      // Calculate distance-based opacity
      const minDistance = getMinDistanceForWord(rhymeWord);
      const distOpacity = getDistanceOpacity(minDistance);

      // Skip words that are too far from any rhyme partner (opacity = 0)
      if (distOpacity === 0) return;

      const textBefore = currentLyrics.substring(0, rhymeWord.startIndex);
      const word = currentLyrics.substring(rhymeWord.startIndex, rhymeWord.endIndex);

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

      // Position relative to measure div content area, then add textarea padding
      rects.push({
        top: wordRect.top - measureRect.top + paddingTop,
        left: wordRect.left - measureRect.left + paddingLeft,
        width: wordRect.width,
        height: wordRect.height,
        color: RHYME_COLORS[rhymeWord.scheme],
        opacity: ACCENT_OPACITY[rhymeWord.accentLevel],
        distanceOpacity: distOpacity,
        startIndex: rhymeWord.startIndex,
        scheme: rhymeWord.scheme,
        underlineStyle: RHYME_UNDERLINE_STYLES[rhymeWord.scheme],
      });
    });

    setHighlightRects(rects);
  }, [lyrics, rhymeWords]);

  // Sync scroll between textarea and highlight overlay
  const handleScroll = useCallback(() => {
    if (textareaRef.current) {
      setScrollOffset({
        top: textareaRef.current.scrollTop,
        left: textareaRef.current.scrollLeft,
      });
    }
  }, []);

  // Handle text selection - update selected word and show menu in manual mode
  const handleSelect = useCallback((e?: React.MouseEvent | React.KeyboardEvent) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start !== end) {
      const selectedText = lyrics.substring(start, end).trim();
      // Check if selection is a single word and not inside brackets
      if (selectedText && !selectedText.includes(' ') && !selectedText.includes('\n')) {
        // Check if the word is inside brackets
        if (!isInsideBrackets(lyrics, start)) {
          setSelection({ start, end, word: selectedText });
          // Update store's selectedWord for the WordPanel
          setSelectedWord(selectedText);

          // Show context menu for manual marking (works in both modes)
          if (e && 'clientX' in e) {
            const rect = textarea.getBoundingClientRect();
            setMenuPosition({
              x: e.clientX - rect.left,
              y: e.clientY - rect.top + 20,
            });
            setShowMenu(true);
          }
        }
      }
    } else {
      setShowMenu(false);
    }
  }, [lyrics, setSelectedWord, autoHighlight]);

  // Handle clicking on highlight to remove
  const handleHighlightClick = useCallback((startIndex: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    removeRhymeWord(startIndex);
  }, [removeRhymeWord]);

  // Add rhyme highlight to selected word (works in both modes)
  const handleMarkHighlight = useCallback(() => {
    if (!selection) return;

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

    setSelection(null);
    setShowMenu(false);

    // Clear textarea selection
    if (textareaRef.current) {
      textareaRef.current.setSelectionRange(selection.end, selection.end);
    }
  }, [selection, autoHighlight, selectedScheme, accentLevel, lyrics, addRhymeWord]);

  // Close menu on click outside
  const handleContainerClick = useCallback((e: React.MouseEvent) => {
    // Only close if clicking on the container itself, not children
    if (e.target === e.currentTarget) {
      setShowMenu(false);
    }
  }, []);

  // Line height for notepad lines - must match textarea exactly
  const lineHeightPx = 28; // Fixed pixel value for consistency

  // Calculate syllable counts per line (excluding bracketed content)
  const lineSyllableCounts = useMemo(() => {
    const lines = lyrics.split('\n');
    return lines.map(line => countLineSyllables(line));
  }, [lyrics]);

  // Find bracketed regions for graying out
  const bracketedRegions = useMemo(() => {
    const regions: Array<{ start: number; end: number }> = [];
    const regex = /\[[^\]]*\]/g;
    let match;
    while ((match = regex.exec(lyrics)) !== null) {
      regions.push({ start: match.index, end: match.index + match[0].length });
    }
    return regions;
  }, [lyrics]);

  return (
    <div className="relative h-full overflow-hidden">
      {/* Notepad lines background */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{
          backgroundImage: `repeating-linear-gradient(
            to bottom,
            transparent,
            transparent ${lineHeightPx - 1}px,
            rgba(255, 255, 255, 0.08) ${lineHeightPx - 1}px,
            rgba(255, 255, 255, 0.08) ${lineHeightPx}px
          )`,
          backgroundSize: `100% ${lineHeightPx}px`,
          backgroundPosition: '0 15px', // Align with textarea padding (16px - 1px for line)
          zIndex: 0,
        }}
      />

      {/* Hidden div for measuring text positions - no padding, we add it in calculation */}
      <div
        ref={measureRef}
        aria-hidden="true"
        className="absolute top-0 left-0 whitespace-pre-wrap break-words pointer-events-none opacity-0"
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--fs-p-lg)',
          lineHeight: `${lineHeightPx}px`,
          width: 'calc(100% - 64px)', // Account for textarea padding (16px left + 48px right for syllable counts)
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
        }}
      />

      {/* Highlight backgrounds layer - positioned behind text */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{ zIndex: 1 }}
      >
        <div style={{
          position: 'relative',
          transform: `translate(${-scrollOffset.left}px, ${-scrollOffset.top}px)`
        }}>
          {highlightRects.map((rect, idx) => {
            // Apply focus mode - dim non-focused schemes to 10%
            const isFocused = focusedScheme === null || rect.scheme === focusedScheme;
            // Combine accent opacity with distance-based opacity
            const baseOpacity = rect.opacity * rect.distanceOpacity;
            const effectiveOpacity = isFocused ? baseOpacity : baseOpacity * 0.1;

            return (
              <React.Fragment key={`bg-${idx}`}>
                {/* Background highlight */}
                <div
                  className="absolute rounded-sm"
                  style={{
                    top: rect.top - 2,
                    left: rect.left - 2,
                    width: rect.width + 4,
                    height: rect.height,
                    backgroundColor: rect.color,
                    opacity: effectiveOpacity * 0.3,
                    transition: 'opacity 0.15s ease',
                  }}
                />
                {/* Underline - separate element for visibility */}
                <div
                  className="absolute"
                  style={{
                    top: rect.top + rect.height - 4,
                    left: rect.left - 2,
                    width: rect.width + 4,
                    height: 0,
                    borderBottom: `3px ${rect.underlineStyle} ${rect.color}`,
                    opacity: isFocused ? rect.distanceOpacity : rect.distanceOpacity * 0.2,
                    transition: 'opacity 0.15s ease',
                  }}
                />
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Main textarea - visible text, editable */}
      <textarea
        ref={textareaRef}
        value={lyrics}
        onChange={(e) => {
          // Limit to 5000 characters to prevent performance issues
          const newValue = e.target.value.slice(0, 5000);
          setLyrics(newValue);
        }}
        onScroll={handleScroll}
        onMouseUp={(e) => handleSelect(e)}
        onKeyUp={(e) => handleSelect(e)}
        placeholder="Start writing your lyrics here...

Select any word to see rhymes in the Word Helper panel.
Use [brackets] for annotations - they won't count in syllables."
        className="
          w-full h-full p-4 pr-12 resize-none
          bg-transparent border-none outline-none
          whitespace-pre-wrap break-words
          relative
        "
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--fs-p-lg)',
          lineHeight: `${lineHeightPx}px`,
          color: 'var(--foreground)',
          caretColor: 'var(--accent)',
          zIndex: 2,
        }}
      />

      {/* Overlay for graying out bracketed content */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{ zIndex: 3 }}
      >
        <div
          className="relative p-4 pr-12 whitespace-pre-wrap break-words"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--fs-p-lg)',
            lineHeight: `${lineHeightPx}px`,
            transform: `translate(${-scrollOffset.left}px, ${-scrollOffset.top}px)`,
          }}
        >
          {/* Render text with bracketed sections grayed out */}
          {lyrics.split('').map((char, idx) => {
            const isInBracket = bracketedRegions.some(r => idx >= r.start && idx < r.end);
            if (isInBracket) {
              return (
                <span key={idx} style={{
                  color: 'rgba(255,255,255,0.4)',
                  textShadow: '0 0 0 rgba(0,0,0,0.8)',
                  backgroundColor: 'var(--background)',
                }}>
                  {char}
                </span>
              );
            }
            // Return invisible char to maintain layout
            return <span key={idx} style={{ visibility: 'hidden' }}>{char}</span>;
          })}
        </div>
      </div>

      {/* Syllable counts per line - right side */}
      <div
        className="absolute top-0 right-0 w-10 pointer-events-none overflow-hidden"
        style={{
          height: '100%',
          zIndex: 5,
          paddingTop: '16px', // Match textarea padding
        }}
      >
        <div style={{
          transform: `translateY(${-scrollOffset.top}px)`,
        }}>
          {lineSyllableCounts.map((count, idx) => (
            <div
              key={idx}
              className="flex items-center justify-center text-[10px] font-mono text-muted-foreground/50"
              style={{
                height: `${lineHeightPx}px`,
              }}
            >
              {count > 0 ? count : ''}
            </div>
          ))}
        </div>
      </div>

      {/* Clickable areas for removing highlights */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{ zIndex: 6 }}
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

      {/* Context menu for marking highlight - shows when word is selected */}
      {showMenu && selection && (
        <div
          className="absolute z-50 bg-card border border-border rounded-lg shadow-xl p-1 animate-fade-in"
          style={{
            top: menuPosition.y,
            left: Math.max(8, Math.min(menuPosition.x - 60, 200)),
          }}
        >
          <button
            onClick={handleMarkHighlight}
            className="px-3 py-1.5 rounded text-[var(--fs-p-sm)] font-medium hover:bg-muted transition-colors flex items-center gap-2 w-full"
          >
            <span
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: RHYME_COLORS[selectedScheme] }}
            />
            Mark as {selectedScheme}
          </button>
        </div>
      )}
    </div>
  );
}
