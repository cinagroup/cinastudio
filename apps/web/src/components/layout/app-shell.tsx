"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { type ReactNode, useState } from "react";

import { StatusIndicator } from "@/components/status-indicator";
import { useRealtimeConnection } from "@/hooks/useRealtimeConnection";
import { NAV_ITEMS } from "@/lib/navigation/nav-items";
import { cn } from "@/utils/cn";

export function AppShell({ children }: { children: ReactNode }) {
  useRealtimeConnection();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  function handleCloseSidebar() {
    setIsSidebarOpen(false);
  }

  return (
    <div className="relative flex min-h-screen bg-slate-950 text-slate-100">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 border-r border-white/10 bg-slate-950/95 px-6 py-8 shadow-2xl backdrop-blur transition-transform duration-200 ease-in-out md:static md:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="flex h-full flex-col gap-8">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-3 text-sm font-semibold text-slate-200"
              onClick={handleCloseSidebar}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-lg">🌸</span>
              <span>CinaSeek</span>
            </Link>
            <button
              type="button"
              onClick={handleCloseSidebar}
              className="rounded-lg border border-white/10 p-2 text-slate-300 transition hover:border-white/20 hover:text-white md:hidden"
              aria-label="关闭导航"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <nav className="flex flex-1 flex-col gap-2">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex flex-col gap-2 rounded-xl border border-white/5 bg-white/[0.03] p-4 text-sm transition hover:border-white/10 hover:bg-white/10",
                    isActive && "border-primary/60 bg-primary/10 text-primary-foreground",
                  )}
                  onClick={handleCloseSidebar}
                >
                  <div className="flex items-center gap-2 font-medium">
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </div>
                  <p className="text-xs text-slate-400 group-hover:text-slate-200">
                    {item.description}
                  </p>
                </Link>
              );
            })}
          </nav>
          <div className="rounded-2xl border border-white/5 bg-white/5 p-4 text-xs text-slate-200">
            <p className="font-semibold text-slate-100">迁移路线图</p>
            <p className="mt-2 text-slate-300">
              启动台现已联动迷你应用中心、文件工作台与扩展桥接状态，欢迎体验浏览器端快捷入口与置顶能力。
            </p>
          </div>
        </div>
      </aside>
      {isSidebarOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          aria-label="关闭导航遮罩"
          onClick={handleCloseSidebar}
        />
      ) : null}
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-white/10 bg-slate-950/70 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-lg border border-white/10 p-2 text-slate-300 transition hover:border-white/20 hover:text-white md:hidden"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="打开导航"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden flex-col text-xs font-medium text-slate-400 md:flex">
              <span className="text-sm font-semibold text-slate-100">CinaSeek Workspace</span>
              <span>浏览器端体验重构进行中</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden rounded-full border border-primary/30 bg-primary/15 px-3 py-1 text-xs font-medium text-primary md:inline-flex">
              Alpha
            </span>
            <StatusIndicator />
          </div>
        </header>
        <main className="flex flex-1 flex-col overflow-hidden bg-slate-950/60">{children}</main>
      </div>
    </div>
  );
}
