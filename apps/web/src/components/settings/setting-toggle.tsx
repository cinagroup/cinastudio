interface SettingToggleProps {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function SettingToggle({ id, label, description, checked, onChange }: SettingToggleProps) {
  return (
    <label htmlFor={id} className="flex items-start justify-between gap-4">
      <div className="space-y-1">
        <span className="text-sm font-medium text-white">{label}</span>
        {description ? <p className="text-xs text-slate-400">{description}</p> : null}
      </div>
      <span className="relative inline-flex h-6 w-11 shrink-0 items-center">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          aria-label={label}
          className="peer sr-only"
        />
        <span className="absolute inset-0 rounded-full bg-slate-600 transition peer-checked:bg-primary" />
        <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5" />
        <span className="sr-only">{label}</span>
      </span>
    </label>
  );
}
