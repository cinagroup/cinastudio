"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  ArrowRightLeft,
  ClipboardCheck,
  ClipboardCopy,
  History,
  Loader2,
  Sparkles,
  Wand2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTranslateStore } from "@/lib/stores/translate";
import { cn } from "@/utils/cn";

import { LanguageSelect } from "./language-select";

type CopyStatus = "idle" | "success" | "error";

export function TranslateView() {
  const {
    languages,
    quickPhrases,
    history,
    preferences,
    sourceLanguageId,
    targetLanguageId,
    text,
    translatedText,
    isTranslating,
    error,
    setSourceLanguage,
    setTargetLanguage,
    swapLanguages,
    setText,
    translate,
    appendQuickPhrase,
    setPreferences,
    deleteHistoryEntry,
    clearHistory,
  } = useTranslateStore();
  const [copyStatus, setCopyStatus] = useState<CopyStatus>("idle");

  const sourceLanguage = useMemo(
    () => languages.find((item) => item.id === sourceLanguageId),
    [languages, sourceLanguageId],
  );
  const targetLanguage = useMemo(
    () => languages.find((item) => item.id === targetLanguageId),
    [languages, targetLanguageId],
  );

  useEffect(() => {
    if (!preferences.autoCopy || !translatedText) {
      return;
    }

    async function autoCopy() {
      try {
        await navigator.clipboard?.writeText(translatedText);
        setCopyStatus("success");
      } catch (copyError) {
        console.warn("Failed to auto copy translation", copyError);
        setCopyStatus("error");
      }
    }

    void autoCopy();
  }, [translatedText, preferences.autoCopy]);

  const handleCopy = useCallback(async () => {
    if (!translatedText) {
      return;
    }

    try {
      await navigator.clipboard?.writeText(translatedText);
      setCopyStatus("success");
    } catch (copyError) {
      console.warn("Clipboard copy failed", copyError);
      setCopyStatus("error");
    }
  }, [translatedText]);

  const handleTranslate = useCallback(async () => {
    try {
      await translate();
      setCopyStatus("idle");
    } catch (translateError) {
      console.error("translate failed", translateError);
    }
  }, [translate]);

  const copyIndicator = copyStatus === "success" ? "已复制" : copyStatus === "error" ? "复制失败" : "复制译文";

  return (
    <div className="flex h-full flex-col gap-8 overflow-y-auto px-4 py-8 sm:px-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-primary/70">Translate</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-50">翻译与润色工作台</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-300">
            将 Electron 时代的翻译流程迁移到 Web，支持自动语言检测、快速短语插入与历史记录回放。
          </p>
        </div>
        <div className="flex gap-3 text-xs text-slate-300">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={preferences.autoDetect}
              onChange={(event) => setPreferences({ autoDetect: event.target.checked })}
              className="h-4 w-4 rounded border-white/20 bg-slate-900 text-primary focus:ring-primary/40"
            />
            自动检测源语言
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={preferences.autoCopy}
              onChange={(event) => setPreferences({ autoCopy: event.target.checked })}
              className="h-4 w-4 rounded border-white/20 bg-slate-900 text-primary focus:ring-primary/40"
            />
            自动复制译文
          </label>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-slate-900/60 p-6 shadow-lg">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
            <LanguageSelect
              id="translate-source"
              label={preferences.autoDetect ? "源语言（自动检测）" : "源语言"}
              value={sourceLanguageId}
              languages={languages}
              onChange={(event) => setSourceLanguage(event.target.value)}
            />
            <Button
              type="button"
              variant="ghost"
              onClick={swapLanguages}
              className="mt-2 inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs uppercase tracking-wide text-slate-200 hover:bg-white/10"
              aria-label="交换语言"
            >
              <ArrowRightLeft className="h-4 w-4" />
            </Button>
            <LanguageSelect
              id="translate-target"
              label="目标语言"
              value={targetLanguageId}
              languages={languages}
              onChange={(event) => setTargetLanguage(event.target.value)}
            />
          </div>
          <textarea
            value={text}
            placeholder={sourceLanguage?.description ?? "输入需要翻译的内容"}
            onChange={(event) => setText(event.target.value)}
            className="min-h-[240px] w-full resize-y rounded-xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-slate-50 shadow-inner focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <div className="flex flex-wrap gap-2">
            {quickPhrases.map((phrase) => (
              <button
                key={phrase.id}
                type="button"
                className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary transition hover:bg-primary/20"
                onClick={() => appendQuickPhrase(phrase.id)}
              >
                <Wand2 className="mr-1 inline h-3.5 w-3.5" />
                {phrase.label}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">支持 Markdown 渲染与实时复制</p>
            <Button type="button" onClick={handleTranslate} disabled={isTranslating || !text.trim()}>
              {isTranslating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {isTranslating ? "翻译中" : "开始翻译"}
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-900/60 p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-primary/70">译文</p>
                <h2 className="text-lg font-semibold text-slate-50">{targetLanguage?.label ?? "译文输出"}</h2>
              </div>
              <Button type="button" variant="ghost" onClick={handleCopy} disabled={!translatedText}>
                {copyStatus === "success" ? <ClipboardCheck className="h-4 w-4" /> : <ClipboardCopy className="h-4 w-4" />}
                {copyIndicator}
              </Button>
            </div>
            <div
              className={cn(
                "min-h-[240px] whitespace-pre-wrap rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm leading-relaxed text-slate-50",
                translatedText ? "shadow-inner" : "text-slate-400",
              )}
            >
              {translatedText || "翻译结果会显示在这里"}
            </div>
            {error ? (
              <p className="text-xs text-red-400">{error.message}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-slate-900/40 p-6 shadow-lg">
            <div className="flex items-center justify-between text-sm text-slate-200">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4" />
                <span>翻译历史</span>
              </div>
              {history.length ? (
                <button
                  type="button"
                  onClick={clearHistory}
                  className="text-xs text-slate-400 transition hover:text-slate-100"
                >
                  清空历史
                </button>
              ) : null}
            </div>
            <ul className="flex max-h-60 flex-col gap-3 overflow-y-auto pr-1 text-xs">
              {history.length === 0 ? (
                <li className="rounded-lg border border-dashed border-white/10 bg-slate-900/40 px-3 py-4 text-center text-slate-400">
                  还没有翻译记录，尝试翻译一段文本吧。
                </li>
              ) : (
                history.map((entry) => (
                  <li
                    key={entry.id}
                    className="group rounded-xl border border-white/10 bg-slate-950/50 p-3 transition hover:border-primary/40"
                  >
                    <p className="text-slate-100">{entry.sourceText}</p>
                    <p className="mt-2 text-slate-400">{entry.translatedText}</p>
                    <div className="mt-3 flex items-center justify-between text-[10px] uppercase tracking-wide text-slate-500">
                      <span>
                        {entry.sourceLanguageId} → {entry.targetLanguageId}
                      </span>
                      <button
                        type="button"
                        className="text-slate-500 transition hover:text-slate-200"
                        onClick={() => deleteHistoryEntry(entry.id)}
                      >
                        删除
                      </button>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
