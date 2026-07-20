import Link from "next/link";
import { Flame } from "lucide-react";

export function SiteHeader({ breadcrumb }: { breadcrumb?: string }) {
  return (
    <header className="border-b border-border/80 bg-background/80 backdrop-blur supports-backdrop-blur:bg-background/60 sticky top-0 z-40">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-center gap-2 group">
          <Flame
            size={18}
            className="text-candle transition-transform group-hover:scale-110"
            strokeWidth={1.75}
          />
          <span className="font-serif-display text-xl tracking-wide">
            Memorials
          </span>
        </Link>
        {breadcrumb && (
          <span className="hidden text-sm text-muted sm:block truncate max-w-xs">
            {breadcrumb}
          </span>
        )}
      </div>
    </header>
  );
}
