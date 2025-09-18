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

        if (isChunkError && !window.__didHardReloadForChunk__) {
            window.__didHardReloadForChunk__ = true;
            window.location.reload();
        }
    }

    render() {
        if (this.state.hasError) {
            return <div style={{ padding: 16 }}>Updating… please try again.</div>;
        }
        return this.props.children;
    }
}
