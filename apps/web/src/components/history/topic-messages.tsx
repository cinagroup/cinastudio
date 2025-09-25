"use client";

import { MessageCircle } from "lucide-react";

import type { AssistantRecord, Message, Topic } from "@/types";
import { formatDate, formatTimeOfDay } from "@/utils/datetime";
import { MessageBubble } from "@/components/conversation/message-bubble";

interface TopicMessagesProps {
  topic: Topic;
  assistant?: AssistantRecord;
  messages: Message[];
  onSelectMessage?: (message: Message) => void;
}

export function TopicMessages({
  topic,
  assistant,
  messages,
  onSelectMessage,
}: TopicMessagesProps) {
  return (
    <div className="flex h-full flex-1 flex-col">
      <header className="border-b border-white/5 px-6 py-4">
        <div className="flex items-center gap-3 text-sm text-slate-300">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary">
            <MessageCircle className="h-4 w-4" />
          </span>
          <div>
            <p className="text-base font-semibold text-slate-100">{topic.title}</p>
            <p className="text-xs text-slate-400">
              {assistant?.name ?? "未知助手"} · 创建于 {formatDate(topic.createdAt)} · 最近更新 {" "}
              {formatTimeOfDay(topic.updatedAt)}
            </p>
          </div>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-sm text-slate-400">
            <p>暂无消息记录。</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {messages.map((message) => (
              <button
                key={message.id}
                type="button"
                onClick={() => onSelectMessage?.(message)}
                className="text-left"
              >
                <MessageBubble message={message} assistant={assistant ?? topicAssistantFallback} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const topicAssistantFallback: AssistantRecord = {
  id: "assistant-fallback",
  name: "助手",
  description: "",
  avatar: "🤖",
  color: "slate",
  topicIds: [],
};
