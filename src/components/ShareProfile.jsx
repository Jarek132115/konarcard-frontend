import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { toast } from "react-hot-toast";
import QRCode from "qrcode";

import "../styling/dashboard/shareprofile.css";

import CopyLinkIcon from "../assets/icons/CopyLink-Icon.svg";
import VisitProfileIcon from "../assets/icons/VisitProfile-Icon.svg";
import DownloadQRIcon from "../assets/icons/DownloadQR-Icon.svg";

import ShareOnFacebookIcon from "../assets/icons/ShareOnFacebook.svg";
import ShareOnInstagramIcon from "../assets/icons/ShareOnInstagram.svg";
import ShareOnMessengerIcon from "../assets/icons/ShareOnMessenger.svg";
import ShareOnWhatsappIcon from "../assets/icons/ShareOnWhatsapp.svg";
import ShareOnTextIcon from "../assets/icons/ShareOnText.svg";
import ShareOnCopyIcon from "../assets/icons/ShareOnCopy.svg";
import ShareOnAppleWalletIcon from "../assets/icons/ShareOnAppleWallet.svg";
import ShareOnGoogleWalletIcon from "../assets/icons/ShareOnGoogleWallet.svg";

function openInNewTab(url) {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
}

function buildFacebookShareUrl(url) {
    return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
}

function buildMessengerShareUrl(url) {
    return `https://www.facebook.com/dialog/send?link=${encodeURIComponent(url)}&app_id=1217981644879628&redirect_uri=${encodeURIComponent(url)}`;
}

function buildWhatsAppShareUrl(url) {
    return `https://wa.me/?text=${encodeURIComponent(url)}`;
}

function buildSmsShareUrl(url) {
    return `sms:?&body=${encodeURIComponent(url)}`;
}

function ActionIcon({ src, alt = "" }) {
    return (
        <span className="sp-actionBtnIcon" aria-hidden="true">
            <img src={src} alt={alt} className="sp-actionBtnIconImg" />
        </span>
    );
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

    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === "Escape") onClose();
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen, onClose]);

    useEffect(() => {
        if (!isOpen) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previousOverflow || "";
        };
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        if (!effectiveUrl) {
            setQrCodeImage("");
            return;
        }

        QRCode.toDataURL(effectiveUrl, {
            errorCorrectionLevel: "H",
            width: 300,
            margin: 0,
        })
            .then((url) => setQrCodeImage(url))
            .catch((err) => {
                console.error(err);
                toast.error("Failed to generate QR code.");
            });
    }, [isOpen, effectiveUrl]);

    const displayUrl = useMemo(() => {
        if (!effectiveUrl) return "";
        try {
            const u = new URL(effectiveUrl);
            const host = u.host.replace(/^www\./i, "");
            return `${host}${u.pathname}`;
        } catch {
            return effectiveUrl.replace(/^https?:\/\//i, "");
        }
    }, [effectiveUrl]);

    const profileLabel = useMemo(() => {
        if (!selectedProfile) return "";
        return `${selectedProfile.name} — ${selectedProfile.slug}`;
    }, [selectedProfile]);

    const hasManyProfiles = (profiles?.length || 0) > 1;

    if (!isOpen) return null;

    const copyToClipboard = async (text, message) => {
        if (!text) return;

        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(text);
                toast.success(message || "Copied!");
                return;
            }

            const textArea = document.createElement("textarea");
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            document.execCommand("copy");
            document.body.removeChild(textArea);
            toast.success(message || "Copied!");
        } catch (err) {
            console.error(err);
            toast.error("Failed to copy. Please try manually.");
        }
    };

    const handleFacebook = () => {
        if (!effectiveUrl) return;
        if (typeof onFacebook === "function") {
            onFacebook();
            return;
        }
        openInNewTab(buildFacebookShareUrl(effectiveUrl));
    };

    const handleInstagram = async () => {
        if (!effectiveUrl) return;

        if (typeof onInstagram === "function") {
            onInstagram();
            return;
        }

        await copyToClipboard(effectiveUrl, "Profile link copied for Instagram sharing.");
        openInNewTab("https://www.instagram.com/");
    };

    const handleMessenger = () => {
        if (!effectiveUrl) return;
        if (typeof onMessenger === "function") {
            onMessenger();
            return;
        }
        openInNewTab(buildMessengerShareUrl(effectiveUrl));
    };

    const handleWhatsApp = () => {
        if (!effectiveUrl) return;
        if (typeof onWhatsApp === "function") {
            onWhatsApp();
            return;
        }
        openInNewTab(buildWhatsAppShareUrl(effectiveUrl));
    };

    const handleText = () => {
        if (!effectiveUrl) return;
        if (typeof onText === "function") {
            onText();
            return;
        }
        window.location.href = buildSmsShareUrl(effectiveUrl);
    };

    const handleAppleWallet = () => {
        if (typeof onAppleWallet === "function") {
            onAppleWallet();
            return;
        }
        toast("Apple Wallet action is not connected yet.");
    };

    const handleGoogleWallet = () => {
        if (typeof onGoogleWallet === "function") {
            onGoogleWallet();
            return;
        }
        toast("Google Wallet action is not connected yet.");
    };

    return (
        <div className="sp-overlay" onClick={onClose} role="presentation">
            <div
                className="sp-modal"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label="Share your profile"
            >
                <button
                    className="sp-close"
                    onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                    }}
                    aria-label="Close"
                    type="button"
                >
                    ×
                </button>

                <div className="sp-head">
                    <div className="sp-kicker">Share profile</div>
                    <h3 className="sp-title">Share your profile</h3>
                    <p className="sp-sub">
                        Share your link, QR code, socials and wallet options from one place.
                    </p>
                </div>

                <div className="sp-layout">
                    <div className="sp-mainCol">
                        <section className="sp-panel">
                            <div className="sp-panelHead">
                                <h4 className="sp-panelTitle">Profile</h4>
                                <p className="sp-panelSub">
                                    Choose which profile you want to share.
                                </p>
                            </div>

                            {hasManyProfiles ? (
                                <div className="sp-field">
                                    <label className="sp-label" htmlFor="sp-profile-select">
                                        Choose profile
                                    </label>
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
                            ) : profiles?.length === 1 ? (
                                <div className="sp-selectedCard">
                                    <div className="sp-selectedLabel">Selected profile</div>
                                    <div className="sp-selectedValue">{profileLabel}</div>
                                </div>
                            ) : (
                                <div className="sp-empty">
                                    No profile available yet. Create a profile first.
                                </div>
                            )}
                        </section>

                        <section className="sp-panel">
                            <div className="sp-panelHead">
                                <h4 className="sp-panelTitle">Profile link</h4>
                                <p className="sp-panelSub">
                                    Copy your public URL or visit your profile.
                                </p>
                            </div>

                            <div className="sp-linkRow">
                                <input
                                    type="text"
                                    readOnly
                                    value={displayUrl}
                                    className="sp-input"
                                    placeholder="Your profile link will appear here"
                                />
                            </div>

                            <div className="sp-primaryActions">
                                <button
                                    type="button"
                                    className="kx-btn kx-btn--black sp-primaryBtn"
                                    onClick={() => copyToClipboard(effectiveUrl, "Profile link copied!")}
                                    disabled={!effectiveUrl}
                                >
                                    <img src={CopyLinkIcon} alt="" className="sp-inlineIcon" />
                                    Copy link
                                </button>

                                <a
                                    href={effectiveUrl || "#"}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="kx-btn kx-btn--orange sp-primaryBtn"
                                    onClick={(e) => {
                                        if (!effectiveUrl) e.preventDefault();
                                    }}
                                >
                                    <img src={VisitProfileIcon} alt="" className="sp-inlineIcon" />
                                    Visit profile
                                </a>
                            </div>
                        </section>

                        <section className="sp-panel">
                            <div className="sp-panelHead">
                                <h4 className="sp-panelTitle">Share your profile</h4>
                                <p className="sp-panelSub">
                                    Send your profile through your favourite sharing channels.
                                </p>
                            </div>

                            <div className="sp-actionGrid">
                                <button
                                    type="button"
                                    className="kx-btn kx-btn--white sp-actionBtn"
                                    onClick={handleFacebook}
                                    disabled={!effectiveUrl}
                                >
                                    <ActionIcon src={ShareOnFacebookIcon} />
                                    <span>Facebook</span>
                                </button>

                                <button
                                    type="button"
                                    className="kx-btn kx-btn--white sp-actionBtn"
                                    onClick={handleInstagram}
                                    disabled={!effectiveUrl}
                                >
                                    <ActionIcon src={ShareOnInstagramIcon} />
                                    <span>Instagram</span>
                                </button>

                                <button
                                    type="button"
                                    className="kx-btn kx-btn--white sp-actionBtn"
                                    onClick={handleMessenger}
                                    disabled={!effectiveUrl}
                                >
                                    <ActionIcon src={ShareOnMessengerIcon} />
                                    <span>Messenger</span>
                                </button>

                                <button
                                    type="button"
                                    className="kx-btn kx-btn--white sp-actionBtn"
                                    onClick={handleWhatsApp}
                                    disabled={!effectiveUrl}
                                >
                                    <ActionIcon src={ShareOnWhatsappIcon} />
                                    <span>WhatsApp</span>
                                </button>

                                <button
                                    type="button"
                                    className="kx-btn kx-btn--white sp-actionBtn"
                                    onClick={handleText}
                                    disabled={!effectiveUrl}
                                >
                                    <ActionIcon src={ShareOnTextIcon} />
                                    <span>Text</span>
                                </button>

                                <button
                                    type="button"
                                    className="kx-btn kx-btn--white sp-actionBtn"
                                    onClick={() => copyToClipboard(effectiveUrl, "Profile link copied!")}
                                    disabled={!effectiveUrl}
                                >
                                    <ActionIcon src={ShareOnCopyIcon} />
                                    <span>Copy link</span>
                                </button>
                            </div>
                        </section>

                        <section className="sp-panel">
                            <div className="sp-panelHead">
                                <h4 className="sp-panelTitle">Add to wallet</h4>
                                <p className="sp-panelSub">
                                    Save your profile to Apple Wallet or Google Wallet.
                                </p>
                            </div>

                            <div className="sp-actionGrid sp-actionGrid--two">
                                <button
                                    type="button"
                                    className="kx-btn kx-btn--white sp-actionBtn"
                                    onClick={handleAppleWallet}
                                >
                                    <ActionIcon src={ShareOnAppleWalletIcon} />
                                    <span>Apple Wallet</span>
                                </button>

                                <button
                                    type="button"
                                    className="kx-btn kx-btn--white sp-actionBtn"
                                    onClick={handleGoogleWallet}
                                >
                                    <ActionIcon src={ShareOnGoogleWalletIcon} />
                                    <span>Google Wallet</span>
                                </button>
                            </div>
                        </section>
                    </div>

                    <div className="sp-sideCol">
                        <section className="sp-panel sp-panel--sticky">
                            <div className="sp-panelHead">
                                <h4 className="sp-panelTitle">QR code</h4>
                                <p className="sp-panelSub">
                                    Download and print it for quick sharing.
                                </p>
                            </div>

                            {qrCodeImage ? (
                                <>
                                    <div className="sp-qrWrap">
                                        <img
                                            src={qrCodeImage}
                                            alt="Profile QR Code"
                                            className="sp-qr"
                                        />
                                    </div>

                                    <div className="sp-downloadWrap">
                                        <a
                                            href={qrCodeImage}
                                            download={`${(username || "konarcard")
                                                .toString()
                                                .replace(/\s+/g, "-")}-qrcode.png`}
                                            className="kx-btn kx-btn--white sp-downloadBtn"
                                        >
                                            <img src={DownloadQRIcon} alt="" className="sp-inlineIcon" />
                                            Download QR
                                        </a>
                                    </div>
                                </>
                            ) : (
                                <div className="sp-empty">
                                    QR code will appear once a valid profile is selected.
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}

ShareProfile.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    profiles: PropTypes.arrayOf(
        PropTypes.shape({
            slug: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            url: PropTypes.string.isRequired,
        })
    ),
    selectedSlug: PropTypes.string,
    onSelectSlug: PropTypes.func,
    profileUrl: PropTypes.string,
    username: PropTypes.string,
    onFacebook: PropTypes.func,
    onInstagram: PropTypes.func,
    onMessenger: PropTypes.func,
    onWhatsApp: PropTypes.func,
    onText: PropTypes.func,
    onAppleWallet: PropTypes.func,
    onGoogleWallet: PropTypes.func,
};