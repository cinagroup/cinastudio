export type KnowledgeItemType =
  | "document"
  | "notebook"
  | "integration"
  | "dataset"
  | "url"
  | "note";

export interface KnowledgeItemSource {
  type: "upload" | "url" | "sync" | "note";
  label: string;
  href?: string;
}

export interface KnowledgeItem {
  id: string;
  baseId: string;
  title: string;
  summary: string;
  type: KnowledgeItemType;
  tags: string[];
  pinned?: boolean;
  source: KnowledgeItemSource;
  updatedAt: string;
  createdAt: string;
}

export interface KnowledgeBaseRecord {
  id: string;
  name: string;
  description: string;
  icon: string;
  accentColor: string;
  createdAt: string;
  updatedAt: string;
  stats: {
    documents: number;
    tokens?: number;
    automations?: number;
  };
  itemIds: string[];
}

export interface KnowledgeSeedEntry {
  base: Omit<KnowledgeBaseRecord, "itemIds"> & {
    itemIds?: string[];
  };
  items: Array<Omit<KnowledgeItem, "baseId">>;
}

export interface NormalizedKnowledgeSeed {
  bases: KnowledgeBaseRecord[];
  itemsByBase: Record<string, KnowledgeItem[]>;
}
