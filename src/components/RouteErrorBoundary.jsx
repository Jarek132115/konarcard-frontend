import { Component } from "react";

export default class RouteErrorBoundary extends Component {
    state = { hasError: false };

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(err) {
        const msg = String(err?.message || "");
        const isChunkError =
            err?.name === "ChunkLoadError" ||
            /Loading chunk \d+ failed/i.test(msg) ||
            /Failed to fetch dynamically imported module/i.test(msg) ||
            /Importing a module script failed/i.test(msg);

        // Be aggressive: hard-reload on any route-level error.
        // Use guards to prevent infinite reload loops.
        const anyReloadFlag = "__didHardReloadForAnyError__";
        const chunkReloadFlag = "__didHardReloadForChunk__";

        if (isChunkError && !window[chunkReloadFlag]) {
            window[chunkReloadFlag] = true;
            window.location.reload();
            return;
        }

        if (!window[anyReloadFlag]) {
            window[anyReloadFlag] = true;
            // Small delay allows the black fallback to paint before reload.
            setTimeout(() => window.location.reload(), 150);
        }
    }

    render() {
        if (this.state.hasError) {
            // Silent, full-screen black fallback (no text)
            return (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "#000",
                        zIndex: 2147483647,
                    }}
                    aria-hidden="true"
                />
            );
        }
        return this.props.children;
    }
}
