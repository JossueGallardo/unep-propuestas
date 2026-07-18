"use client";

import { Menu } from "lucide-react";
import Link from "next/link";

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
import { proposalFormLink, publicNavigation } from "@/config/navigation";
import { siteConfig } from "@/config/site";

export function MobileNavigation() {
  return (
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
      <SheetContent side="right" className="bg-ivory w-[min(88vw,24rem)] px-6">
        <SheetHeader className="border-b px-0 pb-5 text-left">
          <SheetTitle className="text-2xl">{siteConfig.shortName}</SheetTitle>
          <SheetDescription>{siteConfig.slogan}</SheetDescription>
        </SheetHeader>
        <nav aria-label="Navegación móvil" className="flex flex-col gap-2 py-7">
          {publicNavigation.map((item) => (
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
              <Link href={proposalFormLink.href}>{proposalFormLink.label}</Link>
            </Button>
          </SheetClose>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
