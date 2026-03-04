import React, { useEffect, useMemo, useRef, useState } from "react";
import { previewPlaceholders } from "../../store/businessCardStore";

/* Social icons */
import FacebookIcon from "../../assets/icons/icons8-facebook.svg";
import InstagramIcon from "../../assets/icons/icons8-instagram.svg";
import LinkedInIcon from "../../assets/icons/icons8-linkedin.svg";
import XIcon from "../../assets/icons/icons8-x.svg";
import TikTokIcon from "../../assets/icons/icons8-tiktok.svg";

/* ✅ Upgrade badge icon (premium) */
import UpgradePlanIcon from "../../assets/icons/UpgradePlanIcon.svg";

/* ✅ Use ANY 5 images from the Home hero carousel (UP1–UP8) */
import UP1 from "../../assets/images/UP1.jpg";
import UP2 from "../../assets/images/UP2.jpg";
import UP3 from "../../assets/images/UP3.jpg";
import UP4 from "../../assets/images/UP4.jpg";
import UP5 from "../../assets/images/UP5.jpg";

import "../../styling/dashboard/editor.css";

const isBlobUrl = (v) => typeof v === "string" && v.startsWith("blob:");

export default function Editor({
    state,
    updateState,

    isSubscribed, // ✅ plus/teams = true, free = false

    onStartSubscription,
    onResetPage,
    onSubmit,

    showMainSection,
    showAboutMeSection,
    showWorkSection,
    showServicesSection,
    showReviewsSection,
    showContactSection,

    setShowMainSection,
    setShowAboutMeSection,
    setShowWorkSection,
    setShowServicesSection,
    setShowReviewsSection,
    setShowContactSection,

    onCoverUpload,
    onRemoveCover,
    onAvatarUpload,
    onRemoveAvatar,
    onAddWorkImages,
    onRemoveWorkImage,
}) {
    const coverInputRef = useRef(null);
    const avatarInputRef = useRef(null);
    const workImageInputRef = useRef(null);

    const [upgradeOpen, setUpgradeOpen] = useState(false);
    const [upgradeContext, setUpgradeContext] = useState("feature");

    const FREE_MAX = 6;
    const PRO_MAX = 12;

    const maxWorks = isSubscribed ? PRO_MAX : FREE_MAX;
    const maxServices = isSubscribed ? PRO_MAX : FREE_MAX;
    const maxReviews = isSubscribed ? PRO_MAX : FREE_MAX;

    const worksCount = Array.isArray(state.workImages) ? state.workImages.length : 0;
    const servicesCount = Array.isArray(state.services) ? state.services.length : 0;
    const reviewsCount = Array.isArray(state.reviews) ? state.reviews.length : 0;

    const openUpgrade = (ctx = "feature") => {
        setUpgradeContext(ctx);
        setUpgradeOpen(true);
    };

    const closeUpgrade = () => setUpgradeOpen(false);

    // close on ESC
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "Escape") closeUpgrade();
        };
        if (upgradeOpen) window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [upgradeOpen]);

    // Templates
    const TEMPLATE_IDS = useMemo(
        () => ["template-1", "template-2", "template-3", "template-4", "template-5"],
        []
    );

    const templateThumbs = useMemo(
        () => ({
            "template-1": UP1,
            "template-2": UP2,
            "template-3": UP3,
            "template-4": UP4,
            "template-5": UP5,
        }),
        []
    );

    const currentTemplate = (state.templateId || "template-1").toString();
    const isTemplateLocked = (templateId) => !isSubscribed && templateId !== "template-1";

    const handleTemplateSelect = (id) => {
        if (isTemplateLocked(id)) {
            openUpgrade("templates");
            return;
        }
        updateState({ templateId: id });
    };

    // Services
    const handleServiceChange = (i, field, value) => {
        const next = [...(state.services || [])];
        next[i] = { ...(next[i] || {}), [field]: value };
        updateState({ services: next });
    };

    const handleAddService = () => {
        if (!isSubscribed && servicesCount >= FREE_MAX) return openUpgrade("services");
        updateState({ services: [...(state.services || []), { name: "", price: "" }] });
    };

    const handleRemoveService = (i) =>
        updateState({ services: (state.services || []).filter((_, idx) => idx !== i) });

    // Reviews
    const handleReviewChange = (i, field, value) => {
        const next = [...(state.reviews || [])];
        if (field === "rating") {
            const n = parseInt(value, 10);
            next[i] = {
                ...(next[i] || {}),
                rating: Number.isFinite(n) ? Math.min(5, Math.max(1, n)) : "",
            };
        } else {
            next[i] = { ...(next[i] || {}), [field]: value };
        }
        updateState({ reviews: next });
    };

    const handleAddReview = () => {
        if (!isSubscribed && reviewsCount >= FREE_MAX) return openUpgrade("reviews");
        updateState({ reviews: [...(state.reviews || []), { name: "", text: "", rating: 5 }] });
    };

    const handleRemoveReview = (i) =>
        updateState({ reviews: (state.reviews || []).filter((_, idx) => idx !== i) });

    // Prefer preview fields first
    const coverSrc =
        state.coverPhotoPreview ||
        (isBlobUrl(state.coverPhoto) ? "" : state.coverPhoto) ||
        previewPlaceholders.coverPhoto;

    const avatarSrc = state.avatarPreview || (isBlobUrl(state.avatar) ? "" : state.avatar) || "";

    const sectionToggle = (isShown, setter) => setter?.(!isShown);

    // Work add click handler (locks on free at 6)
    const handleWorkAddClick = () => {
        if (!isSubscribed && worksCount >= FREE_MAX) return openUpgrade("work");
        workImageInputRef.current?.click();
    };

    const handleWorkFilesSelected = (e) => {
        const files = Array.from(e.target.files || []).filter((f) => f && f.type.startsWith("image/"));
        if (!files.length) return;

        // free cap: only allow up to remaining slots
        if (!isSubscribed) {
            const remaining = Math.max(0, FREE_MAX - worksCount);
            if (remaining <= 0) {
                e.target.value = "";
                return openUpgrade("work");
            }
            const trimmed = files.slice(0, remaining);
            onAddWorkImages?.(trimmed);
            e.target.value = "";
            return;
        }

        // subscribed cap: up to 12 total (UI cap)
        const remaining = Math.max(0, PRO_MAX - worksCount);
        const trimmed = files.slice(0, remaining);
        if (!trimmed.length) {
            e.target.value = "";
            return;
        }
        onAddWorkImages?.(trimmed);
        e.target.value = "";
    };

    const capLine = (type) => {
        if (isSubscribed) return `Plus: up to ${PRO_MAX}.`;
        if (type === "work") return `Free plan: up to ${FREE_MAX} images. Upgrade for ${PRO_MAX}.`;
        if (type === "services") return `Free plan: up to ${FREE_MAX} services. Upgrade for ${PRO_MAX}.`;
        if (type === "reviews") return `Free plan: up to ${FREE_MAX} reviews. Upgrade for ${PRO_MAX}.`;
        return `Free plan limits apply.`;
    };

    return (
        <div className="kce-root">
            {/* Header */}
            <div className="kce-top">
                <div className="kce-topLeft">
                    <div className="kc-title kce-title">Edit Your Profile</div>
                    <div className="body kce-sub">Choose one to edit or share.</div>
                </div>

                <div className="kce-topRight">
                    <button type="button" className="kce-btn kce-btnGhost" onClick={onResetPage}>
                        Reset
                    </button>
                    <button type="button" className="kce-btn kce-btnPrimary" onClick={onSubmit}>
                        Save Profile
                    </button>
                </div>
            </div>

            {/* 24px gap below divider */}
            <div className="kce-spacer24" />

            {/* ✅ Upgrade modal */}
            {upgradeOpen ? (
                <div className="kce-modalOverlay" role="dialog" aria-modal="true" aria-label="Upgrade to Plus">
                    <div className="kce-modal" onClick={(e) => e.stopPropagation()}>
                        <button type="button" className="kce-modalClose" onClick={closeUpgrade} aria-label="Close">
                            ✕
                        </button>

                        <div className="kce-modalTitle">Upgrade to Plus</div>
                        <div className="kce-modalText">
                            Unlock all features:
                            <ul className="kce-modalList">
                                <li>All templates</li>
                                <li>Detailed analytics</li>
                                <li>Upload 2× more images</li>
                                <li>More reviews and services</li>
                            </ul>
                        </div>

                        <div className="kce-modalActions">
                            <button
                                type="button"
                                className="kce-btn kce-btnPrimary"
                                onClick={() => {
                                    closeUpgrade();
                                    onStartSubscription?.();
                                }}
                            >
                                Upgrade to Plus
                            </button>

                            <button type="button" className="kce-btn kce-btnGhost" onClick={closeUpgrade}>
                                Not now
                            </button>
                        </div>

                        <div className="kce-modalFoot">
                            {upgradeContext === "templates" ? "This template is a Plus feature." : "This action is a Plus feature."}
                        </div>
                    </div>

                    <button type="button" className="kce-modalBackdrop" onClick={closeUpgrade} aria-label="Close modal" />
                </div>
            ) : null}

            {/* Scroll body */}
            <div className="kce-scroll">
                {/* TEMPLATES */}
                <div className="kce-section">
                    <div className="kce-sectionTop">
                        <span className="kce-pill">Templates</span>
                    </div>

                    <div className="kce-sectionBody">
                        <div className="kce-helpTitle">Choose a template</div>
                        <div className="body kce-helpSub">
                            Templates control the design (fonts, colors, layout). You only add your content.
                        </div>

                        <div className="kce-templatePhones" role="tablist" aria-label="Template selector">
                            {TEMPLATE_IDS.map((t) => {
                                const locked = isTemplateLocked(t);
                                const active = currentTemplate === t;

                                return (
                                    <button
                                        key={t}
                                        type="button"
                                        className={`kce-phoneCard ${active ? "is-active" : ""} ${locked ? "is-locked" : ""}`}
                                        onClick={() => handleTemplateSelect(t)}
                                        title={locked ? "Upgrade to unlock this template" : "Select template"}
                                        aria-label={locked ? `${t} locked` : t}
                                        role="tab"
                                        aria-selected={active}
                                    >
                                        <img
                                            src={templateThumbs[t]}
                                            alt=""
                                            className="kce-phoneImg"
                                            draggable={false}
                                            loading="lazy"
                                            decoding="async"
                                        />

                                        {/* ✅ premium badge icon on templates 2–5 for free plan */}
                                        {locked ? (
                                            <span className="kce-premiumBadge" aria-hidden="true">
                                                <img src={UpgradePlanIcon} alt="" />
                                            </span>
                                        ) : null}
                                    </button>
                                );
                            })}
                        </div>

                        {!isSubscribed ? (
                            <div className="kce-note">
                                Free users can use <strong>Template 1</strong>. Upgrade to unlock Templates 2–5.
                            </div>
                        ) : null}
                    </div>
                </div>

                <div className="kce-dividerBlock" />

                {/* MAIN */}
                <div className="kce-section">
                    <div className="kce-sectionTop">
                        <span className="kce-pill">Main Section</span>

                        <button
                            type="button"
                            className="kce-hideBtn"
                            onClick={() => sectionToggle(!!showMainSection, setShowMainSection)}
                        >
                            {showMainSection ? "Hide section" : "Show section"}
                        </button>
                    </div>

                    {showMainSection ? (
                        <div className="kce-sectionBody">
                            <div className="kce-field">
                                <div className="kce-label">Cover Photo</div>

                                <input
                                    ref={coverInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        onCoverUpload?.(file);
                                        e.target.value = "";
                                    }}
                                    style={{ display: "none" }}
                                />

                                <div className="kce-mediaRow">
                                    <button
                                        type="button"
                                        className="kce-upload kce-uploadHalf"
                                        onClick={() => coverInputRef.current?.click()}
                                    >
                                        {coverSrc ? (
                                            <img src={coverSrc} alt="Cover" className="kce-uploadImg" />
                                        ) : (
                                            <div className="kce-uploadInner">
                                                <div className="kce-plus">+</div>
                                                <div className="kce-uploadText">Upload Cover Image</div>
                                            </div>
                                        )}

                                        {coverSrc ? (
                                            <span
                                                className="kce-x"
                                                role="button"
                                                aria-label="Remove cover"
                                                onClick={(ev) => {
                                                    ev.preventDefault();
                                                    ev.stopPropagation();
                                                    onRemoveCover?.();
                                                }}
                                            >
                                                ✕
                                            </span>
                                        ) : null}
                                    </button>
                                </div>
                            </div>

                            <div className="kce-grid2">
                                <div className="kce-field">
                                    <div className="kce-label">Main heading</div>
                                    <input
                                        className="kce-input"
                                        value={state.mainHeading || ""}
                                        onChange={(e) => updateState({ mainHeading: e.target.value })}
                                        placeholder={previewPlaceholders.main_heading}
                                    />
                                </div>

                                <div className="kce-field">
                                    <div className="kce-label">Subheading</div>
                                    <input
                                        className="kce-input"
                                        value={state.subHeading || ""}
                                        onChange={(e) => updateState({ subHeading: e.target.value })}
                                        placeholder={previewPlaceholders.sub_heading}
                                    />
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>

                <div className="kce-dividerBlock" />

                {/* ABOUT */}
                <div className="kce-section">
                    <div className="kce-sectionTop">
                        <span className="kce-pill">About Me Section</span>

                        <button
                            type="button"
                            className="kce-hideBtn"
                            onClick={() => sectionToggle(!!showAboutMeSection, setShowAboutMeSection)}
                        >
                            {showAboutMeSection ? "Hide section" : "Show section"}
                        </button>
                    </div>

                    {showAboutMeSection ? (
                        <div className="kce-sectionBody">
                            <div className="kce-field">
                                <div className="kce-label">Profile Photo / Logo</div>

                                <input
                                    ref={avatarInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        onAvatarUpload?.(file);
                                        e.target.value = "";
                                    }}
                                    style={{ display: "none" }}
                                />

                                <div className="kce-mediaRow">
                                    <button
                                        type="button"
                                        className="kce-upload kce-uploadHalf"
                                        onClick={() => avatarInputRef.current?.click()}
                                    >
                                        {avatarSrc ? (
                                            <img src={avatarSrc} alt="Avatar" className="kce-uploadImg" />
                                        ) : (
                                            <div className="kce-uploadInner">
                                                <div className="kce-plus">+</div>
                                                <div className="kce-uploadText">Upload Profile Photo / Logo</div>
                                            </div>
                                        )}

                                        {avatarSrc ? (
                                            <span
                                                className="kce-x"
                                                role="button"
                                                aria-label="Remove avatar"
                                                onClick={(ev) => {
                                                    ev.preventDefault();
                                                    ev.stopPropagation();
                                                    onRemoveAvatar?.();
                                                }}
                                            >
                                                ✕
                                            </span>
                                        ) : null}
                                    </button>
                                </div>
                            </div>

                            <div className="kce-grid2">
                                <div className="kce-field">
                                    <div className="kce-label">Full name</div>
                                    <input
                                        className="kce-input"
                                        value={state.full_name || ""}
                                        onChange={(e) => updateState({ full_name: e.target.value })}
                                        placeholder={previewPlaceholders.full_name}
                                    />
                                </div>

                                <div className="kce-field">
                                    <div className="kce-label">Job title</div>
                                    <input
                                        className="kce-input"
                                        value={state.job_title || ""}
                                        onChange={(e) => updateState({ job_title: e.target.value })}
                                        placeholder={previewPlaceholders.job_title}
                                    />
                                </div>
                            </div>

                            <div className="kce-field">
                                <div className="kce-label">Bio</div>
                                <textarea
                                    className="kce-input kce-textarea"
                                    rows={5}
                                    value={state.bio || ""}
                                    onChange={(e) => updateState({ bio: e.target.value })}
                                    placeholder={previewPlaceholders.bio}
                                />
                            </div>
                        </div>
                    ) : null}
                </div>

                <div className="kce-dividerBlock" />

                {/* WORK */}
                <div className="kce-section">
                    <div className="kce-sectionTop">
                        <span className="kce-pill">My Work Section</span>

                        <button
                            type="button"
                            className="kce-hideBtn"
                            onClick={() => sectionToggle(!!showWorkSection, setShowWorkSection)}
                        >
                            {showWorkSection ? "Hide section" : "Show section"}
                        </button>
                    </div>

                    {showWorkSection ? (
                        <div className="kce-sectionBody">
                            <div className="kce-capNote">{capLine("work")}</div>

                            <div className="kce-workGrid">
                                {(state.workImages || []).slice(0, maxWorks).map((item, i) => (
                                    <div key={i} className="kce-workItem">
                                        <img src={item?.preview || item} alt={`work-${i}`} />
                                        <button
                                            type="button"
                                            className="kce-workX"
                                            onClick={() => onRemoveWorkImage?.(i)}
                                            aria-label="Remove image"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}

                                {/* ✅ add card always shown, but locked if free+cap */}
                                <button type="button" className="kce-upload kce-workAdd" onClick={handleWorkAddClick}>
                                    <div className="kce-uploadInner">
                                        <div className="kce-plus">+</div>
                                        <div className="kce-uploadText">Upload Work Images</div>
                                    </div>

                                    {!isSubscribed && worksCount >= FREE_MAX ? (
                                        <span className="kce-premiumBadge" aria-hidden="true">
                                            <img src={UpgradePlanIcon} alt="" />
                                        </span>
                                    ) : null}
                                </button>
                            </div>

                            <input
                                ref={workImageInputRef}
                                type="file"
                                multiple
                                accept="image/*"
                                style={{ display: "none" }}
                                onChange={handleWorkFilesSelected}
                            />
                        </div>
                    ) : null}
                </div>

                <div className="kce-dividerBlock" />

                {/* SERVICES */}
                <div className="kce-section">
                    <div className="kce-sectionTop">
                        <span className="kce-pill">My Services Section</span>

                        <button
                            type="button"
                            className="kce-hideBtn"
                            onClick={() => sectionToggle(!!showServicesSection, setShowServicesSection)}
                        >
                            {showServicesSection ? "Hide section" : "Show section"}
                        </button>
                    </div>

                    {showServicesSection ? (
                        <div className="kce-sectionBody">
                            <div className="kce-capNote">{capLine("services")}</div>

                            <div className="kce-repeat">
                                {(state.services || []).slice(0, maxServices).map((s, i) => (
                                    <div key={i} className="kce-repeatCard">
                                        <div className="kce-grid2">
                                            <div className="kce-field">
                                                <div className="kce-label">Service Name</div>
                                                <input
                                                    className="kce-input"
                                                    placeholder="Enter service"
                                                    value={s.name || ""}
                                                    onChange={(e) => handleServiceChange(i, "name", e.target.value)}
                                                />
                                            </div>

                                            <div className="kce-field">
                                                <div className="kce-label">Price / detail</div>
                                                <input
                                                    className="kce-input"
                                                    placeholder="£ / from £ / call for quote"
                                                    value={s.price || ""}
                                                    onChange={(e) => handleServiceChange(i, "price", e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <button type="button" className="kce-dangerPill" onClick={() => handleRemoveService(i)}>
                                            Remove Service
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <button type="button" className="kce-addCard" onClick={handleAddService}>
                                <span className="kce-addCardPlus">+</span>
                                <span className="kce-addCardText">Add Service</span>

                                {!isSubscribed && servicesCount >= FREE_MAX ? (
                                    <span className="kce-premiumBadge" aria-hidden="true">
                                        <img src={UpgradePlanIcon} alt="" />
                                    </span>
                                ) : null}
                            </button>
                        </div>
                    ) : null}
                </div>

                <div className="kce-dividerBlock" />

                {/* REVIEWS */}
                <div className="kce-section">
                    <div className="kce-sectionTop">
                        <span className="kce-pill">Reviews Section</span>

                        <button
                            type="button"
                            className="kce-hideBtn"
                            onClick={() => sectionToggle(!!showReviewsSection, setShowReviewsSection)}
                        >
                            {showReviewsSection ? "Hide section" : "Show section"}
                        </button>
                    </div>

                    {showReviewsSection ? (
                        <div className="kce-sectionBody">
                            <div className="kce-capNote">{capLine("reviews")}</div>

                            <div className="kce-repeat">
                                {(state.reviews || []).slice(0, maxReviews).map((r, i) => (
                                    <div key={i} className="kce-repeatCard">
                                        <div className="kce-grid2">
                                            <div className="kce-field">
                                                <div className="kce-label">Name</div>
                                                <input
                                                    className="kce-input"
                                                    placeholder="Enter name"
                                                    value={r.name || ""}
                                                    onChange={(e) => handleReviewChange(i, "name", e.target.value)}
                                                />
                                            </div>

                                            <div className="kce-field">
                                                <div className="kce-label">Rating (1–5)</div>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="5"
                                                    className="kce-input"
                                                    placeholder="5"
                                                    value={r.rating || ""}
                                                    onChange={(e) => handleReviewChange(i, "rating", e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="kce-field">
                                            <div className="kce-label">Review</div>
                                            <textarea
                                                className="kce-input kce-textarea"
                                                rows={3}
                                                placeholder="Write the review…"
                                                value={r.text || ""}
                                                onChange={(e) => handleReviewChange(i, "text", e.target.value)}
                                            />
                                        </div>

                                        <button type="button" className="kce-dangerPill" onClick={() => handleRemoveReview(i)}>
                                            Remove Review
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <button type="button" className="kce-addCard" onClick={handleAddReview}>
                                <span className="kce-addCardPlus">+</span>
                                <span className="kce-addCardText">Add Review</span>

                                {!isSubscribed && reviewsCount >= FREE_MAX ? (
                                    <span className="kce-premiumBadge" aria-hidden="true">
                                        <img src={UpgradePlanIcon} alt="" />
                                    </span>
                                ) : null}
                            </button>
                        </div>
                    ) : null}
                </div>

                <div className="kce-dividerBlock" />

                {/* CONTACT */}
                <div className="kce-section">
                    <div className="kce-sectionTop">
                        <span className="kce-pill">Contact Section</span>

                        <button
                            type="button"
                            className="kce-hideBtn"
                            onClick={() => sectionToggle(!!showContactSection, setShowContactSection)}
                        >
                            {showContactSection ? "Hide section" : "Show section"}
                        </button>
                    </div>

                    {showContactSection ? (
                        <div className="kce-sectionBody">
                            <div className="kce-grid2">
                                <div className="kce-field">
                                    <div className="kce-label">Email</div>
                                    <input
                                        type="email"
                                        className="kce-input"
                                        value={state.contact_email || ""}
                                        onChange={(e) => updateState({ contact_email: e.target.value })}
                                        placeholder={previewPlaceholders.contact_email}
                                    />
                                </div>

                                <div className="kce-field">
                                    <div className="kce-label">Phone Number</div>
                                    <input
                                        type="tel"
                                        inputMode="tel"
                                        autoComplete="tel"
                                        className="kce-input"
                                        value={state.phone_number || ""}
                                        onChange={(e) => updateState({ phone_number: e.target.value })}
                                        placeholder={previewPlaceholders.phone_number}
                                    />
                                </div>
                            </div>

                            <div className="kce-label kce-mt12">Social Links</div>

                            <div className="kce-social">
                                <div className="kce-socialRow">
                                    <img src={FacebookIcon} alt="" />
                                    <input
                                        className="kce-input"
                                        placeholder="Facebook URL"
                                        value={state.facebook_url || ""}
                                        onChange={(e) => updateState({ facebook_url: e.target.value })}
                                    />
                                </div>

                                <div className="kce-socialRow">
                                    <img src={InstagramIcon} alt="" />
                                    <input
                                        className="kce-input"
                                        placeholder="Instagram URL"
                                        value={state.instagram_url || ""}
                                        onChange={(e) => updateState({ instagram_url: e.target.value })}
                                    />
                                </div>

                                <div className="kce-socialRow">
                                    <img src={LinkedInIcon} alt="" />
                                    <input
                                        className="kce-input"
                                        placeholder="LinkedIn URL"
                                        value={state.linkedin_url || ""}
                                        onChange={(e) => updateState({ linkedin_url: e.target.value })}
                                    />
                                </div>

                                <div className="kce-socialRow">
                                    <img src={XIcon} alt="" />
                                    <input
                                        className="kce-input"
                                        placeholder="X URL"
                                        value={state.x_url || ""}
                                        onChange={(e) => updateState({ x_url: e.target.value })}
                                    />
                                </div>

                                <div className="kce-socialRow">
                                    <img src={TikTokIcon} alt="" />
                                    <input
                                        className="kce-input"
                                        placeholder="TikTok URL"
                                        value={state.tiktok_url || ""}
                                        onChange={(e) => updateState({ tiktok_url: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>

                <div className="kce-bottomPad" />
            </div>
        </div>
    );
}