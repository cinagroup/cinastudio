"use client";

import { useMemo } from "react";

import { type AppStatus, useAppStore } from "@/lib/store";
const STATUS_LABEL: Record<AppStatus, string> = {
  idle: "未连接",
  connecting: "连接中…",
  connected: "实时同步已连接",
};

export function StatusIndicator() {
  const status = useAppStore((state) => state.status);

  const color = useMemo(() => {
    switch (status) {
      case "connected":
        return "bg-emerald-500";
      case "connecting":
        return "bg-amber-500";
      default:
        return "bg-slate-500";
    }
  }, [status]);

  return (
    <div className="flex items-center gap-2 text-sm text-slate-400">
      <span className={`h-2 w-2 rounded-full ${color}`} aria-hidden />
      <span>{STATUS_LABEL[status]}</span>
    </div>
  );
}
