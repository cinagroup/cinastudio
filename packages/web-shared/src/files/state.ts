import { filesSeed } from "./seed";
import type {
  FilesSeed,
  SharedFile,
  SharedFileCategory,
  SharedFileSortField,
  SharedFileSortOrder,
  SharedFileType,
} from "./types";

export const FILES_STORAGE_KEY = "cinaseek.files";
export const FILES_STORAGE_VERSION = 1;

export interface FilesFilters {
  type: SharedFileType | "all";
  search: string;
  sortField: SharedFileSortField;
  sortOrder: SharedFileSortOrder;
  showPinnedOnly: boolean;
}

export interface FilesState {
  files: SharedFile[];
  categories: SharedFileCategory[];
  filters: FilesFilters;
}

export function buildFilesState(seed: FilesSeed = filesSeed): FilesState {
  return {
    files: seed.files,
    categories: seed.categories,
    filters: {
      type: "all",
      search: "",
      sortField: "updatedAt",
      sortOrder: "desc",
      showPinnedOnly: false,
    },
  };
}
