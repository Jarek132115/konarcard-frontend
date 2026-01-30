import React, { useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";

import LogoIcon from "../assets/icons/Logo-Icon.svg";
import CopyrightIcon from "../assets/icons/Copyright-Icon.svg";

/* ===== Social icons (your exact files) ===== */
import FooterInstagram from "../assets/icons/Footer_Insta.svg";
import FooterFacebook from "../assets/icons/Footer_Facebook.svg";
import FooterLinkedIn from "../assets/icons/Footer_Linkedin.svg";
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

    /* =========================
       Carousel behavior
       ========================= */
    const trackRef = useRef(null);
    const draggingRef = useRef(false);
    const startXRef = useRef(0);
    const startScrollLeftRef = useRef(0);
    const rafRef = useRef(null);

    // Auto-scroll left → right
    useEffect(() => {
        const el = trackRef.current;
        if (!el) return;

        let last = performance.now();
        const speed = 28; // px/sec

        const tick = (now) => {
            const dt = now - last;
            last = now;

            if (!draggingRef.current) {
                el.scrollLeft += (speed * dt) / 1000;
                if (el.scrollLeft >= el.scrollWidth / 2) {
                    el.scrollLeft = 0;
                }
            }

            rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafRef.current);
    }, []);

    // Drag logic (horizontal only)
    useEffect(() => {
        const el = trackRef.current;
        if (!el) return;

        const onPointerDown = (e) => {
            draggingRef.current = true;
            startXRef.current = e.clientX;
            startScrollLeftRef.current = el.scrollLeft;
            el.setPointerCapture(e.pointerId);
        };

        const onPointerMove = (e) => {
            if (!draggingRef.current) return;
            const dx = e.clientX - startXRef.current;
            el.scrollLeft = startScrollLeftRef.current - dx;
        };

        const endDrag = () => {
            draggingRef.current = false;
        };

        el.addEventListener("pointerdown", onPointerDown);
        window.addEventListener("pointermove", onPointerMove);
        window.addEventListener("pointerup", endDrag);

        return () => {
            el.removeEventListener("pointerdown", onPointerDown);
            window.removeEventListener("pointermove", onPointerMove);
            window.removeEventListener("pointerup", endDrag);
        };
    }, []);

    return (
        <footer className="kc-footer">
            {/* =========================
         Top navy section
         ========================= */}
            <section className="kc-footer__hero">
                <h2 className="kc-footer__heroTitle">
                    Because Business Cards<br />Should Work Harder
                </h2>

                <div className="kc-footer__carousel">
                    <div className="kc-footer__track" ref={trackRef}>
                        {[...carouselItems, ...carouselItems].map((item, i) => (
                            <div className="kc-footer__item" key={`${item.title}-${i}`}>
                                <img src={item.icon} alt="" className="kc-footer__itemIcon" />
                                <div>
                                    <p className="kc-footer__itemTitle">{item.title}</p>
                                    <p className="kc-footer__itemDesc">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <Link to="/register" className="kc-footer__heroCta">
                    Claim Your Link
                </Link>
            </section>

            {/* =========================
         Main footer
         ========================= */}
            <section className="kc-footer__main">
                <div className="kc-footer__mainInner">
                    {/* Brand */}
                    <div>
                        <div className="kc-footer__brand">
                            <img src={LogoIcon} alt="KonarCard" />
                            <span>KonarCard</span>
                        </div>

                        <p className="kc-footer__desc">
                            Join our newsletter to stay up to date on features and updates.
                        </p>

                        <div className="kc-footer__socials">
                            <img src={FooterInstagram} alt="Instagram" />
                            <img src={FooterFacebook} alt="Facebook" />
                            <img src={FooterLinkedIn} alt="LinkedIn" />
                            <img src={FooterTiktok} alt="TikTok" />
                            <img src={FooterYoutube} alt="YouTube" />
                        </div>
                    </div>

                    {/* Columns */}
                    <div className="kc-footer__cols">
                        <div>
                            <h4>Product</h4>
                            <Link to="/productandplan">How KonarCard Works</Link>
                            <Link to="/productandplan">Digital Business Cards</Link>
                            <Link to="/productandplan/konarcard">NFC Cards</Link>
                            <Link to="/pricing">Pricing</Link>
                            <Link to="/examples">Examples</Link>
                        </div>

                        <div>
                            <h4>Support</h4>
                            <Link to="/contactus">Contact Us</Link>
                            <Link to="/faq">FAQs</Link>
                            <Link to="/policies">Shipping & Returns</Link>
                            <Link to="/policies">Warranty</Link>
                        </div>

                        <div>
                            <h4>Company</h4>
                            <Link to="/about">About KonarCard</Link>
                            <Link to="/reviews">Reviews</Link>
                            <Link to="/blog">Blog</Link>
                        </div>
                    </div>
                </div>

                <div className="kc-footer__bottom">
                    <div className="kc-footer__copyright">
                        <img src={CopyrightIcon} alt="" />
                        <span>2025 KONARCARD LTD. All Rights Reserved</span>
                    </div>

                    <div className="kc-footer__policies">
                        <Link to="/policies">Terms Of Service</Link>
                        <Link to="/policies">Privacy Policy</Link>
                        <Link to="/policies">Cookie Policy</Link>
                    </div>
                </div>
            </section>
        </footer>
    );
}
