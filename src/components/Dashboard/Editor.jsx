// frontend/src/components/Dashboard/Editor.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { previewPlaceholders } from "../../store/businessCardStore";

/* Social icons */
import FacebookIcon from "../../assets/icons/icons8-facebook.svg";
import InstagramIcon from "../../assets/icons/icons8-instagram.svg";
import LinkedInIcon from "../../assets/icons/icons8-linkedin.svg";
import XIcon from "../../assets/icons/icons8-x.svg";
import TikTokIcon from "../../assets/icons/icons8-tiktok.svg";

import "../../styling/dashboard/editor.css";

const isBlobUrl = (v) => typeof v === "string" && v.startsWith("blob:");

function SectionHeader({ pill, title, subtitle, open, onToggle }) {
    return (
        <button
            type="button"
            className="kc-sec-toggle"
            onClick={onToggle}
            aria-expanded={open}
        >
            <span className="kc-sec-pill">{pill}</span>

            <span className="kc-sec-titlewrap">
                <span className="kc-sec-title">{title}</span>
                {subtitle ? <span className="kc-sec-sub">{subtitle}</span> : null}
            </span>

            <span className={`kc-sec-chevron ${open ? "open" : ""}`} aria-hidden="true">
                ▾
            </span>
        </button>
    );
}

/** Divider + 24px spacing top/bottom between sections */
function SectionDivider() {
    return <div className="kc-editor-divider" aria-hidden="true" />;
}

export default function Editor({
    state,
    updateState,

    isSubscribed,
    hasTrialEnded, // legacy ignored

    onStartSubscription,
    onResetPage,
    onSubmit,

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

    // ✅ local object URL cleanup
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

    // ✅ collapse sections on first load
    const didInitRef = useRef(false);
    useEffect(() => {
        if (didInitRef.current) return;
        didInitRef.current = true;

        setShowMainSection?.(false);
        setShowAboutMeSection?.(false);
        setShowWorkSection?.(false);
        setShowServicesSection?.(false);
        setShowReviewsSection?.(false);
        setShowContactSection?.(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Templates
    const TEMPLATE_IDS = useMemo(
        () => ["template-1", "template-2", "template-3", "template-4", "template-5"],
        []
    );

    const currentTemplate = (state.templateId || "template-1").toString();
    const isTemplateLocked = (templateId) => !isSubscribed && templateId !== "template-1";

    const handleTemplateSelect = (id) => {
        if (isTemplateLocked(id)) {
            onStartSubscription?.();
            return;
        }
        updateState({ templateId: id });
    };

    const [openTemplates, setOpenTemplates] = useState(true);

    // Services
    const handleServiceChange = (i, field, value) => {
        const next = [...(state.services || [])];
        next[i] = { ...(next[i] || {}), [field]: value };
        updateState({ services: next });
    };

    const handleAddService = () =>
        updateState({ services: [...(state.services || []), { name: "", price: "" }] });

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

    const handleAddReview = () =>
        updateState({ reviews: [...(state.reviews || []), { name: "", text: "", rating: 5 }] });

    const handleRemoveReview = (i) =>
        updateState({ reviews: (state.reviews || []).filter((_, idx) => idx !== i) });

    // Prefer explicit preview fields, then persisted URLs
    const coverSrc =
        state.coverPhotoPreview ||
        (isBlobUrl(state.coverPhoto) ? "" : state.coverPhoto) ||
        previewPlaceholders.coverPhoto;

    const avatarSrc = state.avatarPreview || (isBlobUrl(state.avatar) ? "" : state.avatar) || "";

    return (
        <div className="kc-editor-scope">
            {/* Sticky header */}
            <div className="kc-editor-top">
                <div className="kc-editor-topLeft">
                    <div className="kc-editor-title kc-title">Edit Your Profile</div>
                    <div className="kc-editor-sub body">Choose one to edit or share.</div>
                </div>

                <div className="kc-editor-topActions">
                    <button type="button" className="kc-btn kc-btn-ghost" onClick={onResetPage}>
                        Reset
                    </button>
                    <button type="button" className="kc-btn kc-btn-primary" onClick={onSubmit}>
                        Save Profile
                    </button>
                </div>
            </div>

            {/* ✅ 24px gap after header divider */}
            <div className="kc-editor-scroll">
                <form onSubmit={onSubmit} className="kc-editor-card">
                    {/* TEMPLATES */}
                    <div className="kc-section">
                        <SectionHeader
                            pill="Templates"
                            title="Choose a template"
                            subtitle="Templates control the design (fonts, colors, layout). You only add your content."
                            open={openTemplates}
                            onToggle={() => setOpenTemplates((s) => !s)}
                        />

                        {openTemplates ? (
                            <div className="kc-section-body">
                                <div className="kc-template-row" role="tablist" aria-label="Template selector">
                                    {TEMPLATE_IDS.map((t) => {
                                        const locked = isTemplateLocked(t);
                                        const active = currentTemplate === t;
                                        return (
                                            <button
                                                key={t}
                                                type="button"
                                                className={`kc-template-chip ${active ? "active" : ""} ${locked ? "locked" : ""
                                                    }`}
                                                onClick={() => handleTemplateSelect(t)}
                                                title={locked ? "Upgrade to unlock this template" : "Select template"}
                                                aria-label={locked ? `${t} locked` : t}
                                                role="tab"
                                                aria-selected={active}
                                            >
                                                <span className="kc-template-chip-label">
                                                    {t.replace("-", " ").toUpperCase()}
                                                </span>
                                                {locked ? <span className="kc-lock" aria-hidden="true">🔒</span> : null}
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
                    </div>

                    <SectionDivider />

                    {/* MAIN */}
                    <div className="kc-section">
                        <SectionHeader
                            pill="Main Section"
                            title="Main section"
                            subtitle="Cover image + headings"
                            open={showMainSection}
                            onToggle={() => setShowMainSection(!showMainSection)}
                        />

                        {showMainSection ? (
                            <div className="kc-section-body">
                                <div className="kc-block">
                                    <div className="kc-block-title">Cover Photo</div>

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

                                    <button
                                        type="button"
                                        className="kc-upload"
                                        onClick={() => coverInputRef.current?.click()}
                                    >
                                        {coverSrc ? (
                                            <img src={coverSrc} alt="Cover" className="kc-upload-img" />
                                        ) : (
                                            <span className="kc-upload-text">+ Upload Cover Image</span>
                                        )}

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

                                    {isBlobUrl(state.coverPhotoPreview) && !state.coverPhoto ? (
                                        <div className="kc-help">This image is previewing locally — save to publish it.</div>
                                    ) : null}
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
                            </div>
                        ) : null}
                    </div>

                    <SectionDivider />

                    {/* ABOUT */}
                    <div className="kc-section">
                        <SectionHeader
                            pill="About Me Section"
                            title="About me"
                            subtitle="Avatar + name + job + bio"
                            open={showAboutMeSection}
                            onToggle={() => setShowAboutMeSection(!showAboutMeSection)}
                        />

                        {showAboutMeSection ? (
                            <div className="kc-section-body">
                                <div className="kc-block">
                                    <div className="kc-block-title">Profile Photo / Logo</div>

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

                                    <button
                                        type="button"
                                        className="kc-upload kc-upload-square"
                                        onClick={() => avatarInputRef.current?.click()}
                                    >
                                        {avatarSrc ? (
                                            <img src={avatarSrc} alt="Avatar" className="kc-upload-img" />
                                        ) : (
                                            <span className="kc-upload-text">+ Upload Profile Photo / Logo</span>
                                        )}

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

                                    {isBlobUrl(state.avatarPreview) && !state.avatar ? (
                                        <div className="kc-help">This image is previewing locally — save to publish it.</div>
                                    ) : null}
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
                            </div>
                        ) : null}
                    </div>

                    <SectionDivider />

                    {/* WORK */}
                    <div className="kc-section">
                        <SectionHeader
                            pill="Work Section"
                            title="My work"
                            subtitle="Upload up to 10 images"
                            open={showWorkSection}
                            onToggle={() => setShowWorkSection(!showWorkSection)}
                        />

                        {showWorkSection ? (
                            <div className="kc-section-body">
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
                                        <button
                                            type="button"
                                            className="kc-work-add"
                                            onClick={() => workImageInputRef.current?.click()}
                                        >
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
                                        const files = Array.from(e.target.files || []).filter(
                                            (f) => f && f.type.startsWith("image/")
                                        );
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
                            </div>
                        ) : null}
                    </div>

                    <SectionDivider />

                    {/* SERVICES */}
                    <div className="kc-section">
                        <SectionHeader
                            pill="Services Section"
                            title="My services"
                            subtitle="Add services & pricing"
                            open={showServicesSection}
                            onToggle={() => setShowServicesSection(!showServicesSection)}
                        />

                        {showServicesSection ? (
                            <div className="kc-section-body">
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
                                                <button
                                                    type="button"
                                                    className="kc-btn kc-btn-danger"
                                                    onClick={() => handleRemoveService(i)}
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    className="kc-btn kc-btn-ghost kc-btn-wide"
                                    onClick={handleAddService}
                                >
                                    + Add service
                                </button>
                            </div>
                        ) : null}
                    </div>

                    <SectionDivider />

                    {/* REVIEWS */}
                    <div className="kc-section">
                        <SectionHeader
                            pill="Reviews Section"
                            title="Reviews"
                            subtitle="Show social proof"
                            open={showReviewsSection}
                            onToggle={() => setShowReviewsSection(!showReviewsSection)}
                        />

                        {showReviewsSection ? (
                            <div className="kc-section-body">
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
                                                <button
                                                    type="button"
                                                    className="kc-btn kc-btn-danger"
                                                    onClick={() => handleRemoveReview(i)}
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    className="kc-btn kc-btn-ghost kc-btn-wide"
                                    onClick={handleAddReview}
                                >
                                    + Add review
                                </button>
                            </div>
                        ) : null}
                    </div>

                    <SectionDivider />

                    {/* CONTACT */}
                    <div className="kc-section">
                        <SectionHeader
                            pill="Contact Section"
                            title="Contact"
                            subtitle="Email, phone & socials"
                            open={showContactSection}
                            onToggle={() => setShowContactSection(!showContactSection)}
                        />

                        {showContactSection ? (
                            <div className="kc-section-body">
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

                                <div className="kc-block">
                                    <div className="kc-block-title">Social links</div>

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
                            </div>
                        ) : null}
                    </div>

                    {/* small breathing room */}
                    <div style={{ height: 8 }} />
                </form>
            </div>
        </div>
    );
}