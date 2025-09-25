import type { MemorySeed } from "./types";

let seedCounter = 0;
function createSeedId(prefix: string) {
  seedCounter += 1;
  return `${prefix}-${seedCounter.toString().padStart(3, "0")}`;
}

const now = new Date();

export const memorySeed: MemorySeed = {
  config: {
    embedderDimensions: 3072,
    embedderClient: {
      id: "openai-text-embedding-3-large",
      provider: "openai",
      label: "OpenAI Text Embedding 3 Large",
      model: "text-embedding-3-large",
      description: "高质量通用向量，适合长期知识记忆。",
    },
    llmClient: {
      id: "openai-gpt-4o-mini",
      provider: "openai",
      label: "OpenAI GPT-4o Mini",
      model: "gpt-4o-mini",
      description: "成本可控的对话模型，用于摘要与记忆生成。",
    },
    automaticFactExtraction: true,
    syncCadence: "hourly",
  },
  users: [
    {
      id: "default-user",
      label: "默认用户",
      description: "与桌面端保持一致的全局记忆上下文。",
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    },
    {
      id: "marketing",
      label: "市场团队",
      description: "记录品牌术语、投放偏好等内容。",
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    },
  ],
  memories: [
    {
      id: createSeedId("memory"),
      userId: "default-user",
      memory: "喜欢在晨会上以两分钟简报总结上一次迭代的关键成果。",
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 7).toISOString(),
      metadata: {
        source: "workspace",
        topic: "standup",
      },
    },
    {
      id: createSeedId("memory"),
      userId: "marketing",
      memory: "品牌主色调为#F472B6，所有营销物料需保持轻盈感。",
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 12).toISOString(),
      metadata: {
        source: "notes",
        tag: "brand",
      },
    },
    {
      id: createSeedId("memory"),
      userId: "default-user",
      memory: "偏好以 Markdown 汇总会议纪要，并在 24 小时内同步至知识库。",
      createdAt: new Date(now.getTime() - 1000 * 60 * 30).toISOString(),
      metadata: {
        source: "meeting",
      },
    },
  ],
  llmOptions: [
    {
      id: "openai-gpt-4o-mini",
      provider: "openai",
      label: "OpenAI GPT-4o Mini",
      model: "gpt-4o-mini",
      description: "兼顾性能与成本的多语言模型。",
    },
    {
      id: "azure-gpt-4o",
      provider: "azure-openai",
      label: "Azure GPT-4o",
      model: "gpt-4o",
      description: "通过企业 Azure 账号托管，满足合规要求。",
    },
    {
      id: "moonshot-kimi-large",
      provider: "moonshot",
      label: "Moonshot Kimi 2.0",
      model: "kimi-large",
      description: "中文语境表现优秀，适合作为备用。",
    },
  ],
  embedderOptions: [
    {
      id: "openai-text-embedding-3-large",
      provider: "openai",
      label: "OpenAI Text Embedding 3 Large",
      model: "text-embedding-3-large",
      description: "高维度嵌入，适合语义检索。",
    },
    {
      id: "voyage-3-large",
      provider: "voyage",
      label: "Voyage 3 Large",
      model: "voyage-large",
      description: "专注产品知识与长文本理解。",
    },
    {
      id: "ollama-nomic-embed-text",
      provider: "ollama",
      label: "Ollama nomic-embed-text",
      model: "nomic-embed-text",
      description: "本地部署嵌入模型，适配离线模式。",
    },
  ],
};
