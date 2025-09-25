import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  NOTES_STORAGE_KEY,
  NOTES_STORAGE_VERSION,
  buildNotesState,
  type NotesFilters,
  type NotesState,
  type SharedNote,
  type SharedNoteCategory,
} from "@cinaseek/web-shared/notes";

import { createId } from "@/utils/id";

interface CreateNoteInput {
  title: string;
  content: string;
  summary?: string;
  category?: SharedNoteCategory;
  tags?: string[];
}

interface UpdateNoteInput {
  title?: string;
  content?: string;
  summary?: string;
  category?: SharedNoteCategory;
  tags?: string[];
}

type NotesStore = NotesState & {
  createNote: (input: CreateNoteInput) => SharedNote;
  updateNote: (id: string, input: UpdateNoteInput) => void;
  deleteNote: (id: string) => void;
  togglePin: (id: string) => void;
  setFilters: (filters: Partial<NotesFilters>) => void;
  reset: () => void;
};

function buildInitialState(): NotesState {
  return buildNotesState();
}

const fallbackStorage = createJSONStorage(() => ({
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
}));

export const useNotesStore = create<NotesStore>()(
  persist(
    (set, _get) => ({
      ...buildInitialState(),
      createNote: ({ title, content, tags = [], category = "knowledge", summary }) => {
        const note: SharedNote = {
          id: createId("note"),
          title,
          summary: summary ?? content.slice(0, 120),
          content,
          category,
          tags,
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          notes: [note, ...state.notes],
        }));

        return note;
      },
      updateNote: (id, input) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id
              ? {
                  ...note,
                  ...input,
                  updatedAt: new Date().toISOString(),
                }
              : note,
          ),
        }));
      },
      deleteNote: (id) => {
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id),
        }));
      },
      togglePin: (id) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id ? { ...note, pinned: !note.pinned } : note,
          ),
        }));
      },
      setFilters: (filters) => {
        set((state) => ({
          filters: {
            ...state.filters,
            ...filters,
          },
        }));
      },
      reset: () => {
        set(buildInitialState());
      },
    }),
    {
      name: NOTES_STORAGE_KEY,
      version: NOTES_STORAGE_VERSION,
      storage:
        typeof window !== "undefined"
          ? createJSONStorage(() => window.localStorage)
          : fallbackStorage,
      partialize: (state) => ({
        notes: state.notes,
        filters: state.filters,
        categories: state.categories,
        tags: state.tags,
      }),
      migrate: (persisted, version) => {
        if (!persisted || version === NOTES_STORAGE_VERSION) {
          return persisted as NotesStore;
        }

        const rebuilt = buildInitialState();
        return {
          ...rebuilt,
          createNote: (() => {
            throw new Error("Notes store not ready during migration");
          }) as NotesStore["createNote"],
          updateNote: () => undefined,
          deleteNote: () => undefined,
          togglePin: () => undefined,
          setFilters: () => undefined,
          reset: () => undefined,
        } as NotesStore;
      },
    },
  ),
);

export function resetNotesStore() {
  useNotesStore.getState().reset();
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(NOTES_STORAGE_KEY);
    } catch (error) {
      console.warn("Failed to clear persisted notes state", error);
    }
  }
}
