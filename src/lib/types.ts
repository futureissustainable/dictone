// Rhyme scheme types - 24 distinct schemes (8 colors × 3 underline styles)
export type RhymeSchemeColor =
  | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H'
  | 'I' | 'J' | 'K' | 'L' | 'M' | 'N' | 'O' | 'P'
  | 'Q' | 'R' | 'S' | 'T' | 'U' | 'V' | 'W' | 'X';
export type AccentLevel = 'normal' | 'medium' | 'heavy';

export interface RhymeWord {
  word: string;
  startIndex: number;
  endIndex: number;
  lineIndex: number;
  scheme: RhymeSchemeColor;
  accentLevel: AccentLevel;
  isManual?: boolean;
}

export interface RhymeSuggestion {
  word: string;
  score: number;
  numSyllables?: number;
  tags?: string[];
}

export interface Line {
  text: string;
  index: number;
  words: LineWord[];
}

export interface LineWord {
  word: string;
  startIndex: number;
  endIndex: number;
  phonemes?: string[];
  syllables?: number;
}

// Datamuse API response types
export interface DatamuseWord {
  word: string;
  score?: number;
  numSyllables?: number;
  tags?: string[];
}

// Copycat feature types
export interface ArtistLyric {
  artist: string;
  song: string;
  line: string;
  matchedWord: string;
  popularity?: number;
}

export interface LyricsSearchResult {
  artist: string;
  songs: SongLyric[];
}

export interface SongLyric {
  title: string;
  lyrics: string;
  matchingLines: string[];
}

// Store types
export interface LyricsState {
  lyrics: string;
  rhymeWords: RhymeWord[];
  selectedScheme: RhymeSchemeColor;
  accentLevel: AccentLevel;
  autoHighlight: boolean;
  suggestions: RhymeSuggestion[];
  isLoadingSuggestions: boolean;
}

export interface CopycatState {
  searchWord: string;
  selectedArtist: string;
  results: ArtistLyric[];
  isLoading: boolean;
  error: string | null;
}

// Color mapping for rhyme schemes - 8 colors × 3 styles = 24 schemes
// A-H: solid underline, I-P: dashed underline, Q-X: striped pattern
export const RHYME_COLORS: Record<RhymeSchemeColor, string> = {
  A: 'var(--rhyme-a)', B: 'var(--rhyme-b)', C: 'var(--rhyme-c)', D: 'var(--rhyme-d)',
  E: 'var(--rhyme-e)', F: 'var(--rhyme-f)', G: 'var(--rhyme-g)', H: 'var(--rhyme-h)',
  // I-P use same colors as A-H but with dashed underline
  I: 'var(--rhyme-a)', J: 'var(--rhyme-b)', K: 'var(--rhyme-c)', L: 'var(--rhyme-d)',
  M: 'var(--rhyme-e)', N: 'var(--rhyme-f)', O: 'var(--rhyme-g)', P: 'var(--rhyme-h)',
  // Q-X use same colors as A-H but with striped pattern
  Q: 'var(--rhyme-a)', R: 'var(--rhyme-b)', S: 'var(--rhyme-c)', T: 'var(--rhyme-d)',
  U: 'var(--rhyme-e)', V: 'var(--rhyme-f)', W: 'var(--rhyme-g)', X: 'var(--rhyme-h)',
};

export const RHYME_BG_COLORS: Record<RhymeSchemeColor, string> = {
  A: 'bg-rhyme-a/20', B: 'bg-rhyme-b/20', C: 'bg-rhyme-c/20', D: 'bg-rhyme-d/20',
  E: 'bg-rhyme-e/20', F: 'bg-rhyme-f/20', G: 'bg-rhyme-g/20', H: 'bg-rhyme-h/20',
  I: 'bg-rhyme-a/20', J: 'bg-rhyme-b/20', K: 'bg-rhyme-c/20', L: 'bg-rhyme-d/20',
  M: 'bg-rhyme-e/20', N: 'bg-rhyme-f/20', O: 'bg-rhyme-g/20', P: 'bg-rhyme-h/20',
  Q: 'bg-rhyme-a/20', R: 'bg-rhyme-b/20', S: 'bg-rhyme-c/20', T: 'bg-rhyme-d/20',
  U: 'bg-rhyme-e/20', V: 'bg-rhyme-f/20', W: 'bg-rhyme-g/20', X: 'bg-rhyme-h/20',
};

export const RHYME_TEXT_COLORS: Record<RhymeSchemeColor, string> = {
  A: 'text-rhyme-a', B: 'text-rhyme-b', C: 'text-rhyme-c', D: 'text-rhyme-d',
  E: 'text-rhyme-e', F: 'text-rhyme-f', G: 'text-rhyme-g', H: 'text-rhyme-h',
  I: 'text-rhyme-a', J: 'text-rhyme-b', K: 'text-rhyme-c', L: 'text-rhyme-d',
  M: 'text-rhyme-e', N: 'text-rhyme-f', O: 'text-rhyme-g', P: 'text-rhyme-h',
  Q: 'text-rhyme-a', R: 'text-rhyme-b', S: 'text-rhyme-c', T: 'text-rhyme-d',
  U: 'text-rhyme-e', V: 'text-rhyme-f', W: 'text-rhyme-g', X: 'text-rhyme-h',
};

// Opacity ranges from 0.1 (weakest) to 1.0 (perfect rhyme)
export const ACCENT_OPACITY: Record<AccentLevel, number> = {
  normal: 0.3,
  medium: 0.6,
  heavy: 1,
};

// Distance-based opacity multiplier for rhymes
// Based on typical lyrical structures (couplets, alternates, verse lengths)
// Note: distance should be calculated excluding empty lines (verse separators)
export function getDistanceOpacity(lineDistance: number): number {
  if (lineDistance <= 2) return 1.0;      // Same line, couplet, alternate - full opacity
  if (lineDistance === 3) return 0.9;     // Extended patterns (ABCABC)
  if (lineDistance === 4) return 0.8;     // End of typical 4-bar pattern
  if (lineDistance === 5) return 0.65;    // Stretching it
  if (lineDistance === 6) return 0.5;     // Verse boundary territory
  if (lineDistance === 7) return 0.35;    // Likely across verses
  if (lineDistance === 8) return 0.2;     // Distant callback
  return 0;                                // 9+ lines - too far, hide it
}

// Calculate line distance excluding empty lines (verse separators don't count)
export function getContentLineDistance(
  lyrics: string,
  lineIndex1: number,
  lineIndex2: number
): number {
  const lines = lyrics.split('\n');
  const minLine = Math.min(lineIndex1, lineIndex2);
  const maxLine = Math.max(lineIndex1, lineIndex2);

  let emptyLinesBetween = 0;
  for (let i = minLine + 1; i < maxLine; i++) {
    if (lines[i]?.trim() === '') {
      emptyLinesBetween++;
    }
  }

  return (maxLine - minLine) - emptyLinesBetween;
}

// Underline styles for schemes - A-H solid, I-P dashed, Q-X striped (dotted as CSS equivalent)
export type UnderlineStyle = 'solid' | 'dashed' | 'dotted';

export const RHYME_UNDERLINE_STYLES: Record<RhymeSchemeColor, UnderlineStyle> = {
  A: 'solid', B: 'solid', C: 'solid', D: 'solid',
  E: 'solid', F: 'solid', G: 'solid', H: 'solid',
  I: 'dashed', J: 'dashed', K: 'dashed', L: 'dashed',
  M: 'dashed', N: 'dashed', O: 'dashed', P: 'dashed',
  Q: 'dotted', R: 'dotted', S: 'dotted', T: 'dotted',
  U: 'dotted', V: 'dotted', W: 'dotted', X: 'dotted',
};

// Popular artists for copycat feature
export const POPULAR_ARTISTS = [
  'Kendrick Lamar',
  'J. Cole',
  'Drake',
  'Eminem',
  'Jay-Z',
  'Nas',
  'Kanye West',
  'Lil Wayne',
  'Tyler, The Creator',
  'MF DOOM',
  'Andre 3000',
  'Pusha T',
  'Joey Badass',
  'Denzel Curry',
  'JID',
] as const;

export type PopularArtist = (typeof POPULAR_ARTISTS)[number];
