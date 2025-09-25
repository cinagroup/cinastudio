"use client";

import { Plus } from "lucide-react";
import { useMemo } from "react";
import { shallow } from "zustand/shallow";

import { Button } from "@/components/ui/button";
import { useConversationStore } from "@/lib/stores/conversation";
import { formatRelativeTime } from "@/utils/datetime";
import { cn } from "@/utils/cn";

export function TopicList() {
  const { assistants, activeAssistantId, topics, messagesByTopic, activeTopicId, createTopic, setActiveTopic } =
    useConversationStore(
      (state) => ({
        assistants: state.assistants,
        activeAssistantId: state.activeAssistantId,
        topics: state.topics,
        messagesByTopic: state.messagesByTopic,
        activeTopicId: state.activeTopicId,
        createTopic: state.createTopic,
        setActiveTopic: state.setActiveTopic,
      }),
      shallow,
    );

  const activeAssistant = useMemo(
    () => assistants.find((assistant) => assistant.id === activeAssistantId),
    [assistants, activeAssistantId],
  );

  const assistantTopics = useMemo(
    () =>
      (activeAssistant?.topicIds ?? [])
        .map((topicId) => topics[topicId])
        .filter((topic): topic is NonNullable<typeof topic> => Boolean(topic)),
    [activeAssistant?.topicIds, topics],
  );

  function handleCreateTopic() {
    if (!activeAssistant) return;
    createTopic({ assistantId: activeAssistant.id });
  }

  if (!activeAssistant) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-white/10 text-sm text-slate-400">
        尚未选择助手
      </div>
    );
  }

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">会话</h3>
        <Button
          type="button"
          variant="ghost"
          onClick={handleCreateTopic}
          className="flex items-center gap-1 rounded-lg border border-white/10 px-2 py-1 text-xs text-slate-100 hover:border-white/20"
        >
          <Plus className="h-3.5 w-3.5" /> 新建
        </Button>
      </div>
      <div className="mt-3 flex-1 overflow-y-auto pr-1">
        <div className="space-y-2 pb-6">
          {assistantTopics.map((topic) => {
            const messages = messagesByTopic[topic.id] ?? [];
            const lastMessage = messages[messages.length - 1];
            const preview = lastMessage?.content ?? "还没有消息";
            const relativeTime = formatRelativeTime(topic.updatedAt);
            const isActive = topic.id === activeTopicId;

            return (
              <button
                key={topic.id}
                type="button"
                onClick={() => setActiveTopic(topic.id)}
                className={cn(
                  "w-full rounded-xl border border-white/5 bg-white/[0.02] p-3 text-left transition hover:border-white/10 hover:bg-white/10",
                  isActive && "border-primary/60 bg-primary/10 text-primary-foreground",
                )}
              >
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{relativeTime}</span>
                  <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-300">
                    {messages.length} 条消息
                  </span>
                </div>
                <div className="mt-2 text-sm font-medium text-slate-100">{topic.title}</div>
                <p className="mt-1 line-clamp-2 text-xs text-slate-400">{preview}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
