"use client";

import Link from "next/link";
import { useMemo } from "react";
import { shallow } from "zustand/shallow";
import {
  CalendarClock,
  CheckCircle2,
  Clock3,
  Loader2,
  Sparkles,
  CircleDashed,
} from "lucide-react";

import type {
  LaunchpadAutomation,
  LaunchpadUpdate,
  LaunchpadFeatureStatus,
} from "@cinaseek/web-shared/launchpad";
import { FeatureCard } from "@/components/launchpad/feature-card";
import { Button, buttonStyles } from "@/components/ui/button";
import { useLaunchpadStore } from "@/lib/stores/launchpad";
import { formatDate, formatRelativeTime } from "@/utils/datetime";
import { cn } from "@/utils/cn";

const FEATURE_ORDER: LaunchpadFeatureStatus[] = ["available", "in-progress", "planned"];

const AUTOMATION_STATUS = {
  active: {
    label: "已启用",
    className: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
    Icon: CheckCircle2,
  },
  scheduled: {
    label: "已排程",
    className: "border-sky-400/30 bg-sky-400/10 text-sky-200",
    Icon: Clock3,
  },
  planned: {
    label: "规划中",
    className: "border-slate-400/30 bg-slate-400/10 text-slate-200",
    Icon: CalendarClock,
  },
} as const;

const UPDATE_STATUS = {
  shipped: {
    label: "已上线",
    className: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
    Icon: Sparkles,
  },
  "in-progress": {
    label: "迁移中",
    className: "border-amber-400/30 bg-amber-400/10 text-amber-200",
    Icon: Loader2,
  },
  planned: {
    label: "规划中",
    className: "border-slate-400/30 bg-slate-400/10 text-slate-200",
    Icon: CircleDashed,
  },
} as const;

type AutomationStatusKey = keyof typeof AUTOMATION_STATUS;
type UpdateStatusKey = keyof typeof UPDATE_STATUS;

function AutomationCard({ automation }: { automation: LaunchpadAutomation }) {
  const status = AUTOMATION_STATUS[automation.status as AutomationStatusKey] ?? AUTOMATION_STATUS.planned;
  const StatusIcon = status.Icon;

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-white/10 bg-slate-950/60 p-5 transition hover:border-primary/40 hover:bg-slate-900/60">
      <div className="space-y-3">
        <div className="flex items-center gap-3 text-sm text-slate-200">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-primary">
            <StatusIcon className="h-5 w-5" />
          </span>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-100">{automation.title}</span>
            <span className="text-xs text-slate-400">{status.label}</span>
          </div>
        </div>
        <p className="text-sm text-slate-300">{automation.description}</p>
      </div>
      <div className="mt-4 flex flex-col gap-4 text-xs">
        <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.3em] text-slate-400">
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5">节奏 {automation.cadence}</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5">负责人 {automation.owner}</span>
          {automation.tags.map((tag) => (
            <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5">
              {tag}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className={cn("rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.3em]", status.className)}>
            {status.label}
          </span>
          {automation.href ? (
            automation.external ? (
              <a
                href={automation.href}
                target="_blank"
                rel="noreferrer"
                className={buttonStyles("ghost", "border border-white/10 px-3 py-1 text-xs text-slate-200 hover:border-white/20")}
              >
                查看详情
              </a>
            ) : (
              <Link
                href={automation.href}
                prefetch={false}
                className={buttonStyles("ghost", "border border-white/10 px-3 py-1 text-xs text-slate-200 hover-border-white/20")}
              >
                查看详情
              </Link>
            )
          ) : null}
        </div>
      </div>
    </div>
  );
}

function UpdateItem({ update, onDismiss }: { update: LaunchpadUpdate; onDismiss: (id: string) => void }) {
  const status = UPDATE_STATUS[update.status as UpdateStatusKey] ?? UPDATE_STATUS.planned;
  const StatusIcon = status.Icon;
  const formattedDate = formatDate(update.date);
  const relative = formatRelativeTime(update.date);

  return (
    <li className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] uppercase tracking-[0.3em]">
              <StatusIcon className="h-4 w-4" />
              {status.label}
            </span>
            <span>{formattedDate}</span>
            <span className="text-slate-500">{relative}</span>
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100">{update.title}</h3>
            <p className="mt-2 text-sm text-slate-300">{update.summary}</p>
          </div>
          <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.3em] text-slate-400">
            {update.tags.map((tag) => (
              <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5">
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {update.href ? (
            update.external ? (
              <a
                href={update.href}
                target="_blank"
                rel="noreferrer"
                className={buttonStyles("ghost", "border border-white/10 px-3 py-1 text-xs text-slate-200 hover:border-white/20")}
              >
                查看详情
              </a>
            ) : (
              <Link
                href={update.href}
                prefetch={false}
                className={buttonStyles("ghost", "border border-white/10 px-3 py-1 text-xs text-slate-200 hover:border-white/20")}
              >
                查看详情
              </Link>
            )
          ) : null}
          <Button
            type="button"
            variant="ghost"
            className="border border-white/10 px-3 py-1 text-xs text-slate-200 hover:border-white/20"
            onClick={() => onDismiss(update.id)}
          >
            标记已读
          </Button>
        </div>
      </div>
    </li>
  );
}

export function LaunchpadView() {
  const { features, pinnedFeatureIds, automations, updates, dismissedUpdateIds, toggleFeaturePin, dismissUpdate } =
    useLaunchpadStore(
      (state) => ({
        features: state.features,
        pinnedFeatureIds: state.pinnedFeatureIds,
        automations: state.automations,
        updates: state.updates,
        dismissedUpdateIds: state.dismissedUpdateIds,
        toggleFeaturePin: state.toggleFeaturePin,
        dismissUpdate: state.dismissUpdate,
      }),
      shallow,
    );

  const pinnedSet = useMemo(() => new Set(pinnedFeatureIds), [pinnedFeatureIds]);
  const pinnedFeatures = useMemo(
    () => features.filter((feature) => pinnedSet.has(feature.id)),
    [features, pinnedSet],
  );

  const sortedFeatures = useMemo(() => {
    return [...features].sort((a, b) => {
      const pinnedDiff = Number(pinnedSet.has(b.id)) - Number(pinnedSet.has(a.id));
      if (pinnedDiff !== 0) {
        return pinnedDiff;
      }
      return FEATURE_ORDER.indexOf(a.status) - FEATURE_ORDER.indexOf(b.status);
    });
  }, [features, pinnedSet]);

  const statusMetrics = useMemo(() => {
    return features.reduce(
      (acc, feature) => {
        acc[feature.status] = (acc[feature.status] ?? 0) + 1;
        return acc;
      },
      {} as Record<LaunchpadFeatureStatus, number>,
    );
  }, [features]);

  const visibleUpdates = useMemo(
    () => updates.filter((update) => !dismissedUpdateIds.includes(update.id)),
    [updates, dismissedUpdateIds],
  );

  return (
    <div className="flex h-full flex-1 flex-col overflow-y-auto">
      <header className="border-b border-white/10 bg-slate-900/60 px-4 py-10 sm:px-8">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">迁移控制台</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-50 sm:text-4xl">CinaSeek 启动台</h1>
        <p className="mt-4 max-w-3xl text-sm text-slate-300">
          聚合 Web/PWA、浏览器扩展与后端自动化的迁移状态，帮助团队跟踪关键功能上线节奏。
        </p>
        <div className="mt-6 flex flex-wrap gap-3 text-[11px] uppercase tracking-[0.3em] text-slate-400">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
            已上线 {statusMetrics.available ?? 0}
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
            迁移中 {statusMetrics["in-progress"] ?? 0}
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
            规划中 {statusMetrics.planned ?? 0}
          </span>
        </div>
      </header>

      <div className="flex-1 space-y-12 px-4 py-8 sm:px-8">
        <section className="space-y-4">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">快速入口</h2>
              <p className="mt-1 text-sm text-slate-300">固定常用功能，快速跳转到对应页面或文档。</p>
            </div>
          </header>
          {pinnedFeatures.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {pinnedFeatures.map((feature) => (
                <FeatureCard
                  key={feature.id}
                  feature={feature}
                  pinned
                  onTogglePin={toggleFeaturePin}
                />
              ))}
            </div>
          ) : (
            <div className="flex min-h-[140px] items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/5 text-sm text-slate-400">
              尚未固定快捷入口，可在下方全部功能中选择。
            </div>
          )}
        </section>

        <section className="space-y-4">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">全部功能</h2>
              <p className="mt-1 text-sm text-slate-300">按状态分层展示，掌握迁移优先级。</p>
            </div>
          </header>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sortedFeatures.map((feature) => (
              <FeatureCard
                key={feature.id}
                feature={feature}
                pinned={pinnedSet.has(feature.id)}
                onTogglePin={toggleFeaturePin}
              />
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">自动化编排</h2>
              <p className="mt-1 text-sm text-slate-300">跟踪 PWA、扩展与 BFF 层的任务协同情况。</p>
            </div>
          </header>
          <div className="grid gap-4 md:grid-cols-2">
            {automations.map((automation) => (
              <AutomationCard key={automation.id} automation={automation} />
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">迁移里程碑</h2>
              <p className="mt-1 text-sm text-slate-300">记录重要节点，可在完成后标记已读。</p>
            </div>
          </header>
          {visibleUpdates.length > 0 ? (
            <ol className="space-y-4">
              {visibleUpdates.map((update) => (
                <UpdateItem key={update.id} update={update} onDismiss={dismissUpdate} />
              ))}
            </ol>
          ) : (
            <div className="flex min-h-[140px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/10 bg-white/5 text-sm text-slate-400">
              <span>所有里程碑均已标记完成。</span>
              <span>可在设置中重置启动台或等待新的迁移更新。</span>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
