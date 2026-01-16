import type { RhymeWord, RhymeSchemeColor, AccentLevel, LineWord } from './types';

// CMU Dictionary phoneme mappings for rhyme detection
// Last phoneme patterns that typically rhyme
const VOWEL_SOUNDS = [
  'AA', 'AE', 'AH', 'AO', 'AW', 'AY', 'EH', 'ER', 'EY', 'IH',
  'IY', 'OW', 'OY', 'UH', 'UW'
];

// Get ending phonemes from a word (simplified approach)
function getEndingSound(word: string): string {
  const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');

  // Common ending patterns for English rhymes
  const endings = [
    // Two-letter endings
    'ay', 'ey', 'ie', 'ee', 'ea', 'ow', 'ew', 'oo', 'ou', 'ai',
    // Three-letter endings
    'ight', 'tion', 'sion', 'ness', 'ment', 'able', 'ible',
    'ious', 'eous', 'ance', 'ence', 'ling', 'ting', 'ning',
    // Common word endings
    'ing', 'ong', 'ang', 'ung', 'ink', 'ank', 'unk', 'onk',
    'ack', 'eck', 'ick', 'ock', 'uck', 'ake', 'ike', 'oke',
    'ate', 'ite', 'ote', 'ute', 'ale', 'ile', 'ole', 'ule',
    'ame', 'ime', 'ome', 'ume', 'ane', 'ine', 'one', 'une',
    'ape', 'ipe', 'ope', 'upe', 'are', 'ire', 'ore', 'ure',
    'ase', 'ise', 'ose', 'use', 'ace', 'ice', 'oce', 'uce',
    'all', 'ell', 'ill', 'oll', 'ull', 'ear', 'eer', 'air',
    'oor', 'our', 'oar', 'ard', 'ord', 'urd', 'erd', 'ird',
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
  const ending1 = getEndingSound(word1);
  const ending2 = getEndingSound(word2);

  // Perfect rhyme
  if (ending1 === ending2) return true;

  // Near rhyme (last 2 chars match)
  const last2_1 = word1.toLowerCase().slice(-2);
  const last2_2 = word2.toLowerCase().slice(-2);
  if (last2_1 === last2_2) return true;

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

// Auto-detect rhyme schemes in lyrics
export function detectRhymeSchemes(
  lyrics: string,
  existingSchemes: RhymeWord[] = []
): RhymeWord[] {
  const lines = lyrics.split('\n');
  const schemes: RhymeWord[] = [...existingSchemes.filter(s => s.isManual)];
  const schemeMap = new Map<string, RhymeSchemeColor>();
  const availableSchemes: RhymeSchemeColor[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  let nextSchemeIndex = 0;

  // Get last word of each line
  const lineEndWords: { word: string; lineIndex: number; startIndex: number; endIndex: number }[] = [];

  lines.forEach((line, lineIndex) => {
    const words = extractWords(line);
    if (words.length > 0) {
      const lastWord = words[words.length - 1];
      const lineStartIndex = lines.slice(0, lineIndex).join('\n').length + (lineIndex > 0 ? 1 : 0);
      lineEndWords.push({
        word: lastWord.word,
        lineIndex,
        startIndex: lineStartIndex + lastWord.startIndex,
        endIndex: lineStartIndex + lastWord.endIndex,
      });
    }
  });

  // Group rhyming words
  const assigned = new Set<number>();

  for (let i = 0; i < lineEndWords.length; i++) {
    if (assigned.has(i)) continue;

    const word1 = lineEndWords[i];
    const ending = getEndingSound(word1.word);

    // Check if this ending already has a scheme
    let scheme = schemeMap.get(ending);
    if (!scheme && nextSchemeIndex < availableSchemes.length) {
      // Look for rhyming words
      const rhymingIndices = [i];

      for (let j = i + 1; j < lineEndWords.length; j++) {
        if (!assigned.has(j) && wordsRhyme(word1.word, lineEndWords[j].word)) {
          rhymingIndices.push(j);
        }
      }

      // Only assign scheme if we found rhymes
      if (rhymingIndices.length > 1) {
        scheme = availableSchemes[nextSchemeIndex++];
        schemeMap.set(ending, scheme);

        for (const idx of rhymingIndices) {
          assigned.add(idx);
          const wordData = lineEndWords[idx];

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
  }

  return schemes;
}

// Find internal rhymes within lines
export function detectInternalRhymes(
  lyrics: string,
  existingSchemes: RhymeWord[] = []
): RhymeWord[] {
  const lines = lyrics.split('\n');
  const schemes: RhymeWord[] = [];

  lines.forEach((line, lineIndex) => {
    const words = extractWords(line);
    const lineStartIndex = lines.slice(0, lineIndex).join('\n').length + (lineIndex > 0 ? 1 : 0);

    // Check pairs of words within the same line
    for (let i = 0; i < words.length - 1; i++) {
      for (let j = i + 1; j < words.length; j++) {
        if (wordsRhyme(words[i].word, words[j].word)) {
          const strength = calculateRhymeStrength(words[i].word, words[j].word);
          if (strength > 0.5) {
            // Add both words if not already in schemes
            const checkAndAdd = (word: LineWord) => {
              const globalStart = lineStartIndex + word.startIndex;
              const exists = existingSchemes.some(s => s.startIndex === globalStart);
              if (!exists) {
                schemes.push({
                  word: word.word,
                  startIndex: globalStart,
                  endIndex: lineStartIndex + word.endIndex,
                  lineIndex,
                  scheme: 'A', // Internal rhymes default to A
                  accentLevel: strength > 0.7 ? 'heavy' : 'medium',
                  isManual: false,
                });
              }
            };

            checkAndAdd(words[i]);
            checkAndAdd(words[j]);
          }
        }
      }
    }
  });

  return schemes;
}

// Determine accent level based on pronunciation emphasis
export function determineAccentLevel(word: string, context: string): AccentLevel {
  // Simple heuristic: longer words or words at end of lines are heavier
  const syllables = countSyllables(word);

  if (syllables >= 3) return 'heavy';
  if (syllables === 2) return 'medium';
  return 'normal';
}
