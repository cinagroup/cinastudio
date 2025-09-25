export const WEB_SEARCH_PROVIDER_IDS = {
  zhipu: "zhipu",
  tavily: "tavily",
  searxng: "searxng",
  exa: "exa",
  bocha: "bocha",
  "local-google": "local-google",
  "local-bing": "local-bing",
  "local-baidu": "local-baidu",
} as const;

export type WebSearchProviderId = keyof typeof WEB_SEARCH_PROVIDER_IDS;

export type WebSearchProviderCategory = "cloud" | "local" | "self-hosted";

export interface WebSearchProviderConfig {
  apiKey?: string;
  apiHost?: string;
  url?: string;
  basicAuthUsername?: string;
  basicAuthPassword?: string;
  engines?: string[];
}

export interface WebSearchProviderDefinition {
  id: WebSearchProviderId;
  name: string;
  tagline: string;
  description: string;
  category: WebSearchProviderCategory;
  websiteUrl?: string;
  apiKeyUrl?: string;
  docsUrl?: string;
  requiresApiKey?: boolean;
  supportsCustomHost?: boolean;
  supportsBrowserAutomation?: boolean;
  badge?: string;
  capabilities: string[];
  defaultConfig: WebSearchProviderConfig;
}

export type WebSearchCompressionMethod = "none" | "cutoff" | "rag";

export interface WebSearchCompressionConfig {
  method: WebSearchCompressionMethod;
  cutoffLimit?: number;
  cutoffUnit?: "char" | "token";
  documentCount?: number;
  embeddingModel?: string;
  embeddingDimensions?: number;
  rerankModel?: string;
}

export interface WebSearchSubscribeSource {
  key: number;
  name: string;
  url: string;
  blacklist?: string[];
}

export interface WebSearchSeedSource
  extends Omit<WebSearchSubscribeSource, "key"> {
  key?: number;
}

export interface WebSearchSeed {
  defaultProviderId: WebSearchProviderId;
  providers: WebSearchProviderDefinition[];
  searchWithTime: boolean;
  maxResults: number;
  excludeDomains: string[];
  subscribeSources: WebSearchSeedSource[];
  compression: WebSearchCompressionConfig;
}

export interface WebSearchState {
  providers: WebSearchProviderDefinition[];
  defaultProviderId: WebSearchProviderId;
  searchWithTime: boolean;
  maxResults: number;
  excludeDomains: string[];
  subscribeSources: WebSearchSubscribeSource[];
  compression: WebSearchCompressionConfig;
  providerConfigs: Record<WebSearchProviderId, WebSearchProviderConfig>;
}
