import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "../../styling/dashboard/preview.css";

import VisitProfileIcon from "../../assets/icons/VisitProfileIcon.svg";

import Template1 from "./Template1";
import Template2 from "./Template2";
import Template3 from "./Template3";
import Template4 from "./Template4";
import Template5 from "./Template5";

import {
    asArray,
    hasValue,
    hasMeaningfulContent,
    getWorkPreview,
    resolveMediaUrl,
} from "../../utils/profileHelpers";

const asString = (v) => (typeof v === "string" ? v : "");

const getTemplateId = (raw) => {
    const t = (raw || "template-1").toString();
    const allowed = new Set([
        "template-1",
        "template-2",
        "template-3",
        "template-4",
        "template-5",
    ]);
    return allowed.has(t) ? t : "template-1";
};

const SECTION_ORDER = ["main", "about", "work", "services", "reviews", "contact"];

function IframePreview({ className, children, title = "Preview" }) {
    const iframeRef = useRef(null);
    const [mountNode, setMountNode] = useState(null);

    useEffect(() => {
        const iframe = iframeRef.current;
        if (!iframe) return;

        let disposed = false;

        const build = () => {
            if (disposed) return;

            const doc = iframe.contentDocument;
            if (!doc) return;

            doc.open();
            doc.write("<!doctype html><html><head></head><body></body></html>");
            doc.close();

            doc.documentElement.style.height = "100%";
            doc.body.style.height = "100%";
            doc.body.style.margin = "0";
            doc.body.style.background = "transparent";
            doc.body.style.overflow = "auto";

            const parentHeadNodes = Array.from(
                document.head.querySelectorAll('link[rel="stylesheet"], style')
            );

            parentHeadNodes.forEach((node) => {
                const clone = node.cloneNode(true);
                doc.head.appendChild(clone);
            });

            const root = doc.createElement("div");
            root.id = "preview-iframe-root";
            root.style.minHeight = "100%";
            root.style.boxSizing = "border-box";
            doc.body.appendChild(root);

            setMountNode(root);
        };

        if (iframe.contentDocument?.readyState === "complete") build();
        iframe.addEventListener("load", build);

        return () => {
            disposed = true;
            iframe.removeEventListener("load", build);
            setMountNode(null);
        };
    }, []);

    return (
        <div className={`preview-iframe-shell ${className || ""}`}>
            <iframe
                ref={iframeRef}
                className="preview-iframe"
                title={title}
                sandbox="allow-same-origin"
            />
            {mountNode ? createPortal(children, mountNode) : null}
        </div>
    );
}

function PreviewEmptyState({ themeMode = "light" }) {
    return (
        <div className={`preview-empty-state theme-${themeMode}`}>
            <div className="preview-empty-surface">
                <p className="preview-empty-text">
                    Please add your info to preview your profile.
                </p>
            </div>
        </div>
    );
}

function PreviewHeader({
    isLive,
    completionPct,
    completionTone,
    hasSavedData,
    visitUrl,
}) {
    const canVisit = !!visitUrl && visitUrl !== "#";
    const safePct = Number.isFinite(Number(completionPct)) ? Number(completionPct) : 0;

    const completionLabel =
        hasSavedData && safePct >= 100
            ? "Profile Complete"
            : `${safePct}% Complete`;

    return (
        <div className="preview-panel-top">
            <div className="preview-panel-topMain">
                <div className="preview-panel-topLeft">
                    <h2 className="preview-panel-title">Profile Preview</h2>
                    <p className="preview-panel-sub">See how your profile will look live.</p>
                </div>

                <div className="preview-panel-topRight">
                    <div className="preview-panel-pills">
                        <span className={`preview-panel-pill ${isLive ? "live" : "draft"}`}>
                            {isLive ? "Live" : "Draft"}
                        </span>

                        <span className={`preview-panel-pill completion ${completionTone || "bad"}`}>
                            {completionLabel}
                        </span>
                    </div>

                    <a
                        href={canVisit ? visitUrl : "#"}
                        className="preview-panel-visitBtn"
                        target="_blank"
                        rel="noreferrer"
                        aria-disabled={!canVisit}
                        onClick={(e) => {
                            if (!canVisit) e.preventDefault();
                        }}
                    >
                        <img
                            src={VisitProfileIcon}
                            alt=""
                            aria-hidden="true"
                            className="preview-panel-visitBtnIcon"
                        />
                        <span>Visit Profile</span>
                    </a>
                </div>
            </div>
        </div>
    );
}

export default function Preview({
    state,
    isMobile,
    hasSavedData,

    showMainSection,
    showAboutMeSection,
    showWorkSection,
    showServicesSection,
    showReviewsSection,
    showContactSection,

    hasExchangeContact,
    visitUrl,
    isLive,
    completionPct,
    completionTone,
    columnScrollStyle,
}) {
    const [previewOpen] = useState(true);
    const mpWrapRef = useRef(null);

    const s = state || {};

    const templateId = getTemplateId(s.template_id || s.templateId || "template-1");
    const themeMode = asString(s.themeMode || s.pageTheme || "light") || "light";

    const hasAnyEnteredContent = useMemo(() => {
        return hasMeaningfulContent({
            business_name: s.business_name,
            business_card_name: s.businessName,
            main_heading: s.mainHeading || s.main_heading,
            trade_title: s.trade_title,
            sub_heading: s.subHeading || s.sub_heading,
            location: s.location,
            full_name: s.full_name,
            job_title: s.job_title,
            bio: s.bio,
            contact_email: s.contact_email,
            phone_number: s.phone_number,
            facebook_url: s.facebook_url,
            instagram_url: s.instagram_url,
            linkedin_url: s.linkedin_url,
            x_url: s.x_url,
            tiktok_url: s.tiktok_url,
            cover_photo:
                s.coverPhotoPreview ||
                resolveMediaUrl(s.coverPhoto || s.cover_photo),
            logo:
                s.logoPreview ||
                resolveMediaUrl(s.logo),
            avatar:
                s.avatarPreview ||
                resolveMediaUrl(s.avatar || s.avatar_url),
            works: asArray(s.workImages || s.works).map((item) => getWorkPreview(item)),
            services: s.services,
            reviews: s.reviews,
        });
    }, [s]);

    const showEmptyPreview = !hasAnyEnteredContent;

    const vm = useMemo(() => {
        const businessName =
            asString(s.business_name) ||
            asString(s.businessName) ||
            asString(s.mainHeading) ||
            asString(s.main_heading);

        const tradeTitle =
            asString(s.trade_title) ||
            asString(s.subHeading) ||
            asString(s.sub_heading);

        const location = asString(s.location);
        const fullName = asString(s.full_name);
        const jobTitle = asString(s.job_title);
        const bio = asString(s.bio);
        const email = asString(s.contact_email);
        const phone = asString(s.phone_number);

        const cover =
            s.coverPhotoPreview ||
            resolveMediaUrl(s.coverPhoto || s.cover_photo) ||
            "";

        const logo =
            s.logoPreview ||
            resolveMediaUrl(s.logo || s.avatar) ||
            "";

        const avatar =
            s.avatarPreview ||
            resolveMediaUrl(s.avatar || s.avatar_url || s.logo) ||
            "";

        const works = asArray(s.workImages || s.works)
            .map((item) => {
                if (typeof item === "string") {
                    const preview = getWorkPreview(item);
                    return preview || null;
                }

                if (item && typeof item === "object") {
                    return {
                        ...item,
                        preview: getWorkPreview(item),
                    };
                }

                return null;
            })
            .filter((item) => {
                if (!item) return false;
                if (typeof item === "string") return hasValue(item);
                return hasValue(item.preview);
            });

        const services = asArray(s.services)
            .map((item) => ({
                name: asString(item?.name),
                description: asString(item?.description || item?.price),
                price: asString(item?.price || item?.description),
            }))
            .filter(
                (item) =>
                    hasValue(item.name) ||
                    hasValue(item.description) ||
                    hasValue(item.price)
            );

        const reviews = asArray(s.reviews)
            .map((item) => ({
                name: asString(item?.name),
                text: asString(item?.text),
                rating: Number(item?.rating) || 0,
            }))
            .filter(
                (item) =>
                    hasValue(item.name) ||
                    hasValue(item.text) ||
                    item.rating > 0
            );

        const socials = {
            facebook_url: asString(s.facebook_url),
            instagram_url: asString(s.instagram_url),
            linkedin_url: asString(s.linkedin_url),
            x_url: asString(s.x_url),
            tiktok_url: asString(s.tiktok_url),
        };

        const hasContact = !!(email || phone);

        return {
            templateId,
            themeMode,
            sectionOrder: SECTION_ORDER,

            showMainSection: !!showMainSection,
            showAboutMeSection: !!showAboutMeSection,
            showWorkSection: !!showWorkSection,
            showServicesSection: !!showServicesSection,
            showReviewsSection: !!showReviewsSection,
            showContactSection: !!showContactSection,

            cover,
            logo,
            businessName,
            tradeTitle,
            location,
            fullName,
            jobTitle,
            bio,
            works,
            services,
            reviews,
            email,
            phone,
            socials,

            avatar,
            mainHeading: businessName,
            subHeading: tradeTitle,

            hasContact,
            hasExchangeContact: !!hasExchangeContact,
            visitUrl: visitUrl || "#",

            onSaveMyNumber: () => { },
            onOpenExchangeContact: () => { },
            onExchangeContact: () => { },
        };
    }, [
        s,
        templateId,
        themeMode,
        hasExchangeContact,
        visitUrl,
        showMainSection,
        showAboutMeSection,
        showWorkSection,
        showServicesSection,
        showReviewsSection,
        showContactSection,
    ]);

    useEffect(() => {
        if (!isMobile) return;
        const el = mpWrapRef.current;
        if (!el) return;

        el.style.overflow = "hidden";
        el.style.willChange = "max-height, opacity, transform";

        const handleEnd = (e) => {
            if (e.propertyName !== "max-height") return;
            if (previewOpen) el.style.maxHeight = "none";
            el.removeEventListener("transitionend", handleEnd);
        };

        if (previewOpen) {
            el.style.maxHeight = "0px";
            el.style.opacity = "0";
            el.style.transform = "scale(.98)";

            const target = el.scrollHeight;

            requestAnimationFrame(() => {
                el.style.maxHeight = `${target}px`;
                el.style.opacity = "1";
                el.style.transform = "scale(1)";
            });

            el.addEventListener("transitionend", handleEnd);
        } else {
            const current = el.scrollHeight;
            el.style.maxHeight = `${current}px`;
            void el.offsetHeight;
            el.style.maxHeight = "0px";
            el.style.opacity = "0";
            el.style.transform = "scale(.98)";
        }

        return () => el.removeEventListener("transitionend", handleEnd);
    }, [isMobile, previewOpen]);

    const TemplateComponent =
        templateId === "template-2"
            ? Template2
            : templateId === "template-3"
                ? Template3
                : templateId === "template-4"
                    ? Template4
                    : templateId === "template-5"
                        ? Template5
                        : Template1;

    const templateProps = { vm, data: vm, isMobile };

    if (isMobile) {
        return (
            <div className="preview-scope myprofile-preview-wrapper" style={columnScrollStyle}>
                <div className={`myprofile-preview template-${templateId} theme-${themeMode}`}>
                    <PreviewHeader
                        isLive={!!isLive}
                        completionPct={Number(completionPct) || 0}
                        completionTone={completionTone}
                        hasSavedData={!!hasSavedData}
                        visitUrl={visitUrl}
                    />

                    <div className="mp-preview-wrap open" ref={mpWrapRef}>
                        {showEmptyPreview ? (
                            <PreviewEmptyState themeMode={themeMode} />
                        ) : (
                            <div className="preview-page-gutter">
                                <TemplateComponent {...templateProps} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="preview-scope myprofile-preview-wrapper" style={columnScrollStyle}>
            <div className={`myprofile-preview template-${templateId} theme-${themeMode}`}>
                <PreviewHeader
                    isLive={!!isLive}
                    completionPct={Number(completionPct) || 0}
                    completionTone={completionTone}
                    hasSavedData={!!hasSavedData}
                    visitUrl={visitUrl}
                />

                {showEmptyPreview ? (
                    <div className="preview-empty-shell">
                        <PreviewEmptyState themeMode={themeMode} />
                    </div>
                ) : (
                    <IframePreview
                        className="preview-iframe-mode"
                        title={`Template Preview (${templateId})`}
                    >
                        <div className="preview-iframe-padding">
                            <div className="preview-page-gutter">
                                <TemplateComponent {...templateProps} />
                            </div>
                        </div>
                    </IframePreview>
                )}
            </div>
        </div>
    );
}