import type { WebSearchSeed } from "./types";

export const webSearchSeed: WebSearchSeed = {
  defaultProviderId: "local-bing",
  searchWithTime: true,
  maxResults: 5,
  excludeDomains: [],
  subscribeSources: [],
  compression: {
    method: "none",
    cutoffUnit: "char",
  },
  providers: [
    {
      id: "tavily",
      name: "Tavily",
      tagline: "快速聚合全球资讯",
      description:
        "针对研究与写作优化的云端搜索引擎，返回结构化摘要与引用，适合需要快速了解新话题的场景。",
      category: "cloud",
      websiteUrl: "https://tavily.com",
      apiKeyUrl: "https://app.tavily.com/home",
      docsUrl: "https://docs.tavily.com",
      requiresApiKey: true,
      supportsCustomHost: false,
      capabilities: [
        "实时网页检索",
        "智能摘要",
        "支持多语言",
      ],
      defaultConfig: {
        apiHost: "https://api.tavily.com",
        apiKey: "",
      },
    },
    {
      id: "zhipu",
      name: "智谱搜索",
      tagline: "与 GLM 模型深度集成",
      description:
        "由智谱 AI 提供的搜索服务，可结合 GLM 模型进行事实核查，适合国内线路与企业采购。",
      category: "cloud",
      websiteUrl: "https://docs.bigmodel.cn/cn/guide/tools/web-search",
      apiKeyUrl: "https://zhipuaishengchan.datasink.sensorsdata.cn/t/yv",
      requiresApiKey: true,
      capabilities: [
        "模型联动",
        "国内线路",
        "事实核查",
      ],
      defaultConfig: {
        apiHost: "https://open.bigmodel.cn/api/paas/v4/web_search",
        apiKey: "",
      },
    },
    {
      id: "exa",
      name: "Exa",
      tagline: "开发者友好的网页索引",
      description:
        "提供面向开发者的高质量网页索引，适合检索技术文章、论文与代码示例。",
      category: "cloud",
      websiteUrl: "https://exa.ai",
      apiKeyUrl: "https://dashboard.exa.ai/api-keys",
      requiresApiKey: true,
      capabilities: [
        "技术内容优先",
        "结构化响应",
        "多索引策略",
      ],
      defaultConfig: {
        apiHost: "https://api.exa.ai",
        apiKey: "",
      },
    },
    {
      id: "bocha",
      name: "Bocha",
      tagline: "中文资讯聚合",
      description:
        "覆盖主流中文资讯站点，适用于舆情监测与热点追踪，可与自建知识库联动。",
      category: "cloud",
      websiteUrl: "https://bochaai.com",
      apiKeyUrl: "https://open.bochaai.com/overview",
      requiresApiKey: true,
      capabilities: [
        "中文搜索优化",
        "多源聚合",
        "热点追踪",
      ],
      defaultConfig: {
        apiHost: "https://api.bochaai.com",
        apiKey: "",
      },
    },
    {
      id: "searxng",
      name: "SearXNG",
      tagline: "自建元搜索服务",
      description:
        "开源的自托管元搜索引擎，可整合多种公共引擎并支持自定义过滤策略。",
      category: "self-hosted",
      websiteUrl: "https://docs.searxng.org",
      docsUrl: "https://docs.searxng.org/admin",
      requiresApiKey: false,
      supportsCustomHost: true,
      capabilities: [
        "可自建部署",
        "多引擎聚合",
        "隐私友好",
      ],
      defaultConfig: {
        apiHost: "",
        basicAuthUsername: "",
        basicAuthPassword: "",
      },
      badge: "Self-hosted",
    },
    {
      id: "local-google",
      name: "Google",
      tagline: "浏览器直达全网搜索",
      description:
        "使用浏览器直接打开 Google 搜索结果，适合无需 API 的即时查询场景。",
      category: "local",
      websiteUrl: "https://www.google.com",
      requiresApiKey: false,
      supportsBrowserAutomation: true,
      capabilities: [
        "无需密钥",
        "浏览器直开",
        "全球搜索",
      ],
      defaultConfig: {
        url: "https://www.google.com/search?q=%s",
      },
    },
    {
      id: "local-bing",
      name: "Bing",
      tagline: "默认内置搜索",
      description:
        "在浏览器中打开 Bing 搜索，提供国内外均可用的基础检索体验。",
      category: "local",
      websiteUrl: "https://www.bing.com",
      requiresApiKey: false,
      supportsBrowserAutomation: true,
      capabilities: [
        "默认配置",
        "无需密钥",
        "多语言支持",
      ],
      defaultConfig: {
        url: "https://cn.bing.com/search?q=%s&ensearch=1",
      },
    },
    {
      id: "local-baidu",
      name: "Baidu",
      tagline: "本地中文检索",
      description:
        "直接调用百度搜索，配合浏览器扩展可实现快速选区搜索。",
      category: "local",
      websiteUrl: "https://www.baidu.com",
      requiresApiKey: false,
      supportsBrowserAutomation: true,
      capabilities: [
        "中文优化",
        "无需密钥",
        "可与扩展联动",
      ],
      defaultConfig: {
        url: "https://www.baidu.com/s?wd=%s",
      },
    },
  ],
};
