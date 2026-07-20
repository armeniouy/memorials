"use client";

import { useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { ImagePlus, Loader2 } from "lucide-react";

export function SubmitButton({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={
        className ??
        "btn-glow inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-60"
      }
    >
      {pending && <Loader2 size={15} className="animate-spin" />}
      {children}
    </button>
  );
}

/** Submit button that asks for confirmation before submitting its form. */
export function ConfirmSubmit({
  children,
  message,
  className,
}: {
  children: ReactNode;
  message: string;
  className?: string;
}) {
  return (
    <button
      type="submit"
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
      className={
        className ??
        "inline-flex items-center gap-2 rounded-full border border-red-500/40 px-4 py-2 text-sm text-red-500 transition-colors hover:bg-red-500/10"
      }
    >
      {children}
    </button>
  );
}

/** Uploads an image to /api/admin/photos and refreshes the page on success. */
export function PhotoUploader({ personId }: { personId: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("personId", personId);
      fd.append("file", file);
      const res = await fetch("/api/admin/photos", { method: "POST", body: fd });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "No se pudo subir la imagen.");
      }
      if (inputRef.current) inputRef.current.value = "";
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo subir la imagen.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label
        className={`btn-glow inline-flex cursor-pointer items-center gap-2 rounded-full border border-border px-4 py-2 text-sm transition-colors hover:border-accent ${
          uploading ? "pointer-events-none opacity-60" : ""
        }`}
      >
        {uploading ? (
          <Loader2 size={15} className="animate-spin" />
        ) : (
          <ImagePlus size={15} />
        )}
        {uploading ? "Subiendo…" : "Subir foto"}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onChange}
          disabled={uploading}
        />
      </label>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}
