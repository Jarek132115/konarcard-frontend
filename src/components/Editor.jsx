import React, { useRef } from "react";
import { previewPlaceholders } from "../store/businessCardStore";

/**
 * Orange-themed Editor (scoped styles via .editor-scope)
 *
 * Props: see previous version — unchanged API
 */
export default function Editor({
    state,
    updateState,
    isSubscribed,
    hasTrialEnded,
    onStartSubscription,
    onResetPage,
    onSubmit,

    servicesDisplayMode,
    setServicesDisplayMode,
    reviewsDisplayMode,
    setReviewsDisplayMode,
    aboutMeLayout,
    setAboutMeLayout,

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

                {/* Theme */}
                <div className="input-block">
                    <label>Page Theme</label>
                    <div className="option-row split-2">
                        <button
                            type="button"
                            className={`chip ${state.pageTheme === "light" ? "is-active" : ""}`}
                            onClick={() => updateState({ pageTheme: "light" })}
                        >
                            Light Mode
                        </button>
                        <button
                            type="button"
                            className={`chip ${state.pageTheme === "dark" ? "is-active" : ""}`}
                            onClick={() => updateState({ pageTheme: "dark" })}
                        >
                            Dark Mode
                        </button>
                    </div>
                </div>

                {/* Fonts */}
                <div className="input-block">
                    <label>Font</label>
                    <div className="option-row split-3">
                        {["Inter", "Montserrat", "Poppins"].map((font) => (
                            <button
                                type="button"
                                key={font}
                                className={`chip ${state.font === font ? "is-active" : ""}`}
                                onClick={() => updateState({ font })}
                                style={{
                                    fontFamily: `'${font}', system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif`,
                                    fontWeight: 800,
                                }}
                            >
                                {font}
                            </button>
                        ))}
                    </div>
                </div>

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
                            <label>Display Layout</label>
                            <div className="option-row split-2">
                                <button
                                    type="button"
                                    className={`chip ${aboutMeLayout === "side-by-side" ? "is-active" : ""}`}
                                    onClick={() => setAboutMeLayout("side-by-side")}
                                >
                                    Side by Side
                                </button>
                                <button
                                    type="button"
                                    className={`chip ${aboutMeLayout === "stacked" ? "is-active" : ""}`}
                                    onClick={() => setAboutMeLayout("stacked")}
                                >
                                    Stacked
                                </button>
                            </div>
                        </div>

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
                    <>
                        <div className="input-block">
                            <label>Display Layout</label>
                            <div className="option-row split-3">
                                <button
                                    type="button"
                                    className={`chip ${state.workDisplayMode === "list" ? "is-active" : ""}`}
                                    onClick={() => updateState({ workDisplayMode: "list" })}
                                >
                                    List
                                </button>
                                <button
                                    type="button"
                                    className={`chip ${state.workDisplayMode === "grid" ? "is-active" : ""}`}
                                    onClick={() => updateState({ workDisplayMode: "grid" })}
                                >
                                    Grid
                                </button>
                                <button
                                    type="button"
                                    className={`chip ${state.workDisplayMode === "carousel" ? "is-active" : ""}`}
                                    onClick={() => updateState({ workDisplayMode: "carousel" })}
                                >
                                    Carousel
                                </button>
                            </div>
                        </div>

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
                    </>
                )}

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
                    <>
                        <div className="input-block">
                            <label>Display Layout</label>
                            <div className="option-row split-2">
                                <button
                                    type="button"
                                    className={`chip ${servicesDisplayMode === "list" ? "is-active" : ""}`}
                                    onClick={() => setServicesDisplayMode("list")}
                                >
                                    List
                                </button>
                                <button
                                    type="button"
                                    className={`chip ${servicesDisplayMode === "carousel" ? "is-active" : ""}`}
                                    onClick={() => setServicesDisplayMode("carousel")}
                                >
                                    Carousel
                                </button>
                            </div>
                        </div>

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
                            <button type="button" onClick={handleAddService} className="btn btn-outline-accent w-full">
                                + Add Service
                            </button>
                        </div>
                    </>
                )}

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
                    <>
                        <div className="input-block">
                            <label>Display Layout</label>
                            <div className="option-row split-2">
                                <button
                                    type="button"
                                    className={`chip ${reviewsDisplayMode === "list" ? "is-active" : ""}`}
                                    onClick={() => setReviewsDisplayMode("list")}
                                >
                                    List
                                </button>
                                <button
                                    type="button"
                                    className={`chip ${reviewsDisplayMode === "carousel" ? "is-active" : ""}`}
                                    onClick={() => setReviewsDisplayMode("carousel")}
                                >
                                    Carousel
                                </button>
                            </div>
                        </div>

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
                            <button type="button" onClick={handleAddReview} className="btn btn-outline-accent w-full">
                                + Add Review
                            </button>
                        </div>
                    </>
                )}

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
                                className="text-input"
                                value={state.phone_number || ""}
                                onChange={(e) => updateState({ phone_number: e.target.value })}
                                placeholder={previewPlaceholders.phone_number}
                            />
                        </div>
                    </>
                )}

                <div className="button-group">
                    <button type="button" onClick={onResetPage} className="btn btn-neutral">
                        Reset Page
                    </button>
                    <button type="submit" className="btn btn-accent">
                        Publish Now
                    </button>
                </div>
            </form>
        </div>
    );
}
