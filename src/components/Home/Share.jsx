// frontend/src/components/home/Share.jsx
import React from "react";
import "../../styling/home/share.css";

export default function Share({ nfcImage, qrImage, smsImage, linkImage }) {
    const items = [
        {
            k: "nfc",
            title: "Tap with KonarCard",
            desc: "Instantly opens your profile on modern phones — no app needed.",
            img: nfcImage,
            badge: "Fastest",
            icon: "↯",
        },
        {
            k: "qr",
            title: "Scan the QR backup",
            desc: "Works even when NFC is off — anyone can scan with a camera.",
            img: qrImage,
            badge: "Works for everyone",
            icon: "⌁",
        },
        {
            k: "msg",
            title: "Send your link",
            desc: "Share in WhatsApp, SMS, Messenger, email — wherever they reply.",
            img: smsImage,
            badge: "Best for follow-ups",
            icon: "✉",
        },
        {
            k: "bio",
            title: "Link in bio",
            desc: "Add to Instagram, Facebook, TikTok, Google Business, or your site.",
            img: linkImage,
            badge: "Always visible",
            icon: "⛓",
        },
    ];

    return (
        <section className="khs-share" aria-label="How to share your profile">
            <div className="khs-container">
                <header className="khs-head">
                    <p className="khs-kicker">One profile, everywhere</p>

                    <h2 className="h3 khs-title">
                        One Profile. <span className="khs-accent">Shared</span> Every Way.
                    </h2>

                    <p className="body-s khs-sub">
                        Four simple ways to get your details in front of clients — in person, online, and on-site.
                    </p>
                </header>

                <div className="khs-grid">
                    {items.map((it) => (
                        <article className="khs-card" key={it.k}>
                            <div className="khs-cardTop">
                                <span className="khs-pill">{it.badge}</span>
                            </div>

                            <div className="khs-media" aria-hidden="true">
                                {it.img ? (
                                    <img src={it.img} alt="" loading="lazy" />
                                ) : (
                                    <div className={`khs-mock khs-mock--${it.k}`}>
                                        <div className="khs-mock__icon">{it.icon}</div>
                                        <div className="khs-mock__lines">
                                            <span />
                                            <span />
                                            <span />
                                        </div>
                                        <div className="khs-mock__chip" />
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
