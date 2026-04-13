import { Component } from "react";

export default class AdminErrorBoundary extends Component {
    state = { hasError: false, error: null };

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        console.error("[AdminErrorBoundary]", error, info);
    }

    reset = () => this.setState({ hasError: false, error: null });

    render() {
        if (this.state.hasError) {
            return (
                <div
                    style={{
                        padding: 24,
                        border: "1px solid #fecaca",
                        background: "#fef2f2",
                        color: "#991b1b",
                        borderRadius: 12,
                        fontFamily: "Inter, sans-serif",
                    }}
                >
                    <p style={{ margin: "0 0 8px", fontWeight: 700, fontSize: 15 }}>
                        Something went wrong rendering this view.
                    </p>
                    <p style={{ margin: "0 0 12px", fontSize: 13, color: "#b91c1c" }}>
                        {String(this.state.error?.message || this.state.error || "Unknown error")}
                    </p>
                    <button
                        type="button"
                        onClick={this.reset}
                        style={{
                            padding: "8px 16px",
                            borderRadius: 8,
                            background: "#0f172a",
                            color: "#fff",
                            border: "none",
                            cursor: "pointer",
                            fontWeight: 600,
                            fontSize: 13,
                        }}
                    >
                        Try again
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}
