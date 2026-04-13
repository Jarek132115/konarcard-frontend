// frontend/src/components/Footer.jsx
import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

import { gsap } from "gsap";
import { Draggable } from "gsap/all";
gsap.registerPlugin(Draggable);

import LogoIcon from "../../assets/icons/Logo-Icon.svg";
import CopyrightIcon from "../../assets/icons/Copyright-Icon.svg";

/* ===== Social icons ===== */
import FooterInstagram from "../../assets/icons/Footer_Insta.svg";
import FooterFacebook from "../../assets/icons/Footer_Facebook.svg";
import FooterLinkedIn from "../../assets/icons/Footer_LinkedIn.svg";
import FooterTiktok from "../../assets/icons/Footer_Tiktok.svg";
import FooterYoutube from "../../assets/icons/Footer_Youtube.svg";

/* ===== Carousel icons ===== */
import WorksOnEveryPhone from "../../assets/icons/Works_On_Every_Phone.svg";
import NoAppNeeded from "../../assets/icons/No_App_Needed.svg";
import OneLinkForEverything from "../../assets/icons/One_Link_For_Everything.svg";
import EasyToUpdateAnytime from "../../assets/icons/Easy_To_Update_Anytime.svg";
import ShareByTapQR from "../../assets/icons/Share_By_Tap_QR.svg";
import BuiltForRealTrades from "../../assets/icons/Built_For_Real_Trades.svg";
import LooksProfessional from "../../assets/icons/Looks_Professional.svg";
import SetUpInMinutes from "../../assets/icons/Set_Up_In_Minutes.svg";

/* ── Data ──────────────────────────────────────────────────── */
const CAROUSEL_ITEMS = [
    {
        icon: WorksOnEveryPhone,
        title: "Works on every phone",
        desc: "Compatible with iPhone and Android. No issues, no setup.",
    },
    {
        icon: NoAppNeeded,
        title: "No app needed",
        desc: "Just tap or scan. Nothing to download.",
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
];

/* Duplicate for seamless loop */
const LOOP_ITEMS = [...CAROUSEL_ITEMS, ...CAROUSEL_ITEMS];

const PRODUCT_LINKS = [
    { label: "Plastic KonarCard", to: "/products/plastic" },
    { label: "Metal KonarCard", to: "/products/metal" },
    { label: "KonarTag", to: "/products/konartag" },
    { label: "Pricing", to: "/pricing" },
    { label: "Examples", to: "/examples" },
];

const SUPPORT_LINKS = [
    { label: "Contact Us", to: "/contactus" },
    { label: "FAQs", to: "/faq" },
    { label: "Shipping & Returns", to: "/policies" },
    { label: "Warranty", to: "/policies" },
];

const COMPANY_LINKS = [
    { label: "Reviews", to: "/reviews" },
    { label: "Blog", to: "/blog" },
];

const POLICY_LINKS = [
    { label: "Terms Of Service", to: "/policies" },
    { label: "Privacy Policy", to: "/policies" },
    { label: "Cookie Policy", to: "/policies" },
];

const SOCIAL_LINKS = [
    { icon: FooterInstagram, label: "Instagram" },
    { icon: FooterFacebook, label: "Facebook" },
    { icon: FooterLinkedIn, label: "LinkedIn" },
    { icon: FooterTiktok, label: "TikTok" },
    { icon: FooterYoutube, label: "YouTube" },
];

export default function Footer() {
    const trackRef = useRef(null);

    useEffect(() => {
        const track = trackRef.current;
        if (!track) return;

        let draggable;
        let rafId;
        let running = true;

        const setup = () => {
            gsap.killTweensOf(track);
            if (draggable) draggable.kill();
            if (rafId) cancelAnimationFrame(rafId);

            gsap.set(track, { x: 0 });

            const half = track.scrollWidth / 2;
            let x = -half;
            const wrap = gsap.utils.wrap(-half, 0);
            const speed = 40;
            let last = performance.now();
            let paused = false;

            gsap.set(track, { x });

            const tick = () => {
                if (!running) return;
                const now = performance.now();
                const dt = (now - last) / 1000;
                last = now;

                if (!paused) {
                    x = wrap(x + speed * dt);
                    gsap.set(track, { x });
                }

                rafId = requestAnimationFrame(tick);
            };

            rafId = requestAnimationFrame(tick);

            draggable = Draggable.create(track, {
                type: "x",
                lockAxis: true,
                allowNativeTouchScrolling: true,
                onPress() {
                    paused = true;
                    x = wrap(gsap.getProperty(track, "x"));
                },
                onDrag() {
                    x = wrap(this.x);
                    gsap.set(track, { x });
                },
                onRelease() {
                    x = wrap(gsap.getProperty(track, "x"));
                    paused = false;
                    last = performance.now();
                },
            })[0];
        };

        setup();

        window.addEventListener("resize", setup);

        return () => {
            running = false;
            window.removeEventListener("resize", setup);
            if (draggable) draggable.kill();
            if (rafId) cancelAnimationFrame(rafId);
        };
    }, []);

    return (
        <footer className="kc-footer">

            {/* ── Top navy section ──────────────────────────── */}
            <section className="kc-footer__hero">
                <div className="kc-footer__heroInner">
                    <h2 className="h2 kc-footer__heroTitle">
                        Because Business Cards <br className="kc-footer__heroBreak" />
                        Should Work Harder
                    </h2>

                    <div className="kc-footer__carouselWrap">
                        <div className="kc-footer__carouselViewport">
                            <div className="kc-footer__track" ref={trackRef}>
                                {LOOP_ITEMS.map((item, i) => (
                                    <div className="kc-footer__item" key={`${item.title}-${i}`}>
                                        <img
                                            src={item.icon}
                                            alt=""
                                            className="kc-footer__itemIcon"
                                            aria-hidden="true"
                                        />
                                        <div className="kc-footer__itemText">
                                            <p className="kc-footer__itemTitle">{item.title}</p>
                                            <p className="kc-footer__itemDesc">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="kc-footer__fade kc-footer__fade--left" aria-hidden="true" />
                        <div className="kc-footer__fade kc-footer__fade--right" aria-hidden="true" />
                    </div>

                    <Link to="/register" className="kx-btn kx-btn--white kc-footer__heroCta">
                        Claim Your Link
                    </Link>
                </div>
            </section>

            {/* ── Main footer (white) ───────────────────────── */}
            <section className="kc-footer__main">
                <div className="kc-footer__mainInner">

                    {/* Brand + socials */}
                    <div className="kc-footer__left">
                        <div className="kc-footer__brand">
                            <img src={LogoIcon} alt="KonarCard" className="kc-footer__brandLogo" />
                            <span className="kc-footer__brandName">KonarCard</span>
                        </div>

                        <p className="kc-footer__desc body">
                            Follow us on our socials to stay up to date with new features and updates.
                        </p>

                        <div className="kc-footer__socials">
                            {SOCIAL_LINKS.map((s) => (
                                <Link key={s.label} to="/#" aria-label={s.label}>
                                    <img src={s.icon} alt="" aria-hidden="true" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Nav columns */}
                    <div className="kc-footer__cols">
                        <div className="kc-footer__col">
                            <h4 className="kc-title kc-footer__colTitle">Product</h4>
                            {PRODUCT_LINKS.map((l) => (
                                <Link key={l.label} className="button-text kc-footer__link" to={l.to}>
                                    {l.label}
                                </Link>
                            ))}
                        </div>

                        <div className="kc-footer__col">
                            <h4 className="kc-title kc-footer__colTitle">Support</h4>
                            {SUPPORT_LINKS.map((l) => (
                                <Link key={l.label} className="button-text kc-footer__link" to={l.to}>
                                    {l.label}
                                </Link>
                            ))}
                        </div>

                        <div className="kc-footer__col">
                            <h4 className="kc-title kc-footer__colTitle">Company</h4>
                            {COMPANY_LINKS.map((l) => (
                                <Link key={l.label} className="button-text kc-footer__link" to={l.to}>
                                    {l.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Bottom bar */}
                <div className="kc-footer__bottomBar">
                    <div className="kc-footer__bottomInner">
                        <div className="kc-footer__copyright">
                            <img src={CopyrightIcon} alt="" aria-hidden="true" />
                            <span className="body kc-footer__copyrightText">
                                2025 KONARCARD LTD. All Rights Reserved
                            </span>
                        </div>

                        <div className="kc-footer__policies">
                            {POLICY_LINKS.map((l) => (
                                <Link key={l.label} className="button-text kc-footer__policyLink" to={l.to}>
                                    {l.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

        </footer>
    );
}
