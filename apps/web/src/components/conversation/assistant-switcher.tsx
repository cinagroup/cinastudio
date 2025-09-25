"use client";

import { shallow } from "zustand/shallow";

import { useConversationStore } from "@/lib/stores/conversation";
import { cn } from "@/utils/cn";

export function AssistantSwitcher() {
  const { assistants, activeAssistantId, setActiveAssistant } = useConversationStore(
    (state) => ({
      assistants: state.assistants,
      activeAssistantId: state.activeAssistantId,
      setActiveAssistant: state.setActiveAssistant,
    }),
    shallow,
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">助理</h2>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
          {assistants.length}
        </span>
      </div>
      <div className="grid gap-2">
        {assistants.map((assistant) => {
          const isActive = assistant.id === activeAssistantId;
          return (
            <button
              key={assistant.id}
              type="button"
              onClick={() => setActiveAssistant(assistant.id)}
              className={cn(
                "flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-left transition hover:border-white/10 hover:bg-white/10",
                isActive && "border-primary/60 bg-primary/10",
              )}
            >
              <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-lg">
                {assistant.avatar}
              </span>
              <span className="flex-1">
                <span className="block text-sm font-semibold text-slate-100">{assistant.name}</span>
                <span className="mt-1 block text-xs text-slate-400">{assistant.description}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
