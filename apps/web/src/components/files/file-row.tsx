"use client";

import { Clock, DownloadCloud, Pin, PinOff } from "lucide-react";

import type { SharedFile } from "@cinaseek/web-shared/files";

import { formatDate } from "@/utils/datetime";
import { formatFileSize } from "@/utils/file";

import { getFileTypeMeta } from "./meta";

interface FileRowProps {
  file: SharedFile;
  onTogglePin: (id: string) => void;
  onOpen: (id: string) => void;
}

export function FileRow({ file, onTogglePin, onOpen }: FileRowProps) {
  const meta = getFileTypeMeta(file.type);
  const tags = file.tags.slice(0, 4);

  return (
    <div className="group flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3 transition hover:border-primary/40 hover:bg-white/[0.06]">
      <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${meta.bg} ${meta.fg}`}>
        <meta.icon className="h-4 w-4" aria-hidden />
      </div>
      <div className="flex flex-1 flex-col gap-1 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-50">{file.title}</p>
            <p className="truncate text-xs text-slate-400">{file.filename}</p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <span>{formatFileSize(file.size)}</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDate(file.updatedAt, { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
            </span>
            <span>调用 {file.usageCount} 次</span>
          </div>
        </div>
        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-300"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onTogglePin(file.id)}
          className="hidden rounded-full border border-white/10 bg-slate-900/60 p-2 text-slate-300 transition hover:border-primary/40 hover:text-primary group-hover:inline-flex"
          aria-label={file.pinned ? "取消置顶" : "置顶文件"}
        >
          {file.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
        </button>
        <button
          type="button"
          onClick={() => onOpen(file.id)}
          className="inline-flex items-center gap-1 rounded-xl border border-white/10 px-3 py-1.5 text-xs text-slate-200 transition hover:border-primary/40 hover:text-primary"
        >
          <DownloadCloud className="h-4 w-4" />
          下载
        </button>
      </div>
    </div>
  );
}
