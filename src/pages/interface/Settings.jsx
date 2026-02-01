import React from "react";
import DashboardLayout from "../../components/Dashboard/DashboardLayout";

export default function Settings() {
    return (
        <DashboardLayout
            title="Settings"
            subtitle="Manage your account and preferences."
        >
            <div style={{ padding: 22 }}>
                <div
                    style={{
                        background: "#fafafa",
                        border: "1px solid rgba(15,23,42,.08)",
                        borderRadius: 18,
                        padding: 18,
                    }}
                >
                    <h2 style={{ margin: 0, fontFamily: "Cal Sans, sans-serif" }}>
                        Settings (coming next)
                    </h2>
                    <p style={{ marginTop: 10, color: "#475569", fontWeight: 700 }}>
                        We’ll add billing, plan info, password, and delete account here.
                    </p>
                </div>
            </div>
        </DashboardLayout>
    );
}
