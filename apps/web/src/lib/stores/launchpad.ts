import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  LAUNCHPAD_STORAGE_KEY,
  LAUNCHPAD_STORAGE_VERSION,
  buildLaunchpadState,
  launchpadSeed,
  type LaunchpadFeature,
  type LaunchpadAutomation,
  type LaunchpadUpdate,
} from "@cinaseek/web-shared/launchpad";

interface LaunchpadDataState {
  features: LaunchpadFeature[];
  automations: LaunchpadAutomation[];
  updates: LaunchpadUpdate[];
  pinnedFeatureIds: string[];
  dismissedUpdateIds: string[];
}

export type LaunchpadState = LaunchpadDataState & {
  toggleFeaturePin: (id: string) => void;
  dismissUpdate: (id: string) => void;
  reset: () => void;
};

function buildInitialState(): LaunchpadDataState {
  const state = buildLaunchpadState(launchpadSeed);
  return {
    features: state.features,
    automations: state.automations,
    updates: state.updates,
    pinnedFeatureIds: state.pinnedFeatureIds,
    dismissedUpdateIds: [],
  };
}

const fallbackStorage = createJSONStorage(() => ({
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
}));

export const useLaunchpadStore = create<LaunchpadState>()(
  persist(
    (set, get) => ({
      ...buildInitialState(),
      toggleFeaturePin: (id) => {
        const featureExists = get().features.some((feature) => feature.id === id);
        if (!featureExists) {
          return;
        }
        set((state) => {
          const isPinned = state.pinnedFeatureIds.includes(id);
          return {
            pinnedFeatureIds: isPinned
              ? state.pinnedFeatureIds.filter((item) => item !== id)
              : [...state.pinnedFeatureIds, id],
          };
        });
      },
      dismissUpdate: (id) => {
        const updateExists = get().updates.some((update) => update.id === id);
        if (!updateExists) {
          return;
        }
        set((state) => ({
          dismissedUpdateIds: state.dismissedUpdateIds.includes(id)
            ? state.dismissedUpdateIds
            : [...state.dismissedUpdateIds, id],
        }));
      },
      reset: () => {
        set(buildInitialState());
      },
    }),
    {
      name: LAUNCHPAD_STORAGE_KEY,
      version: LAUNCHPAD_STORAGE_VERSION,
      storage:
        typeof window !== "undefined"
          ? createJSONStorage(() => window.localStorage)
          : fallbackStorage,
      partialize: (state) => ({
        pinnedFeatureIds: state.pinnedFeatureIds,
        dismissedUpdateIds: state.dismissedUpdateIds,
      }),
      migrate: (persisted) => {
        const initial = buildInitialState();
        if (!persisted) {
          return {
            pinnedFeatureIds: initial.pinnedFeatureIds,
            dismissedUpdateIds: [],
          } as Partial<LaunchpadState>;
        }

        const saved = persisted as Partial<LaunchpadState>;
        const pinned = saved.pinnedFeatureIds?.filter((id) =>
          initial.features.some((feature) => feature.id === id),
        );
        const dismissed = saved.dismissedUpdateIds?.filter((id) =>
          initial.updates.some((update) => update.id === id),
        );

        return {
          pinnedFeatureIds: pinned ?? initial.pinnedFeatureIds,
          dismissedUpdateIds: dismissed ?? [],
        } as Partial<LaunchpadState>;
      },
      onRehydrateStorage: () => () => {
        const next = buildLaunchpadState(launchpadSeed);
        useLaunchpadStore.setState({
          features: next.features,
          automations: next.automations,
          updates: next.updates,
        });
      },
    },
  ),
);

export function resetLaunchpadStore() {
  useLaunchpadStore.getState().reset();
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(LAUNCHPAD_STORAGE_KEY);
    } catch (error) {
      console.warn("Failed to clear persisted launchpad state", error);
    }
  }
}
