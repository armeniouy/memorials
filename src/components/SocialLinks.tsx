import { Link as LinkIcon, Globe } from "lucide-react";
import {
  SiFacebook,
  SiInstagram,
  SiSpotify,
  SiThreads,
  SiTiktok,
  SiX,
  SiYoutube,
} from "@icons-pack/react-simple-icons";

export type SocialLinkData = {
  id: string;
  platform: string;
  url: string;
  label: string | null;
};

type PlatformStyle = {
  name: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
};

// LinkedIn no tiene ícono en simple-icons (lo retiraron), así que cae al genérico.
const PLATFORMS: Record<string, PlatformStyle> = {
  INSTAGRAM: { name: "Instagram", Icon: SiInstagram },
  FACEBOOK: { name: "Facebook", Icon: SiFacebook },
  X: { name: "X", Icon: SiX },
  TIKTOK: { name: "TikTok", Icon: SiTiktok },
  YOUTUBE: { name: "YouTube", Icon: SiYoutube },
  SPOTIFY: { name: "Spotify", Icon: SiSpotify },
  THREADS: { name: "Threads", Icon: SiThreads },
  LINKEDIN: { name: "LinkedIn", Icon: LinkIcon },
  WEBSITE: { name: "Sitio web", Icon: Globe },
};

export function SocialLinks({ links }: { links: SocialLinkData[] }) {
  if (links.length === 0) return null;

  return (
    <ul className="flex flex-wrap items-center justify-center gap-2">
      {links.map((link) => {
        const platform = PLATFORMS[link.platform] ?? PLATFORMS.WEBSITE;
        const text = link.label ?? platform.name;

        return (
          <li key={link.id}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer me"
              title={`${platform.name} — ${text}`}
              className="card-glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm text-muted transition-colors hover:text-accent"
            >
              <platform.Icon size={15} className="shrink-0" />
              <span>{text}</span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
