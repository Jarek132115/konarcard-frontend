// src/components/Editor.jsx
import React, { useRef } from "react";
import { previewPlaceholders } from "../store/businessCardStore";

// Social icons
import FacebookIcon from "../assets/icons/icons8-facebook.svg";
import InstagramIcon from "../assets/icons/icons8-instagram.svg";
import LinkedInIcon from "../assets/icons/icons8-linkedin.svg";
import XIcon from "../assets/icons/icons8-x.svg";
import TikTokIcon from "../assets/icons/icons8-tiktok.svg";

// Pick black/white text for a given hex background
const getContrastColor = (hex = "#000000") => {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec((hex || "").trim());
    if (!m) return "#111";
    const r = parseInt(m[1], 16), g = parseInt(m[2], 16), b = parseInt(m[3], 16);
    const L = 0.2126 * (r / 255) + 0.7152 * (g / 255) + 0.0722 * (b / 255);
    return L > 0.6 ? "#111" : "#fff";
};

/**
 * Orange-themed Editor (scoped styles via .editor-scope)
 */
export default function Editor({
    state,
    updateState,
    isSubscribed,
    hasTrialEnded,
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

    columnScrollStyle,
}) {
    const coverInputRef = useRef(null);
    const avatarInputRef = useRef(null);
    const workImageInputRef = useRef(null);

    const handleServiceChange = (i, field, value) => {
        const next = [...(state.services || [])];
        next[i] = { ...(next[i] || {}), [field]: value };
        updateState({ services: next });
    };
    const handleAddService = () =>
        updateState({ services: [...(state.services || []), { name: "", price: "" }] });
    const handleRemoveService = (i) =>
        updateState({ services: (state.services || []).filter((_, idx) => idx !== i) });

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
    const handleAddReview = () =>
        updateState({ reviews: [...(state.reviews || []), { name: "", text: "", rating: 5 }] });
    const handleRemoveReview = (i) =>
        updateState({ reviews: (state.reviews || []).filter((_, idx) => idx !== i) });

    // ===== Section Order (Main locked at top) =====
    const readableSectionName = (key) =>
        ({ main: "Main", about: "About Me", work: "My Work", services: "My Services", reviews: "Reviews", contact: "Contact" }[key] || key);

    const defaultOrder = ["main", "about", "work", "services", "reviews", "contact"];

    // Keep only known keys, unique, and force "main" to index 0
    const sanitizeOrder = (order) => {
        const KNOWN = new Set(defaultOrder);
        const seen = new Set();
        const cleaned = (Array.isArray(order) ? order : defaultOrder)
            .filter((k) => KNOWN.has(k))
            .filter((k) => (seen.has(k) ? false : seen.add(k)));

        const rest = cleaned.filter((k) => k !== "main");
        // Make sure all keys exist once (append any missing)
        const missing = defaultOrder.filter((k) => !cleaned.includes(k) && k !== "main");
        return ["main", ...rest, ...missing];
    };

    const currentOrder = sanitizeOrder(state.sectionOrder?.length ? state.sectionOrder : defaultOrder);

    const moveSectionUp = (idx) => {
        // Prevent moving anything above index 1 (index 0 is "main")
        if (idx <= 1) return;
        const next = [...currentOrder];
        [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
        updateState({ sectionOrder: sanitizeOrder(next) });
    };

    const moveSectionDown = (idx) => {
        // Never move "main" itself, and regular bounds check
        if (currentOrder[idx] === "main" || idx >= currentOrder.length - 1) return;
        const next = [...currentOrder];
        [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]];
        updateState({ sectionOrder: sanitizeOrder(next) });
    };

    const pickedBg = state.buttonBgColor || "#F47629";
    const pickedInk = getContrastColor(pickedBg);

    return (
        <div className="myprofile-editor-wrapper editor-scope" id="myprofile-editor" style={columnScrollStyle}>
            {!isSubscribed && hasTrialEnded && (
                <div className="subscription-overlay">
                    <div className="subscription-message">
                        <p className="desktop-h4">Subscription Required</p>
                        <p className="desktop-h6">
                            Your free trial has ended. Please subscribe to continue editing your profile.
                        </p>
                        <button className="btn btn-accent" onClick={onStartSubscription}>
                            Go to Subscription
                        </button>
                    </div>
                </div>
            )}

            <form
                onSubmit={onSubmit}
                className="myprofile-editor"
                style={{
                    filter: !isSubscribed && hasTrialEnded ? "blur(5px)" : "none",
                    pointerEvents: !isSubscribed && hasTrialEnded ? "none" : "auto",
                }}
            >
                <h2 className="editor-title">Edit Your Digital Business Card</h2>
                <hr className="title-divider" />

                {/* Theme */}
                <div className="input-block">
                    <div className="choice-label">Page Theme</div>
                    <div className="option-row split-2">
                        <button
                            type="button"
                            className={`chip theme-chip ${state.pageTheme === "light" ? "is-active" : ""}`}
                            onClick={() => updateState({ pageTheme: "light" })}
                        >
                            Light Mode
                        </button>
                        <button
                            type="button"
                            className={`chip theme-chip ${state.pageTheme === "dark" ? "is-active" : ""}`}
                            onClick={() => updateState({ pageTheme: "dark" })}
                        >
                            Dark Mode
                        </button>
                    </div>
                </div>

                {/* Fonts */}
                <div className="input-block">
                    <div className="choice-label">Font</div>
                    <div className="option-row split-3">
                        {["Inter", "Montserrat", "Poppins"].map((font) => (
                            <button
                                type="button"
                                key={font}
                                className={`chip ${state.font === font ? "is-active" : ""}`}
                                onClick={() => updateState({ font })}
                                style={{
                                    fontFamily: `'${font}', system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif`,
                                    fontWeight: 700, // keep their face, adopt 12px/700 via CSS
                                }}
                            >
                                {font}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Button Style (stacked, 12px controls) */}
                <hr className="divider" />
                <div className="input-block">
                    <div className="choice-label">Button Style</div>

                    {/* Background - looks like a chip, full width */}
                    <div className="stack">
                        <label className="mini-label">Button Background</label>
                        <div
                            className="chip color-chip w-full"
                            style={{
                                "--picked-color": pickedBg,
                                "--picked-ink": pickedInk,
                            }}
                        >
                            <span className="color-chip-label">Choose colour</span>
                            <input
                                type="color"
                                className="color-input"
                                value={pickedBg}
                                onChange={(e) => updateState({ buttonBgColor: e.target.value })}
                                aria-label="Choose button background colour"
                            />
                        </div>
                    </div>

                    {/* Text Colour — two chips in one row */}
                    <div className="stack">
                        <label className="mini-label">Button Text Colour</label>
                        <div className="option-row split-2">
                            {["white", "black"].map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    className={`chip chip-sm ${state.buttonTextColor === c ? "is-active" : ""}`}
                                    onClick={() => updateState({ buttonTextColor: c })}
                                >
                                    {c[0].toUpperCase() + c.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Text Alignment (content only) */}
                <div className="input-block">
                    <div className="choice-label">Text Alignment</div>
                    <div className="option-row split-3">
                        {["left", "center", "right"].map((a) => (
                            <button
                                key={a}
                                type="button"
                                className={`chip ${state.textAlignment === a ? "is-active" : ""}`}
                                onClick={() => updateState({ textAlignment: a })}
                            >
                                {a[0].toUpperCase() + a.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Section Order (Main locked) */}
                <hr className="divider" />
                <div className="input-block">
                    <div className="choice-label">Section Order</div>
                    <ul className="sortable-list">
                        {currentOrder.map((key, idx) => {
                            const isMain = key === "main";
                            const canMoveUp = !isMain && idx > 1; // never swap with index 0 (“main”)
                            const canMoveDown = !isMain && idx < currentOrder.length - 1;

                            return (
                                <li key={key} className="sortable-item">
                                    <span className="drag-label">⋮⋮</span>

                                    {/* no "(Locked)" label anymore */}
                                    <span className="section-name">{readableSectionName(key)}</span>

                                    <div className="order-buttons">
                                        {isMain ? (
                                            // Single lock icon instead of arrows
                                            <button
                                                type="button"
                                                className="btn btn-ghost"
                                                disabled
                                                aria-label="Main section is locked at the top"
                                                title="Main section is locked at the top"
                                            >
                                                {/* Inline lock SVG so you don't need an asset */}
                                                <svg
                                                    width="18"
                                                    height="18"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    aria-hidden="true"
                                                >
                                                    <path
                                                        d="M7 10V7a5 5 0 0 1 10 0v3"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                    <rect
                                                        x="5"
                                                        y="10"
                                                        width="14"
                                                        height="11"
                                                        rx="2"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                    />
                                                </svg>
                                            </button>
                                        ) : (
                                            <>
                                                <button
                                                    type="button"
                                                    className="btn btn-ghost"
                                                    disabled={!canMoveUp}
                                                    onClick={() => moveSectionUp(idx)}
                                                    aria-label={`Move ${readableSectionName(key)} up`}
                                                >
                                                    ↑
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-ghost"
                                                    disabled={!canMoveDown}
                                                    onClick={() => moveSectionDown(idx)}
                                                    aria-label={`Move ${readableSectionName(key)} down`}
                                                >
                                                    ↓
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                {/* Main Section */}
                <hr className="divider" />
                <div className="editor-section-header stacked">
                    <h3 className="editor-subtitle">Main Section</h3>
                    <button
                        type="button"
                        onClick={() => setShowMainSection(!showMainSection)}
                        className="toggle-button section-chip"
                    >
                        {showMainSection ? "Hide Section" : "Show Section"}
                    </button>
                </div>
                {showMainSection && (
                    <>
                        <div className="input-block">
                            <label htmlFor="coverPhoto">Cover Photo</label>
                            <input
                                ref={coverInputRef}
                                id="coverPhoto"
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) onCoverUpload?.(file);
                                }}
                                style={{ display: "none" }}
                            />
                            <div
                                className="editor-item-card work-image-item-wrapper cover-photo-card"
                                onClick={() => coverInputRef.current?.click()}
                            >
                                {state.coverPhoto ? (
                                    <img
                                        src={state.coverPhoto || previewPlaceholders.coverPhoto}
                                        alt="Cover"
                                        className="work-image-preview"
                                    />
                                ) : (
                                    <span className="upload-text">+ Upload Cover Image</span>
                                )}
                                {state.coverPhoto && (
                                    <button
                                        type="button"
                                        className="remove-image-button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onRemoveCover?.();
                                        }}
                                    >
                                        &times;
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="input-block tight">
                            <label htmlFor="mainHeading">Main Heading</label>
                            <input
                                id="mainHeading"
                                type="text"
                                className="text-input"
                                value={state.mainHeading || ""}
                                onChange={(e) => updateState({ mainHeading: e.target.value })}
                                placeholder={previewPlaceholders.main_heading}
                            />
                        </div>

                        <div className="input-block tight">
                            <label htmlFor="subHeading">Subheading</label>
                            <input
                                id="subHeading"
                                type="text"
                                className="text-input"
                                value={state.subHeading || ""}
                                onChange={(e) => updateState({ subHeading: e.target.value })}
                                placeholder={previewPlaceholders.sub_heading}
                            />
                        </div>
                    </>
                )}

                {/* About Me */}
                <hr className="divider" />
                <div className="editor-section-header stacked">
                    <h3 className="editor-subtitle">About Me Section</h3>
                    <button
                        type="button"
                        onClick={() => setShowAboutMeSection(!showAboutMeSection)}
                        className="toggle-button section-chip"
                    >
                        {showAboutMeSection ? "Hide Section" : "Show Section"}
                    </button>
                </div>
                {showAboutMeSection && (
                    <>
                        <div className="input-block">
                            <label htmlFor="avatar">Profile Photo</label>
                            <input
                                ref={avatarInputRef}
                                id="avatar"
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) onAvatarUpload?.(file);
                                }}
                                style={{ display: "none" }}
                            />
                            <div
                                className="editor-item-card work-image-item-wrapper avatar-tile"
                                onClick={() => avatarInputRef.current?.click()}
                            >
                                {state.avatar ? (
                                    <img src={state.avatar || ""} alt="Avatar preview" className="work-image-preview" />
                                ) : (
                                    <span className="upload-text">+ Add a Profile Picture/Logo</span>
                                )}
                                {state.avatar && (
                                    <button
                                        type="button"
                                        className="remove-image-button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onRemoveAvatar?.();
                                        }}
                                    >
                                        &times;
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="input-block tight">
                            <label htmlFor="fullName">Full Name</label>
                            <input
                                id="fullName"
                                type="text"
                                className="text-input"
                                value={state.full_name || ""}
                                onChange={(e) => updateState({ full_name: e.target.value })}
                                placeholder={previewPlaceholders.full_name}
                            />
                        </div>

                        <div className="input-block tight">
                            <label htmlFor="jobTitle">Job Title</label>
                            <input
                                id="jobTitle"
                                type="text"
                                className="text-input"
                                value={state.job_title || ""}
                                onChange={(e) => updateState({ job_title: e.target.value })}
                                placeholder={previewPlaceholders.job_title}
                            />
                        </div>

                        <div className="input-block tight">
                            <label htmlFor="bio">About Me Description</label>
                            <textarea
                                id="bio"
                                rows={4}
                                className="text-input"
                                value={state.bio || ""}
                                onChange={(e) => updateState({ bio: e.target.value })}
                                placeholder={previewPlaceholders.bio}
                            />
                        </div>
                    </>
                )}

                {/* Work */}
                <hr className="divider" />
                <div className="editor-section-header stacked">
                    <h3 className="editor-subtitle">My Work Section</h3>
                    <button
                        type="button"
                        onClick={() => setShowWorkSection(!showWorkSection)}
                        className="toggle-button section-chip"
                    >
                        {showWorkSection ? "Hide Section" : "Show Section"}
                    </button>
                </div>
                {showWorkSection && (
                    <div className="input-block">
                        <label>Work Images</label>
                        <div className="editor-work-image-grid">
                            {(state.workImages || []).map((item, i) => (
                                <div key={i} className="editor-item-card work-image-item-wrapper">
                                    <img src={item.preview || item} alt={`work-${i}`} className="work-image-preview" />
                                    <button
                                        type="button"
                                        className="remove-image-button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onRemoveWorkImage?.(i);
                                        }}
                                    >
                                        &times;
                                    </button>
                                </div>
                            ))}
                            {(state.workImages || []).length < 10 && (
                                <div className="add-work-image-placeholder" onClick={() => workImageInputRef.current?.click()}>
                                    <span className="upload-text">+ Add image(s)</span>
                                </div>
                            )}
                        </div>
                        <input
                            ref={workImageInputRef}
                            type="file"
                            multiple
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={(e) => {
                                const files = Array.from(e.target.files || []).filter((f) => f && f.type.startsWith("image/"));
                                if (files.length) onAddWorkImages?.(files);
                            }}
                        />
                    </div>
                )}

                {/* Services */}
                <hr className="divider" />
                <div className="editor-section-header stacked">
                    <h3 className="editor-subtitle">My Services Section</h3>
                    <button
                        type="button"
                        onClick={() => setShowServicesSection(!showServicesSection)}
                        className="toggle-button section-chip"
                    >
                        {showServicesSection ? "Hide Section" : "Show Section"}
                    </button>
                </div>
                {showServicesSection && (
                    <div className="input-block">
                        <label>Services</label>
                        <div className="editor-service-list">
                            {(state.services || []).map((s, i) => (
                                <div key={i} className="editor-item-card mock-service-item-wrapper">
                                    <input
                                        type="text"
                                        className="text-input"
                                        placeholder="Service Name"
                                        value={s.name || ""}
                                        onChange={(e) => handleServiceChange(i, "name", e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        className="text-input"
                                        placeholder="Service Price/Detail"
                                        value={s.price || ""}
                                        onChange={(e) => handleServiceChange(i, "price", e.target.value)}
                                    />
                                    <button type="button" onClick={() => handleRemoveService(i)} className="btn btn-danger">
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={handleAddService} className="desktop-button navy-button w-full">
                            + Add Service
                        </button>
                    </div>
                )}

                {/* Reviews */}
                <hr className="divider" />
                <div className="editor-section-header stacked">
                    <h3 className="editor-subtitle">Reviews Section</h3>
                    <button
                        type="button"
                        onClick={() => setShowReviewsSection(!showReviewsSection)}
                        className="toggle-button section-chip"
                    >
                        {showReviewsSection ? "Hide Section" : "Show Section"}
                    </button>
                </div>
                {showReviewsSection && (
                    <div className="input-block">
                        <label>Reviews</label>
                        <div className="editor-reviews-list" style={{ display: "grid", gap: 8 }}>
                            {(state.reviews || []).map((r, i) => (
                                <div key={i} className="editor-item-card mock-review-card-wrapper">
                                    <input
                                        type="text"
                                        className="text-input"
                                        placeholder="Reviewer Name"
                                        value={r.name || ""}
                                        onChange={(e) => handleReviewChange(i, "name", e.target.value)}
                                    />
                                    <textarea
                                        className="text-input"
                                        placeholder="Review text"
                                        rows={2}
                                        value={r.text || ""}
                                        onChange={(e) => handleReviewChange(i, "text", e.target.value)}
                                    />
                                    <input
                                        type="number"
                                        className="text-input"
                                        placeholder="Rating (1-5)"
                                        min="1"
                                        max="5"
                                        value={r.rating || ""}
                                        onChange={(e) => handleReviewChange(i, "rating", e.target.value)}
                                    />
                                    <button type="button" onClick={() => handleRemoveReview(i)} className="btn btn-danger">
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={handleAddReview} className="desktop-button navy-button w-full">
                            + Add Review
                        </button>
                    </div>
                )}

                {/* Contact */}
                <hr className="divider" />
                <div className="editor-section-header stacked">
                    <h3 className="editor-subtitle">My Contact Details</h3>
                    <button
                        type="button"
                        onClick={() => setShowContactSection(!showContactSection)}
                        className="toggle-button section-chip"
                    >
                        {showContactSection ? "Hide Section" : "Show Section"}
                    </button>
                </div>
                {showContactSection && (
                    <>
                        <div className="input-block tight">
                            <label htmlFor="contactEmail">Email Address</label>
                            <input
                                id="contactEmail"
                                type="email"
                                className="text-input"
                                autoComplete="email"
                                inputMode="email"
                                value={state.contact_email || ""}
                                onChange={(e) => updateState({ contact_email: e.target.value })}
                                placeholder={previewPlaceholders.contact_email}
                            />
                        </div>

                        <div className="input-block tight">
                            <label htmlFor="phoneNumber">Phone Number</label>
                            <input
                                id="phoneNumber"
                                type="tel"
                                inputMode="tel"
                                autoComplete="tel"
                                pattern="[0-9+()\\s-]*"
                                className="text-input"
                                value={state.phone_number || ""}
                                onChange={(e) => updateState({ phone_number: e.target.value })}
                                placeholder={previewPlaceholders.phone_number}
                            />
                        </div>

                        {/* Social Links — one per row with icons */}
                        <div className="input-block">
                            <div className="choice-label">Social Links</div>

                            <div className="social-list">
                                <div className="social-row-input">
                                    <img src={FacebookIcon} alt="" className="social-icon" />
                                    <input
                                        className="text-input"
                                        inputMode="url"
                                        autoComplete="url"
                                        placeholder="Facebook URL"
                                        value={state.facebook_url || ""}
                                        onChange={(e) => updateState({ facebook_url: e.target.value })}
                                    />
                                </div>

                                <div className="social-row-input">
                                    <img src={InstagramIcon} alt="" className="social-icon" />
                                    <input
                                        className="text-input"
                                        inputMode="url"
                                        autoComplete="url"
                                        placeholder="Instagram URL"
                                        value={state.instagram_url || ""}
                                        onChange={(e) => updateState({ instagram_url: e.target.value })}
                                    />
                                </div>

                                <div className="social-row-input">
                                    <img src={LinkedInIcon} alt="" className="social-icon" />
                                    <input
                                        className="text-input"
                                        inputMode="url"
                                        autoComplete="url"
                                        placeholder="LinkedIn URL"
                                        value={state.linkedin_url || ""}
                                        onChange={(e) => updateState({ linkedin_url: e.target.value })}
                                    />
                                </div>

                                <div className="social-row-input">
                                    <img src={XIcon} alt="" className="social-icon" />
                                    <input
                                        className="text-input"
                                        inputMode="url"
                                        autoComplete="url"
                                        placeholder="X (Twitter) URL"
                                        value={state.x_url || ""}
                                        onChange={(e) => updateState({ x_url: e.target.value })}
                                    />
                                </div>

                                <div className="social-row-input">
                                    <img src={TikTokIcon} alt="" className="social-icon" />
                                    <input
                                        className="text-input"
                                        inputMode="url"
                                        autoComplete="url"
                                        placeholder="TikTok URL"
                                        value={state.tiktok_url || ""}
                                        onChange={(e) => updateState({ tiktok_url: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </>
                )}

                <div className="button-group">
                    <button type="button" onClick={onResetPage} className="desktop-button navy-button">
                        Reset Page
                    </button>
                    <button type="submit" className="desktop-button orange-button">
                        Publish Now
                    </button>
                </div>
            </form>
        </div>
    );
}
