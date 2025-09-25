import { act } from "@testing-library/react";

import {
  resetDataSyncStore,
  useDataSyncStore,
  type DataSyncProviderId,
} from "@/lib/stores/data-sync";

describe("useDataSyncStore", () => {
  beforeEach(() => {
    resetDataSyncStore();
  });

  it("initializes connectors for all providers", () => {
    const state = useDataSyncStore.getState();
    expect(Object.keys(state.connectors)).toHaveLength(state.providers.length);
    expect(state.selectedProviderId).toBe(state.providers[0]?.id ?? null);
  });

  it("toggles connector availability", () => {
    act(() => {
      useDataSyncStore.getState().toggleConnector("webdav", true);
    });

    expect(useDataSyncStore.getState().connectors.webdav.enabled).toBe(true);
  });

  it("updates connector configuration and trims values", () => {
    act(() => {
      useDataSyncStore.getState().updateConnectorConfig("webdav", "endpoint", " https://example.com ");
    });

    expect(useDataSyncStore.getState().connectors.webdav.config.endpoint).toBe("https://example.com");
  });

  it("marks sync success and failure", () => {
    const providerId: DataSyncProviderId = "notion";

    act(() => {
      useDataSyncStore.getState().toggleConnector(providerId, true);
      useDataSyncStore.getState().markSyncing(providerId);
      useDataSyncStore.getState().markSynced(providerId, "2024-03-20T12:00:00.000Z");
    });

    const connector = useDataSyncStore.getState().connectors[providerId];
    expect(connector.status).toBe("connected");
    expect(connector.lastSyncedAt).toBe("2024-03-20T12:00:00.000Z");

    act(() => {
      useDataSyncStore.getState().setError(providerId, "Unauthorized");
    });

    expect(useDataSyncStore.getState().connectors[providerId].status).toBe("error");
    expect(useDataSyncStore.getState().connectors[providerId].error).toBe("Unauthorized");

    act(() => {
      useDataSyncStore.getState().clearError(providerId);
    });

    expect(useDataSyncStore.getState().connectors[providerId].status).toBe("connected");
    expect(useDataSyncStore.getState().connectors[providerId].error).toBeNull();
  });

  it("resets provider state to defaults", () => {
    act(() => {
      useDataSyncStore.getState().updateConnectorConfig("s3", "bucket", "custom-bucket");
      useDataSyncStore.getState().toggleConnector("s3", true);
      useDataSyncStore.getState().resetProvider("s3");
    });

    const connector = useDataSyncStore.getState().connectors.s3;
    expect(connector.enabled).toBe(false);
    expect(connector.config.bucket).toBe("cinaseek-sync");
  });
});
