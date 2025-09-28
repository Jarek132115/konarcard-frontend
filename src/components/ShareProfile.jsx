import React, { useEffect, useRef, useState, useMemo } from "react";
import { toast } from "react-hot-toast";
import PropTypes from "prop-types";
import QRCode from "qrcode";

import CopyLinkIcon from "../assets/icons/CopyLink-Icon.svg";
import VisitProfileIcon from "../assets/icons/VisitProfile-Icon.svg";
import DownloadQRIcon from "../assets/icons/DownloadQR-Icon.svg";

export default function ShareProfile({
    isOpen,
    onClose,
    profileUrl,
    username,
}) {
    const profileLinkRef = useRef(null);
    const [qrCodeImage, setQrCodeImage] = useState("");

    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === "Escape") onClose();
        };
        if (isOpen) document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (profileUrl) {
            QRCode.toDataURL(profileUrl, { errorCorrectionLevel: "H", width: 200, margin: 0 })
                .then((url) => setQrCodeImage(url))
                .catch((err) => {
                    console.error(err);
                    toast.error("Failed to generate QR code.");
                });
        }
    }, [profileUrl]);

    const displayUrl = useMemo(() => {
        // Show "www.konarcard/u/username" (no protocol, no .com)
        try {
            const u = new URL(profileUrl);
            const host = u.host.replace(/\.com$/i, "");
            // if it's the expected domain, ensure "www.konarcard"
            const prettyHost = host === "www.konarcard" ? host : host;
            return `${prettyHost}${u.pathname}`;
        } catch {
            return profileUrl
                .replace(/^https?:\/\//i, "")
                .replace("www.konarcard.com", "www.konarcard");
        }
    }, [profileUrl]);

    if (!isOpen) return null;

    const copyToClipboard = (text, message) => {
        if (navigator.clipboard?.writeText) {
            navigator.clipboard
                .writeText(text)
                .then(() => toast.success(message || "Profile link copied!"))
                .catch((err) => {
                    console.error("Failed to copy text:", err);
                    toast.error("Failed to copy. Please try manually.");
                });
            return;
        }
        // Fallback
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand("copy");
            toast.success(message || "Copied to clipboard!");
        } catch (err) {
            console.error("Fallback: Failed to copy text:", err);
            toast.error("Failed to copy. Please try manually.");
        }
        document.body.removeChild(textArea);
    };

    return (
        <div className="share-modal-overlay" onClick={onClose}>
            <div className="share-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="share-modal-close-button" onClick={onClose} aria-label="Close">
                    ×
                </button>

                {/* Cal Sans title */}
                <h3 className="share-modal-title share-link-title">Share Your Link</h3>

                <div className="profile-link-section">
                    <div className="share-link-row">
                        <input
                            type="text"
                            readOnly
                            value={displayUrl}
                            ref={profileLinkRef}
                            className="share-link-input"
                        />
                    </div>

                    {/* 50/50 on desktop, stack under 600px */}
                    <div className="share-action-buttons">
                        <button
                            onClick={() => copyToClipboard(profileUrl, "Profile link copied!")}
                            className="desktop-button navy-button share-button-custom"
                            type="button"
                        >
                            <img src={CopyLinkIcon} alt="" className="share-button-icon make-white" />
                            Copy Link
                        </button>

                        <a
                            href={profileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="desktop-button orange-button share-button-custom"
                        >
                            <img src={VisitProfileIcon} alt="" className="share-button-icon make-white" />
                            Visit Profile
                        </a>
                    </div>
                </div>

                {qrCodeImage && (
                    <div className="qr-code-section">
                        {/* Same styling as the top title (Cal Sans) */}
                        <h3 className="share-modal-title share-link-title">Scan QR Code</h3>

                        <div className="qr-code-image-container clean">
                            <img
                                src={qrCodeImage}
                                alt="Profile QR Code"
                                className="share-qr-code-image"
                                width="200"
                                height="200"
                            />
                        </div>

                        <div className="share-action-buttons">
                            <a
                                href={qrCodeImage}
                                download={`${username || "konarcard"}-qrcode.png`}
                                className="desktop-button navy-button share-button-custom"
                            >
                                <img src={DownloadQRIcon} alt="" className="share-button-icon make-white" />
                                Download QR Code
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

ShareProfile.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    profileUrl: PropTypes.string.isRequired,
    username: PropTypes.string,
};
