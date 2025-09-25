"use client";

import { CheckCircle2, ExternalLink } from "lucide-react";
import type { CodeTool } from "@cinaseek/web-shared/code-tools";
import { cn } from "@/utils/cn";

interface ToolCardProps {
  tool: CodeTool;
  isActive: boolean;
  onSelect: (toolId: CodeTool["id"]) => void;
}

export function ToolCard({ tool, isActive, onSelect }: ToolCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(tool.id)}
      className={cn(
        "flex w-full flex-col gap-4 rounded-2xl border border-white/10 bg-slate-950/60 p-5 text-left transition hover:border-primary/60 hover:bg-primary/5",
        isActive && "border-primary/70 bg-primary/10 shadow-lg shadow-primary/20",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">{tool.name}</h3>
          <p className="mt-1 text-sm text-slate-300">{tool.description}</p>
        </div>
        {tool.docsUrl ? (
          <a
            href={tool.docsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200 transition hover:border-white/20 hover:text-white"
            onClick={(event) => event.stopPropagation()}
          >
            查看文档
            <ExternalLink className="h-3 w-3" />
          </a>
        ) : null}
      </div>
      <div className="grid gap-2">
        {tool.highlights.map((highlight) => (
          <p key={highlight} className="flex items-start gap-2 text-xs text-slate-300">
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-primary" />
            <span>{highlight}</span>
          </p>
        ))}
      </div>
    </button>
  );
}
