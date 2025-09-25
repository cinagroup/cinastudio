"use client";

import { useMemo, useState } from "react";
import {
  Brain,
  CalendarClock,
  Edit3,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useMemoryStore } from "@/lib/stores/memory";
import { formatDate, formatRelativeTime } from "@/utils/datetime";

export function MemoryView() {
  const {
    config,
    users,
    memories,
    llmOptions,
    embedderOptions,
    currentUserId,
    globalEnabled,
    filters,
    lastUpdatedAt,
    setGlobalEnabled,
    setCurrentUserId,
    setSearch,
    setLlmClient,
    setEmbedderClient,
    setEmbedderDimensions,
    setSyncCadence,
    toggleAutomaticFactExtraction,
    addMemory,
    updateMemory,
    deleteMemory,
    addUser,
  } = useMemoryStore((state) => ({
    config: state.config,
    users: state.users,
    memories: state.memories,
    llmOptions: state.llmOptions,
    embedderOptions: state.embedderOptions,
    currentUserId: state.currentUserId,
    globalEnabled: state.globalEnabled,
    filters: state.filters,
    lastUpdatedAt: state.lastUpdatedAt,
    setGlobalEnabled: state.setGlobalEnabled,
    setCurrentUserId: state.setCurrentUserId,
    setSearch: state.setSearch,
    setLlmClient: state.setLlmClient,
    setEmbedderClient: state.setEmbedderClient,
    setEmbedderDimensions: state.setEmbedderDimensions,
    setSyncCadence: state.setSyncCadence,
    toggleAutomaticFactExtraction: state.toggleAutomaticFactExtraction,
    addMemory: state.addMemory,
    updateMemory: state.updateMemory,
    deleteMemory: state.deleteMemory,
    addUser: state.addUser,
  }));

  const [draftMemory, setDraftMemory] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState("");

  const userSummaries = useMemo(
    () =>
      users.map((user) => ({
        ...user,
        total: memories.filter((memory) => memory.userId === user.id).length,
      })),
    [users, memories],
  );

  const filteredMemories = useMemo(() => {
    return memories.filter((memory) => {
      if (filters.userId && memory.userId !== filters.userId) {
        return false;
      }
      if (filters.search) {
        return memory.memory.toLowerCase().includes(filters.search.toLowerCase());
      }
      return true;
    });
  }, [memories, filters.userId, filters.search]);

  function handleCreateMemory(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draftMemory.trim()) {
      return;
    }
    addMemory({ memory: draftMemory.trim(), userId: currentUserId });
    setDraftMemory("");
  }

  function handleStartEdit(memoryId: string, value: string) {
    setEditingId(memoryId);
    setEditingDraft(value);
  }

  function handleSaveEdit(memoryId: string) {
    if (!editingDraft.trim()) {
      deleteMemory(memoryId);
      setEditingId(null);
      setEditingDraft("");
      return;
    }
    updateMemory(memoryId, { memory: editingDraft.trim() });
    setEditingId(null);
    setEditingDraft("");
  }

  function handleCreateUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = newUserName.trim();
    if (!value) {
      return;
    }
    const id = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    if (!id) {
      return;
    }
    addUser({ id, label: value });
    setNewUserName("");
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-10 sm:px-8">
      <header className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-800/60 p-8 shadow-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Memories</p>
            <h1 className="text-3xl font-bold text-white sm:text-4xl">知识记忆中心</h1>
            <p className="text-sm text-slate-300">
              管理团队的长期偏好、会议摘要与品牌术语，保持浏览器端与扩展的上下文一致。
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant={globalEnabled ? "default" : "ghost"}
              onClick={() => setGlobalEnabled(!globalEnabled)}
              className={globalEnabled ? "bg-primary/80" : "border border-white/10 text-slate-200"}
            >
              <ShieldCheck className="mr-2 h-4 w-4" />
              {globalEnabled ? "全局记忆已启用" : "启用全局记忆"}
            </Button>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
            <Brain className="h-10 w-10 rounded-full bg-primary/15 p-2 text-primary" />
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">记忆条目</p>
              <p className="text-xl font-semibold text-white">{memories.length}</p>
              <p className="text-xs text-slate-400">同步至 {config.llmClient?.label ?? "未配置模型"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
            <Users className="h-10 w-10 rounded-full bg-primary/15 p-2 text-primary" />
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">关联用户</p>
              <p className="text-xl font-semibold text-white">{users.length}</p>
              <p className="text-xs text-slate-400">当前选择：{userSummaries.find((user) => user.id === currentUserId)?.label ?? "--"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
            <CalendarClock className="h-10 w-10 rounded-full bg-primary/15 p-2 text-primary" />
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">最后更新</p>
              <p className="text-xl font-semibold text-white">
                {lastUpdatedAt ? formatRelativeTime(lastUpdatedAt) : "尚无记录"}
              </p>
              <p className="text-xs text-slate-400">{lastUpdatedAt ? formatDate(lastUpdatedAt) : "等待首次新增"}</p>
            </div>
          </div>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-lg">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-white">记忆条目</h2>
            <label className="flex w-full items-center gap-2 rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-slate-200 sm:max-w-xs">
              <Search className="h-4 w-4 text-slate-400" aria-hidden />
              <input
                type="search"
                value={filters.search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="搜索记忆内容"
                className="flex-1 bg-transparent outline-none"
              />
            </label>
          </div>

          <form onSubmit={handleCreateMemory} className="mt-6 space-y-3">
            <label className="block text-sm font-medium text-slate-200" htmlFor="memory-draft">
              新增记忆
            </label>
            <textarea
              id="memory-draft"
              className="min-h-[120px] w-full rounded-xl border border-white/10 bg-slate-900/50 p-4 text-sm text-slate-100 focus:border-primary focus:outline-none"
              placeholder="输入需要记录的偏好、约定或总结..."
              value={draftMemory}
              onChange={(event) => setDraftMemory(event.target.value)}
            />
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>将保存到用户：{userSummaries.find((user) => user.id === currentUserId)?.label ?? currentUserId}</span>
              <Button type="submit" disabled={!draftMemory.trim()}>
                <Plus className="mr-2 h-4 w-4" />
                保存记忆
              </Button>
            </div>
          </form>

          <div className="mt-8 space-y-4">
            {filteredMemories.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/20 bg-slate-900/40 p-10 text-center text-sm text-slate-400">
                <Sparkles className="h-6 w-6" />
                <p>暂无匹配的记忆，尝试更换关键词或添加新条目。</p>
              </div>
            ) : (
              <ul className="space-y-4">
                {filteredMemories.map((memory) => {
                  const isEditing = editingId === memory.id;
                  return (
                    <li key={memory.id} className="rounded-2xl border border-white/10 bg-slate-900/50 p-5">
                      <div className="flex flex-wrap items-start justify-between gap-4 text-xs text-slate-400">
                        <span>
                          归属：{userSummaries.find((user) => user.id === memory.userId)?.label ?? memory.userId}
                        </span>
                        <span>
                          创建于 {formatDate(memory.createdAt)} · {formatRelativeTime(memory.createdAt)}
                        </span>
                      </div>
                      {isEditing ? (
                        <div className="mt-3 space-y-3">
                          <textarea
                            className="w-full rounded-xl border border-primary/40 bg-slate-950/70 p-3 text-sm text-slate-100 focus:border-primary focus:outline-none"
                            value={editingDraft}
                            onChange={(event) => setEditingDraft(event.target.value)}
                          />
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <Button type="button" onClick={() => handleSaveEdit(memory.id)}>
                              保存修改
                            </Button>
                            <Button type="button" variant="ghost" onClick={() => setEditingId(null)}>
                              取消
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="mt-3 text-sm leading-relaxed text-slate-100">{memory.memory}</p>
                      )}
                      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                        {memory.metadata
                          ? Object.entries(memory.metadata).map(([key, value]) => (
                              <span
                                key={key}
                                className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] uppercase tracking-[0.3em]"
                              >
                                {key}: {value}
                              </span>
                            ))
                          : null}
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2 text-xs">
                        <Button type="button" variant="ghost" onClick={() => handleStartEdit(memory.id, memory.memory)}>
                          <Edit3 className="mr-1 h-4 w-4" /> 编辑
                        </Button>
                        <Button type="button" variant="ghost" onClick={() => deleteMemory(memory.id)}>
                          <Trash2 className="mr-1 h-4 w-4" /> 删除
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <aside className="flex flex-col gap-6">
          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-white">用户分组</h2>
            <p className="mt-1 text-xs text-slate-400">按团队或场景划分记忆上下文，避免内容混淆。</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {userSummaries.map((user) => {
                const isActive = user.id === currentUserId;
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => setCurrentUserId(user.id)}
                    className={`flex flex-col gap-1 rounded-2xl border px-4 py-3 text-left text-xs transition ${
                      isActive
                        ? "border-primary/60 bg-primary/15 text-primary-foreground"
                        : "border-white/10 bg-slate-900/60 text-slate-200 hover:border-white/20"
                    }`}
                  >
                    <span className="text-sm font-semibold">{user.label}</span>
                    <span className="text-xs text-slate-400">{user.total} 条记忆</span>
                  </button>
                );
              })}
            </div>
            <form onSubmit={handleCreateUser} className="mt-4 space-y-2 text-sm">
              <label className="text-xs text-slate-400" htmlFor="memory-new-user">
                新增用户
              </label>
              <input
                id="memory-new-user"
                type="text"
                value={newUserName}
                onChange={(event) => setNewUserName(event.target.value)}
                placeholder="例如 市场团队"
                className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 focus:border-primary focus:outline-none"
              />
              <Button type="submit" className="w-full" disabled={!newUserName.trim()}>
                <Plus className="mr-2 h-4 w-4" /> 添加用户
              </Button>
            </form>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-white">同步配置</h2>
            <p className="mt-1 text-xs text-slate-400">选择用于摘要与嵌入的模型，保证迁移后的上下文质量。</p>
            <div className="mt-4 space-y-4 text-sm">
              <label className="flex flex-col gap-2">
                <span className="text-xs uppercase tracking-[0.3em] text-slate-400">摘要模型</span>
                <select
                  value={config.llmClient?.id ?? ""}
                  onChange={(event) => setLlmClient(event.target.value)}
                  className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-slate-100 focus:border-primary focus:outline-none"
                  aria-label="摘要模型"
                >
                  <option value="">选择模型</option>
                  {llmOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label} · {option.provider}
                    </option>
                  ))}
                </select>
                {config.llmClient ? (
                  <p className="text-xs text-slate-400">{config.llmClient.description}</p>
                ) : null}
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-xs uppercase tracking-[0.3em] text-slate-400">嵌入模型</span>
                <select
                  value={config.embedderClient?.id ?? ""}
                  onChange={(event) => setEmbedderClient(event.target.value)}
                  className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-slate-100 focus:border-primary focus:outline-none"
                  aria-label="嵌入模型"
                >
                  <option value="">选择模型</option>
                  {embedderOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label} · {option.provider}
                    </option>
                  ))}
                </select>
                {config.embedderClient ? (
                  <p className="text-xs text-slate-400">{config.embedderClient.description}</p>
                ) : null}
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-xs uppercase tracking-[0.3em] text-slate-400">嵌入维度</span>
                <input
                  type="number"
                  value={config.embedderDimensions}
                  min={32}
                  max={4096}
                  step={16}
                  onChange={(event) => setEmbedderDimensions(Number(event.target.value))}
                  className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-slate-100 focus:border-primary focus:outline-none"
                  aria-label="嵌入维度"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-xs uppercase tracking-[0.3em] text-slate-400">同步频率</span>
                <select
                  value={config.syncCadence}
                  onChange={(event) => setSyncCadence(event.target.value as typeof config.syncCadence)}
                  className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-slate-100 focus:border-primary focus:outline-none"
                >
                  <option value="manual">手动触发</option>
                  <option value="hourly">每小时同步</option>
                  <option value="daily">每日同步</option>
                </select>
              </label>

              <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-slate-200">
                <input
                  type="checkbox"
                  checked={config.automaticFactExtraction}
                  onChange={toggleAutomaticFactExtraction}
                  className="h-4 w-4 rounded border-white/20 bg-transparent"
                />
                <div>
                  <p className="font-medium text-white">自动提取事实</p>
                  <p className="text-xs text-slate-400">将会话摘要与工具调用结果自动整理为记忆。</p>
                </div>
              </label>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
