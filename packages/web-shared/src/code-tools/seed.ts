import type { CodeToolsSeed } from "./types";

export const codeToolsSeed: CodeToolsSeed = {
  tools: [
    {
      id: "claude-code",
      name: "Claude Code Console",
      description:
        "基于 Claude 3.5 的原生 CLI，提供补全、解释与多文件重构能力，适合需要自然语言协作的代码探索场景。",
      cliCommand: "claude-code",
      docsUrl: "https://docs.anthropic.com/en/docs/build-with-claude/claude-code",
      recommendedModels: [
        {
          id: "claude-3.5-sonnet",
          name: "Claude 3.5 Sonnet",
          provider: "Anthropic",
          notes: "平衡速度与上下文长度，适合作为默认模型。",
        },
        {
          id: "claude-3.5-haiku",
          name: "Claude 3.5 Haiku",
          provider: "Anthropic",
          notes: "快速迭代或本地上下文较小的脚本场景。",
        },
      ],
      prerequisites: [
        "需要已经安装并登录 claude-code CLI",
        "本地环境具备 Node.js 18+ 或 Bun",
        "已配置 Anthropic API Key",
      ],
      highlights: [
        "自动检测项目依赖并生成执行建议",
        "支持与 Claude Projects 集成的上下文管理",
        "通过 JSON-RPC 与扩展桥接共享提示词",
      ],
      guide: [
        {
          id: "setup",
          title: "安装 CLI",
          description: "通过 npm 或 bun 全局安装 `claude-code`，并使用 `claude login` 完成鉴权。",
        },
        {
          id: "bootstrap",
          title: "初始化工作区",
          description: "在目标目录执行 `claude init`，生成 `claude.config.json` 并校验模型配置。",
        },
        {
          id: "run",
          title: "启动实时会话",
          description: "运行 `claude code` 开启终端界面，可结合扩展推送的上下文进行协作。",
        },
      ],
    },
    {
      id: "qwen-code",
      name: "通义灵码 CLI",
      description:
        "集成阿里云灵码能力，提供代码解释、重构与多语言翻译，适合国内网络环境。",
      cliCommand: "lingma",
      docsUrl: "https://help.aliyun.com/zh/qianwen/developer-reference/lingma-cli",
      recommendedModels: [
        {
          id: "qwen-coder-plus",
          name: "Qwen Coder Plus",
          provider: "Alibaba Cloud",
          notes: "通用场景默认模型，支持 32K 上下文。",
        },
        {
          id: "qwen-coder-pro",
          name: "Qwen Coder Pro",
          provider: "Alibaba Cloud",
          notes: "需要更长上下文或代码重构时的进阶方案。",
        },
      ],
      prerequisites: [
        "需要配置阿里云凭证与 Region",
        "建议安装 Alibaba Cloud CLI 以复用鉴权",
        "依赖 Python 3.9+ 与 pip 环境",
      ],
      highlights: [
        "内置中文语义优化，适合双语研发场景",
        "提供一键修复、函数补全与注释生成",
        "支持在企业专有云或本地网络环境部署",
      ],
      guide: [
        {
          id: "install",
          title: "安装依赖",
          description: "使用 `pip install lingma-cli` 或直接下载官方发行包。",
        },
        {
          id: "configure",
          title: "配置凭证",
          description: "运行 `lingma configure` 录入 AccessKey、Secret 与 Region，或复用环境变量。",
        },
        {
          id: "launch",
          title: "发起指令",
          description: "在项目根目录执行 `lingma up`，可选择对话、代码生成或项目体检模式。",
        },
      ],
    },
    {
      id: "gemini-cli",
      name: "Gemini Code Assist",
      description:
        "Google Gemini 官方 CLI，支持多模态补全与代码执行计划，兼容 VS Code 与终端环境。",
      cliCommand: "gcloud ai",
      docsUrl: "https://cloud.google.com/gemini/docs/code-assist",
      recommendedModels: [
        {
          id: "gemini-2.0-pro",
          name: "Gemini 2.0 Pro",
          provider: "Google Cloud",
          notes: "标准多模态模型，适合日常代码生成与审查。",
        },
        {
          id: "gemini-1.5-flash",
          name: "Gemini 1.5 Flash",
          provider: "Google Cloud",
          notes: "对实时反馈友好的轻量模型，费用更低。",
        },
      ],
      prerequisites: [
        "本地安装 gcloud CLI 并完成 `gcloud init`",
        "启用 Vertex AI API 并分配服务账号",
        "设置 `GOOGLE_API_KEY` 或使用服务账号凭证",
      ],
      highlights: [
        "终端与浏览器共享上下文，适合 PWA 协同",
        "支持多文件批量生成与代码审查工作流",
        "可与 Google Cloud Build/Deploy 集成自动化",
      ],
      guide: [
        {
          id: "enable",
          title: "启用 API",
          description: "在 Google Cloud Console 打开 Vertex AI 与 Code Assist 功能。",
        },
        {
          id: "auth",
          title: "配置鉴权",
          description: "通过 `gcloud auth application-default login` 或服务账号密钥完成鉴权。",
        },
        {
          id: "use",
          title: "执行指令",
          description: "使用 `gcloud ai code assist` 系列命令生成补全或提交代码变更建议。",
        },
      ],
    },
  ],
  terminals: [
    {
      id: "warp",
      name: "Warp",
      platform: "mac",
      description: "现代化 GPU 加速终端，支持命令面板与 AI 伙伴。",
      homepage: "https://www.warp.dev/",
    },
    {
      id: "iterm2",
      name: "iTerm2",
      platform: "mac",
      description: "Mac 经典终端，支持分屏、脚本与触发器。",
      homepage: "https://iterm2.com/",
    },
    {
      id: "windows-terminal",
      name: "Windows Terminal",
      platform: "windows",
      description: "Windows 官方终端，整合 PowerShell、WSL 与 Azure CLI。",
      homepage: "https://aka.ms/terminal",
    },
    {
      id: "tabby",
      name: "Tabby",
      platform: "linux",
      description: "跨平台 GPU 终端，内置 SSH 管理与脚本自动化。",
      homepage: "https://tabby.sh/",
    },
    {
      id: "web-terminal",
      name: "浏览器 Web Terminal",
      platform: "web",
      description: "通过浏览器连接远程容器或 Codespace，适合轻量验证。",
    },
  ],
  defaultEnvironments: {
    "claude-code": "export ANTHROPIC_API_KEY=sk-your-key\nclaude code",
    "qwen-code": "export QWEN_API_KEY=sk-your-key\nlingma up",
    "gemini-cli": "export GOOGLE_API_KEY=sk-your-key\ngcloud ai code assist",
  },
};
