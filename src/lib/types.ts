// Rhyme scheme types
export type RhymeSchemeColor = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H';
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
