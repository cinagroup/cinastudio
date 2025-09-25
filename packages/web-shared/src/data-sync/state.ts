import { DATA_SYNC_CONNECTOR_DEFAULTS, DATA_SYNC_PROVIDERS } from "./seed";
import type {
  DataSyncConnectorState,
  DataSyncProviderId,
  DataSyncState,
} from "./types";

function buildConnectorConfig(providerId: DataSyncProviderId): Record<string, string | boolean> {
  const provider = DATA_SYNC_PROVIDERS.find((item) => item.id === providerId);
  const defaults = DATA_SYNC_CONNECTOR_DEFAULTS[providerId];
  const config: Record<string, string | boolean> = {};

  provider?.fields.forEach((field) => {
    const fallback = defaults?.config?.[field.key];
    const fromField = field.defaultValue;
    if (typeof fallback === "string" || typeof fallback === "boolean") {
      config[field.key] = fallback;
    } else if (typeof fromField === "string" || typeof fromField === "boolean") {
      config[field.key] = fromField;
    } else if (field.type === "switch") {
      config[field.key] = false;
    } else {
      config[field.key] = "";
    }
  });

  return config;
}

function buildConnector(providerId: DataSyncProviderId): DataSyncConnectorState {
  const defaults = DATA_SYNC_CONNECTOR_DEFAULTS[providerId];
  const config = buildConnectorConfig(providerId);

  return {
    providerId,
    enabled: defaults?.enabled ?? false,
    status: defaults?.status ?? "disconnected",
    lastSyncedAt: defaults?.lastSyncedAt ?? null,
    error: defaults?.error ?? null,
    config,
  };
}

export function buildDataSyncState(): DataSyncState {
  const connectors = DATA_SYNC_PROVIDERS.reduce<DataSyncState["connectors"]>((acc, provider) => {
    acc[provider.id] = buildConnector(provider.id);
    return acc;
  }, {} as DataSyncState["connectors"]);

  return {
    providers: DATA_SYNC_PROVIDERS,
    connectors,
    selectedProviderId: DATA_SYNC_PROVIDERS[0]?.id ?? null,
  };
}
