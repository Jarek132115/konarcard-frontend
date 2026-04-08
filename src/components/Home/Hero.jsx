import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

/* Profiles */
import UP1 from "../../assets/images/UP1.jpg";
import UP2 from "../../assets/images/UP2.jpg";
import UP3 from "../../assets/images/UP3.jpg";
import UP4 from "../../assets/images/UP4.jpg";
import UP5 from "../../assets/images/UP5.jpg";
import UP6 from "../../assets/images/UP6.jpg";
import UP7 from "../../assets/images/UP7.jpg";
import UP8 from "../../assets/images/UP8.jpg";

/* Hero background */
import HeroTradieBackground from "../../assets/images/HeroTradieBackground.jpg";

/* CSS */
import "../../styling/home/hero.css";

export default function Hero() {
    const items = useMemo(() => [UP1, UP2, UP3, UP4, UP5, UP6, UP7, UP8], []);

    const viewportRef = useRef(null);
    const setMeasureRef = useRef(null);
    const rafRef = useRef(0);

    const offsetRef = useRef(0);
    const velocityRef = useRef(0.42); // positive = content moves right
    const draggingRef = useRef(false);

    const pointerIdRef = useRef(null);
    const startXRef = useRef(0);
    const startYRef = useRef(0);
    const startOffsetRef = useRef(0);
    const lastDxRef = useRef(0);
    const axisLockedRef = useRef(null); // "x" | "y" | null

    const setWidthRef = useRef(0);

    const [trackStyle, setTrackStyle] = useState({
        transform: "translate3d(0px, 0, 0)",
    });

    const applyOffset = (value) => {
        offsetRef.current = value;
        setTrackStyle({
            transform: `translate3d(${value}px, 0, 0)`,
        });
    };

    const wrapOffset = (value) => {
        const setWidth = setWidthRef.current;
        if (!setWidth) return value;

        let next = value;

        while (next >= 0) next -= setWidth;
        while (next < -setWidth * 2) next += setWidth;

        return next;
    };

    useLayoutEffect(() => {
        const measure = () => {
            const setEl = setMeasureRef.current;
            if (!setEl) return;

            const rect = setEl.getBoundingClientRect();
            const width = rect.width;

            if (!Number.isFinite(width) || width <= 0) return;

            setWidthRef.current = width;
            applyOffset(-width);
        };

        measure();

        const timer1 = setTimeout(measure, 60);
        const timer2 = setTimeout(measure, 300);

        window.addEventListener("resize", measure);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            window.removeEventListener("resize", measure);
        };
    }, []);

    useEffect(() => {
        let lastTs = 0;

        const tick = (ts) => {
            if (!lastTs) lastTs = ts;
            const dt = Math.min((ts - lastTs) / 16.6667, 2);
            lastTs = ts;

            if (!draggingRef.current && setWidthRef.current > 0) {
                const next = wrapOffset(offsetRef.current + velocityRef.current * dt);
                applyOffset(next);
            }

            rafRef.current = window.requestAnimationFrame(tick);
        };

        rafRef.current = window.requestAnimationFrame(tick);

        return () => {
            window.cancelAnimationFrame(rafRef.current);
        };
    }, []);

    useEffect(() => {
        const el = viewportRef.current;
        if (!el) return;

        const releasePointer = () => {
            if (pointerIdRef.current != null) {
                try {
                    el.releasePointerCapture?.(pointerIdRef.current);
                } catch { }
            }
            pointerIdRef.current = null;
        };

        const onPointerDown = (e) => {
            pointerIdRef.current = e.pointerId;
            el.setPointerCapture?.(e.pointerId);

            draggingRef.current = true;
            axisLockedRef.current = null;
            startXRef.current = e.clientX;
            startYRef.current = e.clientY;
            startOffsetRef.current = offsetRef.current;
            lastDxRef.current = 0;
        };

        const onPointerMove = (e) => {
            if (!draggingRef.current) return;

            const dx = e.clientX - startXRef.current;
            const dy = e.clientY - startYRef.current;

            if (axisLockedRef.current == null) {
                if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
                    axisLockedRef.current = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
                }
            }

            if (axisLockedRef.current === "y") {
                draggingRef.current = false;
                axisLockedRef.current = null;
                releasePointer();
                return;
            }

            if (axisLockedRef.current === "x") {
                e.preventDefault();
                lastDxRef.current = dx;
                const next = wrapOffset(startOffsetRef.current + dx);
                applyOffset(next);
            }
        };

        const onPointerEnd = () => {
            if (!draggingRef.current) return;

            draggingRef.current = false;

            const dx = lastDxRef.current;
            const speed = 0.42;

            if (Math.abs(dx) > 2) {
                velocityRef.current = dx > 0 ? speed : -speed;
            }

            axisLockedRef.current = null;
            releasePointer();
        };

        el.addEventListener("pointerdown", onPointerDown);
        window.addEventListener("pointermove", onPointerMove, { passive: false });
        window.addEventListener("pointerup", onPointerEnd);
        window.addEventListener("pointercancel", onPointerEnd);
        window.addEventListener("blur", onPointerEnd);

        return () => {
            el.removeEventListener("pointerdown", onPointerDown);
            window.removeEventListener("pointermove", onPointerMove);
            window.removeEventListener("pointerup", onPointerEnd);
            window.removeEventListener("pointercancel", onPointerEnd);
            window.removeEventListener("blur", onPointerEnd);
        };
    }, []);

    const repeatedSets = useMemo(() => [0, 1, 2], []);

    return (
        <header className="kc-homeHero">
            <section
                className="kc-homeHero__heroBg"
                style={{ backgroundImage: `url(${HeroTradieBackground})` }}
            >
                <div className="kc-homeHero__heroInner">
                    <div className="kc-homeHero__copy">
                        <div className="kc-pill kc-homeHero__pill">
                            NFC + QR Digital Business Card for Trades
                        </div>

                        <h1 className="h1 kc-homeHero__title">
                            The Digital{" "}
                            <span className="kc-homeHero__accent">Business Card</span> Built For
                            Trades
                        </h1>

                        <p className="kc-subheading kc-homeHero__sub">
                            Share your contact details with a tap, QR, or link - and update them
                            anytime.
                        </p>

                        <div className="kc-homeHero__ctaRow">
                            <Link
                                to="/register"
                                className="kx-btn kx-btn--orange kc-homeHero__ctaBtn"
                            >
                                Claim Your Link
                            </Link>

                            <Link
                                to="/how-it-works"
                                className="kx-btn kx-btn--white kc-homeHero__ctaBtn"
                            >
                                Watch How It Works
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <div className="kc-homeHero__carousel" aria-label="Example digital business cards">
                <div className="kc-homeHero__marquee" ref={viewportRef} style={{ touchAction: "pan-y" }}>
                    <div className="kc-homeHero__track" style={trackStyle}>
                        {repeatedSets.map((setIndex) => (
                            <div
                                key={setIndex}
                                ref={setIndex === 1 ? setMeasureRef : null}
                                className="kc-homeHero__set"
                                aria-hidden={setIndex !== 1}
                            >
                                {items.map((src, i) => (
                                    <div className="kc-homeHero__phone" key={`${setIndex}-${i}`}>
                                        <img
                                            src={src}
                                            alt={
                                                setIndex === 1
                                                    ? `Example digital business card profile ${i + 1}`
                                                    : ""
                                            }
                                            className="kc-homeHero__phoneImg"
                                            draggable={false}
                                            loading={setIndex === 1 ? "eager" : "lazy"}
                                        />
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </header>
    );
}