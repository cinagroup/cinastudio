import type { ReactNode } from "react";

import { cn } from "@/utils/cn";

interface SettingCardProps {
  title: string;
  description: string;
  children?: ReactNode;
  className?: string;
}

export function SettingCard({ title, description, children, className }: SettingCardProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-lg shadow-slate-950/30 backdrop-blur",
        className,
      )}
    >
      <div className="flex flex-col gap-4">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-white">{title}</h3>
          <p className="text-sm text-slate-300">{description}</p>
        </div>
        {children ? <div className="space-y-4">{children}</div> : null}
      </div>
    </section>
  );
}
