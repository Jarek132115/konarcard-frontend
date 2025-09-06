import React, { useEffect, useRef, useState } from "react";
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
            if (event.key === "Escape") {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
        }
        return () => {
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen, onClose]);

    useEffect(() => {
        if (profileUrl) {
            QRCode.toDataURL(profileUrl, { errorCorrectionLevel: "H" })
                .then((url) => {
                    setQrCodeImage(url);
                })
                .catch((err) => {
                    console.error(err);
                    toast.error("Failed to generate QR code.");
                });
        }
    }, [profileUrl]);

    if (!isOpen) return null;

    const copyToClipboard = (text, message) => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard
                .writeText(text)
                .then(() => toast.success(message || "Profile link copied!"))
                .catch((err) => {
                    console.error("Failed to copy text:", err);
                    toast.error("Failed to copy. Please try manually.");
                });
        } else {
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
        }
    };

    return (
        <div className="share-modal-overlay" onClick={onClose}>
            <div className="share-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="share-modal-close-button" onClick={onClose}>
                    ×
                </button>

                <h3 className="share-modal-title">Share Your Link</h3>

                <div className="profile-link-section">
                    <div className="share-link-row">
                        <input
                            type="text"
                            readOnly
                            value={profileUrl}
                            ref={profileLinkRef}
                            className="share-link-input"
                        />
                    </div>
                    <div className="share-action-buttons">
                        <button
                            onClick={() =>
                                copyToClipboard(profileUrl, "Profile link copied!")
                            }
                            className="cta-black-button share-button-custom"
                        >
                            <img
                                src={CopyLinkIcon}
                                alt="Copy Link"
                                className="share-button-icon"
                            />
                            Copy Link
                        </button>
                        <a
                            href={profileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="cta-blue-button share-button-custom"
                        >
                            <img
                                src={VisitProfileIcon}
                                alt="Visit Profile"
                                className="share-button-icon visit-profile-icon"
                            />
                            Visit Profile
                        </a>
                    </div>
                </div>

                {qrCodeImage && (
                    <div className="qr-code-section">
                        <h3 className="share-modal-title">Scan QR Code</h3>
                        <div className="qr-code-image-container">
                            <img
                                src={qrCodeImage}
                                alt="Profile QR Code"
                                className="share-qr-code-image"
                            />
                        </div>
                        <div className="share-action-buttons">
                            <a
                                href={qrCodeImage}
                                download={`${username || "konarcard"}-qrcode.png`}
                                className="cta-black-button share-button-custom"
                            >
                                <img
                                    src={DownloadQRIcon}
                                    alt="Download QR Code"
                                    className="share-button-icon"
                                />
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
