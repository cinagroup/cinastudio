export const BRIDGE_CHANNEL = "cinaseek.bridge" as const;

export type BridgeStatus = "unsupported" | "disconnected" | "connecting" | "connected";

export interface BridgeRequestMessage {
  kind: "request";
  id: string;
  method: string;
  params?: unknown;
}

export interface BridgeResponseError {
  message: string;
  code?: string;
  details?: unknown;
}

export interface BridgeResponseMessage {
  kind: "response";
  id: string;
  result?: unknown;
  error?: BridgeResponseError;
}

export interface BridgeEventMessage {
  kind: "event";
  event: string;
  payload?: unknown;
}

export type BridgeMessage = BridgeRequestMessage | BridgeResponseMessage | BridgeEventMessage;

export interface BridgeSelectionPayload {
  text: string;
  url?: string;
  title?: string;
}

export function isBridgeMessage(value: unknown): value is BridgeMessage {
  if (!value || typeof value !== "object") {
    return false;
  }

  const { kind } = value as { kind?: unknown };
  return kind === "request" || kind === "response" || kind === "event";
}

export function isBridgeEventMessage(value: unknown): value is BridgeEventMessage {
  return isBridgeMessage(value) && value.kind === "event";
}

export function isBridgeRequestMessage(value: unknown): value is BridgeRequestMessage {
  if (!isBridgeMessage(value) || value.kind !== "request") {
    return false;
  }

  const hasId = typeof value.id === "string" && value.id.length > 0;
  const hasMethod = typeof value.method === "string" && value.method.length > 0;
  return hasId && hasMethod;
}

export function isBridgeResponseMessage(value: unknown): value is BridgeResponseMessage {
  return isBridgeMessage(value) && value.kind === "response";
}

export const BRIDGE_READY_EVENT = "bridge:ready";
export const BRIDGE_SELECTION_EVENT = "content.selection";
