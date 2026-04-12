import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { toast } from "react-hot-toast";
import QRCode from "qrcode";

import "../styling/dashboard/shareprofile.css";

import CopyLinkIcon     from "../assets/icons/CopyLink-Icon.svg";
import VisitProfileIcon from "../assets/icons/VisitProfile-Icon.svg";
import DownloadQRIcon   from "../assets/icons/DownloadQR-Icon.svg";

import ShareOnFacebookIcon    from "../assets/icons/ShareOnFacebook.svg";
import ShareOnInstagramIcon   from "../assets/icons/ShareOnInstagram.svg";
import ShareOnMessengerIcon   from "../assets/icons/ShareOnMessenger.svg";
import ShareOnWhatsappIcon    from "../assets/icons/ShareOnWhatsapp.svg";
import ShareOnTextIcon        from "../assets/icons/ShareOnText.svg";
import ShareOnCopyIcon        from "../assets/icons/ShareOnCopy.svg";
import ShareOnAppleWalletIcon from "../assets/icons/ShareOnAppleWallet.svg";
import ShareOnGoogleWalletIcon from "../assets/icons/ShareOnGoogleWallet.svg";

function openInNewTab(url) {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
}

export default function ShareProfile({
    isOpen,
    onClose,
    profiles = [],
    selectedSlug,
    onSelectSlug,
    profileUrl,
    username,
    onFacebook,
    onInstagram,
    onMessenger,
    onWhatsApp,
    onText,
    onAppleWallet,
    onGoogleWallet,
}) {
    const [qrCodeImage, setQrCodeImage] = useState("");

    const selectedProfile = useMemo(() => {
        if (profiles?.length) {
            return profiles.find((p) => p.slug === selectedSlug) || profiles[0];
        }
        return null;
    }, [profiles, selectedSlug]);

    const effectiveUrl = selectedProfile?.url || profileUrl || "";

    const displayUrl = useMemo(() => {
        if (!effectiveUrl) return "";
        try {
            const u = new URL(effectiveUrl);
            return `${u.host.replace(/^www\./i, "")}${u.pathname}`;
        } catch {
            return effectiveUrl.replace(/^https?:\/\//i, "");
        }
    }, [effectiveUrl]);

    /* ── effects ── */
    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e) => { if (e.key === "Escape") onClose(); };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (!isOpen) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = prev || ""; };
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen || !effectiveUrl) { setQrCodeImage(""); return; }
        QRCode.toDataURL(effectiveUrl, { errorCorrectionLevel: "H", width: 300, margin: 0 })
            .then(setQrCodeImage)
            .catch(() => toast.error("Failed to generate QR code."));
    }, [isOpen, effectiveUrl]);

    /* ── helpers ── */
    const copy = async (text, msg = "Copied!") => {
        if (!text) return;
        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(text);
            } else {
                const el = document.createElement("textarea");
                el.value = text;
                document.body.appendChild(el);
                el.select();
                document.execCommand("copy");
                document.body.removeChild(el);
            }
            toast.success(msg);
        } catch {
            toast.error("Failed to copy.");
        }
    };

    const handleFacebook  = () => onFacebook  ? onFacebook()  : openInNewTab(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(effectiveUrl)}`);
    const handleInstagram = async () => {
        if (onInstagram) { onInstagram(); return; }
        await copy(effectiveUrl, "Link copied — paste it into Instagram.");
        openInNewTab("https://www.instagram.com/");
    };
    const handleMessenger = async () => {
        if (onMessenger) { onMessenger(); return; }
        const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || "");
        if (isMobile) { await copy(effectiveUrl, "Link copied — paste into Messenger."); return; }
        openInNewTab(`https://www.facebook.com/dialog/send?link=${encodeURIComponent(effectiveUrl)}&app_id=1217981644879628&redirect_uri=${encodeURIComponent(effectiveUrl)}`);
    };
    const handleWhatsApp = () => onWhatsApp ? onWhatsApp() : openInNewTab(`https://wa.me/?text=${encodeURIComponent(effectiveUrl)}`);
    const handleText     = () => onText     ? onText()     : (window.location.href = `sms:?&body=${encodeURIComponent(effectiveUrl)}`);
    const handleApple    = () => onAppleWallet  ? onAppleWallet()  : toast.info("Apple Wallet is coming soon.");
    const handleGoogle   = () => onGoogleWallet ? onGoogleWallet() : toast.info("Google Wallet is coming soon.");

    if (!isOpen) return null;

    const hasManyProfiles = (profiles?.length || 0) > 1;

    return (
        <div className="sp-overlay" onClick={onClose} role="presentation">
            <div
                className="sp-modal"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label="Share your profile"
            >
                {/* ── Header ── */}
                <div className="sp-header">
                    <div>
                        <h2 className="sp-title">Share your profile</h2>
                        {displayUrl && (
                            <p className="sp-url">{displayUrl}</p>
                        )}
                    </div>
                    <button className="sp-close" onClick={onClose} aria-label="Close" type="button">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M1.5 1.5L12.5 12.5M12.5 1.5L1.5 12.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                        </svg>
                    </button>
                </div>

                <div className="sp-body">
                    {/* ── Left column ── */}
                    <div className="sp-left">

                        {/* Profile picker */}
                        {hasManyProfiles && (
                            <div className="sp-section">
                                <label className="sp-label" htmlFor="sp-profile-select">Profile</label>
                                <select
                                    id="sp-profile-select"
                                    className="sp-select"
                                    value={selectedProfile?.slug || ""}
                                    onChange={(e) => onSelectSlug?.(e.target.value)}
                                >
                                    {profiles.map((p) => (
                                        <option key={p.slug} value={p.slug}>
                                            {p.name} — {p.slug}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Copy + Visit */}
                        <div className="sp-section">
                            <div className="sp-ctaRow">
                                <button
                                    type="button"
                                    className="sp-btn sp-btn--dark"
                                    onClick={() => copy(effectiveUrl, "Profile link copied!")}
                                    disabled={!effectiveUrl}
                                >
                                    <img src={CopyLinkIcon} alt="" className="sp-btnIcon sp-btnIcon--invert" />
                                    Copy link
                                </button>
                                <a
                                    href={effectiveUrl || "#"}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="sp-btn sp-btn--orange"
                                    onClick={(e) => { if (!effectiveUrl) e.preventDefault(); }}
                                >
                                    <img src={VisitProfileIcon} alt="" className="sp-btnIcon sp-btnIcon--invert" />
                                    Visit profile
                                </a>
                            </div>
                        </div>

                        {/* Share */}
                        <div className="sp-section">
                            <span className="sp-label">Share via</span>
                            <div className="sp-grid">
                                {[
                                    { icon: ShareOnFacebookIcon,  label: "Facebook",  fn: handleFacebook  },
                                    { icon: ShareOnInstagramIcon, label: "Instagram", fn: handleInstagram },
                                    { icon: ShareOnMessengerIcon, label: "Messenger", fn: handleMessenger },
                                    { icon: ShareOnWhatsappIcon,  label: "WhatsApp",  fn: handleWhatsApp  },
                                    { icon: ShareOnTextIcon,      label: "Text",      fn: handleText      },
                                    { icon: ShareOnCopyIcon,      label: "Copy",      fn: () => copy(effectiveUrl, "Copied!") },
                                ].map(({ icon, label, fn }) => (
                                    <button
                                        key={label}
                                        type="button"
                                        className="sp-shareBtn"
                                        onClick={fn}
                                        disabled={!effectiveUrl}
                                    >
                                        <img src={icon} alt={label} className="sp-shareIcon" />
                                        <span>{label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Wallet */}
                        <div className="sp-section sp-section--last">
                            <span className="sp-label">Add to wallet</span>
                            <div className="sp-grid sp-grid--two">
                                <button type="button" className="sp-shareBtn" onClick={handleApple}>
                                    <img src={ShareOnAppleWalletIcon} alt="Apple Wallet" className="sp-shareIcon" />
                                    <span>Apple Wallet</span>
                                </button>
                                <button type="button" className="sp-shareBtn" onClick={handleGoogle}>
                                    <img src={ShareOnGoogleWalletIcon} alt="Google Wallet" className="sp-shareIcon" />
                                    <span>Google Wallet</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ── QR column ── */}
                    <div className="sp-right">
                        <span className="sp-label">QR code</span>
                        {qrCodeImage ? (
                            <>
                                <div className="sp-qrBox">
                                    <img src={qrCodeImage} alt="QR code" className="sp-qrImg" />
                                </div>
                                <a
                                    href={qrCodeImage}
                                    download={`${(username || "konarcard").replace(/\s+/g, "-")}-qrcode.png`}
                                    className="sp-btn sp-btn--ghost sp-downloadBtn"
                                >
                                    <img src={DownloadQRIcon} alt="" className="sp-btnIcon" />
                                    Download QR
                                </a>
                            </>
                        ) : (
                            <div className="sp-qrEmpty">
                                QR code appears once a profile is selected.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

ShareProfile.propTypes = {
    isOpen:         PropTypes.bool.isRequired,
    onClose:        PropTypes.func.isRequired,
    profiles:       PropTypes.arrayOf(PropTypes.shape({
        slug: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        url:  PropTypes.string.isRequired,
    })),
    selectedSlug:   PropTypes.string,
    onSelectSlug:   PropTypes.func,
    profileUrl:     PropTypes.string,
    username:       PropTypes.string,
    onFacebook:     PropTypes.func,
    onInstagram:    PropTypes.func,
    onMessenger:    PropTypes.func,
    onWhatsApp:     PropTypes.func,
    onText:         PropTypes.func,
    onAppleWallet:  PropTypes.func,
    onGoogleWallet: PropTypes.func,
};
