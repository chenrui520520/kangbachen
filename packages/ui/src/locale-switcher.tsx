"use client";

export type LocaleSwitcherProps = {
  locales: readonly string[];
  value: string;
  onChange: (locale: string) => void;
  label?: string;
};

export function LocaleSwitcher({ locales, value, onChange, label = "Language" }: LocaleSwitcherProps) {
  return (
    <label className="flex items-center gap-2 text-sm text-muted-foreground">
      <span className="sr-only">{label}</span>
      <select
        className="rounded-md border border-border bg-card px-2 py-1 text-foreground"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {locales.map((l) => (
          <option key={l} value={l}>
            {l.toUpperCase()}
          </option>
        ))}
      </select>
    </label>
  );
}
