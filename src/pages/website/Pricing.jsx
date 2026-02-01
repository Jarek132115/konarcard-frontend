// frontend/src/pages/website/Pricing.jsx
import React, { useEffect, useMemo, useState } from "react";
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

// ✅ Canonical backend base URL
import { BASE_URL } from "../../services/api";

const CHECKOUT_INTENT_KEY = "konar_checkout_intent_v1";

function safeGetToken() {
    try {
        return localStorage.getItem("token") || "";
    } catch {
        return "";
    }
}

function clearLocalAuth() {
    try {
        localStorage.removeItem("token");
        localStorage.removeItem("authUser"); // your AuthContext cache key
        localStorage.removeItem(CHECKOUT_INTENT_KEY);
    } catch {
        // ignore
    }
}

// tiny JWT exp check (so expired tokens don’t count as logged in)
function isTokenExpired(token) {
    try {
        const parts = token.split(".");
        if (parts.length !== 3) return false;

        const payload = JSON.parse(
            decodeURIComponent(
                atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))
                    .split("")
                    .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                    .join("")
            )
        );

        const exp = Number(payload?.exp || 0);
        if (!exp) return false;

        // exp is seconds
        return Date.now() >= exp * 1000;
    } catch {
        return false;
    }
}

function isLoggedIn() {
    const t = safeGetToken();
    if (!t) return false;

    // if expired => clear it so UI becomes logged out immediately
    if (isTokenExpired(t)) {
        clearLocalAuth();
        return false;
    }

    return true;
}

function formatDate(d) {
    if (!d) return "";
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return "";
    return dt.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function planRank(plan) {
    if (plan === "teams") return 2;
    if (plan === "plus") return 1;
    return 0;
}

export default function Pricing() {
    const [billing, setBilling] = useState("monthly"); // monthly | quarterly | yearly
    const [loadingKey, setLoadingKey] = useState(null);
    const [subLoading, setSubLoading] = useState(false);
    const [subErr, setSubErr] = useState("");
    const [subState, setSubState] = useState(null);

    const navigate = useNavigate();
    const apiBase = BASE_URL;

    /* ---------------- Prices (display only) ---------------- */
    const prices = useMemo(
        () => ({
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
        }),
        []
    );

    const p = prices[billing];

    /* ---------------- Subscription status ---------------- */
    useEffect(() => {
        let mounted = true;

        async function loadStatus() {
            if (!apiBase) return;

            // if no valid token -> treat logged out
            if (!isLoggedIn()) {
                if (!mounted) return;
                setSubState(null);
                setSubErr("");
                setSubLoading(false);
                return;
            }

            try {
                setSubLoading(true);
                setSubErr("");

                const token = safeGetToken();

                const res = await fetch(`${apiBase}/api/subscription-status`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    credentials: "include",
                });

                const data = await res.json().catch(() => ({}));

                // ✅ If user deleted / token invalid => backend often returns 401 or 404
                if (res.status === 401 || res.status === 404) {
                    clearLocalAuth();
                    if (!mounted) return;
                    setSubState(null);
                    setSubErr("");
                    return;
                }

                if (!res.ok) {
                    throw new Error(data?.error || "Failed to load subscription status");
                }

                if (!mounted) return;

                setSubState({
                    active: !!data?.active,
                    plan: data?.plan || "free",
                    interval: data?.interval || "monthly",
                    status: data?.status || "free",
                    currentPeriodEnd: data?.currentPeriodEnd || null,
                });
            } catch (e) {
                if (!mounted) return;
                setSubErr(e?.message || "Failed to load subscription status");
                setSubState(null);
            } finally {
                if (mounted) setSubLoading(false);
            }
        }

        loadStatus();
        return () => {
            mounted = false;
        };
    }, [apiBase]);

    const currentPlan = subState?.plan || "free";
    const isActive = !!subState?.active;
    const currentPeriodEnd = subState?.currentPeriodEnd ? new Date(subState.currentPeriodEnd) : null;

    const hasFutureAccess =
        !!currentPeriodEnd && !Number.isNaN(currentPeriodEnd.getTime()) && currentPeriodEnd.getTime() > Date.now();

    const activeUntilLabel = hasFutureAccess ? formatDate(currentPeriodEnd) : "";

    const planStatusLine = useMemo(() => {
        if (!isLoggedIn()) return "";
        if (!subState) return "";
        if (currentPlan === "free" && !isActive) return "You’re on the Free plan.";
        if (hasFutureAccess) return `Active until ${activeUntilLabel}`;
        if (isActive) return "Active";
        return "Inactive";
    }, [subState, currentPlan, isActive, hasFutureAccess, activeUntilLabel]);

    /* ---------------- Helpers: intent storage ---------------- */
    const saveCheckoutIntent = (planKey) => {
        try {
            const returnUrl = `${window.location.origin}/myprofile?subscribed=1`;
            const intent = {
                planKey,
                createdAt: Date.now(),
                returnUrl,
                successReturn: returnUrl,
                cancelReturn: `${window.location.origin}/pricing`,
            };
            localStorage.setItem(CHECKOUT_INTENT_KEY, JSON.stringify(intent));
        } catch {
            // ignore
        }
    };

    /* ---------------- Stripe subscription: start checkout ---------------- */
    const startSubscription = async (planKey) => {
        // if no valid token -> push to login and store intent
        if (!isLoggedIn()) {
            saveCheckoutIntent(planKey);
            navigate("/login");
            return;
        }

        // prevent selecting same plan
        if (isActive && currentPlan === planKey.split("-")[0]) {
            alert("You’re already subscribed to this plan.");
            return;
        }

        setLoadingKey(planKey);

        try {
            const token = safeGetToken();
            const returnUrl = `${window.location.origin}/myprofile?subscribed=1`;

            const res = await fetch(`${apiBase}/api/subscribe`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                credentials: "include",
                body: JSON.stringify({ planKey, returnUrl }),
            });

            const data = await res.json().catch(() => ({}));

            // ✅ If user deleted / token invalid => log out and send to login
            if (res.status === 401 || res.status === 404 || /user not found/i.test(String(data?.error || ""))) {
                clearLocalAuth();
                alert("Your session is no longer valid. Please log in again.");
                navigate("/login", { replace: true });
                return;
            }

            if (!res.ok || data?.error) throw new Error(data?.error || "Failed to start checkout");
            if (!data?.url) throw new Error("Stripe session URL missing");

            // clear old intent now that we’re going to Stripe
            try {
                localStorage.removeItem(CHECKOUT_INTENT_KEY);
            } catch {
                // ignore
            }

            window.location.href = data.url;
        } catch (err) {
            alert(err?.message || "Subscription failed");
        } finally {
            setLoadingKey(null);
        }
    };

    /* ---------------- Billing portal ---------------- */
    const openBillingPortal = async () => {
        if (!isLoggedIn()) {
            navigate("/login");
            return;
        }

        try {
            const token = safeGetToken();

            const res = await fetch(`${apiBase}/api/billing-portal`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                credentials: "include",
                body: JSON.stringify({}),
            });

            const data = await res.json().catch(() => ({}));

            if (res.status === 401 || res.status === 404) {
                clearLocalAuth();
                navigate("/login", { replace: true });
                return;
            }

            if (!res.ok || data?.error) throw new Error(data?.error || "Could not open billing portal");
            if (!data?.url) throw new Error("Billing portal URL missing");

            window.location.href = data.url;
        } catch (e) {
            alert(e?.message || "Billing portal is not available yet.");
        }
    };

    /* ---------------- Button logic per plan ---------------- */
    const getPlanButton = (planName, planKeyForPaid) => {
        const logged = isLoggedIn();

        if (!logged) {
            if (planName === "free") {
                return {
                    type: "link",
                    label: "Get started free",
                    to: "/register",
                    disabled: false,
                    helper: "",
                };
            }
            return {
                type: "button",
                label: `Continue to ${planName === "plus" ? "Plus" : "Teams"}`,
                onClick: () => startSubscription(planKeyForPaid),
                disabled: !!loadingKey,
                helper: "Login required",
            };
        }

        const current = currentPlan;
        const stillHasPaidAccess = current !== "free" && (isActive || hasFutureAccess);

        if (planName === current && stillHasPaidAccess) {
            return {
                type: "button",
                label: hasFutureAccess ? `Active until ${activeUntilLabel}` : "Active",
                onClick: null,
                disabled: true,
                helper: "",
            };
        }

        if (planName === "free") {
            if (stillHasPaidAccess) {
                return {
                    type: "button",
                    label: "Switch to Free",
                    onClick: openBillingPortal,
                    disabled: !!loadingKey || subLoading,
                    helper: hasFutureAccess ? `Paid plan stays active until ${activeUntilLabel}` : "Manage downgrade in Billing",
                };
            }

            if (current === "free") {
                return {
                    type: "button",
                    label: "Current plan",
                    onClick: null,
                    disabled: true,
                    helper: "",
                };
            }

            return {
                type: "button",
                label: "Choose Free",
                onClick: openBillingPortal,
                disabled: false,
                helper: "",
            };
        }

        const targetPlan = planName;
        const isUpgrade = planRank(targetPlan) > planRank(current);
        const isDowngrade = planRank(targetPlan) < planRank(current);

        if (isDowngrade) {
            return {
                type: "button",
                label: "Downgrade (Billing)",
                onClick: openBillingPortal,
                disabled: !!loadingKey || subLoading,
                helper: hasFutureAccess ? `Current plan active until ${activeUntilLabel}` : "",
            };
        }

        if (isUpgrade && current !== "free" && stillHasPaidAccess) {
            return {
                type: "button",
                label: "Upgrade (Billing)",
                onClick: openBillingPortal,
                disabled: !!loadingKey || subLoading,
                helper: "",
            };
        }

        return {
            type: "button",
            label: isUpgrade ? "Upgrade" : "Choose plan",
            onClick: () => startSubscription(planKeyForPaid),
            disabled: !!loadingKey || subLoading,
            helper: "",
        };
    };

    /* ---------------- Plan cards ---------------- */
    const planCards = useMemo(() => {
        const plusKey = `plus-${billing}`;
        const teamsKey = `teams-${billing}`;

        return [
            {
                key: "free",
                title: "Individual",
                price: p.free.price,
                sub: p.free.sub,
                featured: false,
                highlights: ["Claim your unique KonarCard link", "Basic profile & contact buttons", "QR code sharing", "Works on iPhone & Android"],
                button: getPlanButton("free"),
            },
            {
                key: "plus",
                title: "Plus Plan",
                price: p.plus.price,
                sub: p.plus.sub,
                featured: true,
                highlights: ["Full profile customisation", "Services & pricing sections", "Photo gallery", "Reviews & ratings", "Unlimited edits"],
                button: getPlanButton("plus", plusKey),
            },
            {
                key: "teams",
                title: "Teams Plan",
                price: p.teams.price,
                sub: p.teams.sub,
                featured: false,
                highlights: ["Multiple team profiles", "Role & staff management", "Centralised branding", "Built for growing businesses"],
                button: getPlanButton("teams", teamsKey),
            },
        ];
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [billing, p, currentPlan, isActive, hasFutureAccess, activeUntilLabel, loadingKey, subLoading]);

    return (
        <>
            <Navbar />

            <main className="kc-pricing">
                <section className="kc-pricing__hero">
                    <div className="kc-pricing__heroInner">
                        <h1 className="h2 kc-pricing__title">
                            Simple pricing that pays
                            <br />
                            for itself
                        </h1>

                        <p className="body-s kc-pricing__subtitle">Start free. Upgrade only when it’s worth it.</p>

                        {isLoggedIn() && (
                            <div style={{ marginTop: 10 }}>
                                {subLoading ? (
                                    <p className="body-s kc-pricing__note">Checking your plan…</p>
                                ) : subErr ? (
                                    <p className="body-s kc-pricing__note" style={{ color: "#b91c1c" }}>
                                        {subErr}
                                    </p>
                                ) : (
                                    <p className="body-s kc-pricing__note">{planStatusLine}</p>
                                )}
                            </div>
                        )}

                        <div className="kc-pricing__tabs">
                            {["monthly", "quarterly", "yearly"].map((v) => (
                                <button
                                    key={v}
                                    type="button"
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

                <section className="kc-pricing__plans">
                    <div className="kc-pricing__grid">
                        {planCards.map((card) => {
                            const btn = card.button;
                            const isFeatured = card.featured ? "is-featured" : "";
                            const btnClass = `kc-pricing__cta ${card.featured ? "is-primary" : "is-secondary"}`;

                            return (
                                <article key={card.key} className={`kc-pricing__card ${isFeatured}`}>
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

                                    <div style={{ display: "grid", gap: 8 }}>
                                        {btn.type === "link" ? (
                                            <Link to={btn.to} className={btnClass}>
                                                {btn.label}
                                            </Link>
                                        ) : (
                                            <button
                                                type="button"
                                                className={btnClass}
                                                onClick={btn.onClick || undefined}
                                                disabled={!!btn.disabled}
                                                aria-disabled={!!btn.disabled}
                                                style={btn.disabled ? { opacity: 0.7, cursor: "not-allowed" } : undefined}
                                            >
                                                {loadingKey ? "Redirecting…" : btn.label}
                                            </button>
                                        )}

                                        {btn.helper ? (
                                            <p className="body-s" style={{ margin: 0, opacity: 0.75 }}>
                                                {btn.helper}
                                            </p>
                                        ) : null}

                                        {isLoggedIn() && card.key !== "free" && currentPlan !== "free" ? (
                                            <button
                                                type="button"
                                                onClick={openBillingPortal}
                                                style={{
                                                    border: "none",
                                                    background: "transparent",
                                                    padding: 0,
                                                    textDecoration: "underline",
                                                    cursor: "pointer",
                                                    fontSize: 13,
                                                    opacity: 0.8,
                                                    textAlign: "left",
                                                }}
                                            >
                                                Manage plan in Billing
                                            </button>
                                        ) : null}
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </section>

                <section className="kc-pricing__value">
                    <div className="kc-pricing__valueGrid">
                        <img src={WorksOnEveryPhone} alt="Works on every phone" />
                        <img src={EasyToUpdateAnytime} alt="Easy to update anytime" />
                        <img src={NoAppNeeded} alt="No app needed" />
                        <img src={BuiltForRealTrades} alt="Built for real trades" />
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
}
