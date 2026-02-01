import React, { useMemo, useState } from "react";
import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import "../../styling/dashboard/contactbook.css";

export default function ContactBook() {
    // TEMP: later replace with real backend data
    const [contacts, setContacts] = useState([
        {
            id: "ct1",
            name: "John Smith",
            email: "john@example.com",
            phone: "+44 7700 900123",
            source: "card_tap", // card_tap | link_view | qr_scan
            interactions: 3,
            firstSeen: "2026-01-18",
            lastSeen: "2026-02-01",
            note: "Asked for a quote. Follow up next week.",
        },
        {
            id: "ct2",
            name: "Sarah Brown",
            email: "sarah@example.com",
            phone: "",
            source: "link_view",
            interactions: 1,
            firstSeen: "2026-01-28",
            lastSeen: "2026-01-28",
            note: "",
        },
        {
            id: "ct3",
            name: "Unknown Visitor",
            email: "",
            phone: "",
            source: "qr_scan",
            interactions: 2,
            firstSeen: "2026-01-30",
            lastSeen: "2026-02-01",
            note: "",
        },
    ]);

    const [search, setSearch] = useState("");
    const [selectedId, setSelectedId] = useState(contacts[0]?.id || null);

    const selected = useMemo(
        () => contacts.find((c) => c.id === selectedId) || contacts[0] || null,
        [contacts, selectedId]
    );

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return contacts;
        return contacts.filter((c) => {
            return (
                (c.name || "").toLowerCase().includes(q) ||
                (c.email || "").toLowerCase().includes(q) ||
                (c.phone || "").toLowerCase().includes(q)
            );
        });
    }, [contacts, search]);

    const sourceLabel = (s) => {
        if (s === "card_tap") return "Card tap";
        if (s === "link_view") return "Link view";
        if (s === "qr_scan") return "QR scan";
        return "Unknown";
    };

    const exportCSV = () => {
        const rows = [
            ["Name", "Email", "Phone", "Source", "Interactions", "First Seen", "Last Seen", "Note"],
            ...contacts.map((c) => [
                c.name || "",
                c.email || "",
                c.phone || "",
                sourceLabel(c.source),
                String(c.interactions ?? 0),
                c.firstSeen || "",
                c.lastSeen || "",
                (c.note || "").replace(/\n/g, " "),
            ]),
        ];

        const csv = rows
            .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
            .join("\n");

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "konarcard-contacts.csv";
        a.click();

        URL.revokeObjectURL(url);
    };

    const deleteContact = (id) => {
        const ok = window.confirm("Delete this contact? This cannot be undone.");
        if (!ok) return;

        const next = contacts.filter((c) => c.id !== id);
        setContacts(next);

        if (selectedId === id) setSelectedId(next[0]?.id || null);
    };

    return (
        <DashboardLayout
            title="Contact Book"
            subtitle="People who have tapped or viewed your profile."
            rightSlot={
                <button type="button" className="cb-btn cb-btn-primary" onClick={exportCSV}>
                    Export CSV
                </button>
            }
        >
            <div className="cb-shell">
                {/* 2. Page Header */}
                <div className="cb-header">
                    <div>
                        <h1 className="cb-title">Contact Book</h1>
                        <p className="cb-subtitle">
                            This is your growing list of people who interacted with your KonarCard profile —
                            card taps, link views, and QR scans.
                        </p>
                    </div>

                    <div className="cb-header-meta">
                        <span className="cb-pill">
                            Total contacts: <strong>{contacts.length}</strong>
                        </span>
                    </div>
                </div>

                {/* Empty State */}
                {contacts.length === 0 ? (
                    <section className="cb-card cb-empty">
                        <h2 className="cb-card-title">No contacts yet</h2>
                        <p className="cb-muted">
                            Your contact book will populate as soon as people tap your card or view your link.
                        </p>
                        <div className="cb-actions-row">
                            <a className="cb-btn cb-btn-primary" href="/profiles">
                                Share profile link
                            </a>
                            <a className="cb-btn cb-btn-ghost" href="/cards">
                                Manage cards
                            </a>
                        </div>
                    </section>
                ) : (
                    <div className="cb-grid">
                        {/* 3. Contacts List (Core Section) */}
                        <section className="cb-card cb-span-7">
                            <div className="cb-card-head">
                                <div>
                                    <h2 className="cb-card-title">Contacts list</h2>
                                    <p className="cb-muted">
                                        Search and select a contact to see details and interaction history.
                                    </p>
                                </div>

                                <div className="cb-search">
                                    <input
                                        className="cb-search-input"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search contacts…"
                                    />
                                </div>
                            </div>

                            <div className="cb-list">
                                {filtered.map((c) => (
                                    <button
                                        key={c.id}
                                        type="button"
                                        className={`cb-item ${selected?.id === c.id ? "active" : ""}`}
                                        onClick={() => setSelectedId(c.id)}
                                    >
                                        <div className="cb-item-left">
                                            <div className="cb-avatar" aria-hidden="true">
                                                {(c.name || "U").slice(0, 1)}
                                            </div>

                                            <div className="cb-item-meta">
                                                <div className="cb-item-title">{c.name || "Unknown"}</div>
                                                <div className="cb-item-sub">
                                                    <span className="cb-source">{sourceLabel(c.source)}</span>
                                                    <span className="cb-dot">•</span>
                                                    <span className="cb-muted">Last seen {c.lastSeen}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="cb-item-right">
                                            <span className="cb-count">{c.interactions}×</span>
                                            <span className="cb-view">View</span>
                                        </div>
                                    </button>
                                ))}

                                {filtered.length === 0 && (
                                    <div className="cb-empty-inline">
                                        No contacts match “{search}”.
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* 4. Contact Detail View */}
                        <section className="cb-card cb-span-5">
                            <div className="cb-card-head">
                                <div>
                                    <h2 className="cb-card-title">Contact detail</h2>
                                    <p className="cb-muted">
                                        Useful context about this person and how they interacted.
                                    </p>
                                </div>
                            </div>

                            {!selected ? (
                                <div className="cb-empty-detail">
                                    Select a contact to view details.
                                </div>
                            ) : (
                                <div className="cb-detail">
                                    <div className="cb-detail-top">
                                        <div className="cb-detail-avatar" aria-hidden="true">
                                            {(selected.name || "U").slice(0, 1)}
                                        </div>

                                        <div>
                                            <div className="cb-detail-name">{selected.name || "Unknown"}</div>
                                            <div className="cb-detail-sub">
                                                Source: <strong>{sourceLabel(selected.source)}</strong>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="cb-detail-grid">
                                        <div className="cb-detail-row">
                                            <div className="cb-detail-label">Email</div>
                                            <div className="cb-detail-value">{selected.email || "—"}</div>
                                        </div>

                                        <div className="cb-detail-row">
                                            <div className="cb-detail-label">Phone</div>
                                            <div className="cb-detail-value">{selected.phone || "—"}</div>
                                        </div>

                                        <div className="cb-detail-row">
                                            <div className="cb-detail-label">Interactions</div>
                                            <div className="cb-detail-value">
                                                {selected.interactions ?? 0}
                                            </div>
                                        </div>

                                        <div className="cb-detail-row">
                                            <div className="cb-detail-label">First seen</div>
                                            <div className="cb-detail-value">{selected.firstSeen || "—"}</div>
                                        </div>

                                        <div className="cb-detail-row">
                                            <div className="cb-detail-label">Last seen</div>
                                            <div className="cb-detail-value">{selected.lastSeen || "—"}</div>
                                        </div>
                                    </div>

                                    <div className="cb-note">
                                        <div className="cb-note-title">Notes</div>
                                        <div className="cb-note-body">
                                            {selected.note?.trim() ? selected.note : "No notes yet."}
                                        </div>
                                    </div>

                                    {/* 5. Export & Management */}
                                    <div className="cb-manage">
                                        <button type="button" className="cb-btn cb-btn-ghost" onClick={exportCSV}>
                                            Export CSV
                                        </button>

                                        <button
                                            type="button"
                                            className="cb-btn cb-btn-danger"
                                            onClick={() => deleteContact(selected.id)}
                                        >
                                            Delete contact
                                        </button>
                                    </div>

                                    <div className="cb-hint">
                                        Tip: Add your QR code to invoices and signage to collect more contacts.
                                    </div>
                                </div>
                            )}
                        </section>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
