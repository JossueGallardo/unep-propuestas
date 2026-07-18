import type { Metadata } from "next";
import Link from "next/link";

import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";
import { siteConfig } from "@/config/site";

const privacyDescription =
  "Cómo se utiliza y protege la información enviada a través del formulario de UNEP.";

export const metadata: Metadata = {
  title: "Aviso de privacidad",
  description: privacyDescription,
  alternates: { canonical: "/privacidad" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    siteName: siteConfig.shortName,
    title: `Aviso de privacidad | ${siteConfig.shortName}`,
    description: privacyDescription,
    url: "/privacidad",
  },
  twitter: {
    card: "summary_large_image",
    title: `Aviso de privacidad | ${siteConfig.shortName}`,
    description: privacyDescription,
  },
};

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main id="contenido" className="container-site py-16 md:py-24">
        <div className="max-w-3xl">
          <p className="text-kicker">Información clara</p>
          <h1 className="mt-3 text-5xl sm:text-6xl">Aviso de privacidad</h1>
          <p className="text-muted-foreground mt-5 text-lg leading-8">
            Este aviso explica de forma sencilla cómo {siteConfig.shortName}{" "}
            trata la información recibida en este espacio.
          </p>
        </div>
        <div className="mt-12 grid max-w-4xl gap-10 md:grid-cols-[14rem_1fr]">
          <aside>
            <p className="font-heading text-brand-dark text-xl">
              Última actualización
            </p>
            <p className="text-muted-foreground mt-1">Julio de 2026</p>
          </aside>
          <article className="space-y-9 leading-7">
            <section>
              <h2 className="text-2xl">Qué recopilamos</h2>
              <p className="mt-3">
                Recibimos la categoría, el título y la descripción de la
                propuesta. También puedes indicar de forma opcional tu nombre,
                relación con la comunidad, curso o área y el beneficio que
                esperas.
              </p>
            </section>
            <section>
              <h2 className="text-2xl">Propuestas anónimas</h2>
              <p className="mt-3">
                Cuando eliges enviar de forma anónima, el formulario no solicita
                ni guarda tu nombre. Evita incluir información que te
                identifique dentro del texto si deseas conservar el anonimato.
              </p>
            </section>
            <section>
              <h2 className="text-2xl">Para qué usamos la información</h2>
              <p className="mt-3">
                La información se utiliza para organizar y revisar ideas
                relacionadas con iniciativas institucionales. No ofrecemos
                respuestas individuales ni un sistema público de seguimiento.
              </p>
            </section>
            <section>
              <h2 className="text-2xl">Quién puede verla</h2>
              <p className="mt-3">
                Las propuestas no son públicas. Solo los administradores
                autorizados de UNEP pueden consultarlas en un panel protegido.
              </p>
            </section>
            <section>
              <h2 className="text-2xl">Protección contra abuso</h2>
              <p className="mt-3">
                Aplicamos límites de frecuencia mediante un identificador
                criptográfico irreversible. La dirección IP no se almacena en
                texto claro.
              </p>
            </section>
            <section>
              <h2 className="text-2xl">Información que no debes enviar</h2>
              <p className="mt-3">
                No envíes contraseñas, datos médicos, cédulas, direcciones
                particulares, teléfonos personales, fotografías, documentos ni
                otra información sensible. Este formulario tampoco sustituye
                canales de emergencia o atención inmediata.
              </p>
            </section>
            {siteConfig.email ? (
              <section>
                <h2 className="text-2xl">Contacto</h2>
                <p className="mt-3">
                  Para consultas relacionadas con este aviso, escribe a{" "}
                  <a
                    href={`mailto:${siteConfig.email}`}
                    className="text-brand-dark focus-ring font-semibold underline underline-offset-4"
                  >
                    {siteConfig.email}
                  </a>
                  .
                </p>
              </section>
            ) : null}
            <Link
              href="/#envia-tu-propuesta"
              className="text-brand-dark focus-ring inline-flex font-bold underline underline-offset-4"
            >
              Volver al formulario
            </Link>
          </article>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
