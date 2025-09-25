"use client";

import type { ChangeEventHandler } from "react";

import type { TranslateLanguage } from "@cinaseek/web-shared/translate";

import { cn } from "@/utils/cn";

type LanguageSelectProps = {
  id: string;
  label: string;
  value: string;
  languages: TranslateLanguage[];
  onChange: ChangeEventHandler<HTMLSelectElement>;
};

export function LanguageSelect({ id, label, value, languages, onChange }: LanguageSelectProps) {
  return (
    <label className="flex flex-col gap-2 text-sm text-slate-200" htmlFor={id}>
      <span className="font-medium">{label}</span>
      <select
        id={id}
        value={value}
        onChange={onChange}
        className={cn(
          "w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 shadow-inner",
          "focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30",
        )}
      >
        {languages.map((language) => (
          <option key={language.id} value={language.id}>
            {language.emoji ? `${language.emoji} ${language.label}` : language.label}
          </option>
        ))}
      </select>
    </label>
  );
}
