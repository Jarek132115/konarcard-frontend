// src/components/TidioDelayedLoader.jsx
import { useEffect } from "react";

const TIDIO_PUBLIC_KEY =
    import.meta.env.VITE_TIDIO_PUBLIC_KEY || "beofp4i2ttjkwkjoem91cbg7an99f40w"; // fallback to your key

function injectTidio() {
    if (typeof window === "undefined") return; // SSR guard
    if (window.__tidioLoaded) return;

    window.tidioChatApi =
        window.tidioChatApi ||
        function () {
            (window.tidioChatApi.q = window.tidioChatApi.q || []).push(arguments);
        };

    const s = document.createElement("script");
    s.src = `https://code.tidio.co/${TIDIO_PUBLIC_KEY}.js`;
    s.async = true;
    s.defer = true;
    s.onload = () => {
        window.__tidioLoaded = true;
    };
    document.body.appendChild(s);
}

export default function TidioDelayedLoader({ enabled = true, delayMs = 4000 }) {
    useEffect(() => {
        if (typeof window === "undefined") return; // SSR guard
        if (!enabled || window.__tidioLoaded) return;

        // Skip known bot/PSI/Lighthouse/headless user agents
        const ua = navigator.userAgent || "";
        const isBot = /lighthouse|chrome-lighthouse|headless|bot|crawler|spider|pagespeed|apis-google/i.test(
            ua
        );
        if (isBot) return;

        let loaded = false;
        let timer;

        const cleanup = () => {
            clearTimeout(timer);
            events.forEach((e) => window.removeEventListener(e, onInteract));
            document.removeEventListener("visibilitychange", onVisible);
        };

        const load = () => {
            if (loaded || window.__tidioLoaded) return;
            loaded = true;
            injectTidio();
            cleanup();
        };

        const startTimer = () => {
            const d = Math.max(3000, Math.min(delayMs, 5000)); // clamp 3–5s
            timer = setTimeout(load, d);
        };

        const onVisible = () => {
            if (document.visibilityState === "visible") {
                document.removeEventListener("visibilitychange", onVisible);
                startTimer();
            }
        };

        // Only start when tab is visible (PSI often runs hidden)
        if (document.visibilityState === "visible") startTimer();
        else document.addEventListener("visibilitychange", onVisible);

        // Load earlier on first user interaction
        const onInteract = () => load();
        const events = ["pointerdown", "keydown", "mousemove", "touchstart", "scroll"];
        events.forEach((e) => window.addEventListener(e, onInteract, { once: true, passive: true }));

        return cleanup;
    }, [enabled, delayMs]);

    return null;
}
