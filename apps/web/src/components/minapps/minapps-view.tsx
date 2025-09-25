"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppWindow, Filter, Link2, Plus, Search, Sparkles, Tags } from "lucide-react";

import type { MiniAppCategoryId, SharedMiniApp } from "@cinaseek/web-shared/minapps";

import { Button } from "@/components/ui/button";
import { useMinappsStore } from "@/lib/stores/minapps";

import { MiniAppCard } from "./mini-app-card";

type FormState = {
  name: string;
  url: string;
  description: string;
  icon: string;
  category: MiniAppCategoryId | "";
  tagsInput: string;
};

const INITIAL_FORM: FormState = {
  name: "",
  url: "",
  description: "",
  icon: "",
  category: "",
  tagsInput: "",
};

export function MinappsView() {
  const router = useRouter();
  const {
    apps,
    categories,
    tags,
    filters,
    settings,
    addCustomApp,
    removeApp,
    togglePin,
    setFilters,
    setOpenInNewTab,
    markLaunched,
  } = useMinappsStore();

  const [form, setForm] = useState<FormState>(() => ({
    ...INITIAL_FORM,
    category: categories[0]?.id ?? "workspace",
  }));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm((current) => ({
      ...current,
      category: current.category || (categories[0]?.id ?? "workspace"),
    }));
  }, [categories]);

  const categoryMap = useMemo(() => {
    const map = new Map<MiniAppCategoryId, { name: string }>();
    categories.forEach((category) => {
      map.set(category.id, { name: category.name });
    });
    return map;
  }, [categories]);

  const filteredApps = useMemo(() => {
    return apps
      .filter((app) => {
        if (filters.showPinned && !app.pinned) {
          return false;
        }
        if (filters.category && filters.category !== "all" && app.category !== filters.category) {
          return false;
        }
        if (filters.tag && filters.tag !== "all" && !app.tags.includes(filters.tag)) {
          return false;
        }
        if (filters.search) {
          const query = filters.search.toLowerCase();
          const haystack = `${app.name} ${app.description} ${app.url}`.toLowerCase();
          if (!haystack.includes(query)) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if ((a.pinned ? 1 : 0) !== (b.pinned ? 1 : 0)) {
          return (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0);
        }
        const launchDiff = (b.launchCount ?? 0) - (a.launchCount ?? 0);
        if (launchDiff !== 0) {
          return launchDiff;
        }
        return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
      });
  }, [apps, filters]);

  const pinnedCount = useMemo(() => apps.filter((app) => app.pinned).length, [apps]);
  const customCount = useMemo(() => apps.filter((app) => app.custom).length, [apps]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const name = form.name.trim();
    const url = form.url.trim();
    if (!name || !url) {
      setError("请填写名称和链接");
      return;
    }

    const tagsInput = form.tagsInput
      .split(/[,，]/)
      .map((tag) => tag.trim())
      .filter(Boolean);

    addCustomApp({
      name,
      url,
      description: form.description.trim(),
      category: (form.category || categories[0]?.id || "productivity") as MiniAppCategoryId,
      icon: form.icon.trim() || undefined,
      tags: tagsInput,
    });

    setForm({
      ...INITIAL_FORM,
      category: categories[0]?.id ?? "workspace",
    });
  }

  function handleAddTag(tagId: string) {
    setForm((current) => {
      if (!current.tagsInput) {
        return { ...current, tagsInput: tagId };
      }
      const exists = current.tagsInput
        .split(/[,，]/)
        .map((tag) => tag.trim())
        .includes(tagId);
      if (exists) {
        return current;
      }
      return { ...current, tagsInput: `${current.tagsInput}, ${tagId}` };
    });
  }

  function handleLaunch(app: SharedMiniApp) {
    markLaunched(app.id);
    if (typeof window === "undefined") {
      return;
    }
    const isExternal = /^https?:\/\//i.test(app.url);
    if (settings.openInNewTab) {
      window.open(app.url, "_blank", "noopener,noreferrer");
      return;
    }
    if (isExternal) {
      window.location.assign(app.url);
    } else {
      router.push(app.url);
    }
  }

  function handleRemove(id: string) {
    removeApp(id);
  }

  return (
    <div className="flex h-full flex-col gap-8 overflow-y-auto px-4 py-8 sm:px-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-primary/80">
            <AppWindow className="h-4 w-4" /> Mini Apps
          </p>
          <h1 className="text-2xl font-semibold text-slate-50">迷你应用中心</h1>
          <p className="max-w-3xl text-sm text-slate-300">
            汇总 Electron 时代的 WebView 快捷入口，支持在浏览器端搜索、置顶、自定义与统一的打开策略。
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-xs text-slate-200">
          <Sparkles className="h-4 w-4 text-primary" />
          <span>已迁移 {apps.length} 个入口，其中 {customCount} 个为自定义应用。</span>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-slate-950/70 p-6">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-primary/70">
            <Filter className="h-4 w-4" /> 筛选器
          </div>
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-200">
              <Search className="h-4 w-4 text-slate-500" />
              <input
                type="search"
                value={filters.search ?? ""}
                placeholder="搜索迷你应用或网址"
                onChange={(event) => setFilters({ search: event.target.value })}
                className="flex-1 bg-transparent outline-none placeholder:text-slate-500"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-xs text-slate-300">
                类别
                <select
                  value={filters.category ?? "all"}
                  onChange={(event) =>
                    setFilters({ category: event.target.value as MiniAppCategoryId | "all" })
                  }
                  className="rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="all">全部类别</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-2 text-xs text-slate-300">
                标签
                <select
                  value={filters.tag ?? "all"}
                  onChange={(event) => setFilters({ tag: event.target.value })}
                  className="rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="all">全部标签</option>
                  {tags.map((tag) => (
                    <option key={tag.id} value={tag.id}>
                      {tag.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="flex items-center gap-2 text-xs text-slate-300">
              <input
                type="checkbox"
                checked={Boolean(filters.showPinned)}
                onChange={(event) => setFilters({ showPinned: event.target.checked })}
                className="h-4 w-4 rounded border-white/20 bg-slate-900 text-primary focus:ring-primary/40"
              />
              仅显示置顶
            </label>
            {filters.showPinned ? (
              <p className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-xs text-primary">
                当前仅展示置顶应用，可在下方取消置顶以恢复完整列表。
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-slate-950/70 p-6">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-primary/70">
            <Link2 className="h-4 w-4" /> 打开策略
          </div>
          <p className="text-sm text-slate-300">
            浏览器端默认在新标签页打开迷你应用，支持切换为当前页面跳转。扩展桥接的入口建议保持新标签页以便授权。
          </p>
          <label className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-200">
            <div className="flex flex-col">
              <span className="font-medium">在新标签页打开应用</span>
              <span className="text-xs text-slate-400">关闭后将直接在当前标签内跳转内部页面。</span>
            </div>
            <input
              type="checkbox"
              checked={settings.openInNewTab}
              onChange={(event) => setOpenInNewTab(event.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-slate-900 text-primary focus:ring-primary/40"
              aria-label="在新标签页打开应用"
            />
          </label>
          <div className="grid gap-3 text-xs text-slate-300 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-[11px] uppercase tracking-[0.35em] text-slate-400">已置顶</p>
              <p className="mt-2 text-2xl font-semibold text-slate-50">{pinnedCount}</p>
              <p className="mt-1 text-slate-400">常用入口建议保持置顶，方便在列表顶部快速访问。</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-[11px] uppercase tracking-[0.35em] text-slate-400">自定义</p>
              <p className="mt-2 text-2xl font-semibold text-slate-50">{customCount}</p>
              <p className="mt-1 text-slate-400">团队可根据迁移阶段添加新的 Web 工具并随时删除。</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-slate-950/70 p-6">
        <form className="flex flex-col gap-4" onSubmit={handleSubmit} data-testid="miniapps-form">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-primary/70">
            <Plus className="h-4 w-4" /> 新增迷你应用
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-xs text-slate-300">
              名称
              <input
                type="text"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="例如：知识库实时同步"
                className="rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </label>
            <label className="flex flex-col gap-2 text-xs text-slate-300">
              链接
              <input
                type="url"
                value={form.url}
                onChange={(event) => setForm((current) => ({ ...current, url: event.target.value }))}
                placeholder="https:// 或内部路由"
                className="rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
            <label className="flex flex-col gap-2 text-xs text-slate-300">
              描述
              <textarea
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                placeholder="简要说明该入口的用途及目标用户"
                className="min-h-[96px] rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </label>
            <div className="flex flex-col gap-3">
              <label className="flex flex-col gap-2 text-xs text-slate-300">
                类别
                <select
                  value={form.category}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      category: event.target.value as MiniAppCategoryId,
                    }))
                  }
                  className="rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-2 text-xs text-slate-300">
                图标（可选）
                <input
                  type="text"
                  value={form.icon}
                  onChange={(event) => setForm((current) => ({ ...current, icon: event.target.value }))}
                  placeholder="例如：🚀"
                  className="rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </label>
            </div>
          </div>
          <label className="flex flex-col gap-2 text-xs text-slate-300">
            标签（以逗号分隔）
            <input
              type="text"
              value={form.tagsInput}
              onChange={(event) => setForm((current) => ({ ...current, tagsInput: event.target.value }))}
              placeholder="例如：team, research"
              className="rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </label>
          {tags.length ? (
            <div className="flex flex-wrap gap-2 text-xs text-slate-300">
              <span className="flex items-center gap-1 text-slate-400">
                <Tags className="h-4 w-4" /> 快速添加：
              </span>
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleAddTag(tag.id)}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 transition hover:border-primary/40 hover:text-primary"
                >
                  #{tag.label}
                </button>
              ))}
            </div>
          ) : null}
          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
          <div className="flex justify-end">
            <Button type="submit" className="px-4 py-2 text-xs uppercase tracking-[0.35em]">
              添加迷你应用
            </Button>
          </div>
        </form>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredApps.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/40 p-10 text-center text-sm text-slate-400">
            未找到匹配的迷你应用，请调整筛选条件或添加新的入口。
          </div>
        ) : (
          filteredApps.map((app) => (
            <MiniAppCard
              key={app.id}
              app={app}
              categoryName={categoryMap.get(app.category)?.name}
              openInNewTab={settings.openInNewTab}
              onTogglePin={togglePin}
              onRemove={app.custom ? handleRemove : undefined}
              onLaunch={handleLaunch}
            />
          ))
        )}
      </section>
    </div>
  );
}
