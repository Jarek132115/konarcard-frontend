// frontend/src/components/home/CustomerTrust.jsx
import React from "react";
import { Link } from "react-router-dom";
import "../../styling/home/customertrust.css";

function IconPhone() {
    return (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M9 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="2" opacity="0.95" />
            <path d="M10 6h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
            <path d="M11 19h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
        </svg>
    );
}

function IconGallery() {
    return (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6Z" stroke="currentColor" strokeWidth="2" opacity="0.95" />
            <path d="M16 8h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-2" stroke="currentColor" strokeWidth="2" opacity="0.55" />
            <path d="M7 13l2-2 3 3 2-2 1 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.75" />
        </svg>
    );
}

function IconChat() {
    return (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M7 9h10M7 13h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.75" />
            <path d="M21 12a7 7 0 0 1-7 7H8l-5 2 2-5v-4a7 7 0 0 1 7-7h2a7 7 0 0 1 7 7Z" stroke="currentColor" strokeWidth="2" opacity="0.95" />
        </svg>
    );
}

function IconEdit() {
    return (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 20h4l10.5-10.5a2 2 0 0 0 0-2.8l-1.2-1.2a2 2 0 0 0-2.8 0L4 16v4Z" stroke="currentColor" strokeWidth="2" opacity="0.95" />
            <path d="M13.5 6.5l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
        </svg>
    );
}

function IconHardhat() {
    return (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 16v-3a7 7 0 0 1 14 0v3" stroke="currentColor" strokeWidth="2" opacity="0.95" />
            <path d="M4 16h16a1 1 0 0 1 1 1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="2" opacity="0.8" />
            <path d="M12 6v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
        </svg>
    );
}

function IconShare() {
    return (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M16 8a3 3 0 1 0-2.8-4" stroke="currentColor" strokeWidth="2" opacity="0.7" />
            <path d="M6 12a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" stroke="currentColor" strokeWidth="2" opacity="0.95" />
            <path d="M18 13a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" stroke="currentColor" strokeWidth="2" opacity="0.95" />
            <path d="M8.6 13.4l6.8-3.8M8.7 16.6l6.6 3.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.75" />
        </svg>
    );
}

export default function CustomerTrust() {
    const cards = [
        { icon: <IconPhone />, title: "Works on every phone", desc: "No apps. Just tap or scan." },
        { icon: <IconGallery />, title: "Your work, all in one place", desc: "Photos, services, and reviews together." },
        { icon: <IconChat />, title: "Instant contact options", desc: "Call, message, or save details instantly." },
        { icon: <IconEdit />, title: "Update anytime", desc: "Change details without reprinting cards." },
        { icon: <IconHardhat />, title: "Looks professional", desc: "Clean profile that builds trust fast." },
        { icon: <IconShare />, title: "Share anywhere", desc: "Online, in person, or after the job." },
    ];

    return (
        <section className="kht" aria-label="Everything customers need to trust you">
            <div className="kht__inner">
                <header className="kht__head">
                    <p className="kht__kicker">Trust builders</p>
                    <h2 className="h3 kht__title">Everything Customers Need to Trust You</h2>
                    <p className="body-s kht__sub">
                        Put your work, reviews, and contact buttons in one clean link — so customers see you’re legit and contact you fast.
                    </p>
                </header>

                <div className="kht__grid">
                    {cards.map((c, i) => (
                        <article key={i} className="kht__card">
                            <div className="kht__iconWrap">
                                <div className="kht__icon">{c.icon}</div>
                                <div className="kht__glow" aria-hidden="true" />
                            </div>

                            <div className="kht__copy">
                                <h3 className="h6 kht__cardTitle">{c.title}</h3>
                                <p className="body-s kht__cardDesc">{c.desc}</p>
                            </div>

                            <div className="kht__chev" aria-hidden="true">›</div>
                        </article>
                    ))}
                </div>

                <div className="kht__cta">
                    <Link to="/examples" className="kht__btn kht__btn--primary">
                        See real profile examples
                    </Link>
                    <Link to="/register" className="kht__btn kht__btn--ghost">
                        Create your profile
                    </Link>
                </div>
            </div>
        </section>
    );
}
