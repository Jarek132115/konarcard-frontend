// frontend/src/components/Home/Value.jsx
import React, { useMemo } from "react";
import "../../styling/home/value.css";

/* Icons */
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
                icon: MoneyShieldIcon,
                title: "One job pays for everything",
                desc: "One extra job can cover your card cost.",
            },
            {
                icon: NoPrintIcon,
                title: "No reprints, ever",
                desc: "Update details anytime - no reprints.",
            },
            {
                icon: RefreshIcon,
                title: "Always up to date",
                desc: "Your latest work and reviews stay up to date.",
            },
            {
                icon: SmartPhoneTapIcon,
                title: "Works everywhere",
                desc: "Share anywhere - works on every phone.",
            },
            {
                icon: ToolsIcon,
                title: "Built for real trades",
                desc: "Built for real jobs, not office desks.",
            },
            {
                icon: TrophyIcon,
                title: "Looks professional fast",
                desc: "Look credible before you even speak.",
            },
        ],
        []
    );

    return (
        <section className="khv" aria-label="Why KonarCard is worth it">
            <div className="khv__inner">
                <header className="khv__head">
                    <p className="kc-pill khv__kicker">Built for trades</p>

                    <h2 className="h3 khv__title">
                        Why KonarCard Is <span className="khv__accent">Worth It</span>
                    </h2>

                    <p className="kc-subheading khv__sub">
                        A practical profile you can share by tap, QR, or link.
                    </p>
                </header>

                <div className="khv__grid" aria-label="KonarCard benefits">
                    {items.map((it, i) => (
                        <article className="khv__cell" key={i}>
                            <div className="khv__icon" aria-hidden="true">
                                <img className="khv__iconImg" src={it.icon} alt="" loading="lazy" />
                            </div>

                            <h3 className="kc-title khv__cellTitle">{it.title}</h3>
                            <p className="body khv__cellDesc">{it.desc}</p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}