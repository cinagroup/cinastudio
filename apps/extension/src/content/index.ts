import { BRIDGE_SELECTION_EVENT, type BridgeSelectionPayload } from "@cinaseek/web-shared/messaging";

declare const chrome: typeof globalThis.chrome;

function buildSelectionPayload(text: string): BridgeSelectionPayload {
  return {
    text,
    url: window.location.href,
    title: document.title,
  };
}

function sendSelection() {
  const selection = window.getSelection()?.toString() ?? "";
  const trimmed = selection.trim();
  if (!trimmed) {
    return;
  }

  chrome.runtime.sendMessage({
    kind: "event",
    event: BRIDGE_SELECTION_EVENT,
    payload: buildSelectionPayload(trimmed),
  });
}

chrome.runtime.onMessage.addListener((message) => {
  if (message?.kind === "capture-selection") {
    sendSelection();
  }
});

document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "enter") {
    sendSelection();
  }
});
