import { translateSeed } from "./seed";
import type {
  TranslateHistoryEntry,
  TranslateLanguage,
  TranslatePreferences,
  TranslateQuickPhrase,
  TranslateSeed,
} from "./types";

export const TRANSLATE_STORAGE_KEY = "cinaseek.translate";
export const TRANSLATE_STORAGE_VERSION = 1;

export interface TranslateState {
  languages: TranslateLanguage[];
  preferences: TranslatePreferences;
  history: TranslateHistoryEntry[];
  quickPhrases: TranslateQuickPhrase[];
}

export function buildTranslateState(seed: TranslateSeed = translateSeed): TranslateState {
  return {
    languages: seed.languages,
    preferences: seed.preferences,
    history: seed.history,
    quickPhrases: seed.quickPhrases,
  };
}
