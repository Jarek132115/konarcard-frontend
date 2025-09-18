import { Component } from "react";

export default class RouteErrorBoundary extends Component {
    state = { hasError: false };

    static getDerivedStateFromError() { return { hasError: true }; }

    componentDidCatch(err) {
        const msg = String(err?.message || "");
        // New deploy → old tab tries to load a removed chunk
        if (err?.name === "ChunkLoadError" || /Loading chunk \d+ failed/i.test(msg)) {
            if (!window.__didHardReloadForChunk__) {
                window.__didHardReloadForChunk__ = true;
                window.location.reload();
            }
        }
    }

    render() {
        if (this.state.hasError) {
            return <div style={{ padding: 16 }}>Updating… please try again.</div>;
        }
        return this.props.children;
    }
}
