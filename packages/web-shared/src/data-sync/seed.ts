import type {
  DataSyncConnectorState,
  DataSyncProviderDefinition,
  DataSyncProviderId,
} from "./types";

export const DATA_SYNC_PROVIDERS: DataSyncProviderDefinition[] = [
  {
    id: "webdav",
    name: "WebDAV",
    description: "同步到自建 NAS 或云盘，保持浏览器端与桌面端的离线副本一致。",
    category: "self_hosted",
    badge: "自建",
    tags: ["NAS", "Nextcloud", "坚果云"],
    docsUrl: "https://docs.cherrystudio.app/migration/webdav",
    highlights: [
      "支持定时与手动触发的双向同步",
      "兼容 Nextcloud、坚果云与群晖等常见 WebDAV 服务",
    ],
    fields: [
      {
        key: "endpoint",
        label: "服务地址",
        description: "填写 WebDAV 服务器的完整地址。",
        placeholder: "https://dav.example.com/remote.php/webdav",
        type: "url",
      },
      {
        key: "username",
        label: "用户名",
        placeholder: "workspace",
        type: "text",
      },
      {
        key: "password",
        label: "访问密码",
        placeholder: "••••••••",
        type: "password",
      },
      {
        key: "rootPath",
        label: "根目录",
        description: "用于保存对话、笔记与文件的目录。",
        placeholder: "/Apps/CinaSeek",
        type: "text",
      },
      {
        key: "verifySsl",
        label: "验证 SSL 证书",
        description: "建议保持开启以确保连接安全。",
        type: "switch",
        defaultValue: true,
      },
    ],
  },
  {
    id: "s3",
    name: "S3 对象存储",
    description: "将备份写入支持 S3 协议的对象存储，享受版本化与跨区域冗余。",
    category: "cloud",
    badge: "云端",
    tags: ["多区域", "版本化", "兼容性"],
    docsUrl: "https://docs.cherrystudio.app/migration/s3",
    highlights: [
      "支持 Amazon S3 及兼容协议（MinIO、阿里云 OSS 等）",
      "可选择开启服务端加密保障数据安全",
    ],
    fields: [
      {
        key: "endpoint",
        label: "Endpoint",
        placeholder: "https://s3.amazonaws.com",
        type: "url",
      },
      {
        key: "region",
        label: "区域",
        placeholder: "ap-east-1",
        type: "text",
      },
      {
        key: "bucket",
        label: "Bucket",
        placeholder: "cinaseek-sync",
        type: "text",
      },
      {
        key: "accessKeyId",
        label: "Access Key ID",
        placeholder: "AKIA...",
        type: "text",
      },
      {
        key: "secretAccessKey",
        label: "Secret Access Key",
        placeholder: "••••••••",
        type: "password",
      },
      {
        key: "serverSideEncryption",
        label: "启用服务端加密",
        description: "开启后将使用 S3 服务端加密 (SSE-S3)。",
        type: "switch",
        defaultValue: false,
      },
    ],
  },
  {
    id: "notion",
    name: "Notion 数据库",
    description: "将对话摘要与行动项同步到团队的 Notion 工作区。",
    category: "knowledge",
    badge: "协作",
    tags: ["双向链接", "模版"],
    docsUrl: "https://docs.cherrystudio.app/migration/notion",
    highlights: [
      "自动创建会议纪要、标签与引用链接",
      "支持自定义模版与属性映射",
    ],
    fields: [
      {
        key: "integrationToken",
        label: "Integration Token",
        placeholder: "secret_xxx",
        type: "token",
      },
      {
        key: "databaseId",
        label: "Database ID",
        placeholder: "8c8f1d4e9f1149a0bdb0...",
        type: "text",
      },
      {
        key: "pageTemplate",
        label: "页面模版",
        description: "用于渲染同步后的 Notion 页面标题。",
        placeholder: "{{topic}} · {{date}}",
        type: "text",
      },
      {
        key: "syncHighlights",
        label: "同步高亮段落",
        description: "开启后会把重点标记推送到数据库属性中。",
        type: "switch",
        defaultValue: true,
      },
    ],
  },
  {
    id: "obsidian",
    name: "Obsidian Vault",
    description: "在本地知识库中生成 Markdown 文件，结合插件实现自动整理。",
    category: "self_hosted",
    badge: "本地",
    tags: ["Markdown", "插件生态"],
    docsUrl: "https://docs.cherrystudio.app/migration/obsidian",
    highlights: [
      "支持 Periodic Notes / Dataview 等主流插件",
      "可选择自动发布到 Obsidian Publish",
    ],
    fields: [
      {
        key: "vaultName",
        label: "Vault 名称",
        placeholder: "CinaSeek",
        type: "text",
      },
      {
        key: "folder",
        label: "目标文件夹",
        placeholder: "AI Notes",
        type: "text",
      },
      {
        key: "usePeriodicNotes",
        label: "启用 Periodic Notes",
        description: "开启后会按照日期归档到 Daily/Weekly 目录。",
        type: "switch",
        defaultValue: false,
      },
      {
        key: "autoPublish",
        label: "自动发布到 Publish",
        type: "switch",
        defaultValue: false,
      },
    ],
  },
  {
    id: "yuque",
    name: "语雀知识库",
    description: "与语雀空间同步文档，供国内团队成员实时协作。",
    category: "knowledge",
    badge: "团队",
    tags: ["空间协作", "知识沉淀"],
    docsUrl: "https://docs.cherrystudio.app/migration/yuque",
    highlights: [
      "支持自动创建成员协作草稿",
      "可选择发布为公开文档或团队私有",
    ],
    fields: [
      {
        key: "baseUrl",
        label: "语雀 API 地址",
        placeholder: "https://www.yuque.com/api/v2",
        type: "url",
      },
      {
        key: "token",
        label: "Personal Token",
        placeholder: "token_xxx",
        type: "token",
      },
      {
        key: "repo",
        label: "知识库 ID",
        placeholder: "team/repo",
        type: "text",
      },
      {
        key: "autoPublish",
        label: "同步后自动发布",
        type: "switch",
        defaultValue: false,
      },
    ],
  },
];

export const DATA_SYNC_CONNECTOR_DEFAULTS: Record<DataSyncProviderId, Partial<DataSyncConnectorState>> = {
  webdav: {
    config: {
      endpoint: "",
      username: "",
      password: "",
      rootPath: "/Apps/CinaSeek",
      verifySsl: true,
    },
  },
  s3: {
    config: {
      endpoint: "https://s3.amazonaws.com",
      region: "ap-east-1",
      bucket: "cinaseek-sync",
      accessKeyId: "",
      secretAccessKey: "",
      serverSideEncryption: false,
    },
  },
  notion: {
    config: {
      integrationToken: "",
      databaseId: "",
      pageTemplate: "{{topic}} · {{date}}",
      syncHighlights: true,
    },
  },
  obsidian: {
    config: {
      vaultName: "CinaSeek",
      folder: "AI Notes",
      usePeriodicNotes: false,
      autoPublish: false,
    },
  },
  yuque: {
    config: {
      baseUrl: "https://www.yuque.com/api/v2",
      token: "",
      repo: "team/repo",
      autoPublish: false,
    },
  },
};
