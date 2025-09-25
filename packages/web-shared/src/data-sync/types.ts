export type DataSyncProviderId =
  | "webdav"
  | "s3"
  | "notion"
  | "obsidian"
  | "yuque";

export type DataSyncProviderCategory = "self_hosted" | "cloud" | "knowledge";

export type DataSyncFieldType = "text" | "password" | "url" | "token" | "switch";

export interface DataSyncFieldDefinition {
  key: string;
  label: string;
  description?: string;
  placeholder?: string;
  type: DataSyncFieldType;
  defaultValue?: string | boolean;
}

export interface DataSyncProviderDefinition {
  id: DataSyncProviderId;
  name: string;
  description: string;
  category: DataSyncProviderCategory;
  badge?: string;
  tags: string[];
  docsUrl?: string;
  highlights?: string[];
  fields: DataSyncFieldDefinition[];
}

export type DataSyncConnectorStatus = "disconnected" | "syncing" | "connected" | "error";

export interface DataSyncConnectorState {
  providerId: DataSyncProviderId;
  enabled: boolean;
  status: DataSyncConnectorStatus;
  lastSyncedAt?: string | null;
  error?: string | null;
  config: Record<string, string | boolean>;
}

export interface DataSyncState {
  providers: DataSyncProviderDefinition[];
  connectors: Record<DataSyncProviderId, DataSyncConnectorState>;
  selectedProviderId: DataSyncProviderId | null;
}

export const DATA_SYNC_STORAGE_KEY = "cinaseek.data-sync";
export const DATA_SYNC_STORAGE_VERSION = 1;
