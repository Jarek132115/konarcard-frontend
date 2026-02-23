// frontend/src/components/home/Share.jsx
import React, { useMemo } from "react";
import "../../styling/home/share.css";

/* ✅ Correct 4 share images only */
import ShareFastest from "../../assets/images/ShareFastest.jpg";
import SharePhone from "../../assets/images/SharePhone.jpg";
import ShareFollowUp from "../../assets/images/ShareFollowUp.jpg";
import ShareVisible from "../../assets/images/ShareVisible.jpg";

export default function Share() {
    const items = useMemo(
        () => [
            {
                k: "nfc",
                title: "Tap with KonarCard",
                desc: "Tap your card - your profile opens instantly.",
                img: ShareFastest,
                badge: "Fastest Way",
            },
            {
                k: "phone",
                title: "Scan the QR backup",
                desc: "Scan with any phone camera - opens instantly.",
                img: SharePhone,
                badge: "Works on Any Phone",
            },
            {
                k: "msg",
                title: "Send your link",
                desc: "Send it by WhatsApp, text, or email in seconds.",
                img: ShareFollowUp,
                badge: "Best for Follow-Ups",
            },
            {
                k: "bio",
                title: "Link in bio",
                desc: "Add it to Instagram, Google, or your website.",
                img: ShareVisible,
                badge: "Always Visible",
            },
        ],
        []
    );

    return (
        <section className="khs-share" aria-label="How to share your profile with KonarCard">
            <div className="khs-container">
                <header className="khs-head">
                    <p className="kc-pill khs-kicker">One profile, everywhere</p>

                    <h2 className="h3 khs-title">
                        One <span className="khs-accent">Profile</span>. Shared{" "}
                        <span className="khs-accent">Every Way</span>.
                    </h2>

                    <p className="kc-subheading khs-sub">
                        Share your profile in person, online, and anywhere.
                    </p>
                </header>

                <div className="khs-grid" aria-label="Sharing methods">
                    {items.map((it) => (
                        <article className="khs-card" key={it.k}>
                            <span className="khs-pill">{it.badge}</span>

                            <div className="khs-copy">
                                <h3 className="kc-title khs-cardTitle">{it.title}</h3>
                                <p className="body khs-cardDesc">{it.desc}</p>
                            </div>

                            <div className="khs-media" aria-hidden="true">
                                <img
                                    className="khs-img"
                                    src={it.img}
                                    alt={`${it.title} — KonarCard sharing method`}
                                    loading="lazy"
                                    decoding="async"
                                />
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}