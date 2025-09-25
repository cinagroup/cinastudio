"use client";

import { Pin, PinOff } from "lucide-react";
import type { ReactNode } from "react";

import type { KnowledgeItem } from "@cinaseek/web-shared/knowledge";
import { formatRelativeTime } from "@/utils/datetime";
import { cn } from "@/utils/cn";

interface KnowledgeCardProps {
  item: KnowledgeItem;
  accentColor: string;
  onTogglePin: (id: string) => void;
  footer?: ReactNode;
}

export function KnowledgeCard({ item, accentColor, onTogglePin, footer }: KnowledgeCardProps) {
  return (
    <article
      className={cn(
        "group relative flex h-full flex-col justify-between rounded-2xl border border-white/5 bg-white/[0.03] p-5 text-left shadow-lg transition hover:border-white/10 hover:bg-white/[0.08]",
        item.pinned && "border-primary/60 bg-primary/10",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-2">
          <span
            className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-200"
            style={{ backgroundColor: `${accentColor}22`, color: accentColor }}
          >
            {item.type}
          </span>
          <h3 className="text-lg font-semibold text-slate-50">{item.title}</h3>
          <p className="text-sm leading-relaxed text-slate-300">{item.summary}</p>
        </div>
        <button
          type="button"
          onClick={() => onTogglePin(item.id)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-slate-950/60 text-slate-200 transition hover:border-white/20 hover:text-white"
          aria-label={item.pinned ? "取消固定" : "固定资源"}
        >
          {item.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
        </button>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-slate-400">
        <span>{formatRelativeTime(item.updatedAt)} 更新</span>
        <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.05] px-2 py-1 text-[11px]">
          来源：
          {item.source.href ? (
            <a
              href={item.source.href}
              target="_blank"
              rel="noreferrer"
              className="text-slate-200 underline-offset-2 transition hover:text-white hover:underline"
            >
              {item.source.label}
            </a>
          ) : (
            <span>{item.source.label}</span>
          )}
        </span>
        {item.tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] uppercase tracking-widest text-slate-300"
          >
            #{tag}
          </span>
        ))}
        {footer}
      </div>
    </article>
  );
}
