import React from "react";
import CopyLinkIcon from "../../assets/icons/CopyLink.svg";

function ActionIcon({ children }) {
    return <span className="profiles-btnIcon" aria-hidden="true">{children}</span>;
}

function IconFacebook() {
    return (
        <svg viewBox="0 0 24 24" className="profiles-btnIconSvg" aria-hidden="true">
            <path
                fill="currentColor"
                d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.9.3-1.6 1.7-1.6H16.7V4.8c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4V11H8v3h2.5v8h3Z"
            />
        </svg>
    );
}

function IconInstagram() {
    return (
        <svg viewBox="0 0 24 24" className="profiles-btnIconSvg" aria-hidden="true">
            <path
                fill="currentColor"
                d="M7.8 3h8.4A4.8 4.8 0 0 1 21 7.8v8.4a4.8 4.8 0 0 1-4.8 4.8H7.8A4.8 4.8 0 0 1 3 16.2V7.8A4.8 4.8 0 0 1 7.8 3Zm0 1.8A3 3 0 0 0 4.8 7.8v8.4a3 3 0 0 0 3 3h8.4a3 3 0 0 0 3-3V7.8a3 3 0 0 0-3-3H7.8Zm8.9 1.3a1.1 1.1 0 1 1 0 2.2a1.1 1.1 0 0 1 0-2.2ZM12 7a5 5 0 1 1 0 10a5 5 0 0 1 0-10Zm0 1.8A3.2 3.2 0 1 0 12 15.2A3.2 3.2 0 0 0 12 8.8Z"
            />
        </svg>
    );
}

function IconMessenger() {
    return (
        <svg viewBox="0 0 24 24" className="profiles-btnIconSvg" aria-hidden="true">
            <path
                fill="currentColor"
                d="M12 3C6.5 3 2.2 7 2.2 12.1c0 2.9 1.4 5.5 3.8 7.2V22l2.6-1.4c1.1.3 2.2.5 3.4.5 5.5 0 9.8-4 9.8-9.1S17.5 3 12 3Zm1 12.2-2.5-2.7-4.8 2.7 5.2-5.5 2.6 2.7 4.7-2.7-5.2 5.5Z"
            />
        </svg>
    );
}

function IconWhatsApp() {
    return (
        <svg viewBox="0 0 24 24" className="profiles-btnIconSvg" aria-hidden="true">
            <path
                fill="currentColor"
                d="M12 3.2a8.8 8.8 0 0 0-7.6 13.2L3 21l4.8-1.2A8.8 8.8 0 1 0 12 3.2Zm0 16a7.2 7.2 0 0 1-3.7-1l-.3-.2-2.8.7.8-2.7-.2-.3A7.2 7.2 0 1 1 12 19.2Zm4-5.4c-.2-.1-1.3-.6-1.5-.7-.2-.1-.3-.1-.5.1l-.4.5c-.1.1-.2.2-.4.1-.9-.4-1.7-1-2.4-1.8-.2-.2 0-.4.1-.5l.3-.4c.1-.1.1-.3 0-.4l-.7-1.6c-.1-.2-.2-.2-.4-.2h-.4c-.2 0-.4.1-.5.2-.5.5-.8 1.1-.8 1.8 0 .5.2 1 .5 1.5 1.3 1.9 2.9 3.3 5.1 4.2.6.2 1.3.3 1.9.2.6-.1 1.7-.7 1.9-1.4.1-.3.1-.7 0-.8-.1-.1-.3-.2-.4-.3Z"
            />
        </svg>
    );
}

function IconSms() {
    return (
        <svg viewBox="0 0 24 24" className="profiles-btnIconSvg" aria-hidden="true">
            <path
                fill="currentColor"
                d="M5 4h14a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H8l-5 4v-4H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Zm1.2 5.1a.9.9 0 0 0 0 1.8h11.6a.9.9 0 1 0 0-1.8H6.2Zm0 4a.9.9 0 0 0 0 1.8H14a.9.9 0 1 0 0-1.8H6.2Z"
            />
        </svg>
    );
}

function IconLink() {
    return (
        <svg viewBox="0 0 24 24" className="profiles-btnIconSvg" aria-hidden="true">
            <path
                fill="currentColor"
                d="M10.6 13.4a1 1 0 0 0 1.4 1.4l4.2-4.2a3 3 0 1 0-4.2-4.2l-1.7 1.7a1 1 0 0 0 1.4 1.4l1.7-1.7a1 1 0 1 1 1.4 1.4l-4.2 4.2Zm2.8-2.8a1 1 0 0 0-1.4-1.4l-4.2 4.2a3 3 0 1 0 4.2 4.2l1.7-1.7a1 1 0 1 0-1.4-1.4l-1.7 1.7a1 1 0 1 1-1.4-1.4l4.2-4.2Z"
            />
        </svg>
    );
}

function IconQr() {
    return (
        <svg viewBox="0 0 24 24" className="profiles-btnIconSvg" aria-hidden="true">
            <path
                fill="currentColor"
                d="M3 3h8v8H3V3Zm2 2v4h4V5H5Zm8-2h8v8h-8V3Zm2 2v4h4V5h-4ZM3 13h8v8H3v-8Zm2 2v4h4v-4H5Zm8-2h2v2h-2v-2Zm2 2h2v2h2v2h-2v2h-2v-2h-2v-2h2v-2Zm4-2h2v2h-2v-2Zm-6 6h2v2h-2v-2Zm6 0h2v2h-2v-2Z"
            />
        </svg>
    );
}

function IconApple() {
    return (
        <svg viewBox="0 0 24 24" className="profiles-btnIconSvg" aria-hidden="true">
            <path
                fill="currentColor"
                d="M15.1 3.6c0 1-.4 1.8-1 2.5-.7.8-1.8 1.3-2.8 1.2-.1-1 .3-2 1-2.7.7-.7 1.8-1.2 2.8-1Zm3.4 13.2c-.3.8-.7 1.5-1.2 2.2-.7 1-1.5 2.2-2.7 2.2-1 0-1.2-.6-2.6-.6-1.3 0-1.6.6-2.6.6-1.1 0-1.8-1.1-2.5-2.1-1.9-2.8-2.1-6.1-.9-8 .8-1.3 2-2 3.2-2 1 0 1.9.6 2.8.6.9 0 1.5-.6 2.8-.6 1 0 2 .5 2.8 1.5-2.4 1.3-2 4.7.9 6.2Z"
            />
        </svg>
    );
}

function IconGoogle() {
    return (
        <svg viewBox="0 0 24 24" className="profiles-btnIconSvg" aria-hidden="true">
            <path
                fill="currentColor"
                d="M21.8 12.2c0-.7-.1-1.2-.2-1.8H12v3.4h5.5c-.1.8-.9 2.1-2.5 2.9l-.1 1.1 2.8 2.2.2.1c2.1-1.9 3.3-4.7 3.3-7.9ZM12 22c2.8 0 5.2-.9 6.9-2.5l-3.3-2.6c-.9.6-2 1-3.6 1-2.7 0-5-1.8-5.8-4.2l-1 .1-2.9 2.3v.1C4 19.7 7.7 22 12 22ZM6.2 13.7c-.2-.6-.3-1.1-.3-1.7s.1-1.2.3-1.7l-.1-1.1-3-2.3H3c-.7 1.4-1 2.9-1 4.5s.4 3.1 1 4.5l3.2-2.4ZM12 5.9c2 0 3.3.8 4.1 1.6l3-2.9C17.2 2.8 14.8 2 12 2C7.7 2 4 4.3 2.1 7.9l3.1 2.4C7 7.7 9.3 5.9 12 5.9Z"
            />
        </svg>
    );
}

function IconEdit() {
    return (
        <svg viewBox="0 0 24 24" className="profiles-btnIconSvg" aria-hidden="true">
            <path
                fill="currentColor"
                d="M4 17.2V20h2.8l8.3-8.3-2.8-2.8L4 17.2Zm13.7-8.9c.4-.4.4-1 0-1.4l-1.6-1.6a1 1 0 0 0-1.4 0l-1.3 1.3 2.8 2.8 1.5-1.1Z"
            />
        </svg>
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

export default function ProfilesInfo({
    selectedProfile,
    selectedPublicUrl,
    onCopyLink,
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
                                        {selectedProfile.pct >= 95 ? "Profile Complete" : `${selectedProfile.pct}% Complete`}
                                    </span>
                                </div>

                                <div className="profiles-previewLinkLabel">Profile link</div>

                                <div className="profiles-previewLinkRow">
                                    <div className="profiles-previewLinkUrl" title={selectedPublicUrl}>
                                        {selectedPublicUrl}
                                    </div>

                                    <button
                                        type="button"
                                        className="profiles-copyIconBtn"
                                        onClick={() => onCopyLink(selectedPublicUrl)}
                                        aria-label="Copy profile link"
                                    >
                                        <img src={CopyLinkIcon} alt="" className="profiles-copyIcon24" />
                                    </button>
                                </div>

                                <div className="profiles-previewHint">
                                    This is your profile link — share it after every job, quote, or enquiry.
                                </div>

                                <div className="profiles-previewMetricsRow">
                                    <div className="profiles-metrics profiles-metrics--preview">
                                        <div className="profiles-metric">
                                            <div className="profiles-metricVal">{selectedProfile.views}</div>
                                            <div className="profiles-metricLab">Views</div>
                                        </div>

                                        <div className="profiles-metric">
                                            <div className="profiles-metricVal">{selectedProfile.linkTaps}</div>
                                            <div className="profiles-metricLab">Link Taps</div>
                                        </div>

                                        <div className="profiles-metric">
                                            <div className="profiles-metricVal">{selectedProfile.pct}%</div>
                                            <div className="profiles-metricLab">Completion</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="profiles-divider" />

                        <div className="profiles-infoSection">
                            <div className="profiles-actionGroup">
                                <h3 className="profiles-groupTitle">QR code</h3>

                                <div className="profiles-qrWrap profiles-qrWrap--wide">
                                    {selectedProfile.qrCodeUrl ? (
                                        <img
                                            src={selectedProfile.qrCodeUrl}
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
                                        <ActionIcon><IconQr /></ActionIcon>
                                        <span>Download QR code</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="profiles-divider" />

                        <div className="profiles-infoSection">
                            <div className="profiles-actionGroup">
                                <h3 className="profiles-groupTitle">Share your profile</h3>

                                <div className="profiles-actionGrid">
                                    <button type="button" className="kx-btn kx-btn--white profiles-actionBtn" onClick={onFacebook}>
                                        <ActionIcon><IconFacebook /></ActionIcon>
                                        <span>Facebook</span>
                                    </button>

                                    <button type="button" className="kx-btn kx-btn--white profiles-actionBtn" onClick={onInstagram}>
                                        <ActionIcon><IconInstagram /></ActionIcon>
                                        <span>Instagram</span>
                                    </button>

                                    <button type="button" className="kx-btn kx-btn--white profiles-actionBtn" onClick={onMessenger}>
                                        <ActionIcon><IconMessenger /></ActionIcon>
                                        <span>Messenger</span>
                                    </button>

                                    <button type="button" className="kx-btn kx-btn--white profiles-actionBtn" onClick={onWhatsApp}>
                                        <ActionIcon><IconWhatsApp /></ActionIcon>
                                        <span>WhatsApp</span>
                                    </button>

                                    <button type="button" className="kx-btn kx-btn--white profiles-actionBtn" onClick={onText}>
                                        <ActionIcon><IconSms /></ActionIcon>
                                        <span>Text</span>
                                    </button>

                                    <button type="button" className="kx-btn kx-btn--black profiles-actionBtn" onClick={() => onCopyLink(selectedPublicUrl)}>
                                        <ActionIcon><IconLink /></ActionIcon>
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
                                    <button type="button" className="kx-btn kx-btn--white profiles-actionBtn" onClick={onAppleWallet}>
                                        <ActionIcon><IconApple /></ActionIcon>
                                        <span>Apple Wallet</span>
                                    </button>

                                    <button type="button" className="kx-btn kx-btn--white profiles-actionBtn" onClick={onGoogleWallet}>
                                        <ActionIcon><IconGoogle /></ActionIcon>
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
                                        <ActionIcon><IconEdit /></ActionIcon>
                                        <span>Edit</span>
                                    </button>

                                    <button
                                        type="button"
                                        className="kx-btn kx-btn--white profiles-deleteBtn profiles-actionBtn"
                                        onClick={() => onDelete(selectedProfile.slug)}
                                    >
                                        <ActionIcon><IconTrash /></ActionIcon>
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