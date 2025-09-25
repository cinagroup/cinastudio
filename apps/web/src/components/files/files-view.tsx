"use client";

import { useMemo } from "react";

import { Filter, FolderPlus, Pin, Search, SortAsc, SortDesc } from "lucide-react";

import type { SharedFile } from "@cinaseek/web-shared/files";

import { Button } from "@/components/ui/button";
import { useFilesStore } from "@/lib/stores/files";
import { cn } from "@/utils/cn";
import { formatDate } from "@/utils/datetime";
import { formatFileSize } from "@/utils/file";

import { FileCard } from "./file-card";
import { FileRow } from "./file-row";
import { getFileTypeMeta } from "./meta";

const SORT_OPTIONS = [
  { field: "updatedAt", label: "最近更新" },
  { field: "createdAt", label: "创建时间" },
  { field: "size", label: "文件大小" },
  { field: "usage", label: "使用次数" },
  { field: "name", label: "名称" },
] as const;

type SortOption = (typeof SORT_OPTIONS)[number];

function applySort(files: SharedFile[], field: SortOption["field"], order: "asc" | "desc") {
  const sorted = [...files].sort((a, b) => {
    let comparison = 0;
    switch (field) {
      case "size":
        comparison = a.size - b.size;
        break;
      case "usage":
        comparison = a.usageCount - b.usageCount;
        break;
      case "name":
        comparison = a.title.localeCompare(b.title, "zh-CN");
        break;
      case "createdAt":
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case "updatedAt":
      default:
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        break;
    }
    return order === "asc" ? comparison : -comparison;
  });

  return sorted;
}

export function FilesView() {
  const files = useFilesStore((state) => state.files);
  const filters = useFilesStore((state) => state.filters);
  const categories = useFilesStore((state) => state.categories);
  const setType = useFilesStore((state) => state.setType);
  const setSearch = useFilesStore((state) => state.setSearch);
  const setSort = useFilesStore((state) => state.setSort);
  const setShowPinnedOnly = useFilesStore((state) => state.setShowPinnedOnly);
  const togglePin = useFilesStore((state) => state.togglePin);
  const recordAccess = useFilesStore((state) => state.recordAccess);
  const addFile = useFilesStore((state) => state.addFile);

  const processed = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    const filtered = files.filter((file) => {
      if (filters.type !== "all" && file.type !== filters.type) {
        return false;
      }
      if (query) {
        const haystack = `${file.title} ${file.description ?? ""} ${file.tags.join(" ")}`.toLowerCase();
        if (!haystack.includes(query)) {
          return false;
        }
      }
      if (filters.showPinnedOnly && !file.pinned) {
        return false;
      }
      return true;
    });

    return applySort(filtered, filters.sortField, filters.sortOrder);
  }, [files, filters]);

  const pinnedFiles = processed.filter((file) => file.pinned);
  const regularFiles = filters.showPinnedOnly
    ? []
    : processed.filter((file) => !file.pinned);

  const totalSize = processed.reduce((total, file) => total + file.size, 0);
  const activeCategory = categories.find((category) => category.type === filters.type) ?? categories[0];

  const latestFile = processed[0];

  function handleCreateSample() {
    const now = new Date();
    const title = `临时草稿 ${now.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}`;
    addFile({
      title,
      type: "text",
      size: 2_048,
      source: "workspace",
      description: "通过 Web 端快速创建的示例文件。",
      tags: ["草稿", "PWA"],
    });
  }

  function handleCategorySelect(category: (typeof categories)[number]) {
    if (category.type === "favorites" || category.id === "favorites") {
      setShowPinnedOnly(true);
      setType("all");
    } else {
      setShowPinnedOnly(false);
      setType((category.type ?? "all") as typeof filters.type);
    }
  }

  return (
    <div className="flex h-full flex-col gap-8 overflow-hidden px-4 py-8 sm:px-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-widest text-primary/70">Files</p>
          <h1 className="text-2xl font-semibold text-slate-50">文件工作台</h1>
          <p className="max-w-3xl text-sm text-slate-300">
            将 Electron 文件列表迁移至浏览器，支持按类型筛选、排序与置顶，后续将接入云端备份与扩展快速上传能力。
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-slate-300">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-white/20 bg-slate-900 text-primary focus:ring-primary/40"
              checked={filters.showPinnedOnly}
              onChange={(event) => setShowPinnedOnly(event.target.checked)}
            />
            仅查看置顶
          </label>
          <Button
            type="button"
            variant="ghost"
            onClick={handleCreateSample}
            className="flex items-center gap-2 border border-primary/40 bg-primary/15 text-primary hover:border-primary/60 hover:bg-primary/25"
          >
            <FolderPlus className="h-4 w-4" />
            新建示例文件
          </Button>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5">
          <p className="text-xs uppercase tracking-wide text-slate-400">当前筛选</p>
          <p className="mt-3 text-2xl font-semibold text-slate-50">{processed.length} 个文件</p>
          <p className="mt-2 text-sm text-slate-400">{pinnedFiles.length} 个置顶，类型：{activeCategory?.label ?? "全部"}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5">
          <p className="text-xs uppercase tracking-wide text-slate-400">累计容量</p>
          <p className="mt-3 text-2xl font-semibold text-slate-50">{formatFileSize(totalSize)}</p>
          <p className="mt-2 text-sm text-slate-400">包含扩展粘贴与云端同步的文件内容。</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5">
          <p className="text-xs uppercase tracking-wide text-slate-400">最近更新</p>
          {latestFile ? (
            <div className="mt-3 space-y-1 text-sm">
              <p className="font-semibold text-slate-50">{latestFile.title}</p>
              <p className="text-slate-400">更新于 {formatDate(latestFile.updatedAt, { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}</p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-400">暂无文件</p>
          )}
        </div>
      </section>

      <div className="flex flex-1 flex-col gap-6 overflow-hidden lg:flex-row">
        <aside className="hidden w-64 flex-shrink-0 flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4 lg:flex">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-primary/70">
            <Filter className="h-4 w-4" />
            文件类型
          </div>
          <div className="mt-4 flex flex-col gap-2">
            {categories.map((category) => {
              const meta = category.type && category.type !== "all" && category.type !== "favorites"
                ? getFileTypeMeta(category.type)
                : undefined;
              const isActive =
                (category.type === "favorites" && filters.showPinnedOnly) ||
                (category.type ?? "all") === filters.type;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleCategorySelect(category)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border px-3 py-2 text-left text-sm transition",
                    isActive
                      ? "border-primary/40 bg-primary/20 text-primary"
                      : "border-white/10 bg-transparent text-slate-300 hover:border-primary/30 hover:text-primary",
                  )}
                >
                  <span className="flex items-center gap-2">
                    {meta ? (
                      <span className={cn("flex h-6 w-6 items-center justify-center rounded-lg text-xs", meta.bg, meta.fg)}>
                        <meta.icon className="h-3 w-3" />
                      </span>
                    ) : (
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-800 text-xs text-slate-300">
                        全部
                      </span>
                    )}
                    <span className="flex flex-col">
                      <span>{category.label}</span>
                      <span className="text-xs text-slate-400">{category.description}</span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="flex flex-1 flex-col gap-6 overflow-hidden">
          <div className="-mt-2 flex snap-x gap-2 overflow-x-auto pb-2 lg:hidden">
            {categories.map((category) => {
              const meta = category.type && category.type !== "all" && category.type !== "favorites"
                ? getFileTypeMeta(category.type)
                : undefined;
              const isActive =
                (category.type === "favorites" && filters.showPinnedOnly) ||
                (category.type ?? "all") === filters.type;
              return (
                <button
                  key={`mobile-${category.id}`}
                  type="button"
                  onClick={() => handleCategorySelect(category)}
                  className={cn(
                    "flex min-w-[140px] snap-start items-center gap-2 rounded-xl border px-3 py-2 text-xs transition",
                    isActive
                      ? "border-primary/40 bg-primary/20 text-primary"
                      : "border-white/10 bg-white/5 text-slate-200 hover:border-primary/30 hover:text-primary",
                  )}
                >
                  {meta ? (
                    <span className={cn("flex h-6 w-6 items-center justify-center rounded-lg text-xs", meta.bg, meta.fg)}>
                      <meta.icon className="h-3 w-3" />
                    </span>
                  ) : (
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-800 text-xs text-slate-300">全部</span>
                  )}
                  <span>{category.label}</span>
                </button>
              );
            })}
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-1 items-center gap-3 rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-slate-200">
                <Search className="h-4 w-4 text-slate-500" />
                <input
                  type="search"
                  value={filters.search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="搜索文件标题、标签或描述"
                  className="flex-1 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {SORT_OPTIONS.map((option) => {
                  const isActive = filters.sortField === option.field;
                  const Icon = filters.sortOrder === "asc" && isActive ? SortAsc : SortDesc;
                  return (
                    <button
                      key={option.field}
                      type="button"
                      onClick={() => setSort(option.field)}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs transition",
                        isActive
                          ? "border-primary/40 bg-primary/20 text-primary"
                          : "border-white/10 bg-white/5 text-slate-300 hover:border-primary/30 hover:text-primary",
                      )}
                    >
                      {isActive ? (
                        <Icon className="h-3 w-3" />
                      ) : (
                        <Pin className="h-3 w-3 opacity-0" aria-hidden />
                      )}
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {pinnedFiles.length > 0 ? (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-200">已置顶</h2>
                <span className="text-xs text-slate-400">共 {pinnedFiles.length} 个文件</span>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {pinnedFiles.map((file) => (
                  <FileCard
                    key={file.id}
                    file={file}
                    onTogglePin={togglePin}
                    onOpen={recordAccess}
                  />
                ))}
              </div>
            </section>
          ) : null}

          <section className="flex-1 overflow-hidden">
            <div className="flex items-center justify-between pb-2">
              <h2 className="text-sm font-semibold text-slate-200">全部文件</h2>
              <span className="text-xs text-slate-400">{processed.length} 条结果</span>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
              {regularFiles.length > 0 ? (
                regularFiles.map((file) => (
                  <FileRow key={file.id} file={file} onTogglePin={togglePin} onOpen={recordAccess} />
                ))
              ) : filters.showPinnedOnly && pinnedFiles.length > 0 ? (
                <p className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-6 text-center text-sm text-slate-400">
                  已启用置顶筛选，当前仅展示置顶文件。
                </p>
              ) : (
                <p className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-10 text-center text-sm text-slate-400">
                  暂无符合条件的文件，尝试调整筛选条件或通过示例按钮新增文件。
                </p>
              )}
            </div>
          </section>
        </section>
      </div>
    </div>
  );
}
