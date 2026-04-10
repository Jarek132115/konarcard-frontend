import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Input } from "@base-ui/react/input";
import { Slider } from "@base-ui/react/slider";

import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Home/Footer";
import PlasticCard3D from "../../../components/PlasticCard3D";

import "../../../styling/fonts.css";
import "../../../styling/products/konarcard.css";
import "../../../styling/home/value.css";

import CardQrCode from "../../../assets/images/CardQrCode.png";

import api from "../../../services/api";
import { useMyProfiles } from "../../../hooks/useBusinessCard";

import OneJobIcon from "../../../assets/icons/OneJob.svg";
import NoReprintsIcon from "../../../assets/icons/NoReprints.svg";
import UpToDateIcon from "../../../assets/icons/UpToDate.svg";
import WorksEverywhereIcon from "../../../assets/icons/WorksEverywhere.svg";
import HammerIcon from "../../../assets/icons/Hammer.svg";
import ProfessionalFastIcon from "../../../assets/icons/ProfessionalFast.svg";

const INTENT_KEY = "konar_nfc_intent_v1";
const UNIT_PRICE = 19.99;
const MIN_FONT_SIZE = 18;
const MAX_FONT_SIZE = 72;
const MAX_FRONT_TEXT = 22;

const WEIGHT_OPTIONS = [
    { key: "regular", label: "Regular", value: 500 },
    { key: "medium", label: "Medium", value: 600 },
    { key: "bold", label: "Bold", value: 700 },
];

function readIntent() {
    try {
        const raw = localStorage.getItem(INTENT_KEY);
        if (!raw) return null;

        const intent = JSON.parse(raw);
        if (!intent?.productKey) return null;

        const age = Date.now() - Number(intent.createdAt || intent.updatedAt || 0);
        if (Number.isFinite(age) && age > 30 * 60 * 1000) {
            localStorage.removeItem(INTENT_KEY);
            return null;
        }

        return intent;
    } catch {
        return null;
    }
}

function writeIntent(v) {
    try {
        if (!v) {
            localStorage.removeItem(INTENT_KEY);
            return;
        }

        const existing = readIntent();
        localStorage.setItem(
            INTENT_KEY,
            JSON.stringify({
                ...(existing && typeof existing === "object" ? existing : {}),
                ...v,
                createdAt: v?.createdAt || existing?.createdAt || Date.now(),
                updatedAt: Date.now(),
            })
        );
    } catch {
        // ignore
    }
}

function clearIntent() {
    try {
        localStorage.removeItem(INTENT_KEY);
    } catch {
        // ignore
    }
}

function buildCardsProductUrl(productKey) {
    const safe = String(productKey || "").trim();
    return safe ? `/cards?product=${encodeURIComponent(safe)}` : "/cards";
}

function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
}

function formatCurrency(value) {
    return new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "GBP",
    }).format(Number(value || 0));
}

function sanitizeFrontText(value) {
    return String(value || "").slice(0, MAX_FRONT_TEXT);
}

export default function PlasticCardPageBase({
    productKey,
    productName,
    crumbName,
    heroSubtext,
    badgeText,
    frontSrc,
    backSrc,
    edgeColor,
    frontTextColor = "#111111",
    variant,
    styleKey,
    frontTemplate,
    backTemplate,
}) {
    const navigate = useNavigate();
    const location = useLocation();

    const RETURN_TO = buildCardsProductUrl(productKey);

    const [qty, setQty] = useState(1);
    const [profileId, setProfileId] = useState("");
    const [frontText, setFrontText] = useState("KONAR");
    const [frontFontWeight, setFrontFontWeight] = useState(700);
    const [fontSize, setFontSize] = useState(42);
    const [errorMsg, setErrorMsg] = useState("");
    const [infoMsg, setInfoMsg] = useState("");
    const [busy, setBusy] = useState(false);

    const isLoggedIn = (() => {
        try {
            return !!localStorage.getItem("token");
        } catch {
            return false;
        }
    })();

    const profilesQuery = useMyProfiles();
    const isProfilesLoading = !!profilesQuery?.isLoading;

    const myProfiles = (() => {
        const d = profilesQuery?.data;
        if (Array.isArray(d)) return d;
        if (Array.isArray(d?.data)) return d.data;
        if (Array.isArray(d?.data?.data)) return d.data.data;
        return [];
    })();

    const totalPrice = useMemo(() => qty * UNIT_PRICE, [qty]);

    const features = useMemo(
        () => [
            {
                icon: OneJobIcon,
                t: "One job pays for everything",
                s: "One extra job can easily cover the cost of your card.",
            },
            {
                icon: NoReprintsIcon,
                t: "No reprints, ever",
                s: "Update your details anytime — no reordering required.",
            },
            {
                icon: UpToDateIcon,
                t: "Always up to date",
                s: "Your latest work, reviews, and services stay live instantly.",
            },
            {
                icon: WorksEverywhereIcon,
                t: "Works everywhere",
                s: "In person, online, or on the phone — no apps needed.",
            },
            {
                icon: HammerIcon,
                t: "Built for real trades",
                s: "Designed for everyday work, not office desks.",
            },
            {
                icon: ProfessionalFastIcon,
                t: "Looks professional fast",
                s: "Make a strong first impression in seconds.",
            },
        ],
        []
    );

    const specs = useMemo(
        () => [
            { k: "Card size", v: "85.6 × 54 mm — standard wallet size" },
            { k: "Thickness", v: "0.76 mm — same thickness as a bank card" },
            { k: "Material", v: "Durable PVC plastic with a smooth matte finish" },
            { k: "NFC", v: "NFC enabled — works with iPhone & Android" },
            { k: "QR backup", v: "Printed QR code on the back for instant access" },
            { k: "Setup", v: "Linked to your Konar profile — update anytime, no reprints" },
        ],
        []
    );

    const persistIntent = () => {
        const existing = readIntent();

        writeIntent({
            ...(existing && typeof existing === "object" ? existing : {}),
            productKey,
            quantity: qty,
            profileId,
            frontText,
            frontFontWeight,
            fontSize,
            returnTo: RETURN_TO,
            createdAt: existing?.createdAt || Date.now(),
        });
    };

    useEffect(() => {
        const sp = new URLSearchParams(location.search);
        const checkout = sp.get("checkout");

        if (checkout === "success") {
            setErrorMsg("");
            setInfoMsg("✅ Payment received! We’ll email you confirmation shortly.");
            clearIntent();
            return;
        }

        if (checkout === "cancel") {
            setErrorMsg("Checkout cancelled. You can try again anytime.");
            setInfoMsg("");
        }
    }, [location.search]);

    useEffect(() => {
        const intent = readIntent();
        if (!intent) return;
        if (intent.productKey !== productKey) return;

        if (typeof intent.quantity === "number") {
            setQty(clamp(intent.quantity, 1, 20));
        }

        if (typeof intent.profileId === "string") {
            setProfileId(intent.profileId);
        }

        if (typeof intent.frontText === "string") {
            setFrontText(sanitizeFrontText(intent.frontText) || "KONAR");
        }

        if (typeof intent.frontFontWeight === "number") {
            setFrontFontWeight(clamp(intent.frontFontWeight, 400, 900));
        }

        if (typeof intent.fontSize === "number") {
            setFontSize(clamp(intent.fontSize, MIN_FONT_SIZE, MAX_FONT_SIZE));
        }
    }, [productKey]);

    useEffect(() => {
        if (!isLoggedIn) return;
        if (profileId) return;
        if (!Array.isArray(myProfiles) || myProfiles.length === 0) return;

        const firstId = String(myProfiles?.[0]?._id || "");
        if (firstId) setProfileId(firstId);
    }, [isLoggedIn, myProfiles, profileId]);

    useEffect(() => {
        const sp = new URLSearchParams(location.search);
        const checkout = sp.get("checkout");
        if (checkout === "success") return;

        persistIntent();
    }, [qty, profileId, frontText, frontFontWeight, fontSize, location.search]);

    const goLogin = () => {
        persistIntent();

        navigate("/login", {
            state: {
                from: RETURN_TO,
                openProductFromIntent: true,
            },
        });
    };

    const handleFontSizeChange = (value) => {
        if (Array.isArray(value)) {
            setFontSize(clamp(Number(value[0] || MIN_FONT_SIZE), MIN_FONT_SIZE, MAX_FONT_SIZE));
            return;
        }

        setFontSize(clamp(Number(value || MIN_FONT_SIZE), MIN_FONT_SIZE, MAX_FONT_SIZE));
    };

    const handleBuy = async () => {
        setErrorMsg("");
        setInfoMsg("");

        if (!isLoggedIn) {
            persistIntent();
            goLogin();
            return;
        }

        if (!myProfiles.length) {
            setErrorMsg("You need at least 1 profile before buying a card. Please create a profile first.");
            return;
        }

        if (!profileId) {
            setErrorMsg("Please create or choose a profile in your dashboard before checkout.");
            return;
        }

        const trimmedFrontText = String(frontText || "").trim();
        if (!trimmedFrontText) {
            setErrorMsg("Please add the text you want on the front of the card.");
            return;
        }

        setBusy(true);

        try {
            persistIntent();

            const resp = await api.post("/api/checkout/nfc/session", {
                productKey,
                quantity: qty,
                profileId,
                returnUrl: `${window.location.origin}${RETURN_TO}`,
                customization: {
                    frontText: trimmedFrontText,
                    fontFamily: "Cal Sans",
                    fontWeight: frontFontWeight,
                    fontSize,
                    orientation: "horizontal",
                    ...(frontTextColor !== "#111111" ? { textColor: frontTextColor } : {}),
                },
                preview: {
                    variant,
                    edition: "plastic",
                    styleKey,
                    frontTemplate,
                    backTemplate,
                    usesPresetArtwork: true,
                    customization: {
                        frontText: trimmedFrontText,
                        fontFamily: "Cal Sans",
                        fontWeight: frontFontWeight,
                        fontSize,
                        ...(frontTextColor !== "#111111" ? { textColor: frontTextColor } : {}),
                    },
                },
            });

            if (resp?.status >= 400 || !resp?.data?.url) {
                throw new Error(resp?.data?.error || "Failed to start checkout");
            }

            window.location.href = resp.data.url;
        } catch (e) {
            setErrorMsg(e?.response?.data?.error || e?.message || "Checkout failed. Please try again.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <>
            <Navbar />

            <main className="kc-konarcard kc-konarcard--premium kc-page">
                <section className="kc-topHero" aria-label={`${productName} hero`}>
                    <div className="kc-konarcard__wrap">
                        <div className="kc-heroHeadWrap kc-heroHeadWrap--lg">
                            <div className="kc-topHero__head">
                                <div className="kc-crumbPill" aria-label="Breadcrumb">
                                    <Link to="/products" className="kc-crumbPill__link">
                                        Products
                                    </Link>
                                    <span className="kc-crumbPill__sep">/</span>
                                    <span className="kc-crumbPill__here">{crumbName}</span>
                                </div>

                                <h1 className="h2 kc-premHero__title">{productName}</h1>

                                <p className="kc-premHero__sub">{heroSubtext}</p>

                                <div className="kc-topHero__badges">
                                    <span className="kc-badge kc-badge--orange">{badgeText}</span>
                                    <span className="kc-badge">12 Month Warranty</span>
                                </div>

                                {(errorMsg || infoMsg) && (
                                    <div className="kc-msgBox">{errorMsg ? `⚠️ ${errorMsg}` : `ℹ️ ${infoMsg}`}</div>
                                )}
                            </div>
                        </div>

                        <div className="kc-premStage">
                            <div className="kc-premStage__canvasPad">
                                <PlasticCard3D
                                    frontSrc={frontSrc}
                                    backSrc={backSrc}
                                    qrSrc={CardQrCode}
                                    edgeColor={edgeColor}
                                    frontText={frontText}
                                    frontFontSize={fontSize}
                                    frontFontWeight={frontFontWeight}
                                    frontTextColor={frontTextColor}
                                />
                            </div>

                            <div className="kc-controls" aria-label="Configure your card">
                                <div className="kc-controlsSplit">
                                    <div className="kc-controlsLeft">
                                        <div className="kc-controlK">Personalise your card</div>

                                        <div className="kc-fieldStack">
                                            <div className="kc-field">
                                                <label className="kc-fieldLabel" htmlFor="kc-front-text">
                                                    Front text
                                                </label>

                                                <Input
                                                    id="kc-front-text"
                                                    className="kc-input"
                                                    value={frontText}
                                                    onChange={(e) => setFrontText(sanitizeFrontText(e.target.value))}
                                                    placeholder="e.g. MichalPlumbing"
                                                    disabled={busy}
                                                    maxLength={MAX_FRONT_TEXT}
                                                    aria-describedby="kc-front-text-help"
                                                />

                                                <p id="kc-front-text-help" className="kc-helpText">
                                                    Displayed exactly as typed. Keep it short for the cleanest look.
                                                </p>
                                            </div>

                                            <div className="kc-field">
                                                <div className="kc-sliderMeta">
                                                    <div className="kc-fieldLabel">Text weight</div>
                                                    <div className="kc-sliderValue">{frontFontWeight}</div>
                                                </div>

                                                <div className="kc-segmented" role="group" aria-label="Choose text weight">
                                                    {WEIGHT_OPTIONS.map((option) => {
                                                        const isActive = option.value === frontFontWeight;

                                                        return (
                                                            <button
                                                                key={option.key}
                                                                type="button"
                                                                className={`kc-segmentedBtn ${isActive ? "is-active" : ""}`.trim()}
                                                                onClick={() => setFrontFontWeight(option.value)}
                                                                disabled={busy}
                                                                aria-pressed={isActive}
                                                            >
                                                                {option.label}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            <div className="kc-field">
                                                <div className="kc-sliderMeta">
                                                    <div className="kc-fieldLabel">Text size</div>
                                                    <div className="kc-sliderValue">{fontSize}px</div>
                                                </div>

                                                <div className="kc-sliderRow">
                                                    <Slider.Root
                                                        className="kc-sliderRoot"
                                                        min={MIN_FONT_SIZE}
                                                        max={MAX_FONT_SIZE}
                                                        step={1}
                                                        value={fontSize}
                                                        onValueChange={handleFontSizeChange}
                                                        disabled={busy}
                                                        aria-label="Text size"
                                                    >
                                                        <Slider.Control className="kc-sliderControl">
                                                            <Slider.Track className="kc-sliderTrack">
                                                                <Slider.Indicator className="kc-sliderRange" />
                                                                <Slider.Thumb
                                                                    className="kc-sliderThumb"
                                                                    aria-label="Text size"
                                                                />
                                                            </Slider.Track>
                                                        </Slider.Control>
                                                    </Slider.Root>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="kc-controlsRight" aria-label="Buy">
                                        <div className="kc-controlK kc-controlK--left">Buy your card</div>

                                        <div className="kc-buyArea">
                                            <div className="kc-buyMeta">
                                                <div className="kc-buyPrice">{formatCurrency(totalPrice)}</div>
                                                <div className="kc-buyUnit">{formatCurrency(UNIT_PRICE)} each</div>
                                                <div className="kc-buyTotal">
                                                    Total for {qty} {qty === 1 ? "card" : "cards"}
                                                </div>
                                            </div>

                                            <div className="kc-buyControls">
                                                <div className="kc-qtySm" aria-label="Quantity">
                                                    <button
                                                        type="button"
                                                        className="kc-qtySm__btn"
                                                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                                                        disabled={busy}
                                                        aria-label="Decrease quantity"
                                                    >
                                                        −
                                                    </button>

                                                    <div className="kc-qtySm__val">{qty}</div>

                                                    <button
                                                        type="button"
                                                        className="kc-qtySm__btn"
                                                        onClick={() => setQty((q) => Math.min(20, q + 1))}
                                                        disabled={busy}
                                                        aria-label="Increase quantity"
                                                    >
                                                        +
                                                    </button>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={handleBuy}
                                                    className="kx-btn kx-btn--black kc-buyBtnFit"
                                                    disabled={busy}
                                                >
                                                    {busy ? "Starting checkout..." : "Buy KonarCard"}
                                                </button>

                                                <p className="kc-buyReassure">
                                                    Works with iPhone & Android. QR backup included. Profile is linked from your dashboard.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="khv kc-plastic-khv" aria-label="Product details">
                    <div className="khv__inner">
                        <header className="khv__head">
                            <p className="kc-pill khv__kicker">Product details</p>

                            <h2 className="h3 khv__title">
                                Everything <span className="khv__accent">you need</span> to know about <br />
                                your NFC business card
                            </h2>

                            <p className="kc-subheading khv__sub">
                                Built to standard bank card size. Durable for daily use. Works instantly with NFC and QR.
                            </p>
                        </header>

                        <div className="khv__grid" aria-label="Plastic card specifications">
                            {specs.map((s, i) => (
                                <article className="khv__cell kc-specCell" key={i}>
                                    <p className="kc-pill kc-specPill">{s.k}</p>
                                    <p className="body khv__cellDesc kc-specValue">{s.v}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="khv khv--white kc-plastic-khv" aria-label="What you get">
                    <div className="khv__inner">
                        <header className="khv__head">
                            <p className="kc-pill khv__kicker">What you get</p>

                            <h2 className="h3 khv__title">
                                Everything <span className="khv__accent">you need</span> to look <br />
                                professional
                            </h2>

                            <p className="kc-subheading khv__sub">
                                Make a strong first impression instantly — and update your details anytime without reprinting.
                            </p>
                        </header>

                        <div className="khv__grid" aria-label="What you get benefits">
                            {features.map((it, i) => (
                                <article className="khv__cell" key={i}>
                                    <div className="khv__icon" aria-hidden="true">
                                        <img
                                            className="khv__iconImg"
                                            src={it.icon}
                                            alt=""
                                            loading="lazy"
                                            decoding="async"
                                        />
                                    </div>

                                    <h3 className="kc-title khv__cellTitle">{it.t}</h3>
                                    <p className="body khv__cellDesc">{it.s}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
}