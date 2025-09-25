import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  FILES_STORAGE_KEY,
  FILES_STORAGE_VERSION,
  buildFilesState,
  type FilesFilters,
  type FilesState,
  type SharedFile,
  type SharedFileSortField,
  type SharedFileSortOrder,
  type SharedFileType,
} from "@cinaseek/web-shared/files";

import { createId } from "@/utils/id";

interface CreateFileInput {
  title: string;
  type: SharedFileType;
  size: number;
  source: SharedFile["source"];
  description?: string;
  tags?: string[];
  extension?: string;
  filename?: string;
}

interface FilesStore extends FilesState {
  setType: (type: FilesFilters["type"]) => void;
  setSearch: (value: string) => void;
  setSort: (field: SharedFileSortField, order?: SharedFileSortOrder) => void;
  setShowPinnedOnly: (value: boolean) => void;
  togglePin: (id: string) => void;
  recordAccess: (id: string) => void;
  addFile: (input: CreateFileInput) => SharedFile;
  removeFile: (id: string) => void;
  reset: () => void;
}

function buildInitialState(): FilesState {
  return buildFilesState();
}

const fallbackStorage = createJSONStorage(() => ({
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
}));

export const useFilesStore = create<FilesStore>()(
  persist(
    (set, _get) => ({
      ...buildInitialState(),
      setType: (type) => {
        set((state) => ({
          filters: {
            ...state.filters,
            type,
          },
        }));
      },
      setSearch: (value) => {
        set((state) => ({
          filters: {
            ...state.filters,
            search: value,
          },
        }));
      },
      setSort: (field, order) => {
        set((state) => {
          const nextOrder =
            order ??
            (state.filters.sortField === field && state.filters.sortOrder === "desc"
              ? "asc"
              : field === state.filters.sortField
              ? "desc"
              : state.filters.sortOrder);

          return {
            filters: {
              ...state.filters,
              sortField: field,
              sortOrder: nextOrder,
            },
          };
        });
      },
      setShowPinnedOnly: (value) => {
        set((state) => ({
          filters: {
            ...state.filters,
            showPinnedOnly: value,
          },
        }));
      },
      togglePin: (id) => {
        set((state) => ({
          files: state.files.map((file) =>
            file.id === id
              ? {
                  ...file,
                  pinned: !file.pinned,
                  updatedAt: new Date().toISOString(),
                }
              : file,
          ),
        }));
      },
      recordAccess: (id) => {
        set((state) => ({
          files: state.files.map((file) =>
            file.id === id
              ? {
                  ...file,
                  usageCount: file.usageCount + 1,
                  lastUsedAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                }
              : file,
          ),
        }));
      },
      addFile: (input) => {
        const now = new Date().toISOString();
        const extension = input.extension ?? ".txt";
        const filename = input.filename ?? `${createId("file")}${extension}`;
        const file: SharedFile = {
          id: createId("file"),
          title: input.title,
          filename,
          extension,
          size: input.size,
          type: input.type,
          source: input.source,
          createdAt: now,
          updatedAt: now,
          lastUsedAt: now,
          usageCount: 1,
          description: input.description,
          tags: input.tags ?? [],
          pinned: false,
        };

        set((state) => ({
          files: [file, ...state.files],
        }));

        return file;
      },
      removeFile: (id) => {
        set((state) => ({
          files: state.files.filter((file) => file.id !== id),
        }));
      },
      reset: () => {
        set(buildInitialState());
        if (typeof window !== "undefined") {
          try {
            window.localStorage.removeItem(FILES_STORAGE_KEY);
          } catch (error) {
            console.warn("Failed to reset files storage", error);
          }
        }
      },
    }),
    {
      name: FILES_STORAGE_KEY,
      version: FILES_STORAGE_VERSION,
      storage:
        typeof window !== "undefined"
          ? createJSONStorage(() => window.localStorage)
          : fallbackStorage,
      partialize: (state) => ({
        files: state.files,
        filters: state.filters,
        categories: state.categories,
      }),
      migrate: (persistedState, version) => {
        if (!persistedState || version === FILES_STORAGE_VERSION) {
          return persistedState as FilesStore;
        }

        const rebuilt = buildInitialState();
        return {
          ...rebuilt,
          setType: () => undefined,
          setSearch: () => undefined,
          setSort: () => undefined,
          setShowPinnedOnly: () => undefined,
          togglePin: () => undefined,
          recordAccess: () => undefined,
          addFile: () => {
            throw new Error("Files store is not ready during migration");
          },
          removeFile: () => undefined,
          reset: () => undefined,
        } as FilesStore;
      },
    },
  ),
);

export function resetFilesStore() {
  useFilesStore.getState().reset();
}
