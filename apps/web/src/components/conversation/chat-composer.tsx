"use client";

import { Send } from "lucide-react";
import { type FormEvent, useCallback, useState } from "react";
import { shallow } from "zustand/shallow";

import { Button } from "@/components/ui/button";
import { useConversationStore } from "@/lib/stores/conversation";

function buildAssistantReply(input: string, assistantName: string) {
  const normalized = input.trim().slice(0, 120);
  const preview = normalized.length === input.trim().length ? normalized : `${normalized}…`;
  return `${assistantName} 已收到任务：${preview}\n\n正在调度知识库与工具链，稍后呈现完整答复。`;
}

export function ChatComposer() {
  const {
    activeTopicId,
    activeAssistantId,
    assistants,
    appendMessage,
    composerDraft,
    setComposerDraft,
  } = useConversationStore(
    (state) => ({
      activeTopicId: state.activeTopicId,
      activeAssistantId: state.activeAssistantId,
      assistants: state.assistants,
      appendMessage: state.appendMessage,
      composerDraft: state.composerDraft,
      setComposerDraft: state.setComposerDraft,
    }),
    shallow,
  );
  const [isSending, setIsSending] = useState(false);

  const assistant = assistants.find((item) => item.id === activeAssistantId);

  const sendMessage = useCallback(() => {
    if (!activeTopicId || isSending) {
      return;
    }
    const trimmed = composerDraft.trim();
    if (!trimmed) {
      return;
    }
    setIsSending(true);
    appendMessage({ topicId: activeTopicId, role: "user", content: trimmed });
    setComposerDraft("");

    if (assistant) {
      const response = buildAssistantReply(trimmed, assistant.name);
      window.setTimeout(() => {
        appendMessage({ topicId: activeTopicId, role: "assistant", content: response });
        setIsSending(false);
      }, 450);
    } else {
      setIsSending(false);
    }
  }, [activeTopicId, appendMessage, assistant, composerDraft, isSending, setComposerDraft]);

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      sendMessage();
    },
    [sendMessage],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        data-quickpanel-target="composer"
        value={composerDraft}
        onChange={(event) => setComposerDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
          }
        }}
        placeholder="发送指令，例如：汇总今日进度，或生成多语言版本的发布说明"
        className="min-h-[120px] w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 shadow-inner focus:border-primary focus:outline-none"
      />
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <span>Shift + Enter 换行</span>
        <Button
          type="submit"
          disabled={!composerDraft.trim() || !activeTopicId || isSending}
          className="gap-2"
        >
          <Send className="h-4 w-4" /> 发送
        </Button>
      </div>
    </form>
  );
}
