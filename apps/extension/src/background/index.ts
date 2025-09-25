import {
  BRIDGE_CHANNEL,
  BRIDGE_READY_EVENT,
  type BridgeEventMessage,
  type BridgeRequestMessage,
  type BridgeSelectionPayload,
  isBridgeEventMessage,
  isBridgeRequestMessage,
} from "@cinaseek/web-shared/messaging";

const connections = new Map<number, chrome.runtime.Port>();

chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== BRIDGE_CHANNEL) {
    return;
  }

  const tabId = port.sender?.tab?.id;
  if (typeof tabId !== "number") {
    port.disconnect();
    return;
  }

  connections.set(tabId, port);

  port.onMessage.addListener((message) => {
    if (isBridgeRequestMessage(message)) {
      handleRequest(port, message).catch((error) => {
        port.postMessage({
          kind: "response",
          id: message.id,
          error: {
            message: error instanceof Error ? error.message : String(error),
          },
        });
      });
    }
  });

  port.onDisconnect.addListener(() => {
    connections.delete(tabId);
  });

  port.postMessage({
    kind: "event",
    event: BRIDGE_READY_EVENT,
  });
});

chrome.runtime.onMessage.addListener((message, sender) => {
  if (!isBridgeEventMessage(message)) {
    return false;
  }

  const payload = message.payload as BridgeSelectionPayload | undefined;
  broadcastEvent(message.event, payload, sender.tab?.id);
  return false;
});

chrome.commands?.onCommand.addListener((command) => {
  if (command !== "capture-selection") {
    return;
  }

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const [tab] = tabs;
    if (!tab?.id) {
      return;
    }
    chrome.tabs.sendMessage(tab.id, { kind: "capture-selection" });
  });
});

async function handleRequest(port: chrome.runtime.Port, message: BridgeRequestMessage) {
  switch (message.method) {
    case "ping":
      port.postMessage({
        kind: "response",
        id: message.id,
        result: { ok: true },
      });
      return;
    default:
      throw new Error(`Unknown bridge method: ${message.method}`);
  }
}

function broadcastEvent(event: string, payload?: unknown, originTabId?: number) {
  connections.forEach((connection, tabId) => {
    if (originTabId && tabId === originTabId) {
      return;
    }
    try {
      connection.postMessage({ kind: "event", event, payload } satisfies BridgeEventMessage);
    } catch (error) {
      console.warn("Failed to dispatch bridge event", error);
    }
  });
}
