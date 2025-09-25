"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Bot,
  Code,
  ExternalLink,
  Folder,
  Brain,
  Languages,
  LayoutGrid,
  Library,
  NotebookPen,
  Palette,
  PanelsTopLeft,
  Pin,
  PinOff,
  Puzzle,
  Rocket,
  Settings,
  type LucideIcon,
} from "lucide-react";

import type { LaunchpadFeature, LaunchpadFeatureIcon } from "@cinaseek/web-shared/launchpad";
import { cn } from "@/utils/cn";

const ICON_MAP: Record<LaunchpadFeatureIcon, LucideIcon> = {
  launchpad: Rocket,
  workspace: PanelsTopLeft,
  knowledge: Library,
  extension: Puzzle,
  files: Folder,
  agents: Bot,
  translate: Languages,
  memory: Brain,
  notes: NotebookPen,
  code: Code,
  settings: Settings,
  paintings: Palette,
  minapps: LayoutGrid,
};

const STATUS_LABEL: Record<LaunchpadFeature["status"], string> = {
  available: "已上线",
  "in-progress": "迁移中",
  planned: "规划中",
};

const STATUS_CLASS: Record<LaunchpadFeature["status"], string> = {
  available: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  "in-progress": "border-amber-400/30 bg-amber-400/10 text-amber-200",
  planned: "border-slate-400/30 bg-slate-400/10 text-slate-200",
};

interface FeatureCardProps {
  feature: LaunchpadFeature;
  pinned: boolean;
  onTogglePin: (id: string) => void;
}

export function FeatureCard({ feature, pinned, onTogglePin }: FeatureCardProps) {
  const Icon = ICON_MAP[feature.icon] ?? Rocket;
  const statusLabel = STATUS_LABEL[feature.status] ?? "规划中";
  const statusClass = STATUS_CLASS[feature.status] ?? STATUS_CLASS.planned;

  function handleToggle(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    onTogglePin(feature.id);
  }

  const card = (
    <div className="group relative h-full rounded-2xl border border-white/10 bg-slate-950/60 p-5 transition hover:border-primary/40 hover:bg-slate-900/60">
      <button
        type="button"
        onClick={handleToggle}
        className={cn(
          "absolute right-4 top-4 rounded-full border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:border-primary/40 hover:text-primary",
          pinned && "border-primary/60 bg-primary/20 text-primary-foreground",
        )}
        aria-label={pinned ? "取消固定" : "固定到启动台"}
        aria-pressed={pinned}
      >
        {pinned ? <Pin className="h-4 w-4" /> : <PinOff className="h-4 w-4" />}
      </button>
      <div className="flex h-full flex-col gap-5">
        <div className="flex flex-col gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-lg text-primary">
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-base font-semibold text-slate-100">{feature.title}</h3>
            <p className="mt-2 text-sm text-slate-300">{feature.description}</p>
          </div>
        </div>
        <div className="mt-auto flex flex-col gap-4 text-xs">
          <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.3em] text-slate-400">
            {feature.tags.map((tag) => (
              <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5">
                {tag}
              </span>
            ))}
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className={cn("flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.3em]", statusClass)}>
              {statusLabel}
            </span>
            <span className="hidden items-center justify-center rounded-full border border-white/10 bg-white/5 p-2 text-slate-300 transition group-hover:border-primary/40 group-hover:text-primary sm:inline-flex">
              {feature.external ? <ExternalLink className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  if (feature.external) {
    return (
      <a
        href={feature.href}
        target="_blank"
        rel="noreferrer"
        className="block h-full focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        {card}
      </a>
    );
  }

  return (
    <Link href={feature.href} prefetch={false} className="block h-full">
      {card}
    </Link>
  );
}
