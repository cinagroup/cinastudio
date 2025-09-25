"use client";

import { type PropsWithChildren, useEffect } from "react";

import { BRIDGE_SELECTION_EVENT, type BridgeSelectionPayload } from "@cinaseek/web-shared/messaging";
import { ExtensionBridgeProvider, useExtensionBridge } from "@/hooks/useExtensionBridge";
import { useServiceWorkerRegistration } from "@/hooks/useServiceWorkerRegistration";
import { useConversationStore } from "@/lib/stores/conversation";
import { useAppStore } from "@/lib/store";

function ServiceWorkerRegistrar() {
  const status = useServiceWorkerRegistration();
  const setStatus = useAppStore((state) => state.setStatus);

  useEffect(() => {
    if (status === "ready") {
      setStatus("connected");
    } else if (status === "registering") {
      setStatus("connecting");
    } else if (status === "error" || status === "unsupported") {
      setStatus("idle");
    }
  }, [setStatus, status]);

  return null;
}

function ExtensionEventBindings() {
  const { isSupported, onEvent, status } = useExtensionBridge();
  const appendExternalContent = useConversationStore((state) => state.appendExternalContent);
  const setStatus = useAppStore((state) => state.setStatus);

  useEffect(() => {
    if (!isSupported) {
      return;
    }

    const unsubscribe = onEvent(BRIDGE_SELECTION_EVENT, (payload) => {
      appendExternalContent(payload as BridgeSelectionPayload);
    });

    return unsubscribe;
  }, [appendExternalContent, isSupported, onEvent]);

  useEffect(() => {
    if (status === "connected") {
      setStatus("connected");
    } else if (status === "connecting") {
      setStatus("connecting");
    } else if (status === "unsupported" || status === "disconnected") {
      setStatus("idle");
    }
  }, [setStatus, status]);

  return null;
}

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ExtensionBridgeProvider>
      <ServiceWorkerRegistrar />
      <ExtensionEventBindings />
      {children}
    </ExtensionBridgeProvider>
  );
}
