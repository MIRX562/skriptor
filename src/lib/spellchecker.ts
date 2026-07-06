import nspell, { Spellchecker } from "nspell";

export interface WordToken {
  word: string;
  start: number; // Start index in the original text
  end: number;   // End index in the original text
}

export interface MisspelledWord extends WordToken {
  suggestions: string[];
}

// In-memory cache for spellchecker instances
const spellcheckersCache: Record<string, Spellchecker | null> = {};

// Map language codes from Whisper to dictionary names
export function mapLanguageCode(lang: string): string {
  const code = lang.toLowerCase().split("-")[0]; // e.g. 'en-US' -> 'en', 'zh-TW' -> 'zh'
  
  // Custom mappings if needed
  if (code === "default" || code === "auto") return "en";
  
  // Supported Hunspell language dictionary codes on jsDelivr
  const supportedLangs = [
    "en", "id", "es", "fr", "de", "it", "pt", "ru", "nl", "pl", "uk", "tr", 
    "sv", "cs", "hu", "el", "bg", "sr", "da", "fi", "sk", "he", "ro", "hr",
    "is", "no", "et", "lt", "lv", "vi"
  ];
  
  if (supportedLangs.includes(code)) {
    return code;
  }
  
  return "en"; // Default fallback
}

/**
 * Dynamically fetches and loads an nspell spellchecker instance for the given language.
 */
export async function getSpellchecker(lang: string): Promise<Spellchecker | null> {
  const mappedLang = mapLanguageCode(lang);
  
  // Return cached instance if available
  if (spellcheckersCache[mappedLang] !== undefined) {
    return spellcheckersCache[mappedLang];
  }
  
  try {
    console.log(`[Spellchecker] Loading dictionary for language: ${mappedLang}`);
    
    const affUrl = `https://cdn.jsdelivr.net/npm/dictionary-${mappedLang}/index.aff`;
    const dicUrl = `https://cdn.jsdelivr.net/npm/dictionary-${mappedLang}/index.dic`;
    
    const [affResponse, dicResponse] = await Promise.all([
      fetch(affUrl),
      fetch(dicUrl)
    ]);
    
    if (!affResponse.ok || !dicResponse.ok) {
      throw new Error(`Failed to load dictionary files for ${mappedLang}`);
    }
    
    const affText = await affResponse.text();
    const dicText = await dicResponse.text();
    
    // Create spellchecker
    const spellObj = nspell(affText, dicText);
    spellcheckersCache[mappedLang] = spellObj;
    
    console.log(`[Spellchecker] Dictionary loaded successfully for ${mappedLang}`);
    return spellObj;
  } catch (error) {
    console.error(`[Spellchecker] Failed to load spellchecker for ${lang} (${mappedLang}):`, error);
    spellcheckersCache[mappedLang] = null; // Mark as failed to avoid retrying continuously
    return null;
  }
}

/**
 * Extracts words from text along with their character offsets.
 */
export function extractWords(text: string): WordToken[] {
  const tokens: WordToken[] = [];
  // Matches letters, numbers, hyphens, and apostrophes (unicode aware)
  const regex = /[\p{L}\p{N}'-]+/gu;
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    let word = match[0];
    let start = match.index;
    let end = regex.lastIndex;
    
    // Trim leading/trailing apostrophes or hyphens at word boundaries
    while ((word.startsWith("'") || word.startsWith("-")) && word.length > 0) {
      word = word.slice(1);
      start++;
    }
    while ((word.endsWith("'") || word.endsWith("-")) && word.length > 0) {
      word = word.slice(0, -1);
      end--;
    }
    
    // Skip numeric values, punctuation, empty words
    if (word.length > 1 && isNaN(Number(word))) {
      tokens.push({ word, start, end });
    }
  }
  
  return tokens;
}

/**
 * Checks a piece of text and returns all misspelled words along with their suggestions.
 */
export function checkText(
  text: string, 
  spellchecker: Spellchecker, 
  ignoredWords: Set<string> = new Set(),
  customWords: Set<string> = new Set()
): MisspelledWord[] {
  if (!text || !spellchecker) return [];
  
  const words = extractWords(text);
  const misspelled: MisspelledWord[] = [];
  
  for (const token of words) {
    const lowerWord = token.word.toLowerCase();
    
    // Check against ignored or user custom dictionary first
    if (ignoredWords.has(lowerWord) || customWords.has(lowerWord)) {
      continue;
    }
    
    // Check spelling
    const isCorrect = spellchecker.correct(token.word);
    
    if (!isCorrect) {
      // Fetch suggestions
      const suggestions = spellchecker.suggest(token.word);
      misspelled.push({
        ...token,
        suggestions: suggestions.slice(0, 5) // Limit to 5 suggestions
      });
    }
  }
  
  return misspelled;
}
