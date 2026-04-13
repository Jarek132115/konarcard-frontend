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
          name: "What is a digital business card?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "A digital business card is a card you share from your phone instead of handing out paper. With KonarCard, the customer taps your card on their phone and your profile opens — details, services, photos and reviews, all in one link.",
          },
        },
        {
          "@type": "Question",
          name: "Does the customer need to download an app?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No. Your profile opens straight in their browser — no downloads, no sign-ups.",
          },
        },
        {
          "@type": "Question",
          name: "What happens if I change my phone number or address?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Update your profile online and every card you've ever given out now shows the new details. Nothing to reprint, nothing to replace.",
          },
        },
        {
          "@type": "Question",
          name: "How does the card actually work?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Tap the card on the top or back of a phone and your profile loads. If their phone can't tap, they scan the QR code on the back instead.",
          },
        },
        {
          "@type": "Question",
          name: "Is it a one-off cost or a subscription?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "The card is £19.99, paid once. Your digital profile is free. Plus is £5 a month if you want more photos, services and full analytics, and it's optional.",
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
              KonarCard is a digital business card built for UK tradespeople.
              Your card has a built-in NFC chip — tap it to a customer's
              phone and your profile opens straight away, no app needed.
              Think of it as your business card, website and review page all
              in one link. It works as a smart electronic business card you
              update online, so your details are always right. One card. One
              tap. Everything a customer needs to book you.
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
