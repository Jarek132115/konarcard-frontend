import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import "../../styling/home/value.css";

/* ✅ New icons you added (SVG files in src/assets/icons/) */
import SmartPhoneTapIcon from "../../assets/icons/SmartPhoneTap.svg";
import ToolsIcon from "../../assets/icons/Tools.svg";
import MoneyShieldIcon from "../../assets/icons/MoneyShield.svg";
import TrophyIcon from "../../assets/icons/Trophy.svg";
import NoPrintIcon from "../../assets/icons/NoPrint.svg";
import RefreshIcon from "../../assets/icons/Refresh.svg";

export default function Value() {
    const items = useMemo(
        () => [
            {
                icon: SmartPhoneTapIcon,
                title: "Works everywhere",
                desc: "In person or online, on any phone — a contactless digital business card with no app needed.",
            },
            {
                icon: ToolsIcon,
                title: "Built for real trades",
                desc: "Simple, practical, and made for how you actually work on-site and on the move.",
            },
            {
                icon: MoneyShieldIcon,
                title: "One job pays for everything",
                desc: "Land one extra job and it covers your NFC business card and profile.",
            },
            {
                icon: TrophyIcon,
                title: "Looks professional fast",
                desc: "Builds trust instantly before you even speak.",
            },
            {
                icon: NoPrintIcon,
                title: "No reprints, ever",
                desc: "Update your details anytime without reordering cards.",
            },
            {
                icon: RefreshIcon,
                title: "Always up to date",
                desc: "Your latest work, reviews, and services — instantly.",
            },
        ],
        []
    );

    return (
        <section className="khv" aria-label="Why KonarCard is worth it">
            <div className="khv__inner">
                <header className="khv__head">
                    <p className="khv__kicker">Built for trades</p>
                    <h2 className="h3 khv__title">Why KonarCard Is Worth It</h2>
                    <p className="body-s khv__sub">
                        A practical digital business card you can share contactless — by NFC tap, QR code, or link.
                    </p>
                </header>

                <div className="khv__grid" aria-label="KonarCard benefits">
                    {items.map((it, i) => (
                        <article className="khv__card" key={i}>
                            <div className="khv__iconTop" aria-hidden="true">
                                <img className="khv__iconImg" src={it.icon} alt="" loading="lazy" />
                            </div>

                            <div className="khv__copy">
                                <h3 className="h6 khv__cardTitle">{it.title}</h3>
                                <p className="body-s khv__cardDesc">{it.desc}</p>
                            </div>
                        </article>
                    ))}
                </div>

                <div className="khv__cta">
                    <Link to="/examples" className="khv__btn khv__btn--primary">
                        See real profile examples
                    </Link>
                    <Link to="/register" className="khv__btn khv__btn--ghost">
                        Create your profile
                    </Link>
                </div>
            </div>
        </section>
    );
}
