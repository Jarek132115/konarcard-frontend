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

/* CSS */
import "../../styling/home/hero.css";

export default function Hero() {
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

    const logos = useMemo(
        () => [
            { label: "Oakridge\nPlumbing", variant: "serif" },
            { label: "BRIGHTSPARK\nELECTRICAL", variant: "caps" },
            { label: "Northline\nRoofing Co.", variant: "mono" },
            { label: "Stone & Steel\nRenovations", variant: "wide" },
            { label: "Greenway\nLandscapes", variant: "script" },
            { label: "Harbourview\nKitchens", variant: "clean" },
            { label: "ProFix\nProperty Care", variant: "bold" },
            { label: "BluePeak\nBuilders", variant: "slab" },
        ],
        []
    );

    const scrollerRef = useRef(null);
    const trackRef = useRef(null);

    const rafRef = useRef(0);
    const draggingRef = useRef(false);

    const startXRef = useRef(0);
    const startYRef = useRef(0);
    const startScrollRef = useRef(0);
    const axisLockedRef = useRef(null); // 'x' | 'y' | null

    const speedRef = useRef(0.55); // px per frame

    // ✅ 3 groups = true "infinite" feel during drag (always keep user in the middle copy)
    const renderGroups = 3;
    const groups = useMemo(() => new Array(renderGroups).fill(0), []);

    // keep a stable idea of one "group width"
    const groupWidthRef = useRef(0);

    useEffect(() => {
        const el = scrollerRef.current;
        if (el) el.style.setProperty("--gap", "10px");
    }, []);

    const computeGroupWidth = () => {
        const track = trackRef.current;
        if (!track) return 0;
        // total scrollWidth = 3x groupWidth
        const gw = track.scrollWidth / renderGroups;
        if (Number.isFinite(gw) && gw > 0) groupWidthRef.current = gw;
        return groupWidthRef.current;
    };

    // ✅ keep scrollLeft inside the middle group
    const normalizeLoop = (alsoAdjustDragBase = false) => {
        const el = scrollerRef.current;
        if (!el) return;

        const gw = groupWidthRef.current || computeGroupWidth();
        if (!gw) return;

        // middle band is [gw, 2gw)
        // give a little buffer so we wrap BEFORE hitting real edges
        const leftGuard = gw * 0.8;
        const rightGuard = gw * 2.2;

        if (el.scrollLeft < leftGuard) {
            el.scrollLeft += gw;
            if (alsoAdjustDragBase) startScrollRef.current += gw; // ✅ prevents “jump” while dragging
        } else if (el.scrollLeft > rightGuard) {
            el.scrollLeft -= gw;
            if (alsoAdjustDragBase) startScrollRef.current -= gw; // ✅ prevents “jump” while dragging
        }
    };

    // set initial scroll into the middle group
    useEffect(() => {
        const el = scrollerRef.current;
        const track = trackRef.current;
        if (!el || !track) return;

        const setInitial = () => {
            const gw = computeGroupWidth();
            if (gw > 0) el.scrollLeft = gw; // start at beginning of middle copy
            normalizeLoop(false);
        };

        setInitial();
        const t1 = setTimeout(setInitial, 120);
        const t2 = setTimeout(setInitial, 520);

        const onResize = () => {
            // recompute and re-center to middle on resize/layout shift
            const gw = computeGroupWidth();
            if (gw > 0) el.scrollLeft = gw;
            normalizeLoop(false);
        };

        window.addEventListener("resize", onResize);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            window.removeEventListener("resize", onResize);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // autoplay (no hover pause)
    useEffect(() => {
        const el = scrollerRef.current;
        if (!el) return;

        const tick = () => {
            if (!draggingRef.current) {
                el.scrollLeft -= speedRef.current; // LEFT ➜ RIGHT visual motion
                normalizeLoop(false);
            }
            rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // also normalize if the user wheels/trackpads (not just pointer drag)
    useEffect(() => {
        const el = scrollerRef.current;
        if (!el) return;

        const onScroll = () => {
            if (!draggingRef.current) normalizeLoop(false);
        };

        el.addEventListener("scroll", onScroll, { passive: true });
        return () => el.removeEventListener("scroll", onScroll);
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
            axisLockedRef.current = null;

            startXRef.current = e.clientX;
            startYRef.current = e.clientY;
            startScrollRef.current = el.scrollLeft;

            // ensure groupWidth is known for drag wrapping
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

                // normal drag scroll
                el.scrollLeft = startScrollRef.current - dx;

                // ✅ wrap DURING drag so you never hit the true edges
                normalizeLoop(true);
            } else if (axisLockedRef.current === "y") {
                draggingRef.current = false;
                axisLockedRef.current = null;
                try {
                    el.releasePointerCapture?.(pointerId);
                } catch { }
            }
        };

        const endDrag = () => {
            if (!draggingRef.current) return;
            draggingRef.current = false;
            axisLockedRef.current = null;

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <header className="kc-homeHero">
            <div className="kc-homeHero__inner">
                <div className="kc-homeHero__copyGrid">
                    <div className="kc-homeHero__badge">
                        Built for UK businesses — tap, share, update anytime
                    </div>

                    <h1 className="kc-homeHero__title">
                        Digital Business Cards
                        <br />
                        That Work Instantly
                    </h1>

                    <p className="kc-homeHero__sub">
                        Share your details with a tap or QR scan. No app needed.
                        <br />
                        Update your profile anytime — in seconds.
                    </p>

                    <div className="kc-homeHero__ctaRow">
                        <Link to="/products" className="kc-homeHero__btn kc-homeHero__btn--primary">
                            Shop NFC Cards
                        </Link>

                        <Link to="/register" className="kc-homeHero__btn kc-homeHero__btn--ghost">
                            Claim Your Link
                        </Link>
                    </div>
                </div>

                <div className="kc-homeHero__carousel">
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
                                                        loading={gi === 1 ? "eager" : "lazy"} // middle group eager
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="kc-homeHero__logoGrid" aria-label="Trusted by trades">
                        {logos.map((l, idx) => (
                            <div key={idx} className={`kc-homeHero__logo kc-homeHero__logo--${l.variant}`}>
                                {l.label.split("\n").map((line, li) => (
                                    <div key={li}>{line}</div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </header>
    );
}
