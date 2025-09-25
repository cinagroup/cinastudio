import { act } from "@testing-library/react";

import { resetMinappsStore, useMinappsStore } from "../minapps";

describe("mini apps store", () => {
  beforeEach(() => {
    resetMinappsStore();
  });

  it("initializes with seeded data", () => {
    const state = useMinappsStore.getState();
    expect(state.apps.length).toBeGreaterThan(0);
    expect(state.categories.length).toBeGreaterThan(0);
    expect(state.settings.openInNewTab).toBe(true);
    expect(state.filters.category).toBe("all");
  });

  it("adds custom apps and registers new tags", () => {
    act(() => {
      useMinappsStore.getState().addCustomApp({
        name: "自定义 CRM 控制台",
        url: "crm.example.com",
        description: "团队自建的 CRM 快捷入口",
        tags: ["team", "crm"],
        icon: "🧭",
      });
    });

    const state = useMinappsStore.getState();
    const created = state.apps[0];
    expect(created.custom).toBe(true);
    expect(created.url).toBe("https://crm.example.com");
    expect(created.tags).toEqual(["team", "crm"]);
    expect(state.tags.some((tag) => tag.id === "team")).toBe(true);
  });

  it("toggles pinned state and prevents removing seeded apps", () => {
    const initial = useMinappsStore.getState();
    const seeded = initial.apps.find((app) => !app.custom);
    expect(seeded).toBeDefined();
    if (!seeded) return;

    const { id } = seeded;

    act(() => {
      useMinappsStore.getState().togglePin(id);
    });

    expect(useMinappsStore.getState().apps.find((app) => app.id === id)?.pinned).toBe(!seeded.pinned);

    act(() => {
      useMinappsStore.getState().removeApp(id);
    });

    expect(useMinappsStore.getState().apps.some((app) => app.id === id)).toBe(true);
  });

  it("updates filters, settings and launch metrics", () => {
    const first = useMinappsStore.getState().apps[0];
    expect(first).toBeDefined();
    if (!first) return;

    act(() => {
      useMinappsStore.getState().setFilters({ search: "历史", showPinned: true });
      useMinappsStore.getState().setOpenInNewTab(false);
      useMinappsStore.getState().markLaunched(first.id);
    });

    const state = useMinappsStore.getState();
    expect(state.filters.search).toBe("历史");
    expect(state.filters.showPinned).toBe(true);
    expect(state.settings.openInNewTab).toBe(false);
    const updated = state.apps.find((app) => app.id === first.id);
    expect(updated?.launchCount).toBe((first.launchCount ?? 0) + 1);
    expect(updated?.lastLaunchedAt).toBeDefined();
  });
});
