import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  TRANSLATE_STORAGE_KEY,
  TRANSLATE_STORAGE_VERSION,
  buildTranslateState,
  type TranslateHistoryEntry,
  type TranslateLanguage,
  type TranslatePreferences,
  type TranslateQuickPhrase,
} from "@cinaseek/web-shared/translate";

import { translateText } from "@/lib/translate";
import { createId } from "@/utils/id";

type TranslationError = { message: string } | null;

interface TranslateDataState {
  languages: TranslateLanguage[];
  quickPhrases: TranslateQuickPhrase[];
  history: TranslateHistoryEntry[];
  preferences: TranslatePreferences;
  sourceLanguageId: string;
  targetLanguageId: string;
  text: string;
  translatedText: string;
  isTranslating: boolean;
  error: TranslationError;
}

interface TranslateStore extends TranslateDataState {
  setSourceLanguage: (id: string) => void;
  setTargetLanguage: (id: string) => void;
  swapLanguages: () => void;
  setText: (text: string) => void;
  setTranslatedText: (text: string) => void;
  setPreferences: (preferences: Partial<TranslatePreferences>) => void;
  appendQuickPhrase: (phraseId: string) => string | null;
  translate: (overrideText?: string) => Promise<TranslateHistoryEntry | null>;
  deleteHistoryEntry: (id: string) => void;
  clearHistory: () => void;
  reset: () => void;
}

function buildInitialState(): TranslateDataState {
  const base = buildTranslateState();
  const defaultSource = base.languages.find((language) => language.id === "zh-CN");
  const defaultTarget = base.languages.find((language) => language.id === "en-US");

  const normalizedHistory = base.history.slice(0, base.preferences.historyLimit);

  return {
    languages: base.languages,
    quickPhrases: base.quickPhrases,
    history: normalizedHistory,
    preferences: base.preferences,
    sourceLanguageId: defaultSource?.id ?? base.languages[0]?.id ?? "",
    targetLanguageId: defaultTarget?.id ?? base.languages[1]?.id ?? base.languages[0]?.id ?? "",
    text: "",
    translatedText: "",
    isTranslating: false,
    error: null,
  };
}

const fallbackStorage = createJSONStorage(() => ({
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
}));

export const useTranslateStore = create<TranslateStore>()(
  persist(
    (set, get) => ({
      ...buildInitialState(),
      setSourceLanguage: (id) => {
        if (id === get().sourceLanguageId) {
          return;
        }
        set({ sourceLanguageId: id });
      },
      setTargetLanguage: (id) => {
        if (id === get().targetLanguageId) {
          return;
        }
        set({ targetLanguageId: id });
      },
      swapLanguages: () => {
        set((state) => ({
          sourceLanguageId: state.targetLanguageId,
          targetLanguageId: state.sourceLanguageId,
          text: state.translatedText || state.text,
          translatedText: state.text,
        }));
      },
      setText: (text) => {
        set({ text });
      },
      setTranslatedText: (text) => {
        set({ translatedText: text });
      },
      setPreferences: (preferences) => {
        set((state) => {
          const nextPreferences = {
            ...state.preferences,
            ...preferences,
          };

          const trimmedHistory = state.history.slice(0, nextPreferences.historyLimit);

          return {
            preferences: nextPreferences,
            history: trimmedHistory,
          };
        });
      },
      appendQuickPhrase: (phraseId) => {
        const phrase = get().quickPhrases.find((item) => item.id === phraseId);
        if (!phrase) {
          return null;
        }
        set((state) => ({
          text: `${state.text ? `${state.text}\n` : ""}${phrase.content}`,
        }));
        return phrase.content;
      },
      translate: async (overrideText) => {
        const state = get();
        const input = (overrideText ?? state.text).trim();

        if (!input) {
          return null;
        }

        set({ isTranslating: true, error: null });

        try {
          const result = await translateText({
            text: input,
            sourceLanguageId: state.preferences.autoDetect ? "auto" : state.sourceLanguageId,
            targetLanguageId: state.targetLanguageId,
          });

          const entry: TranslateHistoryEntry = {
            id: createId("history"),
            sourceText: input,
            translatedText: result.translation,
            sourceLanguageId: result.detectedSourceLanguageId ?? state.sourceLanguageId,
            targetLanguageId: state.targetLanguageId,
            createdAt: new Date().toISOString(),
          };

          set((current) => {
            const history = [entry, ...current.history].slice(0, current.preferences.historyLimit);
            return {
              translatedText: result.translation,
              history,
              isTranslating: false,
              text: current.text,
            };
          });

          return entry;
        } catch (error) {
          const message = error instanceof Error ? error.message : "翻译失败";
          set({ isTranslating: false, error: { message } });
          throw error;
        }
      },
      deleteHistoryEntry: (id) => {
        set((state) => ({
          history: state.history.filter((entry) => entry.id !== id),
        }));
      },
      clearHistory: () => {
        set({ history: [] });
      },
      reset: () => {
        set(buildInitialState());
      },
    }),
    {
      name: TRANSLATE_STORAGE_KEY,
      version: TRANSLATE_STORAGE_VERSION,
      storage:
        typeof window !== "undefined"
          ? createJSONStorage(() => window.localStorage)
          : fallbackStorage,
      partialize: (state) => ({
        languages: state.languages,
        quickPhrases: state.quickPhrases,
        history: state.history,
        preferences: state.preferences,
        sourceLanguageId: state.sourceLanguageId,
        targetLanguageId: state.targetLanguageId,
      }),
      migrate: (persisted, version) => {
        if (!persisted || version === TRANSLATE_STORAGE_VERSION) {
          return persisted as TranslateStore;
        }

        const rebuilt = buildInitialState();
        return {
          ...rebuilt,
          setSourceLanguage: () => undefined,
          setTargetLanguage: () => undefined,
          swapLanguages: () => undefined,
          setText: () => undefined,
          setTranslatedText: () => undefined,
          setPreferences: () => undefined,
          appendQuickPhrase: () => null,
          translate: async () => null,
          deleteHistoryEntry: () => undefined,
          clearHistory: () => undefined,
          reset: () => undefined,
        } as TranslateStore;
      },
    },
  ),
);

export function resetTranslateStore() {
  useTranslateStore.getState().reset();
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(TRANSLATE_STORAGE_KEY);
    } catch (error) {
      console.warn("Failed to clear persisted translate state", error);
    }
  }
}
