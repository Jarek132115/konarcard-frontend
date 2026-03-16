import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { previewPlaceholders } from "../../store/businessCardStore";
import "../../styling/dashboard/preview.css";

import VisitProfileIcon from "../../assets/icons/VisitProfileIcon.svg";

import Template1 from "./Template1";
import Template2 from "./Template2";
import Template3 from "./Template3";
import Template4 from "./Template4";
import Template5 from "./Template5";

const asArray = (v) => (Array.isArray(v) ? v : []);
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

const hasValue = (v) => typeof v === "string" && v.trim().length > 0;
const hasAsset = (v) => typeof v === "string" && v.trim().length > 0;

function IframePreview({ className, children, title = "Preview" }) {
    const iframeRef = useRef(null);
    const [mountNode, setMountNode] = useState(null);

    useEffect(() => {
        const iframe = iframeRef.current;
        if (!iframe) return;

        const build = () => {
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

        return () => iframe.removeEventListener("load", build);
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
                <p className="preview-empty-text">Add your info to see your preview.</p>
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
    const completionLabel =
        hasSavedData && completionPct >= 100
            ? "Profile Complete"
            : `${completionPct}% Complete`;

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
                        href={visitUrl || "#"}
                        className="preview-panel-visitBtn"
                        target="_blank"
                        rel="noreferrer"
                        aria-disabled={!visitUrl || visitUrl === "#"}
                        onClick={(e) => {
                            if (!visitUrl || visitUrl === "#") e.preventDefault();
                        }}
                    >
                        <img src={VisitProfileIcon} alt="" aria-hidden="true" />
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
    const ph = previewPlaceholders || {};

    const templateId = getTemplateId(s.template_id || s.templateId || "template-1");
    const themeMode = asString(s.themeMode || s.pageTheme || "light") || "light";

    const hasAnyEnteredContent = useMemo(() => {
        const textFields = [
            s.business_name,
            s.businessName,
            s.mainHeading,
            s.main_heading,
            s.trade_title,
            s.subHeading,
            s.sub_heading,
            s.location,
            s.full_name,
            s.job_title,
            s.bio,
            s.contact_email,
            s.phone_number,
            s.facebook_url,
            s.instagram_url,
            s.linkedin_url,
            s.x_url,
            s.tiktok_url,
        ];

        const hasText = textFields.some(hasValue);

        const hasImages = [
            s.coverPhotoPreview,
            s.coverPhoto,
            s.cover_photo,
            s.logoPreview,
            s.logo,
            s.avatarPreview,
            s.avatar,
            s.avatar_url,
        ].some(hasAsset);

        const hasWorks = asArray(s.workImages || s.works).length > 0;
        const hasServices = asArray(s.services).some(
            (item) => hasValue(item?.name) || hasValue(item?.description) || hasValue(item?.price)
        );
        const hasReviews = asArray(s.reviews).some(
            (item) => hasValue(item?.name) || hasValue(item?.text) || Number(item?.rating) > 0
        );

        return hasText || hasImages || hasWorks || hasServices || hasReviews;
    }, [s]);

    const shouldShowPlaceholders = hasAnyEnteredContent && !hasSavedData;
    const showEmptyPreview = !hasAnyEnteredContent;

    const vm = useMemo(() => {
        const businessName =
            asString(s.business_name) ||
            asString(s.businessName) ||
            asString(s.mainHeading) ||
            asString(s.main_heading) ||
            (shouldShowPlaceholders ? asString(ph.business_name || ph.main_heading) : "");

        const tradeTitle =
            asString(s.trade_title) ||
            asString(s.subHeading) ||
            asString(s.sub_heading) ||
            (shouldShowPlaceholders ? asString(ph.trade_title || ph.sub_heading) : "");

        const location =
            asString(s.location) ||
            (shouldShowPlaceholders ? asString(ph.location) : "");

        const fullName =
            asString(s.full_name) ||
            (shouldShowPlaceholders ? asString(ph.full_name) : "");

        const jobTitle =
            asString(s.job_title) ||
            (shouldShowPlaceholders ? asString(ph.job_title) : "");

        const bio =
            asString(s.bio) ||
            (shouldShowPlaceholders ? asString(ph.bio) : "");

        const email =
            asString(s.contact_email) ||
            (shouldShowPlaceholders ? asString(ph.contact_email) : "");

        const phone =
            asString(s.phone_number) ||
            (shouldShowPlaceholders ? asString(ph.phone_number) : "");

        const cover =
            s.coverPhotoPreview ||
            s.coverPhoto ||
            s.cover_photo ||
            (shouldShowPlaceholders ? ph.coverPhoto : "");

        const logo =
            s.logoPreview ||
            s.logo ||
            s.avatarPreview ||
            s.avatar ||
            (shouldShowPlaceholders ? asString(ph.logo) : "");

        const avatar =
            s.avatarPreview ||
            s.avatar ||
            s.avatar_url ||
            s.logoPreview ||
            s.logo ||
            (shouldShowPlaceholders ? asString(ph.avatar) : "");

        const worksRaw = asArray(s.workImages || s.works);
        const worksPlaceholders = asArray(ph.workImages || ph.works);
        const works = worksRaw.length
            ? worksRaw
            : shouldShowPlaceholders
                ? worksPlaceholders
                : [];

        const servicesRaw = asArray(s.services);
        const servicesPlaceholders = asArray(ph.services);
        const servicesSource = servicesRaw.length
            ? servicesRaw
            : shouldShowPlaceholders
                ? servicesPlaceholders
                : [];

        const services = servicesSource.map((item) => ({
            name: asString(item?.name),
            description: asString(item?.description || item?.price),
            price: asString(item?.price || item?.description),
        }));

        const reviewsRaw = asArray(s.reviews);
        const reviewsPlaceholders = asArray(ph.reviews);
        const reviewsSource = reviewsRaw.length
            ? reviewsRaw
            : shouldShowPlaceholders
                ? reviewsPlaceholders
                : [];

        const reviews = reviewsSource.map((item) => ({
            name: asString(item?.name),
            text: asString(item?.text),
            rating: Number(item?.rating) || 5,
        }));

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
        ph,
        shouldShowPlaceholders,
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
                    <IframePreview className="preview-iframe-mode" title={`Template Preview (${templateId})`}>
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