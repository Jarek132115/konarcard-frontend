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

/* ✅ New logo images (LogoHero1 - 9) */
import LogoHero1 from "../../assets/images/LogoHero1.jpg";
import LogoHero2 from "../../assets/images/LogoHero2.jpg";
import LogoHero3 from "../../assets/images/LogoHero3.jpg";
import LogoHero4 from "../../assets/images/LogoHero4.jpg";
import LogoHero5 from "../../assets/images/LogoHero5.jpg";
import LogoHero6 from "../../assets/images/LogoHero6.jpg";
import LogoHero7 from "../../assets/images/LogoHero7.jpg";
import LogoHero8 from "../../assets/images/LogoHero8.jpg";
import LogoHero9 from "../../assets/images/LogoHero9.jpg";

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

    const logosTop = useMemo(
        () => [
            { src: LogoHero1, alt: "Customer logo 1" },
            { src: LogoHero2, alt: "Customer logo 2" },
            { src: LogoHero3, alt: "Customer logo 3" },
            { src: LogoHero4, alt: "Customer logo 4" },
            { src: LogoHero5, alt: "Customer logo 5" },
        ],
        []
    );

    const logosBottom = useMemo(
        () => [
            { src: LogoHero6, alt: "Customer logo 6" },
            { src: LogoHero7, alt: "Customer logo 7" },
            { src: LogoHero8, alt: "Customer logo 8" },
            { src: LogoHero9, alt: "Customer logo 9" },
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

    const renderGroups = 3;
    const groups = useMemo(() => new Array(renderGroups).fill(0), []);
    const groupWidthRef = useRef(0);

    useEffect(() => {
        const el = scrollerRef.current;
        if (el) el.style.setProperty("--gap", "10px");
    }, []);

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
            if (gw > 0) el.scrollLeft = gw;
            normalizeLoop(false);
        };

        setInitial();
        const t1 = setTimeout(setInitial, 120);
        const t2 = setTimeout(setInitial, 520);

        const onResize = () => {
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

    useEffect(() => {
        const el = scrollerRef.current;
        if (!el) return;

        const tick = () => {
            if (!draggingRef.current) {
                el.scrollLeft -= speedRef.current;
                normalizeLoop(false);
            }
            rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
                el.scrollLeft = startScrollRef.current - dx;
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
                    <div className="kc-pill kc-homeHero__pill">
                        NFC + QR Digital Business Card for Trades
                    </div>

                    <h1 className="kc-homeHero__title">
                        The Digital <span className="kc-homeHero__accent">Business Card</span>
                        <br />
                        Built For Trades
                    </h1>

                    <p className="kc-homeHero__sub">
                        Share your contact details with a tap, QR, or link - and update
                        <br />
                        them anytime.
                    </p>

                    <div className="kc-homeHero__ctaRow">
                        <Link to="/register" className="kx-btn kx-btn--orange kc-homeHero__ctaBtn">
                            Claim Your Link
                        </Link>

                        <Link to="/how-it-works" className="kx-btn kx-btn--white kc-homeHero__ctaBtn">
                            Watch How It Works
                        </Link>
                    </div>
                </div>

                {/* ✅ Logos: ALWAYS 5 top + 4 bottom. Same size. Tight gaps. */}
                <div className="kc-homeHero__logos" aria-label="Trusted by UK businesses">
                    <div className="kc-homeHero__logoRow kc-homeHero__logoRow--top">
                        {logosTop.map((l, idx) => (
                            <div key={`top-${idx}`} className="kc-homeHero__logoItem">
                                <img
                                    src={l.src}
                                    alt={l.alt}
                                    className="kc-homeHero__logoImg"
                                    loading="lazy"
                                    decoding="async"
                                />
                            </div>
                        ))}
                    </div>

                    <div className="kc-homeHero__logoRow kc-homeHero__logoRow--bottom">
                        {logosBottom.map((l, idx) => (
                            <div key={`bottom-${idx}`} className="kc-homeHero__logoItem">
                                <img
                                    src={l.src}
                                    alt={l.alt}
                                    className="kc-homeHero__logoImg"
                                    loading="lazy"
                                    decoding="async"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="kc-homeHero__carousel" aria-label="Example digital business cards">
                    <div className="kc-homeHero__scrollerOuter">
                        <div
                            ref={scrollerRef}
                            className="kc-homeHero__scroller"
                            style={{ touchAction: "pan-y" }}
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
                                                        alt={`Example digital business card profile ${i + 1}`}
                                                        draggable={false}
                                                        loading={gi === 1 ? "eager" : "lazy"}
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