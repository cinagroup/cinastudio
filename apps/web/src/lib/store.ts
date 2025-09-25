import { create } from "zustand";

interface AppState {
  status: "idle" | "connecting" | "connected";
  message: string;
  setMessage: (value: string) => void;
  setStatus: (value: AppState["status"]) => void;
}

export type AppStatus = AppState["status"];

export const useAppStore = create<AppState>((set) => ({
  status: "idle",
  message: "欢迎来到 CinaSeek Web 预览版。",
  setMessage: (value) => set({ message: value }),
  setStatus: (value) => set({ status: value }),
}));
