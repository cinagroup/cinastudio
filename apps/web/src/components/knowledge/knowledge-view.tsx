"use client";

import { Search } from "lucide-react";
import { useMemo } from "react";
import { shallow } from "zustand/shallow";

import { KnowledgeCard } from "@/components/knowledge/knowledge-card";
import { useKnowledgeStore } from "@/lib/stores/knowledge";
import { cn } from "@/utils/cn";

export function KnowledgeView() {
  const { bases, activeBaseId, itemsByBase, searchQuery, setActiveBase, setSearchQuery, togglePin } =
    useKnowledgeStore(
      (state) => ({
        bases: state.bases,
        activeBaseId: state.activeBaseId,
        itemsByBase: state.itemsByBase,
        searchQuery: state.searchQuery,
        setActiveBase: state.setActiveBase,
        setSearchQuery: state.setSearchQuery,
        togglePin: state.togglePin,
      }),
      shallow,
    );

  const activeBase = useMemo(
    () => bases.find((base) => base.id === activeBaseId) ?? bases[0],
    [activeBaseId, bases],
  );

  const activeBaseIdValue = activeBase?.id ?? null;
  const baseItems = useMemo(
    () => (activeBaseIdValue ? itemsByBase[activeBaseIdValue] ?? [] : []),
    [activeBaseIdValue, itemsByBase],
  );

  const query = searchQuery.trim().toLowerCase();
  const filteredItems = useMemo(() => {
    const items = [...baseItems].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
    if (!query) {
      return items;
    }
    return items.filter((item) => {
      const haystack = `${item.title} ${item.summary} ${item.tags.join(" ")}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [baseItems, query]);

  const pinnedItems = filteredItems.filter((item) => item.pinned);
  const regularItems = filteredItems.filter((item) => !item.pinned);

  if (!activeBase) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-slate-400">
        尚未创建知识库，稍后将在这里展示迁移进度。
      </div>
    );
  }

  return (
    <div className="flex h-full flex-1 flex-col lg:flex-row">
      <aside className="w-full flex-shrink-0 border-b border-white/10 bg-slate-900/40 p-4 lg:w-80 lg:border-b-0 lg:border-r">
        <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">知识库</p>
            <p className="text-sm text-slate-300">在浏览器端管理团队沉淀的结构化资料。</p>
          </div>
          <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 shadow-inner focus-within:border-primary">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="search"
              placeholder="搜索文档、标签或来源"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="flex-1 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
            />
          </label>
          <div className="space-y-2">
            {bases.map((base) => {
              const isActive = base.id === activeBase.id;
              return (
                <button
                  key={base.id}
                  type="button"
                  onClick={() => setActiveBase(base.id)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-3 text-left transition hover:border-white/10 hover:bg-white/10",
                    isActive && "border-primary/60 bg-primary/10 text-primary-foreground",
                  )}
                >
                  <span className="mt-0.5 text-xl" aria-hidden>
                    {base.icon}
                  </span>
                  <span className="flex flex-col gap-1">
                    <span className="text-sm font-semibold text-slate-100">{base.name}</span>
                    <span className="text-xs text-slate-400">{base.description}</span>
                    <span className="text-[11px] uppercase tracking-[0.3em] text-slate-500">
                      {base.stats.documents} 条资料 · {base.stats.automations ?? 0} 个自动化
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </aside>
      <section className="flex flex-1 flex-col overflow-y-auto">
        <div className="border-b border-white/10 bg-slate-900/50 px-4 py-6 sm:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">当前知识库</p>
              <h1 className="text-2xl font-semibold text-slate-50 sm:text-3xl">{activeBase.name}</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-300">{activeBase.description}</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 uppercase tracking-[0.3em]">
                {filteredItems.length} 条结果
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 uppercase tracking-[0.3em]">
                {pinnedItems.length} 个已固定
              </span>
            </div>
          </div>
        </div>
        <div className="flex-1 space-y-10 px-4 py-8 sm:px-8">
          {pinnedItems.length > 0 ? (
            <section className="space-y-4">
              <header className="flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">已固定</h2>
                <span className="text-xs text-slate-500">关键资料，优先展示于团队协作视图</span>
              </header>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {pinnedItems.map((item) => (
                  <KnowledgeCard
                    key={item.id}
                    item={item}
                    accentColor={activeBase.accentColor}
                    onTogglePin={(id) => togglePin({ baseId: activeBase.id, itemId: id })}
                  />
                ))}
              </div>
            </section>
          ) : null}

          <section className="space-y-4">
            <header className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">所有资源</h2>
              <span className="text-xs text-slate-500">按更新时间倒序排列</span>
            </header>
            {regularItems.length === 0 ? (
              <div className="flex min-h-[160px] items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-8 text-sm text-slate-400">
                {query ? "没有匹配的资料，请尝试更换搜索关键词。" : "该知识库尚未录入资料，即将同步迁移。"}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {regularItems.map((item) => (
                  <KnowledgeCard
                    key={item.id}
                    item={item}
                    accentColor={activeBase.accentColor}
                    onTogglePin={(id) => togglePin({ baseId: activeBase.id, itemId: id })}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </section>
    </div>
  );
}
