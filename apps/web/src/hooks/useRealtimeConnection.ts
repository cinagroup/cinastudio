"use client";

import { useEffect } from "react";

import { getSocket } from "@/lib/socket";
import { useAppStore } from "@/lib/store";

export function useRealtimeConnection() {
  const setStatus = useAppStore((state) => state.setStatus);

  useEffect(() => {
    if (process.env.NODE_ENV === "test") {
      setStatus("connected");
      return;
    }

    if (!process.env.NEXT_PUBLIC_SOCKET_URL) {
      return;
    }

    const socket = getSocket();

    function handleConnect() {
      setStatus("connected");
    }

    function handleConnecting() {
      setStatus("connecting");
    }

    function handleDisconnect() {
      setStatus("idle");
    }

    socket.on("connect", handleConnect);
    socket.io.on("reconnect_attempt", handleConnecting);
    socket.on("disconnect", handleDisconnect);
    socket.connect();

    return () => {
      socket.off("connect", handleConnect);
      socket.io.off("reconnect_attempt", handleConnecting);
      socket.off("disconnect", handleDisconnect);
      socket.disconnect();
    };
  }, [setStatus]);
}
