// frontend/src/components/home/Share.jsx
import React from "react";
import "../../styling/home/share.css";

export default function Share({ nfcImage, qrImage, smsImage, linkImage }) {
    const items = [
        {
            k: "nfc",
            title: "Tap with KonarCard",
            desc: "Tap your NFC business card to instantly open your digital profile — no app required.",
            img: nfcImage,
            badge: "Fastest",
            icon: "↯",
        },
        {
            k: "qr",
            title: "Scan the QR backup",
            desc: "Scan the QR code with any phone camera to access your digital business card.",
            img: qrImage,
            badge: "Works for everyone",
            icon: "⌁",
        },
        {
            k: "msg",
            title: "Send your link",
            desc: "Share your digital business card link by WhatsApp, SMS, or email in seconds.",
            img: smsImage,
            badge: "Best for follow-ups",
            icon: "✉",
        },
        {
            k: "bio",
            title: "Link in bio",
            desc: "Add your profile link to Instagram, TikTok, Google Business Profile, or your site.",
            img: linkImage,
            badge: "Always visible",
            icon: "⛓",
        },
    ];

    return (
        <section
            className="khs-share"
            aria-label="How to share your digital business card with KonarCard"
        >
            <div className="khs-container">
                <header className="khs-head">
                    <p className="khs-kicker">One profile, everywhere</p>

                    <h2 className="h3 khs-title">
                        One Profile. <span className="khs-accent">Shared</span> Every Way.
                    </h2>

                    <p className="body-s khs-sub">
                        Four simple ways to share your digital business card — in person, online, and anywhere.
                    </p>
                </header>

                <div className="khs-grid" aria-label="Sharing methods">
                    {items.map((it) => (
                        <article className="khs-card" key={it.k}>
                            <div
                                className="khs-media"
                                aria-label={`${it.badge}: ${it.title}`}
                            >
                                <span className="khs-pill">{it.badge}</span>

                                {it.img ? (
                                    <img
                                        className="khs-img"
                                        src={it.img}
                                        alt={`${it.title} — KonarCard sharing method`}
                                        loading="lazy"
                                        decoding="async"
                                    />
                                ) : (
                                    <div
                                        className={`khs-mock khs-mock--${it.k}`}
                                        aria-hidden="true"
                                    >
                                        <div className="khs-mock__icon">
                                            {it.icon}
                                        </div>
                                        <div className="khs-mock__lines">
                                            <span />
                                            <span />
                                            <span />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="khs-body">
                                <p className="h6 khs-cardTitle">{it.title}</p>
                                <p className="body-s khs-cardDesc">{it.desc}</p>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
