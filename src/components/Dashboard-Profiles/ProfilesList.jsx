import React from "react";

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
                            : claimStatus === "error" || claimStatus === "invalid" || claimStatus === "taken"
                                ? "danger"
                                : "neutral"
                        }`}
                >
                    {claimMessage}
                </div>
            ) : null}

            {claimStatus === "available" ? (
                <div className="profiles-addInlineActions profiles-addInlineActions--center">
                    <button
                        type="button"
                        className="kx-btn kx-btn--white"
                        onClick={onCloseClaim}
                    >
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
                                {claimStatus === "subscribing" ? "Opening checkout..." : "Add profile (+£1.95)"}
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
                    Free and Plus allow <strong>1 profile</strong>. Upgrade to <strong>Teams</strong> to add more.
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
    ProfileMiniMainPreview,
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
                            className={`profiles-profileCard profiles-profileCard--rail ${active ? "is-active" : ""} ${locked ? "is-locked" : ""}`}
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
                            <div className="profiles-profileTopCentered">
                                <div className="profiles-pillRow profiles-pillRow--centered">
                                    <span className={`profiles-pill ${p.isLive ? "live" : "draft"}`}>
                                        {p.isLive ? "Live" : "Draft"}
                                    </span>

                                    <span className={`profiles-pill completion ${p.tone}`}>
                                        {p.pct >= 95 ? "Profile Complete" : `${p.pct}% Complete`}
                                    </span>

                                    {locked ? (
                                        <span className="profiles-pill profiles-pill--locked">Locked</span>
                                    ) : null}
                                </div>

                                <div className="profiles-slug profiles-slug--centered">{p.slug}</div>
                                <div className="profiles-updated profiles-updated--centered">{p.updatedAt}</div>
                            </div>

                            <div className="profiles-staticFrame profiles-staticFrame--square">
                                <div className="profiles-staticViewport">
                                    <ProfileMiniMainPreview card={p.raw} />
                                </div>
                            </div>

                            <div className="profiles-profileBottom">
                                <div className="profiles-metrics profiles-metrics--card">
                                    <div className="profiles-metric">
                                        <div className="profiles-metricVal">{p.views}</div>
                                        <div className="profiles-metricLab">Views</div>
                                    </div>

                                    <div className="profiles-metric">
                                        <div className="profiles-metricVal">{p.linkTaps}</div>
                                        <div className="profiles-metricLab">Link Taps</div>
                                    </div>
                                </div>

                                <div className="profiles-cardBtns profiles-cardBtns--stack">
                                    <button
                                        type="button"
                                        className="kx-btn kx-btn--white profiles-cardBtn"
                                        disabled={locked}
                                        data-no-rail-drag="true"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (suppressClickRef.current) return;
                                            if (locked) return onOpenLockedOverlay(p.slug);
                                            onEdit(p.slug);
                                        }}
                                    >
                                        Edit
                                    </button>

                                    <button
                                        type="button"
                                        className="kx-btn kx-btn--black profiles-cardBtn"
                                        disabled={locked}
                                        data-no-rail-drag="true"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (suppressClickRef.current) return;
                                            if (locked) return onOpenLockedOverlay(p.slug);
                                            onVisitProfile(p.slug);
                                        }}
                                    >
                                        Visit profile
                                    </button>
                                </div>
                            </div>
                        </article>
                    );
                })}

                {!claimOpen ? (
                    <ClaimCardClosed
                        onOpenClaim={onOpenClaim}
                        suppressClickRef={suppressClickRef}
                    />
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