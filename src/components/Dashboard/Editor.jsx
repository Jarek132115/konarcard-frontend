import React, { useRef, useEffect, useMemo, useState } from "react";
import { previewPlaceholders } from "../../store/businessCardStore";

/* Social icons */
import FacebookIcon from "../../assets/icons/icons8-facebook.svg";
import InstagramIcon from "../../assets/icons/icons8-instagram.svg";
import LinkedInIcon from "../../assets/icons/icons8-linkedin.svg";
import XIcon from "../../assets/icons/icons8-x.svg";
import TikTokIcon from "../../assets/icons/icons8-tiktok.svg";

import "../../styling/dashboard/editor.css";

const isBlobUrl = (v) => typeof v === "string" && v.startsWith("blob:");

function AccordionHeader({ title, subtitle, pillText, open, onToggle }) {
    return (
        <button type="button" className="kc-acc-btn" onClick={onToggle} aria-expanded={open}>
            <div className="kc-acc-left">
                {pillText ? <span className="kc-sec-pill">{pillText}</span> : null}
                <div className="kc-acc-txt">
                    <div className="kc-acc-title">{title}</div>
                    {subtitle ? <div className="kc-acc-sub">{subtitle}</div> : null}
                </div>
            </div>

            <span className={`kc-acc-chev ${open ? "open" : ""}`} aria-hidden="true">
                ▾
            </span>
        </button>
    );
}

export default function Editor({
    state,
    updateState,

    isSubscribed,
    hasTrialEnded, // legacy ignored

    onStartSubscription,
    onResetPage,
    onSubmit,

    // preview toggles (keep)
    showMainSection,
    setShowMainSection,
    showAboutMeSection,
    setShowAboutMeSection,
    showWorkSection,
    setShowWorkSection,
    showServicesSection,
    setShowServicesSection,
    showReviewsSection,
    setShowReviewsSection,
    showContactSection,
    setShowContactSection,

    // legacy handlers
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

    // track object URLs so we can revoke (avoid memory leaks)
    const objectUrlsRef = useRef(new Set());
    const rememberObjectUrl = (url) => {
        if (typeof url === "string" && url.startsWith("blob:")) objectUrlsRef.current.add(url);
    };

    useEffect(() => {
        return () => {
            for (const url of objectUrlsRef.current) {
                try {
                    URL.revokeObjectURL(url);
                } catch { }
            }
            objectUrlsRef.current.clear();
        };
    }, []);

    // ✅ Accordion open state (collapsed by default)
    const [openTemplate, setOpenTemplate] = useState(true); // keep open by default
    const [openMain, setOpenMain] = useState(false);
    const [openAbout, setOpenAbout] = useState(false);
    const [openWork, setOpenWork] = useState(false);
    const [openServices, setOpenServices] = useState(false);
    const [openReviews, setOpenReviews] = useState(false);
    const [openContact, setOpenContact] = useState(false);

    // ---------------------------------------------------------
    // Templates
    // ---------------------------------------------------------
    const TEMPLATE_IDS = ["template-1", "template-2", "template-3", "template-4", "template-5"];
    const currentTemplate = (state.templateId || "template-1").toString();
    const isTemplateLocked = (templateId) => !isSubscribed && templateId !== "template-1";

    const handleTemplateSelect = (id) => {
        if (isTemplateLocked(id)) {
            onStartSubscription?.();
            return;
        }
        updateState({ templateId: id });
    };

    // ---------------------------------------------------------
    // Services
    // ---------------------------------------------------------
    const handleServiceChange = (i, field, value) => {
        const next = [...(state.services || [])];
        next[i] = { ...(next[i] || {}), [field]: value };
        updateState({ services: next });
    };
    const handleAddService = () => updateState({ services: [...(state.services || []), { name: "", price: "" }] });
    const handleRemoveService = (i) => updateState({ services: (state.services || []).filter((_, idx) => idx !== i) });

    // ---------------------------------------------------------
    // Reviews
    // ---------------------------------------------------------
    const handleReviewChange = (i, field, value) => {
        const next = [...(state.reviews || [])];
        if (field === "rating") {
            const n = parseInt(value, 10);
            next[i] = { ...(next[i] || {}), rating: Number.isFinite(n) ? Math.min(5, Math.max(1, n)) : "" };
        } else {
            next[i] = { ...(next[i] || {}), [field]: value };
        }
        updateState({ reviews: next });
    };
    const handleAddReview = () => updateState({ reviews: [...(state.reviews || []), { name: "", text: "", rating: 5 }] });
    const handleRemoveReview = (i) => updateState({ reviews: (state.reviews || []).filter((_, idx) => idx !== i) });

    // Prefer explicit preview fields, then persisted URLs
    const coverSrc = useMemo(() => {
        return (
            state.coverPhotoPreview ||
            (isBlobUrl(state.coverPhoto) ? "" : state.coverPhoto) ||
            previewPlaceholders.coverPhoto
        );
    }, [state.coverPhotoPreview, state.coverPhoto]);

    const avatarSrc = useMemo(() => {
        return state.avatarPreview || (isBlobUrl(state.avatar) ? "" : state.avatar) || "";
    }, [state.avatarPreview, state.avatar]);

    return (
        <div className="kc-editor-scope">
            {/* ✅ Fixed Header (non-scrolling) */}
            <div className="kc-editor-top">
                <div className="kc-editor-topRow">
                    <div className="kc-editor-topLeft">
                        <h2 className="kc-editor-h1">Edit Your Profile</h2>
                        <p className="kc-editor-h2">Choose one to edit or share.</p>
                    </div>

                    <div className="kc-editor-topActions">
                        <button type="button" className="kx-btn kx-btn--white" onClick={onResetPage}>
                            Reset
                        </button>
                        <button type="submit" form="kc-editor-form" className="kx-btn kx-btn--black">
                            Save Profile
                        </button>
                    </div>
                </div>
            </div>

            {/* ✅ Scroll area only */}
            <div className="kc-editor-scroll">
                <form id="kc-editor-form" onSubmit={onSubmit}>
                    {/* TEMPLATE */}
                    <AccordionHeader
                        pillText="Templates"
                        title="Choose a template"
                        subtitle="Templates control the design (fonts, colors, layout). You only add your content."
                        open={openTemplate}
                        onToggle={() => setOpenTemplate((v) => !v)}
                    />

                    {openTemplate ? (
                        <div className="kc-acc-body">
                            <div className="kc-template-row" role="tablist" aria-label="Template selector">
                                {TEMPLATE_IDS.map((t) => {
                                    const locked = isTemplateLocked(t);
                                    const active = currentTemplate === t;
                                    return (
                                        <button
                                            key={t}
                                            type="button"
                                            className={`kc-template-chip ${active ? "active" : ""} ${locked ? "locked" : ""}`}
                                            onClick={() => handleTemplateSelect(t)}
                                            title={locked ? "Upgrade to unlock this template" : "Select template"}
                                            aria-label={locked ? `${t} locked` : t}
                                            role="tab"
                                            aria-selected={active}
                                        >
                                            <span className="kc-template-chip-label">{t.replace("-", " ").toUpperCase()}</span>
                                            {locked ? <span aria-hidden="true">🔒</span> : null}
                                        </button>
                                    );
                                })}
                            </div>

                            {!isSubscribed ? (
                                <div className="kc-help">
                                    Free users can use <strong>TEMPLATE 1</strong>. Upgrade to unlock Templates 2–5.
                                </div>
                            ) : null}
                        </div>
                    ) : null}

                    {/* MAIN */}
                    <AccordionHeader
                        pillText="Main Section"
                        title="Main section"
                        subtitle="Cover image + headings"
                        open={openMain}
                        onToggle={() => setOpenMain((v) => !v)}
                    />

                    {openMain ? (
                        <div className="kc-acc-body">
                            <div className="kc-field">
                                <label className="kc-label">Cover photo</label>

                                <input
                                    ref={coverInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;

                                        const url = URL.createObjectURL(file);
                                        rememberObjectUrl(url);

                                        updateState({ coverPhotoPreview: url, coverPhotoFile: file });
                                        onCoverUpload?.(file);
                                    }}
                                    style={{ display: "none" }}
                                />

                                <button type="button" className="kc-upload" onClick={() => coverInputRef.current?.click()}>
                                    {coverSrc ? <img src={coverSrc} alt="Cover" className="kc-upload-img" /> : null}
                                    {!coverSrc ? <span className="kc-upload-text">+ Upload cover image</span> : null}

                                    {coverSrc ? (
                                        <span
                                            className="kc-upload-x"
                                            role="button"
                                            aria-label="Remove cover"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                updateState({ coverPhotoPreview: "", coverPhotoFile: null });
                                                onRemoveCover?.();
                                            }}
                                        >
                                            ✕
                                        </span>
                                    ) : null}
                                </button>
                            </div>

                            <div className="kc-grid-2">
                                <div className="kc-field">
                                    <label className="kc-label">Main heading</label>
                                    <input
                                        className="kc-input"
                                        value={state.mainHeading || ""}
                                        onChange={(e) => updateState({ mainHeading: e.target.value })}
                                        placeholder={previewPlaceholders.main_heading}
                                    />
                                </div>

                                <div className="kc-field">
                                    <label className="kc-label">Subheading</label>
                                    <input
                                        className="kc-input"
                                        value={state.subHeading || ""}
                                        onChange={(e) => updateState({ subHeading: e.target.value })}
                                        placeholder={previewPlaceholders.sub_heading}
                                    />
                                </div>
                            </div>

                            {/* (Optional) show/hide in preview */}
                            <button
                                type="button"
                                className="kx-btn kx-btn--white"
                                onClick={() => setShowMainSection?.(!showMainSection)}
                            >
                                {showMainSection ? "Hide section on profile" : "Show section on profile"}
                            </button>
                        </div>
                    ) : null}

                    {/* ABOUT */}
                    <AccordionHeader
                        pillText="About Me Section"
                        title="About me"
                        subtitle="Avatar + name + job + bio"
                        open={openAbout}
                        onToggle={() => setOpenAbout((v) => !v)}
                    />

                    {openAbout ? (
                        <div className="kc-acc-body">
                            <div className="kc-field">
                                <label className="kc-label">Profile photo / logo</label>

                                <input
                                    ref={avatarInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;

                                        const url = URL.createObjectURL(file);
                                        rememberObjectUrl(url);

                                        updateState({ avatarPreview: url, avatarFile: file });
                                        onAvatarUpload?.(file);
                                    }}
                                    style={{ display: "none" }}
                                />

                                <button type="button" className="kc-upload" onClick={() => avatarInputRef.current?.click()}>
                                    {avatarSrc ? <img src={avatarSrc} alt="Avatar" className="kc-upload-img" /> : null}
                                    {!avatarSrc ? <span className="kc-upload-text">+ Upload profile photo / logo</span> : null}

                                    {avatarSrc ? (
                                        <span
                                            className="kc-upload-x"
                                            role="button"
                                            aria-label="Remove avatar"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                updateState({ avatarPreview: "", avatarFile: null });
                                                onRemoveAvatar?.();
                                            }}
                                        >
                                            ✕
                                        </span>
                                    ) : null}
                                </button>
                            </div>

                            <div className="kc-grid-2">
                                <div className="kc-field">
                                    <label className="kc-label">Full name</label>
                                    <input
                                        className="kc-input"
                                        value={state.full_name || ""}
                                        onChange={(e) => updateState({ full_name: e.target.value })}
                                        placeholder={previewPlaceholders.full_name}
                                    />
                                </div>

                                <div className="kc-field">
                                    <label className="kc-label">Job title</label>
                                    <input
                                        className="kc-input"
                                        value={state.job_title || ""}
                                        onChange={(e) => updateState({ job_title: e.target.value })}
                                        placeholder={previewPlaceholders.job_title}
                                    />
                                </div>
                            </div>

                            <div className="kc-field">
                                <label className="kc-label">Bio</label>
                                <textarea
                                    className="kc-input kc-textarea"
                                    rows={4}
                                    value={state.bio || ""}
                                    onChange={(e) => updateState({ bio: e.target.value })}
                                    placeholder={previewPlaceholders.bio}
                                />
                            </div>

                            <button
                                type="button"
                                className="kx-btn kx-btn--white"
                                onClick={() => setShowAboutMeSection?.(!showAboutMeSection)}
                            >
                                {showAboutMeSection ? "Hide section on profile" : "Show section on profile"}
                            </button>
                        </div>
                    ) : null}

                    {/* WORK */}
                    <AccordionHeader
                        pillText="Work Section"
                        title="My work"
                        subtitle="Upload up to 10 images"
                        open={openWork}
                        onToggle={() => setOpenWork((v) => !v)}
                    />

                    {openWork ? (
                        <div className="kc-acc-body">
                            <div className="kc-work-grid">
                                {(state.workImages || []).map((item, i) => (
                                    <div key={i} className="kc-work-item">
                                        <img src={item?.preview || item} alt={`work-${i}`} />
                                        <button
                                            type="button"
                                            className="kc-work-x"
                                            onClick={() => onRemoveWorkImage?.(i)}
                                            aria-label="Remove image"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}

                                {(state.workImages || []).length < 10 ? (
                                    <button type="button" className="kc-work-add" onClick={() => workImageInputRef.current?.click()}>
                                        + Add image(s)
                                    </button>
                                ) : null}
                            </div>

                            <input
                                ref={workImageInputRef}
                                type="file"
                                multiple
                                accept="image/*"
                                style={{ display: "none" }}
                                onChange={(e) => {
                                    const files = Array.from(e.target.files || []).filter((f) => f && f.type.startsWith("image/"));
                                    if (!files.length) return;

                                    const items = files.map((file) => {
                                        const url = URL.createObjectURL(file);
                                        rememberObjectUrl(url);
                                        return { preview: url, file };
                                    });

                                    const existing = Array.isArray(state.workImages) ? state.workImages : [];
                                    updateState({ workImages: [...existing, ...items].slice(0, 10) });

                                    onAddWorkImages?.(files);
                                }}
                            />

                            <button
                                type="button"
                                className="kx-btn kx-btn--white"
                                onClick={() => setShowWorkSection?.(!showWorkSection)}
                            >
                                {showWorkSection ? "Hide section on profile" : "Show section on profile"}
                            </button>
                        </div>
                    ) : null}

                    {/* SERVICES */}
                    <AccordionHeader
                        pillText="Services Section"
                        title="My services"
                        subtitle="Add services & pricing"
                        open={openServices}
                        onToggle={() => setOpenServices((v) => !v)}
                    />

                    {openServices ? (
                        <div className="kc-acc-body">
                            <div className="kc-repeat">
                                {(state.services || []).map((s, i) => (
                                    <div key={i} className="kc-repeat-card">
                                        <div className="kc-grid-2">
                                            <div className="kc-field">
                                                <label className="kc-label">Service</label>
                                                <input
                                                    className="kc-input"
                                                    placeholder="Service name"
                                                    value={s.name || ""}
                                                    onChange={(e) => handleServiceChange(i, "name", e.target.value)}
                                                />
                                            </div>

                                            <div className="kc-field">
                                                <label className="kc-label">Price / detail</label>
                                                <input
                                                    className="kc-input"
                                                    placeholder="£50 / from £... / call for quote"
                                                    value={s.price || ""}
                                                    onChange={(e) => handleServiceChange(i, "price", e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="kc-row-right">
                                            <button type="button" className="kx-btn kx-btn--white" onClick={() => handleRemoveService(i)}>
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button type="button" className="kx-btn kx-btn--white" onClick={handleAddService}>
                                + Add service
                            </button>

                            <button
                                type="button"
                                className="kx-btn kx-btn--white"
                                onClick={() => setShowServicesSection?.(!showServicesSection)}
                            >
                                {showServicesSection ? "Hide section on profile" : "Show section on profile"}
                            </button>
                        </div>
                    ) : null}

                    {/* REVIEWS */}
                    <AccordionHeader
                        pillText="Reviews Section"
                        title="Reviews"
                        subtitle="Show social proof"
                        open={openReviews}
                        onToggle={() => setOpenReviews((v) => !v)}
                    />

                    {openReviews ? (
                        <div className="kc-acc-body">
                            <div className="kc-repeat">
                                {(state.reviews || []).map((r, i) => (
                                    <div key={i} className="kc-repeat-card">
                                        <div className="kc-grid-2">
                                            <div className="kc-field">
                                                <label className="kc-label">Name</label>
                                                <input
                                                    className="kc-input"
                                                    placeholder="Reviewer name"
                                                    value={r.name || ""}
                                                    onChange={(e) => handleReviewChange(i, "name", e.target.value)}
                                                />
                                            </div>

                                            <div className="kc-field">
                                                <label className="kc-label">Rating (1–5)</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="5"
                                                    className="kc-input"
                                                    placeholder="5"
                                                    value={r.rating || ""}
                                                    onChange={(e) => handleReviewChange(i, "rating", e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="kc-field">
                                            <label className="kc-label">Review</label>
                                            <textarea
                                                className="kc-input kc-textarea"
                                                rows={3}
                                                placeholder="Write the review…"
                                                value={r.text || ""}
                                                onChange={(e) => handleReviewChange(i, "text", e.target.value)}
                                            />
                                        </div>

                                        <div className="kc-row-right">
                                            <button type="button" className="kx-btn kx-btn--white" onClick={() => handleRemoveReview(i)}>
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button type="button" className="kx-btn kx-btn--white" onClick={handleAddReview}>
                                + Add review
                            </button>

                            <button
                                type="button"
                                className="kx-btn kx-btn--white"
                                onClick={() => setShowReviewsSection?.(!showReviewsSection)}
                            >
                                {showReviewsSection ? "Hide section on profile" : "Show section on profile"}
                            </button>
                        </div>
                    ) : null}

                    {/* CONTACT */}
                    <AccordionHeader
                        pillText="Contact Section"
                        title="Contact"
                        subtitle="Email, phone & socials"
                        open={openContact}
                        onToggle={() => setOpenContact((v) => !v)}
                    />

                    {openContact ? (
                        <div className="kc-acc-body">
                            <div className="kc-grid-2">
                                <div className="kc-field">
                                    <label className="kc-label">Email</label>
                                    <input
                                        type="email"
                                        className="kc-input"
                                        value={state.contact_email || ""}
                                        onChange={(e) => updateState({ contact_email: e.target.value })}
                                        placeholder={previewPlaceholders.contact_email}
                                    />
                                </div>

                                <div className="kc-field">
                                    <label className="kc-label">Phone</label>
                                    <input
                                        type="tel"
                                        inputMode="tel"
                                        autoComplete="tel"
                                        className="kc-input"
                                        value={state.phone_number || ""}
                                        onChange={(e) => updateState({ phone_number: e.target.value })}
                                        placeholder={previewPlaceholders.phone_number}
                                    />
                                </div>
                            </div>

                            <div className="kc-field">
                                <label className="kc-label">Social links</label>

                                <div className="kc-social">
                                    <div className="kc-social-row">
                                        <img src={FacebookIcon} alt="" />
                                        <input
                                            className="kc-input"
                                            placeholder="Facebook URL"
                                            value={state.facebook_url || ""}
                                            onChange={(e) => updateState({ facebook_url: e.target.value })}
                                        />
                                    </div>

                                    <div className="kc-social-row">
                                        <img src={InstagramIcon} alt="" />
                                        <input
                                            className="kc-input"
                                            placeholder="Instagram URL"
                                            value={state.instagram_url || ""}
                                            onChange={(e) => updateState({ instagram_url: e.target.value })}
                                        />
                                    </div>

                                    <div className="kc-social-row">
                                        <img src={LinkedInIcon} alt="" />
                                        <input
                                            className="kc-input"
                                            placeholder="LinkedIn URL"
                                            value={state.linkedin_url || ""}
                                            onChange={(e) => updateState({ linkedin_url: e.target.value })}
                                        />
                                    </div>

                                    <div className="kc-social-row">
                                        <img src={XIcon} alt="" />
                                        <input
                                            className="kc-input"
                                            placeholder="X (Twitter) URL"
                                            value={state.x_url || ""}
                                            onChange={(e) => updateState({ x_url: e.target.value })}
                                        />
                                    </div>

                                    <div className="kc-social-row">
                                        <img src={TikTokIcon} alt="" />
                                        <input
                                            className="kc-input"
                                            placeholder="TikTok URL"
                                            value={state.tiktok_url || ""}
                                            onChange={(e) => updateState({ tiktok_url: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="button"
                                className="kx-btn kx-btn--white"
                                onClick={() => setShowContactSection?.(!showContactSection)}
                            >
                                {showContactSection ? "Hide section on profile" : "Show section on profile"}
                            </button>
                        </div>
                    ) : null}

                    {/* Bottom actions (optional) */}
                    <div className="kc-bottom-actions">
                        <button type="button" className="kx-btn kx-btn--white" onClick={onResetPage}>
                            Reset
                        </button>
                        <button type="submit" className="kx-btn kx-btn--black">
                            Save Profile
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}