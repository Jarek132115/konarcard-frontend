import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

import "../../styling/fonts.css";
import "../../styling/pricing.css";

/* Icons */
import WorksOnEveryPhone from "../../assets/icons/Works_On_Every_Phone.svg";
import EasyToUpdateAnytime from "../../assets/icons/Easy_To_Update_Anytime.svg";
import NoAppNeeded from "../../assets/icons/No_App_Needed.svg";
import BuiltForRealTrades from "../../assets/icons/Built_For_Real_Trades.svg";

export default function Pricing() {
    const [billing, setBilling] = useState("monthly"); // monthly | quarterly | yearly
    const [loadingKey, setLoadingKey] = useState(null);
    const navigate = useNavigate();

    /* ---------------- Prices (display only) ---------------- */
    const prices = useMemo(() => ({
        monthly: {
            free: { price: "£0", sub: "No monthly cost" },
            plus: { price: "£4.95", sub: "per month" },
            teams: { price: "£19.95", sub: "per month" },
            note: "Billed monthly. Cancel anytime.",
        },
        quarterly: {
            free: { price: "£0", sub: "No monthly cost" },
            plus: { price: "£13.95", sub: "per quarter" },
            teams: { price: "£54.95", sub: "per quarter" },
            note: "Billed every 3 months. Cancel anytime.",
        },
        yearly: {
            free: { price: "£0", sub: "No yearly cost" },
            plus: { price: "£49.95", sub: "per year" },
            teams: { price: "£189.95", sub: "per year" },
            note: "Best value. Billed yearly.",
        },
    }), []);

    const p = prices[billing];

    /* ---------------- Auth helpers ---------------- */
    const getToken = () => {
        try {
            return localStorage.getItem("token") || "";
        } catch {
            return "";
        }
    };

    const isLoggedIn = () => !!getToken();

    const apiBase = import.meta.env.VITE_API_URL;

    /* ---------------- Stripe subscription ---------------- */
    const startSubscription = async (planKey) => {
        if (!isLoggedIn()) {
            navigate("/register");
            return;
        }

        setLoadingKey(planKey);

        try {
            const res = await fetch(`${apiBase}/api/subscribe`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getToken()}`,
                },
                credentials: "include",
                body: JSON.stringify({ planKey }),
            });

            const data = await res.json();

            if (!res.ok || data?.error) {
                throw new Error(data?.error || "Failed to start checkout");
            }

            if (!data?.url) {
                throw new Error("Stripe session URL missing");
            }

            window.location.href = data.url;
        } catch (err) {
            alert(err.message || "Subscription failed");
            setLoadingKey(null);
        }
    };

    /* ---------------- Plan cards ---------------- */
    const planCards = useMemo(() => [
        {
            key: "free",
            title: "Individual",
            price: p.free.price,
            sub: p.free.sub,
            highlights: [
                "Claim your unique KonarCard link",
                "Basic profile & contact buttons",
                "QR code sharing",
                "Works on iPhone & Android",
            ],
            cta: { label: "Get started free", to: "/register" },
        },
        {
            key: "plus",
            title: "Plus Plan",
            price: p.plus.price,
            sub: p.plus.sub,
            featured: true,
            highlights: [
                "Full profile customisation",
                "Services & pricing sections",
                "Photo gallery",
                "Reviews & ratings",
                "Unlimited edits",
            ],
            action: () => startSubscription(`plus-${billing}`),
            cta: { label: "Start Plus Plan" },
        },
        {
            key: "teams",
            title: "Teams Plan",
            price: p.teams.price,
            sub: p.teams.sub,
            highlights: [
                "Multiple team profiles",
                "Role & staff management",
                "Centralised branding",
                "Built for growing businesses",
            ],
            action: () => startSubscription(`teams-${billing}`),
            cta: { label: "Start Teams Plan" },
        },
    ], [billing, p]);

    /* ---------------- Render ---------------- */
    return (
        <>
            <Navbar />

            <main className="kc-pricing">
                {/* HERO */}
                <section className="kc-pricing__hero">
                    <div className="kc-pricing__heroInner">
                        <h1 className="h2 kc-pricing__title">
                            Simple pricing that pays
                            <br />for itself
                        </h1>
                        <p className="body-s kc-pricing__subtitle">
                            Start free. Upgrade only when it’s worth it.
                        </p>

                        <div className="kc-pricing__tabs">
                            {["monthly", "quarterly", "yearly"].map((v) => (
                                <button
                                    key={v}
                                    className={`kc-pricing__tab pill ${billing === v ? "is-active" : ""}`}
                                    onClick={() => setBilling(v)}
                                >
                                    {v.charAt(0).toUpperCase() + v.slice(1)}
                                </button>
                            ))}
                        </div>

                        <p className="body-s kc-pricing__note">{p.note}</p>
                    </div>
                </section>

                {/* PLANS */}
                <section className="kc-pricing__plans">
                    <div className="kc-pricing__grid">
                        {planCards.map((card) => (
                            <article
                                key={card.key}
                                className={`kc-pricing__card ${card.featured ? "is-featured" : ""}`}
                            >
                                <h3 className="h6">{card.title}</h3>

                                <div className="kc-pricing__priceRow">
                                    <span className="kc-pricing__price">{card.price}</span>
                                    <span className="body-s">{card.sub}</span>
                                </div>

                                <ul className="kc-pricing__list">
                                    {card.highlights.map((h) => (
                                        <li key={h}>{h}</li>
                                    ))}
                                </ul>

                                {card.action ? (
                                    <button
                                        className="kc-pricing__cta is-primary"
                                        onClick={card.action}
                                        disabled={!!loadingKey}
                                    >
                                        {loadingKey ? "Redirecting…" : card.cta.label}
                                    </button>
                                ) : (
                                    <Link to={card.cta.to} className="kc-pricing__cta is-secondary">
                                        {card.cta.label}
                                    </Link>
                                )}
                            </article>
                        ))}
                    </div>
                </section>

                {/* VALUE */}
                <section className="kc-pricing__value">
                    <div className="kc-pricing__valueGrid">
                        <img src={WorksOnEveryPhone} alt="" />
                        <img src={EasyToUpdateAnytime} alt="" />
                        <img src={NoAppNeeded} alt="" />
                        <img src={BuiltForRealTrades} alt="" />
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
}
