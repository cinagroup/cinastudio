export interface MemoryApiClientConfig {
  id: string;
  provider: string;
  label: string;
  model: string;
  description: string;
}

export interface MemoryConfig {
  embedderDimensions: number;
  embedderClient?: MemoryApiClientConfig;
  llmClient?: MemoryApiClientConfig;
  automaticFactExtraction: boolean;
  syncCadence: "manual" | "hourly" | "daily";
}

export interface MemoryUserDefinition {
  id: string;
  label: string;
  description?: string;
  createdAt: string;
}

export interface MemoryItem {
  id: string;
  userId: string;
  memory: string;
  createdAt: string;
  updatedAt?: string;
  metadata?: Record<string, string>;
}

export interface MemorySeed {
  config: MemoryConfig;
  users: MemoryUserDefinition[];
  memories: MemoryItem[];
  llmOptions: MemoryApiClientConfig[];
  embedderOptions: MemoryApiClientConfig[];
}
