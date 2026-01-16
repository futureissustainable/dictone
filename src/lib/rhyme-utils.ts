import type { RhymeWord, RhymeSchemeColor, AccentLevel, LineWord } from './types';

// Get ending phonemes from a word (simplified approach)
function getEndingSound(word: string): string {
  const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');

  // Common ending patterns for English rhymes
  const endings = [
    // Four-letter endings
    'ight', 'tion', 'sion', 'ness', 'ment', 'able', 'ible',
    'ious', 'eous', 'ance', 'ence', 'ling', 'ting', 'ning',
    // Three-letter endings
    'ing', 'ong', 'ang', 'ung', 'ink', 'ank', 'unk', 'onk',
    'ack', 'eck', 'ick', 'ock', 'uck', 'ake', 'ike', 'oke',
    'ate', 'ite', 'ote', 'ute', 'ale', 'ile', 'ole', 'ule',
    'ame', 'ime', 'ome', 'ume', 'ane', 'ine', 'one', 'une',
    'ape', 'ipe', 'ope', 'upe', 'are', 'ire', 'ore', 'ure',
    'ase', 'ise', 'ose', 'use', 'ace', 'ice', 'uce',
    'all', 'ell', 'ill', 'oll', 'ull', 'ear', 'eer', 'air',
    'oor', 'our', 'oar', 'ard', 'ord', 'urd', 'erd', 'ird',
    'ain', 'ein', 'oin', 'own', 'awn', 'awn',
    // Two-letter endings
    'ay', 'ey', 'ie', 'ee', 'ea', 'ow', 'ew', 'oo', 'ou', 'ai',
    'ad', 'ed', 'id', 'od', 'ud', 'at', 'et', 'it', 'ot', 'ut',
    'an', 'en', 'in', 'on', 'un', 'ap', 'ep', 'ip', 'op', 'up',
  ];

  // Find matching ending
  for (const ending of endings) {
    if (cleanWord.endsWith(ending)) {
      return ending;
    }
  }

  // Fallback: last 2-3 characters
  return cleanWord.slice(-Math.min(3, cleanWord.length));
}

// Check if two words rhyme based on their ending sounds
export function wordsRhyme(word1: string, word2: string): boolean {
  const clean1 = word1.toLowerCase().replace(/[^a-z]/g, '');
  const clean2 = word2.toLowerCase().replace(/[^a-z]/g, '');

  // Don't match same word
  if (clean1 === clean2) return false;

  // Don't match very short words
  if (clean1.length < 2 || clean2.length < 2) return false;

  const ending1 = getEndingSound(word1);
  const ending2 = getEndingSound(word2);

  // Perfect rhyme - same ending sound
  if (ending1 === ending2) return true;

  // Near rhyme - last 2 chars match
  if (clean1.slice(-2) === clean2.slice(-2)) return true;

  return false;
}

// Calculate rhyme strength (0-1)
export function calculateRhymeStrength(word1: string, word2: string): number {
  const w1 = word1.toLowerCase().replace(/[^a-z]/g, '');
  const w2 = word2.toLowerCase().replace(/[^a-z]/g, '');

  if (w1 === w2) return 0; // Same word doesn't count

  // Check ending matches
  let matchLength = 0;
  const minLen = Math.min(w1.length, w2.length);

  for (let i = 1; i <= minLen; i++) {
    if (w1.slice(-i) === w2.slice(-i)) {
      matchLength = i;
    } else {
      break;
    }
  }

  if (matchLength === 0) return 0;

  // Score based on match length relative to word length
  return Math.min(1, matchLength / 3);
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

// Auto-detect rhyme schemes in lyrics - checks ALL words, not just line endings
export function detectRhymeSchemes(
  lyrics: string,
  existingSchemes: RhymeWord[] = []
): RhymeWord[] {
  if (!lyrics.trim()) return existingSchemes.filter(s => s.isManual);

  const schemes: RhymeWord[] = [...existingSchemes.filter(s => s.isManual)];
  const availableSchemes: RhymeSchemeColor[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  let nextSchemeIndex = 0;

  // Extract ALL words with their global positions
  const allWords: { word: string; startIndex: number; endIndex: number; lineIndex: number }[] = [];
  const lines = lyrics.split('\n');
  let globalOffset = 0;

  lines.forEach((line, lineIndex) => {
    const lineWords = extractWords(line);
    lineWords.forEach((w) => {
      allWords.push({
        word: w.word,
        startIndex: globalOffset + w.startIndex,
        endIndex: globalOffset + w.endIndex,
        lineIndex,
      });
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

      if (wordsRhyme(word1.word, word2.word)) {
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
          const strength = calculateRhymeStrength(word1.word, wordData.word);
          schemes.push({
            word: wordData.word,
            startIndex: wordData.startIndex,
            endIndex: wordData.endIndex,
            lineIndex: wordData.lineIndex,
            scheme,
            accentLevel: strength > 0.7 ? 'heavy' : strength > 0.4 ? 'medium' : 'normal',
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
