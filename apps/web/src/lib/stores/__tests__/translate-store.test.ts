import { act } from "@testing-library/react";

import { translateSeed } from "@cinaseek/web-shared/translate";

import { resetTranslateStore, useTranslateStore } from "../translate";

type MockResponse = {
  data: {
    translation: string;
    detectedSourceLanguageId?: string;
  };
};

const mockPost = jest.fn<Promise<MockResponse>, any>();

jest.mock("@/lib/api-client", () => ({
  apiClient: {
    post: (...args: unknown[]) => mockPost(...(args as Parameters<typeof mockPost>)),
  },
}));

describe("translate store", () => {
  beforeEach(() => {
    mockPost.mockResolvedValue({
      data: { translation: "translated", detectedSourceLanguageId: "en-US" },
    });
    resetTranslateStore();
  });

  it("initializes languages and preferences from the seed", () => {
    const state = useTranslateStore.getState();
    expect(state.languages).toHaveLength(translateSeed.languages.length);
    expect(state.preferences.historyLimit).toBe(translateSeed.preferences.historyLimit);
  });

  it("performs translation and records history", async () => {
    const text = "你好";

    await act(async () => {
      await useTranslateStore.getState().translate(text);
    });

    const state = useTranslateStore.getState();
    expect(mockPost).toHaveBeenCalled();
    expect(state.translatedText).toBe("translated");
    expect(state.history[0]?.sourceText).toBe(text);
  });

  it("swaps languages and preserves text", () => {
    const store = useTranslateStore.getState();
    act(() => {
      store.setText("hello");
      store.setTranslatedText("你好");
      store.swapLanguages();
    });

    const next = useTranslateStore.getState();
    expect(next.sourceLanguageId).toBe(store.targetLanguageId);
    expect(next.targetLanguageId).toBe(store.sourceLanguageId);
    expect(next.text).toBe("你好");
  });

  it("trims history when preference limit changes", async () => {
    mockPost.mockResolvedValue({ data: { translation: "one" } });

    await act(async () => {
      await useTranslateStore.getState().translate("first");
      await useTranslateStore.getState().translate("second");
    });

    act(() => {
      useTranslateStore.getState().setPreferences({ historyLimit: 1 });
    });

    expect(useTranslateStore.getState().history).toHaveLength(1);
  });
});
