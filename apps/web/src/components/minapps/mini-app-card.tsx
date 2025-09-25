"use client";

import type { SharedMiniApp } from "@cinaseek/web-shared/minapps";
import { ExternalLink, Pin, PinOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import { formatRelativeTime } from "@/utils/datetime";

interface MiniAppCardProps {
  app: SharedMiniApp;
  categoryName?: string;
  openInNewTab: boolean;
  onTogglePin: (id: string) => void;
  onRemove?: (id: string) => void;
  onLaunch: (app: SharedMiniApp) => void;
}

export function MiniAppCard({
  app,
  categoryName,
  openInNewTab,
  onTogglePin,
  onRemove,
  onLaunch,
}: MiniAppCardProps) {
  function handleTogglePin(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    onTogglePin(app.id);
  }

  function handleRemove(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    if (onRemove) {
      onRemove(app.id);
    }
  }

  function handleLaunch() {
    onLaunch(app);
  }

  const lastUsedLabel = app.lastLaunchedAt
    ? formatRelativeTime(app.lastLaunchedAt)
    : "尚未使用";

  return (
    <div className="group flex h-full flex-col gap-4 rounded-2xl border border-white/10 bg-slate-950/70 p-5 shadow-xl transition hover:border-primary/40 hover:bg-slate-900/60">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-xl">
            {app.icon ?? "🔗"}
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold text-slate-100">{app.name}</h3>
              {app.custom ? (
                <span className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.25em] text-emerald-200">
                  自定义
                </span>
              ) : null}
              {app.pinned ? (
                <span className="rounded-full border border-primary/40 bg-primary/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.25em] text-primary-foreground">
                  已置顶
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-sm text-slate-300">{app.description}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-400">
              {categoryName ? (
                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5">{categoryName}</span>
              ) : null}
              {app.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleTogglePin}
          className={cn(
            "rounded-full border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:border-primary/40 hover:text-primary",
            app.pinned && "border-primary/60 bg-primary/20 text-primary-foreground",
          )}
          aria-label={app.pinned ? "取消置顶" : "置顶迷你应用"}
        >
          {app.pinned ? <Pin className="h-4 w-4" /> : <PinOff className="h-4 w-4" />}
        </button>
      </div>
      <dl className="grid gap-3 text-xs text-slate-400 sm:grid-cols-3">
        <div className="flex flex-col gap-1 rounded-lg border border-white/5 bg-white/5 p-2">
          <dt className="font-medium text-slate-300">使用次数</dt>
          <dd className="text-slate-100">{app.launchCount ?? 0}</dd>
        </div>
        <div className="flex flex-col gap-1 rounded-lg border border-white/5 bg-white/5 p-2">
          <dt className="font-medium text-slate-300">最近使用</dt>
          <dd className="text-slate-100">{lastUsedLabel}</dd>
        </div>
        <div className="flex flex-col gap-1 rounded-lg border border-white/5 bg-white/5 p-2">
          <dt className="font-medium text-slate-300">链接</dt>
          <dd className="truncate text-slate-100" title={app.url}>
            {app.url}
          </dd>
        </div>
      </dl>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-2">
        <Button
          type="button"
          onClick={handleLaunch}
          className="px-3 py-2 text-xs uppercase tracking-[0.3em]"
          aria-label={`打开${app.name}`}
        >
          打开应用
          {openInNewTab ? <ExternalLink className="h-4 w-4" /> : null}
        </Button>
        {onRemove ? (
          <button
            type="button"
            onClick={handleRemove}
            className="text-xs text-slate-400 underline-offset-2 transition hover:text-rose-300 hover:underline"
          >
            删除
          </button>
        ) : null}
      </div>
    </div>
  );
}
