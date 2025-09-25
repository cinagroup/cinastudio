import {
  FileArchive,
  FileAudio,
  FileImage,
  FileText,
  FileVideo,
  FileStack,
  type LucideIcon,
} from "lucide-react";

import type { SharedFileType } from "@cinaseek/web-shared/files";

export const FILE_TYPE_META: Record<SharedFileType, { label: string; icon: LucideIcon; bg: string; fg: string }> = {
  document: {
    label: "文档",
    icon: FileStack,
    bg: "bg-blue-500/20",
    fg: "text-blue-300",
  },
  image: {
    label: "图片",
    icon: FileImage,
    bg: "bg-emerald-500/20",
    fg: "text-emerald-300",
  },
  text: {
    label: "文本",
    icon: FileText,
    bg: "bg-indigo-500/20",
    fg: "text-indigo-300",
  },
  audio: {
    label: "音频",
    icon: FileAudio,
    bg: "bg-orange-500/20",
    fg: "text-orange-300",
  },
  video: {
    label: "视频",
    icon: FileVideo,
    bg: "bg-purple-500/20",
    fg: "text-purple-300",
  },
  other: {
    label: "其他",
    icon: FileArchive,
    bg: "bg-slate-500/20",
    fg: "text-slate-300",
  },
};

export function getFileTypeMeta(type: SharedFileType | string) {
  if (type in FILE_TYPE_META) {
    return FILE_TYPE_META[type as SharedFileType];
  }
  return FILE_TYPE_META.other;
}
