// src/components/TidioDelayedLoader.jsx
import { useEffect } from 'react';

// From your snippet: //code.tidio.co/beofp4i2ttjkwkjoem91cbg7an99f40w.js
const TIDIO_PUBLIC_KEY = 'beofp4i2ttjkwkjoem91cbg7an99f40w';

function injectTidio() {
    if (window.__tidioLoaded) return;
    window.tidioChatApi =
        window.tidioChatApi ||
        function () {
            (window.tidioChatApi.q = window.tidioChatApi.q || []).push(arguments);
        };

    const s = document.createElement('script');
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
        if (!enabled || window.__tidioLoaded) return;

        const delay = Math.max(3000, Math.min(delayMs, 5000)); // clamp 3–5s
        const timer = setTimeout(injectTidio, delay);

        return () => clearTimeout(timer);
    }, [enabled, delayMs]);

    return null;
}
