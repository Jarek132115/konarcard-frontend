import React, { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { toast } from "react-hot-toast";
import QRCode from "qrcode";
import "../styling/dashboard/shareprofile.css";

import CopyLinkIcon from "../assets/icons/CopyLink-Icon.svg";
import VisitProfileIcon from "../assets/icons/VisitProfile-Icon.svg";
import DownloadQRIcon from "../assets/icons/DownloadQR-Icon.svg";

export default function ShareProfile({
    isOpen,
    onClose,
    profiles = [],
    selectedSlug,
    onSelectSlug,
    profileUrl,
    username,
}) {
    const profileLinkRef = useRef(null);
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
            width: 220,
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

    const hasManyProfiles = (profiles?.length || 0) > 1;

    return (
        <div
            className="sp-overlay"
            onClick={onClose}
            role="presentation"
        >
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
                        Copy your link, visit your public page, or download your QR code to
                        share it anywhere.
                    </p>
                </div>

                <div className="sp-body">
                    <div className="sp-main">
                        <div className="sp-card">
                            <div className="sp-cardHead">
                                <h4 className="sp-cardTitle">Profile</h4>
                                <p className="sp-cardSub">
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
                                <div className="sp-single">
                                    <div className="sp-singleLabel">Selected profile</div>
                                    <div className="sp-singleValue">{profileLabel}</div>
                                </div>
                            ) : (
                                <div className="sp-empty">
                                    No profile available yet. Create a profile first.
                                </div>
                            )}
                        </div>

                        <div className="sp-card">
                            <div className="sp-cardHead">
                                <h4 className="sp-cardTitle">Profile link</h4>
                                <p className="sp-cardSub">
                                    Copy your public URL or open it in a new tab.
                                </p>
                            </div>

                            <div className="sp-linkRow">
                                <input
                                    ref={profileLinkRef}
                                    type="text"
                                    readOnly
                                    value={displayUrl}
                                    className="sp-input"
                                    placeholder="Your profile link will appear here"
                                />
                            </div>

                            <div className="sp-actions">
                                <button
                                    type="button"
                                    className="kx-btn kx-btn--black sp-btn"
                                    onClick={() =>
                                        copyToClipboard(effectiveUrl, "Profile link copied!")
                                    }
                                    disabled={!effectiveUrl}
                                >
                                    <img src={CopyLinkIcon} alt="" className="sp-ico" />
                                    Copy link
                                </button>

                                <a
                                    href={effectiveUrl || "#"}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="kx-btn kx-btn--orange sp-btn"
                                    onClick={(e) => {
                                        if (!effectiveUrl) e.preventDefault();
                                    }}
                                >
                                    <img src={VisitProfileIcon} alt="" className="sp-ico" />
                                    Visit profile
                                </a>
                            </div>
                        </div>
                    </div>

                    <aside className="sp-side">
                        <div className="sp-card sp-card--qr">
                            <div className="sp-cardHead">
                                <h4 className="sp-cardTitle">QR code</h4>
                                <p className="sp-cardSub">
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

                                    <div className="sp-actions sp-actionsSingle">
                                        <a
                                            href={qrCodeImage}
                                            download={`${(username || "konarcard")
                                                .toString()
                                                .replace(/\s+/g, "-")}-qrcode.png`}
                                            className="kx-btn kx-btn--white sp-btn"
                                        >
                                            <img
                                                src={DownloadQRIcon}
                                                alt=""
                                                className="sp-ico"
                                            />
                                            Download QR
                                        </a>
                                    </div>
                                </>
                            ) : (
                                <div className="sp-empty">
                                    QR code will appear once a valid profile is selected.
                                </div>
                            )}
                        </div>
                    </aside>
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
};