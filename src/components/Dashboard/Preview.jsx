import React, { useEffect, useMemo, useRef, useState } from "react";
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

export default function Preview({
    state,
    isMobile,
    hasSavedData,

    // We will ignore these customization props now (safe to receive them)
    servicesDisplayMode,
    reviewsDisplayMode,
    aboutMeLayout,

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
    // Build ONE canonical data object
    // (all templates read the same data)
    // ---------------------------
    const templateData = useMemo(() => {
        const full_name = asString(s.full_name) || (shouldShowPlaceholders ? asString(ph.full_name) : "");
        const job_title = asString(s.job_title) || (shouldShowPlaceholders ? asString(ph.job_title) : "");
        const bio = asString(s.bio) || (shouldShowPlaceholders ? asString(ph.bio) : "");

        const main_heading =
            asString(s.mainHeading) ||
            asString(s.main_heading) ||
            (shouldShowPlaceholders ? asString(ph.main_heading) : "");

        const sub_heading =
            asString(s.subHeading) ||
            asString(s.sub_heading) ||
            (shouldShowPlaceholders ? asString(ph.sub_heading) : "");

        const contact_email =
            asString(s.contact_email) || (shouldShowPlaceholders ? asString(ph.contact_email) : "");
        const phone_number =
            asString(s.phone_number) || (shouldShowPlaceholders ? asString(ph.phone_number) : "");

        const cover_photo =
            s.coverPhotoPreview ||
            (isBlobUrl(s.coverPhoto) ? "" : s.coverPhoto) ||
            (isBlobUrl(s.cover_photo) ? "" : s.cover_photo) ||
            (shouldShowPlaceholders ? ph.coverPhoto : "");

        const avatar =
            s.avatarPreview || (isBlobUrl(s.avatar) ? "" : s.avatar) || (shouldShowPlaceholders ? ph.avatar : "");

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

        const visibility = {
            showMainSection: !!showMainSection,
            showAboutMeSection: !!showAboutMeSection,
            showWorkSection: !!showWorkSection,
            showServicesSection: !!showServicesSection,
            showReviewsSection: !!showReviewsSection,
            showContactSection: !!showContactSection,
        };

        return {
            templateId,
            shouldShowPlaceholders,
            hasExchangeContact: !!hasExchangeContact,
            visitUrl: visitUrl || "#",

            main_heading,
            sub_heading,
            cover_photo,

            full_name,
            job_title,
            bio,
            avatar,

            works,
            services,
            reviews,

            contact_email,
            phone_number,
            socials,

            visibility,
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

    // ---------------------------
    // Render chosen template
    // ---------------------------
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
                        <TemplateComponent data={templateData} isMobile />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="preview-scope myprofile-preview-wrapper" style={columnScrollStyle}>
            <div className={`myprofile-preview template-${templateId}`}>
                <TemplateComponent data={templateData} />
            </div>
        </div>
    );
}
