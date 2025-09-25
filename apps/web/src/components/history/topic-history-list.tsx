"use client";

import { useMemo, useState } from "react";
import { Clock, Search } from "lucide-react";

import type { AssistantRecord, Topic } from "@/types";
import { formatDate, formatTimeOfDay } from "@/utils/datetime";
import { cn } from "@/utils/cn";

interface TopicHistoryListProps {
  topics: Topic[];
  assistants: AssistantRecord[];
  keywords: string;
  onSelectTopic: (topicId: string) => void;
  onSearchMessages: () => void;
  isCondensed?: boolean;
}

type SortKey = "createdAt" | "updatedAt";

export function TopicHistoryList({
  topics,
  assistants,
  keywords,
  onSelectTopic,
  onSearchMessages,
  isCondensed = false,
}: TopicHistoryListProps) {
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");

  const assistantMap = useMemo(() => {
    return assistants.reduce<Map<string, AssistantRecord>>((acc, assistant) => {
      acc.set(assistant.id, assistant);
      return acc;
    }, new Map());
  }, [assistants]);

  const filteredTopics = useMemo(() => {
    const query = keywords.trim().toLowerCase();
    return topics.filter((topic) => {
      if (!query) {
        return true;
      }
      const assistant = assistantMap.get(topic.assistantId);
      return (
        topic.title.toLowerCase().includes(query) ||
        assistant?.name.toLowerCase().includes(query)
      );
    });
  }, [assistantMap, keywords, topics]);

  const groupedTopics = useMemo(() => {
    const sorted = [...filteredTopics].sort((a, b) => {
      const left = new Date(b[sortKey]).getTime();
      const right = new Date(a[sortKey]).getTime();
      return left - right;
    });

    const groups = new Map<string, Topic[]>();
    sorted.forEach((topic) => {
      const key = formatDate(topic[sortKey], { month: "2-digit", day: "2-digit" });
      const list = groups.get(key);
      if (list) {
        list.push(topic);
      } else {
        groups.set(key, [topic]);
      }
    });

    return Array.from(groups.entries());
  }, [filteredTopics, sortKey]);

  const showEmpty = groupedTopics.length === 0;

  return (
    <aside
      className={cn(
        "flex min-h-0 flex-col rounded-2xl border border-white/5 bg-white/[0.04]", 
        isCondensed ? "hidden lg:flex" : "flex",
      )}
    >
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-slate-100">话题时间线</p>
          <p className="text-xs text-slate-400">按时间浏览助手对话</p>
        </div>
        <div className="flex gap-2">
          {(["createdAt", "updatedAt"] as SortKey[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setSortKey(key)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs transition",
                sortKey === key
                  ? "border-primary/60 bg-primary/10 text-primary-foreground"
                  : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:text-slate-100",
              )}
            >
              {key === "createdAt" ? "创建时间" : "最近更新"}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {showEmpty ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-slate-400">
            <p className="text-sm">未找到匹配的话题。</p>
            {keywords ? (
              <button
                type="button"
                onClick={onSearchMessages}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-200 transition hover:border-white/20 hover:text-white"
              >
                <Search className="h-3.5 w-3.5" /> 搜索消息
              </button>
            ) : null}
          </div>
        ) : (
          <div className="space-y-6">
            {groupedTopics.map(([date, items]) => (
              <div key={date} className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{date}</span>
                </div>
                <div className="space-y-2">
                  {items.map((topic) => {
                    const assistant = assistantMap.get(topic.assistantId);
                    return (
                      <button
                        key={topic.id}
                        type="button"
                        onClick={() => onSelectTopic(topic.id)}
                        className="w-full rounded-xl border border-white/5 bg-white/5 p-4 text-left transition hover:border-white/15 hover:bg-white/10"
                      >
                        <p className="text-sm font-medium text-slate-100">{topic.title}</p>
                        <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                          <span>{assistant?.name ?? "未知助手"}</span>
                          <span>{formatTimeOfDay(topic[sortKey])}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            {keywords ? (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={onSearchMessages}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-200 transition hover:border-white/20 hover:text-white"
                >
                  <Search className="h-3.5 w-3.5" /> 搜索消息
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </aside>
  );
}
