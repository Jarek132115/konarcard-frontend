import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

import "../../styling/fonts.css";
import "../../styling/contactus.css";

import ContactIcon from "../../assets/icons/Contact-Icon.svg";
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

      <main className="kc-contact kc-page">
        {/* HERO */}
        <section className="kc-contact__hero" aria-label="Contact hero">
          <div className="kc-contact__heroInner">
            {/* Grid ONLY around heading/subheading area */}
            <div className="kc-contact__heroGrid">
              <div className="kc-pill kc-contact__pill" aria-label="Contact page label">
                Contact
              </div>

              <h1 className="h2 kc-contact__title">We’re here to help</h1>

              <p className="body-s kc-contact__subtitle">
                Live chat is the quickest way to get support. Email is available anytime.
              </p>
            </div>

            {/* Cards OUTSIDE grid */}
            <div className="kc-contact__cards" role="list" aria-label="Contact options">
              <article className="kc-contact__card kc-contact__card--orange" role="listitem">
                <div className="kc-contact__iconWrap" aria-hidden="true">
                  <img className="kc-contact__icon kc-contact__icon--white" src={ChatIcon} alt="" />
                </div>

                <p className="h6 kc-contact__cardTitle">Live chat (fastest)</p>
                <p className="body-s kc-contact__cardText">
                  Quick help during working hours. Best for setup questions and fixes.
                </p>

                <button type="button" className="kx-btn kx-btn--white kc-contact__cardBtn" onClick={openChat}>
                  Start live chat
                </button>

                <p className="body-xs kc-contact__cardHint">
                  Tip: Include a screenshot if something isn’t working.
                </p>
              </article>

              <article className="kc-contact__card kc-contact__card--plain" role="listitem">
                <div className="kc-contact__iconWrap" aria-hidden="true">
                  <img className="kc-contact__icon" src={ContactIcon} alt="" />
                </div>

                <p className="h6 kc-contact__cardTitle">Email</p>
                <p className="body-s kc-contact__cardText">
                  We aim to reply within one working day with helpful and clear guidance.
                </p>


                <a
                  className="kx-btn kx-btn--white kc-contact__cardBtn kc-contact__cardBtn--outlined"
                  href="mailto:supportteam@konarcard.com"
                >
                  Send email
                </a>

                <p className="body-xs kc-contact__cardHint">
                  Best for non-urgent questions and partnerships.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* QUICK ANSWERS */}
        <section className="kc-contact__faq" aria-label="Quick answers">
          <div className="kc-contact__container">
            <header className="kc-contact__faqHead">
              <h2 className="h3 kc-contact__sectionTitle">Quick answers</h2>
              <p className="body-s kc-contact__sectionSub">
                Common questions people ask before reaching out.
              </p>
            </header>

            <div className="kc-contact__faqList" role="region" aria-label="Contact FAQs">
              {quickAnswers.map((item, idx) => {
                const isOpen = idx === openIndex;

                return (
                  <div className="kc-contact__faqItem" key={`${item.q}-${idx}`}>
                    <button
                      type="button"
                      className="kc-contact__qRow"
                      onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                      aria-expanded={isOpen}
                    >
                      <span className="h6 kc-contact__q">{item.q}</span>
                      <span className={`kc-contact__chev ${isOpen ? "is-open" : ""}`} aria-hidden="true">
                        ▾
                      </span>
                    </button>

                    {isOpen && <div className="body-s kc-contact__a">{item.a}</div>}
                  </div>
                );
              })}
            </div>

            <div className="kc-contact__faqCta">
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
