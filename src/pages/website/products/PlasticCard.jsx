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

        {/* noise blocks */}
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

    const [activeImg, setActiveImg] = useState(gallery[0]);
    const [qty, setQty] = useState(1);

    // ---- Logo upload preview ----
    const [logoUrl, setLogoUrl] = useState("");
    const [logoSize, setLogoSize] = useState(44); // %
    const [logoY, setLogoY] = useState(0); // future: keep if we add positioning later

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

    // ---- Premium 3D rotation (full 360) + idle auto-rotate ----
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
        baseRX: -12,
        baseRY: 18,
        lastMoveTs: 0,
    });

    const rafRef = useRef(null);
    const idleRef = useRef({
        isIdle: true,
        ry: 18,
        rx: -12,
    });

    const [rot, setRot] = useState({ rx: -12, ry: 18 });
    const [isDragging, setIsDragging] = useState(false);

    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

    const setRotation = (rx, ry) => {
        // rx clamped for realism, ry free (360+)
        const next = { rx: clamp(rx, -26, 26), ry };
        idleRef.current.rx = next.rx;
        idleRef.current.ry = next.ry;
        setRot(next);
    };

    const resetView = () => setRotation(-12, 18);

    const startIdleSpin = () => {
        if (prefersReducedMotion.current) return;
        if (rafRef.current) cancelAnimationFrame(rafRef.current);

        idleRef.current.isIdle = true;

        const tick = () => {
            if (!idleRef.current.isIdle) return;
            idleRef.current.ry += 0.18; // speed
            // tiny breathe
            const breathe = Math.sin(idleRef.current.ry * (Math.PI / 180) * 0.7) * 1.2;
            setRot({ rx: clamp(-12 + breathe, -26, 26), ry: idleRef.current.ry });
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
        dragRef.current.lastMoveTs = Date.now();

        try {
            e.currentTarget.setPointerCapture(e.pointerId);
        } catch { }
    };

    const onPointerMove = (e) => {
        if (!dragRef.current.isDown) return;

        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;

        // sensitivity tuned for premium feel
        const nextRY = dragRef.current.baseRY + dx * 0.18; // full 360 OK
        const nextRX = dragRef.current.baseRX - dy * 0.16;

        dragRef.current.lastMoveTs = Date.now();
        setRotation(nextRX, nextRY);
    };

    const onPointerUp = () => {
        dragRef.current.isDown = false;
        setIsDragging(false);

        // resume idle after a short pause
        window.setTimeout(() => {
            if (!dragRef.current.isDown) startIdleSpin();
        }, 500);
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

    // Use uploaded logo or Konar logo as placeholder
    const displayedLogo = logoUrl || LogoIcon;

    // drive shine from rotation
    const shineX = 50 + (rot.ry % 360) * 0.12; // moves with rotate
    const shineY = 40 + rot.rx * -0.6;

    return (
        <>
            <Navbar />

            <main className="kc-konarcard kc-konarcard--premium">
                <div className="kc-konarcard__wrap">
                    {/* ===== Premium hero row: BIG product ===== */}
                    <section className="kc-premHero">
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
                            <div
                                className={`kc-premStage__surface ${isDragging ? "is-dragging" : ""}`}
                                onPointerDown={onPointerDown}
                                onPointerMove={onPointerMove}
                                onPointerUp={onPointerUp}
                                onPointerCancel={onPointerUp}
                                role="application"
                                aria-label="3D KonarCard preview. Drag to rotate."
                            >
                                <div
                                    className="kc-premCard"
                                    style={{
                                        transform: `rotateX(${rot.rx}deg) rotateY(${rot.ry}deg)`,
                                        ["--shineX"]: `${shineX}%`,
                                        ["--shineY"]: `${shineY}%`,
                                    }}
                                >
                                    {/* FRONT */}
                                    <div className="kc-premFace kc-premFace--front">
                                        <div className="kc-premFace__base" />

                                        {/* subtle “plastic” texture from your gallery image (optional) */}
                                        <div
                                            className="kc-premFace__texture"
                                            style={{ backgroundImage: `url(${activeImg})` }}
                                            aria-hidden="true"
                                        />

                                        <div className="kc-premLogoWrap" style={{ transform: `translate(-50%, calc(-50% + ${logoY}px))` }}>
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
                                    <div className="kc-premFace kc-premFace--back">
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

                                    {/* thickness illusion */}
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

                            {/* Customizer (premium bar) */}
                            <div className="kc-premControls">
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
                        </div>
                    </section>

                    {/* ===== Purchase row (clean, premium) ===== */}
                    <section className="kc-premBuy">
                        <div className="kc-premBuy__left">
                            <div className="kc-premPrice">
                                <div className="kc-premPrice__value">£29.99</div>
                                <div className="kc-premPrice__note">One-time purchase • Works with your profile</div>
                            </div>
                        </div>

                        <div className="kc-premBuy__right" aria-label="Choose quantity and buy">
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
                    </section>

                    {/* thumbs (optional: keep for textures) */}
                    <section className="kc-premThumbs" aria-label="Choose a preview texture">
                        <div className="kc-premThumbs__label">Preview styles</div>
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
                    </section>

                    {/* ===== Middle content ===== */}
                    <section className="kc-konarcard__section">
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
                    </section>

                    <section className="kc-konarcard__bottom">
                        <div className="kc-konarcard__bottomInner">
                            <div>
                                <h2 className="kc-konarcard__h2">Ready to share like a pro?</h2>
                                <p className="kc-konarcard__p">
                                    Get your KonarCard and start sending your profile instantly — no paper, no hassle.
                                </p>
                            </div>

                            <Link
                                to="/productandplan/konarcard"
                                state={{ triggerCheckout: true, quantity: qty, edition: "plastic" }}
                                className="kc-konarcard__cta kc-konarcard__cta--primary"
                            >
                                Buy KonarCard
                            </Link>
                        </div>
                    </section>
                </div>
            </main>

            <Footer />
        </>
    );
}
