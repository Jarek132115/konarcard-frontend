// frontend/src/components/Home/Hero.jsx
import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { gsap } from "gsap";

/* Profile images */
import UP1 from "../../assets/images/UP1.jpg";
import UP2 from "../../assets/images/UP2.jpg";
import UP3 from "../../assets/images/UP3.jpg";
import UP4 from "../../assets/images/UP4.jpg";
import UP5 from "../../assets/images/UP5.jpg";
import UP6 from "../../assets/images/UP6.jpg";
import UP7 from "../../assets/images/UP7.jpg";
import UP8 from "../../assets/images/UP8.jpg";

import "../../styling/home/hero.css";

/* ── Animation presets ─────────────────────────────────────── */
const EASE = [0.22, 1, 0.36, 1];

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.52, delay, ease: EASE },
});

/* ── Data ──────────────────────────────────────────────────── */
const ITEMS = [UP1, UP2, UP3, UP4, UP5, UP6, UP7, UP8];
const LOOP_ITEMS = [...ITEMS, ...ITEMS];

export default function Hero() {
    const carouselRef = useRef(null);
    const trackRef    = useRef(null);

    useEffect(() => {
        const carouselEl = carouselRef.current;
        const trackEl    = trackRef.current;
        if (!carouselEl || !trackEl) return;

        let distance = 0;
        let offset   = 0;
        const baseSpeed = 100;
        let direction   = 1;

        let isDragging    = false;
        let isPointerDown = false;
        let dragStartX    = 0;
        let dragStartY    = 0;
        let dragStartOffset  = 0;
        let lastDragDeltaX   = 0;
        let tickerFn = null;
        let running  = true;

        const applyTransform = () => gsap.set(trackEl, { x: -offset });

        const startTicker = () => {
            if (!distance) return;
            let lastTime = gsap.ticker.time;
            tickerFn = (time) => {
                if (!running) return;
                const dt = time - lastTime;
                lastTime = time;
                if (!isDragging) {
                    offset = (((offset + direction * baseSpeed * dt) % distance) + distance) % distance;
                    applyTransform();
                }
            };
            gsap.ticker.add(tickerFn);
        };

        const measureAndStart = () => {
            distance = trackEl.scrollWidth / 2;
            if (distance > 0) {
                offset = 0;
                applyTransform();
                if (tickerFn) { gsap.ticker.remove(tickerFn); tickerFn = null; }
                startTicker();
            }
        };

        const imgEls = trackEl.querySelectorAll("img");
        let loadedCount = 0;
        const handleLoad = () => { if (++loadedCount >= imgEls.length) measureAndStart(); };
        if (imgEls.length === 0) { measureAndStart(); }
        else { imgEls.forEach((img) => img.complete ? handleLoad() : (img.addEventListener("load", handleLoad), img.addEventListener("error", handleLoad))); }

        window.addEventListener("resize", measureAndStart);

        const getX = (e) => (e.touches?.length ? e.touches[0].clientX : e.clientX);
        const getY = (e) => (e.touches?.length ? e.touches[0].clientY : e.clientY);
        const HTHRESH = 8, MIN_DIR = 4;

        const onDown = (e) => {
            if (!distance || (e.button !== undefined && e.button !== 0)) return;
            isPointerDown = true; isDragging = false;
            dragStartX = getX(e); dragStartY = getY(e);
            dragStartOffset = offset; lastDragDeltaX = 0;
        };

        const onMove = (e) => {
            if (!isPointerDown || !distance) return;
            const dx = getX(e) - dragStartX, dy = getY(e) - dragStartY;
            if (!isDragging) {
                if (Math.abs(dx) < HTHRESH && Math.abs(dy) < HTHRESH) return;
                if (Math.abs(dx) > Math.abs(dy)) { isDragging = true; trackEl.classList.add("is-dragging"); }
                else { isPointerDown = false; return; }
            }
            offset = (((dragStartOffset - dx) % distance) + distance) % distance;
            lastDragDeltaX = dx;
            applyTransform();
            if (e.cancelable) e.preventDefault();
        };

        const onUp = () => {
            if (!isPointerDown && !isDragging) return;
            isPointerDown = false; isDragging = false;
            trackEl.classList.remove("is-dragging");
            if (Math.abs(lastDragDeltaX) > MIN_DIR) direction = lastDragDeltaX > 0 ? -1 : 1;
            lastDragDeltaX = 0;
        };

        trackEl.addEventListener("dragstart", (e) => e.preventDefault());
        carouselEl.addEventListener("mousedown", onDown);
        carouselEl.addEventListener("touchstart", onDown, { passive: false });
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
        window.addEventListener("touchmove", onMove, { passive: false });
        window.addEventListener("touchend", onUp);
        window.addEventListener("touchcancel", onUp);

        return () => {
            running = false;
            if (tickerFn) gsap.ticker.remove(tickerFn);
            imgEls.forEach((img) => { img.removeEventListener("load", handleLoad); img.removeEventListener("error", handleLoad); });
            window.removeEventListener("resize", measureAndStart);
            carouselEl.removeEventListener("mousedown", onDown);
            carouselEl.removeEventListener("touchstart", onDown);
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
            window.removeEventListener("touchmove", onMove);
            window.removeEventListener("touchend", onUp);
            window.removeEventListener("touchcancel", onUp);
        };
    }, []);

    return (
        <header className="kc-homeHero">

            {/* ── Heading copy ──────────────────────────────── */}
            <div className="kc-homeHero__inner">

                {/* Subtle grid texture — covers the full heading area */}
                <div className="kc-homeHero__gridBg" aria-hidden="true" />
                <motion.p className="kc-pill kc-homeHero__pill" {...fadeUp(0.06)}>
                    NFC + QR Digital Business Card for Trades
                </motion.p>

                <motion.h1 className="h1 kc-homeHero__title" {...fadeUp(0.14)}>
                    The Digital{" "}
                    <span className="kc-homeHero__accent">Business Card</span>{" "}
                    Built For Trades
                </motion.h1>

                <motion.p className="kc-subheading kc-homeHero__sub" {...fadeUp(0.22)}>
                    Share your contact details with a tap, QR, or link — and update them anytime.
                </motion.p>

                <motion.div className="kc-homeHero__ctaRow" {...fadeUp(0.30)}>
                    <Link to="/register" className="kx-btn kx-btn--orange kc-homeHero__ctaBtn">
                        Claim Your Link
                    </Link>
                    <Link to="/how-it-works" className="kx-btn kx-btn--white kc-homeHero__ctaBtn">
                        Watch How It Works
                    </Link>
                </motion.div>
            </div>

            {/* ── Phone carousel — contained width, clipped ── */}
            <motion.div
                className="kc-homeHero__carouselOuter"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.38, ease: EASE }}
            >
                <section
                    className="kc-homeHero__carousel"
                    aria-label="Example KonarCard profiles"
                    ref={carouselRef}
                >
                    <div className="kc-homeHero__track" ref={trackRef}>
                        {LOOP_ITEMS.map((src, i) => (
                            <div className="kc-homeHero__phone" key={i}>
                                <img
                                    src={src}
                                    alt={i < ITEMS.length ? `Example KonarCard profile ${i + 1}` : ""}
                                    className="kc-homeHero__phoneImg"
                                    draggable="false"
                                />
                            </div>
                        ))}
                    </div>
                </section>
            </motion.div>

        </header>
    );
}
