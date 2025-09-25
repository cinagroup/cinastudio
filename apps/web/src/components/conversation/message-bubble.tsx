"use client";

import type { Assistant, Message } from "@/types";
import { formatTimeOfDay } from "@/utils/datetime";
import { cn } from "@/utils/cn";

interface MessageBubbleProps {
  message: Message;
  assistant: Assistant;
  searchQuery?: string;
  isMatch?: boolean;
  isActiveMatch?: boolean;
}

function highlightContent(content: string, query: string) {
  if (!query) {
    return content;
  }

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");

  return content.split(regex).map((part, index) => {
    if (part.toLowerCase() === query.toLowerCase()) {
      return (
        <mark key={index} className="rounded bg-amber-300/60 px-0.5 text-slate-900">
          {part}
        </mark>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

export function MessageBubble({ message, assistant, searchQuery = "", isMatch = false, isActiveMatch = false }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}
      data-message-id={message.id}
      data-testid={`message-${message.id}`}
    >
      {!isUser && (
        <span className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-sm">
          {assistant.avatar}
        </span>
      )}
      <div
        className={cn(
          "max-w-xl rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm transition",
          isUser
            ? "ml-auto bg-primary text-primary-foreground"
            : "bg-slate-800/80 text-slate-100",
          isMatch && !isActiveMatch && "ring-1 ring-white/20",
          isActiveMatch && "ring-2 ring-primary",
        )}
      >
        <div className="flex items-center justify-between text-xs text-slate-300">
          <span>{isUser ? "我" : assistant.name}</span>
          <span>{formatTimeOfDay(message.createdAt)}</span>
        </div>
        <div className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-inherit">
          {highlightContent(message.content, searchQuery)}
        </div>
      </div>
      {isUser && (
        <span className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-sm text-primary">
          我
        </span>
      )}
    </div>
  );
}
