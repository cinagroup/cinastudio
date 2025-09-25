"use client";

import { Clock, Pin, PinOff, Tags, Trash2 } from "lucide-react";

import type { SharedNote } from "@cinaseek/web-shared/notes";

import { cn } from "@/utils/cn";

interface NoteCardProps {
  note: SharedNote;
  onTogglePin: (id: string) => void;
  onDelete: (id: string) => void;
}

const CATEGORY_LABELS: Record<SharedNote["category"], string> = {
  product: "产品规划",
  workflow: "工作流",
  release: "发布记录",
  knowledge: "知识沉淀",
  migration: "迁移纪要",
};

export function NoteCard({ note, onTogglePin, onDelete }: NoteCardProps) {
  return (
    <article className="flex h-full flex-col gap-3 rounded-2xl border border-white/10 bg-slate-950/70 p-5 shadow-xl transition hover:border-primary/40">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-primary/70">{CATEGORY_LABELS[note.category]}</p>
          <h3 className="mt-1 text-lg font-semibold text-slate-50">{note.title}</h3>
          <p className="mt-2 text-sm text-slate-300">{note.summary}</p>
        </div>
        <button
          type="button"
          onClick={() => onTogglePin(note.id)}
          className={cn(
            "rounded-full border px-2 py-1 text-xs transition",
            note.pinned
              ? "border-primary/50 bg-primary/15 text-primary"
              : "border-white/10 bg-white/5 text-slate-300 hover:border-primary/30 hover:text-primary",
          )}
        >
          {note.pinned ? <Pin className="h-3.5 w-3.5" /> : <PinOff className="h-3.5 w-3.5" />}
        </button>
      </header>
      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {new Date(note.updatedAt).toLocaleString()}
        </span>
        {note.tags.length ? (
          <span className="inline-flex items-center gap-1">
            <Tags className="h-3.5 w-3.5" />
            {note.tags.join(" · ")}
          </span>
        ) : null}
      </div>
      <pre className="flex-1 whitespace-pre-wrap rounded-xl border border-white/5 bg-slate-900/60 px-4 py-3 text-xs leading-relaxed text-slate-100">
        {note.content}
      </pre>
      <footer className="flex items-center justify-between text-xs text-slate-400">
        <span>最后更新：{new Date(note.updatedAt).toLocaleDateString()}</span>
        <button
          type="button"
          onClick={() => onDelete(note.id)}
          className="inline-flex items-center gap-1 text-slate-400 transition hover:text-red-400"
        >
          <Trash2 className="h-3.5 w-3.5" /> 删除
        </button>
      </footer>
    </article>
  );
}
