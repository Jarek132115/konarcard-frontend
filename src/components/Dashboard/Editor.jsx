// frontend/src/components/Dashboard/Editor.jsx
import React, { useEffect, useMemo, useRef } from "react";
import { previewPlaceholders } from "../../store/businessCardStore";

/* Social icons */
import FacebookIcon from "../../assets/icons/icons8-facebook.svg";
import InstagramIcon from "../../assets/icons/icons8-instagram.svg";
import LinkedInIcon from "../../assets/icons/icons8-linkedin.svg";
import XIcon from "../../assets/icons/icons8-x.svg";
import TikTokIcon from "../../assets/icons/icons8-tiktok.svg";

import "../../styling/dashboard/editor.css";

const isBlobUrl = (v) => typeof v === "string" && v.startsWith("blob:");

export default function Editor({
    state,
    updateState,

    isSubscribed,

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

    // local object URL cleanup
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

    // Prefer preview fields first
    const coverSrc =
        state.coverPhotoPreview ||
        (isBlobUrl(state.coverPhoto) ? "" : state.coverPhoto) ||
        previewPlaceholders.coverPhoto;

    const avatarSrc = state.avatarPreview || (isBlobUrl(state.avatar) ? "" : state.avatar) || "";

    const toggleOrKeepOpen = (setter, current) => {
        if (typeof setter === "function") setter(!current);
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

            <div className="kce-spacer24" />

            <div className="kce-scroll">
                {/* TEMPLATES */}
                <div className="kce-section">
                    <button type="button" className="kce-pillBar" aria-label="Templates">
                        Templates
                    </button>

                    <div className="kce-helpTitle">Choose a template</div>
                    <div className="body kce-helpSub">
                        Templates control the design (fonts, colors, layout). You only add your content.
                    </div>

                    <div className="kce-templateRow" role="tablist" aria-label="Template selector">
                        {TEMPLATE_IDS.map((t) => {
                            const locked = isTemplateLocked(t);
                            const active = currentTemplate === t;
                            return (
                                <button
                                    key={t}
                                    type="button"
                                    className={`kce-templateChip ${active ? "is-active" : ""} ${locked ? "is-locked" : ""
                                        }`}
                                    onClick={() => handleTemplateSelect(t)}
                                    title={locked ? "Upgrade to unlock this template" : "Select template"}
                                    aria-label={locked ? `${t} locked` : t}
                                    role="tab"
                                    aria-selected={active}
                                >
                                    {t.replace("-", " ").toUpperCase()}
                                </button>
                            );
                        })}
                    </div>

                    {!isSubscribed ? (
                        <div className="kce-note">
                            Free users can use <strong>TEMPLATE 1</strong>. Upgrade to unlock Templates 2–5.
                        </div>
                    ) : null}
                </div>

                <div className="kce-dividerBlock" />

                {/* MAIN */}
                {showMainSection !== false && (
                    <div className="kce-section">
                        <button
                            type="button"
                            className="kce-pillBar"
                            onClick={() => toggleOrKeepOpen(setShowMainSection, !!showMainSection)}
                            aria-label="Main Section"
                        >
                            Main Section
                        </button>

                        {/* ✅ NO inner white block — everything sits on the section's #fafafa surface */}
                        <div className="body kce-label">Cover Photo</div>

                        <div className="kce-mediaGrid">
                            <div>
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
                                    className="kce-upload kce-uploadCover"
                                    onClick={() => coverInputRef.current?.click()}
                                >
                                    {coverSrc ? (
                                        <img src={coverSrc} alt="Cover" className="kce-uploadImg" />
                                    ) : (
                                        <div className="kce-uploadInner">
                                            <div className="kce-plus">+</div>
                                            <div className="body kce-uploadText">Upload Cover Image</div>
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
                                                updateState({ coverPhotoPreview: "", coverPhotoFile: null });
                                                onRemoveCover?.();
                                            }}
                                        >
                                            ✕
                                        </span>
                                    ) : null}
                                </button>
                            </div>

                            {/* ✅ invisible “second slot” to keep the upload at ~50% like a 2-up row */}
                            <div className="kce-mediaSpacer" aria-hidden="true" />
                        </div>

                        <div className="kce-grid2 kce-grid2Tight">
                            <div className="kce-field">
                                <div className="body kce-label">Main heading</div>
                                <input
                                    className="kce-input"
                                    value={state.mainHeading || ""}
                                    onChange={(e) => updateState({ mainHeading: e.target.value })}
                                    placeholder={previewPlaceholders.main_heading}
                                />
                            </div>

                            <div className="kce-field">
                                <div className="body kce-label">Subheading</div>
                                <input
                                    className="kce-input"
                                    value={state.subHeading || ""}
                                    onChange={(e) => updateState({ subHeading: e.target.value })}
                                    placeholder={previewPlaceholders.sub_heading}
                                />
                            </div>
                        </div>
                    </div>
                )}

                <div className="kce-dividerBlock" />

                {/* ABOUT */}
                {showAboutMeSection !== false && (
                    <div className="kce-section">
                        <button
                            type="button"
                            className="kce-pillBar"
                            onClick={() => toggleOrKeepOpen(setShowAboutMeSection, !!showAboutMeSection)}
                            aria-label="About Me Section"
                        >
                            About Me Section
                        </button>

                        <div className="kce-block">
                            <div className="kce-label">Profile Photo / Logo</div>

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
                                className="kce-upload kce-uploadSquare"
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
                    </div>
                )}

                <div className="kce-dividerBlock" />

                {/* WORK */}
                {showWorkSection !== false && (
                    <div className="kce-section">
                        <button
                            type="button"
                            className="kce-pillBar"
                            onClick={() => toggleOrKeepOpen(setShowWorkSection, !!showWorkSection)}
                            aria-label="My Work Section"
                        >
                            My Work Section
                        </button>

                        <div className="body kce-miniSub">Upload up to 12 images</div>

                        <div className="kce-workGrid">
                            {(state.workImages || []).slice(0, 12).map((item, i) => (
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

                            {(state.workImages || []).length < 12 ? (
                                <button
                                    type="button"
                                    className="kce-workAdd"
                                    onClick={() => workImageInputRef.current?.click()}
                                >
                                    <div className="kce-plus">+</div>
                                    <div className="kce-uploadText">Upload Image(s)</div>
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
                                updateState({ workImages: [...existing, ...items].slice(0, 12) });

                                onAddWorkImages?.(files);
                            }}
                        />
                    </div>
                )}

                <div className="kce-dividerBlock" />

                {/* SERVICES */}
                {showServicesSection !== false && (
                    <div className="kce-section">
                        <button
                            type="button"
                            className="kce-pillBar"
                            onClick={() => toggleOrKeepOpen(setShowServicesSection, !!showServicesSection)}
                            aria-label="My Services Section"
                        >
                            My Services Section
                        </button>

                        <div className="kce-repeat">
                            {(state.services || []).map((s, i) => (
                                <div key={i} className="kce-repeatCard">
                                    <div className="kce-grid2">
                                        <div className="kce-field">
                                            <div className="kce-label">Service Name</div>
                                            <input
                                                className="kce-input"
                                                placeholder="Enter your name"
                                                value={s.name || ""}
                                                onChange={(e) => handleServiceChange(i, "name", e.target.value)}
                                            />
                                        </div>

                                        <div className="kce-field">
                                            <div className="kce-label">Price / detail</div>
                                            <input
                                                className="kce-input"
                                                placeholder="Enter your email"
                                                value={s.price || ""}
                                                onChange={(e) => handleServiceChange(i, "price", e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <button type="button" className="kce-dangerOutline" onClick={() => handleRemoveService(i)}>
                                        Remove Service
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button type="button" className="kce-dashedAdd" onClick={handleAddService}>
                            + Add Another Service
                        </button>
                    </div>
                )}

                <div className="kce-dividerBlock" />

                {/* REVIEWS */}
                {showReviewsSection !== false && (
                    <div className="kce-section">
                        <button
                            type="button"
                            className="kce-pillBar"
                            onClick={() => toggleOrKeepOpen(setShowReviewsSection, !!showReviewsSection)}
                            aria-label="Reviews Section"
                        >
                            Reviews Section
                        </button>

                        <div className="kce-repeat">
                            {(state.reviews || []).map((r, i) => (
                                <div key={i} className="kce-repeatCard">
                                    <div className="kce-grid2">
                                        <div className="kce-field">
                                            <div className="kce-label">Name</div>
                                            <input
                                                className="kce-input"
                                                placeholder="Enter your name"
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

                                    <button type="button" className="kce-dangerOutline" onClick={() => handleRemoveReview(i)}>
                                        Remove Review
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button type="button" className="kce-dashedAdd" onClick={handleAddReview}>
                            + Add Another Review
                        </button>
                    </div>
                )}

                <div className="kce-dividerBlock" />

                {/* CONTACT */}
                {showContactSection !== false && (
                    <div className="kce-section">
                        <button
                            type="button"
                            className="kce-pillBar"
                            onClick={() => toggleOrKeepOpen(setShowContactSection, !!showContactSection)}
                            aria-label="Contact Section"
                        >
                            Contact Section
                        </button>

                        <div className="kce-block">
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

                            <div className="kce-label kce-mt16">Social Links</div>

                            <div className="kce-social">
                                <div className="kce-socialRow">
                                    <img src={FacebookIcon} alt="" />
                                    <input
                                        className="kce-input"
                                        placeholder="Enter your name"
                                        value={state.facebook_url || ""}
                                        onChange={(e) => updateState({ facebook_url: e.target.value })}
                                    />
                                </div>

                                <div className="kce-socialRow">
                                    <img src={InstagramIcon} alt="" />
                                    <input
                                        className="kce-input"
                                        placeholder="Enter your name"
                                        value={state.instagram_url || ""}
                                        onChange={(e) => updateState({ instagram_url: e.target.value })}
                                    />
                                </div>

                                <div className="kce-socialRow">
                                    <img src={LinkedInIcon} alt="" />
                                    <input
                                        className="kce-input"
                                        placeholder="Enter your name"
                                        value={state.linkedin_url || ""}
                                        onChange={(e) => updateState({ linkedin_url: e.target.value })}
                                    />
                                </div>

                                <div className="kce-socialRow">
                                    <img src={XIcon} alt="" />
                                    <input
                                        className="kce-input"
                                        placeholder="Enter your name"
                                        value={state.x_url || ""}
                                        onChange={(e) => updateState({ x_url: e.target.value })}
                                    />
                                </div>

                                <div className="kce-socialRow">
                                    <img src={TikTokIcon} alt="" />
                                    <input
                                        className="kce-input"
                                        placeholder="Enter your name"
                                        value={state.tiktok_url || ""}
                                        onChange={(e) => updateState({ tiktok_url: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="kce-footerPad" />
            </div>

            {/* Bottom action bar */}
            <div className="kce-footer">
                <button type="button" className="kce-btn kce-btnGhost kce-btnWide" onClick={onResetPage}>
                    Reset Page
                </button>
                <button type="button" className="kce-btn kce-btnPrimary kce-btnWide" onClick={onSubmit}>
                    Save / Publish Profile
                </button>
            </div>
        </div>
    );
}