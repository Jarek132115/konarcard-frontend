// frontend/src/pages/home/Home.jsx
import React, { useEffect } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Home/Footer";

/* Sections — order: Hero → Comparison → HowItWorks → Share →
   Products → Examples → Pricing → Value → FAQ              */
import Hero       from "../../components/Home/Hero";
import Comparison from "../../components/Home/Comparison";
import HowItWorks from "../../components/Home/HowItWorks";
import Share      from "../../components/Home/Share";
import Products   from "../../components/Home/Products";
import Examples   from "../../components/Home/Examples";
import Pricing    from "../../components/Home/Pricing";
import Value      from "../../components/Home/Value";
import FAQ        from "../../components/Home/FAQ";

/* Global typography */
import "../../styling/fonts.css";
import "../../styling/home.css";

function upsertMeta(attr, key, value) {
  const selector = `meta[${attr}="${key}"]`;
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", value);
}

function upsertLink(rel, href) {
  const selector = `link[rel="${rel}"]`;
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function upsertJsonLd(id, json) {
  const selector = `script[type="application/ld+json"][data-kc="${id}"]`;
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement("script");
    el.type = "application/ld+json";
    el.setAttribute("data-kc", id);
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(json);
}

export default function Home() {
  useEffect(() => {
    const siteUrl = "https://www.konarcard.com";

    const title = "Digital Business Cards for UK Tradespeople | KonarCard";
    const description =
      "KonarCard NFC business cards let UK tradespeople share their contact details, services and reviews with a single tap. No app needed. From £19.99. Free digital profile included.";

    document.title = title;

    upsertMeta("name", "description", description);
    upsertLink("canonical", siteUrl);

    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:url", siteUrl);
    upsertMeta("property", "og:type", "website");

    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", title);
    upsertMeta("name", "twitter:description", description);

    upsertJsonLd("website", {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "KonarCard",
      url: siteUrl,
      description:
        "KonarCard is a digital business card and NFC business card built for UK businesses. Share contact details, services and reviews instantly.",
    });

    upsertJsonLd("org", {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "KonarCard",
      url: siteUrl,
      logo: `${siteUrl}/Favicon.png`,
      description:
        "KonarCard provides NFC-enabled digital business cards for UK tradespeople and service professionals.",
      address: {
        "@type": "PostalAddress",
        addressCountry: "GB",
      },
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "supportteam@konarcard.com",
        areaServed: "GB",
        availableLanguage: ["English"],
      },
    });

    upsertJsonLd("faq", {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is KonarCard?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "KonarCard is a digital business card built for UK trades and small businesses. Share your profile instantly using an NFC tap, QR scan, or a link — no app needed. Update your details anytime.",
          },
        },
        {
          "@type": "Question",
          name: "How do I get started?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Create your free profile, claim your link, and add your contact details, services, photos, and reviews. Then share by link, QR, or order an NFC card for tap-to-share.",
          },
        },
        {
          "@type": "Question",
          name: "Do I need to pay to start?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No. You can start free and share your link straight away. NFC products (plastic, metal, or KonarTag) are optional for tap-to-share.",
          },
        },
        {
          "@type": "Question",
          name: "Does the NFC business card work on iPhone and Android?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Most modern iPhones and Android phones support NFC tap-to-open. There's also a QR backup for phones with NFC off.",
          },
        },
        {
          "@type": "Question",
          name: "Can I update my details anytime?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Your link stays the same, but you can update your profile content whenever you want — no reprints and no outdated details.",
          },
        },
        {
          "@type": "Question",
          name: "Is the NFC card a one-time purchase?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. NFC products are a one-time purchase. Plans are optional if you want extra features like more templates or deeper analytics.",
          },
        },
      ],
    });
  }, []);

  return (
    <>
      <Navbar />

      <main className="kc-home" aria-label="KonarCard home page">
        {/* 1 — #ffffff */}
        <Hero />

        {/* SEO intro — indexable copy right below the hero */}
        <section
          className="kc-homeIntro"
          aria-label="About KonarCard"
          style={{
            background: "#ffffff",
            padding: "32px 20px 48px",
          }}
        >
          <div
            style={{
              maxWidth: 920,
              margin: "0 auto",
              textAlign: "center",
            }}
          >
            <p className="kc-subheading" style={{ margin: 0 }}>
              KonarCard is a digital business card designed for UK
              tradespeople. Each card uses NFC technology — tap it to any
              smartphone and your profile opens instantly, no app required.
              Share your contact details, services, photos, prices and reviews
              in one link. Cards are available in 6 colours at £19.99 each
              with a free digital profile included. Used by electricians,
              plumbers, builders, landscapers and handymen across the UK.
            </p>
          </div>
        </section>

        {/* 2 — #fafafa */}
        <Comparison />

        {/* 3 — #ffffff */}
        <HowItWorks />

        {/* 4 — #fafafa */}
        <Share />

        {/* 5 — #ffffff */}
        <Products />

        {/* 6 — #fafafa */}
        <Examples />

        {/* 7 — #ffffff */}
        <Pricing />

        {/* 8 — #fafafa */}
        <Value />

        {/* 9 — #ffffff */}
        <FAQ />
      </main>

      <Footer />
    </>
  );
}
