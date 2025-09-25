"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ExternalLink,
  Globe,
  KeyRound,
  Plus,
  ShieldCheck,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { SettingToggle } from "@/components/settings/setting-toggle";
import {
  useWebSearchStore,
  type WebSearchProviderId,
} from "@/lib/stores/web-search";

const CATEGORY_LABELS = {
  cloud: "云端服务",
  local: "浏览器直达",
  "self-hosted": "自建部署",
} as const;

const COMPRESSION_METHOD_LABELS = {
  none: "不压缩",
  cutoff: "字符截断",
  rag: "RAG 聚合",
} as const;

type CompressionMethod = keyof typeof COMPRESSION_METHOD_LABELS;

function formatDomainList(domains: string[]): string {
  return domains.join("\n");
}

function parseBlacklist(value: string): string[] {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function WebSearchSettings() {
  const {
    providers,
    defaultProviderId,
    providerConfigs,
    searchWithTime,
    maxResults,
    excludeDomains,
    subscribeSources,
    compression,
    setDefaultProvider,
    setSearchWithTime,
    setMaxResults,
    setExcludeDomainsFromText,
    updateProviderConfig,
    addSubscribeSource,
    updateSubscribeSource,
    removeSubscribeSource,
    updateCompressionConfig,
  } = useWebSearchStore((state) => ({
    providers: state.providers,
    defaultProviderId: state.defaultProviderId,
    providerConfigs: state.providerConfigs,
    searchWithTime: state.searchWithTime,
    maxResults: state.maxResults,
    excludeDomains: state.excludeDomains,
    subscribeSources: state.subscribeSources,
    compression: state.compression,
    setDefaultProvider: state.setDefaultProvider,
    setSearchWithTime: state.setSearchWithTime,
    setMaxResults: state.setMaxResults,
    setExcludeDomainsFromText: state.setExcludeDomainsFromText,
    updateProviderConfig: state.updateProviderConfig,
    addSubscribeSource: state.addSubscribeSource,
    updateSubscribeSource: state.updateSubscribeSource,
    removeSubscribeSource: state.removeSubscribeSource,
    updateCompressionConfig: state.updateCompressionConfig,
  }));

  const [excludeInput, setExcludeInput] = useState(() => formatDomainList(excludeDomains));
  const [newSourceName, setNewSourceName] = useState("");
  const [newSourceUrl, setNewSourceUrl] = useState("");

  useEffect(() => {
    setExcludeInput(formatDomainList(excludeDomains));
  }, [excludeDomains]);

  const canAddSource = useMemo(() => {
    return newSourceName.trim().length > 0 && newSourceUrl.trim().length > 0;
  }, [newSourceName, newSourceUrl]);

  function handleSelectProvider(id: WebSearchProviderId) {
    setDefaultProvider(id);
  }

  function handleAddSource() {
    if (!canAddSource) {
      return;
    }

    addSubscribeSource({
      name: newSourceName.trim(),
      url: newSourceUrl.trim(),
      blacklist: [],
    });
    setNewSourceName("");
    setNewSourceUrl("");
  }

  function handleExcludeBlur() {
    setExcludeDomainsFromText(excludeInput);
  }

  const compressionMethod = compression.method as CompressionMethod;

  return (
    <div className="space-y-10">
      <section className="space-y-6">
        <header className="space-y-2">
          <h3 className="text-lg font-semibold text-white">搜索服务提供商</h3>
          <p className="text-sm text-slate-300">
            选择默认的网页搜索供应商，并配置 API 密钥或自建服务地址。浏览器直达方案可在无需密钥的情况下直接打开搜索结果。
          </p>
        </header>
        <div className="grid gap-4 md:grid-cols-2">
          {providers.map((provider) => {
            const isActive = provider.id === defaultProviderId;
            const config = providerConfigs[provider.id] ?? {};

            return (
              <div
                key={provider.id}
                className={`flex h-full flex-col gap-4 rounded-2xl border bg-slate-900/40 p-5 transition ${
                  isActive ? "border-primary/70 shadow-lg shadow-primary/10" : "border-white/10 hover:border-primary/50"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="default-web-search-provider"
                      value={provider.id}
                      checked={isActive}
                      onChange={() => handleSelectProvider(provider.id)}
                      aria-label={`选择 ${provider.name} 作为默认搜索服务`}
                      className="mt-1 h-4 w-4 border border-white/40 bg-transparent text-primary focus:ring-primary"
                    />
                    <div className="space-y-1">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                        {CATEGORY_LABELS[provider.category]}
                      </p>
                      <h4 className="text-lg font-semibold text-white">{provider.name}</h4>
                      <p className="text-sm text-slate-300">{provider.tagline}</p>
                    </div>
                  </div>
                  {provider.badge ? (
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-slate-200">
                      {provider.badge}
                    </span>
                  ) : null}
                </div>
                <p className="text-sm leading-relaxed text-slate-300">{provider.description}</p>
                <ul className="flex flex-wrap gap-2">
                  {provider.capabilities.map((capability) => (
                    <li
                      key={capability}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200"
                    >
                      <ShieldCheck className="h-3 w-3" aria-hidden />
                      {capability}
                    </li>
                  ))}
                </ul>
                {(provider.requiresApiKey || provider.supportsCustomHost) && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {provider.requiresApiKey ? (
                      <label className="flex flex-col gap-2 text-sm text-slate-200">
                        <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
                          <KeyRound className="h-3 w-3" aria-hidden />
                          API Key
                        </span>
                        <input
                          type="text"
                          value={config.apiKey ?? ""}
                          onChange={(event) =>
                            updateProviderConfig(provider.id, { apiKey: event.target.value.trim() })
                          }
                          placeholder="sk-..."
                          className="rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                        />
                        {provider.apiKeyUrl ? (
                          <Link
                            href={provider.apiKeyUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            获取密钥 <ExternalLink className="h-3 w-3" aria-hidden />
                          </Link>
                        ) : null}
                      </label>
                    ) : null}
                    {provider.supportsCustomHost ? (
                      <label className="flex flex-col gap-2 text-sm text-slate-200">
                        <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
                          <Globe className="h-3 w-3" aria-hidden />
                          自建服务地址
                        </span>
                        <input
                          type="text"
                          value={config.apiHost ?? ""}
                          onChange={(event) =>
                            updateProviderConfig(provider.id, { apiHost: event.target.value.trim() })
                          }
                          placeholder="https://searxng.example.com"
                          className="rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                        />
                      </label>
                    ) : null}
                  </div>
                )}
                {provider.supportsBrowserAutomation && config.url ? (
                  <p className="text-xs text-slate-400">
                    浏览器将跳转至：
                    <span className="ml-1 break-all text-slate-300">{config.url}</span>
                  </p>
                ) : null}
                <div className="mt-auto flex flex-wrap items-center gap-3 text-xs">
                  {provider.websiteUrl ? (
                    <Link
                      href={provider.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      官网 <ExternalLink className="h-3 w-3" aria-hidden />
                    </Link>
                  ) : null}
                  {provider.docsUrl ? (
                    <Link
                      href={provider.docsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      文档 <ExternalLink className="h-3 w-3" aria-hidden />
                    </Link>
                  ) : null}
                  {provider.requiresApiKey ? (
                    <span className="rounded-full border border-white/10 px-3 py-1 text-slate-300">需要密钥</span>
                  ) : (
                    <span className="rounded-full border border-white/10 px-3 py-1 text-slate-300">直接使用</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-6">
        <header className="space-y-2">
          <h3 className="text-lg font-semibold text-white">搜索策略</h3>
          <p className="text-sm text-slate-300">
            控制是否在查询中附加当前日期、限制返回结果数量，并维护全局黑名单以避免噪声来源。
          </p>
        </header>
        <div className="grid gap-6 md:grid-cols-2">
          <SettingToggle
            id="toggle-search-with-time"
            label="在查询中附加日期"
            description="将当前日期拼接至搜索词，以获取最新资讯。"
            checked={searchWithTime}
            onChange={(value) => setSearchWithTime(value)}
          />
          <label className="flex flex-col gap-2 text-sm text-slate-200">
            <span className="text-xs uppercase tracking-[0.2em] text-slate-400">结果数量上限</span>
            <input
              type="number"
              min={1}
              max={10}
              value={maxResults}
              onChange={(event) => setMaxResults(Number(event.target.value))}
              className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
            />
            <span className="text-xs text-slate-400">建议范围 3-8 条结果，可根据模型上下文长度调整。</span>
          </label>
        </div>
        <label className="flex flex-col gap-2 text-sm text-slate-200">
          <span className="text-xs uppercase tracking-[0.2em] text-slate-400">全局黑名单域名</span>
          <textarea
            value={excludeInput}
            onChange={(event) => setExcludeInput(event.target.value)}
            onBlur={handleExcludeBlur}
            placeholder="example.com"
            className="min-h-[120px] rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
          />
          <span className="text-xs text-slate-400">每行一个域名，应用于所有搜索供应商。</span>
        </label>
      </section>

      <section className="space-y-6">
        <header className="space-y-2">
          <h3 className="text-lg font-semibold text-white">订阅源聚合</h3>
          <p className="text-sm text-slate-300">
            配置 RSS 或自建索引源，结合搜索结果提供更贴近业务的上下文。可针对不同源设置排除域名。
          </p>
        </header>
        <div className="space-y-4">
          {subscribeSources.map((source) => (
            <div key={source.key} className="rounded-2xl border border-white/10 bg-slate-900/40 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="grid w-full gap-4 sm:grid-cols-2">
                  <label className="flex flex-col gap-2 text-sm text-slate-200">
                    <span className="text-xs uppercase tracking-[0.2em] text-slate-400">名称</span>
                    <input
                      type="text"
                      value={source.name}
                      onChange={(event) =>
                        updateSubscribeSource(source.key, { name: event.target.value })
                      }
                      className="rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                    />
                  </label>
                  <label className="flex flex-col gap-2 text-sm text-slate-200">
                    <span className="text-xs uppercase tracking-[0.2em] text-slate-400">URL</span>
                    <input
                      type="text"
                      value={source.url}
                      onChange={(event) =>
                        updateSubscribeSource(source.key, { url: event.target.value })
                      }
                      className="rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                    />
                  </label>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => removeSubscribeSource(source.key)}
                  className="border border-white/10 text-xs text-red-300 hover:border-red-400 hover:text-red-100"
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                  删除
                </Button>
              </div>
              <label className="mt-4 flex flex-col gap-2 text-sm text-slate-200">
                <span className="text-xs uppercase tracking-[0.2em] text-slate-400">排除域名</span>
                <textarea
                  value={formatDomainList(source.blacklist ?? [])}
                  onChange={(event) =>
                    updateSubscribeSource(source.key, { blacklist: parseBlacklist(event.target.value) })
                  }
                  placeholder="ads.example.com"
                  className="min-h-[100px] rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                />
                <span className="text-xs text-slate-400">用于过滤该订阅源的噪声域名，每行一个。</span>
              </label>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-dashed border-white/15 bg-slate-900/30 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-slate-200">
              <span className="text-xs uppercase tracking-[0.2em] text-slate-400">名称</span>
              <input
                type="text"
                value={newSourceName}
                onChange={(event) => setNewSourceName(event.target.value)}
                placeholder="团队知识库"
                className="rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-slate-200">
              <span className="text-xs uppercase tracking-[0.2em] text-slate-400">URL</span>
              <input
                type="text"
                value={newSourceUrl}
                onChange={(event) => setNewSourceUrl(event.target.value)}
                placeholder="https://docs.example.com/feed.xml"
                className="rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
              />
            </label>
          </div>
          <Button
            type="button"
            onClick={handleAddSource}
            disabled={!canAddSource}
            className="mt-4 inline-flex items-center gap-2 border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-100 hover:border-primary/50 hover:bg-primary/10 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" aria-hidden />
            添加订阅源
          </Button>
        </div>
      </section>

      <section className="space-y-6">
        <header className="space-y-2">
          <h3 className="text-lg font-semibold text-white">结果压缩</h3>
          <p className="text-sm text-slate-300">
            控制搜索结果的压缩方式。截断模式可限制字符数量，RAG 模式支持对结果进行嵌入召回与重排序。
          </p>
        </header>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm text-slate-200">
            <span className="text-xs uppercase tracking-[0.2em] text-slate-400">压缩策略</span>
            <select
              value={compressionMethod}
              onChange={(event) =>
                updateCompressionConfig({ method: event.target.value as CompressionMethod })
              }
              className="rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
            >
              {(Object.entries(COMPRESSION_METHOD_LABELS) as Array<[CompressionMethod, string]>).map(
                ([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ),
              )}
            </select>
          </label>
          {compressionMethod === "cutoff" ? (
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-2 text-sm text-slate-200">
                <span className="text-xs uppercase tracking-[0.2em] text-slate-400">字符上限</span>
                <input
                  type="number"
                  min={100}
                  max={2000}
                  step={50}
                  value={compression.cutoffLimit ?? 400}
                  onChange={(event) =>
                    updateCompressionConfig({ cutoffLimit: Number(event.target.value) })
                  }
                  className="rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-slate-200">
                <span className="text-xs uppercase tracking-[0.2em] text-slate-400">单位</span>
                <select
                  value={compression.cutoffUnit ?? "char"}
                  onChange={(event) =>
                    updateCompressionConfig({ cutoffUnit: event.target.value as "char" | "token" })
                  }
                  className="rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                >
                  <option value="char">字符</option>
                  <option value="token">Token</option>
                </select>
              </label>
            </div>
          ) : null}
          {compressionMethod === "rag" ? (
            <div className="grid gap-3 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm text-slate-200">
                <span className="text-xs uppercase tracking-[0.2em] text-slate-400">文档数量</span>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={compression.documentCount ?? 5}
                  onChange={(event) =>
                    updateCompressionConfig({ documentCount: Number(event.target.value) })
                  }
                  className="rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-slate-200">
                <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Embedding 模型</span>
                <input
                  type="text"
                  value={compression.embeddingModel ?? ""}
                  onChange={(event) =>
                    updateCompressionConfig({ embeddingModel: event.target.value })
                  }
                  placeholder="text-embedding-3-large"
                  className="rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-slate-200">
                <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Embedding 维度</span>
                <input
                  type="number"
                  min={128}
                  max={4096}
                  step={64}
                  value={compression.embeddingDimensions ?? 1536}
                  onChange={(event) =>
                    updateCompressionConfig({ embeddingDimensions: Number(event.target.value) })
                  }
                  className="rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-slate-200">
                <span className="text-xs uppercase tracking-[0.2em] text-slate-400">重排序模型</span>
                <input
                  type="text"
                  value={compression.rerankModel ?? ""}
                  onChange={(event) =>
                    updateCompressionConfig({ rerankModel: event.target.value })
                  }
                  placeholder="bge-reranker-large"
                  className="rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                />
              </label>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
