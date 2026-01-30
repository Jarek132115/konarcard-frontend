// Footer.jsx
import React, { useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";

import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
// If you have InertiaPlugin, you can add it too (optional).
// import { InertiaPlugin } from "gsap/InertiaPlugin";

import LogoIcon from "../assets/icons/Logo-Icon.svg";
import CopyrightIcon from "../assets/icons/Copyright-Icon.svg";

/* ===== Social icons (your exact files) ===== */
import FooterInstagram from "../assets/icons/Footer_Insta.svg";
import FooterFacebook from "../assets/icons/Footer_Facebook.svg";
import FooterLinkedIn from "../assets/icons/Footer_LinkedIn.svg";
import FooterTiktok from "../assets/icons/Footer_Tiktok.svg";
import FooterYoutube from "../assets/icons/Footer_Youtube.svg";

/* ===== Carousel icons (exact names you confirmed) ===== */
import WorksOnEveryPhone from "../assets/icons/Works_On_Every_Phone.svg";
import NoAppNeeded from "../assets/icons/No_App_Needed.svg";
import OneLinkForEverything from "../assets/icons/One_Link_For_Everything.svg";
import EasyToUpdateAnytime from "../assets/icons/Easy_To_Update_Anytime.svg";
import ShareByTapQR from "../assets/icons/Share_By_Tap_QR.svg";
import BuiltForRealTrades from "../assets/icons/Built_For_Real_Trades.svg";
import LooksProfessional from "../assets/icons/Looks_Professional.svg";
import SetUpInMinutes from "../assets/icons/Set_Up_In_Minutes.svg";

gsap.registerPlugin(Draggable);
// gsap.registerPlugin(Draggable, InertiaPlugin);

export default function Footer() {
    /* =========================
       Carousel items
       ========================= */
    const carouselItems = useMemo(
        () => [
            {
                icon: WorksOnEveryPhone,
                title: "Works on every phone",
                desc: "Compatible with iPhone and Android — no issues, no setup.",
            },
            {
                icon: NoAppNeeded,
                title: "No app needed",
                desc: "Just tap or scan — nothing to download.",
            },
            {
                icon: OneLinkForEverything,
                title: "One link for everything",
                desc: "All your details, photos, and contact options in one place.",
            },
            {
                icon: EasyToUpdateAnytime,
                title: "Easy to update anytime",
                desc: "Change your details instantly without reprinting cards.",
            },
            {
                icon: ShareByTapQR,
                title: "Share by tap or QR",
                desc: "Works in person, online, and anywhere in between.",
            },
            {
                icon: BuiltForRealTrades,
                title: "Built for real trades",
                desc: "Designed for everyday use on real jobs, not offices.",
            },
            {
                icon: LooksProfessional,
                title: "Looks professional",
                desc: "Make a strong first impression every time you share it.",
            },
            {
                icon: SetUpInMinutes,
                title: "Set up in minutes",
                desc: "Claim your link and get started straight away.",
            },
        ],
        []
    );

    // Duplicate to create a seamless loop
    const loopItems = useMemo(() => [...carouselItems, ...carouselItems], [carouselItems]);

    /* =========================
       GSAP marquee + draggable
       - Always moves left -> right (track x increases)
       - User can drag horizontally
       - If user drags vertically, page scroll still works (native scroll)
       ========================= */
    const viewportRef = useRef(null);
    const trackRef = useRef(null);

    useEffect(() => {
        const viewport = viewportRef.current;
        const track = trackRef.current;
        if (!viewport || !track) return;

        // Kill any previous instances (hot reload safety)
        let draggableInstance = null;
        let tickerFn = null;

        const setup = () => {
            gsap.set(track, { x: 0 });

            // Half-width is the width of one full set of items (because we duplicated)
            const totalWidth = track.scrollWidth;
            const half = totalWidth / 2;

            // Wrap x between [-half, 0]
            const wrapX = gsap.utils.wrap(-half, 0);

            // Start at -half so content flows in naturally
            let x = -half;
            gsap.set(track, { x });

            let paused = false;
            const speedPxPerSec = 50; // adjust as needed
            let last = performance.now();

            tickerFn = () => {
                if (paused) {
                    last = performance.now();
                    return;
                }
                const now = performance.now();
                const dt = (now - last) / 1000;
                last = now;

                x = wrapX(x + speedPxPerSec * dt); // + = move RIGHT
                gsap.set(track, { x });
            };

            gsap.ticker.add(tickerFn);

            draggableInstance = Draggable.create(track, {
                type: "x",
                // inertia: true, // enable if you add InertiaPlugin
                allowNativeTouchScrolling: true, // IMPORTANT: vertical drags scroll the page
                lockAxis: true,
                onPress() {
                    paused = true;
                },
                onDrag() {
                    x = wrapX(this.x);
                    gsap.set(track, { x });
                },
                onRelease() {
                    // Sync x to current transform and resume
                    x = wrapX(gsap.getProperty(track, "x"));
                    paused = false;
                },
                onThrowUpdate() {
                    // if inertia is enabled
                    x = wrapX(this.x);
                    gsap.set(track, { x });
                },
            })?.[0];
        };

        // Setup now, and re-setup on resize (width changes)
        setup();

        const onResize = () => {
            // teardown & rebuild to recalc widths
            if (draggableInstance) draggableInstance.kill();
            if (tickerFn) gsap.ticker.remove(tickerFn);
            setup();
        };

        window.addEventListener("resize", onResize);

        return () => {
            window.removeEventListener("resize", onResize);
            if (draggableInstance) draggableInstance.kill();
            if (tickerFn) gsap.ticker.remove(tickerFn);
        };
    }, [loopItems]);

    return (
        <footer className="kc-footer">
            {/* =========================
          Top navy section
         ========================= */}
            <section className="kc-footer__hero">
                <div className="kc-footer__heroInner">
                    <h2 className="kc-footer__heroTitle">
                        Because Business Cards<br />Should Work Harder
                    </h2>

                    <div className="kc-footer__carouselWrap">
                        <div className="kc-footer__carouselViewport" ref={viewportRef} aria-label="Benefits carousel">
                            <div className="kc-footer__track" ref={trackRef}>
                                {loopItems.map((item, i) => (
                                    <div className="kc-footer__item" key={`${item.title}-${i}`}>
                                        <img src={item.icon} alt="" className="kc-footer__itemIcon" aria-hidden="true" />
                                        <div className="kc-footer__itemText">
                                            <p className="kc-footer__itemTitle">{item.title}</p>
                                            <p className="kc-footer__itemDesc">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* edge fades like your design */}
                        <div className="kc-footer__fade kc-footer__fade--left" aria-hidden="true" />
                        <div className="kc-footer__fade kc-footer__fade--right" aria-hidden="true" />
                    </div>

                    <Link to="/register" className="kc-footer__heroCta">
                        Claim Your Link
                    </Link>
                </div>
            </section>

            {/* =========================
          Main footer (white)
         ========================= */}
            <section className="kc-footer__main">
                <div className="kc-footer__mainInner">
                    {/* Left brand block */}
                    <div className="kc-footer__left">
                        <div className="kc-footer__brand">
                            <img src={LogoIcon} alt="KonarCard" className="kc-footer__brandLogo" />
                            <span className="kc-footer__brandName">KonarCard</span>
                        </div>

                        <p className="kc-footer__desc">
                            Join our newsletter to stay up to date on features and updates.
                        </p>

                        <div className="kc-footer__socials" aria-label="Social links">
                            {/* Keep same links as before (you currently use /# placeholders) */}
                            <Link to="/#" aria-label="Instagram">
                                <img src={FooterInstagram} alt="" aria-hidden="true" />
                            </Link>
                            <Link to="/#" aria-label="Facebook">
                                <img src={FooterFacebook} alt="" aria-hidden="true" />
                            </Link>
                            <Link to="/#" aria-label="LinkedIn">
                                <img src={FooterLinkedIn} alt="" aria-hidden="true" />
                            </Link>
                            <Link to="/#" aria-label="TikTok">
                                <img src={FooterTiktok} alt="" aria-hidden="true" />
                            </Link>
                            <Link to="/#" aria-label="YouTube">
                                <img src={FooterYoutube} alt="" aria-hidden="true" />
                            </Link>
                        </div>
                    </div>

                    {/* Right columns */}
                    <div className="kc-footer__cols">
                        <div className="kc-footer__col">
                            <h4>Product</h4>
                            <Link to="/productandplan">How KonarCard Works</Link>
                            <Link to="/productandplan">Digital Business Cards</Link>
                            <Link to="/productandplan/konarcard">NFC Cards</Link>
                            <Link to="/pricing">Pricing</Link>
                            <Link to="/examples">Examples</Link>
                        </div>

                        <div className="kc-footer__col">
                            <h4>Support</h4>
                            <Link to="/contactus">Contact Us</Link>
                            <Link to="/faq">FAQs</Link>
                            <Link to="/policies">Shipping &amp; Returns</Link>
                            <Link to="/policies">Warranty</Link>
                        </div>

                        <div className="kc-footer__col">
                            <h4>Company</h4>
                            <Link to="/about">About KonarCard</Link>
                            <Link to="/reviews">Reviews</Link>
                            <Link to="/blog">Blog</Link>
                        </div>
                    </div>
                </div>

                {/* Styled bottom row (matches your 2nd image) */}
                <div className="kc-footer__bottomBar">
                    <div className="kc-footer__bottomInner">
                        <div className="kc-footer__copyright">
                            <img src={CopyrightIcon} alt="" aria-hidden="true" />
                            <span>2025 KONARCARD LTD. All Rights Reserved</span>
                        </div>

                        <div className="kc-footer__policies">
                            <Link to="/policies">Terms Of Service</Link>
                            <Link to="/policies">Privacy Policy</Link>
                            <Link to="/policies">Cookie Policy</Link>
                        </div>
                    </div>
                </div>
            </section>
        </footer>
    );
}
