import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  MINAPPS_STORAGE_KEY,
  MINAPPS_STORAGE_VERSION,
  buildMiniAppsState,
  type MiniAppsFilters,
  type MiniAppsState,
  type MiniAppCategoryId,
  type SharedMiniApp,
} from "@cinaseek/web-shared/minapps";

import { createId } from "@/utils/id";

interface CreateMiniAppInput {
  name: string;
  url: string;
  description?: string;
  category?: MiniAppCategoryId;
  icon?: string;
  tags?: string[];
}

interface UpdateMiniAppInput {
  name?: string;
  url?: string;
  description?: string;
  category?: MiniAppCategoryId;
  icon?: string;
  tags?: string[];
}

type MiniAppsStore = MiniAppsState & {
  addCustomApp: (input: CreateMiniAppInput) => SharedMiniApp;
  updateApp: (id: string, input: UpdateMiniAppInput) => void;
  removeApp: (id: string) => void;
  togglePin: (id: string) => void;
  setFilters: (filters: Partial<MiniAppsFilters>) => void;
  setOpenInNewTab: (value: boolean) => void;
  markLaunched: (id: string) => void;
  reset: () => void;
};

function buildInitialState(): MiniAppsState {
  return buildMiniAppsState();
}

function normalizeUrl(url: string) {
  const trimmed = url.trim();
  if (!trimmed) {
    return trimmed;
  }

  if (trimmed.startsWith("/") || /^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

const fallbackStorage = createJSONStorage(() => ({
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
}));

export const useMinappsStore = create<MiniAppsStore>()(
  persist(
    (set) => ({
      ...buildInitialState(),
      addCustomApp: ({ name, url, description, category, icon, tags = [] }) => {
        const normalizedUrl = normalizeUrl(url);
        const cleanedTags = Array.from(
          new Set(tags.map((tag) => tag.trim()).filter(Boolean)),
        );

        const app: SharedMiniApp = {
          id: createId("miniapp"),
          name: name.trim(),
          description: description?.trim() ?? "",
          url: normalizedUrl,
          category: category ?? "productivity",
          icon: icon?.trim() || undefined,
          tags: cleanedTags,
          custom: true,
          addedAt: new Date().toISOString(),
          pinned: false,
          launchCount: 0,
        };

        set((state) => {
          const existingTagIds = new Set(state.tags.map((tag) => tag.id));
          const nextTags = [...state.tags];

          cleanedTags.forEach((tag) => {
            if (!existingTagIds.has(tag)) {
              nextTags.push({ id: tag, label: tag });
            }
          });

          return {
            apps: [app, ...state.apps],
            tags: nextTags,
          };
        });

        return app;
      },
      updateApp: (id, input) => {
        set((state) => ({
          apps: state.apps.map((app) =>
            app.id === id
              ? {
                  ...app,
                  ...input,
                  url: input.url ? normalizeUrl(input.url) : app.url,
                  tags: input.tags ? [...new Set(input.tags.map((tag) => tag.trim()).filter(Boolean))] : app.tags,
                  updatedAt: new Date().toISOString(),
                }
              : app,
          ),
        }));
      },
      removeApp: (id) => {
        set((state) => {
          const target = state.apps.find((app) => app.id === id);
          if (!target?.custom) {
            return state;
          }
          return {
            ...state,
            apps: state.apps.filter((app) => app.id !== id),
          };
        });
      },
      togglePin: (id) => {
        set((state) => ({
          apps: state.apps.map((app) =>
            app.id === id
              ? {
                  ...app,
                  pinned: !app.pinned,
                  updatedAt: new Date().toISOString(),
                }
              : app,
          ),
        }));
      },
      setFilters: (filters) => {
        set((state) => ({
          filters: {
            ...state.filters,
            ...filters,
          },
        }));
      },
      setOpenInNewTab: (value) => {
        set((state) => ({
          settings: {
            ...state.settings,
            openInNewTab: value,
          },
        }));
      },
      markLaunched: (id) => {
        set((state) => ({
          apps: state.apps.map((app) =>
            app.id === id
              ? {
                  ...app,
                  launchCount: (app.launchCount ?? 0) + 1,
                  lastLaunchedAt: new Date().toISOString(),
                }
              : app,
          ),
        }));
      },
      reset: () => {
        set(buildInitialState());
      },
    }),
    {
      name: MINAPPS_STORAGE_KEY,
      version: MINAPPS_STORAGE_VERSION,
      storage:
        typeof window !== "undefined"
          ? createJSONStorage(() => window.localStorage)
          : fallbackStorage,
      partialize: (state) => ({
        apps: state.apps,
        filters: state.filters,
        settings: state.settings,
        tags: state.tags,
        categories: state.categories,
      }),
      migrate: (persisted, version) => {
        if (!persisted || version === MINAPPS_STORAGE_VERSION) {
          return persisted as MiniAppsStore;
        }

        const rebuilt = buildInitialState();
        return {
          ...rebuilt,
          addCustomApp: (() => {
            throw new Error("Mini apps store not ready during migration");
          }) as MiniAppsStore["addCustomApp"],
          updateApp: () => undefined,
          removeApp: () => undefined,
          togglePin: () => undefined,
          setFilters: () => undefined,
          setOpenInNewTab: () => undefined,
          markLaunched: () => undefined,
          reset: () => undefined,
        } as MiniAppsStore;
      },
    },
  ),
);

export function resetMinappsStore() {
  useMinappsStore.getState().reset();
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(MINAPPS_STORAGE_KEY);
    } catch (error) {
      console.warn("Failed to clear persisted mini apps state", error);
    }
  }
}
