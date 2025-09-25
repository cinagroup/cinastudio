"use client";

import { useMemo } from "react";
import { shallow } from "zustand/shallow";

import { useConversationStore } from "@/lib/stores/conversation";

import { AssistantSwitcher } from "./assistant-switcher";
import { ChatPanel } from "./chat-panel";
import { TopicList } from "./topic-list";

export function ConversationView() {
  const { assistants, activeAssistantId, activeTopicId, topics, setActiveAssistant, setActiveTopic } =
    useConversationStore(
      (state) => ({
        assistants: state.assistants,
        activeAssistantId: state.activeAssistantId,
        activeTopicId: state.activeTopicId,
        topics: state.topics,
        setActiveAssistant: state.setActiveAssistant,
        setActiveTopic: state.setActiveTopic,
      }),
      shallow,
    );

  const activeAssistant = useMemo(
    () => assistants.find((assistant) => assistant.id === activeAssistantId) ?? assistants[0],
    [assistants, activeAssistantId],
  );

  const topicOptions = useMemo(
    () =>
      (activeAssistant?.topicIds ?? [])
        .map((topicId) => topics[topicId])
        .filter((topic): topic is NonNullable<typeof topic> => Boolean(topic)),
    [activeAssistant?.topicIds, topics],
  );

  return (
    <div className="flex h-full flex-1 flex-col lg:flex-row">
      <div className="border-b border-white/10 bg-slate-900/40 p-4 lg:hidden">
        <div className="grid gap-3">
          <label className="flex flex-col gap-1 text-sm text-slate-200">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">选择助手</span>
            <select
              value={activeAssistant?.id ?? ""}
              onChange={(event) => setActiveAssistant(event.target.value)}
              className="w-full rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 shadow-inner focus:border-primary focus:outline-none"
            >
              {assistants.map((assistant) => (
                <option key={assistant.id} value={assistant.id}>
                  {assistant.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-200">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">选择话题</span>
            <select
              value={activeTopicId ?? ""}
              onChange={(event) => setActiveTopic(event.target.value)}
              className="w-full rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 shadow-inner focus:border-primary focus:outline-none"
            >
              {topicOptions.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.title}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
      <aside className="hidden w-80 flex-shrink-0 flex-col border-r border-white/10 bg-slate-900/40 p-6 lg:flex">
        <AssistantSwitcher />
        <div className="mt-8 flex flex-1 flex-col overflow-hidden">
          <TopicList />
        </div>
      </aside>
      <section className="flex flex-1 flex-col overflow-hidden">
        <ChatPanel />
      </section>
    </div>
  );
}
