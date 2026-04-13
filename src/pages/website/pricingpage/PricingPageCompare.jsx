// frontend/src/pages/website/pricingpage/PricingPageCompare.jsx
import React from "react";
import { motion } from "motion/react";

import "../../../styling/pricingpage/pricingpagecompare.css";
import PricingTick from "../../../assets/icons/PricingTick.svg";
import XTick from "../../../assets/icons/XTick.svg";

const EASE = [0.22, 1, 0.36, 1];

const fadeUpInView = (delay = 0) => ({
    initial: { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-40px" },
    transition: { duration: 0.48, delay, ease: EASE },
});

/* ── Data ──────────────────────────────────────────────────── */
const SECTIONS = [
    {
        title: "Core",
        rows: [
            { label: "KonarCard link + QR code", hint: "Tap or scan to share", free: true, plus: true, teams: true },
            { label: "Profile customisation", hint: "Edit anytime", free: true, plus: true, teams: true },
            { label: "Works on every phone", hint: "iPhone + Android", free: true, plus: true, teams: true },
        ],
    },
    {
        title: "Brand & Content",
        rows: [
            { label: "Templates", free: "1", plus: "5", teams: "5" },
            { label: "Photo gallery", free: "Up to 6", plus: "Up to 12", teams: "Up to 12" },
            { label: "Services & pricing", free: "Up to 3", plus: "Up to 12", teams: "Up to 12" },
            { label: "Reviews", free: "Up to 3", plus: "Up to 12", teams: "Up to 12" },
        ],
    },
    {
        title: "Analytics",
        rows: [
            { label: "Analytics", free: "Basic", plus: "Deep", teams: "Deep" },
        ],
    },
    {
        title: "Profiles",
        rows: [
            { label: "Profiles included", free: "1", plus: "1", teams: "1 base" },
            { label: "Extra staff profiles", hint: "Add profiles as you grow", free: false, plus: false, teams: "£2/profile/mo" },
        ],
    },
];

/* ── Cell value renderer ───────────────────────────────────── */
function CellValue({ v }) {
    if (v === true) {
        return (
            <span className="prc-cv prc-cv--yes" aria-label="Included">
                <img src={PricingTick} alt="" width={18} height={18} loading="lazy" decoding="async" />
            </span>
        );
    }
    if (v === false) {
        return (
            <span className="prc-cv prc-cv--no" aria-label="Not included">
                <img src={XTick} alt="" width={18} height={18} loading="lazy" decoding="async" />
            </span>
        );
    }
    return <span className="prc-cv prc-cv--text">{String(v ?? "N/A")}</span>;
}

export default function PricingPageCompare() {
    return (
        <section className="prc-wrap" aria-label="Compare plans">
            <div className="pr-container">

                <motion.header className="prc-head" {...fadeUpInView(0)}>
                    <p className="kc-pill prc-pill">Compare</p>
                    <h2 className="h3 prc-title">Compare the Plans</h2>
                    <p className="kc-subheading prc-sub">
                        A box of 250 paper cards costs around £20 and goes out of date the moment anything changes. KonarCard costs the same, once, and never needs reprinting.
                    </p>
                </motion.header>

                <motion.div className="prc-table" {...fadeUpInView(0.1)} role="table" aria-label="Plan comparison">

                    {/* ── Column headers (desktop only) ─────────── */}
                    <div className="prc-colHead" role="row" aria-label="Plan columns">
                        <div className="prc-colHead__feat" role="columnheader">Feature</div>
                        <div className="prc-colHead__plan" role="columnheader">
                            <span className="prc-planName">Free</span>
                            <span className="prc-planPrice">£0</span>
                        </div>
                        <div className="prc-colHead__plan prc-colHead__plan--plus" role="columnheader">
                            <span className="prc-planName">Plus</span>
                            <span className="prc-planPrice prc-planPrice--plus">£5 / mo</span>
                        </div>
                        <div className="prc-colHead__plan" role="columnheader">
                            <span className="prc-planName">Teams</span>
                            <span className="prc-planPrice">£5 + £2/profile</span>
                        </div>
                    </div>

                    {/* ── Sections ──────────────────────────────── */}
                    {SECTIONS.map((sec) => (
                        <div key={sec.title} className="prc-group" role="rowgroup" aria-label={sec.title}>
                            <div className="prc-groupLabel" role="row">
                                <span role="cell">{sec.title}</span>
                            </div>

                            {sec.rows.map((row) => (
                                <div key={row.label} className="prc-row" role="row">
                                    {/* Feature */}
                                    <div className="prc-feat" role="cell">
                                        <span className="prc-featText">{row.label}</span>
                                        {row.hint && <span className="prc-featHint">{row.hint}</span>}
                                    </div>

                                    {/* Plan cells, wrapped so they can flex on mobile */}
                                    <div className="prc-cells">
                                        <div className="prc-cell prc-cell--free" role="cell">
                                            <span className="prc-mobileLabel" aria-hidden="true">Free</span>
                                            <CellValue v={row.free} />
                                        </div>
                                        <div className="prc-cell prc-cell--plus" role="cell">
                                            <span className="prc-mobileLabel" aria-hidden="true">Plus</span>
                                            <CellValue v={row.plus} />
                                        </div>
                                        <div className="prc-cell prc-cell--teams" role="cell">
                                            <span className="prc-mobileLabel" aria-hidden="true">Teams</span>
                                            <CellValue v={row.teams} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </motion.div>

            </div>
        </section>
    );
}
