import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { previewPlaceholders } from "../../store/businessCardStore";
import "../../styling/dashboard/preview.css";

/* ✅ Your 5 template components */
import Template1 from "./Template1";
import Template2 from "./Template2";
import Template3 from "./Template3";
import Template4 from "./Template4";
import Template5 from "./Template5";

const asArray = (v) => (Array.isArray(v) ? v : []);
const asString = (v) => (typeof v === "string" ? v : "");
const isBlobUrl = (v) => typeof v === "string" && v.startsWith("blob:");

const getTemplateId = (raw) => {
    const t = (raw || "template-1").toString();
    const allowed = new Set(["template-1", "template-2", "template-3", "template-4", "template-5"]);
    return allowed.has(t) ? t : "template-1";
};

// ✅ Fixed order. Users cannot reorder.
const SECTION_ORDER = ["main", "about", "work", "services", "reviews", "contact"];

/* -------------------------------------------------------
   IFRAME RENDERER
   - makes media queries match preview panel size (desktop)
   - clones parent styles into iframe so templates look identical
-------------------------------------------------------- */
function IframePreview({ className, children, title = "Preview" }) {
    const iframeRef = useRef(null);
    const [mountNode, setMountNode] = useState(null);

    useEffect(() => {
        const iframe = iframeRef.current;
        if (!iframe) return;

        const handleLoad = () => {
            const doc = iframe.contentDocument;
            if (!doc) return;

            // Reset document for consistent rendering
            doc.open();
            doc.write("<!doctype html><html><head></head><body></body></html>");
            doc.close();

            // Basic body reset
            doc.documentElement.style.height = "100%";
            doc.body.style.height = "100%";
            doc.body.style.margin = "0";
            doc.body.style.background = "transparent";

            // ✅ Clone styles from parent (links + style tags)
            const parentHeadNodes = Array.from(document.head.querySelectorAll('link[rel="stylesheet"], style'));
            parentHeadNodes.forEach((node) => {
                const clone = node.cloneNode(true);
                doc.head.appendChild(clone);
            });

            // Mount point
            const root = doc.createElement("div");
            root.setAttribute("id", "preview-iframe-root");
            root.style.minHeight = "100%";
            root.style.height = "100%";
            doc.body.appendChild(root);
            setMountNode(root);
        };

        // Some browsers fire load only once; handle both cases safely
        if (iframe.contentDocument?.readyState === "complete") {
            handleLoad();
        } else {
            iframe.addEventListener("load", handleLoad);
        }

        return () => {
            iframe.removeEventListener("load", handleLoad);
        };
    }, []);

    return (
        <div className={`preview-iframe-shell ${className || ""}`}>
            <iframe
                ref={iframeRef}
                className="preview-iframe"
                title={title}
                // sandbox allows same-origin DOM access for portals + cloning styles
                sandbox="allow-same-origin"
            />
            {mountNode ? createPortal(children, mountNode) : null}
        </div>
    );
}

export default function Preview({
    state,
    isMobile,
    hasSavedData,

    // ✅ Only thing user can control: show/hide sections
    showMainSection,
    showAboutMeSection,
    showWorkSection,
    showServicesSection,
    showReviewsSection,
    showContactSection,

    hasExchangeContact,
    visitUrl,
    columnScrollStyle,
}) {
    const [previewOpen, setPreviewOpen] = useState(true);
    const mpWrapRef = useRef(null);

    const s = state || {};
    const ph = previewPlaceholders || {};
    const shouldShowPlaceholders = !hasSavedData;

    const templateId = getTemplateId(s.template_id || s.templateId || "template-1");

    // ---------------------------
    // ✅ Build ONE canonical VM
    // Templates decide fonts/colors/layout.
    // ---------------------------
    const vm = useMemo(() => {
        const fullName = asString(s.full_name) || (shouldShowPlaceholders ? asString(ph.full_name) : "");
        const jobTitle = asString(s.job_title) || (shouldShowPlaceholders ? asString(ph.job_title) : "");
        const bio = asString(s.bio) || (shouldShowPlaceholders ? asString(ph.bio) : "");

        const mainHeading =
            asString(s.mainHeading) ||
            asString(s.main_heading) ||
            (shouldShowPlaceholders ? asString(ph.main_heading) : "");

        const subHeading =
            asString(s.subHeading) ||
            asString(s.sub_heading) ||
            (shouldShowPlaceholders ? asString(ph.sub_heading) : "");

        const email = asString(s.contact_email) || (shouldShowPlaceholders ? asString(ph.contact_email) : "");
        const phone = asString(s.phone_number) || (shouldShowPlaceholders ? asString(ph.phone_number) : "");

        // ✅ Prefer local preview fields, then persisted URLs. Ignore blob accidentally stored in persisted fields.
        const cover =
            s.coverPhotoPreview ||
            (isBlobUrl(s.coverPhoto) ? "" : s.coverPhoto) ||
            (isBlobUrl(s.cover_photo) ? "" : s.cover_photo) ||
            (shouldShowPlaceholders ? ph.coverPhoto : "");

        const avatar =
            s.avatarPreview ||
            (isBlobUrl(s.avatar) ? "" : s.avatar) ||
            (isBlobUrl(s.avatar_url) ? "" : s.avatar_url) ||
            (shouldShowPlaceholders ? ph.avatar : "");

        const worksRaw = asArray(s.workImages || s.works);
        const worksPlaceholders = asArray(ph.workImages || ph.works);
        const works = worksRaw.length ? worksRaw : shouldShowPlaceholders ? worksPlaceholders : [];

        const servicesRaw = asArray(s.services);
        const services = servicesRaw.length ? servicesRaw : shouldShowPlaceholders ? asArray(ph.services) : [];

        const reviewsRaw = asArray(s.reviews);
        const reviews = reviewsRaw.length ? reviewsRaw : shouldShowPlaceholders ? asArray(ph.reviews) : [];

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
            sectionOrder: SECTION_ORDER,

            // visibility toggles (only controls user has)
            showMainSection: !!showMainSection,
            showAboutMeSection: !!showAboutMeSection,
            showWorkSection: !!showWorkSection,
            showServicesSection: !!showServicesSection,
            showReviewsSection: !!showReviewsSection,
            showContactSection: !!showContactSection,

            // content
            cover,
            avatar,
            mainHeading,
            subHeading,
            fullName,
            jobTitle,
            bio,
            works,
            services,
            reviews,
            email,
            phone,
            socials,

            // flags
            hasContact,
            hasExchangeContact: !!hasExchangeContact,
            visitUrl: visitUrl || "#",

            // ✅ preview-only actions (templates can render buttons without errors)
            onSaveMyNumber: () => { },
            onOpenExchangeContact: () => { },
            onExchangeContact: () => { }, // backwards compat if any template still uses it
        };
    }, [
        s,
        ph,
        shouldShowPlaceholders,
        templateId,
        hasExchangeContact,
        visitUrl,
        showMainSection,
        showAboutMeSection,
        showWorkSection,
        showServicesSection,
        showReviewsSection,
        showContactSection,
    ]);

    // ---------------------------
    // Mobile expand/collapse animation (keep)
    // ---------------------------
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

    // ✅ IMPORTANT: pass BOTH props for compatibility (Template1 uses `data`, others use `vm`)
    const templateProps = { vm, data: vm, isMobile };

    // ---------------------------
    // MOBILE: direct render (same as before)
    // ---------------------------
    if (isMobile) {
        return (
            <div className="preview-scope myprofile-preview-wrapper" style={columnScrollStyle}>
                <div className={`myprofile-preview template-${templateId}`}>
                    <div className="mp-toolbar" role="tablist" aria-label="Preview controls">
                        <button
                            type="button"
                            role="tab"
                            aria-selected={previewOpen}
                            className={`mp-tab ${previewOpen ? "active" : ""}`}
                            onClick={() => setPreviewOpen((x) => !x)}
                        >
                            {previewOpen ? "Hide Preview" : "Show Preview"}
                        </button>

                        <a
                            role="tab"
                            aria-selected={!previewOpen}
                            className={`mp-tab visit ${!previewOpen ? "active" : ""}`}
                            href={visitUrl || "#"}
                            target="_blank"
                            rel="noreferrer"
                            onClick={() => setPreviewOpen(false)}
                        >
                            Visit Page
                        </a>
                    </div>

                    <div className={`mp-preview-wrap ${previewOpen ? "open" : "closed"}`} ref={mpWrapRef}>
                        <TemplateComponent {...templateProps} />
                    </div>
                </div>
            </div>
        );
    }

    // ---------------------------
    // DESKTOP: iframe render so media queries match preview panel size
    // ---------------------------
    return (
        <div className="preview-scope myprofile-preview-wrapper" style={columnScrollStyle}>
            <div className={`myprofile-preview template-${templateId}`}>
                <IframePreview className="preview-iframe-mode" title={`Template Preview (${templateId})`}>
                    <div className="preview-iframe-padding">
                        <TemplateComponent {...templateProps} />
                    </div>
                </IframePreview>
            </div>
        </div>
    );
}
