import { act } from "@testing-library/react";

import { resetLaunchpadStore, useLaunchpadStore } from "../launchpad";

describe("launchpad store", () => {
  beforeEach(() => {
    resetLaunchpadStore();
  });

  it("initializes with default pinned features", () => {
    const state = useLaunchpadStore.getState();
    expect(state.pinnedFeatureIds.length).toBeGreaterThan(0);
    state.pinnedFeatureIds.forEach((id) => {
      const feature = state.features.find((item) => item.id === id);
      expect(feature).toBeDefined();
    });
  });

  it("toggles feature pin state", () => {
    const initial = useLaunchpadStore.getState();
    const target = initial.features[0];
    expect(target).toBeDefined();
    if (!target) return;

    act(() => {
      useLaunchpadStore.getState().toggleFeaturePin(target.id);
    });

    expect(useLaunchpadStore.getState().pinnedFeatureIds).not.toContain(target.id);

    act(() => {
      useLaunchpadStore.getState().toggleFeaturePin(target.id);
    });

    expect(useLaunchpadStore.getState().pinnedFeatureIds).toContain(target.id);
  });

  it("dismisses updates without duplicates", () => {
    const state = useLaunchpadStore.getState();
    const update = state.updates[0];
    expect(update).toBeDefined();
    if (!update) return;

    act(() => {
      useLaunchpadStore.getState().dismissUpdate(update.id);
    });

    const afterFirst = useLaunchpadStore.getState().dismissedUpdateIds;
    expect(afterFirst).toContain(update.id);

    act(() => {
      useLaunchpadStore.getState().dismissUpdate(update.id);
    });

    const occurrences = useLaunchpadStore
      .getState()
      .dismissedUpdateIds.filter((id) => id === update.id);
    expect(occurrences).toHaveLength(1);
  });
});
