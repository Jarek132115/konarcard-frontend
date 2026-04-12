import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@base-ui/react/input";
import { Slider } from "@base-ui/react/slider";

import { useMyProfiles } from "../../hooks/useBusinessCard";
import api from "../../services/api";

import PlasticCard3D from "../PlasticCard3D";
import MetalCard3D from "../MetalCard3D";
import KonarTag3D from "../KonarTag3D";

import "../../styling/fonts.css";
import "../../styling/dashboard/cards.css";
import "../../styling/dashboard/card-customizer.css";
import "../../styling/home/value.css";

import LogoIcon from "../../assets/icons/Logo-Icon.svg";
import LogoIconWhite from "../../assets/icons/Logo-Icon-White.svg";
import CardQrCode from "../../assets/images/CardQrCode.png";

import WhiteFrontImg from "../../assets/images/Products/WhiteFront.jpg";
import WhiteBackImg from "../../assets/images/Products/WhiteBack.jpg";
import BlackFrontImg from "../../assets/images/Products/BlackFront.jpg";
import BlackBackImg from "../../assets/images/Products/BlackBack.jpg";
import BlueFrontImg from "../../assets/images/Products/BlueFront.jpg";
import BlueBackImg from "../../assets/images/Products/BlueBack.jpg";
import GreenFrontImg from "../../assets/images/Products/GreenFront.jpg";
import GreenBackImg from "../../assets/images/Products/GreenBack.jpg";
import MagentaFrontImg from "../../assets/images/Products/MagentaFront.jpg";
import MagentaBackImg from "../../assets/images/Products/MagentaBack.jpg";
import OrangeFrontImg from "../../assets/images/Products/OrangeFront.jpg";
import OrangeBackImg from "../../assets/images/Products/OrangeBack.jpg";

const NFC_INTENT_KEY = "konar_nfc_intent_v1";

const PRESET_TO_PERCENT = {
    small: 60,
    medium: 70,
    large: 80,
};

const MIN_FONT_SIZE = 18;
const MAX_FONT_SIZE = 72;
const MAX_FRONT_TEXT = 22;

const WEIGHT_OPTIONS = [
    { key: "regular", label: "Regular", value: 500 },
    { key: "medium", label: "Medium", value: 600 },
    { key: "bold", label: "Bold", value: 700 },
];

function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result || ""));
        r.onerror = reject;
        r.readAsDataURL(file);
    });
}

function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
}

function sanitizeFrontText(value) {
    return String(value || "").slice(0, MAX_FRONT_TEXT);
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
    "plastic-white": {
        title: "KonarCard White",
        subtitle:
            "Clean white plastic NFC business card with QR backup — designed to look premium and work instantly.",
        priceText: "£19.99",
        badge: "Essential",
        buyLabel: "Buy White Card",
        profileEmptyText: "You need at least 1 profile before buying a card.",
        family: "plastic",
        edition: "plastic",
        variant: "white",
        styleKey: "white",
        frontTemplate: "WhiteFront",
        backTemplate: "WhiteBack",
        frontSrc: WhiteFrontImg,
        backSrc: WhiteBackImg,
        edgeColor: "#ffffff",
        frontTextColor: "#111111",
        allowLogoUpload: false,
        allowTextPersonalisation: true,
        specs: [
            { k: "Card size", v: "85.6 × 54 mm — standard wallet size" },
            { k: "Thickness", v: "0.76 mm — same thickness as a bank card" },
            { k: "Material", v: "Durable PVC plastic with a smooth matte finish" },
            { k: "NFC", v: "NFC enabled — works with iPhone & Android" },
            { k: "QR backup", v: "Printed QR code on the back for instant access" },
            { k: "Setup", v: "Linked to your Konar profile — update anytime, no reprints" },
        ],
    },

    "plastic-black": {
        title: "KonarCard Black",
        subtitle:
            "Bold black plastic NFC business card with QR backup and a sleek premium finish.",
        priceText: "£19.99",
        badge: "Popular",
        buyLabel: "Buy Black Card",
        profileEmptyText: "You need at least 1 profile before buying a card.",
        family: "plastic",
        edition: "plastic",
        variant: "black",
        styleKey: "black",
        frontTemplate: "BlackFront",
        backTemplate: "BlackBack",
        frontSrc: BlackFrontImg,
        backSrc: BlackBackImg,
        edgeColor: "#111111",
        frontTextColor: "#ffffff",
        allowLogoUpload: false,
        allowTextPersonalisation: true,
        specs: [
            { k: "Card size", v: "85.6 × 54 mm — standard wallet size" },
            { k: "Thickness", v: "0.76 mm — same thickness as a bank card" },
            { k: "Material", v: "Durable PVC plastic with a smooth matte finish" },
            { k: "NFC", v: "NFC enabled — works with iPhone & Android" },
            { k: "QR backup", v: "Printed QR code on the back for instant access" },
            { k: "Setup", v: "Linked to your Konar profile — update anytime, no reprints" },
        ],
    },

    "plastic-blue": {
        title: "KonarCard Blue",
        subtitle:
            "Professional blue plastic NFC business card designed to stand out cleanly and work instantly.",
        priceText: "£19.99",
        badge: "Modern",
        buyLabel: "Buy Blue Card",
        profileEmptyText: "You need at least 1 profile before buying a card.",
        family: "plastic",
        edition: "plastic",
        variant: "blue",
        styleKey: "blue",
        frontTemplate: "BlueFront",
        backTemplate: "BlueBack",
        frontSrc: BlueFrontImg,
        backSrc: BlueBackImg,
        edgeColor: "#0f52ff",
        frontTextColor: "#ffffff",
        allowLogoUpload: false,
        allowTextPersonalisation: true,
        specs: [
            { k: "Card size", v: "85.6 × 54 mm — standard wallet size" },
            { k: "Thickness", v: "0.76 mm — same thickness as a bank card" },
            { k: "Material", v: "Durable PVC plastic with a smooth matte finish" },
            { k: "NFC", v: "NFC enabled — works with iPhone & Android" },
            { k: "QR backup", v: "Printed QR code on the back for instant access" },
            { k: "Setup", v: "Linked to your Konar profile — update anytime, no reprints" },
        ],
    },

    "plastic-green": {
        title: "KonarCard Green",
        subtitle:
            "Modern green plastic NFC business card with a sharp branded look and QR backup.",
        priceText: "£19.99",
        badge: "Fresh",
        buyLabel: "Buy Green Card",
        profileEmptyText: "You need at least 1 profile before buying a card.",
        family: "plastic",
        edition: "plastic",
        variant: "green",
        styleKey: "green",
        frontTemplate: "GreenFront",
        backTemplate: "GreenBack",
        frontSrc: GreenFrontImg,
        backSrc: GreenBackImg,
        edgeColor: "#15a53a",
        frontTextColor: "#ffffff",
        allowLogoUpload: false,
        allowTextPersonalisation: true,
        specs: [
            { k: "Card size", v: "85.6 × 54 mm — standard wallet size" },
            { k: "Thickness", v: "0.76 mm — same thickness as a bank card" },
            { k: "Material", v: "Durable PVC plastic with a smooth matte finish" },
            { k: "NFC", v: "NFC enabled — works with iPhone & Android" },
            { k: "QR backup", v: "Printed QR code on the back for instant access" },
            { k: "Setup", v: "Linked to your Konar profile — update anytime, no reprints" },
        ],
    },

    "plastic-magenta": {
        title: "KonarCard Magenta",
        subtitle:
            "Strong magenta plastic NFC business card for a vibrant premium finish with QR backup.",
        priceText: "£19.99",
        badge: "Bold",
        buyLabel: "Buy Magenta Card",
        profileEmptyText: "You need at least 1 profile before buying a card.",
        family: "plastic",
        edition: "plastic",
        variant: "magenta",
        styleKey: "magenta",
        frontTemplate: "MagentaFront",
        backTemplate: "MagentaBack",
        frontSrc: MagentaFrontImg,
        backSrc: MagentaBackImg,
        edgeColor: "#d1008f",
        frontTextColor: "#ffffff",
        allowLogoUpload: false,
        allowTextPersonalisation: true,
        specs: [
            { k: "Card size", v: "85.6 × 54 mm — standard wallet size" },
            { k: "Thickness", v: "0.76 mm — same thickness as a bank card" },
            { k: "Material", v: "Durable PVC plastic with a smooth matte finish" },
            { k: "NFC", v: "NFC enabled — works with iPhone & Android" },
            { k: "QR backup", v: "Printed QR code on the back for instant access" },
            { k: "Setup", v: "Linked to your Konar profile — update anytime, no reprints" },
        ],
    },

    "plastic-orange": {
        title: "KonarCard Orange",
        subtitle:
            "High-impact orange NFC business card with a confident branded style and QR backup.",
        priceText: "£19.99",
        badge: "Warm",
        buyLabel: "Buy Orange Card",
        profileEmptyText: "You need at least 1 profile before buying a card.",
        family: "plastic",
        edition: "plastic",
        variant: "orange",
        styleKey: "orange",
        frontTemplate: "OrangeFront",
        backTemplate: "OrangeBack",
        frontSrc: OrangeFrontImg,
        backSrc: OrangeBackImg,
        edgeColor: "#ff7b00",
        frontTextColor: "#ffffff",
        allowLogoUpload: false,
        allowTextPersonalisation: true,
        specs: [
            { k: "Card size", v: "85.6 × 54 mm — standard wallet size" },
            { k: "Thickness", v: "0.76 mm — same thickness as a bank card" },
            { k: "Material", v: "Durable PVC plastic with a smooth matte finish" },
            { k: "NFC", v: "NFC enabled — works with iPhone & Android" },
            { k: "QR backup", v: "Printed QR code on the back for instant access" },
            { k: "Setup", v: "Linked to your Konar profile — update anytime, no reprints" },
        ],
    },

    "metal-card": {
        title: "Metal NFC Business Card",
        subtitle:
            "Premium metal that stands out — tap to share your profile in seconds, with QR backup so it works on every phone.",
        priceText: "£44.99",
        badge: "Premium",
        buyLabel: "Buy Metal Card",
        profileEmptyText: "You need at least 1 profile before buying a card.",
        family: "metal",
        edition: "metal",
        variant: "gold",
        allowLogoUpload: true,
        allowTextPersonalisation: false,
        controlsLabel: "Finish",
        options: [
            { value: "black", label: "Black" },
            { value: "gold", label: "Gold" },
        ],
        getDefaultLogo: (variantValue) => (variantValue === "black" ? LogoIconWhite : LogoIcon),
        render3D: ({ logoSrc, qrSrc, logoPercent, variant: finish }) => (
            <MetalCard3D
                logoSrc={logoSrc}
                qrSrc={qrSrc}
                logoSize={logoPercent}
                finish={finish}
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
    },

    konartag: {
        title: "KonarTag NFC Key Tag",
        subtitle:
            "Pocket-friendly. Tap to share your Konar profile instantly — with QR backup on the back.",
        priceText: "£9.99",
        badge: "Accessory",
        buyLabel: "Buy KonarTag",
        profileEmptyText: "You need at least 1 profile before buying a KonarTag.",
        family: "tag",
        edition: "tag",
        variant: "black",
        allowLogoUpload: true,
        allowTextPersonalisation: false,
        controlsLabel: "Finish",
        options: [
            { value: "black", label: "Black" },
            { value: "gold", label: "Gold" },
        ],
        getDefaultLogo: () => LogoIconWhite,
        render3D: ({ logoSrc, qrSrc, logoPercent, variant: finish }) => (
            <KonarTag3D
                logoSrc={logoSrc}
                qrSrc={qrSrc}
                logoSize={logoPercent}
                finish={finish}
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
    },
};

export default function CardCustomizer({
    productKey,
    initialIntent,
    onBack,
    onCheckoutSuccess,
}) {
    const config = PRODUCT_CONFIG[productKey] || PRODUCT_CONFIG["plastic-white"];
    const hasOptions = Array.isArray(config.options) && config.options.length > 0;
    const defaultVariant = hasOptions ? config.options[0].value : config.variant;

    const [qty, setQty] = useState(1);
    const [variant, setVariant] = useState(defaultVariant || "white");

    const [logoUrl, setLogoUrl] = useState("");
    const [logoFile, setLogoFile] = useState(null);

    const [logoPreset, setLogoPreset] = useState("medium");
    const logoPercent = PRESET_TO_PERCENT[logoPreset] || 70;

    const [profileId, setProfileId] = useState("");
    const [frontText, setFrontText] = useState("KONAR");
    const [frontFontWeight, setFrontFontWeight] = useState(700);
    const [fontSize, setFontSize] = useState(42);

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
        const liveIntent = readNfcIntent();
        const sourceIntent =
            initialIntent?.productKey === productKey
                ? initialIntent
                : liveIntent?.productKey === productKey
                    ? liveIntent
                    : null;

        setQty(Math.max(1, Math.min(20, Number(sourceIntent?.quantity || 1))));
        setVariant(
            hasOptions
                ? config.options.some((opt) => opt.value === sourceIntent?.variant)
                    ? sourceIntent.variant
                    : defaultVariant
                : config.variant
        );
        setLogoPreset(
            ["small", "medium", "large"].includes(sourceIntent?.logoPreset)
                ? sourceIntent.logoPreset
                : "medium"
        );
        setProfileId(String(sourceIntent?.profileId || ""));
        setFrontText(
            typeof sourceIntent?.frontText === "string"
                ? sanitizeFrontText(sourceIntent.frontText) || "KONAR"
                : "KONAR"
        );
        setFrontFontWeight(
            typeof sourceIntent?.frontFontWeight === "number"
                ? clamp(sourceIntent.frontFontWeight, 400, 900)
                : 700
        );
        setFontSize(
            typeof sourceIntent?.fontSize === "number"
                ? clamp(sourceIntent.fontSize, MIN_FONT_SIZE, MAX_FONT_SIZE)
                : 42
        );

        setLogoUrl("");
        setLogoFile(null);
        setErrorMsg("");
        setInfoMsg(sourceIntent?.hadLogo ? "Please re-upload your logo to continue checkout." : "");
    }, [productKey, initialIntent, hasOptions, defaultVariant, config]);

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
            frontText,
            frontFontWeight,
            fontSize,
            family: config.family,
            edition: config.edition,
            returnTo: "/cards",
            createdAt,
            updatedAt: Date.now(),
        });
    }, [
        productKey,
        qty,
        profileId,
        logoFile,
        variant,
        logoPreset,
        frontText,
        frontFontWeight,
        fontSize,
        config.family,
        config.edition,
    ]);

    const displayedLogo =
        logoUrl || (config.getDefaultLogo ? config.getDefaultLogo(variant) : LogoIcon);

    const logoLabel = logoFile?.name || "Upload logo";
    const sizeLabel = (k) => (k === "small" ? "S" : k === "medium" ? "M" : "L");
    const deliveryInfo = useMemo(() => getEstimatedDelivery(), []);
    const now = new Date();
    const cutOffText = `${pad2(now.getHours())}:${pad2(now.getMinutes())}`;

    const handleFontSizeChange = (value) => {
        if (Array.isArray(value)) {
            setFontSize(clamp(Number(value[0] || MIN_FONT_SIZE), MIN_FONT_SIZE, MAX_FONT_SIZE));
            return;
        }

        setFontSize(clamp(Number(value || MIN_FONT_SIZE), MIN_FONT_SIZE, MAX_FONT_SIZE));
    };

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

        if (config.allowTextPersonalisation) {
            const trimmedFrontText = String(frontText || "").trim();
            if (!trimmedFrontText) {
                setErrorMsg("Please add the text you want on the front of the card.");
                return;
            }
        }

        setBusy(true);

        try {
            let savedLogoUrl = "";

            if (config.allowLogoUpload && logoFile) {
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

            const trimmedFrontText = String(frontText || "").trim();

            const payload = {
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
                    family: config.family,
                    edition: config.edition,
                },
                returnUrl: `${window.location.origin}/cards`,
            };

            if (config.allowTextPersonalisation) {
                payload.customization = {
                    frontText: trimmedFrontText,
                    fontFamily: "Cal Sans",
                    fontWeight: frontFontWeight,
                    fontSize,
                    orientation: "horizontal",
                    textColor: config.frontTextColor,
                };

                payload.preview = {
                    ...payload.preview,
                    styleKey: config.styleKey,
                    frontTemplate: config.frontTemplate,
                    backTemplate: config.backTemplate,
                    usesPresetArtwork: true,
                    customization: {
                        frontText: trimmedFrontText,
                        fontFamily: "Cal Sans",
                        fontWeight: frontFontWeight,
                        fontSize,
                        textColor: config.frontTextColor,
                    },
                };
            }

            const resp = await api.post("/api/checkout/nfc/session", payload);

            if (resp?.status >= 400 || !resp?.data?.url) {
                throw new Error(resp?.data?.error || "Failed to start checkout");
            }

            if (typeof onCheckoutSuccess === "function") {
                await onCheckoutSuccess();
            }

            window.location.href = resp.data.url;
        } catch (e) {
            setErrorMsg(
                e?.response?.data?.error ||
                e?.response?.data?.message ||
                e?.message ||
                "Checkout failed. Please try again."
            );
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="ccz-page">
            <div className="ccz-backRow">
                <button type="button" className="kx-btn kx-btn--white" onClick={onBack}>
                    Back to products
                </button>
            </div>

            <motion.section
                className="cp-card ccz-heroCard"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
            >
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
                    <motion.div
                        className="ccz-previewCard"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: 0.04 }}
                    >
                        <div className="ccz-previewCanvas">
                            {config.allowTextPersonalisation ? (
                                <PlasticCard3D
                                    frontSrc={config.frontSrc}
                                    backSrc={config.backSrc}
                                    qrSrc={CardQrCode}
                                    edgeColor={config.edgeColor}
                                    frontText={frontText}
                                    frontFontSize={fontSize}
                                    frontFontWeight={frontFontWeight}
                                    frontTextColor={config.frontTextColor}
                                />
                            ) : hasOptions || config.allowLogoUpload ? (
                                config.render3D({
                                    logoSrc: displayedLogo,
                                    qrSrc: CardQrCode,
                                    logoPercent,
                                    variant,
                                })
                            ) : (
                                config.render3D()
                            )}
                        </div>
                    </motion.div>

                    <div className="ccz-controlsCol">
                        <motion.div
                            className="ccz-controlsCard"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35, delay: 0.08 }}
                        >
                            <div className="ccz-controlsGrid">
                                {config.allowTextPersonalisation ? (
                                    <>
                                        <div className="ccz-field">
                                            <div className="ccz-label">Front text</div>

                                            <Input
                                                className="ccz-textInput"
                                                value={frontText}
                                                onChange={(e) =>
                                                    setFrontText(sanitizeFrontText(e.target.value))
                                                }
                                                placeholder="e.g. MichalPlumbing"
                                                disabled={busy}
                                                maxLength={MAX_FRONT_TEXT}
                                            />
                                        </div>

                                        <div className="ccz-field">
                                            <div className="ccz-label">Text weight</div>

                                            <div
                                                className="ccz-toggleRow"
                                                role="group"
                                                aria-label="Choose text weight"
                                            >
                                                {WEIGHT_OPTIONS.map((option) => {
                                                    const isActive =
                                                        option.value === frontFontWeight;

                                                    return (
                                                        <button
                                                            key={option.key}
                                                            type="button"
                                                            className={`ccz-toggle ${isActive ? "is-active" : ""}`}
                                                            onClick={() =>
                                                                setFrontFontWeight(option.value)
                                                            }
                                                            disabled={busy}
                                                        >
                                                            {option.label}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div className="ccz-field">
                                            <div className="ccz-label">Text size</div>

                                            <div className="ccz-sliderMeta">
                                                <span>{MIN_FONT_SIZE}px</span>
                                                <strong>{fontSize}px</strong>
                                                <span>{MAX_FONT_SIZE}px</span>
                                            </div>

                                            <div className="ccz-sliderWrap">
                                                <Slider.Root
                                                    className="ccz-sliderRoot"
                                                    min={MIN_FONT_SIZE}
                                                    max={MAX_FONT_SIZE}
                                                    step={1}
                                                    value={fontSize}
                                                    onValueChange={handleFontSizeChange}
                                                    disabled={busy}
                                                    aria-label="Text size"
                                                >
                                                    <Slider.Control className="ccz-sliderControl">
                                                        <Slider.Track className="ccz-sliderTrack">
                                                            <Slider.Indicator className="ccz-sliderRange" />
                                                            <Slider.Thumb
                                                                className="ccz-sliderThumb"
                                                                aria-label="Text size"
                                                            />
                                                        </Slider.Track>
                                                    </Slider.Control>
                                                </Slider.Root>
                                            </div>
                                        </div>
                                    </>
                                ) : null}

                                {config.allowLogoUpload ? (
                                    <>
                                        <div className="ccz-field">
                                            <div className="ccz-label">Logo</div>

                                            <div className="ccz-uploadRow">
                                                <label className="ccz-uploadBtn" title="Upload logo">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={onPickLogo}
                                                    />
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

                                            <div
                                                className="ccz-toggleRow"
                                                role="group"
                                                aria-label="Choose logo size"
                                            >
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
                                    </>
                                ) : null}

                                {hasOptions ? (
                                    <div className="ccz-field">
                                        <div className="ccz-label">{config.controlsLabel}</div>

                                        <div
                                            className="ccz-toggleRow"
                                            role="group"
                                            aria-label="Choose product option"
                                        >
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
                                ) : null}

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
                                        className="kx-btn kx-btn--orange ccz-buyBtn"
                                        disabled={busy}
                                    >
                                        {busy ? "Starting checkout..." : config.buyLabel}
                                    </button>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            className="ccz-deliveryCard"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35, delay: 0.12 }}
                        >
                            <div className="ccz-deliveryLabel">Estimated delivery</div>
                            <div className="ccz-deliveryDate">{deliveryInfo.label}</div>
                            <p className="ccz-deliveryText">{deliveryInfo.helper}</p>
                            <p className="ccz-deliveryMeta">
                                Current time: {cutOffText} • Next day delivery available
                            </p>
                        </motion.div>
                    </div>
                </div>
            </motion.section>

            <motion.section
                className="cp-card cp-card--builderInfo"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.14 }}
            >
                <div className="cp-cardHead">
                    <div className="cp-cardHeadCopy">
                        <h2 className="cp-cardTitle">Product details</h2>
                        <p className="cp-muted">Everything you need to know before checkout.</p>
                    </div>
                </div>

                <div className="ccz-specsGrid" aria-label="Product details">
                    {config.specs.map((s, i) => (
                        <article className="ccz-specCard" key={i}>
                            <span className="ccz-specPill">{s.k}</span>
                            <p className="ccz-specValue">{s.v}</p>
                        </article>
                    ))}
                </div>
            </motion.section>
        </div>
    );
}