import type { RhymeWord, RhymeSchemeColor, AccentLevel, LineWord } from './types';

// Convert word ending to a phonetic representation
// This normalizes different spellings that sound the same
function getPhoneticEnd(word: string): string {
  const w = word.toLowerCase().replace(/[^a-z]/g, '');
  if (w.length < 2) return w;

  // Work backwards from the end to find the rhyming portion
  // We want: last vowel sound + everything after it

  // First, normalize common spelling patterns to sounds
  let normalized = w;

  // Silent letters and common patterns (order matters - longer patterns first)
  const replacements: [RegExp, string][] = [
    // Silent endings
    [/ght$/, 't'],           // night, fight -> nit, fit (phonetically)
    [/gh$/, ''],             // through -> throu
    [/mb$/, 'm'],            // climb, bomb
    [/mn$/, 'm'],            // hymn, autumn
    [/kn/, 'n'],             // knife, know
    [/wr/, 'r'],             // write, wrong
    [/gn/, 'n'],             // gnome, sign

    // OH sound MUST come before OO sound to prevent "loos" -> "loohs"
    // OH sound (go, show, ghost, most, cost)
    [/ow$/, 'oh'],           // show, know, flow
    [/oa/, 'oh'],            // boat, coat
    [/ost$/, 'ohst'],        // ghost, most, cost, lost - explicit ending
    [/o(?=[st]$)/, 'oh'],    // host, post - o before single s or t at end

    // OO sound (too, through, blue, do, you, lose, fools)
    [/ough$/, 'uu'],         // through -> thruu (using uu to avoid oh collision)
    [/oo/, 'uu'],            // fools, loose, cool, moon -> fuulz, luus, cuul, muun
    [/o([sz])e$/, 'uu$1'],   // lose, chose -> luuz, chuuz
    [/oe$/, 'uu'],           // shoe, canoe
    [/ue$/, 'uu'],           // blue, true
    [/ew$/, 'uu'],           // new, few
    [/ou$/, 'uu'],           // you, through
    [/wo$/, 'uu'],           // two

    // Long A sound
    [/eigh/, 'ay'],          // weigh, eight
    [/ai/, 'ay'],            // rain, pain
    [/ay$/, 'ay'],           // day, say
    [/ey$/, 'ay'],           // they, grey

    // Long E sound
    [/ee/, 'ee'],            // see, free
    [/ea$/, 'ee'],           // sea, tea
    [/ie$/, 'ee'],           // cookie (at end)
    [/ese$/, 'eez'],         // these, cheese
    [/ease$/, 'eez'],        // please,ease
    [/eeze$/, 'eez'],        // freeze, breeze
    [/ies$/, 'eez'],         // ladies (sort of)

    // Long I sound
    [/igh/, 'iy'],           // high, sigh
    [/ie$/, 'iy'],           // die, tie, lie
    [/y$/, 'ee'],            // only at end after consonant: happy, crazy

    // ER sound (bird, word, her, fur)
    [/ir/, 'er'],
    [/ur/, 'er'],
    [/or(?=[^aeiouy]|$)/, 'er'], // word, work (but not "or" alone)
    [/ear(?=[^aeiouy]|$)/, 'er'], // heard, learn

    // Consonant normalizations
    [/ck/, 'k'],             // back, kick
    [/ph/, 'f'],             // phone, graph
    [/x$/, 'ks'],            // box, fox
    [/ce$/, 's'],            // ice, nice, dance
    [/se$/, 's'],            // close (adj), mouse
    [/([^s])s$/, '$1z'],     // plurals: dogs->dogz, cats stays cats
  ];

  for (const [pattern, replacement] of replacements) {
    normalized = normalized.replace(pattern, replacement);
  }

  // Now extract the rhyming portion (last vowel cluster + consonants)
  // Find the last vowel sequence
  const vowelMatch = normalized.match(/([aeiouy]+[^aeiouy]*)$/);
  if (vowelMatch) {
    return vowelMatch[1];
  }

  // Fallback: last 3 chars
  return normalized.slice(-3);
}


// Check if two words rhyme based on their phonetic endings
// Returns a score: 0 = no rhyme, 1 = weak, 2 = medium, 3 = strong, 4+ = very strong, 5 = perfect
export function getRhymeScore(word1: string, word2: string): number {
  const clean1 = word1.toLowerCase().replace(/[^a-z]/g, '');
  const clean2 = word2.toLowerCase().replace(/[^a-z]/g, '');

  // Don't match same word
  if (clean1 === clean2) return 0;

  // Don't match very short words
  if (clean1.length < 2 || clean2.length < 2) return 0;

  // Get phonetic endings (normalized to sounds)
  const phonetic1 = getPhoneticEnd(word1);
  const phonetic2 = getPhoneticEnd(word2);

  // Perfect match of phonetic endings
  if (phonetic1 === phonetic2) {
    // Longer phonetic matches are stronger rhymes
    if (phonetic1.length >= 3) return 5;
    if (phonetic1.length === 2) return 4.5; // Was 4 - spread out the 4.x range
    return 3.5;
  }

  // Check if endings differ only in the final consonant (slant rhyme)
  // e.g., "oht" vs "ohst" - ghost/most vs ghost/coat
  const vowel1 = phonetic1.match(/^[aeiouy]+/)?.[0] || '';
  const vowel2 = phonetic2.match(/^[aeiouy]+/)?.[0] || '';
  const cons1 = phonetic1.slice(vowel1.length);
  const cons2 = phonetic2.slice(vowel2.length);

  // Same vowel sound is the key to rhyming
  if (vowel1 === vowel2 && vowel1.length > 0) {
    // Same vowel, same ending consonant cluster
    if (cons1 === cons2) return 5;

    // Same vowel, similar ending consonant (one is subset of other)
    // More granular: closer lengths = stronger rhyme
    if (cons1.endsWith(cons2) || cons2.endsWith(cons1)) {
      const lenDiff = Math.abs(cons1.length - cons2.length);
      if (lenDiff === 1) return 4.25; // Very close (e.g., "t" vs "st")
      return 4; // Larger difference
    }

    // Same vowel, ending consonants share last sound
    if (cons1.length > 0 && cons2.length > 0 && cons1.slice(-1) === cons2.slice(-1)) return 3.75;

    // Same vowel, different consonants but close sounds
    // s/z, t/d, p/b, k/g are similar
    const similarPairs = [['s', 'z'], ['t', 'd'], ['p', 'b'], ['k', 'g'], ['f', 'v']];
    const lastCons1 = cons1.slice(-1);
    const lastCons2 = cons2.slice(-1);
    for (const [a, b] of similarPairs) {
      if ((lastCons1 === a && lastCons2 === b) || (lastCons1 === b && lastCons2 === a)) {
        return 3.25;
      }
    }

    // Same vowel sound alone = decent rhyme
    return 2.5;
  }

  // Check for assonance (similar vowel sounds, different consonants)
  // Map similar vowel sounds
  const vowelGroups = [
    ['oo', 'ou', 'ew'],     // long u sound
    ['ee', 'ea', 'ie'],     // long e sound
    ['ay', 'ai', 'ey'],     // long a sound
    ['iy', 'igh', 'ie'],    // long i sound
    ['oh', 'oa', 'ow'],     // long o sound
  ];

  for (const group of vowelGroups) {
    const v1InGroup = group.some(v => vowel1.includes(v) || vowel1 === v);
    const v2InGroup = group.some(v => vowel2.includes(v) || vowel2 === v);
    if (v1InGroup && v2InGroup && vowel1 !== vowel2) {
      // Similar vowel sounds with same ending consonant
      if (cons1 === cons2) return 2;
      // Similar vowels, similar consonants
      if (cons1.slice(-1) === cons2.slice(-1)) return 1.5;
    }
  }

  // Check raw spelling similarity as last resort
  if (clean1.slice(-3) === clean2.slice(-3)) return 2;
  if (clean1.slice(-2) === clean2.slice(-2)) return 1.5;

  return 0;
}

// Simple boolean check for backwards compatibility
// Raised threshold to 2.0 for stricter rhyme detection
export function wordsRhyme(word1: string, word2: string): boolean {
  return getRhymeScore(word1, word2) >= 2.0;
}

// Calculate rhyme strength (0-1) - uses the rhyme score for accurate color intensity
export function calculateRhymeStrength(word1: string, word2: string): number {
  const score = getRhymeScore(word1, word2);
  // Convert 0-5 score to 0-1 range
  // Score 5 = 1.0 (perfect), Score 3 = 0.6, Score 1 = 0.2
  return Math.min(1, score / 5);
}

// Extract words from text with their positions
export function extractWords(text: string): LineWord[] {
  const words: LineWord[] = [];
  const regex = /[a-zA-Z]+(?:'[a-zA-Z]+)?/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    words.push({
      word: match[0],
      startIndex: match.index,
      endIndex: match.index + match[0].length,
      syllables: countSyllables(match[0]),
    });
  }

  return words;
}

// Count syllables in a word (simplified)
export function countSyllables(word: string): number {
  const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
  if (cleanWord.length <= 3) return 1;

  // Count vowel groups
  const vowels = cleanWord.match(/[aeiouy]+/g);
  if (!vowels) return 1;

  let count = vowels.length;

  // Subtract for silent e at end
  if (cleanWord.endsWith('e') && cleanWord.length > 2) {
    count--;
  }

  // Subtract for -ed endings when not pronounced
  if (cleanWord.endsWith('ed') && !cleanWord.endsWith('ted') && !cleanWord.endsWith('ded')) {
    count--;
  }

  // Ensure at least 1 syllable
  return Math.max(1, count);
}

// Helper to check if a position is inside brackets
function isInsideBrackets(text: string, position: number): boolean {
  let depth = 0;
  for (let i = 0; i < position; i++) {
    if (text[i] === '[') depth++;
    else if (text[i] === ']') depth--;
  }
  return depth > 0;
}

// Auto-detect rhyme schemes in lyrics - checks ALL words, not just line endings
export function detectRhymeSchemes(
  lyrics: string,
  existingSchemes: RhymeWord[] = [],
  sensitivity: number = 2.0
): RhymeWord[] {
  if (!lyrics.trim()) return existingSchemes.filter(s => s.isManual);

  const schemes: RhymeWord[] = [...existingSchemes.filter(s => s.isManual)];
  const availableSchemes: RhymeSchemeColor[] = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
    'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
    'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
  ];
  let nextSchemeIndex = 0;

  // Extract ALL words with their global positions
  const allWords: { word: string; startIndex: number; endIndex: number; lineIndex: number }[] = [];
  const lines = lyrics.split('\n');
  let globalOffset = 0;

  lines.forEach((line, lineIndex) => {
    const lineWords = extractWords(line);
    lineWords.forEach((w) => {
      const globalStart = globalOffset + w.startIndex;
      // Skip words inside brackets
      if (!isInsideBrackets(lyrics, globalStart)) {
        allWords.push({
          word: w.word,
          startIndex: globalStart,
          endIndex: globalOffset + w.endIndex,
          lineIndex,
        });
      }
    });
    globalOffset += line.length + 1; // +1 for newline
  });

  // Track which words have been assigned to a scheme
  const assigned = new Set<number>();

  // Group rhyming words
  for (let i = 0; i < allWords.length && nextSchemeIndex < availableSchemes.length; i++) {
    if (assigned.has(i)) continue;

    const word1 = allWords[i];

    // Skip very short words for auto-detection
    if (word1.word.length < 3) continue;

    // Find all words that rhyme with this one
    const rhymingIndices: number[] = [i];

    for (let j = i + 1; j < allWords.length; j++) {
      if (assigned.has(j)) continue;

      const word2 = allWords[j];

      // Skip very short words
      if (word2.word.length < 3) continue;

      if (getRhymeScore(word1.word, word2.word) >= sensitivity) {
        rhymingIndices.push(j);
      }
    }

    // Only create a scheme if we found at least 2 rhyming words
    if (rhymingIndices.length >= 2) {
      const scheme = availableSchemes[nextSchemeIndex++];

      for (const idx of rhymingIndices) {
        assigned.add(idx);
        const wordData = allWords[idx];

        // Check if already manually assigned
        const existingManual = schemes.find(
          s => s.startIndex === wordData.startIndex && s.isManual
        );

        if (!existingManual) {
          const score = getRhymeScore(word1.word, wordData.word);
          // Map score to accent level: 4+ = heavy (100%), 2.5-4 = medium (60%), below = normal (30%)
          let accentLevel: AccentLevel;
          if (score >= 4) {
            accentLevel = 'heavy';
          } else if (score >= 2.5) {
            accentLevel = 'medium';
          } else {
            accentLevel = 'normal';
          }

          schemes.push({
            word: wordData.word,
            startIndex: wordData.startIndex,
            endIndex: wordData.endIndex,
            lineIndex: wordData.lineIndex,
            scheme,
            accentLevel,
            isManual: false,
          });
        }
      }
    }
  }

  return schemes;
}

// Determine accent level based on pronunciation emphasis
export function determineAccentLevel(word: string, _context?: string): AccentLevel {
  // Simple heuristic: longer words or words at end of lines are heavier
  const syllables = countSyllables(word);

  if (syllables >= 3) return 'heavy';
  if (syllables === 2) return 'medium';
  return 'normal';
}

// Recalculate rhyme word indices after text edit
// This attempts to find where each highlighted word now exists in the new text
export function recalculateRhymeWordIndices(
  oldLyrics: string,
  newLyrics: string,
  rhymeWords: RhymeWord[]
): RhymeWord[] {
  if (rhymeWords.length === 0) return [];
  if (oldLyrics === newLyrics) return rhymeWords;

  // Extract all words from new lyrics with their positions
  const newWordsMap = new Map<string, Array<{ startIndex: number; endIndex: number; lineIndex: number }>>();
  const lines = newLyrics.split('\n');
  let globalOffset = 0;

  lines.forEach((line, lineIndex) => {
    const lineWords = extractWords(line);
    lineWords.forEach((w) => {
      const wordLower = w.word.toLowerCase();
      if (!newWordsMap.has(wordLower)) {
        newWordsMap.set(wordLower, []);
      }
      newWordsMap.get(wordLower)!.push({
        startIndex: globalOffset + w.startIndex,
        endIndex: globalOffset + w.endIndex,
        lineIndex,
      });
    });
    globalOffset += line.length + 1;
  });

  // Track which positions in new text have been claimed
  const claimedPositions = new Set<number>();
  const updatedRhymeWords: RhymeWord[] = [];

  // Sort rhyme words by their original position to maintain order
  const sortedRhymeWords = [...rhymeWords].sort((a, b) => a.startIndex - b.startIndex);

  for (const rhymeWord of sortedRhymeWords) {
    const wordLower = rhymeWord.word.toLowerCase();
    const candidates = newWordsMap.get(wordLower);

    if (!candidates || candidates.length === 0) {
      // Word no longer exists in text - skip it
      continue;
    }

    // Find the best matching position
    // Prefer: 1) Same position, 2) Closest unclaimed position
    let bestCandidate: (typeof candidates)[0] | null = null;
    let bestDistance = Infinity;

    for (const candidate of candidates) {
      if (claimedPositions.has(candidate.startIndex)) continue;

      const distance = Math.abs(candidate.startIndex - rhymeWord.startIndex);

      // Exact match or first unclaimed
      if (distance === 0) {
        bestCandidate = candidate;
        break;
      }

      if (distance < bestDistance) {
        bestDistance = distance;
        bestCandidate = candidate;
      }
    }

    if (bestCandidate) {
      claimedPositions.add(bestCandidate.startIndex);
      updatedRhymeWords.push({
        ...rhymeWord,
        startIndex: bestCandidate.startIndex,
        endIndex: bestCandidate.endIndex,
        lineIndex: bestCandidate.lineIndex,
      });
    }
  }

  return updatedRhymeWords;
}
