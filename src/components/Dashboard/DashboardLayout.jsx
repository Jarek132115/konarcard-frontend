import React, { useState } from "react";
import Sidebar from "./Sidebar";
import "../../styling/dashboard/layout.css";

export default function DashboardLayout({ title, subtitle, rightSlot, children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="dash-layout">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            <div className="dash-main">
                {/* Mobile top bar */}
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
                        <div className="dash-topbar-title">{title}</div>
                        {subtitle ? <div className="dash-topbar-sub">{subtitle}</div> : null}
                    </div>

                    <div className="dash-topbar-right">{rightSlot}</div>
                </header>

                <main className="dash-content">{children}</main>
            </div>
        </div>
    );
}
