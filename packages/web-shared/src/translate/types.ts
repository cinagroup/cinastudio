export interface TranslateLanguage {
  id: string;
  label: string;
  locale: string;
  emoji?: string;
  description?: string;
}

export interface TranslateQuickPhrase {
  id: string;
  label: string;
  content: string;
}

export interface TranslateHistoryEntry {
  id: string;
  sourceText: string;
  translatedText: string;
  sourceLanguageId: string;
  targetLanguageId: string;
  createdAt: string;
}

export interface TranslatePreferences {
  autoDetect: boolean;
  autoCopy: boolean;
  historyLimit: number;
}

export interface TranslateSeed {
  languages: TranslateLanguage[];
  quickPhrases: TranslateQuickPhrase[];
  history: TranslateHistoryEntry[];
  preferences: TranslatePreferences;
}
