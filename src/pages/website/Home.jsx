import React from "react";
import { useHead } from "@unhead/react";

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

export default function Home() {
  const siteUrl = "https://konarcard.com";

  useHead({
    title: "Digital Business Card & NFC Business Card UK | KonarCard",
    meta: [
      {
        name: "description",
        content:
          "KonarCard is a digital business card and NFC business card for UK trades. Share your details with a tap, QR code or link. Replace paper business cards today.",
      },

      // Open Graph
      { property: "og:title", content: "Digital Business Card & NFC Business Card UK | KonarCard" },
      {
        property: "og:description",
        content:
          "Share your details instantly with an NFC business card and digital business card profile. Built for UK trades.",
      },
      { property: "og:url", content: siteUrl },
      { property: "og:type", content: "website" },

      // Twitter
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Digital Business Card & NFC Business Card UK | KonarCard" },
      { name: "twitter:description", content: "A modern contactless digital business card for UK trades." },
    ],
    link: [{ rel: "canonical", href: siteUrl }],
    script: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "KonarCard",
          url: siteUrl,
          description:
            "KonarCard is a digital business card and NFC business card built for UK trades. Share your contact details, services and reviews instantly.",
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "KonarCard",
          url: siteUrl,
          logo: `${siteUrl}/logo.png`,
        }),
      },
    ],
  });

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
