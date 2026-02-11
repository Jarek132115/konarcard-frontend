// frontend/src/components/Home/FAQ.jsx
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../../styling/home/faq.css";

const CATS = [
    { key: "getting-started", label: "Getting started" },
    { key: "cards-profiles", label: "Cards & profiles" },
    { key: "pricing-plans", label: "Pricing & plans" },
    { key: "teams", label: "Teams" },
    { key: "support", label: "Technical & support" },
];

export default function FAQ() {
    const [activeCat, setActiveCat] = useState("getting-started");
    const [openId, setOpenId] = useState("what-is-konarcard");

    const faqs = useMemo(
        () => [
            // ======================
            // Getting started
            // ======================
            {
                id: "what-is-konarcard",
                cat: "getting-started",
                q: "What is KonarCard?",
                a: (
                    <>
                        KonarCard is a <strong>digital business card</strong> built for UK trades and small businesses.
                        You share your profile instantly using an <strong>NFC business card</strong> tap, a QR scan, or a simple link —
                        no app needed. Your details stay up to date, so you don’t lose work because of old phone numbers or emails.
                    </>
                ),
            },
            {
                id: "how-do-i-get-started",
                cat: "getting-started",
                q: "How do I get started?",
                a: (
                    <>
                        Create your free profile, claim your link, and add your contact details, services, photos, and reviews.
                        When you’re ready, you can order a card (plastic or metal) or a key tag. Start here:{" "}
                        <Link to="/register">create your profile</Link>.
                    </>
                ),
            },
            {
                id: "do-i-need-to-pay-to-start",
                cat: "getting-started",
                q: "Do I need to pay to start?",
                a: (
                    <>
                        No — you can start free. Build your profile and share your link right away. If you want tap-to-share,
                        you can purchase an NFC product like the <Link to="/products/plastic-card">Plastic Card</Link>,{" "}
                        <Link to="/products/metal-card">Metal Card</Link>, or <Link to="/products/konartag">KonarTag</Link>.
                    </>
                ),
            },
            {
                id: "who-is-it-best-for",
                cat: "getting-started",
                q: "Who is KonarCard best for?",
                a: (
                    <>
                        KonarCard is designed for <strong>tradies and service businesses</strong> — plumbers, electricians,
                        builders, landscapers, cleaners, mechanics, and more. If you rely on referrals, quotes, and repeat work,
                        a digital profile that shows reviews and proof of work helps clients trust you faster.
                    </>
                ),
            },

            // ======================
            // Cards & profiles
            // ======================
            {
                id: "does-it-work-on-iphone-android",
                cat: "cards-profiles",
                q: "Does the NFC business card work on iPhone and Android?",
                a: (
                    <>
                        Yes. Most modern iPhones and Android phones support NFC tap-to-open. And every KonarCard also supports a
                        QR backup, so people can scan even if NFC is off.
                    </>
                ),
            },
            {
                id: "what-can-i-put-on-profile",
                cat: "cards-profiles",
                q: "What can I add to my digital business card profile?",
                a: (
                    <>
                        Add your contact buttons (call, text, WhatsApp), your services, photos of your work, reviews/testimonials,
                        and links (Instagram, Facebook, website, booking). The goal is: clients see you’re legit and can contact you
                        in one tap.
                    </>
                ),
            },
            {
                id: "can-i-update-anytime",
                cat: "cards-profiles",
                q: "Can I update my details anytime?",
                a: (
                    <>
                        Yes — your link stays the same, but you can update the content whenever you want (new number, new services,
                        fresh photos). That’s why it beats paper cards: no reprints, no outdated details.
                    </>
                ),
            },
            {
                id: "do-i-need-an-app",
                cat: "cards-profiles",
                q: "Do customers need an app?",
                a: (
                    <>
                        No. Customers just tap or scan and your profile opens in their browser. That’s what makes it frictionless for
                        on-site jobs and quick quotes.
                    </>
                ),
            },

            // ======================
            // Pricing & plans
            // ======================
            {
                id: "is-card-one-time-purchase",
                cat: "pricing-plans",
                q: "Is the NFC card a one-time purchase?",
                a: (
                    <>
                        Yes — the NFC products are a one-time purchase. Your profile can be started for free.
                        You can view plan options on the <Link to="/pricing">pricing page</Link>.
                    </>
                ),
            },
            {
                id: "what-is-plus",
                cat: "pricing-plans",
                q: "What do I get with Plus?",
                a: (
                    <>
                        Plus is for trades who want more templates, higher limits (more photos/services/reviews), deeper analytics,
                        and a cleaner branded look. See full plan details on <Link to="/pricing">Pricing</Link>.
                    </>
                ),
            },
            {
                id: "can-i-cancel",
                cat: "pricing-plans",
                q: "Can I cancel a paid plan?",
                a: (
                    <>
                        Yes. Paid plans are optional and you can cancel when you no longer need the extra features.
                    </>
                ),
            },

            // ======================
            // Teams
            // ======================
            {
                id: "teams-who-for",
                cat: "teams",
                q: "Who is Teams for?",
                a: (
                    <>
                        Teams is built for companies with multiple staff or contractors. You can keep branding consistent and track
                        performance across profiles.
                    </>
                ),
            },
            {
                id: "teams-extra-profiles",
                cat: "teams",
                q: "Can I add more team profiles?",
                a: (
                    <>
                        Yes — Teams supports additional profiles as you grow. Check the <Link to="/pricing">Teams section</Link> for
                        the latest options.
                    </>
                ),
            },

            // ======================
            // Technical & support
            // ======================
            {
                id: "what-if-nfc-doesnt-work",
                cat: "support",
                q: "What if NFC doesn’t work on someone’s phone?",
                a: (
                    <>
                        No problem — use the QR backup or send your link by WhatsApp/SMS. Your profile is always shareable in multiple
                        ways, which is ideal for busy on-site work.
                    </>
                ),
            },
            {
                id: "help-setting-up",
                cat: "support",
                q: "Can you help me set it up?",
                a: (
                    <>
                        Yes. If you get stuck, contact support and we’ll help you get your profile live and ready to share.
                        Visit <Link to="/contactus">Contact</Link>.
                    </>
                ),
            },
        ],
        []
    );

    const filtered = useMemo(() => faqs.filter((f) => f.cat === activeCat), [faqs, activeCat]);

    return (
        <section className="kc-faq" aria-labelledby="kc-faq-title">
            <div className="kc-faq__inner">
                <header className="kc-faq__head">
                    <h2 id="kc-faq-title" className="kc-faq__title">
                        Frequently Asked Questions
                    </h2>
                    <p className="kc-faq__sub">
                        Everything you need to know before getting started with KonarCard — a digital business card and NFC business card for the UK.
                    </p>

                    <nav className="kc-faq__tabs" aria-label="FAQ categories">
                        {CATS.map((c) => {
                            const active = c.key === activeCat;
                            return (
                                <button
                                    key={c.key}
                                    type="button"
                                    className={`kc-faq__tab ${active ? "is-active" : ""}`}
                                    aria-pressed={active}
                                    onClick={() => {
                                        setActiveCat(c.key);
                                        // open first question in that category for nicer UX
                                        const first = faqs.find((f) => f.cat === c.key);
                                        if (first) setOpenId(first.id);
                                    }}
                                >
                                    {c.label}
                                </button>
                            );
                        })}
                    </nav>
                </header>

                <div className="kc-faq__list" role="list" aria-label="FAQ list">
                    {filtered.map((item) => {
                        const open = openId === item.id;
                        const btnId = `faq-btn-${item.id}`;
                        const panelId = `faq-panel-${item.id}`;

                        return (
                            <div key={item.id} className={`kc-faq__item ${open ? "is-open" : ""}`} role="listitem">
                                <button
                                    id={btnId}
                                    type="button"
                                    className="kc-faq__q"
                                    aria-expanded={open}
                                    aria-controls={panelId}
                                    onClick={() => setOpenId(open ? "" : item.id)}
                                >
                                    <span className="kc-faq__qText">{item.q}</span>
                                    <span className="kc-faq__chev" aria-hidden="true">
                                        {open ? "–" : "+"}
                                    </span>
                                </button>

                                <div
                                    id={panelId}
                                    role="region"
                                    aria-labelledby={btnId}
                                    className="kc-faq__aWrap"
                                    style={{ display: open ? "block" : "none" }}
                                >
                                    <div className="kc-faq__a">{item.a}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="kc-faq__bottom">
                    <p className="kc-faq__bottomText">
                        Still got questions? We’re happy to help.
                    </p>
                    <div className="kc-faq__bottomBtns">
                        <Link to="/contactus" className="kc-faq__btn kc-faq__btn--primary">
                            Contact support
                        </Link>
                        <Link to="/products" className="kc-faq__btn kc-faq__btn--ghost">
                            Shop NFC cards
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
