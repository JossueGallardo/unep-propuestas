import { ArrowRight, ArrowUp, ExternalLink, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  proposalFormLink,
  publicNavigation,
  utilityNavigation,
} from "@/config/navigation";
import { siteConfig } from "@/config/site";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-charcoal text-white">
      <div className="bg-brand">
        <div className="container-site grid gap-8 py-12 sm:py-14 lg:grid-cols-[1fr_auto] lg:items-end lg:py-16">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] text-white uppercase">
              Tu voz cuenta
            </p>
            <h2 className="mt-4 max-w-4xl text-4xl leading-[1.02] sm:text-5xl lg:text-6xl">
              El cambio comienza escuchando.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/85">
              Comparte una idea que ayude a construir una mejor institución para
              toda la comunidad novembrina.
            </p>
          </div>
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="text-brand-dark min-h-12 w-full bg-white px-6 hover:bg-white/90 sm:w-fit"
          >
            <Link href={proposalFormLink.href}>
              Enviar una propuesta
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="container-site grid gap-12 py-12 sm:py-14 md:grid-cols-2 lg:grid-cols-12 lg:gap-8 lg:py-16">
        <div className="md:col-span-2 lg:col-span-5">
          <Link
            href="/"
            className="focus-ring inline-flex items-center gap-4 rounded-md"
            aria-label="UNEP, volver al inicio"
          >
            <Image
              src="/brand/logo.jpeg"
              alt=""
              width={80}
              height={80}
              className="size-18 border border-white/15 object-cover sm:size-20"
            />
            <span>
              <span className="font-heading block text-3xl leading-none">
                {siteConfig.shortName}
              </span>
              <span className="mt-2 block max-w-64 text-sm leading-5 text-white/70">
                {siteConfig.name}
              </span>
            </span>
          </Link>
          <p className="mt-6 max-w-md text-base leading-7 text-white/70">
            {siteConfig.description}
          </p>
        </div>

        <nav aria-label="Explorar" className="lg:col-span-2 lg:col-start-7">
          <h3 className="text-sm font-bold tracking-[0.14em] text-white/55 uppercase">
            Explora
          </h3>
          <ul className="mt-4">
            {publicNavigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="focus-ring inline-flex min-h-11 items-center text-white/80 underline-offset-4 transition-colors hover:text-white hover:underline"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Información" className="lg:col-span-2">
          <h3 className="text-sm font-bold tracking-[0.14em] text-white/55 uppercase">
            Información
          </h3>
          <ul className="mt-4">
            {utilityNavigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="focus-ring inline-flex min-h-11 items-center text-white/80 underline-offset-4 transition-colors hover:text-white hover:underline"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="lg:col-span-2">
          <h3 className="text-sm font-bold tracking-[0.14em] text-white/55 uppercase">
            Conecta
          </h3>
          <div className="mt-5 space-y-3">
            {siteConfig.socialLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                aria-label={`${link.label} de UNEP (abre en una pestaña nueva)`}
                className="focus-ring inline-flex min-h-11 max-w-full items-center gap-2 rounded-md border border-white/20 px-3 py-2 text-white/90 transition-colors hover:border-white/40 hover:bg-white/10"
                rel="noreferrer"
                target="_blank"
              >
                <span className="[overflow-wrap:anywhere]">{link.handle}</span>
                <ExternalLink
                  className="size-3.5 text-white/55"
                  aria-hidden="true"
                />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="container-site border-t border-white/15">
        <div className="flex flex-col gap-4 py-6 text-sm text-white/60 md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {siteConfig.shortName}
          </p>
          <p className="flex max-w-xl items-start gap-2 md:items-center">
            <ShieldCheck
              className="mt-0.5 size-4 shrink-0 md:mt-0"
              aria-hidden="true"
            />
            Las propuestas son privadas y no ofrecen seguimiento público.
          </p>
          <Link
            href="#contenido"
            className="focus-ring inline-flex min-h-11 w-fit items-center gap-2 text-white/80 underline-offset-4 hover:text-white hover:underline"
          >
            Volver arriba
            <ArrowUp className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>

      <div
        className="container-site overflow-hidden border-t border-white/10 pt-5"
        aria-hidden="true"
      >
        <p className="font-heading translate-y-[0.1em] text-[clamp(6rem,19vw,17rem)] leading-[0.72] tracking-[-0.08em] text-white/35 select-none">
          UNEP
        </p>
      </div>
    </footer>
  );
}
