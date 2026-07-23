import { LandingPage } from "@/features/landing";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

// Server Component (§5 server-first). The landing composes the landing feature;
// no business logic lives here (app/ stays thin, §5).

// Structured data for search & answer engines. The FAQ answers mirror the
// visible landing copy — never claims the page doesn't make.
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/apple-icon`,
      description: SITE_DESCRIPTION,
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: SITE_URL,
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Do I need an account to shop on Plugfolio?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No. Shopping never requires an account — follow a creator, tap any post, and buy it straight at the retailer. An account is only for following creators and leaving comments.",
          },
        },
        {
          "@type": "Question",
          name: "How does shopping on Plugfolio work?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Find a creator, tap any shoppable post to see exactly the gear that's in it, and one tap opens the retailer's store. Plugfolio never sees your card — you check out where you already trust.",
          },
        },
        {
          "@type": "Question",
          name: "What is Plugfolio for creators?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Creators turn their posts into a shoppable page: tag products once and earn on every tap, keeping the audience they already have.",
          },
        },
      ],
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <LandingPage />
    </>
  );
}
