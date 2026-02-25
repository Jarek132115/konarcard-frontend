// frontend/src/pages/website/pricingpage/PricingPageCompare.jsx
import React, { useMemo } from "react";

import "../../../styling/fonts.css";
import "../../../styling/pricing.css";
import "../../../styling/pricingpage/pricingpagecompare.css";

/* ✅ compare icons */
import PricingTick from "../../../assets/icons/PricingTick.svg";
import XTick from "../../../assets/icons/XTick.svg";

export default function PricingPageCompare({ billing = "monthly" }) {
    const compareSections = useMemo(
        () => [
            {
                title: "Core",
                rows: [
                    { label: "Your KonarCard link + QR code", hint: "Share by tap or scan", free: true, plus: true, teams: true },
                    { label: "Profile customisation", hint: "Edit anytime", free: true, plus: true, teams: true },
                    { label: "Works on every phone", hint: "iPhone + Android", free: true, plus: true, teams: true },
                ],
            },
            {
                title: "Brand & content",
                rows: [
                    { label: "Templates", hint: "Design layouts", free: "1", plus: "5", teams: "5" },
                    { label: "Remove KonarCard branding", free: false, plus: true, teams: true },
                    { label: "Photo gallery", hint: "Work photos", free: "Up to 6", plus: "Up to 12", teams: "Up to 12" },
                    { label: "Services & pricing", free: "Up to 6", plus: "Up to 12", teams: "Up to 12" },
                    { label: "Reviews", free: "Up to 6", plus: "Up to 12", teams: "Up to 12" },
                ],
            },
            { title: "Analytics", rows: [{ label: "Analytics depth", free: "Basic", plus: "Deep", teams: "Deep" }] },
            {
                title: "Profiles",
                rows: [
                    { label: "Profiles included", hint: "Your base profiles", free: "1", plus: "1", teams: "Unlimited @ £1.95/profile" },
                    { label: "Extra staff profiles", hint: "Add profiles as you grow", free: false, plus: false, teams: true },
                ],
            },
        ],
        []
    );

    const plusPriceLabel = billing === "monthly" ? "£4.95/mo" : billing === "quarterly" ? "£4.45/mo" : "£3.95/mo";

    return (
        <section className="pr-compare" aria-label="Compare plans">
            <div className="pr-container">
                <header className="pr-sectionHead">
                    <div className="kc-pill pr-sectionPill">Compare</div>
                    <h2 className="h3 pr-h2">Compare plans</h2>
                    <p className="body-s pr-sectionSub">Clear differences — no fluff. Pick what matches how you work.</p>
                </header>

                <div className="pr-compareWrap" role="region" aria-label="Plan comparison">
                    <div className="pr-compareScroll" tabIndex={0} aria-label="Scrollable comparison table">
                        <div className="pr-compareTable" role="table" aria-label="Pricing comparison table">
                            <div className="pr-compareHeader" role="row">
                                <div className="pr-th pr-th--feature" role="columnheader" aria-label="Feature column">
                                    <div className="pr-thName">Feature</div>
                                </div>

                                <div className="pr-th pr-th--free" role="columnheader">
                                    <div className="pr-thName">Free</div>
                                    <div className="pr-thSub">£0</div>
                                </div>

                                <div className="pr-th pr-th--plus" role="columnheader">
                                    <div className="pr-thName">Plus</div>
                                    <div className="pr-thSub">{plusPriceLabel}</div>
                                </div>

                                <div className="pr-th pr-th--teams" role="columnheader">
                                    <div className="pr-thName">Teams</div>
                                    <div className="pr-thSub">Plus + £1.95/profile/mo</div>
                                </div>
                            </div>

                            {compareSections.map((sec) => (
                                <div className="pr-sec" key={sec.title} role="rowgroup" aria-label={sec.title}>
                                    <div className="pr-secTitle" role="row">
                                        <div className="pr-secTitleInner">{sec.title}</div>
                                    </div>

                                    {sec.rows.map((r) => (
                                        <div className="pr-tr" role="row" key={r.label}>
                                            <div className="pr-td pr-td--feature" role="cell">
                                                <div className="pr-featLabel">
                                                    <span className="pr-featText">{r.label}</span>
                                                </div>
                                                {r.hint ? <div className="pr-featHint">{r.hint}</div> : null}
                                            </div>

                                            <div className="pr-td pr-td--free pr-td--center" role="cell">
                                                <CompareValue v={r.free} PricingTick={PricingTick} XTick={XTick} />
                                            </div>

                                            <div className="pr-td pr-td--plus pr-td--center" role="cell">
                                                <CompareValue v={r.plus} PricingTick={PricingTick} XTick={XTick} />
                                            </div>

                                            <div className="pr-td pr-td--teams pr-td--center" role="cell">
                                                <CompareValue v={r.teams} PricingTick={PricingTick} XTick={XTick} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>

                    <p className="pr-compareHint body-s">Tip: on mobile, swipe sideways to compare.</p>
                </div>
            </div>
        </section>
    );
}

function CompareValue({ v, PricingTick, XTick }) {
    const isBool = typeof v === "boolean";

    if (isBool) {
        return v ? (
            <span className="pr-cv pr-cv--icon pr-cv--yes" aria-label="Included">
                <img src={PricingTick} alt="" loading="lazy" decoding="async" />
            </span>
        ) : (
            <span className="pr-cv pr-cv--icon pr-cv--no" aria-label="Not included">
                <img src={XTick} alt="" loading="lazy" decoding="async" />
            </span>
        );
    }

    const s = String(v ?? "—");
    if (!s || s === "—") {
        return (
            <span className="pr-cv pr-cv--icon pr-cv--no" aria-label="Not included">
                <img src={XTick} alt="" loading="lazy" decoding="async" />
            </span>
        );
    }

    return <span className="pr-cv pr-cv--text">{s}</span>;
}