import React, { useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";

/* Background */
import BackgroundHeroNew from "../../assets/images/Background-Hero-New.jpg";

/* Profiles */
import UP1 from "../../assets/images/UP1.jpg";
import UP2 from "../../assets/images/UP2.jpg";
import UP3 from "../../assets/images/UP3.jpg";
import UP4 from "../../assets/images/UP4.jpg";
import UP5 from "../../assets/images/UP5.jpg";
import UP6 from "../../assets/images/UP6.jpg";
import UP7 from "../../assets/images/UP7.jpg";
import UP8 from "../../assets/images/UP8.jpg";

/* CSS */
import "../../styling/home-hero.css";

export default function Hero() {
    /* =========================================================
       PROFILES MARQUEE (auto + drag) — LEFT ➜ RIGHT
       ========================================================= */
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

    const speedRef = useRef(0.55); // px per frame (feel free to tweak)
    const renderGroups = 4;
    const groups = useMemo(() => new Array(renderGroups).fill(0), []);

    // ensure 10px gap
    useEffect(() => {
        const el = scrollerRef.current;
        if (el) el.style.setProperty("--gap", "10px");
    }, []);

    // set a safe starting scroll so looping works immediately
    useEffect(() => {
        const el = scrollerRef.current;
        const track = trackRef.current;
        if (!el || !track) return;

        // start around the middle so we can loop both ways
        const max = track.scrollWidth;
        if (max > 0) el.scrollLeft = max / 2;
    }, []);

    // autoplay LEFT ➜ RIGHT (scrollLeft goes DOWN)
    useEffect(() => {
        const el = scrollerRef.current;
        if (!el) return;

        const tick = () => {
            if (!pauseRef.current && !draggingRef.current) {
                el.scrollLeft -= speedRef.current; // ✅ LEFT ➜ RIGHT visual motion
                const maxScroll = trackRef.current?.scrollWidth || 0;

                // loop seamlessly (we render repeated content)
                if (maxScroll > 0) {
                    const half = maxScroll / 2;

                    // if we go too far left, jump forward by half
                    if (el.scrollLeft <= 0) el.scrollLeft += half;

                    // if we go too far right (rare here), jump back
                    if (el.scrollLeft >= half) el.scrollLeft -= half;
                }
            }
            rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafRef.current);
    }, []);

    // dragging (allow vertical page scroll)
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

            // lock axis when movement becomes clear
            if (axisLockedRef.current == null) {
                if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
                    axisLockedRef.current = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
                }
            }

            if (axisLockedRef.current === "x") {
                e.preventDefault();
                el.scrollLeft = startScrollRef.current - dx;
            } else if (axisLockedRef.current === "y") {
                // user intends to scroll the page
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

        el.addEventListener("pointerdown", onPointerDown);
        window.addEventListener("pointermove", onPointerMove, { passive: false });
        window.addEventListener("pointerup", endDrag);
        window.addEventListener("pointercancel", endDrag);
        window.addEventListener("blur", endDrag);

        const onEnter = () => (pauseRef.current = true);
        const onLeave = () => (pauseRef.current = false);
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
        <header
            className="kc-homeHero"
            style={{ backgroundImage: `url(${BackgroundHeroNew})` }}
        >
            <div className="kc-homeHero__inner">
                <div className="kc-homeHero__badge">Built To Help Tradies Win More Work</div>

                <h1 className="kc-homeHero__title">
                    The Modern Business Card
                    <br />
                    Made For Tradies
                </h1>

                <p className="kc-homeHero__sub">
                    Show your work, prove your quality, and get hired — all
                    <br />
                    from one link.
                </p>

                <div className="kc-homeHero__ctaRow">
                    <Link to="/register" className="kc-homeHero__btn kc-homeHero__btn--primary">
                        Claim Your Link
                    </Link>

                    <Link to="/examples" className="kc-homeHero__btn kc-homeHero__btn--ghost">
                        View Examples
                    </Link>
                </div>

                {/* Carousel inside hero */}
                <div className="kc-homeHero__carousel">
                    <div className="kc-homeHero__logos" aria-hidden="true">
                        <span>LOGO</span><span>LOGO</span><span>LOGO</span><span>LOGO</span>
                        <span>LOGO</span><span>LOGO</span><span>LOGO</span><span>LOGO</span>
                    </div>

                    <div className="kc-homeHero__scrollerOuter">
                        <div
                            ref={scrollerRef}
                            className="kc-homeHero__scroller"
                            style={{ touchAction: "pan-y" }}
                            aria-label="Real profiles in action"
                        >
                            <div ref={trackRef} className="kc-homeHero__track">
                                {groups.map((_, gi) => (
                                    <React.Fragment key={gi}>
                                        {items.map((it, i) => (
                                            <div
                                                key={`${gi}-${i}`}
                                                className="kc-homeHero__phone"
                                                style={{ "--pill": it.tone }}
                                            >
                                                <div className="kc-homeHero__viewport">
                                                    <img
                                                        src={it.src}
                                                        alt={`Example profile ${i + 1}`}
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

            </div>
        </header>
    );
}
