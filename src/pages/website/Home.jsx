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

    // JSON-LD
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
      // If you don’t have this file yet, either add it or remove this line:
      logo: `${siteUrl}/logo.png`,
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
      </main>

      <Footer />
    </>
  );
}
