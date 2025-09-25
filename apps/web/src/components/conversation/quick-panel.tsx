"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { shallow } from "zustand/shallow";

import {
  Bot,
  Clock4,
  Command,
  FileText,
  Folder,
  History,
  MessageSquare,
  Rocket,
  Search,
  Settings,
  Sparkles,
} from "lucide-react";

import { useCommandPaletteStore } from "@/lib/stores/command-palette";
import { useConversationStore } from "@/lib/stores/conversation";
import { formatRelativeTime } from "@/utils/datetime";
import { cn } from "@/utils/cn";

import type { CommandPaletteCommand } from "@cinaseek/web-shared/command-palette";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  rocket: Rocket,
  settings: Settings,
  folder: Folder,
  sparkles: Sparkles,
  message: MessageSquare,
};

const SECTION_LABELS: Record<string, string> = {
  prompt: "快速指令",
  assistant: "切换助手",
  topic: "最近话题",
  navigation: "页面导航",
};

type AssistantQuickCommand = {
  id: string;
  type: "assistant";
  label: string;
  description?: string;
  assistantId: string;
  keywords?: string[];
};

type TopicQuickCommand = {
  id: string;
  type: "topic";
  label: string;
  description?: string;
  assistantId: string;
  topicId: string;
  updatedAt: string;
  keywords?: string[];
};

type QuickCommand = CommandPaletteCommand | AssistantQuickCommand | TopicQuickCommand;

type QuickCommandType = QuickCommand["type"];

type NavigationCommand = Extract<CommandPaletteCommand, { type: "navigation" }>;
type PromptCommand = Extract<CommandPaletteCommand, { type: "prompt" }>;

const SECTION_ORDER: QuickCommandType[] = ["prompt", "assistant", "topic", "navigation"];

function getIconForCommand(command: QuickCommand) {
  if (command.type === "assistant") {
    return Bot;
  }
  if (command.type === "topic") {
    return History;
  }
  if (command.type === "prompt") {
    const icon = (command as PromptCommand).icon;
    if (icon && ICON_MAP[icon]) {
      return ICON_MAP[icon];
    }
    return Sparkles;
  }
  if (command.type === "navigation") {
    const icon = (command as NavigationCommand).icon;
    if (icon && ICON_MAP[icon]) {
      return ICON_MAP[icon];
    }
    return FileText;
  }
  return Command;
}

function focusComposerTextarea() {
  const composer = document.querySelector<HTMLTextAreaElement>("textarea[data-quickpanel-target='composer']");
  if (!composer) {
    return;
  }
  const schedule =
    typeof window.requestAnimationFrame === "function"
      ? window.requestAnimationFrame.bind(window)
      : (callback: FrameRequestCallback) => window.setTimeout(callback, 0);
  schedule(() => {
    composer.focus();
    composer.setSelectionRange(composer.value.length, composer.value.length);
  });
}

export function QuickPanel() {
  const router = useRouter();
  const { commands: baseCommands, isOpen, query, toggle, close, setQuery } = useCommandPaletteStore(
    (state) => ({
      commands: state.commands,
      isOpen: state.isOpen,
      query: state.query,
      toggle: state.toggle,
      close: state.close,
      setQuery: state.setQuery,
    }),
    shallow,
  );

  const {
    assistants,
    topics,
    activeAssistantId,
    setActiveAssistant,
    setActiveTopic,
    appendToComposer,
  } = useConversationStore(
    (state) => ({
      assistants: state.assistants,
      topics: state.topics,
      activeAssistantId: state.activeAssistantId,
      setActiveAssistant: state.setActiveAssistant,
      setActiveTopic: state.setActiveTopic,
      appendToComposer: state.appendToComposer,
    }),
    shallow,
  );

  const inputRef = useRef<HTMLInputElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const assistantCommands = useMemo<AssistantQuickCommand[]>(
    () =>
      assistants.map((assistant) => ({
        id: `assistant-${assistant.id}`,
        type: "assistant" as const,
        label: `切换至 ${assistant.name}`,
        description: assistant.description,
        assistantId: assistant.id,
        keywords: [assistant.name, assistant.description ?? ""].filter(Boolean),
      })),
    [assistants],
  );

  const topicCommands = useMemo<TopicQuickCommand[]>(() => {
    const topicList = Object.values(topics);
    return topicList
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 12)
      .map((topic) => {
        const assistant = assistants.find((item) => item.id === topic.assistantId);
        return {
          id: `topic-${topic.id}`,
          type: "topic" as const,
          label: topic.title,
          description: assistant ? `${assistant.name}` : undefined,
          assistantId: topic.assistantId,
          topicId: topic.id,
          updatedAt: topic.updatedAt,
          keywords: [topic.title, assistant?.name ?? ""].filter(Boolean),
        };
      });
  }, [assistants, topics]);

  const allCommands = useMemo<QuickCommand[]>(
    () => [...baseCommands, ...assistantCommands, ...topicCommands],
    [assistantCommands, baseCommands, topicCommands],
  );

  const normalizedQuery = query.trim().toLowerCase();

  const filteredCommands = useMemo(() => {
    if (!normalizedQuery) {
      return allCommands;
    }

    return allCommands.filter((command) => {
      const haystack = [command.label, command.description ?? "", ...(command.keywords ?? [])]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [allCommands, normalizedQuery]);

  const groupedCommands = useMemo(() => {
    return SECTION_ORDER.map((type) => ({
      type,
      title: SECTION_LABELS[type] ?? type,
      items: filteredCommands.filter((command) => command.type === type),
    })).filter((section) => section.items.length > 0);
  }, [filteredCommands]);

  const flatCommands = useMemo(() => groupedCommands.flatMap((section) => section.items), [groupedCommands]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (flatCommands.length === 0) {
      setActiveIndex(-1);
      return;
    }

    setActiveIndex((previous) => {
      if (previous < 0) {
        return 0;
      }
      return Math.min(previous, flatCommands.length - 1);
    });
  }, [flatCommands, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const hasRaf = typeof window.requestAnimationFrame === "function";
    const frameOrTimeout: number = hasRaf
      ? window.requestAnimationFrame(() => inputRef.current?.focus())
      : window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => {
      if (hasRaf && typeof window.cancelAnimationFrame === "function") {
        window.cancelAnimationFrame(frameOrTimeout);
      } else {
        window.clearTimeout(frameOrTimeout);
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    setActiveIndex(0);
  }, [normalizedQuery, isOpen]);

  const handleSelect = useCallback(
    (command: QuickCommand) => {
      switch (command.type) {
        case "prompt": {
          const prompt = command as PromptCommand;
          appendToComposer(prompt.content);
          focusComposerTextarea();
          break;
        }
        case "navigation": {
          const navigation = command as NavigationCommand;
          router.push(navigation.href);
          break;
        }
        case "assistant": {
          if (command.assistantId !== activeAssistantId) {
            setActiveAssistant(command.assistantId);
          }
          focusComposerTextarea();
          break;
        }
        case "topic": {
          if (command.assistantId !== activeAssistantId) {
            setActiveAssistant(command.assistantId);
          }
          setActiveTopic(command.topicId);
          focusComposerTextarea();
          break;
        }
        default:
          break;
      }
      close();
    },
    [activeAssistantId, appendToComposer, close, router, setActiveAssistant, setActiveTopic],
  );

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        toggle();
        return;
      }

      if (!isOpen) {
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        if (flatCommands.length === 0) {
          return;
        }
        setActiveIndex((index) => (index + 1) % flatCommands.length);
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        if (flatCommands.length === 0) {
          return;
        }
        setActiveIndex((index) => (index - 1 + flatCommands.length) % flatCommands.length);
        return;
      }

      if (event.key === "Enter") {
        if (activeIndex >= 0 && flatCommands[activeIndex]) {
          event.preventDefault();
          handleSelect(flatCommands[activeIndex]);
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, close, flatCommands, handleSelect, isOpen, toggle]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/60 backdrop-blur-sm"
      onClick={() => close()}
      role="presentation"
    >
      <div
        className="mt-24 w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-950/90 text-slate-100 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center gap-2 border-b border-white/10 px-5 py-4">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索操作、话题或助手 (⌘K)"
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
          <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase tracking-widest text-slate-400">
            Esc 关闭
          </span>
        </div>
        <div className="max-h-[420px] overflow-y-auto px-4 py-3">
          {groupedCommands.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-sm text-slate-400">
              <Clock4 className="h-6 w-6" />
              <p>没有匹配的结果，尝试使用其他关键词。</p>
            </div>
          ) : (
            groupedCommands.map((section) => (
              <Fragment key={section.type}>
                <p className="mt-4 px-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 first:mt-2">
                  {section.title}
                </p>
                <ul className="mt-2 space-y-1">
                  {section.items.map((command) => {
                    const Icon = getIconForCommand(command);
                    const index = flatCommands.indexOf(command);
                    const isActive = index === activeIndex;
                    return (
                      <li key={command.id}>
                        <button
                          type="button"
                          className={cn(
                            "flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left",
                            "transition-all",
                            isActive
                              ? "border-primary/50 bg-primary/15 text-slate-50"
                              : "border-white/5 bg-white/5 text-slate-200 hover:border-primary/40 hover:bg-primary/10",
                          )}
                          onClick={() => handleSelect(command)}
                        >
                          <div className="flex items-center gap-3">
                            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10">
                              <Icon className="h-4 w-4" />
                            </span>
                            <div>
                              <p className="text-sm font-medium">{command.label}</p>
                              <p className="text-xs text-slate-400">
                                {command.type === "topic" && "updatedAt" in command
                                  ? `${command.description ?? "最近话题"} · ${formatRelativeTime(command.updatedAt)}`
                                  : command.description ?? ""}
                              </p>
                            </div>
                          </div>
                          {command.type === "navigation" && (
                            <span className="text-[10px] uppercase tracking-[0.3em] text-slate-500">
                              前往
                            </span>
                          )}
                          {command.type === "prompt" && (
                            <span className="text-[10px] uppercase tracking-[0.3em] text-slate-500">
                              插入
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </Fragment>
            ))
          )}
        </div>
        <div className="border-t border-white/10 px-5 py-3 text-xs text-slate-400">
          提示：使用 <span className="rounded border border-white/10 px-1">⌘/Ctrl + K</span> 打开面板，方向键浏览，Enter 选中。
        </div>
      </div>
    </div>
  );
}
