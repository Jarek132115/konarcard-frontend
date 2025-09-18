import { Component } from "react";

export default class RouteErrorBoundary extends Component {
    state = { hasError: false };

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(err, info) {
        const msg = String(err?.message || "");
        // Handle removed chunks after a deploy
        if (err?.name === "ChunkLoadError" || /Loading chunk \d+ failed/i.test(msg)) {
            if (!window.__didHardReloadForChunk__) {
                window.__didHardReloadForChunk__ = true;
                window.location.reload();
                return;
            }
        }

        // Optional: log unexpected errors somewhere
        // console.error("RouteErrorBoundary caught:", err, info);
    }

    componentDidUpdate(prevProps) {
        // If route changed and we were showing the error UI, clear it.
        if (this.state.hasError && this.props.location !== prevProps.location) {
            // Only works if you wrap with withRouter or pass `location` from a parent
            // this.setState({ hasError: false });
        }
    }

    render() {
        if (this.state.hasError) {
            return <div style={{ padding: 16 }}>Updating… please try again.</div>;
        }
        return this.props.children;
    }
}
