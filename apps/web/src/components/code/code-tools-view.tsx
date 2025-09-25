"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ClipboardCopy, ExternalLink, FolderPlus, RefreshCw } from "lucide-react";

import { ToolCard } from "@/components/code/tool-card";
import { Button } from "@/components/ui/button";
import { useCodeToolsStore } from "@/lib/stores/code-tools";

const TERMINAL_PLATFORM_LABEL: Record<string, string> = {
  mac: "macOS",
  windows: "Windows",
  linux: "Linux",
  web: "Web",
};

export function CodeToolsView() {
  const {
    tools,
    selectedToolId,
    selectedModelByTool,
    environmentByTool,
    terminals,
    selectedTerminalId,
    customTerminalPaths,
    directories,
    currentDirectory,
    autoUpdateToLatest,
    setSelectedTool,
    setSelectedModel,
    setEnvironment,
    addDirectory,
    removeDirectory,
    setCurrentDirectory,
    clearDirectories,
    setSelectedTerminal,
    setCustomTerminalPath,
    setAutoUpdateToLatest,
    reset,
  } = useCodeToolsStore((state) => ({
    tools: state.tools,
    selectedToolId: state.selectedToolId,
    selectedModelByTool: state.selectedModelByTool,
    environmentByTool: state.environmentByTool,
    terminals: state.terminals,
    selectedTerminalId: state.selectedTerminalId,
    customTerminalPaths: state.customTerminalPaths,
    directories: state.directories,
    currentDirectory: state.currentDirectory,
    autoUpdateToLatest: state.autoUpdateToLatest,
    setSelectedTool: state.setSelectedTool,
    setSelectedModel: state.setSelectedModel,
    setEnvironment: state.setEnvironment,
    addDirectory: state.addDirectory,
    removeDirectory: state.removeDirectory,
    setCurrentDirectory: state.setCurrentDirectory,
    clearDirectories: state.clearDirectories,
    setSelectedTerminal: state.setSelectedTerminal,
    setCustomTerminalPath: state.setCustomTerminalPath,
    setAutoUpdateToLatest: state.setAutoUpdateToLatest,
    reset: state.reset,
  }));

  const activeTool = useMemo(
    () => tools.find((tool) => tool.id === selectedToolId) ?? tools[0],
    [selectedToolId, tools],
  );

  const selectedModelId = activeTool ? selectedModelByTool[activeTool.id] ?? null : null;
  const environmentSnippet = activeTool ? environmentByTool[activeTool.id] ?? "" : "";
  const selectedTerminal = useMemo(
    () => terminals.find((terminal) => terminal.id === selectedTerminalId) ?? terminals[0] ?? null,
    [selectedTerminalId, terminals],
  );
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");

  async function handleAddDirectory() {
    if (typeof window === "undefined") {
      return;
    }

    if ("showDirectoryPicker" in window) {
      try {
        const handle = await (window as unknown as { showDirectoryPicker: () => Promise<{ name?: string }> }).showDirectoryPicker();
        if (handle?.name) {
          addDirectory(handle.name);
          setCurrentDirectory(handle.name);
          return;
        }
      } catch (error) {
        if ((error as Error)?.name !== "AbortError") {
          console.warn("Directory picker unavailable", error);
        }
      }
    }

    const fallback = window.prompt("输入或粘贴项目目录名称/路径", currentDirectory ?? "");
    if (fallback) {
      addDirectory(fallback);
      setCurrentDirectory(fallback);
    }
  }

  async function handleCopyEnvironment() {
    if (!environmentSnippet.trim()) {
      return;
    }

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(environmentSnippet.trim());
        setCopyStatus("copied");
        setTimeout(() => setCopyStatus("idle"), 2000);
        return;
      } catch (error) {
        console.warn("Clipboard copy failed", error);
        setCopyStatus("error");
      }
    }

    try {
      const textarea = document.createElement("textarea");
      textarea.value = environmentSnippet.trim();
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopyStatus("copied");
      setTimeout(() => setCopyStatus("idle"), 2000);
    } catch (error) {
      console.warn("Fallback clipboard copy failed", error);
      setCopyStatus("error");
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-10 overflow-y-auto bg-slate-950/60 p-6 sm:p-10">
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <span>迁移中</span>
        </div>
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold text-white sm:text-4xl">工程工具集</h1>
          <p className="max-w-3xl text-sm text-slate-300 sm:text-base">
            将 Electron 端的 CLI 与自动化能力迁移到浏览器，通过 PWA + 扩展协同完成模型鉴权、终端指令与上下文同步。
            选择一个 CLI 工具，配置模型、终端与环境变量，即可复制脚本在本地终端执行。
          </p>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.7fr_1fr] lg:items-start">
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-white">选择 CLI 工具</h2>
            <p className="mt-1 text-sm text-slate-400">
              根据团队使用场景选择默认工具，所有配置会自动持久化，方便多端共享。
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {tools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} isActive={tool.id === activeTool?.id} onSelect={setSelectedTool} />
              ))}
            </div>
          </div>

          {activeTool ? (
            <div className="grid gap-6 rounded-2xl border border-white/10 bg-slate-950/70 p-6">
              <div className="space-y-3">
                <h3 className="text-base font-semibold text-white">模型与运行参数</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm text-slate-200">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">推荐模型</span>
                    <select
                      value={selectedModelId ?? ""}
                      onChange={(event) => setSelectedModel(event.target.value || null)}
                      className="rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 shadow-inner focus:border-primary focus:outline-none"
                    >
                      {activeTool.recommendedModels.map((model) => (
                        <option key={model.id} value={model.id}>
                          {model.name} · {model.provider}
                        </option>
                      ))}
                      <option value="">
                        仅保存 CLI，不绑定模型
                      </option>
                    </select>
                    <p className="text-xs text-slate-400">
                      {selectedModelId
                        ? activeTool.recommendedModels.find((item) => item.id === selectedModelId)?.notes ?? ""
                        : "保留空值可在终端手动输入模型参数。"}
                    </p>
                  </label>

                  <label className="grid gap-2 text-sm text-slate-200">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">终端</span>
                    <select
                      value={selectedTerminal?.id ?? ""}
                      onChange={(event) => setSelectedTerminal(event.target.value)}
                      className="rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 shadow-inner focus:border-primary focus:outline-none"
                    >
                      {terminals.map((terminal) => (
                        <option key={terminal.id} value={terminal.id}>
                          {terminal.name} · {TERMINAL_PLATFORM_LABEL[terminal.platform] ?? terminal.platform}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-slate-400">
                      {selectedTerminal?.description}
                      {selectedTerminal?.homepage ? (
                        <>
                          {" "}
                          <Link href={selectedTerminal.homepage} target="_blank" className="inline-flex items-center gap-1 text-primary">
                            访问官网
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </>
                      ) : null}
                    </p>
                  </label>
                </div>
                <label className="grid gap-2 text-sm text-slate-200">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">自定义终端路径（可选）</span>
                  <input
                    value={selectedTerminal ? customTerminalPaths[selectedTerminal.id] ?? "" : ""}
                    onChange={(event) => {
                      if (!selectedTerminal) {
                        return;
                      }
                      setCustomTerminalPath(selectedTerminal.id, event.target.value);
                    }}
                    placeholder="例如 /Applications/Warp.app"
                    className="rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 shadow-inner focus:border-primary focus:outline-none"
                  />
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    checked={autoUpdateToLatest}
                    onChange={(event) => setAutoUpdateToLatest(event.target.checked)}
                    className="h-4 w-4 rounded border-white/20 bg-slate-900/70 text-primary focus:ring-primary"
                  />
                  自动检查 CLI 更新并提醒
                </label>
              </div>

              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-white">项目目录</h4>
                    <p className="text-xs text-slate-400">记录常用目录，方便在终端中快速切换。</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      onClick={handleAddDirectory}
                      className="border border-white/10 px-3 py-1 text-xs text-slate-200 hover:border-white/20"
                    >
                      <FolderPlus className="mr-2 h-4 w-4" /> 添加目录
                    </Button>
                    {directories.length ? (
                      <Button
                        variant="ghost"
                        onClick={clearDirectories}
                        className="border border-white/10 px-3 py-1 text-xs text-slate-200 hover:border-white/20"
                      >
                        <RefreshCw className="mr-2 h-4 w-4" /> 清空
                      </Button>
                    ) : null}
                  </div>
                </div>
                <div className="grid gap-2">
                  {directories.length ? (
                    directories.map((directory) => (
                      <div
                        key={directory}
                        className="flex items-center justify-between rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-slate-200"
                      >
                        <div className="flex flex-col">
                          <span>{directory}</span>
                          {currentDirectory === directory ? (
                            <span className="text-xs text-primary">当前默认目录</span>
                          ) : null}
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <Button
                            variant="ghost"
                            onClick={() => setCurrentDirectory(directory)}
                            className="border border-white/10 px-3 py-1 text-xs text-slate-200 hover:border-white/20"
                          >
                            设为默认
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => removeDirectory(directory)}
                            className="border border-white/10 px-3 py-1 text-xs text-slate-200 hover:border-white/20"
                          >
                            移除
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="rounded-lg border border-dashed border-white/10 bg-slate-900/40 px-3 py-6 text-center text-xs text-slate-400">
                      还没有记录目录，点击“添加目录”录入常用项目路径。
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-3">
                <h4 className="text-sm font-semibold text-white">环境变量与启动命令</h4>
                <textarea
                  value={environmentSnippet}
                  onChange={(event) => setEnvironment(event.target.value)}
                  placeholder={`export API_KEY=...\n${activeTool.cliCommand}`}
                  className="min-h-[140px] rounded-xl border border-white/10 bg-slate-900/60 p-4 text-sm text-slate-100 shadow-inner focus:border-primary focus:outline-none"
                />
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                  <Button
                    type="button"
                    onClick={handleCopyEnvironment}
                    className="px-3 py-1 text-xs"
                  >
                    <ClipboardCopy className="mr-2 h-4 w-4" />
                    {copyStatus === "copied" ? "已复制" : "复制脚本"}
                  </Button>
                  <span>
                    将生成的脚本粘贴到 {selectedTerminal?.name ?? "终端"}，即可在 {currentDirectory ?? "已配置目录"} 中运行。
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    className="border border-white/10 px-3 py-1 text-xs text-slate-200 hover:border-white/20"
                    onClick={reset}
                  >
                    重置为默认
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {activeTool ? (
          <aside className="flex flex-col gap-6 rounded-2xl border border-white/10 bg-slate-950/70 p-6">
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-white">快速上手步骤</h3>
              <ol className="space-y-3 text-sm text-slate-300">
                {activeTool.guide.map((step, index) => (
                  <li key={step.id} className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-xs font-semibold text-primary">
                      {index + 1}
                    </span>
                    <div className="space-y-1">
                      <p className="font-medium text-white">{step.title}</p>
                      <p className="text-xs text-slate-400">{step.description}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div className="space-y-3 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4 text-xs text-slate-200">
              <p className="font-semibold text-primary">PWA 协作建议</p>
              <p>
                结合浏览器扩展推送的网页选区，可在终端执行 `cat selection.txt | {activeTool.cliCommand}` 将上下文注入 CLI。
                未来会新增与 Workspace 的实时同步。
              </p>
            </div>
          </aside>
        ) : null}
      </section>
    </div>
  );
}
