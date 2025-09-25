"use client";

import { FormEvent, useMemo, useState } from "react";
import { Filter, PlusCircle, Search } from "lucide-react";

import { AGENT_CATEGORY_PRESETS, type AgentDefinition } from "@cinaseek/web-shared/agents";

import { AgentCard } from "@/components/agents/agent-card";
import { Button } from "@/components/ui/button";
import { useAgentsStore } from "@/lib/stores/agents";
import { cn } from "@/utils/cn";

interface AgentFormState {
  name: string;
  description: string;
  avatar: string;
  tags: string;
  capabilities: string;
  categories: string;
  prompt: string;
}

const DEFAULT_FORM_STATE: AgentFormState = {
  name: "",
  description: "",
  avatar: "",
  tags: "",
  capabilities: "",
  categories: "",
  prompt: "",
};

function parseList(value: string): string[] {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function AgentView() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState<AgentFormState>(DEFAULT_FORM_STATE);

  const { systemAgents, customAgents, pinnedAgentIds, addCustomAgent, removeCustomAgent, togglePinned } =
    useAgentsStore((state) => ({
      systemAgents: state.systemAgents,
      customAgents: state.customAgents,
      pinnedAgentIds: state.pinnedAgentIds,
      addCustomAgent: state.addCustomAgent,
      removeCustomAgent: state.removeCustomAgent,
      togglePinned: state.togglePinned,
    }));

  const categories = useMemo(() => {
    const categorySet = new Set<string>(AGENT_CATEGORY_PRESETS);
    [...systemAgents, ...customAgents].forEach((agent) => {
      agent.categories.forEach((category) => categorySet.add(category));
    });
    return ["全部", ...Array.from(categorySet)];
  }, [systemAgents, customAgents]);

  const agents = useMemo(() => {
    const allAgents: AgentDefinition[] = [...customAgents, ...systemAgents];

    return allAgents.filter((agent) => {
      const matchesCategory = !activeCategory || activeCategory === "全部"
        ? true
        : agent.categories.includes(activeCategory);
      if (!matchesCategory) {
        return false;
      }

      if (!search.trim()) {
        return true;
      }
      const normalizedSearch = search.trim().toLowerCase();
      return (
        agent.name.toLowerCase().includes(normalizedSearch) ||
        agent.description.toLowerCase().includes(normalizedSearch) ||
        agent.tags.some((tag) => tag.toLowerCase().includes(normalizedSearch)) ||
        agent.capabilities.some((capability) => capability.toLowerCase().includes(normalizedSearch))
      );
    });
  }, [activeCategory, customAgents, search, systemAgents]);

  const pinnedAgents = agents.filter((agent) => pinnedAgentIds.includes(agent.id));
  const otherAgents = agents.filter((agent) => !pinnedAgentIds.includes(agent.id));

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const id = addCustomAgent({
      name: form.name,
      description: form.description,
      avatar: form.avatar,
      prompt: form.prompt,
      tags: parseList(form.tags),
      capabilities: parseList(form.capabilities),
      categories: parseList(form.categories),
    });

    if (id) {
      setForm(DEFAULT_FORM_STATE);
      setIsCreating(false);
    }
  }

  function handleCancel() {
    setForm(DEFAULT_FORM_STATE);
    setIsCreating(false);
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 lg:px-6">
      <header className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-primary">Assistants</p>
            <h1 className="text-3xl font-semibold text-white">助手工作台</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              管理系统内置助手与自定义专家角色，按能力和分类快速筛选，固定常用搭档以便在会话中快速调用。
            </p>
          </div>
          <Button type="button" onClick={() => setIsCreating(true)} className="gap-2">
            <PlusCircle className="h-4 w-4" />
            新建助手
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
          <Filter className="h-3.5 w-3.5" />
          <span>可通过分类筛选与搜索组合查找，结果自动按固定顺序展示。</span>
        </div>
      </header>

      {isCreating ? (
        <form
          className="rounded-3xl border border-primary/40 bg-primary/5 p-6 shadow-inner"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col gap-4 md:grid md:grid-cols-2 md:gap-6">
            <label className="flex flex-col gap-2 text-sm text-slate-200">
              名称
              <input
                required
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                className="rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                placeholder="例如：浏览器巡检官"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-slate-200">
              头像/Emoji
              <input
                value={form.avatar}
                onChange={(event) => setForm((prev) => ({ ...prev, avatar: event.target.value }))}
                className="rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                placeholder="例如：🚀"
              />
            </label>
            <label className="md:col-span-2 flex flex-col gap-2 text-sm text-slate-200">
              描述
              <input
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                className="rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                placeholder="为团队说明该助手的擅长领域"
              />
            </label>
            <label className="md:col-span-2 flex flex-col gap-2 text-sm text-slate-200">
              能力标签（逗号或换行分隔）
              <textarea
                value={form.capabilities}
                onChange={(event) => setForm((prev) => ({ ...prev, capabilities: event.target.value }))}
                className="min-h-[80px] rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                placeholder="例如：流程诊断, API 编排"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-slate-200">
              分类（逗号或换行分隔）
              <input
                value={form.categories}
                onChange={(event) => setForm((prev) => ({ ...prev, categories: event.target.value }))}
                className="rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                placeholder="例如：系统运营"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-slate-200">
              标签（逗号或换行分隔）
              <input
                value={form.tags}
                onChange={(event) => setForm((prev) => ({ ...prev, tags: event.target.value }))}
                className="rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                placeholder="例如：巡检, 自动化"
              />
            </label>
            <label className="md:col-span-2 flex flex-col gap-2 text-sm text-slate-200">
              Prompt
              <textarea
                value={form.prompt}
                onChange={(event) => setForm((prev) => ({ ...prev, prompt: event.target.value }))}
                className="min-h-[100px] rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                placeholder="编写该助手的角色设定与指令"
              />
            </label>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:border-white/20 hover:text-white"
            >
              取消
            </button>
            <Button type="submit">保存助手</Button>
          </div>
        </form>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[240px,1fr]">
        <aside className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
          <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-300 focus-within:border-primary">
            <Search className="h-4 w-4" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="搜索助手或能力"
              className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
            />
          </label>
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-widest text-slate-400">分类</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category === "全部" ? null : category)}
                  className={cn(
                    "rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300 transition hover:border-primary/40 hover:text-white",
                    (activeCategory === category || (category === "全部" && !activeCategory)) &&
                      "border-primary/50 bg-primary/15 text-primary",
                  )}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <section className="space-y-8">
          {pinnedAgents.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-primary">固定助手</h2>
                <p className="text-xs text-slate-400">共 {pinnedAgents.length} 个</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {pinnedAgents.map((agent) => (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    isPinned
                    onTogglePinned={togglePinned}
                    onRemove={removeCustomAgent}
                  />
                ))}
              </div>
            </div>
          ) : null}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-200">全部助手</h2>
              <p className="text-xs text-slate-400">共 {agents.length} 个</p>
            </div>
            {agents.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-10 text-center text-sm text-slate-400">
                未找到匹配的助手，尝试调整搜索词或新建一个专属角色。
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {otherAgents.map((agent) => (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    isPinned={pinnedAgentIds.includes(agent.id)}
                    onTogglePinned={togglePinned}
                    onRemove={removeCustomAgent}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
