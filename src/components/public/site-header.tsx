"use client";

import { Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navigation = [
  { href: "/#quienes-somos", label: "Quiénes somos" },
  { href: "/#como-funciona", label: "Cómo funciona" },
  { href: "/#ambitos", label: "Ámbitos" },
];

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
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="focus-ring hover:text-brand text-sm font-semibold transition-colors"
            >
              {item.label}
            </Link>
          ))}
          <Button asChild>
            <Link href="/#envia-tu-propuesta">Envía tu propuesta</Link>
          </Button>
        </nav>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="size-11 lg:hidden"
              aria-label="Abrir menú"
            >
              <Menu aria-hidden="true" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="bg-ivory w-[min(88vw,24rem)] px-6"
          >
            <SheetHeader className="border-b px-0 pb-5 text-left">
              <SheetTitle className="text-2xl">
                {siteConfig.shortName}
              </SheetTitle>
              <SheetDescription>{siteConfig.slogan}</SheetDescription>
            </SheetHeader>
            <nav
              aria-label="Navegación móvil"
              className="flex flex-col gap-2 py-7"
            >
              {navigation.map((item) => (
                <SheetClose asChild key={item.href}>
                  <Link
                    href={item.href}
                    className="focus-ring border-b py-4 text-lg font-semibold"
                  >
                    {item.label}
                  </Link>
                </SheetClose>
              ))}
              <SheetClose asChild>
                <Button asChild className="mt-5">
                  <Link href="/#envia-tu-propuesta">Envía tu propuesta</Link>
                </Button>
              </SheetClose>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
