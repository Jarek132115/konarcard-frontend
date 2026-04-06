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
    const [isMobileNav, setIsMobileNav] = useState(() =>
        typeof window !== "undefined" ? window.innerWidth <= 1000 : false
    );

    useEffect(() => {
        const onResize = () => {
            const mobileNow = window.innerWidth <= 1000;
            setIsMobileNav(mobileNow);

            if (!mobileNow) {
                setSidebarOpen(false);
            }
        };

        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    useEffect(() => {
        if (!isMobileNav) return undefined;

        document.body.style.overflow = sidebarOpen ? "hidden" : "";

        return () => {
            document.body.style.overflow = "";
        };
    }, [sidebarOpen, isMobileNav]);

    const mobileTopbar = useMemo(() => {
        if (hideMobileTopbar || !isMobileNav) return null;

        return (
            <header className="dash-topbar" role="banner">
                <div className="dash-topbar-left" aria-label="KonarCard">
                    <span className="dash-topbar-logo" aria-hidden="true">
                        <img src={LogoIcon} alt="" />
                    </span>
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
    }, [hideMobileTopbar, isMobileNav, rightSlot]);

    return (
        <div className={`dash-layout ${isMobileNav ? "is-mobileNav" : "is-desktopNav"}`}>
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            <div className="dash-main">
                {mobileTopbar}

                {!isMobileNav && !hideDesktopHeader && (title || subtitle || rightSlot) ? (
                    <div className="dash-desktop-header">
                        <div className="dash-desktop-left">
                            {title ? <div className="dash-desktop-title">{title}</div> : null}
                            {subtitle ? <div className="dash-desktop-sub">{subtitle}</div> : null}
                        </div>

                        {rightSlot ? <div className="dash-desktop-right">{rightSlot}</div> : null}
                    </div>
                ) : null}

                <main className="dash-content">{children}</main>
            </div>
        </div>
    );
}