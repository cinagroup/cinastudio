"use client";

import { useMemo } from "react";
import { CornerUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatDate, formatTimeOfDay } from "@/utils/datetime";
import type { HistorySearchResult } from "@/lib/history/search";
import { highlightTerms } from "@/lib/history/search";

interface MessagePreviewProps {
  result: HistorySearchResult;
  terms: string[];
  onOpenTopic?: () => void;
}

export function MessagePreview({ result, terms, onOpenTopic }: MessagePreviewProps) {
  const highlighted = useMemo(
    () => highlightTerms(result.message.content, terms),
    [result.message.content, terms],
  );

  return (
    <div className="flex h-full flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-white/5 px-6 py-4">
        <div>
          <p className="text-sm font-semibold text-slate-100">消息详情</p>
          <p className="text-xs text-slate-400">
            {result.topic.title} · {result.assistant?.name ?? "未知助手"}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 text-xs text-slate-200 hover:border-white/20 hover:bg-white/10"
          onClick={onOpenTopic}
        >
          <CornerUpRight className="h-4 w-4" /> 查看话题
        </Button>
      </header>
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <article className="space-y-4 text-sm leading-6 text-slate-100">
          <header className="rounded-xl border border-white/5 bg-white/5 p-4 text-xs text-slate-400">
            <div>发送时间：{formatDate(result.message.createdAt)} {formatTimeOfDay(result.message.createdAt)}</div>
            <div>角色：{result.message.role === "user" ? "我" : result.assistant?.name ?? "助手"}</div>
          </header>
          <div
            className="rounded-xl border border-white/5 bg-white/5 p-5"
            dangerouslySetInnerHTML={{ __html: highlighted }}
          />
        </article>
      </div>
    </div>
  );
}
