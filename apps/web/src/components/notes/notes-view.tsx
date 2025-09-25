"use client";

import { FormEvent, useMemo, useState } from "react";

import { Filter, NotepadText, Search } from "lucide-react";

import type { SharedNoteCategory } from "@cinaseek/web-shared/notes";

import { Button } from "@/components/ui/button";
import { useNotesStore } from "@/lib/stores/notes";
import { cn } from "@/utils/cn";

import { NoteCard } from "./note-card";

type DraftState = {
  title: string;
  content: string;
  category: SharedNoteCategory;
  tags: string[];
};

const INITIAL_DRAFT: DraftState = {
  title: "",
  content: "",
  category: "knowledge",
  tags: [],
};

export function NotesView() {
  const { notes, categories, tags, filters, createNote, setFilters, togglePin, deleteNote } = useNotesStore();
  const [draft, setDraft] = useState<DraftState>(INITIAL_DRAFT);
  const [searchQuery, setSearchQuery] = useState(filters.search ?? "");

  const filteredNotes = useMemo(() => {
    return notes
      .filter((note) => {
        if (filters.showPinned && !note.pinned) {
          return false;
        }
        if (filters.category && filters.category !== "all" && note.category !== filters.category) {
          return false;
        }
        if (filters.tag && filters.tag !== "all" && !note.tags.includes(filters.tag)) {
          return false;
        }
        if (filters.search) {
          const query = filters.search.toLowerCase();
          const haystack = `${note.title} ${note.summary} ${note.content}`.toLowerCase();
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
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [notes, filters]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.title.trim() || !draft.content.trim()) {
      return;
    }
    createNote({
      title: draft.title.trim(),
      content: draft.content.trim(),
      category: draft.category,
      tags: draft.tags,
      summary: draft.content.slice(0, 140),
    });
    setDraft(INITIAL_DRAFT);
  }

  function handleToggleTag(tagId: string) {
    setDraft((current) => ({
      ...current,
      tags: current.tags.includes(tagId)
        ? current.tags.filter((item) => item !== tagId)
        : [...current.tags, tagId],
    }));
  }

  return (
    <div className="flex h-full flex-col gap-10 overflow-y-auto px-4 py-8 sm:px-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-primary/70">Notes</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-50">团队笔记与迁移纪要</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-300">
            汇总浏览器化迁移过程中的关键决策、操作手册与每日复盘，支持按标签与类别筛选。
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-300">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={Boolean(filters.showPinned)}
              onChange={(event) => setFilters({ showPinned: event.target.checked })}
              className="h-4 w-4 rounded border-white/20 bg-slate-900 text-primary focus:ring-primary/40"
            />
            仅显示置顶
          </label>
        </div>
      </header>

      <section className="grid gap-6 rounded-2xl border border-white/10 bg-slate-900/60 p-6 shadow-xl lg:grid-cols-[0.9fr_1.1fr]">
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-primary/70">
            <NotepadText className="h-4 w-4" />
            新建笔记
          </div>
          <input
            type="text"
            value={draft.title}
            onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
            placeholder="记录标题"
            className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-slate-100 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <textarea
            value={draft.content}
            onChange={(event) => setDraft((current) => ({ ...current, content: event.target.value }))}
            placeholder="记录详细内容，支持 Markdown"
            className="min-h-[160px] rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-xs text-slate-300">
              类别
              <select
                value={draft.category}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    category: event.target.value as SharedNoteCategory,
                  }))
                }
                className="rounded-lg border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex flex-col gap-2 text-xs text-slate-300">
              标签
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => {
                  const active = draft.tags.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => handleToggleTag(tag.id)}
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs transition",
                        active
                          ? "border-primary/40 bg-primary/20 text-primary"
                          : "border-white/10 bg-white/5 text-slate-300 hover:border-primary/30 hover:text-primary",
                      )}
                    >
                      {tag.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <Button type="submit" disabled={!draft.title.trim() || !draft.content.trim()}>
            保存笔记
          </Button>
        </form>

        <div className="flex flex-col gap-4 rounded-xl border border-white/5 bg-slate-950/70 p-5">
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
            <div className="flex flex-1 items-center gap-2 rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2">
              <Search className="h-4 w-4 text-slate-500" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => {
                  const value = event.target.value;
                  setSearchQuery(value);
                  setFilters({ search: value });
                }}
                placeholder="搜索标题或内容"
                className="flex-1 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
              />
            </div>
            <select
              value={filters.category ?? "all"}
              onChange={(event) => setFilters({ category: event.target.value as SharedNoteCategory | "all" })}
              className="rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2 text-xs text-slate-200"
            >
              <option value="all">全部类别</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <select
              value={filters.tag ?? "all"}
              onChange={(event) => setFilters({ tag: event.target.value })}
              className="rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2 text-xs text-slate-200"
            >
              <option value="all">全部标签</option>
              {tags.map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.label}
                </option>
              ))}
            </select>
          </div>
          <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-primary/70">
            <Filter className="h-4 w-4" />
            已筛选 {filteredNotes.length} 条记录
          </p>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredNotes.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-dashed border-white/15 bg-slate-900/50 px-6 py-10 text-center text-sm text-slate-400">
                暂无匹配的笔记，可以调整筛选条件或创建新的记录。
              </div>
            ) : (
              filteredNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onTogglePin={togglePin}
                  onDelete={deleteNote}
                />
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
