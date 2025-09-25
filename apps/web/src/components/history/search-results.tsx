"use client";

import { Loader2 } from "lucide-react";

import { formatDate, formatTimeOfDay } from "@/utils/datetime";
import type { HistorySearchResult } from "@/lib/history/search";
import { highlightTerms } from "@/lib/history/search";

interface SearchResultsProps {
  results: HistorySearchResult[];
  terms: string[];
  durationMs: number;
  isLoading: boolean;
  onSelectTopic: (topicId: string) => void;
  onSelectMessage: (result: HistorySearchResult) => void;
}

export function SearchResults({
  results,
  terms,
  durationMs,
  isLoading,
  onSelectTopic,
  onSelectMessage,
}: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
      </div>
    );
  }

  const hasResults = results.length > 0;

  return (
    <div className="flex h-full flex-1 flex-col">
      <header className="border-b border-white/5 px-6 py-4">
        <p className="text-sm font-semibold text-slate-100">搜索结果</p>
        <p className="text-xs text-slate-400">
          {hasResults
            ? `找到 ${results.length} 条记录，用时 ${(durationMs / 1000).toFixed(3)} 秒`
            : "输入关键字以检索历史消息"}
        </p>
      </header>
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {hasResults ? (
          <ul className="space-y-4">
            {results.map((result) => (
              <li
                key={`${result.topic.id}-${result.message.id}`}
                className="rounded-xl border border-white/5 bg-white/5 p-4"
              >
                <button
                  type="button"
                  onClick={() => onSelectTopic(result.topic.id)}
                  className="text-sm font-semibold text-primary transition hover:underline"
                >
                  {result.topic.title}
                </button>
                <div
                  className="mt-3 cursor-pointer text-sm text-slate-100"
                  onClick={() => onSelectMessage(result)}
                  dangerouslySetInnerHTML={{
                    __html: highlightTerms(result.message.content, terms),
                  }}
                />
                <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                  <span>{result.assistant?.name ?? "未知助手"}</span>
                  <span>
                    {formatDate(result.message.createdAt)} · {formatTimeOfDay(result.message.createdAt)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-slate-400">
            <p className="text-sm">尚未检索到消息。</p>
            <p className="text-xs">尝试输入更具体的关键词或切换其他话题。</p>
          </div>
        )}
      </div>
    </div>
  );
}
