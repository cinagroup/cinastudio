export interface SharedNoteTag {
  id: string;
  label: string;
  description?: string;
}

export type SharedNoteCategory =
  | "product"
  | "workflow"
  | "release"
  | "knowledge"
  | "migration";

export interface SharedNote {
  id: string;
  title: string;
  summary: string;
  content: string;
  updatedAt: string;
  tags: string[];
  category: SharedNoteCategory;
  pinned?: boolean;
}

export interface NotesSeed {
  categories: Array<{
    id: SharedNoteCategory;
    name: string;
    description: string;
  }>;
  tags: SharedNoteTag[];
  notes: SharedNote[];
}
