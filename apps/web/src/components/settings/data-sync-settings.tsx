"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  AlertTriangle,
  BookOpen,
  Cloud,
  HardDrive,
  Loader2,
  RefreshCcw,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { SettingToggle } from "@/components/settings/setting-toggle";
import {
  useDataSyncStore,
  type DataSyncConnectorStatus,
  type DataSyncProviderCategory,
} from "@/lib/stores/data-sync";
import { formatDate, formatRelativeTime, formatTimeOfDay } from "@/utils/datetime";
import { cn } from "@/utils/cn";

const CATEGORY_ICONS: Record<DataSyncProviderCategory, LucideIcon> = {
  self_hosted: HardDrive,
  cloud: Cloud,
  knowledge: BookOpen,
};

const STATUS_STYLES: Record<DataSyncConnectorStatus, { label: string; className: string }> = {
  disconnected: {
    label: "未连接",
    className: "bg-white/5 text-slate-300",
  },
  syncing: {
    label: "同步中",
    className: "bg-amber-400/10 text-amber-300",
  },
  connected: {
    label: "已连接",
    className: "bg-emerald-400/10 text-emerald-300",
  },
  error: {
    label: "失败",
    className: "bg-rose-500/15 text-rose-300",
  },
};

export function DataSyncSettings() {
  const {
    providers,
    connectors,
    selectedProviderId,
    selectProvider,
    toggleConnector,
    updateConnectorConfig,
    markSyncing,
    markSynced,
    clearError,
    resetProvider,
  } = useDataSyncStore((state) => ({
    providers: state.providers,
    connectors: state.connectors,
    selectedProviderId: state.selectedProviderId,
    selectProvider: state.selectProvider,
    toggleConnector: state.toggleConnector,
    updateConnectorConfig: state.updateConnectorConfig,
    markSyncing: state.markSyncing,
    markSynced: state.markSynced,
    clearError: state.clearError,
    resetProvider: state.resetProvider,
  }));

  const selectedProvider = useMemo(
    () => providers.find((provider) => provider.id === selectedProviderId) ?? providers[0] ?? null,
    [providers, selectedProviderId],
  );

  const selectedConnector = selectedProvider ? connectors[selectedProvider.id] : undefined;

  function handleToggle(enabled: boolean) {
    if (selectedProvider) {
      toggleConnector(selectedProvider.id, enabled);
    }
  }

  function handleSync() {
    if (!selectedProvider) {
      return;
    }
    markSyncing(selectedProvider.id);
    markSynced(selectedProvider.id);
  }

  function handleReset() {
    if (!selectedProvider) {
      return;
    }
    resetProvider(selectedProvider.id);
  }

  function handleClearError() {
    if (!selectedProvider) {
      return;
    }
    clearError(selectedProvider.id);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[280px,1fr]">
        <div className="space-y-3">
          {providers.map((provider) => {
            const Icon = CATEGORY_ICONS[provider.category] ?? Cloud;
            const connector = connectors[provider.id];
            const statusMeta = STATUS_STYLES[connector?.status ?? "disconnected"];
            const isActive = provider.id === selectedProvider?.id;

            return (
              <button
                key={provider.id}
                type="button"
                onClick={() => selectProvider(provider.id)}
                className={cn(
                  "w-full rounded-2xl border border-white/5 bg-white/[0.04] p-4 text-left transition",
                  "hover:border-white/15 hover:bg-white/[0.08]",
                  isActive && "border-primary/60 bg-primary/10",
                )}
                aria-pressed={isActive}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-white">{provider.name}</p>
                      <p className="text-xs text-slate-400">{provider.description}</p>
                    </div>
                  </div>
                  <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", statusMeta.className)}>
                    {statusMeta.label}
                  </span>
                </div>
                {provider.badge ? (
                  <span className="mt-3 inline-flex items-center rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-slate-300">
                    {provider.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6">
          {selectedProvider && selectedConnector ? (
            <div className="space-y-6">
              <header className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-semibold text-white">{selectedProvider.name}</h3>
                    <p className="mt-1 text-sm text-slate-300">{selectedProvider.description}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-3 py-1 font-medium",
                        STATUS_STYLES[selectedConnector.status].className,
                      )}
                    >
                      {selectedConnector.status === "syncing" ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                      ) : null}
                      {STATUS_STYLES[selectedConnector.status].label}
                    </span>
                    {selectedConnector.lastSyncedAt ? (
                      <span className="text-xs text-slate-400">
                        上次同步 {formatRelativeTime(selectedConnector.lastSyncedAt)} · {formatDate(selectedConnector.lastSyncedAt)}
                        {" "}
                        {formatTimeOfDay(selectedConnector.lastSyncedAt)}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500">尚未执行同步</span>
                    )}
                  </div>
                </div>
                <SettingToggle
                  id={`data-sync-${selectedProvider.id}-toggle`}
                  label={`启用 ${selectedProvider.name} 同步`}
                  description="开启后将在后台定期同步浏览器端数据。"
                  checked={selectedConnector.enabled}
                  onChange={handleToggle}
                />
                {selectedProvider.highlights?.length ? (
                  <ul className="list-disc space-y-1 pl-5 text-xs text-slate-300">
                    {selectedProvider.highlights.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
              </header>

              <div className="space-y-4">
                {selectedProvider.fields.map((field) => {
                  const value = selectedConnector.config[field.key];
                  if (field.type === "switch") {
                    return (
                      <SettingToggle
                        key={field.key}
                        id={`data-sync-${selectedProvider.id}-${field.key}`}
                        label={field.label}
                        description={field.description}
                        checked={Boolean(value)}
                        onChange={(checked) => updateConnectorConfig(selectedProvider.id, field.key, checked)}
                      />
                    );
                  }

                  return (
                    <label key={field.key} className="flex flex-col gap-2 text-sm text-slate-200">
                      <span className="font-medium text-white">{field.label}</span>
                      <input
                        type={field.type === "password" || field.type === "token" ? "password" : "text"}
                        className="rounded-xl border border-white/10 bg-slate-900/40 px-4 py-3 text-sm text-white shadow-inner focus:border-primary focus:outline-none"
                        value={typeof value === "string" ? value : ""}
                        placeholder={field.placeholder}
                        onChange={(event) => updateConnectorConfig(selectedProvider.id, field.key, event.target.value)}
                      />
                      {field.description ? (
                        <span className="text-xs text-slate-400">{field.description}</span>
                      ) : null}
                    </label>
                  );
                })}
              </div>

              {selectedProvider.docsUrl ? (
                <p className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-slate-300">
                  查阅 <Link href={selectedProvider.docsUrl} className="text-primary underline" target="_blank" rel="noreferrer">
                    配置文档
                  </Link>{" "}
                  了解部署建议与最佳实践。
                </p>
              ) : null}

              {selectedConnector.error ? (
                <div className="flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-100">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  <div className="space-y-2">
                    <p className="font-medium">同步失败</p>
                    <p className="leading-relaxed">{selectedConnector.error}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      className="border border-white/20 px-3 py-1 text-xs text-rose-100 hover:border-white/40 hover:text-white"
                      onClick={handleClearError}
                    >
                      我已修复，清除错误
                    </Button>
                  </div>
                </div>
              ) : null}

              <div className="flex flex-wrap items-center gap-3">
                <Button type="button" onClick={handleSync} className="inline-flex items-center gap-2">
                  <RefreshCcw className="h-4 w-4" aria-hidden />
                  立即同步
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleReset}
                  className="border border-white/10 px-3 py-2 text-xs text-slate-200 hover:border-white/20"
                >
                  重置配置
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 text-sm text-slate-400">
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              <p>正在加载同步配置…</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
