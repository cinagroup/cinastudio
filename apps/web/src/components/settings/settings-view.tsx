"use client";

import Link from "next/link";
import { RefreshCcw } from "lucide-react";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { SettingCard } from "@/components/settings/setting-card";
import { SettingToggle } from "@/components/settings/setting-toggle";
import { McpSettings } from "@/components/settings/mcp-settings";
import { WebSearchSettings } from "@/components/settings/web-search-settings";
import { DataSyncSettings } from "@/components/settings/data-sync-settings";
import {
  useSettingsStore,
  type MessageStyleOption,
  type SettingsShortcutId,
  type SettingsThemeId,
} from "@/lib/stores/settings";

const MESSAGE_STYLE_OPTIONS: Array<{ id: MessageStyleOption; title: string; description: string }> = [
  {
    id: "bubble",
    title: "气泡模式",
    description: "与桌面端一致的圆角气泡布局，适合内容较长的对话。",
  },
  {
    id: "compact",
    title: "紧凑模式",
    description: "减少留白，让技术讨论或代码审阅更加集中。",
  },
];

export function SettingsView() {
  const {
    themes,
    languages,
    shortcuts,
    preferences,
    setTheme,
    setLanguage,
    setShortcut,
    setMessageStyle,
    setFontScale,
    setPreferences,
    reset,
  } = useSettingsStore((state) => ({
    themes: state.themes,
    languages: state.languages,
    shortcuts: state.shortcuts,
    preferences: state.preferences,
    setTheme: state.setTheme,
    setLanguage: state.setLanguage,
    setShortcut: state.setShortcut,
    setMessageStyle: state.setMessageStyle,
    setFontScale: state.setFontScale,
    setPreferences: state.setPreferences,
    reset: state.reset,
  }));

  const themeRadios = useMemo(() => themes, [themes]);
  const shortcutRadios = useMemo(() => shortcuts, [shortcuts]);

  function handleThemeChange(id: SettingsThemeId) {
    if (preferences.themeId !== id) {
      setTheme(id);
    }
  }

  function handleShortcutChange(id: SettingsShortcutId) {
    if (preferences.sendShortcutId !== id) {
      setShortcut(id);
    }
  }

  function handleMessageStyleChange(style: MessageStyleOption) {
    if (preferences.messageStyle !== style) {
      setMessageStyle(style);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 sm:px-8">
      <header className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/70 to-slate-800/40 p-8 shadow-lg shadow-black/40">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Settings</p>
            <h1 className="text-3xl font-bold text-white sm:text-4xl">设置中心</h1>
            <p className="text-sm text-slate-300">
              自定义 PWA 与浏览器扩展的体验，开启与桌面端一致的快捷键、主题与系统能力。
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            onClick={reset}
            className="inline-flex items-center gap-2 border border-white/10 px-4 py-2 text-xs text-slate-200 hover:border-white/20"
          >
            <RefreshCcw className="h-4 w-4" aria-hidden />
            恢复默认设置
          </Button>
        </div>
        <p className="mt-6 text-xs text-slate-400">
          所有偏好将保存在浏览器本地存储，可通过扩展桥接同步到其他浏览器或团队成员。
        </p>
      </header>

      <SettingCard title="全局首选项" description="配置界面语言、主题与发送快捷键，确保团队协作体验一致。">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">界面主题</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {themeRadios.map((theme) => {
                const isActive = preferences.themeId === theme.id;
                return (
                  <label
                    key={theme.id}
                    className={`group relative flex cursor-pointer flex-col gap-2 rounded-2xl border bg-gradient-to-br p-4 text-sm transition hover:border-primary/60 hover:shadow-lg hover:shadow-primary/20 ${theme.accent} ${
                      isActive ? "border-primary/70 text-white" : "border-white/10 text-slate-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="workspace-theme"
                      value={theme.id}
                      className="sr-only"
                      checked={isActive}
                      onChange={() => handleThemeChange(theme.id)}
                      aria-label={theme.name}
                    />
                    <span className="text-sm font-semibold">{theme.name}</span>
                    <span className="text-xs text-slate-100/90 group-hover:text-white/90">{theme.description}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">界面语言</p>
            <label className="mt-3 flex flex-col gap-2 text-sm text-slate-200">
              <span className="text-xs text-slate-400">选择语言</span>
              <select
                className="rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white shadow-inner focus:border-primary focus:outline-none"
                value={preferences.languageId}
                onChange={(event) => setLanguage(event.target.value)}
                aria-label="界面语言"
              >
                {languages.map((language) => (
                  <option key={language.id} value={language.id}>
                    {language.label}
                  </option>
                ))}
              </select>
            </label>
            <p className="mt-2 text-xs text-slate-400">
              {languages.find((language) => language.id === preferences.languageId)?.description}
            </p>
          </div>

          <div className="md:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">发送消息快捷键</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {shortcutRadios.map((shortcut) => {
                const isActive = preferences.sendShortcutId === shortcut.id;
                return (
                  <label
                    key={shortcut.id}
                    className={`flex cursor-pointer flex-col gap-2 rounded-2xl border border-white/10 bg-slate-900/40 p-4 text-sm transition hover:border-primary/60 hover:bg-slate-900/60 ${
                      isActive ? "border-primary/70 text-white" : "text-slate-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="send-shortcut"
                      value={shortcut.id}
                      className="sr-only"
                      checked={isActive}
                      onChange={() => handleShortcutChange(shortcut.id)}
                      aria-label={shortcut.label}
                    />
                    <span className="text-sm font-semibold">{shortcut.label}</span>
                    <span className="text-xs text-slate-400">{shortcut.description}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </SettingCard>

      <SettingCard title="界面与可读性" description="调整消息外观与字体大小，让浏览器端的阅读体验更舒适。">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">消息样式</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {MESSAGE_STYLE_OPTIONS.map((option) => {
                const isActive = preferences.messageStyle === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleMessageStyleChange(option.id)}
                    className={`flex h-full flex-col gap-2 rounded-2xl border border-white/10 bg-slate-900/40 p-4 text-left text-sm transition hover:border-primary/60 hover:bg-slate-900/60 ${
                      isActive ? "border-primary/70 text-white" : "text-slate-200"
                    }`}
                    aria-pressed={isActive}
                  >
                    <span className="text-sm font-semibold">{option.title}</span>
                    <span className="text-xs text-slate-400">{option.description}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex flex-col justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">界面字号</p>
              <div className="mt-4 flex items-center gap-4">
                <input
                  type="range"
                  min={0.85}
                  max={1.25}
                  step={0.05}
                  value={preferences.fontScale}
                  onChange={(event) => setFontScale(Number(event.target.value))}
                  className="w-full accent-primary"
                  aria-label="界面字号"
                />
                <span className="w-16 text-right text-sm text-slate-200">{Math.round(preferences.fontScale * 100)}%</span>
              </div>
            </div>
            <p className="text-xs text-slate-400">字号设置会影响对话、文件列表与笔记等页面的排版密度。</p>
          </div>
        </div>
      </SettingCard>

      <SettingCard title="对话体验" description="决定在工作区中展示哪些面板与辅助信息。">
        <div className="space-y-4">
          <SettingToggle
            id="toggle-show-assistants"
            label="显示助手面板"
            description="在左侧展示助手列表，便于快速切换。"
            checked={preferences.showAssistants}
            onChange={(value) => setPreferences({ showAssistants: value })}
          />
          <SettingToggle
            id="toggle-show-topics"
            label="显示话题列表"
            description="保留多话题导航，继续使用 Electron 版的组织方式。"
            checked={preferences.showTopics}
            onChange={(value) => setPreferences({ showTopics: value })}
          />
          <SettingToggle
            id="toggle-show-timestamps"
            label="显示消息时间"
            description="在消息旁保留时间戳，方便追踪协同历史。"
            checked={preferences.showTimestamps}
            onChange={(value) => setPreferences({ showTimestamps: value })}
          />
          <SettingToggle
            id="toggle-topic-naming"
            label="自动命名话题"
            description="使用代理自动生成话题标题，保持与桌面端一致的整理体验。"
            checked={preferences.enableTopicNaming}
            onChange={(value) => setPreferences({ enableTopicNaming: value })}
          />
        </div>
      </SettingCard>

      <SettingCard title="系统能力" description="为 PWA 与扩展开启通知、离线缓存等系统特性。">
        <div className="space-y-4">
          <SettingToggle
            id="toggle-notifications"
            label="启用浏览器通知"
            description="允许发送消息提醒与翻译完成提示。"
            checked={preferences.enableNotifications}
            onChange={(value) => setPreferences({ enableNotifications: value })}
          />
          <SettingToggle
            id="toggle-realtime"
            label="保持扩展桥接"
            description="与浏览器扩展保持长连接，实时接收网页选区与指令。"
            checked={preferences.enableRealtimeBridge}
            onChange={(value) => setPreferences({ enableRealtimeBridge: value })}
          />
          <SettingToggle
            id="toggle-offline-cache"
            label="离线缓存核心数据"
            description="在 Service Worker 中缓存知识库与文件元数据，弱网环境下也能使用。"
            checked={preferences.enableOfflineCache}
            onChange={(value) => setPreferences({ enableOfflineCache: value })}
          />
          <SettingToggle
            id="toggle-extension-hints"
            label="显示扩展提示"
            description="在界面中展示安装扩展的入口与状态提醒。"
            checked={preferences.enableExtensionHints}
            onChange={(value) => setPreferences({ enableExtensionHints: value })}
          />
        </div>
      </SettingCard>

      <SettingCard
        title="网页搜索"
        description="统一管理云端与自建搜索服务、结果压缩策略，以及团队订阅源聚合。"
      >
        <WebSearchSettings />
      </SettingCard>

      <SettingCard
        title="数据同步与备份"
        description="配置 WebDAV、S3、Notion、语雀等连接器，将浏览器端数据安全地回传至团队知识体系。"
      >
        <DataSyncSettings />
      </SettingCard>

      <SettingCard
        title="MCP 服务器"
        description="记录与筛选内置/自定义 MCP 服务、运行时依赖和同步状态，支持浏览器扩展与本地守护进程协同。"
      >
        <McpSettings />
      </SettingCard>

      <SettingCard title="引导与更新" description="控制启动台提示与实验特性标签的展示。">
        <div className="space-y-4">
          <SettingToggle
            id="toggle-launchpad-tips"
            label="展示启动台提示"
            description="在导航与 Launchpad 中显示迁移路线与能力推荐。"
            checked={preferences.enableLaunchpadTips}
            onChange={(value) => setPreferences({ enableLaunchpadTips: value })}
          />
          <SettingToggle
            id="toggle-beta-flags"
            label="显示实验特性标签"
            description="在页面中标注 alpha/beta 功能，以便团队了解当前进度。"
            checked={preferences.showBetaFeatures}
            onChange={(value) => setPreferences({ showBetaFeatures: value })}
          />
        </div>
      </SettingCard>

      <SettingCard
        title="记忆与上下文"
        description="协调浏览器端的长期记忆功能，与扩展桥接保持一致。"
      >
        <div className="space-y-4 text-sm text-slate-200">
          <p>
            记忆中心已经迁移至独立页面，支持用户分组、模型配置与自动事实提取。可在浏览器中与桌面端共享上下文。
          </p>
          <p>
            <Link
              href="/memory"
              className="inline-flex items-center gap-2 rounded-xl border border-primary/40 px-4 py-2 text-sm text-primary transition hover:border-primary/60 hover:bg-primary/10"
            >
              前往记忆中心
              <span aria-hidden className="text-xs text-primary/80">→</span>
            </Link>
          </p>
          <p className="text-xs text-slate-400">
            记忆配置（模型、维度、同步频率）与用户管理将在该页面进行，并与扩展保持统一。
          </p>
        </div>
      </SettingCard>
    </div>
  );
}
