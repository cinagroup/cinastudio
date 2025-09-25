"use client";

import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useRef, useState } from "react";

import type { BridgeStatus } from "@cinaseek/web-shared/messaging";
import { getExtensionBridge } from "@/lib/extension/bridge";

interface ExtensionBridgeContextValue {
  status: BridgeStatus;
  isSupported: boolean;
  sendRequest: <T = unknown>(method: string, params?: unknown) => Promise<T>;
  onEvent: (event: string, handler: (payload: unknown) => void) => () => void;
}

const ExtensionBridgeContext = createContext<ExtensionBridgeContextValue>({
  status: "unsupported",
  isSupported: false,
  sendRequest: async () => {
    throw new Error("Extension bridge unavailable");
  },
  onEvent: () => () => undefined,
});

export function ExtensionBridgeProvider({ children }: PropsWithChildren) {
  const bridgeRef = useRef(getExtensionBridge());
  const isSupported = bridgeRef.current?.isSupported() ?? false;
  const [status, setStatus] = useState<BridgeStatus>(bridgeRef.current?.getStatus() ?? "unsupported");

  useEffect(() => {
    const bridge = bridgeRef.current;
    if (!bridge || !isSupported) {
      return;
    }

    const unsubscribe = bridge.subscribeStatus(setStatus);
    bridge.connect();

    return () => {
      unsubscribe();
    };
  }, [isSupported]);

  const value = useMemo<ExtensionBridgeContextValue>(() => {
    const bridge = bridgeRef.current;

    return {
      status,
      isSupported,
      sendRequest: bridge
        ? (method, params) => bridge.sendRequest(method, params)
        : async () => {
            throw new Error("Extension bridge unavailable");
          },
      onEvent: bridge ? bridge.onEvent.bind(bridge) : () => () => undefined,
    };
  }, [isSupported, status]);

  return <ExtensionBridgeContext.Provider value={value}>{children}</ExtensionBridgeContext.Provider>;
}

export function useExtensionBridge() {
  return useContext(ExtensionBridgeContext);
}
