"use client";

import { Pin, PinOff, Trash } from "lucide-react";
import type { ReactNode } from "react";

import type { AgentDefinition } from "@cinaseek/web-shared/agents";

import { cn } from "@/utils/cn";

interface AgentCardProps {
  agent: AgentDefinition;
  isPinned?: boolean;
  onTogglePinned?: (agentId: string) => void;
  onRemove?: (agentId: string) => void;
  footer?: ReactNode;
}

export function AgentCard({
  agent,
  isPinned = false,
  onTogglePinned,
  onRemove,
  footer,
}: AgentCardProps) {
  return (
    <article className="group relative flex h-full flex-col gap-4 rounded-2xl border border-white/5 bg-white/[0.04] p-5 transition hover:border-white/10 hover:bg-white/[0.08]">
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-xl">
            {agent.avatar}
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-white">{agent.name}</h3>
            <p className="text-xs text-slate-400">{agent.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onRemove && agent.source === "custom" ? (
            <button
              type="button"
              onClick={() => onRemove(agent.id)}
              className="rounded-lg border border-transparent p-1.5 text-slate-400 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-300"
              aria-label="删除自定义助手"
            >
              <Trash className="h-4 w-4" />
            </button>
          ) : null}
          {onTogglePinned ? (
            <button
              type="button"
              onClick={() => onTogglePinned(agent.id)}
              className={cn(
                "rounded-lg border border-transparent p-1.5 text-slate-400 transition hover:border-primary/40 hover:bg-primary/10 hover:text-primary",
                isPinned && "border-primary/50 bg-primary/15 text-primary",
              )}
              aria-label={isPinned ? "取消固定" : "固定助手"}
            >
              {isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
            </button>
          ) : null}
        </div>
      </header>
      {agent.capabilities.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {agent.capabilities.map((capability) => (
            <span
              key={capability}
              className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-200"
            >
              {capability}
            </span>
          ))}
        </div>
      ) : null}
      {agent.tags.length > 0 ? (
        <div className="mt-auto flex flex-wrap gap-2">
          {agent.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-medium text-primary">
              #{tag}
            </span>
          ))}
        </div>
      ) : (
        <div className="mt-auto" />
      )}
      {footer ? <div className="border-t border-white/5 pt-3 text-xs text-slate-300">{footer}</div> : null}
    </article>
  );
}
