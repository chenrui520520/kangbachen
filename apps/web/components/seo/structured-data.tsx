export function StructuredData() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "KangBa",
    applicationCategory: "GameApplication",
    operatingSystem: "Web",
    description:
      "Dying undead civilization Web3 hub — soul fragments, cursed relics, necrotic sigils, campaigns, and local-first engagement.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
