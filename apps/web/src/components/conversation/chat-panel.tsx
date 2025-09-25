"use client";

import { useEffect, useMemo, useRef } from "react";
import { shallow } from "zustand/shallow";

import { useConversationStore } from "@/lib/stores/conversation";
import { useConversationSearchStore } from "@/lib/stores/conversation-search";
import { formatRelativeTime } from "@/utils/datetime";

import { ChatComposer } from "./chat-composer";
import { MessageBubble } from "./message-bubble";
import { MessageSearchPanel } from "./message-search-panel";
import { QuickPanel } from "./quick-panel";

function isEditableElement(element: HTMLElement | null): boolean {
  if (!element) {
    return false;
  }
  const tagName = element.tagName;
  if (tagName === "INPUT" || tagName === "TEXTAREA") {
    return true;
  }
  if (element.isContentEditable) {
    return true;
  }
  if (element instanceof HTMLInputElement) {
    return ["text", "search", "email", "url", "tel", "password"].includes(element.type);
  }
  return false;
}

export function ChatPanel() {
  const { activeTopicId, topics, messagesByTopic, assistants } = useConversationStore(
    (state) => ({
      activeTopicId: state.activeTopicId,
      topics: state.topics,
      messagesByTopic: state.messagesByTopic,
      assistants: state.assistants,
    }),
    shallow,
  );

  const { isOpen, query, matches, activeIndex, open: openSearch, setMatches } =
    useConversationSearchStore(
      (state) => ({
        isOpen: state.isOpen,
        query: state.query,
        matches: state.matches,
        activeIndex: state.activeIndex,
        open: state.open,
        setMatches: state.setMatches,
      }),
      shallow,
    );

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setMatches([]);
      return;
    }

    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      setMatches([]);
      return;
    }

    const activeMessages = activeTopicId ? messagesByTopic[activeTopicId] ?? [] : [];
    const matchIds = activeMessages
      .filter((message) => message.content.toLowerCase().includes(normalized))
      .map((message) => message.id);

    setMatches(matchIds);
  }, [activeTopicId, isOpen, messagesByTopic, query, setMatches]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    if (activeIndex < 0 || activeIndex >= matches.length) {
      return;
    }

    const messageId = matches[activeIndex];
    const container = messagesContainerRef.current;
    if (!container) {
      return;
    }

    const target = container.querySelector<HTMLElement>(`[data-message-id="${messageId}"]`);
    if (target && typeof target.scrollIntoView === "function") {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [activeIndex, isOpen, matches]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "f") {
        return;
      }
      if (!event.metaKey && !event.ctrlKey) {
        return;
      }

      const target = event.target as HTMLElement | null;
      if (isEditableElement(target)) {
        return;
      }

      event.preventDefault();
      const selection = window.getSelection?.()?.toString().trim();
      if (selection) {
        openSearch(selection);
      } else {
        openSearch();
      }
    };

    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, [openSearch]);

  const topic = activeTopicId ? topics[activeTopicId] : undefined;
  const assistant = topic ? assistants.find((item) => item.id === topic.assistantId) : undefined;
  const messages = topic ? messagesByTopic[topic.id] ?? [] : [];

  const matchSet = useMemo(() => new Set(matches), [matches]);
  const activeMatchId = matches[activeIndex] ?? null;
  const searchQuery = isOpen ? query.trim() : "";

  if (!topic || !assistant) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center text-sm text-slate-400">
        <div className="rounded-full border border-dashed border-white/10 px-4 py-2">请选择一个助手与会话</div>
        <p>从左侧列表选择助理，并创建新的对话主题。</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-1 flex-col">
      <QuickPanel />
      <header className="border-b border-white/10 bg-slate-900/60 px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-lg">
              {assistant.avatar}
            </span>
            <div>
              <h1 className="text-base font-semibold text-slate-100 sm:text-lg">{assistant.name}</h1>
              <p className="text-sm text-slate-400">{assistant.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="hidden rounded-full border border-white/10 px-2 py-1 uppercase tracking-wide text-slate-300 sm:inline-flex">
              {formatRelativeTime(topic.updatedAt)}
            </span>
            <span className="rounded-full bg-white/5 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-slate-300">
              {messages.length} 条消息
            </span>
          </div>
        </div>
      </header>
      <div className="relative flex-1 overflow-y-auto px-4 py-6 sm:px-6" ref={messagesContainerRef}>
        <div className="pointer-events-none absolute right-4 top-4 z-20 sm:right-6">
          <MessageSearchPanel />
        </div>
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              assistant={assistant}
              searchQuery={searchQuery}
              isMatch={matchSet.has(message.id)}
              isActiveMatch={activeMatchId === message.id}
            />
          ))}
        </div>
      </div>
      <div className="border-t border-white/10 bg-slate-900/60 px-4 py-4 sm:px-6">
        <div className="mx-auto w-full max-w-3xl">
          <ChatComposer />
        </div>
      </div>
    </div>
  );
}
