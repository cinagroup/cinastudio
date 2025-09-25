"use client";

import { useEffect, useRef } from "react";

import { ChevronDown, ChevronUp, Search, X } from "lucide-react";

import { useConversationSearchStore } from "@/lib/stores/conversation-search";
import { cn } from "@/utils/cn";

export function MessageSearchPanel() {
  const { isOpen, query, matches, activeIndex, setQuery, selectNext, selectPrevious, close } =
    useConversationSearchStore((state) => ({
      isOpen: state.isOpen,
      query: state.query,
      matches: state.matches,
      activeIndex: state.activeIndex,
      setQuery: state.setQuery,
      selectNext: state.selectNext,
      selectPrevious: state.selectPrevious,
      close: state.close,
    }));

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const schedule: (callback: FrameRequestCallback) => number =
      typeof window !== "undefined" && typeof window.requestAnimationFrame === "function"
        ? window.requestAnimationFrame.bind(window)
        : (callback) => window.setTimeout(callback, 0);
    const cancel =
      typeof window !== "undefined" && typeof window.cancelAnimationFrame === "function"
        ? window.cancelAnimationFrame.bind(window)
        : window.clearTimeout.bind(window);

    const frame = schedule(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
    return () => {
      cancel(frame);
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const hasMatches = matches.length > 0;
  const counterLabel = hasMatches ? `${activeIndex + 1} / ${matches.length}` : "0 / 0";

  return (
    <div className="pointer-events-auto flex min-w-[260px] flex-wrap items-center gap-2 rounded-lg border border-white/10 bg-slate-900/90 px-3 py-2 text-sm shadow-xl backdrop-blur">
      <Search className="h-4 w-4 text-slate-400" aria-hidden />
      <input
        ref={inputRef}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="搜索对话"
        className="flex-1 bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            if (event.shiftKey) {
              selectPrevious();
            } else {
              selectNext();
            }
          }
          if (event.key === "Escape") {
            event.preventDefault();
            close();
          }
        }}
      />
      <span className="text-xs text-slate-400">{counterLabel}</span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={selectPrevious}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-md border border-white/10 text-slate-200 transition disabled:cursor-not-allowed disabled:opacity-50",
            hasMatches && "hover:border-primary/60 hover:text-primary",
          )}
          aria-label="上一条匹配"
          disabled={!hasMatches}
        >
          <ChevronUp className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={selectNext}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-md border border-white/10 text-slate-200 transition disabled:cursor-not-allowed disabled:opacity-50",
            hasMatches && "hover:border-primary/60 hover:text-primary",
          )}
          aria-label="下一条匹配"
          disabled={!hasMatches}
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>
      <button
        type="button"
        onClick={close}
        className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 text-slate-200 transition hover:border-red-400/60 hover:text-red-200"
        aria-label="关闭搜索"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
