import { miniAppsSeed } from "./seed";
import type {
  MiniAppsSeed,
  MiniAppCategoryId,
  SharedMiniApp,
  SharedMiniAppCategory,
  SharedMiniAppTag,
} from "./types";

export const MINAPPS_STORAGE_KEY = "cinaseek.minapps";
export const MINAPPS_STORAGE_VERSION = 1;

export interface MiniAppsFilters {
  search?: string;
  category?: MiniAppCategoryId | "all";
  tag?: string | "all";
  showPinned?: boolean;
}

export interface MiniAppsSettings {
  openInNewTab: boolean;
}

export interface MiniAppsState {
  apps: SharedMiniApp[];
  categories: SharedMiniAppCategory[];
  tags: SharedMiniAppTag[];
  filters: MiniAppsFilters;
  settings: MiniAppsSettings;
}

export function buildMiniAppsState(seed: MiniAppsSeed = miniAppsSeed): MiniAppsState {
  return {
    apps: seed.apps.map((app) => ({
      ...app,
      tags: [...app.tags],
    })),
    categories: seed.categories.map((category) => ({ ...category })),
    tags: seed.tags.map((tag) => ({ ...tag })),
    filters: {
      search: "",
      category: "all",
      tag: "all",
      showPinned: false,
    },
    settings: {
      openInNewTab: true,
    },
  };
}
