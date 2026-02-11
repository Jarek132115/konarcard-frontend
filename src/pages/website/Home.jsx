// frontend/src/pages/home/Home.jsx
import React, { useEffect } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

/* Sections */
import Hero from "../../components/Home/Hero";
import Comparison from "../../components/Home/Comparison";
import HowItWorks from "../../components/Home/HowItWorks";
import CustomerTrust from "../../components/Home/CustomerTrust";
import Products from "../../components/Home/Products";
import Examples from "../../components/Home/Examples";
import Share from "../../components/Home/Share";
import Value from "../../components/Home/Value";
import Pricing from "../../components/Home/Pricing";
import FAQ from "../../components/Home/FAQ";

/* Assets for Share section */
import NFCBusinessCard from "../../assets/images/NFC-Business-Card.jpg";
import ScanQRCode from "../../assets/images/ScanQR-Code.jpg";
import LinkInBio from "../../assets/images/LinkInBio.jpg";
import SMSSend from "../../assets/images/SMSSend.jpg";

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
    const siteUrl = "https://konarcard.com";

    const title = "Digital Business Card & NFC Business Card UK | KonarCard";
    const description =
      "KonarCard is a digital business card and NFC business card for the UK. Share your details with a tap, QR code or link. Replace paper business cards today.";

    document.title = title;

    upsertMeta("name", "description", description);
    upsertLink("canonical", siteUrl);

    // Open Graph
    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:url", siteUrl);
    upsertMeta("property", "og:type", "website");

    // Twitter
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", title);
    upsertMeta("name", "twitter:description", description);

    // JSON-LD: WebSite
    upsertJsonLd("website", {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "KonarCard",
      url: siteUrl,
      description:
        "KonarCard is a digital business card and NFC business card built for UK businesses. Share contact details, services and reviews instantly.",
    });

    // JSON-LD: Organization
    upsertJsonLd("org", {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "KonarCard",
      url: siteUrl,
      // If you don’t have this file yet, either add it or remove this line:
      logo: `${siteUrl}/logo.png`,
    });

    // JSON-LD: FAQPage (helps rich results when eligible)
    upsertJsonLd("faq", {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is KonarCard?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "KonarCard is a digital business card built for UK trades and small businesses. Share your profile instantly using an NFC tap, QR scan, or a link — no app needed. Update your details anytime.",
          },
        },
        {
          "@type": "Question",
          name: "How do I get started?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "Create your free profile, claim your link, and add your contact details, services, photos, and reviews. Then share by link, QR, or order an NFC card for tap-to-share.",
          },
        },
        {
          "@type": "Question",
          name: "Do I need to pay to start?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "No. You can start free and share your link straight away. NFC products (plastic, metal, or KonarTag) are optional for tap-to-share.",
          },
        },
        {
          "@type": "Question",
          name: "Does the NFC business card work on iPhone and Android?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "Yes. Most modern iPhones and Android phones support NFC tap-to-open. There’s also a QR backup for phones with NFC off.",
          },
        },
        {
          "@type": "Question",
          name: "Can I update my details anytime?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "Yes. Your link stays the same, but you can update your profile content whenever you want — no reprints and no outdated details.",
          },
        },
        {
          "@type": "Question",
          name: "Is the NFC card a one-time purchase?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "Yes. NFC products are a one-time purchase. Plans are optional if you want extra features like more templates or deeper analytics.",
          },
        },
      ],
    });
  }, []);

  return (
    <>
      <Navbar />

      <main className="kc-home" aria-label="KonarCard home page">
        <Hero />
        <Comparison />
        <HowItWorks />
        <CustomerTrust />
        <Products />
        <Examples />

        <Share
          nfcImage={NFCBusinessCard}
          qrImage={ScanQRCode}
          smsImage={SMSSend}
          linkImage={LinkInBio}
        />

        <Value />
        <Pricing />

        {/* ✅ NEW: FAQ section under pricing */}
        <FAQ />
      </main>

      <Footer />
    </>
  );
}
