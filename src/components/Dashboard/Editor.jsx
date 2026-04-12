import React, { useEffect, useMemo, useRef, useState } from "react";
import { previewPlaceholders } from "../../store/businessCardStore";

/* Social icons */
import FacebookIcon from "../../assets/icons/Template1Icon-Facebook.svg";
import InstagramIcon from "../../assets/icons/Template1Icon-Instagram.svg";
import LinkedInIcon from "../../assets/icons/Template1Icon-LinkedIn.svg";
import XIcon from "../../assets/icons/Template1Icon-X.svg";
import TikTokIcon from "../../assets/icons/Template1Icon-TikTok.svg";

/* CTA icons */
import SaveProfileIcon from "../../assets/icons/SaveProfileIcon.svg";
import ResetProfileIcon from "../../assets/icons/ResetProfileIcon.svg";

/* Locked template icon */
import TemplateLockIcon from "../../assets/icons/TemplateLockIcon.svg";
import ReviewStar from "../../assets/icons/ReviewStar.svg";

/* Upgrade modal image */
import UpgradeToPlusImage from "../../assets/images/UpgradeToPlus.png";

/* Editor template thumbs - Light */
import EditorTemplate1Light from "../../assets/images/editor-templates/EditorTemplate-1Light.png";
import EditorTemplate2Light from "../../assets/images/editor-templates/EditorTemplate-2Light.png";
import EditorTemplate3Light from "../../assets/images/editor-templates/EditorTemplate-3Light.png";
import EditorTemplate4Light from "../../assets/images/editor-templates/EditorTemplate-4Light.png";
import EditorTemplate5Light from "../../assets/images/editor-templates/EditorTemplate-5Light.png";

/* Editor template thumbs - Dark */
import EditorTemplate1Dark from "../../assets/images/editor-templates/EditorTemplate-1Dark.png";
import EditorTemplate2Dark from "../../assets/images/editor-templates/EditorTemplate-2Dark.png";
import EditorTemplate3Dark from "../../assets/images/editor-templates/EditorTemplate-3Dark.png";
import EditorTemplate4Dark from "../../assets/images/editor-templates/EditorTemplate-4Dark.png";
import EditorTemplate5Dark from "../../assets/images/editor-templates/EditorTemplate-5Dark.png";

import { resolveMediaUrl } from "../../utils/profileHelpers";
import { Switch } from "@base-ui/react/switch";
import { motion } from "motion/react";
import "../../styling/dashboard/editor.css";

const isBlobUrl = (v) => typeof v === "string" && v.startsWith("blob:");

export default function Editor({
    state,
    updateState,

    isSubscribed,
    isSaving = false,

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
    const logoInputRef = useRef(null);
    const workImageInputRef = useRef(null);

    const [upgradeOpen, setUpgradeOpen] = useState(false);
    const [upgradeContext, setUpgradeContext] = useState("feature");

    const FREE_MAX_WORKS = 6;
    const FREE_MAX_SERVICES = 3;
    const FREE_MAX_REVIEWS = 3;

    const PRO_MAX_WORKS = 12;
    const PRO_MAX_SERVICES = 12;
    const PRO_MAX_REVIEWS = 12;

    const maxWorks = isSubscribed ? PRO_MAX_WORKS : FREE_MAX_WORKS;
    const maxServices = isSubscribed ? PRO_MAX_SERVICES : FREE_MAX_SERVICES;
    const maxReviews = isSubscribed ? PRO_MAX_REVIEWS : FREE_MAX_REVIEWS;

    const worksCount = Array.isArray(state.workImages) ? state.workImages.length : 0;
    const servicesCount = Array.isArray(state.services) ? state.services.length : 0;
    const reviewsCount = Array.isArray(state.reviews) ? state.reviews.length : 0;

    const saveLabel = isSaving ? "Saving..." : "Save Profile";

    const openUpgrade = (ctx = "feature") => {
        setUpgradeContext(ctx);
        setUpgradeOpen(true);
    };

    const closeUpgrade = () => setUpgradeOpen(false);

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "Escape") closeUpgrade();
        };
        if (upgradeOpen) window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [upgradeOpen]);

    const TEMPLATE_IDS = useMemo(
        () => ["template-1", "template-2", "template-3", "template-4", "template-5"],
        []
    );

    const templateThumbsLight = useMemo(
        () => ({
            "template-1": EditorTemplate1Light,
            "template-2": EditorTemplate2Light,
            "template-3": EditorTemplate3Light,
            "template-4": EditorTemplate4Light,
            "template-5": EditorTemplate5Light,
        }),
        []
    );

    const templateThumbsDark = useMemo(
        () => ({
            "template-1": EditorTemplate1Dark,
            "template-2": EditorTemplate2Dark,
            "template-3": EditorTemplate3Dark,
            "template-4": EditorTemplate4Dark,
            "template-5": EditorTemplate5Dark,
        }),
        []
    );

    const currentTemplate = (state.templateId || "template-1").toString();
    const currentThemeMode = (state.themeMode || state.pageTheme || "light").toString();

    const templateThumbs =
        currentThemeMode === "dark" ? templateThumbsDark : templateThumbsLight;

    const isTemplateLocked = (templateId) => !isSubscribed && templateId !== "template-1";

    const handleTemplateSelect = (id) => {
        if (isSaving) return;
        if (isTemplateLocked(id)) {
            openUpgrade("templates");
            return;
        }
        updateState({ templateId: id });
    };

    const handleThemeModeChange = (mode) => {
        if (isSaving) return;
        updateState({
            themeMode: mode,
            pageTheme: mode,
        });
    };

    const handleServiceChange = (i, field, value) => {
        const next = [...(state.services || [])];

        if (field === "description") {
            next[i] = {
                ...(next[i] || {}),
                description: value,
                price: value,
            };
        } else {
            next[i] = { ...(next[i] || {}), [field]: value };
        }

        updateState({ services: next });
    };

    const handleAddService = () => {
        if (isSaving) return;
        if (!isSubscribed && servicesCount >= FREE_MAX_SERVICES) {
            return openUpgrade("services");
        }

        updateState({
            services: [...(state.services || []), { name: "", description: "", price: "" }],
        });
    };

    const handleRemoveService = (i) => {
        if (isSaving) return;
        updateState({ services: (state.services || []).filter((_, idx) => idx !== i) });
    };

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
        if (isSaving) return;
        if (!isSubscribed && reviewsCount >= FREE_MAX_REVIEWS) {
            return openUpgrade("reviews");
        }

        updateState({
            reviews: [...(state.reviews || []), { name: "", text: "", rating: 5 }],
        });
    };

    const handleRemoveReview = (i) => {
        if (isSaving) return;
        updateState({ reviews: (state.reviews || []).filter((_, idx) => idx !== i) });
    };

    const StarRating = ({ value = 5, onChange, disabled }) => {
        return (
            <div className="kce-stars" role="radiogroup" aria-label="Review rating">
                {[1, 2, 3, 4, 5].map((star) => {
                    const active = star <= value;

                    return (
                        <button
                            key={star}
                            type="button"
                            className={`kce-starBtn ${active ? "is-active" : "is-inactive"}`}
                            onClick={() => {
                                if (!disabled) onChange(star);
                            }}
                            disabled={disabled}
                            aria-label={`Set rating to ${star}`}
                            aria-pressed={active}
                        >
                            <img src={ReviewStar} alt="" className="kce-starIcon" />
                        </button>
                    );
                })}
            </div>
        );
    };

    const coverSrc =
        state.coverPhotoPreview ||
        resolveMediaUrl(isBlobUrl(state.coverPhoto) ? "" : state.coverPhoto) ||
        previewPlaceholders.coverPhoto;

    const logoSrc =
        state.logoPreview ||
        resolveMediaUrl(isBlobUrl(state.logo) ? "" : state.logo) ||
        state.avatarPreview ||
        resolveMediaUrl(isBlobUrl(state.avatar) ? "" : state.avatar) ||
        "";

    const sectionToggle = (isShown, setter) => {
        if (isSaving) return;
        setter?.(!isShown);
    };

    const handleWorkAddClick = () => {
        if (isSaving) return;
        if (!isSubscribed && worksCount >= FREE_MAX_WORKS) return openUpgrade("work");
        workImageInputRef.current?.click();
    };

    const handleWorkFilesSelected = (e) => {
        const files = Array.from(e.target.files || []).filter(
            (f) => f && f.type.startsWith("image/")
        );
        if (!files.length) return;

        if (!isSubscribed) {
            const remaining = Math.max(0, FREE_MAX_WORKS - worksCount);
            if (remaining <= 0) {
                e.target.value = "";
                return openUpgrade("work");
            }
            const trimmed = files.slice(0, remaining);
            onAddWorkImages?.(trimmed);
            e.target.value = "";
            return;
        }

        const remaining = Math.max(0, PRO_MAX_WORKS - worksCount);
        const trimmed = files.slice(0, remaining);
        if (!trimmed.length) {
            e.target.value = "";
            return;
        }

        onAddWorkImages?.(trimmed);
        e.target.value = "";
    };

    return (
        <motion.div className="kce-root" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.32, ease: "easeOut" }}>
            <div className="kce-top">
                <div className="kce-topLeft">
                    <div className="kc-title kce-title">Edit Your Profile</div>
                    <div className="body kce-sub">
                        Choose a template and add your business details.
                    </div>
                </div>

                <div className="kce-topRight">
                    <button
                        type="button"
                        className="kce-btn kce-btnGhost"
                        onClick={onResetPage}
                        disabled={isSaving}
                    >
                        <img
                            src={ResetProfileIcon}
                            alt=""
                            className="kce-btnIcon kce-btnIconReset"
                        />
                        <span>Reset</span>
                    </button>

                    <button
                        type="button"
                        className="kce-btn kce-btnPrimary"
                        onClick={onSubmit}
                        disabled={isSaving}
                        aria-busy={isSaving}
                    >
                        <img
                            src={SaveProfileIcon}
                            alt=""
                            className="kce-btnIcon kce-btnIconSave"
                        />
                        <span>{saveLabel}</span>
                    </button>
                </div>
            </div>

            <div className="kce-spacer24" />

            {upgradeOpen ? (
                <div
                    className="kce-modalOverlay"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Upgrade to Plus"
                >
                    <div className="kce-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="kce-modalTopBar">
                            <div className="kce-modalHeroBadge">Plus</div>

                            <button
                                type="button"
                                className="kce-modalClose"
                                onClick={closeUpgrade}
                                aria-label="Close"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="kce-modalHeroMedia">
                            <img
                                src={UpgradeToPlusImage}
                                alt=""
                                className="kce-modalHeroImg"
                            />
                        </div>

                        <div className="kce-modalTitle">Upgrade to Plus</div>
                        <div className="kce-modalText">
                            Unlock more customisation, more content space, and the full analytics
                            experience for your KonarCard profile.
                        </div>

                        <div className="kce-modalFeaturePills">
                            <span className="kce-modalFeaturePill">Unlock all 5 templates</span>
                            <span className="kce-modalFeaturePill">Add up to 12 work images</span>
                            <span className="kce-modalFeaturePill">Add up to 12 services</span>
                            <span className="kce-modalFeaturePill">Add up to 12 reviews</span>
                            <span className="kce-modalFeaturePill">Unlock full analytics</span>
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

                            <button
                                type="button"
                                className="kce-btn kce-btnGhost"
                                onClick={closeUpgrade}
                            >
                                Not now
                            </button>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="kce-modalBackdrop"
                        onClick={closeUpgrade}
                        aria-label="Close modal"
                    />
                </div>
            ) : null}

            <div className="kce-scroll">
                <div className="kce-section">
                    <div className="kce-sectionTop">
                        <div className="kce-headingBlock">
                            <span className="kce-pill">Choose Mode</span>
                        </div>
                    </div>

                    <div className="kce-sectionBody">
                        <div className="kce-themeModeWrap">
                            <div
                                className="kce-themeModeToggle"
                                role="tablist"
                                aria-label="Theme mode selector"
                            >
                                <button
                                    type="button"
                                    role="tab"
                                    aria-selected={currentThemeMode === "light"}
                                    className={`kce-themeModeBtn ${currentThemeMode === "light" ? "is-active" : ""
                                        }`}
                                    onClick={() => handleThemeModeChange("light")}
                                    disabled={isSaving}
                                >
                                    Light Mode
                                </button>

                                <button
                                    type="button"
                                    role="tab"
                                    aria-selected={currentThemeMode === "dark"}
                                    className={`kce-themeModeBtn ${currentThemeMode === "dark" ? "is-active" : ""
                                        }`}
                                    onClick={() => handleThemeModeChange("dark")}
                                    disabled={isSaving}
                                >
                                    Dark Mode
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="kce-dividerBlock" />

                <div className="kce-section">
                    <div className="kce-sectionTop">
                        <div className="kce-headingBlock">
                            <span className="kce-pill">Choose Template</span>
                            <div className="kce-accentLine" />
                        </div>
                    </div>

                    <div className="kce-sectionBody">
                        <div
                            className="kce-templatePhones"
                            role="tablist"
                            aria-label="Template selector"
                        >
                            {TEMPLATE_IDS.map((t) => {
                                const locked = isTemplateLocked(t);
                                const active = currentTemplate === t;

                                return (
                                    <button
                                        key={t}
                                        type="button"
                                        className={`kce-phoneCard ${active ? "is-active" : ""} ${locked ? "is-locked" : ""
                                            }`}
                                        onClick={() => handleTemplateSelect(t)}
                                        title={locked ? "Upgrade to unlock this template" : "Select template"}
                                        aria-label={locked ? `${t} locked` : t}
                                        role="tab"
                                        aria-selected={active}
                                        disabled={isSaving}
                                    >
                                        <img
                                            src={templateThumbs[t]}
                                            alt=""
                                            className="kce-phoneImg"
                                            draggable={false}
                                            loading="lazy"
                                            decoding="async"
                                        />

                                        {locked ? (
                                            <span className="kce-premiumBadge" aria-hidden="true">
                                                <img src={TemplateLockIcon} alt="" />
                                            </span>
                                        ) : null}
                                    </button>
                                );
                            })}
                        </div>

                        {!isSubscribed ? (
                            <div className="kce-note">
                                Free users can use <strong>Template 1</strong>. Upgrade to unlock
                                Templates 2–5.
                            </div>
                        ) : null}
                    </div>
                </div>

                <div className="kce-dividerBlock" />

                <div className="kce-section">
                    <div className="kce-sectionTop">
                        <div className="kce-headingBlock">
                            <span className="kce-pill">Main Section</span>
                            <div className="kce-accentLine" />
                        </div>

                        <button
                            type="button"
                            className="kce-hideBtn"
                            onClick={() => sectionToggle(!!showMainSection, setShowMainSection)}
                            disabled={isSaving}
                        >
                            {showMainSection ? "Hide section" : "Show section"}
                        </button>
                    </div>

                    {showMainSection ? (
                        <div className="kce-sectionBody">
                            <div className="kce-grid2 kce-mediaGrid">
                                <div className="kce-field">
                                    <div className="kce-label">Cover Photo</div>

                                    <input
                                        ref={coverInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (!file || isSaving) return;
                                            onCoverUpload?.(file);
                                            e.target.value = "";
                                        }}
                                        style={{ display: "none" }}
                                    />

                                    <button
                                        type="button"
                                        className="kce-upload"
                                        onClick={() => !isSaving && coverInputRef.current?.click()}
                                        disabled={isSaving}
                                    >
                                        {coverSrc ? (
                                            <img
                                                src={coverSrc}
                                                alt="Cover"
                                                className="kce-uploadImg"
                                            />
                                        ) : (
                                            <div className="kce-uploadInner">
                                                <div className="kce-plus">+</div>
                                                <div className="kce-uploadText">Upload Cover Photo</div>
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
                                                    if (isSaving) return;
                                                    onRemoveCover?.();
                                                }}
                                            >
                                                ✕
                                            </span>
                                        ) : null}
                                    </button>
                                </div>

                                <div className="kce-field">
                                    <div className="kce-label">Logo</div>

                                    <input
                                        ref={logoInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (!file || isSaving) return;
                                            onAvatarUpload?.(file);
                                            e.target.value = "";
                                        }}
                                        style={{ display: "none" }}
                                    />

                                    <button
                                        type="button"
                                        className="kce-upload"
                                        onClick={() => !isSaving && logoInputRef.current?.click()}
                                        disabled={isSaving}
                                    >
                                        {logoSrc ? (
                                            <img
                                                src={logoSrc}
                                                alt="Logo"
                                                className="kce-uploadImg kce-uploadImgContain"
                                            />
                                        ) : (
                                            <div className="kce-uploadInner">
                                                <div className="kce-plus">+</div>
                                                <div className="kce-uploadText">Upload Logo</div>
                                            </div>
                                        )}

                                        {logoSrc ? (
                                            <span
                                                className="kce-x"
                                                role="button"
                                                aria-label="Remove logo"
                                                onClick={(ev) => {
                                                    ev.preventDefault();
                                                    ev.stopPropagation();
                                                    if (isSaving) return;
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
                                    <div className="kce-label">Business Name</div>
                                    <input
                                        className="kce-input"
                                        value={state.business_name || state.mainHeading || ""}
                                        onChange={(e) =>
                                            updateState({
                                                business_name: e.target.value,
                                                mainHeading: e.target.value,
                                            })
                                        }
                                        placeholder="Carter Electrical Services"
                                        disabled={isSaving}
                                    />
                                </div>

                                <div className="kce-field">
                                    <div className="kce-label">Trade Title</div>
                                    <input
                                        className="kce-input"
                                        value={state.trade_title || state.subHeading || ""}
                                        onChange={(e) =>
                                            updateState({
                                                trade_title: e.target.value,
                                                subHeading: e.target.value,
                                            })
                                        }
                                        placeholder="Domestic & Commercial Electrician"
                                        disabled={isSaving}
                                    />
                                </div>
                            </div>

                            <div className="kce-field">
                                <div className="kce-label">Location</div>
                                <input
                                    className="kce-input"
                                    value={state.location || ""}
                                    onChange={(e) => updateState({ location: e.target.value })}
                                    placeholder="Liverpool, England"
                                    disabled={isSaving}
                                />
                            </div>
                        </div>
                    ) : null}
                </div>

                <div className="kce-dividerBlock" />

                <div className="kce-section">
                    <div className="kce-sectionTop">
                        <div className="kce-headingBlock">
                            <span className="kce-pill">About Me Section</span>
                            <div className="kce-accentLine" />
                        </div>

                        <button
                            type="button"
                            className="kce-hideBtn"
                            onClick={() => sectionToggle(!!showAboutMeSection, setShowAboutMeSection)}
                            disabled={isSaving}
                        >
                            {showAboutMeSection ? "Hide section" : "Show section"}
                        </button>
                    </div>

                    {showAboutMeSection ? (
                        <div className="kce-sectionBody">
                            <div className="kce-grid2">
                                <div className="kce-field">
                                    <div className="kce-label">Name</div>
                                    <input
                                        className="kce-input"
                                        value={state.full_name || ""}
                                        onChange={(e) => updateState({ full_name: e.target.value })}
                                        placeholder={previewPlaceholders.full_name || "James Carter"}
                                        disabled={isSaving}
                                    />
                                </div>

                                <div className="kce-field">
                                    <div className="kce-label">Trade Title</div>
                                    <input
                                        className="kce-input"
                                        value={state.job_title || ""}
                                        onChange={(e) => updateState({ job_title: e.target.value })}
                                        placeholder={previewPlaceholders.job_title || "Electrician"}
                                        disabled={isSaving}
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
                                    disabled={isSaving}
                                />
                            </div>
                        </div>
                    ) : null}
                </div>

                <div className="kce-dividerBlock" />

                <div className="kce-section">
                    <div className="kce-sectionTop">
                        <div className="kce-headingBlock">
                            <span className="kce-pill">My Work Section</span>
                            <div className="kce-accentLine" />
                        </div>

                        <button
                            type="button"
                            className="kce-hideBtn"
                            onClick={() => sectionToggle(!!showWorkSection, setShowWorkSection)}
                            disabled={isSaving}
                        >
                            {showWorkSection ? "Hide section" : "Show section"}
                        </button>
                    </div>

                    {showWorkSection ? (
                        <div className="kce-sectionBody">
                            <div className="kce-workGrid">
                                {(state.workImages || []).slice(0, maxWorks).map((item, i) => (
                                    <div key={i} className="kce-workItem">
                                        <img
                                            src={resolveMediaUrl(item?.preview || item)}
                                            alt={`work-${i}`}
                                        />
                                        <button
                                            type="button"
                                            className="kce-workX"
                                            onClick={() => !isSaving && onRemoveWorkImage?.(i)}
                                            aria-label="Remove image"
                                            disabled={isSaving}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    className="kce-upload kce-workAdd"
                                    onClick={handleWorkAddClick}
                                    disabled={isSaving}
                                >
                                    <div className="kce-uploadInner">
                                        <div className="kce-plus">+</div>
                                        <div className="kce-uploadText">Upload Work Images</div>
                                    </div>

                                    {!isSubscribed && worksCount >= FREE_MAX_WORKS ? (
                                        <span className="kce-premiumBadge" aria-hidden="true">
                                            <img src={TemplateLockIcon} alt="" />
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

                <div className="kce-section">
                    <div className="kce-sectionTop">
                        <div className="kce-headingBlock">
                            <span className="kce-pill">My Services Section</span>
                            <div className="kce-accentLine" />
                        </div>

                        <button
                            type="button"
                            className="kce-hideBtn"
                            onClick={() => sectionToggle(!!showServicesSection, setShowServicesSection)}
                            disabled={isSaving}
                        >
                            {showServicesSection ? "Hide section" : "Show section"}
                        </button>
                    </div>

                    {showServicesSection ? (
                        <div className="kce-sectionBody">
                            <div className="kce-repeat">
                                {(state.services || []).slice(0, maxServices).map((s, i) => (
                                    <div key={i} className="kce-repeatCard">
                                        <div className="kce-field">
                                            <div className="kce-label">Service Name</div>
                                            <input
                                                className="kce-input"
                                                placeholder="Fuse Board Upgrades"
                                                value={s.name || ""}
                                                onChange={(e) => handleServiceChange(i, "name", e.target.value)}
                                                disabled={isSaving}
                                            />
                                        </div>

                                        <div className="kce-field">
                                            <div className="kce-label">Short Description</div>
                                            <input
                                                className="kce-input"
                                                placeholder="Modern consumer unit installations for safer homes."
                                                value={s.description || s.price || ""}
                                                onChange={(e) =>
                                                    handleServiceChange(i, "description", e.target.value)
                                                }
                                                disabled={isSaving}
                                            />
                                        </div>

                                        <button
                                            type="button"
                                            className="kce-dangerPill"
                                            onClick={() => handleRemoveService(i)}
                                            disabled={isSaving}
                                        >
                                            Remove Service
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <button
                                type="button"
                                className="kce-addCard"
                                onClick={handleAddService}
                                disabled={isSaving}
                            >
                                <span className="kce-addCardPlus">+</span>
                                <span className="kce-addCardText">Add Service</span>

                                {!isSubscribed && servicesCount >= FREE_MAX_SERVICES ? (
                                    <span className="kce-premiumBadge" aria-hidden="true">
                                        <img src={TemplateLockIcon} alt="" />
                                    </span>
                                ) : null}
                            </button>
                        </div>
                    ) : null}
                </div>

                <div className="kce-dividerBlock" />

                <div className="kce-section">
                    <div className="kce-sectionTop">
                        <div className="kce-headingBlock">
                            <span className="kce-pill">Reviews Section</span>
                            <div className="kce-accentLine" />
                        </div>

                        <button
                            type="button"
                            className="kce-hideBtn"
                            onClick={() => sectionToggle(!!showReviewsSection, setShowReviewsSection)}
                            disabled={isSaving}
                        >
                            {showReviewsSection ? "Hide section" : "Show section"}
                        </button>
                    </div>

                    {showReviewsSection ? (
                        <div className="kce-sectionBody">
                            <div className="kce-repeat">
                                {(state.reviews || []).slice(0, maxReviews).map((r, i) => (
                                    <div key={i} className="kce-repeatCard">
                                        <div className="kce-grid2">
                                            <div className="kce-field">
                                                <div className="kce-label">Name</div>
                                                <input
                                                    className="kce-input"
                                                    placeholder="Sarah Thompson"
                                                    value={r.name || ""}
                                                    onChange={(e) => handleReviewChange(i, "name", e.target.value)}
                                                    disabled={isSaving}
                                                />
                                            </div>

                                            <div className="kce-field">
                                                <div className="kce-label">Rating</div>
                                                <StarRating
                                                    value={r.rating || 5}
                                                    disabled={isSaving}
                                                    onChange={(val) => handleReviewChange(i, "rating", val)}
                                                />
                                            </div>
                                        </div>

                                        <div className="kce-field">
                                            <div className="kce-label">Review</div>
                                            <textarea
                                                className="kce-input kce-textarea"
                                                rows={3}
                                                placeholder="Write the review..."
                                                value={r.text || ""}
                                                onChange={(e) => handleReviewChange(i, "text", e.target.value)}
                                                disabled={isSaving}
                                            />
                                        </div>

                                        <button
                                            type="button"
                                            className="kce-dangerPill"
                                            onClick={() => handleRemoveReview(i)}
                                            disabled={isSaving}
                                        >
                                            Remove Review
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <button
                                type="button"
                                className="kce-addCard"
                                onClick={handleAddReview}
                                disabled={isSaving}
                            >
                                <span className="kce-addCardPlus">+</span>
                                <span className="kce-addCardText">Add Review</span>

                                {!isSubscribed && reviewsCount >= FREE_MAX_REVIEWS ? (
                                    <span className="kce-premiumBadge" aria-hidden="true">
                                        <img src={TemplateLockIcon} alt="" />
                                    </span>
                                ) : null}
                            </button>
                        </div>
                    ) : null}
                </div>

                <div className="kce-dividerBlock" />

                <div className="kce-section">
                    <div className="kce-sectionTop">
                        <div className="kce-headingBlock">
                            <span className="kce-pill">Contact Section</span>
                            <div className="kce-accentLine" />
                        </div>

                        <button
                            type="button"
                            className="kce-hideBtn"
                            onClick={() => sectionToggle(!!showContactSection, setShowContactSection)}
                            disabled={isSaving}
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
                                        onChange={(e) =>
                                            updateState({
                                                contact_email: e.target.value,
                                            })
                                        }
                                        placeholder={previewPlaceholders.contact_email}
                                        disabled={isSaving}
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
                                        onChange={(e) =>
                                            updateState({
                                                phone_number: e.target.value,
                                            })
                                        }
                                        placeholder={previewPlaceholders.phone_number}
                                        disabled={isSaving}
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
                                        onChange={(e) =>
                                            updateState({
                                                facebook_url: e.target.value,
                                            })
                                        }
                                        disabled={isSaving}
                                    />
                                </div>

                                <div className="kce-socialRow">
                                    <img src={InstagramIcon} alt="" />
                                    <input
                                        className="kce-input"
                                        placeholder="Instagram URL"
                                        value={state.instagram_url || ""}
                                        onChange={(e) =>
                                            updateState({
                                                instagram_url: e.target.value,
                                            })
                                        }
                                        disabled={isSaving}
                                    />
                                </div>

                                <div className="kce-socialRow">
                                    <img src={LinkedInIcon} alt="" />
                                    <input
                                        className="kce-input"
                                        placeholder="LinkedIn URL"
                                        value={state.linkedin_url || ""}
                                        onChange={(e) =>
                                            updateState({
                                                linkedin_url: e.target.value,
                                            })
                                        }
                                        disabled={isSaving}
                                    />
                                </div>

                                <div className="kce-socialRow">
                                    <img src={XIcon} alt="" />
                                    <input
                                        className="kce-input"
                                        placeholder="X URL"
                                        value={state.x_url || ""}
                                        onChange={(e) =>
                                            updateState({
                                                x_url: e.target.value,
                                            })
                                        }
                                        disabled={isSaving}
                                    />
                                </div>

                                <div className="kce-socialRow">
                                    <img src={TikTokIcon} alt="" />
                                    <input
                                        className="kce-input"
                                        placeholder="TikTok URL"
                                        value={state.tiktok_url || ""}
                                        onChange={(e) =>
                                            updateState({
                                                tiktok_url: e.target.value,
                                            })
                                        }
                                        disabled={isSaving}
                                    />
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>

                <div className="kce-bottomSaveWrap">
                    <button
                        type="button"
                        className="kce-btn kce-btnPrimary kce-bottomSaveBtn"
                        onClick={onSubmit}
                        disabled={isSaving}
                        aria-busy={isSaving}
                    >
                        <img
                            src={SaveProfileIcon}
                            alt=""
                            className="kce-btnIcon kce-btnIconSave"
                        />
                        <span>{saveLabel}</span>
                    </button>
                </div>

                <div className="kce-bottomPad" />
            </div>
        </motion.div>
    );
}