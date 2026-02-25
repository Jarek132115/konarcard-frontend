// frontend/src/pages/website/ContactUs.jsx
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

import "../../styling/fonts.css";

/* ✅ reuse same hero system as pricing */
import "../../styling/pricingpage/pricingpagehero.css";

/* ✅ contact page styles */
import "../../styling/contactus.css";

import ContactIcon from "../../assets/icons/ChatIcon.svg";
import ChatIcon from "../../assets/icons/Contact-Interface.svg";

export default function ContactUs() {
  useEffect(() => {
    if (localStorage.getItem("openChatOnLoad") !== "1") return;

    const started = Date.now();
    const tryOpen = () => {
      const ready =
        typeof window !== "undefined" &&
        window.tidioChatApi &&
        typeof window.tidioChatApi.open === "function";

      if (ready) {
        localStorage.removeItem("openChatOnLoad");
        window.tidioChatApi.open();
      } else if (Date.now() - started < 5000) {
        setTimeout(tryOpen, 200);
      }
    };

    tryOpen();
  }, []);

  const quickAnswers = useMemo(
    () => [
      {
        q: "How quickly do you reply?",
        a: "Live chat during working hours is the fastest way to get help. If you email us, we aim to reply within one working day.",
      },
      { q: "Can you help me set up my profile?", a: "Yes — live chat is best for this. We’ll guide you step by step." },
      { q: "Do I need an account to contact you?", a: "No. Anyone can contact us." },
      { q: "Is it okay to finish my profile later?", a: "Yes. You can claim your link first and complete your profile later." },
      {
        q: "Is there a phone number I can call?",
        a: "We don’t offer phone support at the moment. Live chat and email are the quickest options.",
      },
      {
        q: "What should I do if something isn’t working?",
        a: "Use live chat and include a screenshot if possible — it helps us fix things faster.",
      },
    ],
    []
  );

  const [openIndex, setOpenIndex] = useState(0);

  const openChat = () => {
    const started = Date.now();

    const tryOpen = () => {
      const ready =
        typeof window !== "undefined" &&
        window.tidioChatApi &&
        typeof window.tidioChatApi.open === "function";

      if (ready) window.tidioChatApi.open();
      else if (Date.now() - started < 5000) setTimeout(tryOpen, 200);
      else toast.error("Live chat is still loading — please try again shortly.");
    };

    tryOpen();
  };

  return (
    <>
      <Navbar />

      <main className="kc-contactPage kc-page">
        {/* ✅ HERO (same structure/classes as pricing hero) */}
        <section className="pr-hero kc-contactHero" aria-label="Contact hero">
          <div className="pr-container pr-hero__inner">
            <div className="pr-heroCopyGrid">
              <p className="kc-pill pr-heroPill">Contact</p>

              <h1 className="h2 pr-title">We’re here to help</h1>

              <p className="kc-subheading pr-sub">
                Live chat is the quickest way to get support. Email is available anytime.
              </p>
            </div>

            {/* ✅ Cards OUTSIDE the grid background */}
            <div className="kc-contactCards" role="list" aria-label="Contact options">
              {/* LIVE CHAT */}
              <article className="kc-contactCard" role="listitem">
                <div className="kc-contactIconWrap" aria-hidden="true">
                  <img className="kc-contactIcon" src={ContactIcon} alt="" />
                </div>

                <p className="h6 kc-contactCardTitle">Live chat (fastest)</p>
                <p className="body-s kc-contactCardText">
                  Quick help during working hours. Best for setup questions and fixes.
                </p>

                <button type="button" className="kx-btn kx-btn--black kc-contactCardBtn" onClick={openChat}>
                  Start live chat
                </button>

                <p className="body-xs kc-contactCardHint">Tip: Include a screenshot if something isn’t working.</p>
              </article>

              {/* EMAIL */}
              <article className="kc-contactCard" role="listitem">
                <div className="kc-contactIconWrap" aria-hidden="true">
                  <img className="kc-contactIcon" src={ChatIcon} alt="" />
                </div>

                <p className="h6 kc-contactCardTitle">Email</p>
                <p className="body-s kc-contactCardText">
                  We aim to reply within one working day with helpful and clear guidance.
                </p>

                <a className="kx-btn kx-btn--white kc-contactCardBtn kc-contactCardBtn--outlined" href="mailto:supportteam@konarcard.com">
                  Send email
                </a>

                <p className="body-xs kc-contactCardHint">Best for non-urgent questions and partnerships.</p>
              </article>
            </div>
          </div>
        </section>

        {/* QUICK ANSWERS (divider list style) */}
        <section className="kc-contactFaq" aria-label="Quick answers">
          <div className="kc-contactFaqInner">
            <header className="kc-contactFaqHead">
              <p className="kc-pill kc-contactFaqPill">Quick answers</p>
              <h2 className="h3 kc-contactFaqTitle">Quick answers</h2>
              <p className="kc-subheading kc-contactFaqSub">Common questions people ask before reaching out.</p>
            </header>

            <div className="kc-contactFaqList" role="region" aria-label="Contact FAQs">
              {quickAnswers.map((item, idx) => {
                const isOpen = idx === openIndex;

                return (
                  <div className="kc-contactFaqItem" key={`${item.q}-${idx}`}>
                    <button
                      type="button"
                      className="kc-contactFaqQRow"
                      onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                      aria-expanded={isOpen}
                    >
                      <span className="kc-title kc-contactFaqQ">{item.q}</span>
                      <span className={`kc-contactFaqChev ${isOpen ? "is-open" : ""}`} aria-hidden="true">
                        ▾
                      </span>
                    </button>

                    {isOpen && <div className="body kc-contactFaqA">{item.a}</div>}
                  </div>
                );
              })}
            </div>

            <div className="kc-contactFaqCta">
              <Link to="/faqs" className="kx-btn kx-btn--black">
                Read more FAQs
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}