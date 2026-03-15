import React from "react";
import ShareOnEditProfileIcon from "../../assets/icons/ShareOnEditProfile.svg";
import ShareOnVisitProfileIcon from "../../assets/icons/ShareOnVisitProfile.svg";

function firstNonEmpty(...values) {
    for (const value of values) {
        if (typeof value === "string" && value.trim()) return value.trim();
    }
    return "";
}

function joinParts(parts = []) {
    return parts
        .map((part) => (typeof part === "string" ? part.trim() : ""))
        .filter(Boolean)
        .join(", ");
}

function getPreviewTheme(profile) {
    const raw = profile?.raw || {};
    const themeCandidate = firstNonEmpty(
        raw?.theme,
        raw?.themeMode,
        raw?.theme_mode,
        raw?.mode,
        raw?.appearance
    ).toLowerCase();

    if (themeCandidate.includes("dark")) return "dark";
    return "light";
}

function getPreviewCover(profile) {
    const raw = profile?.raw || {};
    return (
        raw?.coverPhoto ||
        raw?.cover_photo ||
        raw?.coverImage ||
        raw?.cover_image ||
        raw?.heroImage ||
        raw?.hero_image ||
        raw?.bannerImage ||
        raw?.banner_image ||
        raw?.mainImage ||
        raw?.main_image ||
        ""
    );
}

function getPreviewName(profile) {
    const raw = profile?.raw || {};
    const found = firstNonEmpty(
        raw?.businessName,
        raw?.business_name,
        raw?.companyName,
        raw?.company_name,
        raw?.displayName,
        raw?.display_name,
        raw?.name
    );

    return found || `${profile?.slug || "profile"} profile`;
}

function getPreviewTrade(profile) {
    const raw = profile?.raw || {};
    return (
        firstNonEmpty(
            raw?.tradeTitle,
            raw?.trade_title,
            raw?.jobTitle,
            raw?.job_title,
            raw?.profession,
            raw?.headline,
            raw?.subtitle,
            raw?.tagline
        ) || "Trade title"
    );
}

function getPreviewLocation(profile) {
    const raw = profile?.raw || {};
    return (
        firstNonEmpty(
            raw?.location,
            raw?.addressLine,
            raw?.address_line,
            joinParts([raw?.city, raw?.region]),
            joinParts([raw?.city, raw?.country]),
            joinParts([raw?.town, raw?.country])
        ) || "Location"
    );
}

function getPreviewAccent(profile) {
    const raw = profile?.raw || {};
    const explicit = firstNonEmpty(
        raw?.accentColor,
        raw?.accent_color,
        raw?.primaryColor,
        raw?.primary_color,
        raw?.brandColor,
        raw?.brand_color
    );

    if (explicit) return explicit;

    const templateValue = String(
        raw?.template ||
        raw?.templateId ||
        raw?.template_id ||
        profile?.template ||
        ""
    ).toLowerCase();

    if (templateValue.includes("1")) return "#f59e0b";
    if (templateValue.includes("2")) return "#1d4ed8";
    if (templateValue.includes("3")) return "#3b82f6";
    if (templateValue.includes("4")) return "#ef4444";
    if (templateValue.includes("5")) return "#16a34a";

    return "var(--kc-accent-primary, #f97316)";
}

function ProfileMainPreview({ profile }) {
    const theme = getPreviewTheme(profile);
    const cover = getPreviewCover(profile);
    const name = getPreviewName(profile);
    const trade = getPreviewTrade(profile);
    const location = getPreviewLocation(profile);
    const accent = getPreviewAccent(profile);

    return (
        <div
            className={`profiles-mainPreview profiles-mainPreview--${theme}`}
            style={{ "--profiles-preview-accent": accent }}
        >
            <div className="profiles-mainPreviewInner">
                <div className="profiles-mainPreviewCover">
                    <div className="profiles-mainPreviewTopbar">
                        <span className={`profiles-pill ${profile?.isLive ? "live" : "draft"}`}>
                            {profile?.isLive ? "Live" : "Draft"}
                        </span>
                    </div>

                    {cover ? (
                        <img
                            src={cover}
                            alt={name ? `${name} cover` : "Profile cover"}
                            className="profiles-mainPreviewCoverImg"
                        />
                    ) : (
                        <div className="profiles-mainPreviewCoverFallback" />
                    )}
                </div>

                <div className="profiles-mainPreviewBody">
                    <div className="profiles-mainPreviewCopy">
                        <div className="profiles-mainPreviewName">{name}</div>
                        <div className="profiles-mainPreviewTrade">{trade}</div>
                        <div className="profiles-mainPreviewLocation">{location}</div>
                    </div>

                    <div className="profiles-mainPreviewCtaRow">
                        <button
                            type="button"
                            className="profiles-mainPreviewBtn"
                            tabIndex={-1}
                            aria-hidden="true"
                        >
                            Save My Number
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ClaimCardClosed({ onOpenClaim, suppressClickRef }) {
    return (
        <article className="profiles-addCard profiles-addCard--rail profiles-addCard--pretty">
            <div className="profiles-addCardInner profiles-addCardInner--center">
                <div className="profiles-addBadge profiles-addBadge--centered">New</div>

                <div className="profiles-addPlainPlus" aria-hidden="true">
                    +
                </div>

                <div className="profiles-addHeadline">Add Profile</div>

                <div className="profiles-addSubcopy">
                    Claim a new public link for another service, team, or location.
                </div>

                <div className="profiles-addFeatureList">
                    <div className="profiles-addFeature">Unique link</div>
                    <div className="profiles-addFeature">Own QR code</div>
                    <div className="profiles-addFeature">Separate analytics</div>
                </div>

                <button
                    type="button"
                    className="kx-btn kx-btn--black profiles-addPrimaryBtn"
                    data-no-rail-drag="true"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (suppressClickRef.current) return;
                        onOpenClaim();
                    }}
                >
                    Claim your link
                </button>
            </div>
        </article>
    );
}

function ClaimCardOpen({
    claimRef,
    claimSlugInput,
    claimSlugNormalized,
    claimStatus,
    claimMessage,
    isTeams,
    isPlus,
    isFree,
    sortedProfiles,
    maxProfiles,
    onCloseClaim,
    onCheckAvailability,
    onCreateTeamsProfile,
    onStartTeamsCheckout,
    onClaimInputChange,
}) {
    return (
        <article
            ref={claimRef}
            className="profiles-addInline profiles-addInline--rail profiles-addInline--pretty"
            data-no-rail-drag="true"
        >
            <div className="profiles-addInlineTop">
                <div className="profiles-addBadge profiles-addBadge--centered">New</div>

                <button
                    type="button"
                    className="profiles-addInlineClose"
                    onClick={onCloseClaim}
                    aria-label="Close"
                >
                    ✕
                </button>
            </div>

            <div className="profiles-addInlineHeadCopy profiles-addInlineHeadCopy--center">
                <div className="profiles-addInlineEyebrow">Create new profile</div>
                <div className="profiles-addInlineTitle">Claim your link</div>
            </div>

            <div className="profiles-addInlineIntro profiles-addInlineIntro--center">
                Pick a clean public URL for this profile. This will be the link customers visit.
            </div>

            <div className="profiles-addInlineForm profiles-addInlineForm--stack">
                <div className="profiles-input-wrap">
                    <span className="profiles-input-prefix">{window.location.origin}/u/</span>
                    <input
                        className="profiles-input"
                        value={claimSlugInput}
                        onChange={(e) => onClaimInputChange(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") onCheckAvailability();
                        }}
                        placeholder="plumbing-north-london"
                        aria-label="Profile slug"
                    />
                </div>

                <button
                    type="button"
                    className="kx-btn kx-btn--black profiles-addPrimaryBtn"
                    onClick={onCheckAvailability}
                    disabled={
                        claimStatus === "checking" ||
                        claimStatus === "subscribing" ||
                        claimStatus === "creating"
                    }
                >
                    {claimStatus === "checking" ? "Checking..." : "Check availability"}
                </button>
            </div>

            {claimSlugNormalized ? (
                <div className="profiles-claimPreviewRow profiles-claimPreviewRow--center">
                    <span className="profiles-claimPreviewLabel">Preview</span>
                    <span className="profiles-claimPreviewUrl">
                        {window.location.origin}/u/{claimSlugNormalized || "your-link"}
                    </span>
                </div>
            ) : null}

            {claimMessage ? (
                <div
                    className={`profiles-alert profiles-alert--center ${claimStatus === "available"
                            ? "success"
                            : claimStatus === "error" ||
                                claimStatus === "invalid" ||
                                claimStatus === "taken"
                                ? "danger"
                                : "neutral"
                        }`}
                >
                    {claimMessage}
                </div>
            ) : null}

            {claimStatus === "available" ? (
                <div className="profiles-addInlineActions profiles-addInlineActions--center">
                    <button type="button" className="kx-btn kx-btn--white" onClick={onCloseClaim}>
                        Cancel
                    </button>

                    {isTeams ? (
                        sortedProfiles.length < maxProfiles ? (
                            <button
                                type="button"
                                className="kx-btn kx-btn--orange"
                                onClick={onCreateTeamsProfile}
                                disabled={claimStatus === "creating"}
                            >
                                {claimStatus === "creating" ? "Adding..." : "Add Profile"}
                            </button>
                        ) : (
                            <button
                                type="button"
                                className="kx-btn kx-btn--orange"
                                onClick={onStartTeamsCheckout}
                                disabled={claimStatus === "subscribing"}
                            >
                                {claimStatus === "subscribing"
                                    ? "Opening checkout..."
                                    : "Add profile (+£1.95)"}
                            </button>
                        )
                    ) : (
                        <button
                            type="button"
                            className="kx-btn kx-btn--orange"
                            onClick={onStartTeamsCheckout}
                            disabled={claimStatus === "subscribing"}
                        >
                            {claimStatus === "subscribing" ? "Opening checkout..." : "Upgrade Plan"}
                        </button>
                    )}
                </div>
            ) : null}

            {(isFree || isPlus) ? (
                <div className="profiles-hint profiles-hint--center">
                    Free and Plus allow <strong>1 profile</strong>. Upgrade to <strong>Teams</strong> to add
                    more.
                </div>
            ) : null}
        </article>
    );
}

export default function ProfilesList({
    railRef,
    claimRef,
    suppressClickRef,
    sortedProfiles,
    cappedProfiles,
    selectedProfile,
    maxProfiles,
    claimOpen,
    claimSlugInput,
    claimSlugNormalized,
    claimStatus,
    claimMessage,
    isTeams,
    isPlus,
    isFree,
    onRailPointerDown,
    onRailPointerMove,
    onRailPointerUp,
    onRailPointerLeave,
    onCardSelect,
    onOpenLockedOverlay,
    onEdit,
    onVisitProfile,
    onOpenClaim,
    onCloseClaim,
    onCheckAvailability,
    onCreateTeamsProfile,
    onStartTeamsCheckout,
    onClaimInputChange,
}) {
    return (
        <section className="profiles-card profiles-list-card">
            <div className="profiles-listHeader">
                <div className="profiles-listHeader-left">
                    <h2 className="profiles-listTitle">Your Profiles</h2>
                    <p className="profiles-listSub">Drag sideways to browse your cards.</p>
                </div>

                <span className="profiles-countPill">
                    {sortedProfiles.length} Profile{sortedProfiles.length === 1 ? "" : "s"}
                </span>
            </div>

            <div
                ref={railRef}
                className="profiles-listRail"
                onPointerDown={onRailPointerDown}
                onPointerMove={onRailPointerMove}
                onPointerUp={onRailPointerUp}
                onPointerCancel={onRailPointerUp}
                onPointerLeave={onRailPointerLeave}
            >
                {cappedProfiles.map((p) => {
                    const active = selectedProfile?.slug === p.slug;
                    const locked = p.isLockedByPlan;

                    return (
                        <article
                            key={p.slug}
                            className={`profiles-profileCard profiles-profileCard--rail ${active ? "is-active" : ""
                                } ${locked ? "is-locked" : ""}`}
                            onClick={() => onCardSelect(p.slug, locked)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    if (locked) return onOpenLockedOverlay(p.slug);
                                    onCardSelect(p.slug, false);
                                }
                            }}
                            aria-disabled={locked ? "true" : "false"}
                            style={locked ? { opacity: 0.62, cursor: "pointer" } : undefined}
                        >
                            <div className="profiles-cardPreviewWrap">
                                <ProfileMainPreview profile={p} />
                            </div>

                            <div className="profiles-cardContent">
                                <div className="profiles-profileBottom">
                                    <div className="profiles-updated profiles-updated--centered">
                                        {p.updatedAt}
                                    </div>

                                    <div className="profiles-cardBtns profiles-cardBtns--stack">
                                        <button
                                            type="button"
                                            className="kx-btn kx-btn--orange profiles-cardBtn profiles-cardBtn--withIcon"
                                            disabled={locked}
                                            data-no-rail-drag="true"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (suppressClickRef.current) return;
                                                if (locked) return onOpenLockedOverlay(p.slug);
                                                onEdit(p.slug);
                                            }}
                                        >
                                            <img
                                                src={ShareOnEditProfileIcon}
                                                alt=""
                                                aria-hidden="true"
                                                className="profiles-cardBtnIcon profiles-cardBtnIcon--light"
                                            />
                                            <span>Edit profile</span>
                                        </button>

                                        <button
                                            type="button"
                                            className="kx-btn kx-btn--black profiles-cardBtn profiles-cardBtn--withIcon"
                                            disabled={locked}
                                            data-no-rail-drag="true"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (suppressClickRef.current) return;
                                                if (locked) return onOpenLockedOverlay(p.slug);
                                                onVisitProfile(p.slug);
                                            }}
                                        >
                                            <img
                                                src={ShareOnVisitProfileIcon}
                                                alt=""
                                                aria-hidden="true"
                                                className="profiles-cardBtnIcon profiles-cardBtnIcon--light"
                                            />
                                            <span>Visit profile</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </article>
                    );
                })}

                {!claimOpen ? (
                    <ClaimCardClosed onOpenClaim={onOpenClaim} suppressClickRef={suppressClickRef} />
                ) : (
                    <ClaimCardOpen
                        claimRef={claimRef}
                        claimSlugInput={claimSlugInput}
                        claimSlugNormalized={claimSlugNormalized}
                        claimStatus={claimStatus}
                        claimMessage={claimMessage}
                        isTeams={isTeams}
                        isPlus={isPlus}
                        isFree={isFree}
                        sortedProfiles={sortedProfiles}
                        maxProfiles={maxProfiles}
                        onCloseClaim={onCloseClaim}
                        onCheckAvailability={onCheckAvailability}
                        onCreateTeamsProfile={onCreateTeamsProfile}
                        onStartTeamsCheckout={onStartTeamsCheckout}
                        onClaimInputChange={onClaimInputChange}
                    />
                )}
            </div>
        </section>
    );
}