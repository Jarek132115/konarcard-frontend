// frontend/src/pages/website/ContactUs.jsx
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import api from "../../services/api";

/* Global typography/tokens */
import "../../styling/fonts.css";

/* Page CSS */
import "../../styling/contactus.css";

/* Icons */
import ContactIcon from "../../assets/icons/Contact-Icon.svg";
import ChatIcon from "../../assets/icons/Contact-Interface.svg";
import ToolsIcon from "../../assets/icons/ToolBox-Icon.svg";

export default function ContactUs() {
  const [formData, setFormData] = useState({
    firstName: "",
    email: "",
    message: "",
  });

  // Auto-open chat if flagged
  useEffect(() => {
    if (localStorage.getItem("openChatOnLoad") !== "1") return;

    const started = Date.now();
    const tryOpen = () => {
      const ready =
        typeof window !== "undefined" &&
        window.tidioChatApi &&
        typeof window.tidioChatApi.open === "function";

      if (ready) {
        try {
          localStorage.removeItem("openChatOnLoad");
        } catch { }
        window.tidioChatApi.open();
      } else if (Date.now() - started < 5000) {
        setTimeout(tryOpen, 200);
      } else {
        try {
          localStorage.removeItem("openChatOnLoad");
        } catch { }
      }
    };

    tryOpen();
  }, []);

  const quickAnswers = useMemo(
    () => [
      {
        q: "How quickly do you reply?",
        a: "We aim to reply to all messages within one working day. If your message is urgent, live chat during working hours is usually the fastest way to get help.",
      },
      {
        q: "Can you help me set up my profile?",
        a: "Yes. If you’re unsure how to set something up or want to check you’re doing it right, send us a message and we’ll guide you through it step by step.",
      },
      {
        q: "Do I need an account to contact you?",
        a: "No — you don’t need an account to get in touch. Anyone can send us a message using the contact form on this page.",
      },
      {
        q: "Is it okay to finish my profile later?",
        a: "Yes. You can claim your link first and complete your profile later. Your link won’t go anywhere, and you can edit your profile at any time.",
      },
      {
        q: "Is there a phone number I can call?",
        a: "We don’t offer phone support at the moment. Email and live chat are the quickest and most reliable ways to reach us and get help.",
      },
      {
        q: "What should I do if something isn’t working?",
        a: "If something doesn’t look right or isn’t working as expected, send us a message and explain what’s happening. Screenshots help if you have them.",
      },
    ],
    []
  );

  const [openIndex, setOpenIndex] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.firstName || !formData.email || !formData.message) {
      toast.error("Please fill in all fields.");
      return;
    }

    try {
      const res = await api.post("/contact", {
        name: formData.firstName,
        email: formData.email,
        message: formData.message,
        reason: "Contact Page",
        agree: true,
      });

      if (res.data?.success) {
        toast.success("Message sent!");
        setFormData({ firstName: "", email: "", message: "" });
      } else {
        toast.error(res.data?.error || "Something went wrong");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to send message.");
    }
  };

  return (
    <>
      <Navbar />

      <main className="kc-contact">
        {/* HERO (match FAQ spacing/typography) */}
        <section className="kc-contact__hero">
          <div className="kc-contact__heroInner">
            <h1 className="h2 kc-contact__title">We’re Here To Help</h1>
            <p className="body-s kc-contact__subtitle">
              Questions, support, or partnerships — get in touch.
            </p>

            {/* CONTACT OPTIONS */}
            <div className="kc-contact__cards">
              <div className="kc-contact__card">
                <div className="kc-contact__cardIcon">
                  <img src={ContactIcon} alt="" aria-hidden="true" />
                </div>
                <p className="h6 kc-contact__cardTitle">Email us</p>
                <p className="body-s kc-contact__cardText">
                  Email us — we usually reply within one working day.
                </p>
                <a className="kc-contact__cardLink" href="mailto:supportteam@konarcard.com">
                  supportteam@konarcard.com
                </a>
              </div>

              <div className="kc-contact__card">
                <div className="kc-contact__cardIcon">
                  <img src={ChatIcon} alt="" aria-hidden="true" />
                </div>
                <p className="h6 kc-contact__cardTitle">Live chat</p>
                <p className="body-s kc-contact__cardText">
                  Chat with our team during working hours for quick help.
                </p>
                <button
                  type="button"
                  className="kc-contact__cardLink kc-contact__cardButton"
                  onClick={() => window.tidioChatApi && window.tidioChatApi.open()}
                >
                  Start Live Chat
                </button>
              </div>

              <div className="kc-contact__card">
                <div className="kc-contact__cardIcon">
                  <img src={ToolsIcon} alt="" aria-hidden="true" />
                </div>
                <p className="h6 kc-contact__cardTitle">Support available 24/7</p>
                <p className="body-s kc-contact__cardText">
                  You can email us anytime — we’ll get back to you as soon as possible.
                </p>
                <button
                  type="button"
                  className="kc-contact__cardLink kc-contact__cardButton"
                  onClick={() => {
                    const el = document.getElementById("kc-contact-form");
                    el?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                >
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* FORM */}
        <section className="kc-contact__formSection" id="kc-contact-form">
          <div className="kc-contact__formWrap">
            <h2 className="h3 kc-contact__sectionTitle">Or send us a message</h2>
            <p className="body-s kc-contact__sectionSub">
              Fill in the form below and we’ll get back to you as soon as we can.
            </p>

            <form className="kc-contact__form" onSubmit={handleSubmit}>
              <div className="kc-contact__row2">
                <div className="kc-contact__field">
                  <label className="kc-contact__label" htmlFor="firstName">
                    First name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    className="kc-contact__input"
                    placeholder="Enter your name"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="kc-contact__field">
                  <label className="kc-contact__label" htmlFor="email">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="kc-contact__input"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="kc-contact__field">
                <label className="kc-contact__label" htmlFor="message">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  className="kc-contact__textarea"
                  placeholder="Enter your message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </div>

              <button type="submit" className="kc-contact__submit">
                Send Message
              </button>
            </form>
          </div>
        </section>

        {/* FAQ STYLE QUICK ANSWERS (same as FAQ page) */}
        <section className="kc-contact__faq">
          <div className="kc-contact__faqInner">
            <h2 className="h3 kc-contact__sectionTitle">Quick answers</h2>
            <p className="body-s kc-contact__sectionSub">
              Common questions people ask before they message us.
            </p>

            <div className="kc-contact__faqList" role="region" aria-label="Quick answers">
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
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
