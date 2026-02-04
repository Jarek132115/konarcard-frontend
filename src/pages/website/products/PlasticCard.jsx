// src/pages/website/products/PlasticCard.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";

/* ✅ Shared CSS */
import "../../../styling/products/konarcard.css";

/* Use Konar logo as placeholder (same as navbar) */
import LogoIcon from "../../../assets/icons/Logo-Icon.svg";

/* Images (swap later) */
import ProductCover from "../../../assets/images/Product-Cover.png";
import ProductImage1 from "../../../assets/images/Product-Image-1.png";
import ProductImage2 from "../../../assets/images/Product-Image-2.png";
import ProductImage3 from "../../../assets/images/Product-Image-3.png";
import ProductImage4 from "../../../assets/images/Product-Image-4.png";

/** simple "QR-like" SVG placeholder */
const QrSvg = () => (
    <svg viewBox="0 0 120 120" width="120" height="120" aria-hidden="true">
        <rect x="0" y="0" width="120" height="120" fill="white" />
        <rect x="6" y="6" width="34" height="34" fill="#0b1220" />
        <rect x="12" y="12" width="22" height="22" fill="white" />
        <rect x="16" y="16" width="14" height="14" fill="#0b1220" />

        <rect x="80" y="6" width="34" height="34" fill="#0b1220" />
        <rect x="86" y="12" width="22" height="22" fill="white" />
        <rect x="90" y="16" width="14" height="14" fill="#0b1220" />

        <rect x="6" y="80" width="34" height="34" fill="#0b1220" />
        <rect x="12" y="86" width="22" height="22" fill="white" />
        <rect x="16" y="90" width="14" height="14" fill="#0b1220" />

        {[
            [52, 10], [60, 10], [52, 18], [72, 18], [60, 26], [52, 34],
            [46, 52], [54, 52], [62, 52], [70, 52], [78, 52],
            [46, 60], [62, 60], [78, 60],
            [46, 68], [54, 68], [70, 68], [78, 68],
            [52, 76], [60, 76], [68, 76], [76, 76],
            [52, 88], [60, 88], [68, 88], [76, 88],
            [52, 96], [76, 96],
            [52, 104], [60, 104], [68, 104], [76, 104],
        ].map(([x, y], i) => (
            <rect key={i} x={x} y={y} width="6" height="6" fill="#0b1220" />
        ))}
    </svg>
);

export default function PlasticCard() {
    const gallery = useMemo(
        () => [ProductCover, ProductImage1, ProductImage2, ProductImage3, ProductImage4],
        []
    );

    // we keep thumbnails for later, but the card itself must be plain white
    const [activeImg, setActiveImg] = useState(gallery[0]);
    const [qty, setQty] = useState(1);

    // ---- Logo upload preview ----
    const [logoUrl, setLogoUrl] = useState("");
    const [logoSize, setLogoSize] = useState(44);

    useEffect(() => {
        return () => {
            if (logoUrl) URL.revokeObjectURL(logoUrl);
        };
    }, [logoUrl]);

    const onPickLogo = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) return;

        if (logoUrl) URL.revokeObjectURL(logoUrl);
        setLogoUrl(URL.createObjectURL(file));
    };

    const clearLogo = () => {
        if (logoUrl) URL.revokeObjectURL(logoUrl);
        setLogoUrl("");
    };

    // ---- 3D rotation + idle spin ----
    const prefersReducedMotion = useRef(false);
    useEffect(() => {
        try {
            prefersReducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        } catch {
            prefersReducedMotion.current = false;
        }
    }, []);

    const dragRef = useRef({
        isDown: false,
        startX: 0,
        startY: 0,
        baseRX: -10,
        baseRY: 16,
    });

    const rafRef = useRef(null);
    const idleRef = useRef({ isIdle: true, ry: 16, rx: -10 });

    const [rot, setRot] = useState({ rx: -10, ry: 16 });
    const [isDragging, setIsDragging] = useState(false);

    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

    const setRotation = (rx, ry) => {
        const next = { rx: clamp(rx, -24, 24), ry };
        idleRef.current.rx = next.rx;
        idleRef.current.ry = next.ry;
        setRot(next);
    };

    const resetView = () => setRotation(-10, 16);

    const startIdleSpin = () => {
        if (prefersReducedMotion.current) return;
        if (rafRef.current) cancelAnimationFrame(rafRef.current);

        idleRef.current.isIdle = true;

        const tick = () => {
            if (!idleRef.current.isIdle) return;
            idleRef.current.ry += 0.16;
            const breathe = Math.sin(idleRef.current.ry * (Math.PI / 180) * 0.7) * 1.0;
            setRot({ rx: clamp(-10 + breathe, -24, 24), ry: idleRef.current.ry });
            rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);
    };

    const stopIdleSpin = () => {
        idleRef.current.isIdle = false;
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
    };

    useEffect(() => {
        startIdleSpin();
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onPointerDown = (e) => {
        dragRef.current.isDown = true;
        setIsDragging(true);
        stopIdleSpin();

        dragRef.current.startX = e.clientX;
        dragRef.current.startY = e.clientY;
        dragRef.current.baseRX = idleRef.current.rx;
        dragRef.current.baseRY = idleRef.current.ry;

        try {
            e.currentTarget.setPointerCapture(e.pointerId);
        } catch { }
    };

    const onPointerMove = (e) => {
        if (!dragRef.current.isDown) return;

        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;

        const nextRY = dragRef.current.baseRY + dx * 0.18;
        const nextRX = dragRef.current.baseRX - dy * 0.16;

        setRotation(nextRX, nextRY);
    };

    const onPointerUp = () => {
        dragRef.current.isDown = false;
        setIsDragging(false);

        window.setTimeout(() => {
            if (!dragRef.current.isDown) startIdleSpin();
        }, 450);
    };

    const features = useMemo(
        () => [
            { t: "Tap to share instantly", s: "Open your profile on any modern phone with an NFC tap." },
            { t: "QR code backup", s: "If NFC is off, they can scan and still save your details." },
            { t: "Works with your Konar profile", s: "Your card always links to your live profile — edits update instantly." },
            { t: "No app needed", s: "Works in the browser on iPhone and Android." },
            { t: "Built for real trades", s: "Clean, durable, and made to be shared every day." },
            { t: "One-time purchase", s: "Buy once. Share forever." },
        ],
        []
    );

    const displayedLogo = logoUrl || LogoIcon;

    const shineX = 50 + (rot.ry % 360) * 0.12;
    const shineY = 40 + rot.rx * -0.6;

    return (
        <>
            <Navbar />

            {/* ✅ add same top spacing as other pages (navbar clearance) */}
            <main className="kc-konarcard kc-konarcard--premium kc-konarcard--pagePad">
                <div className="kc-konarcard__wrap">
                    {/* ✅ ONLY KEEP FIRST SECTION */}
                    <section className="kc-premHero kc-premHero--clean">
                        <div className="kc-premHero__top">
                            <div className="kc-premHero__crumbs">
                                <Link to="/products" className="kc-konarcard__crumbLink">
                                    Products
                                </Link>
                                <span className="kc-konarcard__crumbSep">/</span>
                                <span className="kc-konarcard__crumbHere">KonarCard – Plastic</span>
                            </div>

                            <div className="kc-premHero__titleRow">
                                <h1 className="kc-premHero__title">KonarCard — Plastic Edition</h1>
                                <div className="kc-premHero__badges">
                                    <span className="kc-konarcard__pill kc-konarcard__pill--best">Best Value</span>
                                    <span className="kc-konarcard__pill kc-konarcard__pill--warranty">12 Month Warranty</span>
                                </div>
                            </div>

                            <p className="kc-premHero__sub">
                                A clean white NFC business card that shares your Konar profile instantly — with QR backup on the back.
                            </p>
                        </div>

                        <div className="kc-premStage">
                            {/* ✅ smaller: ~40% of visible screen height */}
                            <div
                                className={`kc-premStage__surface kc-premStage__surface--small ${isDragging ? "is-dragging" : ""}`}
                                onPointerDown={onPointerDown}
                                onPointerMove={onPointerMove}
                                onPointerUp={onPointerUp}
                                onPointerCancel={onPointerUp}
                                role="application"
                                aria-label="3D KonarCard preview. Drag to rotate."
                            >
                                <div
                                    className="kc-premCard kc-premCard--sm"
                                    style={{
                                        transform: `rotateX(${rot.rx}deg) rotateY(${rot.ry}deg)`,
                                        ["--shineX"]: `${shineX}%`,
                                        ["--shineY"]: `${shineY}%`,
                                    }}
                                >
                                    {/* FRONT */}
                                    <div className="kc-premFace kc-premFace--front kc-premFace--plainWhite">
                                        <div className="kc-premFace__base kc-premFace__base--plain" />

                                        {/* ✅ removed texture background from image */}
                                        {/* no kc-premFace__texture */}

                                        <div className="kc-premLogoWrap">
                                            <img
                                                src={displayedLogo}
                                                alt="Card logo"
                                                className="kc-premLogo"
                                                style={{ width: `${logoSize}%` }}
                                                draggable={false}
                                            />
                                        </div>

                                        <div className="kc-premShine" aria-hidden="true" />
                                        <div className="kc-premRim" aria-hidden="true" />
                                    </div>

                                    {/* BACK */}
                                    <div className="kc-premFace kc-premFace--back kc-premFace--plainWhite">
                                        <div className="kc-premBackInner">
                                            <div className="kc-premBackMeta">
                                                <div className="kc-premBackK">QR backup</div>
                                                <div className="kc-premBackS">Scan to open profile</div>
                                            </div>
                                            <div className="kc-premQr">
                                                <QrSvg />
                                            </div>
                                        </div>
                                        <div className="kc-premShine" aria-hidden="true" />
                                        <div className="kc-premRim" aria-hidden="true" />
                                    </div>

                                    <div className="kc-premEdge kc-premEdge--top" aria-hidden="true" />
                                    <div className="kc-premEdge kc-premEdge--bottom" aria-hidden="true" />
                                </div>

                                <div className="kc-premStage__hint">
                                    {isDragging ? "Release to stop" : "Drag to rotate • 360°"}
                                    <button type="button" className="kc-premStage__reset" onClick={resetView}>
                                        Reset
                                    </button>
                                </div>
                            </div>

                            {/* Controls (keep, but cleaner) */}
                            <div className="kc-premControls kc-premControls--clean">
                                <div className="kc-premControls__left">
                                    <div className="kc-premControls__label">Your logo</div>
                                    <div className="kc-premControls__sub">Upload any image — preview updates instantly.</div>
                                </div>

                                <div className="kc-premControls__right">
                                    <label className="kc-premBtn">
                                        <input type="file" accept="image/*" onChange={onPickLogo} />
                                        Upload logo
                                    </label>

                                    <button type="button" className="kc-premBtn kc-premBtn--ghost" onClick={clearLogo} disabled={!logoUrl}>
                                        Remove
                                    </button>

                                    <div className="kc-premSlider">
                                        <span className="kc-premSlider__k">Size</span>
                                        <input
                                            type="range"
                                            min={28}
                                            max={70}
                                            value={logoSize}
                                            onChange={(e) => setLogoSize(Number(e.target.value))}
                                            aria-label="Logo size"
                                        />
                                        <span className="kc-premSlider__v">{logoSize}%</span>
                                    </div>
                                </div>
                            </div>

                            {/* Buy row */}
                            <div className="kc-premBuy kc-premBuy--clean" aria-label="Choose quantity and buy">
                                <div className="kc-premPrice">
                                    <div className="kc-premPrice__value">£29.99</div>
                                    <div className="kc-premPrice__note">One-time purchase • Works with your profile</div>
                                </div>

                                <div className="kc-premBuy__right">
                                    <div className="kc-konarcard__qty">
                                        <button
                                            type="button"
                                            className="kc-konarcard__qtyBtn"
                                            onClick={() => setQty((q) => Math.max(1, q - 1))}
                                            aria-label="Decrease quantity"
                                        >
                                            −
                                        </button>
                                        <div className="kc-konarcard__qtyVal" aria-label="Quantity">
                                            {qty}
                                        </div>
                                        <button
                                            type="button"
                                            className="kc-konarcard__qtyBtn"
                                            onClick={() => setQty((q) => Math.min(20, q + 1))}
                                            aria-label="Increase quantity"
                                        >
                                            +
                                        </button>
                                    </div>

                                    <Link
                                        to="/productandplan/konarcard"
                                        state={{ triggerCheckout: true, quantity: qty, edition: "plastic" }}
                                        className="kc-konarcard__cta kc-konarcard__cta--primary"
                                    >
                                        Buy KonarCard
                                    </Link>

                                    <Link to="/register" className="kc-konarcard__cta kc-konarcard__cta--ghost">
                                        Create your profile first
                                    </Link>
                                </div>
                            </div>

                            {/* Optional thumbs kept (they no longer affect card texture, but you can keep for future) */}
                            <div className="kc-premThumbs" aria-label="Choose a preview image">
                                <div className="kc-premThumbs__label">Preview images</div>
                                <div className="kc-konarcard__thumbRow">
                                    {gallery.map((src, i) => {
                                        const isActive = src === activeImg;
                                        return (
                                            <button
                                                key={i}
                                                type="button"
                                                className={`kc-konarcard__thumb ${isActive ? "is-active" : ""}`}
                                                onClick={() => setActiveImg(src)}
                                                aria-label={`View image ${i + 1}`}
                                            >
                                                <img src={src} alt={`KonarCard image ${i + 1}`} />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* What you get (keep) */}
                            <div className="kc-konarcard__section">
                                <div className="kc-konarcard__sectionHead">
                                    <h2 className="kc-konarcard__h2">What you get</h2>
                                    <p className="kc-konarcard__p">
                                        Everything you need to share your profile instantly — no paper cards, no typing numbers.
                                    </p>
                                </div>

                                <div className="kc-konarcard__featureGrid">
                                    {features.map((f, i) => (
                                        <div className="kc-konarcard__feature" key={i}>
                                            <div className="kc-konarcard__ico" aria-hidden="true">
                                                ✓
                                            </div>
                                            <div>
                                                <div className="kc-konarcard__featureT">{f.t}</div>
                                                <div className="kc-konarcard__featureS">{f.s}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* ✅ removed Ready / bottom CTA sections completely */}
                        </div>
                    </section>
                </div>
            </main>

            <Footer />
        </>
    );
}
