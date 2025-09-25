"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { useState } from "react";

import { useRealtimeConnection } from "@/hooks/useRealtimeConnection";
import { Button, buttonStyles } from "@/components/ui/button";
import { StatusIndicator } from "@/components/status-indicator";
import { useAppStore } from "@/lib/store";
import { HERO_QUICK_LINK_IDS, NAV_ITEMS } from "@/lib/navigation/nav-items";

export function Hero() {
  useRealtimeConnection();
  const { message, setMessage } = useAppStore((state) => ({
    message: state.message,
    setMessage: state.setMessage,
  }));
  const [draft, setDraft] = useState(message);
  const quickLinks = HERO_QUICK_LINK_IDS.map((id) => NAV_ITEMS.find((item) => item.id === id)).filter(
    (item): item is (typeof NAV_ITEMS)[number] => Boolean(item),
  );

  function handleSubmit() {
    setMessage(draft);
  }

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-8 py-12">
      <div className="flex items-center gap-3 text-primary">
        <Sparkles className="h-6 w-6" />
        <span className="text-sm font-semibold uppercase tracking-widest">Preview</span>
      </div>
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          构建面向浏览器的下一代 CinaSeek 体验
        </h1>
        <p className="text-lg text-slate-300">
          基于 Next.js 14、Zustand 与 Socket.io 的全新 Web 架构，逐步承载 Cherry Studio 的核心能力，原生整合 MCP 服务器、数据同步连接器与浏览器扩展协同。
        </p>
      </div>
      <div className="space-y-3 rounded-2xl border border-white/5 bg-white/5 p-6 shadow-xl backdrop-blur">
        <label className="block text-sm font-medium text-slate-200" htmlFor="message">
          自定义欢迎语
        </label>
        <textarea
          id="message"
          className="min-h-[120px] w-full rounded-lg border border-white/10 bg-slate-900/40 p-4 text-base text-slate-100 shadow-inner focus:border-primary focus:outline-none"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <StatusIndicator />
          <div className="flex flex-wrap items-center gap-2">
            {quickLinks.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={buttonStyles(
                  "ghost",
                  "border border-white/10 px-4 py-2 text-xs text-slate-200 hover:border-white/20",
                )}
              >
                {item.label}
              </Link>
            ))}
            <Button type="button" onClick={handleSubmit}>
              更新消息
            </Button>
          </div>
        </div>
        <p className="text-sm text-slate-400">
          新增 Quick Panel：在任意页面按 <span className="rounded border border-white/10 px-1">⌘/Ctrl + K</span> 呼出快捷操作，快速切换助手或插入 Prompt。
        </p>
        <p className="text-sm text-slate-300">当前欢迎语：{message}</p>
      </div>
      <p className="text-sm text-slate-500">
        本页面用于验证核心基础设施是否就绪，包括 Tailwind 设计系统、Zustand 状态管理、Socket.io 客户端与 Jest 测试框架。
      </p>
    </section>
  );
}
