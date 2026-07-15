import {
  ArrowDown,
  ArrowRight,
  Eye,
  FileText,
  LockKeyhole,
  MessageSquareText,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { ProposalForm } from "@/components/public/proposal-form";
import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { proposalCategories } from "@/lib/constants";

const steps = [
  {
    number: "01",
    title: "Comparte tu propuesta",
    text: "Completa un formulario breve. Puedes hacerlo de forma anónima.",
    icon: MessageSquareText,
  },
  {
    number: "02",
    title: "UNEP la revisa",
    text: "Las propuestas se mantienen privadas y solo las consultan administradores autorizados.",
    icon: Eye,
  },
  {
    number: "03",
    title: "La idea aporta",
    text: "Las ideas ayudan a construir iniciativas para la institución, sin prometer que todas se ejecutarán.",
    icon: FileText,
  },
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="contenido">
        <section className="bg-brand text-white">
          <div className="container-site grid min-h-[min(47rem,calc(100vh-5rem))] items-center gap-12 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:py-20">
            <div className="animate-enter">
              <p className="text-xs font-bold tracking-[0.22em] text-white uppercase">
                {siteConfig.name}
              </p>
              <h1 className="mt-5 text-[clamp(4.5rem,14vw,10rem)] leading-[0.78] tracking-[-0.075em]">
                UNEP
              </h1>
              <p className="mt-7 max-w-xl text-2xl leading-tight font-semibold sm:text-3xl">
                {siteConfig.slogan}
              </p>
              <p className="mt-6 max-w-xl text-lg leading-8 text-white/82">
                El cambio comienza escuchando. Comparte una propuesta que ayude
                a mejorar nuestra institución.
              </p>
              <div className="mt-9 flex flex-wrap gap-4">
                <Button
                  asChild
                  size="lg"
                  variant="secondary"
                  className="text-brand-dark bg-white hover:bg-white/90"
                >
                  <Link href="#envia-tu-propuesta">
                    Envía tu propuesta <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white/45 bg-transparent text-white hover:bg-white/10 hover:text-white"
                >
                  <Link href="#como-funciona">
                    Cómo funciona <ArrowDown aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="brand-grid relative mx-auto aspect-square w-full max-w-[30rem] border border-white/25 p-8 lg:p-10">
              <div
                className="absolute -top-3 -left-3 h-24 w-24 border-t-4 border-l-4 border-white"
                aria-hidden="true"
              />
              <div
                className="absolute -right-3 -bottom-3 h-24 w-24 border-r-4 border-b-4 border-white"
                aria-hidden="true"
              />
              <Image
                src="/brand/logo.jpeg"
                alt="Emblema de Unión Novembrina Educación y Progreso"
                width={600}
                height={600}
                priority
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </section>

        <section
          id="quienes-somos"
          className="container-site grid gap-10 py-20 md:grid-cols-[0.75fr_1.25fr] md:py-28"
        >
          <div>
            <p className="text-kicker">Quiénes somos</p>
            <h2 className="mt-3 text-4xl sm:text-5xl">
              Escuchar también es construir.
            </h2>
          </div>
          <div className="border-brand border-l-4 pl-6 md:pl-10">
            <p className="text-xl leading-9 sm:text-2xl">
              {siteConfig.presentation}
            </p>
            <p className="text-muted-foreground mt-6 leading-7">
              Toda la comunidad novembrina puede participar. Recibimos
              propuestas de cualquier ámbito, las organizamos y las revisamos
              con responsabilidad.
            </p>
          </div>
        </section>

        <section id="como-funciona" className="bg-charcoal text-white">
          <div className="container-site py-20 md:py-24">
            <p className="text-xs font-bold tracking-[0.19em] text-white/60 uppercase">
              Cómo funciona
            </p>
            <div className="mt-4 flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <h2 className="max-w-2xl text-4xl sm:text-5xl">
                Tres pasos, una conversación que empieza.
              </h2>
              <p className="max-w-sm text-sm leading-6 text-white/65">
                UNEP no responderá individualmente ni puede asegurar que cada
                propuesta se ejecute.
              </p>
            </div>
            <ol className="mt-12 grid border-t border-white/20 md:grid-cols-3">
              {steps.map((step) => {
                const Icon = step.icon;
                return (
                  <li
                    key={step.number}
                    className="border-b border-white/20 py-8 md:border-r md:border-b-0 md:px-7 first:md:pl-0 last:md:border-r-0"
                  >
                    <div className="flex items-center justify-between text-white/55">
                      <span className="font-heading text-2xl">
                        {step.number}
                      </span>
                      <Icon aria-hidden="true" className="size-5" />
                    </div>
                    <h3 className="mt-10 text-2xl">{step.title}</h3>
                    <p className="mt-3 leading-7 text-white/70">{step.text}</p>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        <section id="ambitos" className="container-site py-20 md:py-28">
          <div className="grid gap-8 md:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-kicker">Ámbitos de propuesta</p>
              <h2 className="mt-3 text-4xl sm:text-5xl">
                Todas las ideas tienen un lugar.
              </h2>
              <p className="text-muted-foreground mt-5 max-w-md leading-7">
                Estas categorías solo ayudan a organizar. Si ninguna encaja,
                puedes escribir la tuya.
              </p>
            </div>
            <ul className="border-t">
              {proposalCategories.map((category, index) => (
                <li
                  key={category.value}
                  className="grid grid-cols-[3rem_1fr] items-center border-b py-4"
                >
                  <span className="text-brand-dark font-heading text-sm">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-lg font-semibold">
                    {category.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="envia-tu-propuesta" className="bg-secondary border-y">
          <div className="container-site grid gap-10 py-20 lg:grid-cols-[0.72fr_1.28fr] lg:py-28">
            <div>
              <p className="text-kicker">Tu voz cuenta</p>
              <h2 className="mt-3 text-4xl sm:text-5xl">Envía tu propuesta.</h2>
              <p className="text-muted-foreground mt-5 leading-7">
                El formulario toma pocos minutos. No adjuntes información
                sensible, documentos ni fotografías.
              </p>
              <div className="bg-ivory mt-8 border p-5">
                <div className="flex gap-3">
                  <LockKeyhole
                    className="text-brand mt-0.5 size-5 shrink-0"
                    aria-hidden="true"
                  />
                  <p className="text-sm leading-6">
                    <strong>Revisión privada.</strong> Las propuestas no se
                    publican y solo pueden leerlas administradores autorizados.
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground mt-6 text-sm leading-6">
                Este formulario no sustituye los canales de emergencia,
                convivencia escolar o atención inmediata.
              </p>
            </div>
            <div className="border bg-white p-5 sm:p-8 lg:p-10">
              <ProposalForm />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
