import React, { useRef, useState, useEffect, useMemo } from "react";
import { previewPlaceholders } from "../../../store/businessCardStore";

/* Social icons */
import FacebookIcon from "../../../assets/icons/icons8-facebook.svg";
import InstagramIcon from "../../../assets/icons/icons8-instagram.svg";
import LinkedInIcon from "../../../assets/icons/icons8-linkedin.svg";
import XIcon from "../../../assets/icons/icons8-x.svg";
import TikTokIcon from "../../../assets/icons/icons8-tiktok.svg";

/* Color wheel lib */
import iro from "@jaames/iro";

/* contrast helper */
const getContrastColor = (hex = "#000000") => {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec((hex || "").trim());
    if (!m) return "#111";
    const r = parseInt(m[1], 16);
    const g = parseInt(m[2], 16);
    const b = parseInt(m[3], 16);
    const L = 0.2126 * (r / 255) + 0.7152 * (g / 255) + 0.0722 * (b / 255);
    return L > 0.6 ? "#111" : "#fff";
};

function SectionHeader({ title, subtitle, open, onToggle, rightSlot }) {
    return (
        <div className="kc-sec-head">
            <button type="button" className="kc-sec-toggle" onClick={onToggle} aria-expanded={open}>
                <div className="kc-sec-titlewrap">
                    <div className="kc-sec-title">{title}</div>
                    {subtitle ? <div className="kc-sec-sub">{subtitle}</div> : null}
                </div>
                <span className={`kc-sec-chevron ${open ? "open" : ""}`} aria-hidden="true">
                    ▾
                </span>
            </button>

            {rightSlot ? <div className="kc-sec-right">{rightSlot}</div> : null}
        </div>
    );
}

export default function Editor({
    state,
    updateState,

    isSubscribed, // plus/teams
    hasTrialEnded, // legacy ignored

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

    // color wheel popover
    const [wheelOpen, setWheelOpen] = useState(false);
    const triggerRef = useRef(null);
    const popoverRef = useRef(null);
    const wheelMountRef = useRef(null);

    const TEMPLATE_IDS = ["template-1", "template-2", "template-3", "template-4", "template-5"];
    const currentTemplate = (state.templateId || "template-1").toString();

    const isTemplateLocked = (templateId) => {
        if (!isSubscribed && templateId !== "template-1") return true;
        return false;
    };

    const handleTemplateSelect = (id) => {
        if (isTemplateLocked(id)) {
            onStartSubscription?.();
            return;
        }
        updateState({ templateId: id });
    };

    // button bg + contrast
    const pickedBg = state.buttonBgColor || "#1E2A38";
    const pickedInk = useMemo(() => getContrastColor(pickedBg), [pickedBg]);

    // init iro when open
    useEffect(() => {
        if (!wheelOpen || !wheelMountRef.current) return;

        wheelMountRef.current.innerHTML = "";

        const picker = new iro.ColorPicker(wheelMountRef.current, {
            width: 210,
            color: pickedBg,
            layout: [
                { component: iro.ui.Wheel },
                { component: iro.ui.Slider, options: { sliderType: "value" } },
            ],
        });

        const onChange = (color) => updateState({ buttonBgColor: color.hexString });
        picker.on("color:change", onChange);

        return () => {
            picker.off("color:change", onChange);
            if (wheelMountRef.current) wheelMountRef.current.innerHTML = "";
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [wheelOpen]);

    // close popover
    useEffect(() => {
        if (!wheelOpen) return;
        const onDocClick = (e) => {
            const t = e.target;
            if (popoverRef.current?.contains(t) || triggerRef.current?.contains(t)) return;
            setWheelOpen(false);
        };
        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, [wheelOpen]);

    // services
    const handleServiceChange = (i, field, value) => {
        const next = [...(state.services || [])];
        next[i] = { ...(next[i] || {}), [field]: value };
        updateState({ services: next });
    };

    const handleAddService = () =>
        updateState({ services: [...(state.services || []), { name: "", price: "" }] });

    const handleRemoveService = (i) =>
        updateState({ services: (state.services || []).filter((_, idx) => idx !== i) });

    // reviews
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

    // section order
    const readableSectionName = (key) =>
    ({
        main: "Main",
        about: "About Me",
        work: "My Work",
        services: "My Services",
        reviews: "Reviews",
        contact: "Contact",
    }[key] || key);

    const defaultOrder = ["main", "about", "work", "services", "reviews", "contact"];

    const sanitizeOrder = (order) => {
        const KNOWN = new Set(defaultOrder);
        const seen = new Set();
        const cleaned = (Array.isArray(order) ? order : defaultOrder)
            .filter((k) => KNOWN.has(k))
            .filter((k) => (seen.has(k) ? false : seen.add(k)));

        const rest = cleaned.filter((k) => k !== "main");
        const missing = defaultOrder.filter((k) => !cleaned.includes(k) && k !== "main");
        return ["main", ...rest, ...missing];
    };

    const currentOrder = sanitizeOrder(state.sectionOrder?.length ? state.sectionOrder : defaultOrder);

    const moveSectionUp = (idx) => {
        if (idx <= 1) return;
        const next = [...currentOrder];
        [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
        updateState({ sectionOrder: sanitizeOrder(next) });
    };

    const moveSectionDown = (idx) => {
        if (currentOrder[idx] === "main" || idx >= currentOrder.length - 1) return;
        const next = [...currentOrder];
        [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]];
        updateState({ sectionOrder: sanitizeOrder(next) });
    };

    return (
        <div className="kc-editor-scope" id="myprofile-editor" style={columnScrollStyle}>
            <form onSubmit={onSubmit} className="kc-editor-card">
                {/* Header */}
                <div className="kc-editor-head">
                    <div className="kc-editor-head-left">
                        <div className="kc-editor-h1">Edit your profile</div>
                        <div className="kc-editor-h2">Update your card — changes go live when you publish.</div>
                    </div>

                    <div className="kc-editor-head-actions">
                        <button type="button" className="kc-btn kc-btn-ghost" onClick={onResetPage}>
                            Reset
                        </button>
                        <button type="submit" className="kc-btn kc-btn-primary">
                            Publish
                        </button>
                    </div>
                </div>

                {/* Template picker */}
                <div className="kc-block">
                    <div className="kc-block-title">Template</div>
                    <div className="kc-template-row">
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
                                >
                                    <span>{t.replace("-", " ").toUpperCase()}</span>
                                    {locked ? <span className="kc-lock">🔒</span> : null}
                                </button>
                            );
                        })}
                    </div>

                    {!isSubscribed ? (
                        <div className="kc-help">
                            Free users can use <strong>TEMPLATE 1</strong> only. Upgrade to unlock Templates 2–5.
                        </div>
                    ) : null}
                </div>

                {/* Theme + Font */}
                <div className="kc-grid-2">
                    <div className="kc-block">
                        <div className="kc-block-title">Page theme</div>
                        <div className="kc-chip-row">
                            <button
                                type="button"
                                className={`kc-chip ${state.pageTheme === "light" ? "active" : ""}`}
                                onClick={() => updateState({ pageTheme: "light" })}
                            >
                                Light
                            </button>
                            <button
                                type="button"
                                className={`kc-chip ${state.pageTheme === "dark" ? "active" : ""}`}
                                onClick={() => updateState({ pageTheme: "dark" })}
                            >
                                Dark
                            </button>
                        </div>
                    </div>

                    <div className="kc-block">
                        <div className="kc-block-title">Font</div>
                        <div className="kc-chip-row">
                            {["Inter", "Montserrat", "Poppins"].map((font) => (
                                <button
                                    type="button"
                                    key={font}
                                    className={`kc-chip ${state.font === font ? "active" : ""}`}
                                    onClick={() => updateState({ font })}
                                >
                                    {font}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Button style */}
                <div className="kc-divider" />

                <div className="kc-block">
                    <div className="kc-block-title">Button style</div>

                    <div className="kc-grid-2">
                        <div className="kc-mini">
                            <div className="kc-mini-label">Background</div>

                            <div className="kc-color-wrap">
                                <button
                                    ref={triggerRef}
                                    type="button"
                                    className="kc-color-chip"
                                    style={{ "--picked": pickedBg, "--pickedInk": pickedInk }}
                                    onClick={() => setWheelOpen((v) => !v)}
                                >
                                    <span className="kc-color-chip-text">Choose colour</span>
                                </button>

                                {wheelOpen && (
                                    <div ref={popoverRef} className="kc-color-pop">
                                        <div ref={wheelMountRef} />
                                        <div className="kc-color-preview" style={{ background: pickedBg }} />
                                        <div className="kc-color-actions">
                                            <button type="button" className="kc-btn kc-btn-primary" onClick={() => setWheelOpen(false)}>
                                                Done
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="kc-mini">
                            <div className="kc-mini-label">Text colour</div>
                            <div className="kc-chip-row">
                                {["white", "black"].map((c) => (
                                    <button
                                        key={c}
                                        type="button"
                                        className={`kc-chip ${state.buttonTextColor === c ? "active" : ""}`}
                                        onClick={() => updateState({ buttonTextColor: c })}
                                    >
                                        {c[0].toUpperCase() + c.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Alignment */}
                <div className="kc-block">
                    <div className="kc-block-title">Text alignment</div>
                    <div className="kc-chip-row">
                        {["left", "center", "right"].map((a) => (
                            <button
                                key={a}
                                type="button"
                                className={`kc-chip ${state.textAlignment === a ? "active" : ""}`}
                                onClick={() => updateState({ textAlignment: a })}
                            >
                                {a[0].toUpperCase() + a.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Section order */}
                <div className="kc-divider" />
                <div className="kc-block">
                    <div className="kc-block-title">Section order</div>

                    <ul className="kc-sort">
                        {currentOrder.map((key, idx) => {
                            const isMain = key === "main";
                            const canMoveUp = !isMain && idx > 1;
                            const canMoveDown = !isMain && idx < currentOrder.length - 1;

                            return (
                                <li key={key} className="kc-sort-item">
                                    <span className="kc-grip" aria-hidden="true">
                                        ⋮⋮
                                    </span>

                                    <span className="kc-sort-name">{readableSectionName(key)}</span>

                                    <div className="kc-sort-actions">
                                        {isMain ? (
                                            <button type="button" className="kc-iconbtn" disabled title="Main section is locked">
                                                🔒
                                            </button>
                                        ) : (
                                            <>
                                                <button type="button" className="kc-iconbtn" disabled={!canMoveUp} onClick={() => moveSectionUp(idx)}>
                                                    ↑
                                                </button>
                                                <button type="button" className="kc-iconbtn" disabled={!canMoveDown} onClick={() => moveSectionDown(idx)}>
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

                {/* MAIN */}
                <div className="kc-divider" />
                <div className="kc-section">
                    <SectionHeader
                        title="Main section"
                        subtitle="Cover image + headings"
                        open={showMainSection}
                        onToggle={() => setShowMainSection(!showMainSection)}
                    />

                    {showMainSection ? (
                        <div className="kc-section-body">
                            <div className="kc-block">
                                <div className="kc-block-title">Cover photo</div>

                                <input
                                    ref={coverInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) onCoverUpload?.(file);
                                    }}
                                    style={{ display: "none" }}
                                />

                                <button
                                    type="button"
                                    className="kc-upload"
                                    onClick={() => coverInputRef.current?.click()}
                                >
                                    {state.coverPhoto ? (
                                        <img
                                            src={state.coverPhoto || previewPlaceholders.coverPhoto}
                                            alt="Cover"
                                            className="kc-upload-img"
                                        />
                                    ) : (
                                        <span className="kc-upload-text">+ Upload cover image</span>
                                    )}

                                    {state.coverPhoto ? (
                                        <span
                                            className="kc-upload-x"
                                            role="button"
                                            aria-label="Remove cover"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
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
                        </div>
                    ) : null}
                </div>

                {/* ABOUT */}
                <div className="kc-divider" />
                <div className="kc-section">
                    <SectionHeader
                        title="About me"
                        subtitle="Avatar + name + job + bio"
                        open={showAboutMeSection}
                        onToggle={() => setShowAboutMeSection(!showAboutMeSection)}
                    />

                    {showAboutMeSection ? (
                        <div className="kc-section-body">
                            <div className="kc-grid-2">
                                <div className="kc-block">
                                    <div className="kc-block-title">Profile photo</div>

                                    <input
                                        ref={avatarInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) onAvatarUpload?.(file);
                                        }}
                                        style={{ display: "none" }}
                                    />

                                    <button type="button" className="kc-upload kc-upload-square" onClick={() => avatarInputRef.current?.click()}>
                                        {state.avatar ? (
                                            <img src={state.avatar} alt="Avatar" className="kc-upload-img" />
                                        ) : (
                                            <span className="kc-upload-text">+ Add profile picture / logo</span>
                                        )}

                                        {state.avatar ? (
                                            <span
                                                className="kc-upload-x"
                                                role="button"
                                                aria-label="Remove avatar"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    onRemoveAvatar?.();
                                                }}
                                            >
                                                ✕
                                            </span>
                                        ) : null}
                                    </button>
                                </div>

                                <div className="kc-block">
                                    <div className="kc-block-title">About layout</div>
                                    <div className="kc-chip-row">
                                        <button
                                            type="button"
                                            className={`kc-chip ${aboutMeLayout === "side-by-side" ? "active" : ""}`}
                                            onClick={() => setAboutMeLayout?.("side-by-side")}
                                        >
                                            Side-by-side
                                        </button>
                                        <button
                                            type="button"
                                            className={`kc-chip ${aboutMeLayout === "stacked" ? "active" : ""}`}
                                            onClick={() => setAboutMeLayout?.("stacked")}
                                        >
                                            Stacked
                                        </button>
                                    </div>
                                </div>
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

                {/* WORK */}
                <div className="kc-divider" />
                <div className="kc-section">
                    <SectionHeader
                        title="My work"
                        subtitle="Upload up to 10 images"
                        open={showWorkSection}
                        onToggle={() => setShowWorkSection(!showWorkSection)}
                        rightSlot={
                            <div className="kc-chip-row kc-chip-row-mini">
                                {["list", "grid"].map((m) => (
                                    <button
                                        key={m}
                                        type="button"
                                        className={`kc-chip kc-chip-sm ${String(state.workDisplayMode || "list") === m ? "active" : ""}`}
                                        onClick={() => updateState({ workDisplayMode: m })}
                                    >
                                        {m[0].toUpperCase() + m.slice(1)}
                                    </button>
                                ))}
                            </div>
                        }
                    />

                    {showWorkSection ? (
                        <div className="kc-section-body">
                            <div className="kc-work-grid">
                                {(state.workImages || []).map((item, i) => (
                                    <div key={i} className="kc-work-item">
                                        <img src={item.preview || item} alt={`work-${i}`} />
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
                                    if (files.length) onAddWorkImages?.(files);
                                }}
                            />
                        </div>
                    ) : null}
                </div>

                {/* SERVICES */}
                <div className="kc-divider" />
                <div className="kc-section">
                    <SectionHeader
                        title="My services"
                        subtitle="Add services & pricing"
                        open={showServicesSection}
                        onToggle={() => setShowServicesSection(!showServicesSection)}
                        rightSlot={
                            <div className="kc-chip-row kc-chip-row-mini">
                                {["list", "cards"].map((m) => (
                                    <button
                                        key={m}
                                        type="button"
                                        className={`kc-chip kc-chip-sm ${String(servicesDisplayMode || "list") === m ? "active" : ""}`}
                                        onClick={() => setServicesDisplayMode?.(m)}
                                    >
                                        {m[0].toUpperCase() + m.slice(1)}
                                    </button>
                                ))}
                            </div>
                        }
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
                                            <button type="button" className="kc-btn kc-btn-danger" onClick={() => handleRemoveService(i)}>
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button type="button" className="kc-btn kc-btn-ghost kc-btn-wide" onClick={handleAddService}>
                                + Add service
                            </button>
                        </div>
                    ) : null}
                </div>

                {/* REVIEWS */}
                <div className="kc-divider" />
                <div className="kc-section">
                    <SectionHeader
                        title="Reviews"
                        subtitle="Show social proof"
                        open={showReviewsSection}
                        onToggle={() => setShowReviewsSection(!showReviewsSection)}
                        rightSlot={
                            <div className="kc-chip-row kc-chip-row-mini">
                                {["list", "cards"].map((m) => (
                                    <button
                                        key={m}
                                        type="button"
                                        className={`kc-chip kc-chip-sm ${String(reviewsDisplayMode || "list") === m ? "active" : ""}`}
                                        onClick={() => setReviewsDisplayMode?.(m)}
                                    >
                                        {m[0].toUpperCase() + m.slice(1)}
                                    </button>
                                ))}
                            </div>
                        }
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
                                            <button type="button" className="kc-btn kc-btn-danger" onClick={() => handleRemoveReview(i)}>
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button type="button" className="kc-btn kc-btn-ghost kc-btn-wide" onClick={handleAddReview}>
                                + Add review
                            </button>
                        </div>
                    ) : null}
                </div>

                {/* CONTACT */}
                <div className="kc-divider" />
                <div className="kc-section">
                    <SectionHeader
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
                    ) : null}
                </div>

                {/* Bottom actions (desktop + long forms) */}
                <div className="kc-bottom-actions">
                    <button type="button" className="kc-btn kc-btn-ghost" onClick={onResetPage}>
                        Reset page
                    </button>
                    <button type="submit" className="kc-btn kc-btn-primary">
                        Publish now
                    </button>
                </div>
            </form>
        </div>
    );
}
