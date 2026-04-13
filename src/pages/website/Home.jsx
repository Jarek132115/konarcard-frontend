// frontend/src/pages/home/Home.jsx
import React, { useEffect } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Home/Footer";

/* Sections, order: Hero → Comparison → HowItWorks → Share →
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
          name: "What is a digital business card?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "It is an online profile that replaces your paper card. Share it by tapping your NFC card, scanning the QR code, or sending your link. Everything a customer needs is in one place.",
          },
        },
        {
          "@type": "Question",
          name: "Does the customer need to download an app?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No. Your profile opens straight in their browser. Nothing to download on either end.",
          },
        },
        {
          "@type": "Question",
          name: "What if I change my number or move area?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Update your profile online and it changes everywhere instantly. Every card you have ever given out will show your new details.",
          },
        },
        {
          "@type": "Question",
          name: "Is it a one-off cost or a monthly fee?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "The card is a one-off payment of £19.99. The basic profile is free. There is an optional Plus plan at £5 a month if you want more photos, more services listed and full analytics.",
          },
        },
        {
          "@type": "Question",
          name: "How quickly does delivery arrive?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Orders placed before 1pm are dispatched the same day. Next-day delivery is available at checkout.",
          },
        },
      ],
    });
  }, []);

  return (
    <>
      <Navbar />

      <main className="kc-home" aria-label="KonarCard home page">
        {/* 1: #ffffff */}
        <Hero />

        {/* 2: #fafafa */}
        <Comparison />

        {/* 3: #ffffff */}
        <HowItWorks />

        {/* 4: #fafafa */}
        <Share />

        {/* 5: #ffffff */}
        <Products />

        {/* 6: #fafafa */}
        <Examples />

        {/* 7: #ffffff */}
        <Pricing />

        {/* 8: #fafafa */}
        <Value />

        {/* 9: #ffffff */}
        <FAQ />
      </main>

      <Footer />
    </>
  );
}
