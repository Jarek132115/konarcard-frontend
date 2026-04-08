import React, { useEffect, useMemo, useRef } from "react";
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
    const items = useMemo(
        () => [UP1, UP2, UP3, UP4, UP5, UP6, UP7, UP8],
        []
    );

    const scrollerRef = useRef(null);
    const trackRef = useRef(null);

    const rafRef = useRef(0);
    const draggingRef = useRef(false);

    const startXRef = useRef(0);
    const startYRef = useRef(0);
    const startScrollRef = useRef(0);
    const axisLockedRef = useRef(null); // "x" | "y" | null
    const lastDragDeltaXRef = useRef(0);

    const baseSpeedRef = useRef(0.55);
    const motionRef = useRef(-0.55); // negative scrollLeft delta = visual left -> right

    const renderGroups = 3;
    const groups = useMemo(() => new Array(renderGroups).fill(0), []);
    const groupWidthRef = useRef(0);

    const computeGroupWidth = () => {
        const track = trackRef.current;
        if (!track) return 0;

        const gw = track.scrollWidth / renderGroups;
        if (Number.isFinite(gw) && gw > 0) groupWidthRef.current = gw;
        return groupWidthRef.current;
    };

    const normalizeLoop = (alsoAdjustDragBase = false) => {
        const el = scrollerRef.current;
        if (!el) return;

        const gw = groupWidthRef.current || computeGroupWidth();
        if (!gw) return;

        const min = gw;
        const max = gw * 2;

        if (el.scrollLeft < min) {
            el.scrollLeft += gw;
            if (alsoAdjustDragBase) startScrollRef.current += gw;
        }

        if (el.scrollLeft >= max) {
            el.scrollLeft -= gw;
            if (alsoAdjustDragBase) startScrollRef.current -= gw;
        }
    };

    useEffect(() => {
        const el = scrollerRef.current;
        const track = trackRef.current;
        if (!el || !track) return;

        const setInitial = () => {
            const gw = computeGroupWidth();
            if (gw > 0) {
                el.scrollLeft = gw;
                normalizeLoop(false);
            }
        };

        setInitial();
        const t1 = setTimeout(setInitial, 120);
        const t2 = setTimeout(setInitial, 520);

        const onResize = () => {
            const gw = computeGroupWidth();
            if (gw > 0) {
                el.scrollLeft = gw;
                normalizeLoop(false);
            }
        };

        window.addEventListener("resize", onResize);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            window.removeEventListener("resize", onResize);
        };
    }, []);

    useEffect(() => {
        const el = scrollerRef.current;
        if (!el) return;

        const tick = () => {
            if (!draggingRef.current) {
                el.scrollLeft += motionRef.current;
                normalizeLoop(false);
            }
            rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);

        return () => {
            cancelAnimationFrame(rafRef.current);
        };
    }, []);

    useEffect(() => {
        const el = scrollerRef.current;
        if (!el) return;

        const onScroll = () => {
            if (!draggingRef.current) normalizeLoop(false);
        };

        el.addEventListener("scroll", onScroll, { passive: true });
        return () => el.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        const el = scrollerRef.current;
        if (!el) return;

        let pointerId = null;

        const onPointerDown = (e) => {
            pointerId = e.pointerId;
            el.setPointerCapture?.(pointerId);

            draggingRef.current = true;
            axisLockedRef.current = null;
            lastDragDeltaXRef.current = 0;

            startXRef.current = e.clientX;
            startYRef.current = e.clientY;
            startScrollRef.current = el.scrollLeft;

            computeGroupWidth();
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

            if (axisLockedRef.current === "x") {
                e.preventDefault();
                lastDragDeltaXRef.current = dx;
                el.scrollLeft = startScrollRef.current - dx;
                normalizeLoop(true);
            } else if (axisLockedRef.current === "y") {
                draggingRef.current = false;
                axisLockedRef.current = null;

                if (pointerId != null) {
                    try {
                        el.releasePointerCapture?.(pointerId);
                    } catch { }
                }
            }
        };

        const endDrag = () => {
            if (!draggingRef.current) return;

            draggingRef.current = false;
            axisLockedRef.current = null;

            const dx = lastDragDeltaXRef.current;
            const base = baseSpeedRef.current;

            if (Math.abs(dx) > 2) {
                motionRef.current = dx > 0 ? -base : base;
            }

            normalizeLoop(false);

            if (pointerId != null) {
                try {
                    el.releasePointerCapture?.(pointerId);
                } catch { }
            }
        };

        el.addEventListener("pointerdown", onPointerDown);
        window.addEventListener("pointermove", onPointerMove, { passive: false });
        window.addEventListener("pointerup", endDrag);
        window.addEventListener("pointercancel", endDrag);
        window.addEventListener("blur", endDrag);

        return () => {
            el.removeEventListener("pointerdown", onPointerDown);
            window.removeEventListener("pointermove", onPointerMove);
            window.removeEventListener("pointerup", endDrag);
            window.removeEventListener("pointercancel", endDrag);
            window.removeEventListener("blur", endDrag);
        };
    }, []);

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
                            <span className="kc-homeHero__accent">Business Card</span>
                            <br />
                            Built For Trades
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

            <div
                className="kc-homeHero__carousel"
                aria-label="Example digital business cards"
            >
                <div className="kc-homeHero__scrollerOuter">
                    <div
                        ref={scrollerRef}
                        className="kc-homeHero__scroller"
                        style={{ touchAction: "pan-y" }}
                    >
                        <div ref={trackRef} className="kc-homeHero__track">
                            {groups.map((_, gi) => (
                                <React.Fragment key={gi}>
                                    {items.map((src, i) => (
                                        <div
                                            key={`${gi}-${i}`}
                                            className="kc-homeHero__phone"
                                        >
                                            <img
                                                src={src}
                                                alt={`Example digital business card profile ${i + 1}`}
                                                className="kc-homeHero__phoneImg"
                                                draggable={false}
                                                loading={gi === 1 ? "eager" : "lazy"}
                                            />
                                        </div>
                                    ))}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}