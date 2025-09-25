export type SharedFileType =
  | "document"
  | "image"
  | "text"
  | "audio"
  | "video"
  | "other";

export type SharedFileSource =
  | "upload"
  | "clipboard"
  | "workspace"
  | "knowledge"
  | "sync"
  | "recording";

export interface SharedFile {
  id: string;
  /** 人类可读的文件标题 */
  title: string;
  /** 在存储中的真实文件名 */
  filename: string;
  /** 包含点号的文件扩展名 */
  extension: string;
  /** 文件大小（字节） */
  size: number;
  type: SharedFileType;
  source: SharedFileSource;
  /** 创建时间 */
  createdAt: string;
  /** 最近一次更新 */
  updatedAt: string;
  /** 最近使用时间 */
  lastUsedAt: string;
  /** 使用次数 */
  usageCount: number;
  description?: string;
  tags: string[];
  pinned?: boolean;
  checksum?: string;
  previewUrl?: string;
}

export type SharedFileSortField = "updatedAt" | "createdAt" | "size" | "name" | "usage";

export type SharedFileSortOrder = "asc" | "desc";

export interface SharedFileCategory {
  id: SharedFileType | "all" | "favorites" | string;
  label: string;
  description: string;
  type?: SharedFileType | "all" | "favorites";
}

export interface FilesSeed {
  categories: SharedFileCategory[];
  files: SharedFile[];
}
