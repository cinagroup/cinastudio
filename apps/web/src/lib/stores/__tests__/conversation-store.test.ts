import { act } from "@testing-library/react";

import { resetConversationStore, useConversationStore } from "../conversation";

describe("conversation store", () => {
  beforeEach(() => {
    resetConversationStore();
  });

  it("switches assistant and falls back to the first topic", () => {
    const initialState = useConversationStore.getState();
    const targetAssistant = initialState.assistants[1];
    expect(targetAssistant).toBeDefined();

    act(() => {
      useConversationStore.getState().setActiveAssistant(targetAssistant.id);
    });

    const state = useConversationStore.getState();
    expect(state.activeAssistantId).toBe(targetAssistant.id);
    expect(state.activeTopicId).toBe(targetAssistant.topicIds[0]);
  });

  it("creates a new topic and selects it", () => {
    const state = useConversationStore.getState();
    const assistantId = state.activeAssistantId;
    expect(assistantId).toBeTruthy();

    let createdId: string | undefined;
    act(() => {
      createdId = useConversationStore.getState().createTopic({
        assistantId: assistantId!,
        title: "新的功能梳理",
      });
    });

    const nextState = useConversationStore.getState();
    expect(createdId).toBeTruthy();
    expect(nextState.activeTopicId).toBe(createdId);
    expect(nextState.topics[createdId!]?.title).toBe("新的功能梳理");
    const assistant = nextState.assistants.find((item) => item.id === assistantId);
    expect(assistant?.topicIds[0]).toBe(createdId);
    expect(assistant?.topicIds).toContain(createdId);
  });

  it("appends messages and updates metadata", () => {
    const { activeTopicId } = useConversationStore.getState();
    expect(activeTopicId).toBeTruthy();
    const beforeMessages = useConversationStore.getState().messagesByTopic[activeTopicId!].length;
    const beforeUpdatedAt = useConversationStore.getState().topics[activeTopicId!].updatedAt;

    act(() => {
      useConversationStore.getState().appendMessage({
        topicId: activeTopicId!,
        role: "user",
        content: "确认补充的测试用例已覆盖异常路径。",
      });
    });

    const afterState = useConversationStore.getState();
    expect(afterState.messagesByTopic[activeTopicId!]).toHaveLength(beforeMessages + 1);
    expect(afterState.messagesByTopic[activeTopicId!].at(-1)?.content).toContain("测试用例");
    expect(new Date(afterState.topics[activeTopicId!].updatedAt).getTime()).toBeGreaterThanOrEqual(
      new Date(beforeUpdatedAt).getTime(),
    );
  });

  it("captures external selection by creating a topic when necessary", () => {
    act(() => {
      useConversationStore.setState({ activeTopicId: null });
    });

    act(() => {
      useConversationStore.getState().appendExternalContent({ text: "这是新的截取内容" });
    });

    const state = useConversationStore.getState();
    expect(state.activeTopicId).toBeTruthy();
    const activeTopicId = state.activeTopicId!;
    const messages = state.messagesByTopic[activeTopicId];
    expect(messages.at(-1)?.content).toBe("这是新的截取内容");
  });

  it("manages composer draft mutations", () => {
    expect(useConversationStore.getState().composerDraft).toBe("");

    act(() => {
      useConversationStore.getState().setComposerDraft("初始输入");
    });
    expect(useConversationStore.getState().composerDraft).toBe("初始输入");

    act(() => {
      useConversationStore.getState().appendToComposer("追加内容");
    });
    expect(useConversationStore.getState().composerDraft).toBe("初始输入\n追加内容");

    act(() => {
      useConversationStore.getState().appendToComposer("覆盖", { replace: true });
    });
    expect(useConversationStore.getState().composerDraft).toBe("覆盖");
  });
});
