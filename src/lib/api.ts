import type { DatamuseWord, RhymeSuggestion, ArtistLyric } from './types';

const DATAMUSE_API = 'https://api.datamuse.com';

// Fetch rhymes from Datamuse API
export async function fetchRhymes(word: string, maxResults = 50): Promise<RhymeSuggestion[]> {
  try {
    // Get perfect rhymes
    const rhymeResponse = await fetch(
      `${DATAMUSE_API}/words?rel_rhy=${encodeURIComponent(word)}&max=${maxResults}&md=s`
    );
    const rhymes: DatamuseWord[] = await rhymeResponse.json();

    // Get near rhymes (sounds like)
    const nearRhymeResponse = await fetch(
      `${DATAMUSE_API}/words?rel_nry=${encodeURIComponent(word)}&max=${Math.floor(maxResults / 2)}&md=s`
    );
    const nearRhymes: DatamuseWord[] = await nearRhymeResponse.json();

    // Combine and deduplicate
    const combined = [...rhymes, ...nearRhymes];
    const seen = new Set<string>();
    const unique: RhymeSuggestion[] = [];

    for (const item of combined) {
      if (!seen.has(item.word.toLowerCase())) {
        seen.add(item.word.toLowerCase());
        unique.push({
          word: item.word,
          score: item.score || 0,
          numSyllables: item.numSyllables,
          tags: item.tags,
        });
      }
    }

    // Sort by score
    return unique.sort((a, b) => b.score - a.score);
  } catch (error) {
    console.error('Error fetching rhymes:', error);
    return [];
  }
}

// Fetch words that sound similar (for slant rhymes)
export async function fetchSoundsLike(word: string, maxResults = 30): Promise<RhymeSuggestion[]> {
  try {
    const response = await fetch(
      `${DATAMUSE_API}/words?sl=${encodeURIComponent(word)}&max=${maxResults}&md=s`
    );
    const words: DatamuseWord[] = await response.json();

    return words.map(item => ({
      word: item.word,
      score: item.score || 0,
      numSyllables: item.numSyllables,
      tags: item.tags,
    }));
  } catch (error) {
    console.error('Error fetching sounds-like words:', error);
    return [];
  }
}

// Fetch synonyms for a word
export async function fetchSynonyms(word: string, maxResults = 30): Promise<RhymeSuggestion[]> {
  try {
    const response = await fetch(
      `${DATAMUSE_API}/words?rel_syn=${encodeURIComponent(word)}&max=${maxResults}&md=s`
    );
    const words: DatamuseWord[] = await response.json();

    return words.map(item => ({
      word: item.word,
      score: item.score || 0,
      numSyllables: item.numSyllables,
      tags: item.tags,
    }));
  } catch (error) {
    console.error('Error fetching synonyms:', error);
    return [];
  }
}

// Fetch all rhymes with scores (for modal view)
export async function fetchAllRhymesWithScores(word: string, maxResults = 200): Promise<RhymeSuggestion[]> {
  try {
    const response = await fetch(
      `${DATAMUSE_API}/words?rel_rhy=${encodeURIComponent(word)}&max=${maxResults}&md=s`
    );
    const words: DatamuseWord[] = await response.json();

    return words.map(item => ({
      word: item.word,
      score: item.score || 0,
      numSyllables: item.numSyllables,
      tags: item.tags,
    }));
  } catch (error) {
    console.error('Error fetching all rhymes:', error);
    return [];
  }
}

// Fetch words with similar meaning that also rhyme
export async function fetchRhymesWithMeaning(
  rhymeWord: string,
  meaningWord: string,
  maxResults = 30
): Promise<RhymeSuggestion[]> {
  try {
    const response = await fetch(
      `${DATAMUSE_API}/words?rel_rhy=${encodeURIComponent(rhymeWord)}&ml=${encodeURIComponent(meaningWord)}&max=${maxResults}&md=s`
    );
    const words: DatamuseWord[] = await response.json();

    return words.map(item => ({
      word: item.word,
      score: item.score || 0,
      numSyllables: item.numSyllables,
      tags: item.tags,
    }));
  } catch (error) {
    console.error('Error fetching rhymes with meaning:', error);
    return [];
  }
}

// Fetch words that complete a phrase
export async function fetchCompletions(prefix: string, maxResults = 20): Promise<RhymeSuggestion[]> {
  try {
    const response = await fetch(
      `${DATAMUSE_API}/sug?s=${encodeURIComponent(prefix)}&max=${maxResults}`
    );
    const words: DatamuseWord[] = await response.json();

    return words.map(item => ({
      word: item.word,
      score: item.score || 0,
    }));
  } catch (error) {
    console.error('Error fetching completions:', error);
    return [];
  }
}

// Fetch words by syllable count that rhyme
export async function fetchRhymesBySyllables(
  word: string,
  syllables: number,
  maxResults = 30
): Promise<RhymeSuggestion[]> {
  try {
    const rhymes = await fetchRhymes(word, maxResults * 2);
    return rhymes.filter(r => r.numSyllables === syllables);
  } catch (error) {
    console.error('Error fetching rhymes by syllables:', error);
    return [];
  }
}

// Lyrics.ovh API for COPYCAT feature
const LYRICS_OVH_API = 'https://api.lyrics.ovh/v1';

export async function fetchArtistLyrics(_artist: string): Promise<string | null> {
  // Note: lyrics.ovh requires song name, so we'll use a different approach
  // We'll try to get lyrics for popular songs by the artist
  // This is a simplified approach - in production you'd want to use a more comprehensive API
  return null;
}

export async function fetchSongLyrics(artist: string, song: string): Promise<string | null> {
  try {
    const response = await fetch(
      `${LYRICS_OVH_API}/${encodeURIComponent(artist)}/${encodeURIComponent(song)}`
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.lyrics || null;
  } catch (error) {
    console.error('Error fetching song lyrics:', error);
    return null;
  }
}

// Search for lyrics containing a word
export async function searchLyricsForWord(
  artist: string,
  word: string,
  songs: string[]
): Promise<ArtistLyric[]> {
  const results: ArtistLyric[] = [];
  const wordRegex = new RegExp(`\\b${word}\\b`, 'i');

  for (const song of songs) {
    try {
      const lyrics = await fetchSongLyrics(artist, song);
      if (!lyrics) continue;

      const lines = lyrics.split('\n');
      for (const line of lines) {
        if (wordRegex.test(line)) {
          results.push({
            artist,
            song,
            line: line.trim(),
            matchedWord: word,
          });
        }
      }
    } catch {
      // Skip failed requests
      continue;
    }
  }

  return results;
}

// Alternative: Use Genius API hints (for song discovery)
// Note: Full Genius API requires API key
export async function searchGeniusSongs(artist: string, _query?: string): Promise<string[]> {
  // This would require a Genius API key in production
  // For now, return popular songs for known artists
  const popularSongs: Record<string, string[]> = {
    'kendrick lamar': [
      'HUMBLE', 'DNA', 'Alright', 'Money Trees', 'Swimming Pools',
      'm.A.A.d city', 'King Kunta', 'Bitch, Dont Kill My Vibe',
      'The Recipe', 'Poetic Justice', 'Backseat Freestyle',
      'Not Like Us', 'Euphoria', 'Meet the Grahams'
    ],
    'j. cole': [
      'Middle Child', 'No Role Modelz', 'Power Trip', 'Work Out',
      'Crooked Smile', 'Wet Dreamz', 'Love Yourz', 'ATM',
      'GOMD', 'Neighbors', 'She Knows'
    ],
    'drake': [
      'Hotline Bling', 'Gods Plan', 'In My Feelings', 'One Dance',
      'Nice For What', 'Started From the Bottom', 'Hold On Were Going Home',
      'Best I Ever Had', 'Nonstop', 'Laugh Now Cry Later'
    ],
    'eminem': [
      'Lose Yourself', 'Not Afraid', 'Love The Way You Lie', 'Stan',
      'Without Me', 'The Real Slim Shady', 'Mockingbird', 'Rap God',
      'Cleaning Out My Closet', 'Till I Collapse'
    ],
    'jay-z': [
      '99 Problems', 'Empire State of Mind', 'Dirt Off Your Shoulder',
      'Run This Town', 'Hard Knock Life', 'Big Pimpin',
      'Izzo (H.O.V.A.)', 'Encore', 'The Story of O.J.'
    ],
    'nas': [
      'N.Y. State of Mind', 'One Mic', 'If I Ruled the World',
      'The World Is Yours', 'Made You Look', 'Hate Me Now',
      'I Can', 'It Aint Hard to Tell', 'Life is Good'
    ],
    'kanye west': [
      'Stronger', 'Gold Digger', 'Heartless', 'All of the Lights',
      'Runaway', 'Power', 'Jesus Walks', 'Through the Wire',
      'All Falls Down', 'Father Stretch My Hands'
    ],
    'lil wayne': [
      'Lollipop', 'A Milli', '6 Foot 7 Foot', 'How To Love',
      'Mirror', 'Go DJ', 'Mrs. Officer', 'Fireman',
      'Drop the World', 'Right Above It'
    ],
    'tyler, the creator': [
      'EARFQUAKE', 'See You Again', 'Yonkers', 'IFHY',
      'NEW MAGIC WAND', 'Who Dat Boy', 'Tamale',
      'Answer', 'WUSYANAME', 'LEMONHEAD'
    ],
    'mf doom': [
      'Doomsday', 'Rapp Snitch Knishes', 'Accordion', 'All Caps',
      'Beef Rapp', 'Rhinestone Cowboy', 'One Beer',
      'Fazers', 'Raid', 'Hoe Cakes'
    ],
  };

  const artistLower = artist.toLowerCase();
  return popularSongs[artistLower] || [];
}
