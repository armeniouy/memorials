import { Mail, MessageCircle, Globe } from "lucide-react";

const contacts = [
  {
    icon: Mail,
    label: "info@simplarlabs.com",
    href: "mailto:info@simplarlabs.com",
    external: false,
  },
  {
    icon: MessageCircle,
    label: "+59899681858",
    href: "https://wa.me/59899681858",
    external: true,
  },
  {
    icon: Globe,
    label: "SimplarLabs.com",
    href: "https://simplarlabs.com",
    external: true,
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/80 py-8">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-5 px-5 text-center text-sm text-muted">
        <p>Memorials · un espacio para recordar</p>

        <div className="flex w-full flex-col items-center gap-3 border-t border-border/60 pt-5">
          <p className="font-technical text-xs uppercase tracking-wider">
            <a
              href="https://simplarlabs.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground/80 hover:text-accent"
            >
              SimplarLabs.com
            </a>{" "}
            Software Solutions
          </p>

          <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs">
            {contacts.map((contact) => (
              <li key={contact.href}>
                <a
                  href={contact.href}
                  {...(contact.external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className="inline-flex items-center gap-1.5 hover:text-accent"
                >
                  <contact.icon size={13} strokeWidth={1.75} />
                  {contact.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
