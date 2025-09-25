export type MiniAppCategoryId =
  | "workspace"
  | "knowledge"
  | "productivity"
  | "extension"
  | "creative";

export interface SharedMiniAppCategory {
  id: MiniAppCategoryId;
  name: string;
  description: string;
  accent?: string;
}

export interface SharedMiniAppTag {
  id: string;
  label: string;
}

export interface SharedMiniApp {
  id: string;
  name: string;
  description: string;
  url: string;
  category: MiniAppCategoryId;
  icon?: string;
  tags: string[];
  pinned?: boolean;
  custom?: boolean;
  addedAt: string;
  updatedAt?: string;
  lastLaunchedAt?: string;
  launchCount?: number;
}

export interface MiniAppsSeed {
  apps: SharedMiniApp[];
  categories: SharedMiniAppCategory[];
  tags: SharedMiniAppTag[];
}
