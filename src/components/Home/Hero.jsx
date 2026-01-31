import React, { useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";

/* Global typography/tokens */
import "../../styling/fonts.css";
/* Hero styles */
import "../../styling/home/hero.css";

/* === Real profile images (UP1 → UP8) === */
import UP1 from "../../assets/images/UP1.jpg";
import UP2 from "../../assets/images/UP2.jpg";
import UP3 from "../../assets/images/UP3.jpg";
import UP4 from "../../assets/images/UP4.jpg";
import UP5 from "../../assets/images/UP5.jpg";
import UP6 from "../../assets/images/UP6.jpg";
import UP7 from "../../assets/images/UP7.jpg";
import UP8 from "../../assets/images/UP8.jpg";

export default function Hero() {
    /* =========================================================
       PROFILES: edge-to-edge, looping, draggable marquee
       - Auto-scroll LEFT -> RIGHT
       - Drag horizontally (but allow vertical page scroll)
       - Gap: 10px
    ========================================================== */
    const items = useMemo(
        () => [
            { src: UP1, tone: "#FFECD2" },
            { src: UP2, tone: "#FFDCC7" },
            { src: UP3, tone: "#E8F0FF" },
            { src: UP4, tone: "#D9F2EA" },
            { src: UP5, tone: "#E9F1FF" },
            { src: UP6, tone: "#E9F7E9" },
            { src: UP7, tone: "#FFE3DB" },
            { src: UP8, tone: "#E6ECFA" },
        ],
        []
    );

    const scrollerRef = useRef(null);
    const trackRef = useRef(null);

    const rafRef = useRef(0);
    const draggingRef = useRef(false);
    const pauseRef = useRef(false);
    const startXRef = useRef(0);
    const startYRef = useRef(0);
    const startScrollRef = useRef(0);
    const axisLockedRef = useRef(null); // 'x' | 'y' | null

    // speed = px per frame
    const speedRef = useRef(0.45);

    // render repeated groups for seamless loop
    const renderGroups = 4;
    const groups = useMemo(() => new Array(renderGroups).fill(0), []);

    useEffect(() => {
        const el = scrollerRef.current;
        if (!el) return;
        el.style.setProperty("--gap", "10px");
    }, []);

    // autoplay (left -> right)
    useEffect(() => {
        const el = scrollerRef.current;
        const track = trackRef.current;
        if (!el || !track) return;

        // Start in the middle so wrapping feels seamless
        // (do this after layout)
        const t = setTimeout(() => {
            const maxScroll = track.scrollWidth || 0;
            if (maxScroll > 0) el.scrollLeft = maxScroll / 2;
        }, 0);

        const tick = () => {
            if (!pauseRef.current && !draggingRef.current) {
                el.scrollLeft += speedRef.current;

                const maxScroll = track.scrollWidth || 0;
                if (maxScroll > 0 && el.scrollLeft >= maxScroll / 2) {
                    el.scrollLeft -= maxScroll / 2;
                }
            }
            rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);

        return () => {
            clearTimeout(t);
            cancelAnimationFrame(rafRef.current);
        };
    }, []);

    // wrap on manual scroll so it never “ends”
    useEffect(() => {
        const el = scrollerRef.current;
        const track = trackRef.current;
        if (!el || !track) return;

        const onScroll = () => {
            const max = track.scrollWidth || 0;
            if (max <= 0) return;

            if (el.scrollLeft <= 0) el.scrollLeft += max / 2;
            if (el.scrollLeft >= max / 2) el.scrollLeft -= max / 2;
        };

        el.addEventListener("scroll", onScroll, { passive: true });
        return () => el.removeEventListener("scroll", onScroll);
    }, []);

    // drag (pointer) with vertical scroll allowed
    useEffect(() => {
        const el = scrollerRef.current;
        if (!el) return;

        let pointerId = null;

        const onPointerDown = (e) => {
            pointerId = e.pointerId;
            el.setPointerCapture?.(pointerId);

            draggingRef.current = true;
            pauseRef.current = true;

            axisLockedRef.current = null;
            startXRef.current = e.clientX;
            startYRef.current = e.clientY;
            startScrollRef.current = el.scrollLeft;
        };

        const onPointerMove = (e) => {
            if (!draggingRef.current) return;

            const dx = e.clientX - startXRef.current;
            const dy = e.clientY - startYRef.current;

            // lock axis once we have intent
            if (axisLockedRef.current == null) {
                if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
                    axisLockedRef.current = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
                }
            }

            if (axisLockedRef.current === "x") {
                e.preventDefault();
                el.scrollLeft = startScrollRef.current - dx;
            } else if (axisLockedRef.current === "y") {
                // let the page scroll
                draggingRef.current = false;
                pauseRef.current = false;
                try {
                    el.releasePointerCapture?.(pointerId);
                } catch { }
            }
        };

        const endDrag = () => {
            if (!draggingRef.current) return;
            draggingRef.current = false;
            axisLockedRef.current = null;
            pauseRef.current = false;

            if (pointerId != null) {
                try {
                    el.releasePointerCapture?.(pointerId);
                } catch { }
            }
        };

        const onEnter = () => (pauseRef.current = true);
        const onLeave = () => (pauseRef.current = false);

        el.addEventListener("pointerdown", onPointerDown);
        window.addEventListener("pointermove", onPointerMove, { passive: false });
        window.addEventListener("pointerup", endDrag);
        window.addEventListener("pointercancel", endDrag);
        window.addEventListener("blur", endDrag);
        el.addEventListener("mouseenter", onEnter);
        el.addEventListener("mouseleave", onLeave);

        return () => {
            el.removeEventListener("pointerdown", onPointerDown);
            window.removeEventListener("pointermove", onPointerMove);
            window.removeEventListener("pointerup", endDrag);
            window.removeEventListener("pointercancel", endDrag);
            window.removeEventListener("blur", endDrag);
            el.removeEventListener("mouseenter", onEnter);
            el.removeEventListener("mouseleave", onLeave);
        };
    }, []);

    return (
        <header className="kc-hero">
            <div className="kc-hero__inner">
                <div className="kc-hero__kickerWrap">
                    <span className="kc-hero__kicker pill">Built To Help Tradies Win More Work</span>
                </div>

                <h1 className="desktop-h1 kc-hero__title">
                    The Modern Business Card
                    <br />
                    Made For Tradies
                </h1>

                <p className="desktop-body-xs kc-hero__sub">
                    Show your work, prove your quality, and get hired - all
                    <br />
                    from one link.
                </p>

                <div className="kc-hero__ctaRow">
                    <Link to="/register" className="kc-hero__btn kc-hero__btnPrimary">
                        Claim Your Link
                    </Link>
                    <Link to="/example" className="kc-hero__btn kc-hero__btnGhost">
                        View Examples
                    </Link>
                </div>

                {/* (Optional) logo strip like screenshot */}
                <div className="kc-hero__logos" aria-label="Trusted by">
                    {new Array(9).fill(0).map((_, i) => (
                        <span key={i} className="kc-hero__logo">
                            LOGO
                        </span>
                    ))}
                </div>
            </div>

            {/* REAL PROFILES CAROUSEL (inside hero) */}
            <div className="kc-hero__carousel">
                <div className="kc-hero__carouselInner">
                    <div
                        ref={scrollerRef}
                        className="kc-hero__scroller"
                        style={{ touchAction: "pan-y" }}
                        aria-label="Real profiles in action"
                    >
                        <div ref={trackRef} className="kc-hero__track">
                            {groups.map((_, gi) => (
                                <React.Fragment key={gi}>
                                    {items.map((it, idx) => (
                                        <div
                                            key={`${gi}-${idx}`}
                                            className="kc-hero__phone"
                                            style={{ "--pill": it.tone }}
                                        >
                                            <div className="kc-hero__phoneViewport">
                                                <img
                                                    src={it.src}
                                                    alt={`Profile example ${idx + 1}`}
                                                    draggable={false}
                                                    loading={gi === 0 ? "eager" : "lazy"}
                                                />
                                            </div>
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
