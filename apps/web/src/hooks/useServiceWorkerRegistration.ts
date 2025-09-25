"use client";

import { useEffect, useState } from "react";

export type ServiceWorkerStatus =
  | "idle"
  | "unsupported"
  | "registering"
  | "ready"
  | "error";

export function useServiceWorkerRegistration() {
  const [status, setStatus] = useState<ServiceWorkerStatus>(() =>
    typeof window !== "undefined" && "serviceWorker" in navigator ? "idle" : "unsupported",
  );

  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      setStatus("unsupported");
      return;
    }

    let cancelled = false;

    async function register() {
      try {
        setStatus("registering");
        const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });

        if (cancelled) {
          return;
        }

        if (registration.installing) {
          registration.installing.addEventListener("statechange", () => {
            if (registration.waiting || registration.active) {
              setStatus("ready");
            }
          });
        }

        if (registration.active || registration.waiting) {
          setStatus("ready");
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Service worker registration failed", error);
          setStatus("error");
        }
      }
    }

    register();

    return () => {
      cancelled = true;
    };
  }, []);

  return status;
}
