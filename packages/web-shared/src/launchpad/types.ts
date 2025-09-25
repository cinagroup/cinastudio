export type LaunchpadFeatureStatus = "available" | "in-progress" | "planned";
export type LaunchpadAutomationStatus = "active" | "scheduled" | "planned";
export type LaunchpadUpdateStatus = "shipped" | "in-progress" | "planned";
export type LaunchpadFeatureIcon =
  | "launchpad"
  | "workspace"
  | "knowledge"
  | "extension"
  | "files"
  | "agents"
  | "translate"
  | "memory"
  | "notes"
  | "code"
  | "settings"
  | "paintings"
  | "minapps";

export interface LaunchpadFeature {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: LaunchpadFeatureIcon;
  status: LaunchpadFeatureStatus;
  tags: string[];
  external?: boolean;
  defaultPinned?: boolean;
}

export interface LaunchpadAutomation {
  id: string;
  title: string;
  description: string;
  status: LaunchpadAutomationStatus;
  cadence: string;
  owner: string;
  tags: string[];
  href?: string;
  external?: boolean;
}

export interface LaunchpadUpdate {
  id: string;
  title: string;
  summary: string;
  date: string;
  status: LaunchpadUpdateStatus;
  tags: string[];
  href?: string;
  external?: boolean;
}

export interface LaunchpadSeed {
  features: LaunchpadFeature[];
  automations: LaunchpadAutomation[];
  updates: LaunchpadUpdate[];
  pinnedFeatureIds?: string[];
}

export interface LaunchpadNormalizedState {
  features: LaunchpadFeature[];
  automations: LaunchpadAutomation[];
  updates: LaunchpadUpdate[];
  pinnedFeatureIds: string[];
}

export const LAUNCHPAD_STORAGE_KEY = "cinaseek.launchpad";
export const LAUNCHPAD_STORAGE_VERSION = 1;
