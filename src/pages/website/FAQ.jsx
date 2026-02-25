// frontend/src/pages/website/FAQPage.jsx
import React, { useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

import "../../styling/fonts.css";
import "../../styling/pricingpage/pricingpagehero.css";
import "../../styling/productspage/productspagefaq.css";
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
      {
        tab: "getting-started",
        q: "What is KonarCard?",
        a: "KonarCard is a digital business card built for trades and service businesses. Share your details instantly using one link, an NFC tap, or a QR code — no app needed.",
      },
      {
        tab: "getting-started",
        q: "How do I get started?",
        a: "Claim your KonarCard link in seconds, create your profile, and start sharing straight away.",
      },
      {
        tab: "getting-started",
        q: "Do I need to pay to start?",
        a: "No. You can claim your link and create a basic profile for free.",
      },
      {
        tab: "getting-started",
        q: "Who is KonarCard best for?",
        a: "Ideal for electricians, plumbers, builders, landscapers and service businesses.",
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

  const openLiveChat = () => {
    toast.success("Opening live chat...");
  };

  return (
    <>
      <Navbar />

      <main className="kc-faqPage kc-page">

        {/* ✅ ONE unified FAQ section */}
        <section className="kc-faqUnified">

          {/* HERO */}
          <div className="pr-container pr-hero__inner">
            <div className="pr-heroCopyGrid">
              <p className="kc-pill pr-heroPill">Help centre</p>

              <h1 className="h2 pr-title">
                Frequently <span className="pr-accent">Asked</span> Questions
              </h1>

              <p className="kc-subheading pr-sub">
                Everything you need to know before getting started with KonarCard.
              </p>

              <div className="kc-faqTabs" role="tablist">
                {tabs.map((t) => {
                  const isActive = t.key === activeTab;
                  return (
                    <button
                      key={t.key}
                      type="button"
                      className={`kc-tabPill ${isActive ? "is-active" : ""}`}
                      onClick={() => {
                        setActiveTab(t.key);
                        setOpenIndex(0);
                      }}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* FAQ LIST */}
          <div className="kpfq__inner kc-faqListOnly">
            <div className="kpfq__list">
              {visibleFaqs.map((item, idx) => {
                const isOpen = idx === openIndex;
                return (
                  <div className="kpfq__item" key={`${item.q}-${idx}`}>
                    <button
                      type="button"
                      className="kpfq__qRow"
                      onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                      aria-expanded={isOpen}
                    >
                      <span className="kc-title kpfq__q">{item.q}</span>
                      <span className={`kpfq__chev ${isOpen ? "is-open" : ""}`}>
                        ▾
                      </span>
                    </button>

                    {isOpen && <div className="body kpfq__a">{item.a}</div>}
                  </div>
                );
              })}
            </div>

            <div className="kpfq__cta">
              <p className="body-s kpfq__ctaText">
                Still need help? We’re happy to help.
              </p>

              <button onClick={openLiveChat} className="kx-btn kx-btn--black">
                Start Live Chat
              </button>
            </div>
          </div>

        </section>

      </main>

      <Footer />
    </>
  );
}