// src/components/Dashboard/DashboardLayout.jsx
import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "./Sidebar";

import LogoIcon from "../../assets/icons/Logo-Icon.svg";
import "../../styling/dashboard/layout.css";

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
            if (!mobileNow) setSidebarOpen(false);
        };

        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

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
            <header className="dash-topbar" role="banner">
                <div className="dash-topbar-left" aria-label="KonarCard">
                    <span className="dash-topbar-logo">
                        <img src={LogoIcon} alt="KonarCard" />
                    </span>

                    <div className="dash-topbar-text">
                        <div className="dash-topbar-title">{title || "KonarCard"}</div>
                        {subtitle ? <div className="dash-topbar-sub">{subtitle}</div> : null}
                    </div>
                </div>

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
    }, [hideMobileTopbar, rightSlot, subtitle, title]);

    return (
        <div className="dash-layout">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            <div className="dash-main">
                {mobileTopbar}

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