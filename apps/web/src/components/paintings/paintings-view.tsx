"use client";

import { Palette, Sparkles, Wand2 } from "lucide-react";

const PROVIDERS = [
  {
    id: "zhipu",
    name: "智谱 CogView",
    summary: "默认入口，提供 CogView 3 系列模型与提示词管理。",
  },
  {
    id: "aihubmix",
    name: "AIHubMix",
    summary: "支持生成、变体、编辑与高清放大等多步流程。",
  },
  {
    id: "silicon",
    name: "SiliconFlow",
    summary: "强调渲染速度切换与高并发队列能力。",
  },
  {
    id: "dmxapi",
    name: "DmxAPI",
    summary: "提供多模型选择与专业绘图参数面板。",
  },
  {
    id: "tokenflux",
    name: "TokenFlux",
    summary: "覆盖稳定扩散模型与内置风格模板。",
  },
  {
    id: "new-api",
    name: "自定义 OpenAI 接口",
    summary: "复用 OpenAI 图像生成/编辑接口的自托管路径。",
  },
] as const;

const MIGRATION_TASKS = [
  {
    title: "画布与风格参数",
    description:
      "保留长宽比、风格、渲染速度、质量与审核选项，映射至浏览器端的表单控件。",
  },
  {
    title: "多供应商入口",
    description:
      "根据 Electron 侧的路由切换逻辑，建立 provider 标签页并允许用户持久化默认供应商。",
  },
  {
    title: "绘图历史与文件管理",
    description:
      "迁移 Redux 持久化的历史记录、文件清理与生成确认流程，确保 Web 端也能管理素材。",
  },
] as const;

export function PaintingsView() {
  return (
    <div className="flex flex-1 flex-col gap-8 overflow-y-auto px-6 py-10">
      <header className="flex flex-col gap-4">
        <div className="flex items-center gap-3 text-primary">
          <Palette className="h-6 w-6" />
          <span className="text-sm font-semibold uppercase tracking-widest">Paintings</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          迁移 Cherry Studio 绘图工作台
        </h1>
        <p className="max-w-3xl text-base text-slate-300">
          浏览器版本将复刻桌面端的多供应商绘图体验，保留提示词管理、模型切换与素材归档能力。
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
          <Sparkles className="h-5 w-5 text-primary" /> 支持的绘图供应商
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {PROVIDERS.map((provider) => (
            <article
              key={provider.id}
              className="flex h-full flex-col justify-between gap-3 rounded-2xl border border-white/5 bg-white/5 p-5 text-slate-200 shadow-lg backdrop-blur"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-white">{provider.name}</h3>
                  <span className="text-xs uppercase tracking-widest text-slate-400">{provider.id}</span>
                </div>
                <p className="text-sm text-slate-300">{provider.summary}</p>
              </div>
              <p className="text-xs text-slate-500">
                将在 Web 端提供统一的参数面板、默认供应商记忆与模型能力提示。
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
          <Wand2 className="h-5 w-5 text-primary" /> Web 迁移待办
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {MIGRATION_TASKS.map((task) => (
            <article
              key={task.title}
              className="flex h-full flex-col gap-3 rounded-2xl border border-white/5 bg-slate-900/60 p-5 text-slate-200 shadow-lg"
            >
              <h3 className="text-sm font-semibold text-white">{task.title}</h3>
              <p className="text-sm text-slate-300">{task.description}</p>
            </article>
          ))}
        </div>
        <p className="text-xs text-slate-500">
          后续迭代将串联提示词历史、生成结果下载与扩展端素材管理，以完成桌面到 Web 的能力迁移。
        </p>
      </section>
    </div>
  );
}
