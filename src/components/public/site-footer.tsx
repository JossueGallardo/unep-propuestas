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
        <div className="space-y-3 text-sm md:text-right">
          <Link
            className="focus-ring block underline-offset-4 hover:underline"
            href="/privacidad"
          >
            Aviso de privacidad
          </Link>
          {siteConfig.socialLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block"
              rel="noreferrer"
            >
              {link.label}
            </a>
          ))}
          <p className="text-white/60">© {year} UNEP</p>
        </div>
      </div>
    </footer>
  );
}
