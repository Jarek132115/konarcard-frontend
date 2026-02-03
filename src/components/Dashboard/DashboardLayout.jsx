// src/components/Dashboard/DashboardLayout.jsx
import React, { useState } from "react";
import Sidebar from "./Sidebar";
import "../../styling/dashboard/layout.css";

/**
 * Props:
 * - title?: string
 * - subtitle?: string
 * - rightSlot?: ReactNode
 * - children: ReactNode
 * - hideDesktopHeader?: boolean   ✅ hides the desktop header (use PageHeader inside pages)
 * - hideMobileTopbar?: boolean    ✅ optional (default false)
 */
export default function DashboardLayout({
    title,
    subtitle,
    rightSlot,
    children,
    hideDesktopHeader = false,
    hideMobileTopbar = false,
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="dash-layout">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            <div className="dash-main">
                {/* Mobile top bar */}
                {!hideMobileTopbar && (
                    <header className="dash-topbar">
                        <button
                            type="button"
                            className="dash-burger"
                            aria-label="Open menu"
                            onClick={() => setSidebarOpen(true)}
                        >
                            ☰
                        </button>

                        <div className="dash-topbar-text">
                            {title ? <div className="dash-topbar-title">{title}</div> : null}
                            {subtitle ? <div className="dash-topbar-sub">{subtitle}</div> : null}
                        </div>

                        <div className="dash-topbar-right">{rightSlot}</div>
                    </header>
                )}

                {/* Desktop header */}
                {!hideDesktopHeader && (title || subtitle || rightSlot) ? (
                    <div className="dash-desktop-header">
                        <div className="dash-desktop-left">
                            {title ? <div className="dash-desktop-title">{title}</div> : null}
                            {subtitle ? <div className="dash-desktop-sub">{subtitle}</div> : null}
                        </div>
                        <div className="dash-desktop-right">{rightSlot}</div>
                    </div>
                ) : null}

                <main className="dash-content">{children}</main>
            </div>
        </div>
    );
}
