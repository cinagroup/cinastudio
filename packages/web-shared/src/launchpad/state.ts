import type { LaunchpadNormalizedState, LaunchpadSeed } from "./types";

function sortUpdatesByDate(updates: LaunchpadSeed["updates"]) {
  return [...updates].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function buildLaunchpadState(seed: LaunchpadSeed): LaunchpadNormalizedState {
  const features = seed.features.map((feature) => ({ ...feature }));
  const automations = seed.automations.map((automation) => ({ ...automation }));
  const updates = sortUpdatesByDate(seed.updates.map((update) => ({ ...update })));

  const pinnedCandidates = (seed.pinnedFeatureIds?.length ? seed.pinnedFeatureIds : null) ??
    features.filter((feature) => feature.defaultPinned).map((feature) => feature.id);

  const pinnedFeatureIds: string[] = [];
  const seen = new Set<string>();

  pinnedCandidates.forEach((id) => {
    if (seen.has(id)) {
      return;
    }
    if (features.some((feature) => feature.id === id)) {
      seen.add(id);
      pinnedFeatureIds.push(id);
    }
  });

  if (pinnedFeatureIds.length === 0 && features.length > 0) {
    pinnedFeatureIds.push(features[0].id);
  }

  return {
    features,
    automations,
    updates,
    pinnedFeatureIds,
  };
}
