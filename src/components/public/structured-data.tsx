import { getSiteUrl, siteConfig } from "@/config/site";

export function StructuredData() {
  const siteUrl = getSiteUrl();
  const organizationId = `${siteUrl}/#organization`;
  const websiteId = `${siteUrl}/#website`;
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": organizationId,
        name: siteConfig.name,
        alternateName: siteConfig.shortName,
        url: siteUrl,
        logo: new URL("/brand/logo.jpeg", siteUrl).toString(),
        sameAs: siteConfig.socialLinks.map((link) => link.href),
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: siteUrl,
        name: `${siteConfig.shortName} Propuestas`,
        description: siteConfig.description,
        inLanguage: "es-EC",
        publisher: { "@id": organizationId },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
