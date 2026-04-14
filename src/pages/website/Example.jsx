// frontend/src/pages/website/Example.jsx
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Home/Footer";

import "../../styling/fonts.css";
import "../../styling/example.css";

import { useSeo } from "../../utils/seo";

/* Real profile screenshots — one per example card */
import AkermanImg from "../../assets/images/example-images/AkermanProfile.jpg";
import BancroftImg from "../../assets/images/example-images/BancroftProfile.jpg";
import DalyImg from "../../assets/images/example-images/DalyProfile.jpg";
import DonnellyImg from "../../assets/images/example-images/DonnellyProfile.jpg";
import FletcherImg from "../../assets/images/example-images/FletcherProfile.jpg";
import GallagherImg from "../../assets/images/example-images/GallagherProfile.jpg";
import HargreavesImg from "../../assets/images/example-images/HargreavesProfile.jpg";
import KowalskiImg from "../../assets/images/example-images/KowalskiProfile.jpg";
import MorleyImg from "../../assets/images/example-images/MorleyProfile.jpg";
import MurphyImg from "../../assets/images/example-images/MurphyProfile.jpg";
import NkemdirimImg from "../../assets/images/example-images/NkemdirimProfile.jpg";
import OkaforImg from "../../assets/images/example-images/OkaforProfile.jpg";
import PattersonImg from "../../assets/images/example-images/PattersonProfile.jpg";
import SolidbuildImg from "../../assets/images/example-images/SolidbuildProfile.jpg";
import SutherlandImg from "../../assets/images/example-images/SutherlandProfile.jpg";
import ThorntonImg from "../../assets/images/example-images/ThorntonProfile.jpg";
import WebbImg from "../../assets/images/example-images/WebbProfile.jpg";
import WhitfieldImg from "../../assets/images/example-images/WhitfieldProfile.jpg";

/* ── Animation presets ─────────────────────────────────────── */
const EASE = [0.22, 1, 0.36, 1];

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay, ease: EASE },
});

const fadeUpInView = (delay = 0) => ({
    initial: { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-60px" },
    transition: { duration: 0.48, delay, ease: EASE },
});

const cardVariant = {
    hidden: { opacity: 0, y: 14 },
    show: (i) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.42, delay: Math.min(i, 8) * 0.05, ease: EASE },
    }),
    exit: { opacity: 0, y: -8, transition: { duration: 0.2, ease: EASE } },
};

/* ── Data ──────────────────────────────────────────────────────
   18 real KonarCard profiles (3 per trade). Each card links to
   the live public profile at /u/{slug}. Images are placeholders
   until real cover/profile shots are uploaded.
   ────────────────────────────────────────────────────────────── */
const CATEGORIES = [
    { key: "all", label: "All" },
    { key: "electrician", label: "Electrician" },
    { key: "plumber", label: "Plumber" },
    { key: "builder", label: "Builder" },
    { key: "renovator", label: "Renovator" },
    { key: "landscaper", label: "Landscaper" },
    { key: "handyman", label: "Handyman" },
];

const EXAMPLES_BY_TRADE = {
    electrician: [
        {
            id: "el-1",
            role: "Electrician",
            name: "Fletcher Electrical",
            slug: "fletcherelectrical",
            img: FletcherImg,
            desc: "Domestic and commercial wiring with a clean, fully-stocked profile.",
        },
        {
            id: "el-2",
            role: "Electrician",
            name: "Okafor Electrical Services",
            slug: "okaforelectricalservices",
            img: OkaforImg,
            desc: "Consumer units, EV chargers and rewires — plus verified reviews.",
        },
        {
            id: "el-3",
            role: "Electrician",
            name: "Hargreaves Electrical Ltd",
            slug: "hargreaveselectrical",
            img: HargreavesImg,
            desc: "Full service list and pricing up-front so customers know what to expect.",
        },
    ],
    plumber: [
        {
            id: "pl-1",
            role: "Plumber",
            name: "Whitfield Plumbing & Gas",
            slug: "whitfieldplumbinggas",
            img: WhitfieldImg,
            desc: "Gas Safe registered, 24/7 emergency callouts shared via tap or QR.",
        },
        {
            id: "pl-2",
            role: "Plumber",
            name: "Gallagher Plumbing Solutions",
            slug: "gallagherplumbingsolutions",
            img: GallagherImg,
            desc: "Bathroom fit-outs and boiler installs with before-and-after gallery.",
        },
        {
            id: "pl-3",
            role: "Plumber",
            name: "Donnelly Plumbing & Heating",
            slug: "donnellyplumbingheating",
            img: DonnellyImg,
            desc: "Call-out rate and common job prices listed so customers can decide fast.",
        },
    ],
    builder: [
        {
            id: "bu-1",
            role: "Builder",
            name: "Murphy Build & Renovate",
            slug: "murphybuildrenovate",
            img: MurphyImg,
            desc: "Extensions and new builds with a photo-led portfolio.",
        },
        {
            id: "bu-2",
            role: "Builder",
            name: "Nkemdirim Construction",
            slug: "nkemdirimconstruction",
            img: NkemdirimImg,
            desc: "Full-project builder with timelines and reviews for each job type.",
        },
        {
            id: "bu-3",
            role: "Builder",
            name: "SolidBuild Contractors",
            slug: "solidbuildcontractors",
            img: SolidbuildImg,
            desc: "Loft conversions and structural work with an organised service list.",
        },
    ],
    renovator: [
        {
            id: "re-1",
            role: "Renovator",
            name: "Thornton Renovation Group",
            slug: "thorntonrenovationgroup",
            img: ThorntonImg,
            desc: "Full-home renovations with a clean, trust-first profile design.",
        },
        {
            id: "re-2",
            role: "Renovator",
            name: "Webb Property Renovations",
            slug: "webbpropertyrenovations",
            img: WebbImg,
            desc: "House refurbishments with a strong before-and-after gallery.",
        },
        {
            id: "re-3",
            role: "Renovator",
            name: "Kowalski Renovations",
            slug: "kowalskirenovations",
            img: KowalskiImg,
            desc: "Kitchen and bathroom specialists with pricing ranges up-front.",
        },
    ],
    landscaper: [
        {
            id: "la-1",
            role: "Landscaper",
            name: "Sutherland Gardens",
            slug: "sutherlandgardens",
            img: SutherlandImg,
            desc: "Garden design and planting with a portfolio of completed projects.",
        },
        {
            id: "la-2",
            role: "Landscaper",
            name: "Daly Groundworks & Landscaping",
            slug: "dalygroundworkslandscaping",
            img: DalyImg,
            desc: "Driveways, patios and groundworks shown through a clean photo grid.",
        },
        {
            id: "la-3",
            role: "Landscaper",
            name: "Bancroft Landscape Design",
            slug: "bancroftlandscapedesign",
            img: BancroftImg,
            desc: "Bespoke landscape design and build — maintenance plans included.",
        },
    ],
    handyman: [
        {
            id: "ha-1",
            role: "Handyman",
            name: "Akerman Home Services",
            slug: "akermanhomeservices",
            img: AkermanImg,
            desc: "Small jobs, flat-pack, repairs — services listed with quick call buttons.",
        },
        {
            id: "ha-2",
            role: "Handyman",
            name: "Patterson Property Maintenance",
            slug: "pattersonpropertymaintenance",
            img: PattersonImg,
            desc: "Regular property maintenance bookings made easy with one profile.",
        },
        {
            id: "ha-3",
            role: "Handyman",
            name: "Morley Handyman Services",
            slug: "morleyhandymanservices",
            img: MorleyImg,
            desc: "Domestic handyman with a clear service menu and instant contact.",
        },
    ],
};

const ALL_EXAMPLES = Object.entries(EXAMPLES_BY_TRADE).flatMap(([category, items]) =>
    items.map((x) => ({ ...x, category }))
);

export default function Example() {
    useSeo({
        path: "/examples",
        title: "Digital Business Card Examples | KonarCard",
        description:
            "See real KonarCard digital business card examples from electricians, plumbers, builders, landscapers and more UK trades. Get inspiration for your own profile.",
    });

    const [active, setActive] = useState("all");

    const visible = useMemo(() => {
        if (active === "all") return ALL_EXAMPLES;
        return (EXAMPLES_BY_TRADE[active] || []).map((x) => ({ ...x, category: active }));
    }, [active]);

    return (
        <>
            <Navbar />

            <main className="ex-page kc-page">

                {/* ── HERO ─────────────────────────────────────── */}
                <section className="ex-hero" aria-label="Examples hero">
                    <div className="ex-container">
                        <div className="ex-head">
                            {/* Grid bg, circular radial fade, consistent with all hero sections */}
                            <div className="ex-gridBg" aria-hidden="true" />

                            <motion.div className="ex-headContent" {...fadeUp(0)}>
                                <p className="kc-pill ex-kicker">Real UK profiles</p>

                                <h1 className="h2 ex-title">
                                    How UK Tradespeople Use <span className="ex-accent">KonarCard</span>
                                </h1>

                                <p className="kc-subheading ex-sub">
                                    Here is how electricians, plumbers, builders and other tradespeople across the UK are using their KonarCard. Real profiles. Real results.
                                </p>

                                <div className="ex-tabs" role="tablist" aria-label="Filter by trade">
                                    {CATEGORIES.map((c) => {
                                        const isActive = active === c.key;
                                        return (
                                            <button
                                                key={c.key}
                                                type="button"
                                                role="tab"
                                                aria-selected={isActive}
                                                className={`kc-tabPill${isActive ? " is-active" : ""}`}
                                                onClick={() => setActive(c.key)}
                                            >
                                                {c.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* ── EXAMPLES GRID ────────────────────────────── */}
                <section className="ex-gridSection" aria-label="Example profiles">
                    <div className="ex-container">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={active}
                                className="ex-grid"
                                role="list"
                                aria-label={`${active === "all" ? "All" : active} examples`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.18, ease: EASE }}
                            >
                                {visible.map((item, i) => (
                                    <motion.article
                                        key={item.id}
                                        className="ex-card"
                                        role="listitem"
                                        custom={i}
                                        variants={cardVariant}
                                        initial="hidden"
                                        animate="show"
                                        exit="exit"
                                    >
                                        <Link
                                            to={`/u/${item.slug}`}
                                            className="ex-cardLink"
                                            aria-label={`View ${item.name} profile`}
                                        >
                                            {/* Padded image area */}
                                            <div className="ex-media">
                                                <div className="ex-imgWrap">
                                                    <span className="ex-rolePill">{item.role}</span>
                                                    <img
                                                        src={item.img}
                                                        alt={`${item.name}, ${item.role} KonarCard profile example`}
                                                        className="ex-img"
                                                        loading="lazy"
                                                        decoding="async"
                                                    />
                                                </div>
                                            </div>

                                            {/* Body */}
                                            <div className="ex-body">
                                                <p className="kc-title ex-name">{item.name}</p>
                                                <p className="body ex-desc">{item.desc}</p>
                                                <span className="ex-viewCta">View profile →</span>
                                            </div>
                                        </Link>
                                    </motion.article>
                                ))}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </section>

                {/* ── CTA ──────────────────────────────────────── */}
                <section className="ex-cta" aria-label="Claim your link">
                    <motion.div
                        className="ex-container ex-ctaInner"
                        {...fadeUpInView(0)}
                    >
                        <p className="kc-pill ex-ctaPill">Start now</p>
                        <h2 className="h3 ex-ctaTitle">Ready to make yours?</h2>
                        <p className="kc-subheading ex-ctaSub">
                            Claim your KonarCard link, build your profile, then order your card when you're ready.
                        </p>
                        <div className="ex-ctaBtns">
                            <Link to="/register" className="kx-btn kx-btn--black">
                                Claim Your Link
                            </Link>
                        </div>
                    </motion.div>
                </section>

            </main>

            <Footer />
        </>
    );
}
