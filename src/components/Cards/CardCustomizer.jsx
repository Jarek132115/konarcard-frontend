import React, { useEffect, useMemo, useState } from "react";
import { useMyProfiles } from "../../hooks/useBusinessCard";
import api from "../../services/api";

import PlasticCard3D from "../PlasticCard3D";
import MetalCard3D from "../MetalCard3D";
import KonarTag3D from "../KonarTag3D";

import "../../styling/fonts.css";
import "../../styling/dashboard/card-customizer.css";
import "../../styling/home/value.css";

import LogoIcon from "../../assets/icons/Logo-Icon.svg";
import LogoIconWhite from "../../assets/icons/Logo-Icon-White.svg";
import CardQrCode from "../../assets/images/CardQrCode.png";

import OneJobIcon from "../../assets/icons/OneJob.svg";
import NoReprintsIcon from "../../assets/icons/NoReprints.svg";
import UpToDateIcon from "../../assets/icons/UpToDate.svg";
import WorksEverywhereIcon from "../../assets/icons/WorksEverywhere.svg";
import HammerIcon from "../../assets/icons/Hammer.svg";
import ProfessionalFastIcon from "../../assets/icons/ProfessionalFast.svg";

const NFC_INTENT_KEY = "konar_nfc_intent_v1";

const PRESET_TO_PERCENT = {
    small: 60,
    medium: 70,
    large: 80,
};

function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result || ""));
        r.onerror = reject;
        r.readAsDataURL(file);
    });
}

function readNfcIntent() {
    try {
        const raw = localStorage.getItem(NFC_INTENT_KEY);
        if (!raw) return null;

        const intent = JSON.parse(raw);
        if (!intent?.productKey) return null;

        const age = Date.now() - Number(intent.createdAt || intent.updatedAt || 0);
        if (Number.isFinite(age) && age > 30 * 60 * 1000) {
            localStorage.removeItem(NFC_INTENT_KEY);
            return null;
        }

        return intent;
    } catch {
        return null;
    }
}

function writeNfcIntent(value) {
    try {
        if (!value) {
            localStorage.removeItem(NFC_INTENT_KEY);
            return;
        }
        localStorage.setItem(NFC_INTENT_KEY, JSON.stringify(value));
    } catch {
        // ignore
    }
}

function pad2(value) {
    return String(value).padStart(2, "0");
}

function formatDeliveryDate(date) {
    return date.toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
    });
}

function getEstimatedDelivery() {
    const now = new Date();
    const hour = now.getHours();

    const deliveryDate = new Date(now);
    deliveryDate.setHours(12, 0, 0, 0);

    if (hour < 13) {
        deliveryDate.setDate(deliveryDate.getDate() + 1);
        return {
            label: formatDeliveryDate(deliveryDate),
            helper: "Same-day shipping when you order before 1pm.",
        };
    }

    deliveryDate.setDate(deliveryDate.getDate() + 2);
    return {
        label: formatDeliveryDate(deliveryDate),
        helper: "Orders after 1pm ship next working day.",
    };
}

const PRODUCT_CONFIG = {
    "plastic-card": {
        title: "Plastic NFC Business Card",
        subtitle:
            "Tap to share your profile in seconds — with a QR backup so it works on every phone.",
        priceText: "£29.99",
        badge: "Best Value",
        buyLabel: "Buy KonarCard",
        profileEmptyText: "You need at least 1 profile before buying a card.",
        controlsLabel: "Colour",
        options: [
            { value: "white", label: "White" },
            { value: "black", label: "Black" },
        ],
        getDefaultLogo: (variant) => (variant === "black" ? LogoIconWhite : LogoIcon),
        render3D: ({ logoSrc, qrSrc, logoPercent, variant }) => (
            <PlasticCard3D
                logoSrc={logoSrc}
                qrSrc={qrSrc}
                logoSize={logoPercent}
                variant={variant}
            />
        ),
        specs: [
            { k: "Card size", v: "85.6 × 54 mm — standard wallet size" },
            { k: "Thickness", v: "0.76 mm — same thickness as a bank card" },
            { k: "Material", v: "Durable PVC plastic with a smooth matte finish" },
            { k: "NFC", v: "NFC enabled — works with iPhone & Android" },
            { k: "QR backup", v: "Printed QR code on the back for instant access" },
            { k: "Setup", v: "Linked to your Konar profile — update anytime, no reprints" },
        ],
        features: [
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
    },

    "metal-card": {
        title: "Metal NFC Business Card",
        subtitle:
            "Premium metal that stands out — tap to share your profile in seconds, with a QR backup so it works on every phone.",
        priceText: "£44.99",
        badge: "Premium",
        buyLabel: "Buy KonarCard",
        profileEmptyText: "You need at least 1 profile before buying a card.",
        controlsLabel: "Finish",
        options: [
            { value: "black", label: "Black" },
            { value: "gold", label: "Gold" },
        ],
        getDefaultLogo: (variant) => (variant === "black" ? LogoIconWhite : LogoIcon),
        render3D: ({ logoSrc, qrSrc, logoPercent, variant }) => (
            <MetalCard3D
                logoSrc={logoSrc}
                qrSrc={qrSrc}
                logoSize={logoPercent}
                finish={variant}
            />
        ),
        specs: [
            { k: "Card size", v: "85.6 × 54 mm — standard wallet size" },
            { k: "Thickness", v: "0.8 mm — premium metal build" },
            { k: "Material", v: "Premium metal body with a durable finish" },
            { k: "NFC", v: "NFC enabled — works with iPhone & Android" },
            { k: "QR backup", v: "Printed QR code on the back for instant access" },
            { k: "Setup", v: "Linked to your Konar profile — update anytime, no reprints" },
        ],
        features: [
            {
                icon: OneJobIcon,
                t: "Premium metal that stands out",
                s: "Heavier feel designed to leave a strong first impression.",
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
                t: "Built for serious trades",
                s: "Clean, practical, and made for the way you actually work.",
            },
            {
                icon: ProfessionalFastIcon,
                t: "Looks premium fast",
                s: "Metal helps you look the part before you even speak.",
            },
        ],
    },

    konartag: {
        title: "KonarTag NFC Key Tag",
        subtitle:
            "Pocket-friendly. Tap to share your Konar profile instantly — with QR backup on the back.",
        priceText: "£9.99",
        badge: "Accessory",
        buyLabel: "Buy KonarTag",
        profileEmptyText: "You need at least 1 profile before buying a KonarTag.",
        controlsLabel: "Finish",
        options: [
            { value: "black", label: "Black" },
            { value: "gold", label: "Gold" },
        ],
        getDefaultLogo: () => LogoIconWhite,
        render3D: ({ logoSrc, qrSrc, logoPercent, variant }) => (
            <KonarTag3D
                logoSrc={logoSrc}
                qrSrc={qrSrc}
                logoSize={logoPercent}
                finish={variant}
            />
        ),
        specs: [
            { k: "Tag size", v: "Compact key-tag size — easy everyday carry" },
            { k: "Material", v: "Durable metal body with premium finish" },
            { k: "Finish", v: "Black or Gold" },
            { k: "NFC", v: "Tap compatible — works with iPhone & Android" },
            { k: "QR backup", v: "Printed on the rear for instant scan access" },
            { k: "Setup", v: "Linked to your Konar profile — update anytime" },
        ],
        features: [
            {
                icon: WorksEverywhereIcon,
                t: "Pocket-friendly",
                s: "A compact NFC tag — ideal for keys, vans, and everyday carry.",
            },
            {
                icon: UpToDateIcon,
                t: "Tap to share instantly",
                s: "One tap opens your Konar profile in seconds.",
            },
            {
                icon: NoReprintsIcon,
                t: "QR backup included",
                s: "If NFC is off, they can scan the QR and still save your details.",
            },
            {
                icon: HammerIcon,
                t: "Built for daily use",
                s: "Durable finish designed for busy days and real work.",
            },
            {
                icon: OneJobIcon,
                t: "One-time purchase",
                s: "Pay once — keep sharing. Your profile stays up to date anytime.",
            },
            {
                icon: ProfessionalFastIcon,
                t: "Looks professional fast",
                s: "Clean, premium, and easy to share anywhere.",
            },
        ],
    },
};

export default function CardCustomizer({
    productKey,
    initialIntent,
    onBack,
    onCheckoutSuccess,
}) {
    const config = PRODUCT_CONFIG[productKey] || PRODUCT_CONFIG["plastic-card"];

    const [qty, setQty] = useState(1);
    const [variant, setVariant] = useState(config.options?.[0]?.value || "white");

    const [logoUrl, setLogoUrl] = useState("");
    const [logoFile, setLogoFile] = useState(null);

    const [logoPreset, setLogoPreset] = useState("medium");
    const logoPercent = PRESET_TO_PERCENT[logoPreset] || 70;

    const [profileId, setProfileId] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [infoMsg, setInfoMsg] = useState("");
    const [busy, setBusy] = useState(false);

    const profilesQuery = useMyProfiles();
    const isProfilesLoading = !!profilesQuery?.isLoading;

    const myProfiles = (() => {
        const d = profilesQuery?.data;
        if (Array.isArray(d)) return d;
        if (Array.isArray(d?.data)) return d.data;
        if (Array.isArray(d?.data?.data)) return d.data.data;
        return [];
    })();

    useEffect(() => {
        const fallbackVariant = config.options?.[0]?.value || "white";
        const liveIntent = readNfcIntent();
        const sourceIntent =
            initialIntent?.productKey === productKey
                ? initialIntent
                : liveIntent?.productKey === productKey
                    ? liveIntent
                    : null;

        setQty(Math.max(1, Math.min(20, Number(sourceIntent?.quantity || 1))));
        setVariant(
            config.options.some((opt) => opt.value === sourceIntent?.variant)
                ? sourceIntent.variant
                : fallbackVariant
        );
        setLogoPreset(
            ["small", "medium", "large"].includes(sourceIntent?.logoPreset)
                ? sourceIntent.logoPreset
                : "medium"
        );
        setProfileId(String(sourceIntent?.profileId || ""));
        setLogoUrl("");
        setLogoFile(null);
        setErrorMsg("");
        setInfoMsg(sourceIntent?.hadLogo ? "Please re-upload your logo to continue checkout." : "");
    }, [productKey, config.options, initialIntent]);

    useEffect(() => {
        return () => {
            if (logoUrl) URL.revokeObjectURL(logoUrl);
        };
    }, [logoUrl]);

    useEffect(() => {
        if (profileId) return;
        if (!Array.isArray(myProfiles) || myProfiles.length === 0) return;

        const firstId = String(myProfiles?.[0]?._id || "");
        if (firstId) setProfileId(firstId);
    }, [myProfiles, profileId]);

    useEffect(() => {
        const existing = readNfcIntent();
        const createdAt =
            existing?.productKey === productKey
                ? existing?.createdAt || Date.now()
                : Date.now();

        writeNfcIntent({
            ...(existing && existing.productKey === productKey ? existing : {}),
            productKey,
            quantity: qty,
            profileId,
            hadLogo: !!logoFile,
            variant,
            logoPreset,
            returnTo: "/cards",
            createdAt,
            updatedAt: Date.now(),
        });
    }, [productKey, qty, profileId, logoFile, variant, logoPreset]);

    const displayedLogo = logoUrl || config.getDefaultLogo(variant);
    const logoLabel = logoFile?.name || "Upload logo";
    const sizeLabel = (k) => (k === "small" ? "S" : k === "medium" ? "M" : "L");
    const deliveryInfo = useMemo(() => getEstimatedDelivery(), []);
    const now = new Date();
    const cutOffText = `${pad2(now.getHours())}:${pad2(now.getMinutes())}`;

    const onPickLogo = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) return;

        if (logoUrl) URL.revokeObjectURL(logoUrl);

        setLogoFile(file);
        setLogoUrl(URL.createObjectURL(file));
        setInfoMsg("");
        setErrorMsg("");
    };

    const clearLogo = () => {
        if (logoUrl) URL.revokeObjectURL(logoUrl);
        setLogoUrl("");
        setLogoFile(null);
    };

    const handleBuy = async () => {
        setErrorMsg("");
        setInfoMsg("");

        if (!myProfiles.length) {
            setErrorMsg(config.profileEmptyText);
            return;
        }

        if (!profileId) {
            setErrorMsg("Please choose which profile to link to this product before checkout.");
            return;
        }

        setBusy(true);

        try {
            let savedLogoUrl = "";

            if (logoFile) {
                const dataUrl = await fileToDataUrl(logoFile);

                const up = await api.post("/api/checkout/nfc/logo", {
                    dataUrl,
                    filename: logoFile?.name || "logo.png",
                });

                if (up?.status >= 400 || !up?.data?.logoUrl) {
                    throw new Error(up?.data?.error || "Logo upload failed");
                }

                savedLogoUrl = up.data.logoUrl;
            }

            const resp = await api.post("/api/checkout/nfc/session", {
                productKey,
                variant,
                quantity: qty,
                profileId,
                logoUrl: savedLogoUrl || "",
                preview: {
                    logoPercent,
                    logoPreset,
                    usedCustomLogo: !!savedLogoUrl,
                    variant,
                    edition:
                        productKey === "metal-card"
                            ? "metal"
                            : productKey === "konartag"
                                ? "tag"
                                : "plastic",
                },
                returnUrl: `${window.location.origin}/cards`,
            });

            if (resp?.status >= 400 || !resp?.data?.url) {
                throw new Error(resp?.data?.error || "Failed to start checkout");
            }

            if (typeof onCheckoutSuccess === "function") {
                await onCheckoutSuccess();
            }

            window.location.href = resp.data.url;
        } catch (e) {
            setErrorMsg(e?.message || "Checkout failed. Please try again.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <>
            <div className="ccz-backRow">
                <button type="button" className="kx-btn kx-btn--white" onClick={onBack}>
                    Back to products
                </button>
            </div>

            <section className="cp-card ccz-heroCard">
                <div className="ccz-heroIntro">
                    <div className="ccz-heroText">
                        <span className="ccz-badge">{config.badge}</span>
                        <h2 className="cp-cardTitle">{config.title}</h2>
                        <p className="cp-muted">{config.subtitle}</p>
                    </div>
                </div>

                {(errorMsg || infoMsg) && (
                    <div className={`cp-alert ${errorMsg ? "danger" : ""}`}>
                        {errorMsg || infoMsg}
                    </div>
                )}

                <div className="ccz-mainGrid">
                    <div className="ccz-previewCard">
                        <div className="ccz-previewCanvas">
                            {config.render3D({
                                logoSrc: displayedLogo,
                                qrSrc: CardQrCode,
                                logoPercent,
                                variant,
                            })}
                        </div>
                    </div>

                    <div className="ccz-controlsCol">
                        <div className="ccz-controlsCard">
                            <div className="ccz-controlsGrid">
                                <div className="ccz-field">
                                    <div className="ccz-label">Logo</div>

                                    <div className="ccz-uploadRow">
                                        <label className="ccz-uploadBtn" title="Upload logo">
                                            <input type="file" accept="image/*" onChange={onPickLogo} />
                                            <span>{logoLabel}</span>
                                        </label>

                                        <button
                                            type="button"
                                            className="ccz-textBtn"
                                            onClick={clearLogo}
                                            disabled={!logoUrl || busy}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>

                                <div className="ccz-field">
                                    <div className="ccz-label">Logo size</div>

                                    <div className="ccz-toggleRow" role="group" aria-label="Choose logo size">
                                        {["small", "medium", "large"].map((k) => (
                                            <button
                                                key={k}
                                                type="button"
                                                className={`ccz-toggle ${logoPreset === k ? "is-active" : ""}`}
                                                onClick={() => setLogoPreset(k)}
                                                disabled={busy}
                                            >
                                                {sizeLabel(k)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="ccz-field">
                                    <div className="ccz-label">{config.controlsLabel}</div>

                                    <div className="ccz-toggleRow" role="group" aria-label="Choose product option">
                                        {config.options.map((opt) => (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                className={`ccz-toggle ${variant === opt.value ? "is-active" : ""}`}
                                                onClick={() => setVariant(opt.value)}
                                                disabled={busy}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="ccz-field">
                                    <div className="ccz-label">Link to profile</div>

                                    <div className="ccz-selectWrap">
                                        <select
                                            className="ccz-select"
                                            value={profileId}
                                            onChange={(e) => setProfileId(e.target.value)}
                                            disabled={busy || isProfilesLoading}
                                            aria-label="Choose profile"
                                        >
                                            <option value="">
                                                {isProfilesLoading
                                                    ? "Loading..."
                                                    : myProfiles.length
                                                        ? "Choose profile"
                                                        : "No profiles"}
                                            </option>

                                            {myProfiles.map((p) => {
                                                const id = String(p?._id || "");
                                                if (!id) return null;

                                                const label =
                                                    p?.business_card_name ||
                                                    p?.full_name ||
                                                    p?.main_heading ||
                                                    p?.profile_slug ||
                                                    "Profile";

                                                return (
                                                    <option key={id} value={id}>
                                                        {label}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                    </div>
                                </div>

                                <div className="ccz-field ccz-field--buy">
                                    <div className="ccz-priceRow">
                                        <div className="ccz-price">{config.priceText}</div>

                                        <div className="ccz-qty" aria-label="Quantity">
                                            <button
                                                type="button"
                                                className="ccz-qtyBtn"
                                                onClick={() => setQty((q) => Math.max(1, q - 1))}
                                                disabled={busy}
                                                aria-label="Decrease quantity"
                                            >
                                                −
                                            </button>

                                            <div className="ccz-qtyVal">{qty}</div>

                                            <button
                                                type="button"
                                                className="ccz-qtyBtn"
                                                onClick={() => setQty((q) => Math.min(20, q + 1))}
                                                disabled={busy}
                                                aria-label="Increase quantity"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleBuy}
                                        className="kx-btn kx-btn--black ccz-buyBtn"
                                        disabled={busy}
                                    >
                                        {busy ? "Starting checkout..." : config.buyLabel}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="ccz-deliveryCard">
                            <div className="ccz-deliveryLabel">Estimated delivery</div>
                            <div className="ccz-deliveryDate">{deliveryInfo.label}</div>
                            <p className="ccz-deliveryText">
                                {deliveryInfo.helper}
                            </p>
                            <p className="ccz-deliveryMeta">
                                Current time: {cutOffText} • Next day delivery available
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="cp-card cp-card--builderInfo">
                <div className="cp-cardHead">
                    <div>
                        <h2 className="cp-cardTitle">Product details</h2>
                        <p className="cp-muted">Everything you need to know before checkout.</p>
                    </div>
                </div>

                <div className="khv cp-khvEmbed" aria-label="Product details">
                    <div className="khv__inner">
                        <div className="khv__grid">
                            {config.specs.map((s, i) => (
                                <article className="khv__cell kc-specCell" key={i}>
                                    <p className="kc-pill kc-specPill">{s.k}</p>
                                    <p className="body khv__cellDesc kc-specValue">{s.v}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="cp-card cp-card--builderInfo">
                <div className="cp-cardHead">
                    <div>
                        <h2 className="cp-cardTitle">Why it works</h2>
                        <p className="cp-muted">Built to help you look more professional and share faster.</p>
                    </div>
                </div>

                <div className="khv khv--white cp-khvEmbed" aria-label="What you get">
                    <div className="khv__inner">
                        <div className="khv__grid">
                            {config.features.map((it, i) => (
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
                </div>
            </section>
        </>
    );
}