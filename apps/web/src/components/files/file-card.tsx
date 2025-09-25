"use client";

import { ExternalLink, Pin, PinOff } from "lucide-react";

import type { SharedFile } from "@cinaseek/web-shared/files";

import { formatDate } from "@/utils/datetime";
import { formatFileSize } from "@/utils/file";

import { getFileTypeMeta } from "./meta";

interface FileCardProps {
  file: SharedFile;
  onTogglePin: (id: string) => void;
  onOpen: (id: string) => void;
}

export function FileCard({ file, onTogglePin, onOpen }: FileCardProps) {
  const meta = getFileTypeMeta(file.type);

  return (
    <article className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-lg transition hover:border-primary/30 hover:bg-white/[0.08]">
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${meta.bg} ${meta.fg}`}>
          <meta.icon className="h-5 w-5" aria-hidden />
        </div>
        <button
          type="button"
          onClick={() => onTogglePin(file.id)}
          className="rounded-full border border-white/10 bg-slate-900/60 p-2 text-slate-300 transition hover:border-primary/50 hover:text-primary"
          aria-label={file.pinned ? "取消置顶" : "置顶文件"}
        >
          {file.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
        </button>
      </div>
      <div className="mt-4 space-y-2">
        <h3 className="text-base font-semibold text-slate-50">{file.title}</h3>
        {file.description ? <p className="text-sm text-slate-300">{file.description}</p> : null}
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-3 text-xs text-slate-400">
        <div>
          <dt className="text-slate-500">类型</dt>
          <dd className="mt-1 text-slate-200">{meta.label}</dd>
        </div>
        <div>
          <dt className="text-slate-500">大小</dt>
          <dd className="mt-1 text-slate-200">{formatFileSize(file.size)}</dd>
        </div>
        <div>
          <dt className="text-slate-500">最近使用</dt>
          <dd className="mt-1 text-slate-200">{formatDate(file.lastUsedAt)}</dd>
        </div>
        <div>
          <dt className="text-slate-500">使用次数</dt>
          <dd className="mt-1 text-slate-200">{file.usageCount} 次</dd>
        </div>
      </dl>
      <button
        type="button"
        onClick={() => onOpen(file.id)}
        className="mt-6 inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/15 px-4 py-2 text-xs font-medium text-primary transition hover:border-primary/50 hover:bg-primary/25"
      >
        <ExternalLink className="h-4 w-4" />
        打开文件
      </button>
    </article>
  );
}
