// frontend/src/components/Footer.jsx
import React, { useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";

import { gsap } from "gsap";
import { Draggable } from "gsap/all";
gsap.registerPlugin(Draggable);

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

export default function Footer() {
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

    const loopItems = useMemo(() => [...carouselItems, ...carouselItems], [carouselItems]);

    const viewportRef = useRef(null);
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

        const onResize = () => setup();
        window.addEventListener("resize", onResize);

        return () => {
            running = false;
            window.removeEventListener("resize", onResize);
            if (draggable) draggable.kill();
            if (rafId) cancelAnimationFrame(rafId);
        };
    }, [loopItems]);

    return (
        <footer className="kc-footer">
            {/* Top navy section */}
            <section className="kc-footer__hero">
                <div className="kc-footer__heroInner">
                    <h2 className="h2 kc-footer__heroTitle">
                        Because Business Cards <br className="kc-footer__heroBreak" />
                        Should Work Harder
                    </h2>

                    <div className="kc-footer__carouselWrap">
                        <div className="kc-footer__carouselViewport" ref={viewportRef}>
                            <div className="kc-footer__track" ref={trackRef}>
                                {loopItems.map((item, i) => (
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

            {/* Main footer */}
            <section className="kc-footer__main">
                <div className="kc-footer__mainInner">
                    {/* Left */}
                    <div className="kc-footer__left">
                        <div className="kc-footer__brand">
                            <img src={LogoIcon} alt="KonarCard" className="kc-footer__brandLogo" />
                            <span className="kc-footer__brandName">KonarCard</span>
                        </div>

                        <p className="kc-footer__desc body">
                            Follow us on our socials to stay up to date with new features and updates.
                        </p>

                        <div className="kc-footer__socials">
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

                    {/* Columns */}
                    <div className="kc-footer__cols">
                        <div className="kc-footer__col">
                            <h4 className="kc-title kc-footer__colTitle">Product</h4>
                            <Link className="button-text kc-footer__link" to="/products/plastic">
                                Plastic KonarCard
                            </Link>
                            <Link className="button-text kc-footer__link" to="/products/metal">
                                Metal KonarCard
                            </Link>
                            <Link className="button-text kc-footer__link" to="/products/konartag">
                                KonarTag
                            </Link>
                            <Link className="button-text kc-footer__link" to="/pricing">
                                Pricing
                            </Link>
                            <Link className="button-text kc-footer__link" to="/examples">
                                Examples
                            </Link>
                        </div>

                        <div className="kc-footer__col">
                            <h4 className="kc-title kc-footer__colTitle">Support</h4>
                            <Link className="button-text kc-footer__link" to="/contactus">
                                Contact Us
                            </Link>
                            <Link className="button-text kc-footer__link" to="/faq">
                                FAQs
                            </Link>
                            <Link className="button-text kc-footer__link" to="/policies">
                                Shipping &amp; Returns
                            </Link>
                            <Link className="button-text kc-footer__link" to="/policies">
                                Warranty
                            </Link>
                        </div>

                        <div className="kc-footer__col">
                            <h4 className="kc-title kc-footer__colTitle">Company</h4>
                            <Link className="button-text kc-footer__link" to="/reviews">
                                Reviews
                            </Link>
                            <Link className="button-text kc-footer__link" to="/blog">
                                Blog
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Bottom */}
                <div className="kc-footer__bottomBar">
                    <div className="kc-footer__bottomInner">
                        <div className="kc-footer__copyright">
                            <img src={CopyrightIcon} alt="" aria-hidden="true" />
                            <span className="body kc-footer__copyrightText">
                                2025 KONARCARD LTD. All Rights Reserved
                            </span>
                        </div>

                        <div className="kc-footer__policies">
                            <Link className="button-text kc-footer__policyLink" to="/policies">
                                Terms Of Service
                            </Link>
                            <Link className="button-text kc-footer__policyLink" to="/policies">
                                Privacy Policy
                            </Link>
                            <Link className="button-text kc-footer__policyLink" to="/policies">
                                Cookie Policy
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </footer>
    );
}