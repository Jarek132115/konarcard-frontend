// frontend/src/pages/FAQ/index.jsx
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import "./faq.css";

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
        a: "KonarCard is a digital business card that lets you share your contact details, links, and information using one simple link, NFC tap, or QR code. No app required.",
      },
      {
        tab: "getting-started",
        q: "How do I get started?",
        a: "You can claim your unique KonarCard link in seconds. Once claimed, you can create an account to customise your profile, add details, and start sharing straight away.",
      },
      {
        tab: "getting-started",
        q: "Do I need to pay to start?",
        a: "No. You can claim your link and create a basic profile for free. Paid plans are available if you want additional features or physical NFC cards.",
      },

      // Cards & profiles
      {
        tab: "cards-profiles",
        q: "How does the physical card work?",
        a: "The KonarCard uses NFC technology. When someone taps it with their phone, your digital profile opens instantly. Phones that don’t support NFC can scan the QR code instead.",
      },
      {
        tab: "cards-profiles",
        q: "Can I update my profile anytime?",
        a: "Yes. You can edit your details at any time, and changes update instantly. There’s no need to reprint or replace your card.",
      },
      {
        tab: "cards-profiles",
        q: "What happens if I lose my card?",
        a: "Your profile stays active. You can order a replacement card and link it to the same profile without losing any information.",
      },
      {
        tab: "cards-profiles",
        q: "Does KonarCard work on all phones?",
        a: "Yes. KonarCard works on iPhone and Android devices. NFC is supported on most modern phones, and QR codes work on all devices with a camera.",
      },

      // Pricing & plans
      {
        tab: "pricing",
        q: "What plans are available?",
        a: "KonarCard offers both free and paid plans. Paid plans unlock additional features and physical cards. You can view full pricing on the pricing page.",
      },
      {
        tab: "pricing",
        q: "Can I upgrade or downgrade later?",
        a: "Yes. You can change your plan at any time from your account dashboard.",
      },
      {
        tab: "pricing",
        q: "What happens if I cancel?",
        a: "If you cancel a paid plan, your profile remains accessible, but premium features will no longer be available.",
      },

      // Teams
      {
        tab: "teams",
        q: "Can I create cards for my team?",
        a: "Yes. Team plans allow you to manage multiple profiles under one account — perfect for businesses and crews.",
      },

      // Technical & support
      {
        tab: "support",
        q: "Do I need an app?",
        a: "No app needed. People can tap the card or scan the QR code to open your profile instantly.",
      },
      {
        tab: "support",
        q: "I’m having trouble with a tap — what should I do?",
        a: "Try enabling NFC in your phone settings and tap near the top/back of the phone. If the phone doesn’t support NFC, use the QR code instead.",
      },
      {
        tab: "support",
        q: "How can I contact support?",
        a: "Use live chat on the site or contact us via the Contact Us page — our team is here to help.",
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
        <section className="kc-faq__hero">
          <div className="kc-faq__heroInner">
            <h1 className="kc-faq__title">Frequently Asked Questions</h1>
            <p className="kc-faq__subtitle">
              Everything you need to know before getting started with KonarCard.
            </p>

            <div className="kc-faq__tabs" role="tablist" aria-label="FAQ categories">
              {tabs.map((t) => {
                const isActive = t.key === activeTab;
                return (
                  <button
                    key={t.key}
                    type="button"
                    className={`kc-faq__tab ${isActive ? "is-active" : ""}`}
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

        <section className="kc-faq__listSection">
          <div className="kc-faq__list">
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
                    <span className="kc-faq__q">{item.q}</span>
                    <span className={`kc-faq__chev ${isOpen ? "is-open" : ""}`} aria-hidden="true">
                      ▾
                    </span>
                  </button>

                  {isOpen && <div className="kc-faq__a">{item.a}</div>}
                </div>
              );
            })}
          </div>
        </section>

        <section className="kc-faq__help">
          <h2 className="kc-faq__helpTitle">Still need help?</h2>
          <p className="kc-faq__helpSub">
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
