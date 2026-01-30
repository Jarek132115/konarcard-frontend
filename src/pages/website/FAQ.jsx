// frontend/src/pages/FAQ/index.jsx
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import "../../styling/fonts.css";
import "../../styling/faq.css";

export default function FAQPage() {
  const tabs = useMemo(
    () => [
      { key: "getting-started", label: "Getting started" },
      { key: "cards-profiles", label: "Cards & profiles" },
      { key: "pricing", label: "Pricing & plans" },
      { key: "teams", label: "Teams" },
      { key: "support", label: "Technical & support" },
    ],
    []
  );

  const faqs = useMemo(
    () => [
      // Getting started
      {
        tab: "getting-started",
        q: "What is KonarCard?",
        a: "KonarCard is a digital business card built for trades and service businesses. Share your details instantly using one link, an NFC tap, or a QR code — no app needed.",
      },
      {
        tab: "getting-started",
        q: "How do I get started?",
        a: "Claim your KonarCard link in seconds, create your profile, and start sharing straight away. You can add your contact info, socials, website, reviews, or booking link.",
      },
      {
        tab: "getting-started",
        q: "Do I need to pay to start?",
        a: "No. You can claim your link and create a basic profile for free. Paid plans unlock extra features and physical NFC cards.",
      },
      {
        tab: "getting-started",
        q: "Who is KonarCard best for?",
        a: "It’s ideal for electricians, plumbers, builders, landscapers, and any service business that wants more calls, more quotes, and easier referrals.",
      },

      // Cards & profiles
      {
        tab: "cards-profiles",
        q: "How does the physical card work?",
        a: "KonarCard cards use NFC. When someone taps your card with their phone, your profile opens instantly. If NFC isn’t supported, they can scan the QR code instead.",
      },
      {
        tab: "cards-profiles",
        q: "Can I update my profile anytime?",
        a: "Yes. Edit your details whenever you like and updates show instantly. No reprinting, no waiting.",
      },
      {
        tab: "cards-profiles",
        q: "What happens if I lose my card?",
        a: "Your profile stays live. You can order a replacement card and link it to the same profile without losing anything.",
      },
      {
        tab: "cards-profiles",
        q: "Does KonarCard work on all phones?",
        a: "Yes. It works on iPhone and Android. Most modern phones support NFC, and QR scanning works on any phone with a camera.",
      },
      {
        tab: "cards-profiles",
        q: "Can I add a booking link, WhatsApp, or reviews?",
        a: "Yes. You can add your preferred contact methods and links — including WhatsApp, website, Google reviews, quote forms, and more.",
      },

      // Pricing & plans
      {
        tab: "pricing",
        q: "What plans are available?",
        a: "There’s a free plan to get started, plus paid plans for extra features and physical cards. See full details on the pricing page.",
      },
      {
        tab: "pricing",
        q: "Can I upgrade or downgrade later?",
        a: "Yes. You can change your plan anytime from your account dashboard.",
      },
      {
        tab: "pricing",
        q: "What happens if I cancel?",
        a: "If you cancel a paid plan, your profile stays accessible, but premium features will no longer be available.",
      },
      {
        tab: "pricing",
        q: "Do you offer refunds or replacements for cards?",
        a: "If there’s a delivery or print issue, we’ll make it right. For order help, message us via live chat or the Contact Us page.",
      },

      // Teams
      {
        tab: "teams",
        q: "Can I create cards for my team?",
        a: "Yes. Team plans let you manage multiple profiles under one account — perfect for companies, crews, and growing businesses.",
      },
      {
        tab: "teams",
        q: "Can I control what my team members can edit?",
        a: "Yes. Team setups can be managed from one place so branding and key details stay consistent.",
      },

      // Technical & support
      {
        tab: "support",
        q: "Do I need an app?",
        a: "No app needed. People tap the card or scan the QR code to open your profile instantly in their browser.",
      },
      {
        tab: "support",
        q: "The tap isn’t working — what should I do?",
        a: "Make sure NFC is enabled and tap the card near the top/back of the phone. If the phone doesn’t support NFC, use the QR code instead.",
      },
      {
        tab: "support",
        q: "How can I contact support?",
        a: "Use live chat or head to the Contact Us page — we’ll reply as fast as possible.",
      },
    ],
    []
  );

  const [activeTab, setActiveTab] = useState("getting-started");
  const [openIndex, setOpenIndex] = useState(0);

  const visibleFaqs = useMemo(
    () => faqs.filter((f) => f.tab === activeTab),
    [faqs, activeTab]
  );

  return (
    <>
      <Navbar />

      <main className="kc-faq">
        {/* Hero */}
        <section className="kc-faq__hero">
          <div className="kc-faq__heroInner">
            <h1 className="h2 kc-faq__title">Frequently Asked Questions</h1>
            <p className="body-s kc-faq__subtitle">
              Everything you need to know before getting started with KonarCard.
            </p>

            <div className="kc-faq__tabs" role="tablist" aria-label="FAQ categories">
              {tabs.map((t) => {
                const isActive = t.key === activeTab;
                return (
                  <button
                    key={t.key}
                    type="button"
                    className={`kc-faq__tab pill ${isActive ? "is-active" : ""}`}
                    onClick={() => {
                      setActiveTab(t.key);
                      setOpenIndex(0);
                    }}
                    role="tab"
                    aria-selected={isActive}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* FAQ list */}
        <section className="kc-faq__listSection">
          <div className="kc-faq__list" role="region" aria-label="FAQs">
            {visibleFaqs.map((item, idx) => {
              const isOpen = idx === openIndex;
              return (
                <div className="kc-faq__item" key={`${item.q}-${idx}`}>
                  <button
                    type="button"
                    className="kc-faq__qRow"
                    onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                    aria-expanded={isOpen}
                  >
                    <span className="h6 kc-faq__q">{item.q}</span>
                    <span className={`kc-faq__chev ${isOpen ? "is-open" : ""}`} aria-hidden="true">
                      ▾
                    </span>
                  </button>

                  {isOpen && <div className="body-s kc-faq__a">{item.a}</div>}
                </div>
              );
            })}
          </div>
        </section>

        {/* Still need help */}
        <section className="kc-faq__help">
          <h2 className="h3 kc-faq__helpTitle">Still need help?</h2>
          <p className="body-s kc-faq__helpSub">
            If you can’t find what you’re looking for, our team is here to help.
          </p>

          <Link to="/contactus" className="kc-faq__helpCta">
            Start A Live Chat
          </Link>
        </section>
      </main>

      <Footer />
    </>
  );
}
