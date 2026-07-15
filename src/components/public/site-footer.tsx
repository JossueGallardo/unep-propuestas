import { Camera, ExternalLink } from "lucide-react";
import Link from "next/link";

import { siteConfig } from "@/config/site";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-charcoal text-white">
      <div className="container-site grid gap-8 py-10 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="font-heading text-2xl">{siteConfig.name}</p>
          <p className="mt-2 text-sm text-white/70">{siteConfig.slogan}</p>
          {siteConfig.email ? (
            <a
              className="mt-4 block underline"
              href={`mailto:${siteConfig.email}`}
            >
              {siteConfig.email}
            </a>
          ) : null}
        </div>
        <div className="flex flex-col items-start gap-2 text-sm md:items-end md:text-right">
          <Link
            className="focus-ring inline-flex min-h-11 items-center underline-offset-4 hover:underline"
            href="/privacidad"
          >
            Aviso de privacidad
          </Link>
          {siteConfig.socialLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              aria-label={`${link.label} de UNEP (abre en una pestaña nueva)`}
              className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md border border-white/20 px-3 py-2 transition-colors hover:bg-white/10"
              rel="noreferrer"
              target="_blank"
            >
              <Camera className="size-4" aria-hidden="true" />
              <span>{link.label}</span>
              <ExternalLink
                className="size-3.5 text-white/55"
                aria-hidden="true"
              />
            </a>
          ))}
          <p className="text-white/60">© {year} UNEP</p>
        </div>
      </div>
    </footer>
  );
}
