import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  RhymeWord,
  RhymeSchemeColor,
  AccentLevel,
  RhymeSuggestion,
  ArtistLyric
} from '@/lib/types';
import { detectRhymeSchemes } from '@/lib/rhyme-utils';
import { fetchRhymes, searchLyricsForWord, searchGeniusSongs } from '@/lib/api';

interface AppState {
  // Active tab
  activeTab: 'writer' | 'copycat';
  setActiveTab: (tab: 'writer' | 'copycat') => void;

  // Lyrics Writer State
  lyrics: string;
  setLyrics: (lyrics: string) => void;
  rhymeWords: RhymeWord[];
  setRhymeWords: (words: RhymeWord[]) => void;
  addRhymeWord: (word: RhymeWord) => void;
  removeRhymeWord: (startIndex: number) => void;
  updateRhymeWord: (startIndex: number, updates: Partial<RhymeWord>) => void;
  clearRhymeWords: () => void;

  // Scheme selection
  selectedScheme: RhymeSchemeColor;
  setSelectedScheme: (scheme: RhymeSchemeColor) => void;
  accentLevel: AccentLevel;
  setAccentLevel: (level: AccentLevel) => void;

  // Auto-highlight
  autoHighlight: boolean;
  setAutoHighlight: (enabled: boolean) => void;
  runAutoHighlight: () => void;

  // Suggestions
  suggestions: RhymeSuggestion[];
  setSuggestions: (suggestions: RhymeSuggestion[]) => void;
  isLoadingSuggestions: boolean;
  setIsLoadingSuggestions: (loading: boolean) => void;
  selectedWord: string | null;
  setSelectedWord: (word: string | null) => void;
  fetchSuggestionsForWord: (word: string) => Promise<void>;

  // Copycat State
  copycatSearchWord: string;
  setCopycatSearchWord: (word: string) => void;
  copycatArtist: string;
  setCopycatArtist: (artist: string) => void;
  copycatResults: ArtistLyric[];
  setCopycatResults: (results: ArtistLyric[]) => void;
  isCopycatLoading: boolean;
  setIsCopycatLoading: (loading: boolean) => void;
  copycatError: string | null;
  setCopycatError: (error: string | null) => void;
  searchCopycat: () => Promise<void>;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Active tab
      activeTab: 'writer',
      setActiveTab: (tab) => set({ activeTab: tab }),

      // Lyrics Writer State
      lyrics: '',
      setLyrics: (lyrics) => {
        set({ lyrics });
        if (get().autoHighlight) {
          get().runAutoHighlight();
        }
      },
      rhymeWords: [],
      setRhymeWords: (rhymeWords) => set({ rhymeWords }),
      addRhymeWord: (word) =>
        set((state) => ({
          rhymeWords: [...state.rhymeWords.filter(w => w.startIndex !== word.startIndex), word],
        })),
      removeRhymeWord: (startIndex) =>
        set((state) => ({
          rhymeWords: state.rhymeWords.filter((w) => w.startIndex !== startIndex),
        })),
      updateRhymeWord: (startIndex, updates) =>
        set((state) => ({
          rhymeWords: state.rhymeWords.map((w) =>
            w.startIndex === startIndex ? { ...w, ...updates } : w
          ),
        })),
      clearRhymeWords: () => set({ rhymeWords: [] }),

      // Scheme selection
      selectedScheme: 'A',
      setSelectedScheme: (selectedScheme) => set({ selectedScheme }),
      accentLevel: 'heavy',
      setAccentLevel: (accentLevel) => set({ accentLevel }),

      // Auto-highlight
      autoHighlight: false,
      setAutoHighlight: (autoHighlight) => {
        set({ autoHighlight });
        if (autoHighlight) {
          get().runAutoHighlight();
        }
      },
      runAutoHighlight: () => {
        const { lyrics, rhymeWords } = get();
        const manualWords = rhymeWords.filter(w => w.isManual);
        const detected = detectRhymeSchemes(lyrics, manualWords);
        set({ rhymeWords: detected });
      },

      // Suggestions
      suggestions: [],
      setSuggestions: (suggestions) => set({ suggestions }),
      isLoadingSuggestions: false,
      setIsLoadingSuggestions: (isLoadingSuggestions) => set({ isLoadingSuggestions }),
      selectedWord: null,
      setSelectedWord: (selectedWord) => set({ selectedWord }),
      fetchSuggestionsForWord: async (word) => {
        set({ isLoadingSuggestions: true, selectedWord: word });
        try {
          const suggestions = await fetchRhymes(word);
          set({ suggestions, isLoadingSuggestions: false });
        } catch {
          set({ suggestions: [], isLoadingSuggestions: false });
        }
      },

      // Copycat State
      copycatSearchWord: '',
      setCopycatSearchWord: (copycatSearchWord) => set({ copycatSearchWord }),
      copycatArtist: 'Kendrick Lamar',
      setCopycatArtist: (copycatArtist) => set({ copycatArtist }),
      copycatResults: [],
      setCopycatResults: (copycatResults) => set({ copycatResults }),
      isCopycatLoading: false,
      setIsCopycatLoading: (isCopycatLoading) => set({ isCopycatLoading }),
      copycatError: null,
      setCopycatError: (copycatError) => set({ copycatError }),
      searchCopycat: async () => {
        const { copycatSearchWord, copycatArtist } = get();
        if (!copycatSearchWord.trim()) {
          set({ copycatError: 'Please enter a word to search' });
          return;
        }

        set({ isCopycatLoading: true, copycatError: null, copycatResults: [] });

        try {
          // Get popular songs for the artist
          const songs = await searchGeniusSongs(copycatArtist, '');

          if (songs.length === 0) {
            set({
              copycatError: `No songs found for ${copycatArtist}. Try a different artist.`,
              isCopycatLoading: false
            });
            return;
          }

          // Search through each song's lyrics
          const results = await searchLyricsForWord(copycatArtist, copycatSearchWord, songs);

          if (results.length === 0) {
            set({
              copycatError: `No bars found containing "${copycatSearchWord}" from ${copycatArtist}`,
              isCopycatLoading: false
            });
            return;
          }

          set({ copycatResults: results, isCopycatLoading: false });
        } catch (error) {
          set({
            copycatError: 'Failed to search lyrics. Please try again.',
            isCopycatLoading: false
          });
        }
      },
    }),
    {
      name: 'dictone-storage',
      partialize: (state) => ({
        lyrics: state.lyrics,
        rhymeWords: state.rhymeWords,
        autoHighlight: state.autoHighlight,
        copycatArtist: state.copycatArtist,
      }),
    }
  )
);
