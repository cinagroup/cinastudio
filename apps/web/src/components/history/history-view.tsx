"use client";

import { useCallback, useMemo, useState } from "react";
import { ChevronLeft, CornerDownLeft, Search } from "lucide-react";

import type { AssistantRecord, Message, Topic } from "@/types";
import { Button } from "@/components/ui/button";
import { useConversationStore } from "@/lib/stores/conversation";
import { type HistorySearchResult, searchMessages } from "@/lib/history/search";
import { TopicHistoryList } from "./topic-history-list";
import { TopicMessages } from "./topic-messages";
import { SearchResults } from "./search-results";
import { MessagePreview } from "./message-preview";

const INITIAL_ROUTE: Route[] = ["topics"];

type Route = "topics" | "topic" | "search" | "message";

type SearchSummary = {
  results: HistorySearchResult[];
  terms: string[];
  durationMs: number;
};

function createSearchSummary(): SearchSummary {
  return { results: [], terms: [], durationMs: 0 };
}

export function HistoryView() {
  const assistants = useConversationStore((state) => state.assistants);
  const topics = useConversationStore((state) => state.topics);
  const messagesByTopic = useConversationStore((state) => state.messagesByTopic);

  const [searchValue, setSearchValue] = useState("");
  const [routeStack, setRouteStack] = useState<Route[]>(INITIAL_ROUTE);
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  const [activeMessage, setActiveMessage] = useState<HistorySearchResult | null>(null);
  const [searchSummary, setSearchSummary] = useState<SearchSummary>(createSearchSummary);
  const [isSearching, setIsSearching] = useState(false);
  const [messageTerms, setMessageTerms] = useState<string[]>([]);

  const assistantById = useMemo(() => {
    return assistants.reduce<Map<string, AssistantRecord>>((acc, assistant) => {
      acc.set(assistant.id, assistant);
      return acc;
    }, new Map());
  }, [assistants]);

  const topicList = useMemo(() => Object.values(topics), [topics]);

  const selectedTopic: Topic | undefined = activeTopicId
    ? topics[activeTopicId]
    : undefined;

  const selectedMessages: Message[] = useMemo(() => {
    if (!selectedTopic) {
      return [];
    }
    const entries = messagesByTopic[selectedTopic.id] ?? [];
    return [...entries].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }, [messagesByTopic, selectedTopic]);

  const handleGoBack = useCallback(() => {
    setRouteStack((prev) => {
      if (prev.length <= 1) {
        return prev;
      }
      const next = prev.slice(0, prev.length - 1);
      const last = prev[prev.length - 1];
      if (last === "topic") {
        setActiveTopicId(null);
      }
      if (last === "message") {
        setActiveMessage(null);
        setMessageTerms([]);
      }
      if (last === "search") {
        setSearchSummary(createSearchSummary());
      }
      return next.length ? next : INITIAL_ROUTE;
    });
  }, []);

  const handleSelectTopic = useCallback(
    (topicId: string) => {
      if (!topics[topicId]) {
        return;
      }
      setActiveTopicId(topicId);
      setActiveMessage(null);
      setMessageTerms([]);
      setRouteStack(["topics", "topic"]);
    },
    [topics],
  );

  const handleSearch = useCallback(() => {
    const query = searchValue.trim();
    if (!query) {
      setSearchSummary(createSearchSummary());
      setRouteStack(["topics"]);
      return;
    }

    setIsSearching(true);
    const summary = searchMessages({
      query,
      assistants,
      topics,
      messagesByTopic,
    });
    setSearchSummary(summary);
    setActiveTopicId(null);
    setActiveMessage(null);
    setRouteStack(["topics", "search"]);
    setIsSearching(false);
  }, [assistants, messagesByTopic, searchValue, topics]);

  const handleSelectSearchTopic = useCallback(
    (topicId: string) => {
      handleSelectTopic(topicId);
    },
    [handleSelectTopic],
  );

  const handleSelectMessage = useCallback(
    (result: HistorySearchResult, source: "search" | "topic" = "search") => {
      setActiveMessage(result);
      setMessageTerms(source === "topic" ? [] : searchSummary.terms);
      if (source === "topic") {
        setRouteStack(["topics", "topic", "message"]);
      } else {
        setRouteStack(["topics", "search", "message"]);
      }
    },
    [searchSummary.terms],
  );

  const showBackButton = routeStack.length > 1;
  const currentRoute = routeStack[routeStack.length - 1] ?? "topics";

  return (
    <div className="flex h-full flex-1 flex-col">
      <div className="border-b border-white/5 bg-slate-950/80 px-4 py-3">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-3">
          {showBackButton ? (
            <button
              type="button"
              onClick={handleGoBack}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition hover:border-white/20 hover:text-white"
              aria-label="返回"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-400">
              <Search className="h-4 w-4" />
            </span>
          )}
          <div className="flex flex-1 items-center rounded-full border border-white/10 bg-white/5 px-4 text-sm text-slate-100 focus-within:border-primary">
            <input
              type="text"
              placeholder="搜索话题或消息"
              className="flex-1 bg-transparent text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleSearch();
                }
              }}
            />
            {searchValue ? (
              <CornerDownLeft className="h-4 w-4 text-slate-400" />
            ) : null}
            <Button
              type="button"
              variant="ghost"
              className="ml-2 hidden rounded-full border border-white/10 bg-white/5 px-3 text-xs text-slate-200 hover:border-white/20 hover:bg-white/10 sm:inline-flex"
              onClick={handleSearch}
            >
              搜索
            </Button>
          </div>
          <Button
            type="button"
            variant="ghost"
            className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 text-xs text-slate-200 hover:border-white/20 hover:bg-white/10 sm:hidden"
            onClick={handleSearch}
          >
            搜索
          </Button>
        </div>
      </div>
      <div className="grid flex-1 grid-cols-1 gap-6 overflow-hidden px-4 py-6 lg:grid-cols-[320px_1fr]">
        <TopicHistoryList
          topics={topicList}
          assistants={assistants}
          keywords={searchValue}
          onSelectTopic={handleSelectTopic}
          onSearchMessages={handleSearch}
          isCondensed={currentRoute !== "topics"}
        />
        <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-white/5 bg-white/[0.04]">
          {currentRoute === "topic" && selectedTopic ? (
            <TopicMessages
              topic={selectedTopic}
              assistant={assistantById.get(selectedTopic.assistantId)}
              messages={selectedMessages}
              onSelectMessage={(message) =>
                handleSelectMessage(
                  {
                    message,
                    topic: selectedTopic,
                    assistant: assistantById.get(selectedTopic.assistantId),
                  },
                  "topic",
                )
              }
            />
          ) : null}
          {currentRoute === "search" ? (
            <SearchResults
              results={searchSummary.results}
              terms={searchSummary.terms}
              durationMs={searchSummary.durationMs}
              isLoading={isSearching}
              onSelectTopic={handleSelectSearchTopic}
              onSelectMessage={handleSelectMessage}
            />
          ) : null}
          {currentRoute === "message" && activeMessage ? (
            <MessagePreview
              result={activeMessage}
              terms={messageTerms}
              onOpenTopic={() => {
                if (activeMessage.topic.id) {
                  handleSelectTopic(activeMessage.topic.id);
                }
              }}
            />
          ) : null}
          {currentRoute === "topics" ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center text-slate-400">
              <p className="text-sm">从左侧选择话题以查看详细记录，或输入关键字搜索历史消息。</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
