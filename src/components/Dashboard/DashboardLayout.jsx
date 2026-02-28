// src/components/Dashboard/DashboardLayout.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "./Sidebar";

import LogoIcon from "../../assets/icons/Logo-Icon.svg";
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
    const [isMobile, setIsMobile] = useState(() =>
        typeof window !== "undefined" ? window.innerWidth <= 1000 : false
    );

    useEffect(() => {
        const onResize = () => {
            const mobileNow = window.innerWidth <= 1000;
            setIsMobile(mobileNow);

            // If we switch to desktop, ensure the mobile drawer isn't stuck open
            if (!mobileNow) setSidebarOpen(false);
        };

        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    // Prevent background scroll when sidebar is open on mobile
    useEffect(() => {
        if (!isMobile) return;

        if (sidebarOpen) document.body.style.overflow = "hidden";
        else document.body.style.overflow = "";

        return () => {
            document.body.style.overflow = "";
        };
    }, [sidebarOpen, isMobile]);

    const mobileTopbar = useMemo(() => {
        if (hideMobileTopbar) return null;

        return (
            <header className="dash-topbar" role="banner" aria-label="Mobile header">
                {/* ✅ Logo ONLY (no text) */}
                <Link to="/dashboard" className="dash-topbar-left" aria-label="KonarCard home">
                    <span className="sb2-logoPlain" aria-hidden="true">
                        <img src={LogoIcon} alt="" />
                    </span>
                </Link>

                {/* ✅ Menu RIGHT */}
                <div className="dash-topbar-right">
                    {rightSlot ? <div className="dash-topbar-slot">{rightSlot}</div> : null}

                    <button
                        type="button"
                        className="dash-burger"
                        aria-label="Open menu"
                        onClick={() => setSidebarOpen(true)}
                    >
                        ☰
                    </button>
                </div>
            </header>
        );
    }, [hideMobileTopbar, rightSlot]);

    return (
        <div className="dash-layout">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            <div className="dash-main">
                {/* Mobile topbar */}
                {mobileTopbar}

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