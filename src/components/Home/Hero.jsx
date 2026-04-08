import React, { useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";

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
    const loopItems = useMemo(() => [...items, ...items], [items]);

    const heroRef = useRef(null);

    useEffect(() => {
        const heroEl = heroRef.current;
        if (!heroEl) return;

        const carouselEl = heroEl.querySelector(".kc-homeHero__carousel");
        const trackEl = heroEl.querySelector(".kc-homeHero__track");

        if (!carouselEl || !trackEl) return;

        let distance = 0;
        let offset = 0;

        const baseSpeed = 120;
        let direction = 1;

        let isDragging = false;
        let isPointerDown = false;
        let dragStartX = 0;
        let dragStartY = 0;
        let dragStartOffset = 0;
        let lastDragDeltaX = 0;
        let tickerFn = null;

        const applyTransform = () => {
            gsap.set(trackEl, { x: -offset });
        };

        const startTicker = () => {
            if (!distance) return;

            let lastTime = gsap.ticker.time;

            tickerFn = (time) => {
                const dt = time - lastTime;
                lastTime = time;

                if (!isDragging) {
                    offset += direction * baseSpeed * dt;

                    if (distance > 0) {
                        offset = ((offset % distance) + distance) % distance;
                    }

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

                if (tickerFn) {
                    gsap.ticker.remove(tickerFn);
                    tickerFn = null;
                }

                startTicker();
            }
        };

        const imgEls = trackEl.querySelectorAll("img");
        const totalImgs = imgEls.length;
        let loadedCount = 0;

        const handleImageLoaded = () => {
            loadedCount += 1;
            if (loadedCount >= totalImgs) {
                measureAndStart();
            }
        };

        if (totalImgs === 0) {
            measureAndStart();
        } else {
            imgEls.forEach((img) => {
                if (img.complete) {
                    handleImageLoaded();
                } else {
                    img.addEventListener("load", handleImageLoaded);
                    img.addEventListener("error", handleImageLoaded);
                }
            });
        }

        const onResize = () => {
            measureAndStart();
        };

        window.addEventListener("resize", onResize);

        const getClientX = (e) =>
            e.touches && e.touches.length ? e.touches[0].clientX : e.clientX;

        const getClientY = (e) =>
            e.touches && e.touches.length ? e.touches[0].clientY : e.clientY;

        const HORIZONTAL_THRESHOLD = 8;
        const MIN_DIRECTION_DELTA = 4;

        const onPointerDown = (e) => {
            if (!distance) return;

            if (e.button !== undefined && e.button !== 0) return;

            isPointerDown = true;
            isDragging = false;
            dragStartX = getClientX(e);
            dragStartY = getClientY(e);
            dragStartOffset = offset;
            lastDragDeltaX = 0;
        };

        const onPointerMove = (e) => {
            if (!isPointerDown || !distance) return;

            const currentX = getClientX(e);
            const currentY = getClientY(e);
            const deltaX = currentX - dragStartX;
            const deltaY = currentY - dragStartY;

            if (!isDragging) {
                if (
                    Math.abs(deltaX) < HORIZONTAL_THRESHOLD &&
                    Math.abs(deltaY) < HORIZONTAL_THRESHOLD
                ) {
                    return;
                }

                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                    isDragging = true;
                    trackEl.classList.add("kc-homeHero__track--dragging");
                } else {
                    isPointerDown = false;
                    isDragging = false;
                    return;
                }
            }

            offset = dragStartOffset - deltaX;
            lastDragDeltaX = deltaX;
            offset = ((offset % distance) + distance) % distance;

            applyTransform();

            if (e.cancelable) e.preventDefault();
        };

        const endDrag = () => {
            if (!isPointerDown && !isDragging) return;

            isPointerDown = false;
            isDragging = false;
            trackEl.classList.remove("kc-homeHero__track--dragging");

            if (Math.abs(lastDragDeltaX) > MIN_DIRECTION_DELTA) {
                direction = lastDragDeltaX > 0 ? -1 : 1;
            }

            lastDragDeltaX = 0;
        };

        const onNativeDragStart = (e) => {
            e.preventDefault();
        };

        trackEl.addEventListener("dragstart", onNativeDragStart);

        carouselEl.addEventListener("mousedown", onPointerDown);
        window.addEventListener("mousemove", onPointerMove);
        window.addEventListener("mouseup", endDrag);

        carouselEl.addEventListener("touchstart", onPointerDown, {
            passive: false,
        });
        window.addEventListener("touchmove", onPointerMove, { passive: false });
        window.addEventListener("touchend", endDrag);
        window.addEventListener("touchcancel", endDrag);

        return () => {
            if (tickerFn) {
                gsap.ticker.remove(tickerFn);
            }

            imgEls.forEach((img) => {
                img.removeEventListener("load", handleImageLoaded);
                img.removeEventListener("error", handleImageLoaded);
            });

            window.removeEventListener("resize", onResize);

            trackEl.removeEventListener("dragstart", onNativeDragStart);

            carouselEl.removeEventListener("mousedown", onPointerDown);
            window.removeEventListener("mousemove", onPointerMove);
            window.removeEventListener("mouseup", endDrag);

            carouselEl.removeEventListener("touchstart", onPointerDown);
            window.removeEventListener("touchmove", onPointerMove);
            window.removeEventListener("touchend", endDrag);
            window.removeEventListener("touchcancel", endDrag);
        };
    }, [loopItems]);

    return (
        <header className="kc-homeHero" ref={heroRef}>
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

            <section
                className="kc-homeHero__carousel"
                aria-label="Example digital business cards"
            >
                <div className="kc-homeHero__track">
                    {loopItems.map((src, index) => (
                        <div className="kc-homeHero__phone" key={index}>
                            <img
                                src={src}
                                alt={index < items.length ? `Example digital business card profile ${index + 1}` : ""}
                                className="kc-homeHero__phoneImg"
                                draggable="false"
                            />
                        </div>
                    ))}
                </div>
            </section>
        </header>
    );
}