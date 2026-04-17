// frontend/src/pages/website/Policies.jsx
import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Home/Footer";
import DotIcon from "../../assets/icons/Dot-Icon.svg";
import RightArrow from "../../assets/icons/RightArrow.svg";

import "../../styling/fonts.css";
import "../../styling/policies.css";

import { useSeo } from "../../utils/seo";

/* ── Animation ease ────────────────────────────────────────── */
const EASE = [0.22, 1, 0.36, 1];

const LAST_UPDATED = "13 April 2026";
const SUPPORT_EMAIL = "supportteam@konarcard.com";

/* ── Open Tidio ────────────────────────────────────────────── */
function openLiveChat(e) {
    e.preventDefault();
    if (window.tidioChatApi && typeof window.tidioChatApi.open === "function") {
        window.tidioChatApi.open();
    }
}

/* ── Dot list item helper ──────────────────────────────────── */
function Li({ src, children }) {
    return (
        <li>
            <img src={src} alt="" className="kc-pol__dot" aria-hidden="true" />
            <span>{children}</span>
        </li>
    );
}

/* ── Policy nav list ───────────────────────────────────────── */
const POLICIES = [
    { key: "delivery", label: "Delivery" },
    { key: "returns", label: "Returns" },
    { key: "warranty", label: "Warranty" },
    { key: "privacy", label: "Privacy Policy" },
    { key: "cookies", label: "Cookie Policy" },
    { key: "terms", label: "Terms of Service" },
];

/* ─────────────────────────────────────────────────────────────
   DELIVERY
   ───────────────────────────────────────────────────────────── */
function DeliveryPolicy({ dot }) {
    return (
        <div className="kc-pol__content">
            <header className="kc-pol__head">
                <h1 className="h2 kc-pol__title">Delivery Policy</h1>
                <p className="kc-pol__updated">Last updated: {LAST_UPDATED}</p>
                <p className="body kc-pol__lead">
                    Everything you need to know about how your KonarCard reaches you. Free delivery, Royal Mail Next Day, UK addresses only.
                </p>
            </header>

            <div className="kc-pol__block">
                <p className="kc-pol__h">Where we deliver</p>
                <p className="body kc-pol__p">
                    We currently deliver to addresses within the United Kingdom only.
                </p>
            </div>

            <div className="kc-pol__block">
                <p className="kc-pol__h">Cost</p>
                <p className="body kc-pol__p">
                    Delivery is always free. No minimum order. No hidden charges.
                </p>
            </div>

            <div className="kc-pol__block">
                <p className="kc-pol__h">How we ship</p>
                <p className="body kc-pol__p">
                    Every order is sent via Royal Mail Next Day Delivery.
                </p>
            </div>

            <div className="kc-pol__block">
                <p className="kc-pol__h">When your order ships</p>
                <p className="body kc-pol__p">
                    If you place your order before 1pm on a working day, we aim to dispatch it the same day. Your card should arrive the following day. Orders placed after 1pm will be dispatched the next working day and should arrive the day after that.
                </p>
            </div>

            <div className="kc-pol__block">
                <p className="kc-pol__h">If your order goes missing</p>
                <p className="body kc-pol__p">
                    If your card does not arrive within 3 working days of your expected delivery date, contact us. We will either send you a replacement card at no charge or give you a full refund, whichever you prefer.
                </p>
            </div>

            <div className="kc-pol__block">
                <p className="kc-pol__h">Please note</p>
                <p className="body kc-pol__p">
                    Delivery times are estimates based on Royal Mail's service. Occasionally delays occur that are outside our control. If you have not received your order within 5 working days, get in touch and we will sort it out.
                </p>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────
   RETURNS
   ───────────────────────────────────────────────────────────── */
function ReturnsPolicy({ dot }) {
    return (
        <div className="kc-pol__content">
            <header className="kc-pol__head">
                <h1 className="h2 kc-pol__title">Returns Policy</h1>
                <p className="kc-pol__updated">Last updated: {LAST_UPDATED}</p>
                <p className="body kc-pol__lead">
                    If your KonarCard isn't right for you, you can return it within 30 days for a full refund.
                </p>
            </header>

            <div className="kc-pol__block">
                <p className="kc-pol__h">30 day returns</p>
                <p className="body kc-pol__p">
                    If you are not happy with your KonarCard for any reason, you can return it within 30 days of receiving it for a full refund. No questions asked.
                </p>
            </div>

            <div className="kc-pol__block">
                <p className="kc-pol__h">How to return</p>
                <p className="body kc-pol__p">
                    Contact us at <strong>{SUPPORT_EMAIL}</strong> and let us know you would like to return your card. We will give you the return address and instructions.
                </p>
            </div>

            <div className="kc-pol__block">
                <p className="kc-pol__h">Return postage</p>
                <p className="body kc-pol__p">
                    You are responsible for the cost of returning the card to us. We recommend using a tracked service as we cannot be responsible for returns that go missing in the post.
                </p>
            </div>

            <div className="kc-pol__block">
                <p className="kc-pol__h">Refunds</p>
                <p className="body kc-pol__p">
                    Once we receive your returned card in its original condition, we will process your refund within 5 working days. The refund will go back to the original payment method.
                </p>
            </div>

            <div className="kc-pol__block">
                <p className="kc-pol__h">Condition</p>
                <p className="body kc-pol__p">
                    Cards must be returned in their original, undamaged condition. Cards that have been modified, cut, or physically altered cannot be returned.
                </p>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────
   WARRANTY
   ───────────────────────────────────────────────────────────── */
function WarrantyPolicy({ dot }) {
    return (
        <div className="kc-pol__content">
            <header className="kc-pol__head">
                <h1 className="h2 kc-pol__title">Warranty Policy</h1>
                <p className="kc-pol__updated">Last updated: {LAST_UPDATED}</p>
                <p className="body kc-pol__lead">
                    Every KonarCard comes with a 12 month warranty. If it stops working under normal use, we will replace it for free.
                </p>
            </header>

            <div className="kc-pol__block">
                <p className="kc-pol__h">What is covered</p>
                <p className="body kc-pol__p">
                    Every KonarCard comes with a 12 month warranty from the date of purchase. If your card stops working under normal use within that 12 month period, we will replace it completely free of charge, including free delivery.
                </p>
            </div>

            <div className="kc-pol__block">
                <p className="kc-pol__h">What normal use means</p>
                <p className="body kc-pol__p">
                    Your KonarCard is built to be durable. It is designed to live in your wallet, be carried on site, and be used in the kinds of environments tradespeople work in every day. Tapping it to phones, carrying it in your back pocket, and using it in all weathers is exactly what it is made for.
                </p>
            </div>

            <div className="kc-pol__block">
                <p className="kc-pol__h">What is not covered</p>
                <p className="body kc-pol__p">The warranty does not cover damage caused by:</p>
                <ul className="kc-pol__ul">
                    <Li src={dot}>Cutting, drilling, or attempting to open the card</Li>
                    <Li src={dot}>Removing or attempting to remove the NFC chip</Li>
                    <Li src={dot}>Physically modifying the card in any way</Li>
                    <Li src={dot}>Deliberately bending or snapping the card</Li>
                    <Li src={dot}>Any attempt to alter, clone or tamper with the card's technology</Li>
                </ul>
                <p className="body kc-pol__p">
                    If it is clear that the card has been modified or tampered with, we are not able to offer a free replacement under warranty.
                </p>
            </div>

            <div className="kc-pol__block">
                <p className="kc-pol__h">Lost cards</p>
                <p className="body kc-pol__p">
                    If you lose your card, the warranty does not cover replacement. You can order a new card at any time from our website. Your digital profile stays active and will work with any new card you link to it.
                </p>
            </div>

            <div className="kc-pol__block">
                <p className="kc-pol__h">After 12 months</p>
                <p className="body kc-pol__p">
                    Normal wear and tear after 12 months is not covered under warranty. Cards are built to last well beyond this period under normal use, but if a card stops working after the 12 month warranty period has ended, you can order a replacement card at the standard price. Your profile and all your information will remain intact.
                </p>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────
   PRIVACY
   ───────────────────────────────────────────────────────────── */
function PrivacyPolicy({ dot }) {
    return (
        <div className="kc-pol__content">
            <header className="kc-pol__head">
                <h1 className="h2 kc-pol__title">Privacy Policy</h1>
                <p className="kc-pol__updated">Last updated: {LAST_UPDATED}</p>
                <p className="body kc-pol__lead">
                    KonarCard takes your privacy seriously. This section explains what information we collect, how we use it and your rights under UK GDPR.
                </p>
            </header>

            <div className="kc-pol__block">
                <p className="kc-pol__h">What we collect</p>
                <ul className="kc-pol__ul">
                    <Li src={dot}>Your name and email address when you create an account</Li>
                    <Li src={dot}>Your business details when you set up your profile</Li>
                    <Li src={dot}>Your delivery address when you place an order</Li>
                    <Li src={dot}>Payment information processed securely through Stripe. We never store your full card details</Li>
                    <Li src={dot}>Usage data such as how many times your profile has been viewed or tapped</Li>
                </ul>
            </div>

            <div className="kc-pol__block">
                <p className="kc-pol__h">How we use it</p>
                <ul className="kc-pol__ul">
                    <Li src={dot}>To manage your account and profile</Li>
                    <Li src={dot}>To process and fulfil your order</Li>
                    <Li src={dot}>To send you order and delivery updates</Li>
                    <Li src={dot}>To provide customer support</Li>
                    <Li src={dot}>To improve our service through anonymised analytics</Li>
                </ul>
            </div>

            <div className="kc-pol__block">
                <p className="kc-pol__h">Who we share it with</p>
                <p className="body kc-pol__p">
                    We do not sell your personal data. We share information only with trusted third-party services that help us operate, including Stripe for payment processing, Royal Mail for delivery, and our hosting and analytics providers. All third parties are bound by data processing agreements.
                </p>
            </div>

            <div className="kc-pol__block">
                <p className="kc-pol__h">Your rights</p>
                <p className="body kc-pol__p">
                    Under UK GDPR you have the right to access, correct or delete your personal data at any time. To exercise any of these rights, contact us at <strong>{SUPPORT_EMAIL}</strong>.
                </p>
            </div>

            <div className="kc-pol__block">
                <p className="kc-pol__h">Cookies</p>
                <p className="body kc-pol__p">
                    We use cookies to keep you logged in and to understand how people use our site. You can manage cookie preferences through your browser settings. See our Cookie Policy for full details.
                </p>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────
   COOKIES
   ───────────────────────────────────────────────────────────── */
function CookiesPolicy({ dot }) {
    return (
        <div className="kc-pol__content">
            <header className="kc-pol__head">
                <h1 className="h2 kc-pol__title">Cookie Policy</h1>
                <p className="kc-pol__updated">Last updated: {LAST_UPDATED}</p>
                <p className="body kc-pol__lead">
                    We use a small number of cookies on konarcard.com. Here is what they do and how to manage them.
                </p>
            </header>

            <div className="kc-pol__block">
                <p className="kc-pol__h">Essential cookies</p>
                <p className="body kc-pol__p">
                    Required for the site to function. These keep you logged in and remember your session. They cannot be turned off.
                </p>
            </div>

            <div className="kc-pol__block">
                <p className="kc-pol__h">Analytics cookies</p>
                <p className="body kc-pol__p">
                    We use anonymised analytics to understand how visitors use the site, which pages are most visited, how long people spend on them and where they come from. This data does not identify you personally.
                </p>
            </div>

            <div className="kc-pol__block">
                <p className="kc-pol__h">Managing cookies</p>
                <p className="body kc-pol__p">
                    You can disable non-essential cookies at any time through your browser settings. This will not affect your ability to use KonarCard.
                </p>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────
   TERMS
   ───────────────────────────────────────────────────────────── */
function TermsPolicy({ dot }) {
    return (
        <div className="kc-pol__content">
            <header className="kc-pol__head">
                <h1 className="h2 kc-pol__title">Terms of Service</h1>
                <p className="kc-pol__updated">Last updated: {LAST_UPDATED}</p>
                <p className="body kc-pol__lead">
                    By using konarcard.com and purchasing a KonarCard, you agree to the following terms.
                </p>
            </header>

            <div className="kc-pol__block">
                <p className="kc-pol__h">Your account</p>
                <p className="body kc-pol__p">
                    You are responsible for keeping your login details secure. Do not share your account with others.
                </p>
            </div>

            <div className="kc-pol__block">
                <p className="kc-pol__h">Your profile</p>
                <p className="body kc-pol__p">
                    You are responsible for the content you add to your profile. Do not add anything that is false, misleading, offensive or illegal.
                </p>
            </div>

            <div className="kc-pol__block">
                <p className="kc-pol__h">The card</p>
                <p className="body kc-pol__p">
                    The physical NFC card remains the property of the customer once purchased. The digital profile is provided as a service by KonarCard.
                </p>
            </div>

            <div className="kc-pol__block">
                <p className="kc-pol__h">Acceptable use</p>
                <p className="body kc-pol__p">
                    KonarCard is designed for sharing your own professional contact details and services. Using it to impersonate someone else, collect other people's data without consent, or for any unlawful purpose is not permitted and may result in your account being suspended.
                </p>
            </div>

            <div className="kc-pol__block">
                <p className="kc-pol__h">Changes to the service</p>
                <p className="body kc-pol__p">
                    We may update features, pricing or these terms from time to time. We will notify you of any significant changes by email.
                </p>
            </div>

            <div className="kc-pol__block">
                <p className="kc-pol__h">Governing law</p>
                <p className="body kc-pol__p">
                    These terms are governed by the laws of England and Wales.
                </p>
            </div>
        </div>
    );
}

function renderPolicy(key, dot) {
    switch (key) {
        case "delivery": return <DeliveryPolicy dot={dot} />;
        case "returns":  return <ReturnsPolicy dot={dot} />;
        case "warranty": return <WarrantyPolicy dot={dot} />;
        case "privacy":  return <PrivacyPolicy dot={dot} />;
        case "cookies":  return <CookiesPolicy dot={dot} />;
        case "terms":    return <TermsPolicy dot={dot} />;
        default:         return null;
    }
}

export default function Policies() {
    useSeo({
        path: "/policies",
        title: "KonarCard Policies | Delivery, Returns & Privacy",
        description:
            "Read KonarCard's delivery, returns, warranty, privacy, cookie and terms policies. UK delivery, 30 day returns and a 12 month warranty on every card.",
    });

    const [activePolicy, setActivePolicy] = useState("delivery");

    return (
        <>
            <Navbar />

            <main className="kc-pol kc-page">

                {/* ── TWO-COLUMN LAYOUT ────────────────────────────── */}
                <section className="kc-pol__wrap">
                    <div className="kc-pol__grid">

                        {/* Sidebar */}
                        <aside className="kc-pol__left" aria-label="Policy navigation">
                            <div className="kc-pol__side">
                                <div className="kc-pol__sideCard">
                                    <p className="kc-pol__sideTitle">Policies</p>

                                    <ul className="kc-pol__sideList">
                                        {POLICIES.map((p) => (
                                            <li key={p.key}>
                                                <button
                                                    type="button"
                                                    className={`kc-pol__sideBtn${activePolicy === p.key ? " is-active" : ""}`}
                                                    onClick={() => setActivePolicy(p.key)}
                                                    aria-current={activePolicy === p.key ? "page" : undefined}
                                                >
                                                    <span className="kc-pol__sideLabel">{p.label}</span>
                                                    <img
                                                        src={RightArrow}
                                                        alt=""
                                                        className="kc-pol__sideArrowIcon"
                                                        aria-hidden="true"
                                                    />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="kc-pol__sideCard kc-pol__contactCard">
                                    <p className="kc-pol__sideTitle">Need help?</p>
                                    <p className="kc-pol__contactText">
                                        Got a question about any of these policies? Live chat or email us, we reply within one working day.
                                    </p>

                                    <a
                                        className="kc-pol__contactLink"
                                        href="#livechat"
                                        onClick={openLiveChat}
                                    >
                                        Start live chat
                                    </a>

                                    <a
                                        className="kc-pol__contactLink"
                                        href={`mailto:${SUPPORT_EMAIL}`}
                                    >
                                        {SUPPORT_EMAIL}
                                    </a>
                                </div>
                            </div>
                        </aside>

                        {/* Policy content */}
                        <section className="kc-pol__right">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activePolicy}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -6 }}
                                    transition={{ duration: 0.28, ease: EASE }}
                                >
                                    {renderPolicy(activePolicy, DotIcon)}
                                </motion.div>
                            </AnimatePresence>
                        </section>

                    </div>
                </section>

            </main>

            <Footer />
        </>
    );
}
