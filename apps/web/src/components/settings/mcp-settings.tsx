"use client";

import { type FormEvent, useMemo, useState } from "react";
import { ExternalLink, PlugZap, Plus, RefreshCw, ServerCog, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SettingToggle } from "@/components/settings/setting-toggle";
import {
  resetMcpStore,
  useMcpStore,
  type McpFilters,
  type McpServer,
  type McpServerType,
} from "@/lib/stores/mcp";
import { formatRelativeTime, formatTimeOfDay } from "@/utils/datetime";

const TYPE_LABELS: Record<McpServerType, string> = {
  stdio: "Stdio 子进程",
  sse: "SSE 流式",
  streamableHttp: "可流式 HTTP",
  inMemory: "内置服务",
};

const SOURCE_LABELS: Record<Exclude<McpFilters["source"], "all">, string> = {
  builtin: "内置",
  custom: "自定义",
};

const STATUS_LABELS: Record<Exclude<McpFilters["status"], "all">, string> = {
  active: "已启用",
  inactive: "已停用",
};

function matchesFilters(server: McpServer, filters: McpFilters) {
  const searchTerm = filters.search.trim().toLowerCase();
  if (filters.source !== "all" && server.source !== filters.source) {
    return false;
  }
  if (filters.status === "active" && !server.isActive) {
    return false;
  }
  if (filters.status === "inactive" && server.isActive) {
    return false;
  }
  if (!searchTerm) {
    return true;
  }

  const haystack = [
    server.label,
    server.name,
    server.description ?? "",
    server.provider ?? "",
    server.tags.join(" "),
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(searchTerm);
}

function parseListInput(value: string): string[] {
  return value
    .split(/[\n,]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function parseKeyValueInput(value: string): Record<string, string> {
  const result: Record<string, string> = {};
  value
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach((line) => {
      const [rawKey, ...rest] = line.split("=");
      const key = rawKey?.trim();
      if (!key) {
        return;
      }
      result[key] = rest.join("=").trim();
    });
  return result;
}

interface FormState {
  name: string;
  label: string;
  type: McpServerType;
  baseUrl: string;
  command: string;
  args: string;
  provider: string;
  providerUrl: string;
  tags: string;
  reference: string;
  env: string;
  headers: string;
  longRunning: boolean;
  requiresConfiguration: boolean;
  timeout: string;
}

const INITIAL_FORM_STATE: FormState = {
  name: "",
  label: "",
  type: "stdio",
  baseUrl: "",
  command: "",
  args: "",
  provider: "",
  providerUrl: "",
  tags: "",
  reference: "",
  env: "",
  headers: "",
  longRunning: false,
  requiresConfiguration: false,
  timeout: "60",
};

function formatSyncLabel(value: string | null) {
  if (!value) {
    return "尚未同步";
  }
  return `${formatRelativeTime(value)} · ${formatTimeOfDay(value)}`;
}

function renderServerTags(server: McpServer) {
  if (!server.tags.length) {
    return null;
  }
  return (
    <div className="flex flex-wrap gap-2 text-xs">
      {server.tags.map((tag) => (
        <span
          key={`${server.id}-${tag}`}
          className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] uppercase tracking-wide text-slate-200"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

function renderServerMeta(server: McpServer) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-300">
      <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-2 py-0.5">
        <ServerCog className="h-3 w-3" aria-hidden />
        {TYPE_LABELS[server.type]}
      </span>
      <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-2 py-0.5">
        {SOURCE_LABELS[server.source]}
      </span>
      {server.requiresConfiguration ? (
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-amber-200">
          需配置
        </span>
      ) : null}
      {server.longRunning ? (
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-2 py-0.5 text-emerald-200">
          常驻
        </span>
      ) : null}
    </div>
  );
}

function renderServerBody(server: McpServer) {
  return (
    <div className="space-y-3 text-sm text-slate-200">
      {server.description ? <p className="text-slate-300">{server.description}</p> : null}
      {server.baseUrl ? (
        <p className="text-xs text-slate-400">
          地址：
          <span className="select-all break-all text-slate-200">{server.baseUrl}</span>
        </p>
      ) : null}
      {server.command ? (
        <p className="text-xs text-slate-400">
          命令：
          <span className="select-all text-slate-200">{server.command}</span>
          {server.args.length ? <span className="text-slate-500"> {server.args.join(" ")}</span> : null}
        </p>
      ) : null}
      {server.provider ? (
        <p className="text-xs text-slate-400">
          提供方：
          <span className="text-slate-200">{server.provider}</span>
        </p>
      ) : null}
      {server.reference ? (
        <a
          href={server.reference}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80"
        >
          查看文档
          <ExternalLink className="h-3 w-3" aria-hidden />
        </a>
      ) : null}
      {renderServerTags(server)}
    </div>
  );
}

export function McpSettings() {
  const {
    servers,
    filters,
    uvAvailable,
    bunAvailable,
    lastSyncedAt,
    setFilters,
    addServer,
    removeServer,
    toggleServer,
    setRuntimeAvailability,
    touchSync,
  } = useMcpStore((state) => ({
    servers: state.servers,
    filters: state.filters,
    uvAvailable: state.uvAvailable,
    bunAvailable: state.bunAvailable,
    lastSyncedAt: state.lastSyncedAt,
    setFilters: state.setFilters,
    addServer: state.addServer,
    removeServer: state.removeServer,
    toggleServer: state.toggleServer,
    setRuntimeAvailability: state.setRuntimeAvailability,
    touchSync: state.touchSync,
  }));

  const [formState, setFormState] = useState<FormState>(INITIAL_FORM_STATE);

  const filteredServers = useMemo(
    () => servers.filter((server) => matchesFilters(server, filters)),
    [servers, filters],
  );

  const builtinServers = useMemo(
    () => filteredServers.filter((server) => server.source === "builtin"),
    [filteredServers],
  );
  const customServers = useMemo(
    () => filteredServers.filter((server) => server.source === "custom"),
    [filteredServers],
  );

  const totalBuiltin = servers.filter((server) => server.source === "builtin").length;
  const totalCustom = servers.filter((server) => server.source === "custom").length;

  const canSubmit = formState.name.trim().length > 0 && formState.label.trim().length > 0;

  function handleInputChange<Key extends keyof FormState>(key: Key, value: FormState[Key]) {
    setFormState((previous) => ({
      ...previous,
      [key]: value,
    }));
  }

function handleAddServer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }

    addServer({
      name: formState.name.trim(),
      label: formState.label.trim(),
      type: formState.type,
      baseUrl: formState.baseUrl.trim() || undefined,
      command: formState.command.trim() || undefined,
      args: parseListInput(formState.args),
      provider: formState.provider.trim() || undefined,
      providerUrl: formState.providerUrl.trim() || undefined,
      tags: parseListInput(formState.tags),
      reference: formState.reference.trim() || undefined,
      env: parseKeyValueInput(formState.env),
      headers: parseKeyValueInput(formState.headers),
      longRunning: formState.longRunning,
      requiresConfiguration: formState.requiresConfiguration,
      timeout: Number.isNaN(Number(formState.timeout)) ? undefined : Number(formState.timeout),
    });

    setFormState(INITIAL_FORM_STATE);
  }

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <header className="space-y-2">
          <h3 className="text-lg font-semibold text-white">运行时可用性</h3>
          <p className="text-sm text-slate-300">
            浏览器端需要 uvx 或 Bun 来启动部分 MCP 服务器。通过手动勾选的方式记录团队环境是否已经安装，便于后续同步扩展指引。
          </p>
        </header>
        <div className="grid gap-4 md:grid-cols-2">
          <SettingToggle
            id="runtime-uv"
            label="uvx / Node (uv)"
            description="标记是否在本地安装了 uv 运行时，以便启动 Stdio 服务器。"
            checked={uvAvailable}
            onChange={(value) => setRuntimeAvailability("uv", value)}
          />
          <SettingToggle
            id="runtime-bun"
            label="Bun Runtime"
            description="若团队使用 Bun 部署 MCP，请在此确认安装状态。"
            checked={bunAvailable}
            onChange={(value) => setRuntimeAvailability("bun", value)}
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <span>最近同步：{formatSyncLabel(lastSyncedAt)}</span>
          <Button
            type="button"
            variant="ghost"
            onClick={touchSync}
            className="inline-flex items-center gap-1 border border-white/10 px-3 py-1 text-xs text-slate-200 hover:border-white/20"
          >
            <RefreshCw className="h-3 w-3" aria-hidden />
            标记已同步
          </Button>
        </div>
      </section>

      <section className="space-y-4">
        <header className="space-y-2">
          <h3 className="text-lg font-semibold text-white">服务器清单</h3>
          <p className="text-sm text-slate-300">
            筛选并管理内置与自定义 MCP 服务器。过滤条件仅作用于展示，不会影响实际运行状态。
          </p>
        </header>
        <div className="grid gap-3 md:grid-cols-3">
          <label className="flex flex-col gap-2 text-xs text-slate-300">
            <span>搜索</span>
            <input
              type="search"
              value={filters.search}
              onChange={(event) => setFilters({ search: event.target.value })}
              placeholder="输入名称、标签或提供方"
              className="rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
              aria-label="搜索 MCP 服务器"
            />
          </label>
          <label className="flex flex-col gap-2 text-xs text-slate-300">
            <span>来源</span>
            <select
              value={filters.source}
              onChange={(event) =>
                setFilters({ source: event.target.value as McpFilters["source"] })
              }
              className="rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
              aria-label="筛选来源"
            >
              <option value="all">全部（{servers.length}）</option>
              <option value="builtin">仅内置（{totalBuiltin}）</option>
              <option value="custom">仅自定义（{totalCustom}）</option>
            </select>
          </label>
          <label className="flex flex-col gap-2 text-xs text-slate-300">
            <span>状态</span>
            <select
              value={filters.status}
              onChange={(event) =>
                setFilters({ status: event.target.value as McpFilters["status"] })
              }
              className="rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
              aria-label="筛选状态"
            >
              <option value="all">全部状态</option>
              <option value="active">仅启用</option>
              <option value="inactive">仅停用</option>
            </select>
          </label>
        </div>
        <p className="text-xs text-slate-400">
          当前展示 {filteredServers.length} 项 · 内置 {builtinServers.length} · 自定义 {customServers.length}
        </p>
      </section>

      <section className="space-y-4">
        <header className="flex items-center justify-between">
          <div className="space-y-1">
            <h4 className="text-base font-semibold text-white">内置服务器</h4>
            <p className="text-sm text-slate-300">官方提供的 in-memory 服务，可直接在浏览器扩展或本地守护进程中启用。</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            className="border border-white/10 px-3 py-1 text-xs text-slate-200 hover:border-white/20"
            onClick={() => resetMcpStore()}
          >
            恢复默认
          </Button>
        </header>
        <div className="grid gap-4 md:grid-cols-2">
          {builtinServers.length ? (
            builtinServers.map((server) => (
              <article
                key={server.id}
                className="flex h-full flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-slate-900/40 p-5"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">官方服务</p>
                      <h5 className="text-lg font-semibold text-white">{server.label}</h5>
                      <p className="text-xs text-slate-500">{server.name}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => toggleServer(server.id)}
                      className={`inline-flex items-center gap-1 border px-3 py-1 text-xs ${
                        server.isActive
                          ? "border-emerald-400/40 text-emerald-200 hover:border-emerald-400/60"
                          : "border-white/10 text-slate-200 hover:border-white/20"
                      }`}
                      aria-label={server.isActive ? `停用 ${server.label}` : `启用 ${server.label}`}
                    >
                      <PlugZap className="h-3.5 w-3.5" aria-hidden />
                      {server.isActive ? "已启用" : "启用"}
                    </Button>
                  </div>
                  {renderServerMeta(server)}
                  {renderServerBody(server)}
                </div>
                {server.updatedAt ? (
                  <p className="text-[11px] text-slate-500">最近更新：{formatRelativeTime(server.updatedAt)}</p>
                ) : null}
              </article>
            ))
          ) : (
            <p className="col-span-full rounded-xl border border-dashed border-white/10 bg-slate-900/30 p-6 text-center text-sm text-slate-400">
              没有符合条件的内置服务器。
            </p>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <header className="space-y-1">
          <h4 className="text-base font-semibold text-white">自定义服务器</h4>
          <p className="text-sm text-slate-300">记录团队自建或第三方 MCP 服务，可通过扩展转发到本地环境。</p>
        </header>
        <div className="grid gap-4 md:grid-cols-2">
          {customServers.length ? (
            customServers.map((server) => (
              <article
                key={server.id}
                className="flex h-full flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-slate-900/40 p-5"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-primary">自定义</p>
                      <h5 className="text-lg font-semibold text-white">{server.label}</h5>
                      <p className="text-xs text-slate-500">{server.name}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => toggleServer(server.id)}
                        className={`inline-flex items-center gap-1 border px-3 py-1 text-xs ${
                          server.isActive
                            ? "border-emerald-400/40 text-emerald-200 hover:border-emerald-400/60"
                            : "border-white/10 text-slate-200 hover:border-white/20"
                        }`}
                        aria-label={server.isActive ? `停用 ${server.label}` : `启用 ${server.label}`}
                      >
                        <PlugZap className="h-3.5 w-3.5" aria-hidden />
                        {server.isActive ? "已启用" : "启用"}
                      </Button>
                      <button
                        type="button"
                        onClick={() => removeServer(server.id)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-slate-300 transition hover:border-red-400/50 hover:text-red-300"
                        aria-label={`删除 ${server.label}`}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </button>
                    </div>
                  </div>
                  {renderServerMeta(server)}
                  {renderServerBody(server)}
                </div>
                {server.updatedAt ? (
                  <p className="text-[11px] text-slate-500">最近更新：{formatRelativeTime(server.updatedAt)}</p>
                ) : null}
              </article>
            ))
          ) : (
            <p className="col-span-full rounded-xl border border-dashed border-white/10 bg-slate-900/30 p-6 text-center text-sm text-slate-400">
              还没有自定义服务器，可以在下方填写配置添加第一个服务。
            </p>
          )}
        </div>
      </section>

      <section className="space-y-6">
        <header className="space-y-2">
          <h3 className="text-lg font-semibold text-white">新增自定义 MCP 服务</h3>
          <p className="text-sm text-slate-300">
            支持填写 HTTP、SSE 或 Stdio 类型的服务。表单仅用于记录配置，实际启动依赖浏览器扩展或本地守护进程执行。
          </p>
        </header>
        <form className="space-y-4" onSubmit={handleAddServer}>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-xs text-slate-300">
              <span>服务标识 *</span>
              <input
                value={formState.name}
                onChange={(event) => handleInputChange("name", event.target.value)}
                placeholder="team/service"
                className="rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                aria-label="服务标识"
              />
            </label>
            <label className="flex flex-col gap-2 text-xs text-slate-300">
              <span>显示名称 *</span>
              <input
                value={formState.label}
                onChange={(event) => handleInputChange("label", event.target.value)}
                placeholder="团队知识库"
                className="rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                aria-label="显示名称"
              />
            </label>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <label className="flex flex-col gap-2 text-xs text-slate-300">
              <span>通信类型</span>
              <select
                value={formState.type}
                onChange={(event) => handleInputChange("type", event.target.value as McpServerType)}
                className="rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                aria-label="通信类型"
              >
                <option value="stdio">Stdio 子进程</option>
                <option value="streamableHttp">可流式 HTTP</option>
                <option value="sse">SSE 流式</option>
                <option value="inMemory">内置（实验）</option>
              </select>
            </label>
            <label className="flex flex-col gap-2 text-xs text-slate-300">
              <span>请求超时（秒）</span>
              <input
                type="number"
                min={5}
                max={600}
                value={formState.timeout}
                onChange={(event) => handleInputChange("timeout", event.target.value)}
                className="rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                aria-label="请求超时"
              />
            </label>
            <label className="flex flex-col gap-2 text-xs text-slate-300">
              <span>提供方</span>
              <input
                value={formState.provider}
                onChange={(event) => handleInputChange("provider", event.target.value)}
                placeholder="Team Ops"
                className="rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                aria-label="提供方"
              />
            </label>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-xs text-slate-300">
              <span>服务地址</span>
              <input
                value={formState.baseUrl}
                onChange={(event) => handleInputChange("baseUrl", event.target.value)}
                placeholder="https://example.com/mcp"
                className="rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                aria-label="服务地址"
              />
            </label>
            <label className="flex flex-col gap-2 text-xs text-slate-300">
              <span>提供方链接</span>
              <input
                value={formState.providerUrl}
                onChange={(event) => handleInputChange("providerUrl", event.target.value)}
                placeholder="https://docs.example.com"
                className="rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                aria-label="提供方链接"
              />
            </label>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-xs text-slate-300">
              <span>启动命令</span>
              <input
                value={formState.command}
                onChange={(event) => handleInputChange("command", event.target.value)}
                placeholder="uvx"
                className="rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                aria-label="启动命令"
              />
            </label>
            <label className="flex flex-col gap-2 text-xs text-slate-300">
              <span>命令参数</span>
              <textarea
                value={formState.args}
                onChange={(event) => handleInputChange("args", event.target.value)}
                placeholder="--flag=value"
                rows={2}
                className="rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                aria-label="命令参数"
              />
            </label>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-xs text-slate-300">
              <span>环境变量</span>
              <textarea
                value={formState.env}
                onChange={(event) => handleInputChange("env", event.target.value)}
                placeholder={"KEY=value"}
                rows={2}
                className="rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                aria-label="环境变量"
              />
              <span className="text-[11px] text-slate-500">每行一个键值对，例如 DIFY_KEY=xxxx</span>
            </label>
            <label className="flex flex-col gap-2 text-xs text-slate-300">
              <span>自定义 Header</span>
              <textarea
                value={formState.headers}
                onChange={(event) => handleInputChange("headers", event.target.value)}
                placeholder={"Authorization=Bearer xxx"}
                rows={2}
                className="rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                aria-label="自定义 Header"
              />
            </label>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-xs text-slate-300">
              <span>标签</span>
              <input
                value={formState.tags}
                onChange={(event) => handleInputChange("tags", event.target.value)}
                placeholder="知识库, HTTP"
                className="rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                aria-label="标签"
              />
            </label>
            <label className="flex flex-col gap-2 text-xs text-slate-300">
              <span>参考文档</span>
              <input
                value={formState.reference}
                onChange={(event) => handleInputChange("reference", event.target.value)}
                placeholder="https://modelcontextprotocol.io"
                className="rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                aria-label="参考文档"
              />
            </label>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <SettingToggle
              id="form-long-running"
              label="后台常驻"
              description="标记该服务器需要长期运行，以便安排守护进程。"
              checked={formState.longRunning}
              onChange={(value) => handleInputChange("longRunning", value)}
            />
            <SettingToggle
              id="form-requires-config"
              label="需要额外配置"
              description="记录该服务是否需要在部署后配置密钥或路径。"
              checked={formState.requiresConfiguration}
              onChange={(value) => handleInputChange("requiresConfiguration", value)}
            />
          </div>
          <div className="flex justify-end">
            <Button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm"
              disabled={!canSubmit}
            >
              <Plus className="h-4 w-4" aria-hidden />
              添加服务
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
