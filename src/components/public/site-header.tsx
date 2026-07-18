import Image from "next/image";
import Link from "next/link";

import { MobileNavigation } from "@/components/public/mobile-navigation";
import { Button } from "@/components/ui/button";
import { proposalFormLink, publicNavigation } from "@/config/navigation";
import { siteConfig } from "@/config/site";

export function SiteHeader() {
  return (
    <header className="bg-ivory/95 sticky top-0 z-50 border-b backdrop-blur-sm">
      <div className="container-site flex h-20 items-center justify-between gap-6">
        <Link
          href="/"
          className="focus-ring flex min-w-0 items-center gap-3"
          aria-label="UNEP, inicio"
        >
          <Image
            src="/brand/logo.jpeg"
            alt=""
            width={52}
            height={52}
            priority
            className="size-12 border border-red-900/10 object-cover"
          />
          <span className="min-w-0">
            <span className="font-heading block text-xl leading-none">
              {siteConfig.shortName}
            </span>
            <span className="text-muted-foreground hidden text-xs leading-tight sm:block">
              {siteConfig.name}
            </span>
          </span>
        </Link>

        <nav
          aria-label="Navegación principal"
          className="hidden items-center gap-7 lg:flex"
        >
          {publicNavigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="focus-ring hover:text-brand text-sm font-semibold transition-colors"
            >
              {item.label}
            </Link>
          ))}
          <Button asChild>
            <Link href={proposalFormLink.href}>{proposalFormLink.label}</Link>
          </Button>
        </nav>

        <MobileNavigation />
      </div>
    </header>
  );
}
