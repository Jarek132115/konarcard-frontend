import React from "react";
import CopyLinkIcon from "../../assets/icons/CopyLink.svg";

import ShareOnFacebookIcon from "../../assets/icons/ShareOnFacebook.svg";
import ShareOnInstagramIcon from "../../assets/icons/ShareOnInstagram.svg";
import ShareOnMessengerIcon from "../../assets/icons/ShareOnMessenger.svg";
import ShareOnWhatsappIcon from "../../assets/icons/ShareOnWhatsapp.svg";
import ShareOnTextIcon from "../../assets/icons/ShareOnText.svg";
import ShareOnCopyIcon from "../../assets/icons/ShareOnCopy.svg";
import ShareOnQRCodeIcon from "../../assets/icons/ShareOnQRCode.svg";
import ShareOnAppleWalletIcon from "../../assets/icons/ShareOnAppleWallet.svg";
import ShareOnGoogleWalletIcon from "../../assets/icons/ShareOnGoogleWallet.svg";
import ShareOnEditProfileIcon from "../../assets/icons/ShareOnEditProfile.svg";
import { resolveMediaUrl } from "../../utils/profileHelpers";

function ActionIcon({ src, alt = "" }) {
    return (
        <span className="profiles-btnIcon" aria-hidden="true">
            <img src={src} alt={alt} className="profiles-btnIconImg" />
        </span>
    );
}

function IconTrash() {
    return (
        <svg viewBox="0 0 24 24" className="profiles-btnIconSvg" aria-hidden="true">
            <path
                fill="currentColor"
                d="M9 3h6l1 2h4v2H4V5h4l1-2Zm1 6h2v8h-2V9Zm4 0h2v8h-2V9ZM7 9h2v8H7V9Zm1 12a2 2 0 0 1-2-2V8h12v11a2 2 0 0 1-2 2H8Z"
            />
        </svg>
    );
}

function MetricInline({ value, label }) {
    return (
        <div className="profiles-metricInline">
            <span className="profiles-metricInlineVal">{value}</span>
            <span className="profiles-metricInlineLab">{label}</span>
        </div>
    );
}

function LinkRow({ label, value, onCopy, copyLabel }) {
    if (!value) return null;

    return (
        <div className="profiles-linkBlock">
            <div className="profiles-previewLinkLabel">{label}</div>

            <div className="profiles-previewLinkRow">
                <div className="profiles-previewLinkUrl" title={value}>
                    {value}
                </div>

                <button
                    type="button"
                    className="profiles-copyIconBtn"
                    onClick={onCopy}
                    aria-label={copyLabel || `Copy ${label}`}
                >
                    <img src={CopyLinkIcon} alt="" className="profiles-copyIcon24" />
                </button>
            </div>
        </div>
    );
}

export default function ProfilesInfo({
    selectedProfile,
    selectedPublicUrl,
    selectedQrTrackedUrl,
    selectedNfcTrackedUrl,
    onCopyLink,
    onCopyQrLink,
    onCopyNfcLink,
    onDownloadQr,
    onFacebook,
    onInstagram,
    onMessenger,
    onWhatsApp,
    onText,
    onAppleWallet,
    onGoogleWallet,
    onEdit,
    onDelete,
}) {
    const resolvedQrCodeUrl = resolveMediaUrl(selectedProfile?.qrCodeUrl);

    const publicUrl = selectedPublicUrl || "";
    const qrTrackedUrl = selectedQrTrackedUrl || publicUrl || "";
    const nfcTrackedUrl = selectedNfcTrackedUrl || publicUrl || "";

    return (
        <aside className="profiles-right">
            <section className="profiles-card profiles-actionsCard">
                {selectedProfile ? (
                    <>
                        <div className="profiles-infoSection profiles-infoSection--first">
                            <div className="profiles-actionsTop">
                                <div className="profiles-pillRow profiles-previewPills">
                                    <span className={`profiles-pill ${selectedProfile.isLive ? "live" : "draft"}`}>
                                        {selectedProfile.isLive ? "Live" : "Draft"}
                                    </span>

                                    <span className={`profiles-pill completion ${selectedProfile.tone}`}>
                                        {selectedProfile.pct >= 95
                                            ? "Profile Complete"
                                            : `${selectedProfile.pct}% Complete`}
                                    </span>
                                </div>

                                <LinkRow
                                    label="Profile link"
                                    value={publicUrl}
                                    onCopy={onCopyLink}
                                    copyLabel="Copy profile link"
                                />

                                <div className="profiles-previewHint">
                                    This is your standard public profile link — use this for normal sharing.
                                </div>

                                <div className="profiles-previewMetricsRow">
                                    <div className="profiles-metricsInline" aria-label="Profile metrics">
                                        <MetricInline value={selectedProfile.views ?? 0} label="Profile Views" />
                                        <MetricInline value={selectedProfile.linkTaps ?? 0} label="Link Taps" />
                                        <MetricInline value={selectedProfile.qrScans ?? 0} label="QR Scans" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="profiles-divider" />

                        <div className="profiles-infoSection">
                            <div className="profiles-actionGroup">
                                <h3 className="profiles-groupTitle">Tracked links</h3>

                                <LinkRow
                                    label="QR tracked link"
                                    value={qrTrackedUrl}
                                    onCopy={onCopyQrLink}
                                    copyLabel="Copy QR tracked link"
                                />

                                <LinkRow
                                    label="NFC tracked link"
                                    value={nfcTrackedUrl}
                                    onCopy={onCopyNfcLink}
                                    copyLabel="Copy NFC tracked link"
                                />

                                <div className="profiles-previewHint">
                                    Use the QR tracked link for QR generation and the NFC tracked link when
                                    programming an NFC card or tag, so analytics records scans and taps properly.
                                </div>
                            </div>
                        </div>

                        <div className="profiles-divider" />

                        <div className="profiles-infoSection">
                            <div className="profiles-actionGroup">
                                <h3 className="profiles-groupTitle">QR code</h3>

                                <div className="profiles-qrBlock">
                                    <div className="profiles-qrWrap profiles-qrWrap--wide">
                                        {resolvedQrCodeUrl ? (
                                            <img
                                                src={resolvedQrCodeUrl}
                                                alt={`${selectedProfile.slug} QR code`}
                                                className="profiles-qrImage"
                                            />
                                        ) : (
                                            <div className="profiles-qrPlaceholder">QR not available yet</div>
                                        )}
                                    </div>

                                    <div className="profiles-singleAction profiles-singleAction--wide">
                                        <button
                                            type="button"
                                            className="kx-btn kx-btn--white profiles-actionBtn profiles-actionBtn--wide"
                                            onClick={onDownloadQr}
                                        >
                                            <ActionIcon src={ShareOnQRCodeIcon} />
                                            <span>Download QR code</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="profiles-divider" />

                        <div className="profiles-infoSection">
                            <div className="profiles-actionGroup">
                                <h3 className="profiles-groupTitle">Share your profile</h3>

                                <div className="profiles-actionGrid">
                                    <button
                                        type="button"
                                        className="kx-btn kx-btn--white profiles-actionBtn"
                                        onClick={onFacebook}
                                    >
                                        <ActionIcon src={ShareOnFacebookIcon} />
                                        <span>Facebook</span>
                                    </button>

                                    <button
                                        type="button"
                                        className="kx-btn kx-btn--white profiles-actionBtn"
                                        onClick={onInstagram}
                                    >
                                        <ActionIcon src={ShareOnInstagramIcon} />
                                        <span>Instagram</span>
                                    </button>

                                    <button
                                        type="button"
                                        className="kx-btn kx-btn--white profiles-actionBtn"
                                        onClick={onMessenger}
                                    >
                                        <ActionIcon src={ShareOnMessengerIcon} />
                                        <span>Messenger</span>
                                    </button>

                                    <button
                                        type="button"
                                        className="kx-btn kx-btn--white profiles-actionBtn"
                                        onClick={onWhatsApp}
                                    >
                                        <ActionIcon src={ShareOnWhatsappIcon} />
                                        <span>WhatsApp</span>
                                    </button>

                                    <button
                                        type="button"
                                        className="kx-btn kx-btn--white profiles-actionBtn"
                                        onClick={onText}
                                    >
                                        <ActionIcon src={ShareOnTextIcon} />
                                        <span>Text</span>
                                    </button>

                                    <button
                                        type="button"
                                        className="kx-btn kx-btn--white profiles-actionBtn"
                                        onClick={onCopyLink}
                                    >
                                        <ActionIcon src={ShareOnCopyIcon} />
                                        <span>Copy link</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="profiles-divider" />

                        <div className="profiles-infoSection">
                            <div className="profiles-actionGroup">
                                <h3 className="profiles-groupTitle">Add to wallet</h3>

                                <div className="profiles-actionGrid profiles-actionGrid--two">
                                    <button
                                        type="button"
                                        className="kx-btn kx-btn--white profiles-actionBtn"
                                        onClick={onAppleWallet}
                                    >
                                        <ActionIcon src={ShareOnAppleWalletIcon} />
                                        <span>Apple Wallet</span>
                                    </button>

                                    <button
                                        type="button"
                                        className="kx-btn kx-btn--white profiles-actionBtn"
                                        onClick={onGoogleWallet}
                                    >
                                        <ActionIcon src={ShareOnGoogleWalletIcon} />
                                        <span>Google Wallet</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="profiles-divider" />

                        <div className="profiles-infoSection profiles-infoSection--last">
                            <div className="profiles-actionGroup">
                                <h3 className="profiles-groupTitle">Manage profile</h3>

                                <div className="profiles-actionGrid profiles-actionGrid--two">
                                    <button
                                        type="button"
                                        className="kx-btn kx-btn--white profiles-actionBtn"
                                        onClick={() => onEdit(selectedProfile.slug)}
                                    >
                                        <ActionIcon src={ShareOnEditProfileIcon} />
                                        <span>Edit</span>
                                    </button>

                                    <button
                                        type="button"
                                        className="kx-btn kx-btn--white profiles-deleteBtn profiles-actionBtn"
                                        onClick={() => onDelete(selectedProfile.slug)}
                                    >
                                        <span className="profiles-btnIcon" aria-hidden="true">
                                            <IconTrash />
                                        </span>
                                        <span>Delete</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="profiles-previewLoading">Select a profile to see actions.</div>
                )}
            </section>
        </aside>
    );
}