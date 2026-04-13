// frontend/src/utils/seo.js
// Lightweight SEO helpers for setting <title>, meta tags, canonical and JSON-LD.

import { useEffect } from "react";

const SITE_URL = "https://www.konarcard.com";

function upsertMeta(attr, key, value) {
    if (typeof document === "undefined") return;
    const sel = `meta[${attr}="${key}"]`;
    let el = document.head.querySelector(sel);
    if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
    }
    el.setAttribute("content", value);
}

function upsertLink(rel, href) {
    if (typeof document === "undefined") return;
    let el = document.head.querySelector(`link[rel="${rel}"]`);
    if (!el) {
        el = document.createElement("link");
        el.setAttribute("rel", rel);
        document.head.appendChild(el);
    }
    el.setAttribute("href", href);
}

function upsertJsonLd(id, payload) {
    if (typeof document === "undefined") return;
    const sel = `script[type="application/ld+json"][data-kc="${id}"]`;
    let el = document.head.querySelector(sel);
    if (!el) {
        el = document.createElement("script");
        el.type = "application/ld+json";
        el.setAttribute("data-kc", id);
        document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(payload);
}

/**
 * useSeo — sets title, meta description, canonical, OG/Twitter tags.
 * @param {Object} opts
 * @param {string} opts.path - URL path beginning with "/" (e.g. "/faq")
 * @param {string} opts.title
 * @param {string} opts.description
 * @param {string} [opts.ogType="website"]
 */
export function useSeo({ path, title, description, ogType = "website" }) {
    useEffect(() => {
        const url = `${SITE_URL}${path}`;
        if (title) document.title = title;
        if (description) upsertMeta("name", "description", description);
        upsertLink("canonical", url);

        if (title) upsertMeta("property", "og:title", title);
        if (description) upsertMeta("property", "og:description", description);
        upsertMeta("property", "og:url", url);
        upsertMeta("property", "og:type", ogType);

        upsertMeta("name", "twitter:card", "summary_large_image");
        if (title) upsertMeta("name", "twitter:title", title);
        if (description) upsertMeta("name", "twitter:description", description);
    }, [path, title, description, ogType]);
}

export { SITE_URL, upsertMeta, upsertLink, upsertJsonLd };
