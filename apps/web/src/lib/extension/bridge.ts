"use client";

import {
  BRIDGE_CHANNEL,
  BRIDGE_READY_EVENT,
  type BridgeMessage,
  type BridgeStatus,
  type BridgeEventMessage,
  type BridgeRequestMessage,
  type BridgeResponseMessage,
  isBridgeMessage,
} from "@cinaseek/web-shared/messaging";
import { createId } from "@/utils/id";

interface PendingRequest {
  resolve: (value: unknown) => void;
  reject: (reason: Error) => void;
  timeoutId: number;
}

interface ChromeRuntimePort {
  onMessage: { addListener: (listener: (message: any) => void) => void };
  onDisconnect: { addListener: (listener: () => void) => void };
  postMessage: (message: unknown) => void;
  disconnect: () => void;
}

interface ChromeRuntime {
  connect: (options: { name: string }) => ChromeRuntimePort;
}

interface ChromeGlobal {
  runtime?: ChromeRuntime;
}

declare const chrome: ChromeGlobal | undefined;

function createTimeout(reject: (error: Error) => void, duration = 5000) {
  return window.setTimeout(() => {
    reject(new Error("Extension bridge request timed out"));
  }, duration);
}

class ExtensionBridge {
  private port: ChromeRuntimePort | null = null;
  private status: BridgeStatus;
  private readonly pendingRequests = new Map<string, PendingRequest>();
  private readonly statusListeners = new Set<(status: BridgeStatus) => void>();
  private readonly eventListeners = new Map<string, Set<(payload: unknown) => void>>();

  constructor(private readonly channel = BRIDGE_CHANNEL) {
    this.status = this.isSupported() ? "disconnected" : "unsupported";
  }

  isSupported() {
    return typeof window !== "undefined" && typeof chrome !== "undefined" && !!chrome.runtime?.connect;
  }

  getStatus() {
    return this.status;
  }

  connect() {
    if (!this.isSupported()) {
      return;
    }

    if (this.port) {
      return;
    }

    this.updateStatus("connecting");

    const runtime = chrome?.runtime;
    if (!runtime?.connect) {
      this.updateStatus("unsupported");
      return;
    }

    try {
      this.port = runtime.connect({ name: this.channel });
    } catch (error) {
      console.warn("Unable to connect to CinaSeek extension", error);
      this.port = null;
      this.updateStatus("disconnected");
      return;
    }

    this.port.onMessage.addListener(this.handleMessage);
    this.port.onDisconnect.addListener(() => {
      this.port = null;
      this.rejectPending(new Error("Extension bridge disconnected"));
      this.updateStatus("disconnected");
    });

    this.updateStatus("connected");
  }

  disconnect() {
    if (this.port) {
      this.port.disconnect();
      this.port = null;
    }
    this.updateStatus(this.isSupported() ? "disconnected" : "unsupported");
  }

  async sendRequest<TResult = unknown>(method: string, params?: unknown) {
    if (!this.isSupported()) {
      throw new Error("浏览器扩展桥接不可用");
    }

    if (!this.port) {
      this.connect();
    }

    if (!this.port) {
      throw new Error("未检测到 CinaSeek 浏览器扩展");
    }

    const id = createId("bridge");
    const request: BridgeRequestMessage = {
      kind: "request",
      id,
      method,
      params,
    };

    return new Promise<TResult>((resolve, reject) => {
      const timeoutId = createTimeout((error) => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(error);
        }
      });

      this.pendingRequests.set(id, {
        resolve: resolve as (value: unknown) => void,
        reject,
        timeoutId,
      });

      try {
        this.port?.postMessage(request);
      } catch (error) {
        window.clearTimeout(timeoutId);
        this.pendingRequests.delete(id);
        reject(error instanceof Error ? error : new Error("发送请求失败"));
      }
    });
  }

  onEvent(event: string, handler: (payload: unknown) => void) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }

    const handlers = this.eventListeners.get(event)!;
    handlers.add(handler);

    return () => {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.eventListeners.delete(event);
      }
    };
  }

  subscribeStatus(listener: (status: BridgeStatus) => void) {
    this.statusListeners.add(listener);
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  private handleMessage = (message: BridgeMessage) => {
    if (!isBridgeMessage(message)) {
      return;
    }

    if (message.kind === "response") {
      this.handleResponse(message);
      return;
    }

    if (message.kind === "event") {
      this.handleEvent(message);
    }
  };

  private handleResponse(message: BridgeResponseMessage) {
    const entry = this.pendingRequests.get(message.id);
    if (!entry) {
      return;
    }

    window.clearTimeout(entry.timeoutId);
    this.pendingRequests.delete(message.id);

    if (message.error) {
      entry.reject(new Error(message.error.message));
      return;
    }

    entry.resolve(message.result);
  }

  private handleEvent(message: BridgeEventMessage) {
    if (message.event === BRIDGE_READY_EVENT) {
      this.updateStatus("connected");
    }

    const handlers = this.eventListeners.get(message.event);
    if (!handlers?.size) {
      return;
    }

    handlers.forEach((handler) => {
      try {
        handler(message.payload);
      } catch (error) {
        console.error("Extension event handler failed", error);
      }
    });
  }

  private rejectPending(error: Error) {
    this.pendingRequests.forEach((entry, id) => {
      window.clearTimeout(entry.timeoutId);
      entry.reject(error);
      this.pendingRequests.delete(id);
    });
  }

  private updateStatus(status: BridgeStatus) {
    if (this.status === status) {
      return;
    }
    this.status = status;
    this.statusListeners.forEach((listener) => listener(status));
  }
}

let extensionBridge: ExtensionBridge | null = null;

export function getExtensionBridge() {
  if (typeof window === "undefined") {
    return null;
  }

  if (!extensionBridge) {
    extensionBridge = new ExtensionBridge();
  }

  return extensionBridge;
}
