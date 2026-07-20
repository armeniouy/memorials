import type { ReactNode } from "react";

export const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted/60 focus:border-accent";

export function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required = false,
  placeholder,
  hint,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  type?: string;
  required?: boolean;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block font-technical text-xs uppercase tracking-wider text-muted">
        {label} {required && <span className="text-accent">*</span>}
      </span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue ?? undefined}
        required={required}
        placeholder={placeholder}
        className={inputClass}
      />
      {hint && <span className="mt-1 block text-xs text-muted/80">{hint}</span>}
    </label>
  );
}

export function Textarea({
  label,
  name,
  defaultValue,
  rows = 4,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block font-technical text-xs uppercase tracking-wider text-muted">
        {label}
      </span>
      <textarea
        name={name}
        rows={rows}
        defaultValue={defaultValue ?? undefined}
        placeholder={placeholder}
        className={`${inputClass} resize-y`}
      />
    </label>
  );
}

export function SectionCard({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="card-glass rounded-2xl p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-serif-display text-2xl">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Banner({
  error,
  saved,
  deleted,
}: {
  error?: string;
  saved?: string;
  deleted?: string;
}) {
  if (error) {
    return (
      <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-sm text-red-500">
        {error}
      </p>
    );
  }
  if (saved) {
    return (
      <p className="rounded-lg border border-accent/40 bg-accent/10 px-4 py-2.5 text-sm text-accent">
        Cambios guardados.
      </p>
    );
  }
  if (deleted) {
    return (
      <p className="rounded-lg border border-border bg-background-elevated px-4 py-2.5 text-sm text-muted">
        Se eliminó el/la {deleted}.
      </p>
    );
  }
  return null;
}
