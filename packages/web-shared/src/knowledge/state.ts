import { knowledgeSeed } from "./seed";
import type { KnowledgeBaseRecord, KnowledgeItem, NormalizedKnowledgeSeed, KnowledgeSeedEntry } from "./types";

export const KNOWLEDGE_STORAGE_KEY = "cinaseek.knowledge";
export const KNOWLEDGE_STORAGE_VERSION = 1;

export function normalizeKnowledgeSeed(seed: KnowledgeSeedEntry[]): NormalizedKnowledgeSeed {
  const bases: KnowledgeBaseRecord[] = [];
  const itemsByBase: Record<string, KnowledgeItem[]> = {};

  for (const entry of seed) {
    const { base, items } = entry;
    const baseId = base.id;
    const normalizedItems = items.map((item, index) => ({
      ...item,
      baseId,
      id: item.id || `${baseId}-item-${index}`,
      createdAt: item.createdAt ?? new Date().toISOString(),
      updatedAt: item.updatedAt ?? item.createdAt ?? new Date().toISOString(),
    }));

    bases.push({
      ...base,
      itemIds: normalizedItems.map((item) => item.id),
    });
    itemsByBase[baseId] = normalizedItems;
  }

  return { bases, itemsByBase };
}

export function buildKnowledgeState(seed: KnowledgeSeedEntry[] = knowledgeSeed) {
  const normalized = normalizeKnowledgeSeed(seed);
  const activeBaseId = normalized.bases[0]?.id ?? null;

  return {
    ...normalized,
    activeBaseId,
  };
}
