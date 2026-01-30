// frontend/src/pages/website/Products.jsx
import React, { useMemo } from "react";
import { Link } from "react-router-dom";

import Navbar from "../../components/Navbar";
import Breadcrumbs from "../../components/Breadcrumbs";
import Footer from "../../components/Footer";

import "../../styling/products.css";

/* Icons you already use elsewhere */
import WorksOnEveryPhone from "../../assets/icons/Works_On_Every_Phone.svg";
import NoAppNeeded from "../../assets/icons/No_App_Needed.svg";
import OneLinkForEverything from "../../assets/icons/One_Link_For_Everything.svg";
import EasyToUpdateAnytime from "../../assets/icons/Easy_To_Update_Anytime.svg";
import BuiltForRealTrades from "../../assets/icons/Built_For_Real_Trades.svg";
import LooksProfessional from "../../assets/icons/Looks_Professional.svg";

/* If you have real product images, replace these paths with yours */
import PlasticCardImg from "../../assets/images/Plastic-Card.png";
import MetalCardImg from "../../assets/images/Metal-Card.png";
import TagImg from "../../assets/images/KonarTag.png";
import BundleImg1 from "../../assets/images/Bundle-1.png";
import BundleImg2 from "../../assets/images/Bundle-2.png";
import CompareMetal from "../../assets/images/Compare-Metal.png";
import ComparePlastic from "../../assets/images/Compare-Plastic.png";
import CompareCustom from "../../assets/images/Compare-Custom.png";

/* Small UI icons */
import ToolIcon from "../../assets/icons/Tools-Icon.svg";
import QuoteIcon from "../../assets/icons/Quote-Icon.svg";
import CounterIcon from "../../assets/icons/Chat-Icon.svg";
import QrIcon from "../../assets/icons/QR-Code-Icon.svg";
import LinkIcon from "../../assets/icons/Link-Icon.svg";
import BoltIcon from "../../assets/icons/Bolt-Icon.svg";

export default function Products() {
    const topFeatures = useMemo(
        () => [
            {
                icon: WorksOnEveryPhone,
                title: "Works on every phone",
                desc: "Compatible with iPhone & Android — no issues, no setup.",
            },
            {
                icon: NoAppNeeded,
                title: "No app needed",
                desc: "Just tap or scan — nothing to download.",
            },
            {
                icon: OneLinkForEverything,
                title: "One link for everything",
                desc: "Details, photos, prices, and contact options in one place.",
            },
            {
                icon: EasyToUpdateAnytime,
                title: "Easy to update anytime",
                desc: "Change details instantly without reprinting cards.",
            },
            {
                icon: BuiltForRealTrades,
                title: "Built for real trades",
                desc: "Designed for everyday use on real jobs, not offices.",
            },
            {
                icon: LooksProfessional,
                title: "Looks professional",
                desc: "Make a strong first impression every time you share.",
            },
        ],
        []
    );

    const products = useMemo(
        () => [
            {
                badge: "Best seller",
                image: PlasticCardImg,
                name: "KonarCard — Plastic Edition",
                desc:
                    "Lightweight, durable, and perfect for everyday use. NFC + QR built in.",
                price: "£29.99",
            },
            {
                badge: null,
                image: MetalCardImg,
                name: "KonarCard — Metal Edition",
                desc:
                    "Premium feel with a strong first impression. Built to last and look sharp.",
                price: "£49.99",
            },
            {
                badge: null,
                image: TagImg,
                name: "KonarTag",
                desc:
                    "Clip it to your keys. Tap-to-share your profile anywhere you go.",
                price: "£19.99",
            },
        ],
        []
    );

    const bundles = useMemo(
        () => [
            {
                badge: "Best value",
                image: BundleImg1,
                name: "KonarCard Bundle (2 Pack)",
                desc:
                    "Everything you need to share your profile everywhere — at a better price.",
                price: "£49.99",
                oldPrice: "£59.98",
            },
            {
                badge: "Best value",
                image: BundleImg2,
                name: "KonarCard Bundle (3 Pack)",
                desc:
                    "For work van, wallet, and backup. Keep sharing without thinking.",
                price: "£69.99",
                oldPrice: "£89.97",
            },
        ],
        []
    );

    const realWorld = useMemo(
        () => [
            {
                icon: ToolIcon,
                title: "On Site, With a Client",
                desc:
                    "Tap your KonarCard. Their phone opens your profile and saves your details instantly — no typing, no fuss.",
            },
            {
                icon: QuoteIcon,
                title: "After a Quote",
                desc:
                    "Send your link by WhatsApp/SMS so they can review your services, photos, and reviews later.",
            },
            {
                icon: CounterIcon,
                title: "Networking / Trade Counter",
                desc:
                    "No stacks of cards. One tap per person, as many times as you want.",
            },
            {
                icon: QrIcon,
                title: "Van QR & Site Boards",
                desc:
                    "Add your QR code to your van or boards so people can view your work and contact you fast.",
            },
            {
                icon: LinkIcon,
                title: "Social & Link in Bio",
                desc:
                    "Add your KonarCard link to Instagram, Facebook, or TikTok so new leads land on your best info.",
            },
            {
                icon: BoltIcon,
                title: "Updates in Seconds",
                desc:
                    "Change prices, photos, or details once — your card always shares the latest version everywhere.",
            },
        ],
        []
    );

    const compare = useMemo(
        () => [
            {
                image: CompareMetal,
                title: "Metal Cards",
                desc: "Best if you want a premium feel and strong first impression.",
            },
            {
                image: ComparePlastic,
                title: "Plastic Cards",
                desc: "Lightweight, affordable, and perfect for everyday use.",
            },
            {
                image: CompareCustom,
                title: "Custom Logo Cards",
                desc: "Ideal for established businesses that want branded cards.",
            },
        ],
        []
    );

    return (
        <>
            <Navbar />

            <div style={{ marginTop: 20 }} className="section-breadcrumbs">
                <Breadcrumbs />
            </div>

            {/* HERO */}
            <section className="pd-hero">
                <p className="pd-kicker">Cards that are built for real jobs.</p>
                <h1 className="pd-h1">Shop KonarCards</h1>
                <p className="pd-sub">
                    Physical NFC business cards that link directly to your KonarCard
                    profile.
                </p>
            </section>

            {/* FEATURE ROW */}
            <section className="pd-featureRowWrap">
                <div className="pd-featureRow">
                    {topFeatures.map((f) => (
                        <div className="pd-feature" key={f.title}>
                            <img className="pd-featureIcon" src={f.icon} alt="" />
                            <div className="pd-featureText">
                                <p className="pd-featureTitle">{f.title}</p>
                                <p className="pd-featureDesc">{f.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* PRODUCTS */}
            <section className="pd-section">
                <div className="pd-grid3">
                    {products.map((p) => (
                        <div className="pd-card" key={p.name}>
                            {p.badge && <span className="pd-badge">{p.badge}</span>}
                            <div className="pd-imgWrap">
                                <img src={p.image} alt={p.name} className="pd-img" />
                            </div>
                            <div className="pd-cardBody">
                                <p className="pd-cardTitle">{p.name}</p>
                                <p className="pd-cardDesc">{p.desc}</p>
                                <div className="pd-priceRow">
                                    <span className="pd-price">{p.price}</span>
                                </div>

                                <Link to="/register" className="pd-btn pd-btnPrimary">
                                    Buy now
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* BUNDLES */}
            <section className="pd-bundles">
                <h2 className="pd-h2">Save More With KonarCard Bundles</h2>
                <p className="pd-sub2">
                    Everything you need to share your profile everywhere — at a better
                    price.
                </p>

                <div className="pd-grid2">
                    {bundles.map((b) => (
                        <div className="pd-card pd-cardWide" key={b.name}>
                            {b.badge && <span className="pd-badge">{b.badge}</span>}
                            <div className="pd-imgWrap pd-imgWrapWide">
                                <img src={b.image} alt={b.name} className="pd-img" />
                            </div>

                            <div className="pd-cardBody">
                                <p className="pd-cardTitle">{b.name}</p>
                                <p className="pd-cardDesc">{b.desc}</p>

                                <div className="pd-priceRow">
                                    <span className="pd-price">{b.price}</span>
                                    {b.oldPrice && <span className="pd-oldPrice">{b.oldPrice}</span>}
                                </div>

                                <Link to="/register" className="pd-btn pd-btnPrimary">
                                    Buy bundle
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* REAL WORLD */}
            <section className="pd-real">
                <h2 className="pd-h2">How you’ll use it in the Real World</h2>
                <p className="pd-sub2">
                    Your KonarCard profile puts your work, reviews, and contact details in
                    one place — so customers can quickly see you’re legit and get in touch
                    without friction.
                </p>

                <div className="pd-realGrid">
                    {realWorld.map((x) => (
                        <div className="pd-realCard" key={x.title}>
                            <div className="pd-realTop">
                                <img className="pd-realIcon" src={x.icon} alt="" />
                                <p className="pd-realTitle">{x.title}</p>
                            </div>
                            <p className="pd-realDesc">{x.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* COMPARE */}
            <section className="pd-compare">
                <h2 className="pd-h2">Not sure which card to choose?</h2>
                <p className="pd-sub2">
                    Pick the card that fits how you work — all cards link to the same
                    powerful profile.
                </p>

                <div className="pd-grid3">
                    {compare.map((c) => (
                        <div className="pd-card" key={c.title}>
                            <div className="pd-imgWrap">
                                <img src={c.image} alt={c.title} className="pd-img" />
                            </div>
                            <div className="pd-cardBody">
                                <p className="pd-cardTitle">{c.title}</p>
                                <p className="pd-cardDesc">{c.desc}</p>
                                <Link to="/contactus" className="pd-btn pd-btnGhost">
                                    Ask us
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <Footer />
        </>
    );
}
