// Rhyme scheme types
export type RhymeSchemeColor = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M' | 'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T' | 'U' | 'V' | 'W' | 'X';
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

// Color mapping for rhyme schemes
export const RHYME_COLORS: Record<RhymeSchemeColor, string> = {
  A: 'var(--rhyme-a)',
  B: 'var(--rhyme-b)',
  C: 'var(--rhyme-c)',
  D: 'var(--rhyme-d)',
  E: 'var(--rhyme-e)',
  F: 'var(--rhyme-f)',
  G: 'var(--rhyme-g)',
  H: 'var(--rhyme-h)',
  I: '#f59e0b', // amber
  J: '#84cc16', // lime
  K: '#0ea5e9', // sky
  L: '#d946ef', // fuchsia
  M: '#f43f5e', // rose
  N: '#6366f1', // indigo
  O: '#10b981', // emerald
  P: '#ea580c', // orange
  Q: '#8b5cf6', // violet
  R: '#06b6d4', // cyan
  S: '#ec4899', // pink
  T: '#14b8a6', // teal
  U: '#eab308', // yellow
  V: '#dc2626', // red
  W: '#2563eb', // blue
  X: '#16a34a', // green
};

export const RHYME_BG_COLORS: Record<RhymeSchemeColor, string> = {
  A: 'bg-rhyme-a/20',
  B: 'bg-rhyme-b/20',
  C: 'bg-rhyme-c/20',
  D: 'bg-rhyme-d/20',
  E: 'bg-rhyme-e/20',
  F: 'bg-rhyme-f/20',
  G: 'bg-rhyme-g/20',
  H: 'bg-rhyme-h/20',
  I: 'bg-amber-500/20',
  J: 'bg-lime-500/20',
  K: 'bg-sky-500/20',
  L: 'bg-fuchsia-500/20',
  M: 'bg-rose-500/20',
  N: 'bg-indigo-500/20',
  O: 'bg-emerald-500/20',
  P: 'bg-orange-600/20',
  Q: 'bg-violet-500/20',
  R: 'bg-cyan-500/20',
  S: 'bg-pink-500/20',
  T: 'bg-teal-500/20',
  U: 'bg-yellow-500/20',
  V: 'bg-red-600/20',
  W: 'bg-blue-600/20',
  X: 'bg-green-600/20',
};

export const RHYME_TEXT_COLORS: Record<RhymeSchemeColor, string> = {
  A: 'text-rhyme-a',
  B: 'text-rhyme-b',
  C: 'text-rhyme-c',
  D: 'text-rhyme-d',
  E: 'text-rhyme-e',
  F: 'text-rhyme-f',
  G: 'text-rhyme-g',
  H: 'text-rhyme-h',
  I: 'text-amber-400',
  J: 'text-lime-400',
  K: 'text-sky-400',
  L: 'text-fuchsia-400',
  M: 'text-rose-400',
  N: 'text-indigo-400',
  O: 'text-emerald-400',
  P: 'text-orange-400',
  Q: 'text-violet-400',
  R: 'text-cyan-400',
  S: 'text-pink-400',
  T: 'text-teal-400',
  U: 'text-yellow-400',
  V: 'text-red-400',
  W: 'text-blue-400',
  X: 'text-green-400',
};

export const ACCENT_OPACITY: Record<AccentLevel, number> = {
  normal: 0.4,
  medium: 0.7,
  heavy: 1,
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
