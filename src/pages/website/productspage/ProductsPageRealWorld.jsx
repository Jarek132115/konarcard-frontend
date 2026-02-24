// frontend/src/pages/website/productspage/ProductsPageRealWorld.jsx
import React from "react";
import "../../../styling/fonts.css";
import "../../../styling/productspage/productspagerealworld.css";

/* Icons */
import OnSiteIcon from "../../../assets/icons/OnSite.svg";
import AfterQuoteIcon from "../../../assets/icons/AfterQuote.svg";
import TradeCounterIcon from "../../../assets/icons/TradeCounter.svg";
import VanQRIcon from "../../../assets/icons/VanQR.svg";
import LinkInSocialIcon from "../../../assets/icons/LinkInSocial.svg";
import UpdateSecondsIcon from "../../../assets/icons/UpdateSeconds.svg";

export default function ProductsPageRealWorld() {
    const top = [
        {
            pill: "Use it on-site",
            title: "Tap to swap details on the spot",
            points: ["Tap to open your profile instantly", "Works even when you’re busy on a job", "No app needed, just tap or scan"],
        },
        {
            pill: "Win more jobs",
            title: "Turn taps into customers",
            points: ["Create a clean, trustworthy profile", "Show photos, services, reviews and contact buttons", "Faster follow-ups and fewer missed calls"],
        },
    ];

    const grid = [
        {
            icon: OnSiteIcon,
            title: "On site, with a client",
            desc: "Tap your KonarCard. Their phone opens your profile and saves your details instantly, no typing.",
        },
        {
            icon: AfterQuoteIcon,
            title: "After a quote",
            desc: "Send your link by WhatsApp so they can review your work and contact you fast.",
        },
        {
            icon: TradeCounterIcon,
            title: "Networking / trade counter",
            desc: "Tap to share your details as many times as you want, no stacks of cards.",
        },
        {
            icon: VanQRIcon,
            title: "Van QR & site boards",
            desc: "Add the QR to your van or signage so customers can scan and call straight away.",
        },
        {
            icon: LinkInSocialIcon,
            title: "Social & link in bio",
            desc: "Add your KonarCard link to socials so new leads land on your profile first.",
        },
        {
            icon: UpdateSecondsIcon,
            title: "Updates in seconds",
            desc: "Update once and it’s live everywhere instantly, new number, prices, photos or services.",
        },
    ];

    return (
        <section className="kprw" aria-label="How trades use NFC business cards">
            <div className="kprw__inner">
                <header className="kprw__head">
                    <p className="kc-pill kprw__kicker">Built for trades</p>

                    <h2 className="h3 kprw__title">
                        How Trades Use NFC Business Cards <span className="kprw__accent">in the Real World</span>
                    </h2>

                    <p className="kc-subheading kprw__sub">
                        See how contactless business cards help you share details instantly, collect leads, and win more jobs.
                    </p>
                </header>

                {/* TOP 2 */}
                <div className="kprw__top" role="list" aria-label="Real world highlights">
                    {top.map((b) => (
                        <article key={b.title} className="kprw__topCard" role="listitem">
                            <p className="kc-pill kprw__miniPill">{b.pill}</p>
                            <h3 className="kc-title kprw__topTitle">{b.title}</h3>

                            {/* ✅ bullets centered (CSS handles alignment) */}
                            <ul className="kprw__bullets" aria-label={`${b.title} key points`}>
                                {b.points.map((pt) => (
                                    <li key={pt} className="body kprw__li">
                                        {pt}
                                    </li>
                                ))}
                            </ul>
                        </article>
                    ))}
                </div>

                {/* GRID 6 */}
                <div className="kprw__grid" aria-label="Real world examples">
                    {grid.map((g) => (
                        <article className="kprw__cell" key={g.title}>
                            <div className="kprw__icon" aria-hidden="true">
                                <img className="kprw__iconImg" src={g.icon} alt="" loading="lazy" />
                            </div>

                            <h3 className="kc-title kprw__cellTitle">{g.title}</h3>
                            <p className="body kprw__cellDesc">{g.desc}</p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}