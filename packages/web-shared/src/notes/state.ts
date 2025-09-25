import { notesSeed } from "./seed";
import type { NotesSeed, SharedNote, SharedNoteCategory, SharedNoteTag } from "./types";

export const NOTES_STORAGE_KEY = "cinaseek.notes";
export const NOTES_STORAGE_VERSION = 1;

export interface NotesFilters {
  search?: string;
  category?: SharedNoteCategory | "all";
  tag?: string | "all";
  showPinned?: boolean;
}

export interface NotesState {
  notes: SharedNote[];
  filters: NotesFilters;
  categories: NotesSeed["categories"];
  tags: SharedNoteTag[];
}

export function buildNotesState(seed: NotesSeed = notesSeed): NotesState {
  return {
    notes: seed.notes,
    categories: seed.categories,
    tags: seed.tags,
    filters: {
      search: "",
      category: "all",
      tag: "all",
      showPinned: false,
    },
  };
}
