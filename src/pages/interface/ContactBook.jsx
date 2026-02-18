// frontend/src/pages/interface/ContactBook.jsx
import React, { useMemo, useState, useEffect, useContext } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import PageHeader from "../../components/Dashboard/PageHeader";
import "../../styling/dashboard/contactbook.css";
import api from "../../services/api";
import { AuthContext } from "../../components/AuthContext";
import { toast } from "react-hot-toast";

const nonEmpty = (v) => typeof v === "string" && v.trim().length > 0;

function safeDate(d) {
    try {
        const dt = new Date(d);
        if (Number.isNaN(dt.getTime())) return "";
        return dt.toISOString().slice(0, 10);
    } catch {
        return "";
    }
}

export default function ContactBook() {
    const { user: authUser } = useContext(AuthContext);
    const queryClient = useQueryClient();

    const [search, setSearch] = useState("");
    const [selectedId, setSelectedId] = useState(null);

    const {
        data: exchanges,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ["contact-exchanges"],
        queryFn: async () => {
            const res = await api.get("/contact-exchanges");
            return Array.isArray(res.data) ? res.data : [];
        },
        enabled: !!authUser,
        staleTime: 60 * 1000,
        retry: 1,
    });

    const contacts = useMemo(() => {
        const xs = Array.isArray(exchanges) ? exchanges : [];
        return xs.map((x) => {
            const name = x.visitor_name || "Unknown Visitor";
            const email = x.visitor_email || "";
            const phone = x.visitor_phone || "";
            const note = x.message || "";

            return {
                id: x._id,
                name,
                email,
                phone,
                source: "exchange_contact",
                interactions: 1,
                firstSeen: safeDate(x.createdAt),
                lastSeen: safeDate(x.createdAt),
                note,
                raw: x,
            };
        });
    }, [exchanges]);

    useEffect(() => {
        if (isLoading) return;

        if (!selectedId && contacts.length > 0) {
            setSelectedId(contacts[0].id);
            return;
        }

        if (selectedId && contacts.length > 0) {
            const stillExists = contacts.some((c) => c.id === selectedId);
            if (!stillExists) setSelectedId(contacts[0].id);
        }
    }, [contacts, selectedId, isLoading]);

    const selected = useMemo(() => {
        if (!contacts.length) return null;
        return contacts.find((c) => c.id === selectedId) || contacts[0] || null;
    }, [contacts, selectedId]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return contacts;

        return contacts.filter((c) => {
            return (
                (c.name || "").toLowerCase().includes(q) ||
                (c.email || "").toLowerCase().includes(q) ||
                (c.phone || "").toLowerCase().includes(q) ||
                (c.note || "").toLowerCase().includes(q)
            );
        });
    }, [contacts, search]);

    const sourceLabel = (s) => {
        if (s === "exchange_contact") return "Exchange contact";
        return "Unknown";
    };

    const exportCSV = () => {
        if (!contacts.length) {
            toast.error("No contacts to export.");
            return;
        }

        const rows = [
            ["Name", "Email", "Phone", "Source", "First Seen", "Last Seen", "Message"],
            ...contacts.map((c) => [
                c.name || "",
                c.email || "",
                c.phone || "",
                sourceLabel(c.source),
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

    const deleteContact = async (id) => {
        const ok = window.confirm("Delete this contact? This cannot be undone.");
        if (!ok) return;

        try {
            await api.delete(`/contact-exchanges/${id}`);
            toast.success("Contact deleted");
            queryClient.invalidateQueries({ queryKey: ["contact-exchanges"] });
        } catch (err) {
            toast.error(err?.response?.data?.error || "Failed to delete contact");
        }
    };

    const rightSlot = (
        <button type="button" className="kx-btn kx-btn--black" onClick={exportCSV}>
            Export CSV
        </button>
    );

    // Keep layout stable: always render grid + cards, swap content inside
    const showEmpty = !isLoading && !isError && contacts.length === 0;

    return (
        <DashboardLayout title="Contact Book" subtitle="People who exchanged details with you." hideDesktopHeader>
            <div className="cb-shell">
                <PageHeader
                    title="Contact Book"
                    subtitle="People who exchanged their details from your public KonarCard profile."
                    rightSlot={rightSlot}
                />

                <div className="cb-grid">
                    {/* LEFT: LIST */}
                    <section className="cb-card cb-span-7">
                        <div className="cb-card-head">
                            <div>
                                <h2 className="cb-card-title">Contacts</h2>
                                <p className="cb-muted">Search and select a contact to view details.</p>
                            </div>

                            <div className="cb-search">
                                <input
                                    className="cb-search-input"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search contacts…"
                                    aria-label="Search contacts"
                                />
                            </div>
                        </div>

                        {isError ? (
                            <div className="cb-inlineState cb-error">
                                <div className="cb-inlineTitle">Couldn’t load contacts</div>
                                <div className="cb-inlineText">
                                    {error?.response?.data?.error || error?.message || "Something went wrong."}
                                </div>
                            </div>
                        ) : showEmpty ? (
                            <div className="cb-inlineState">
                                <div className="cb-inlineTitle">No contacts yet</div>
                                <div className="cb-inlineText">
                                    This will populate when someone presses <strong>Exchange Contact</strong> on your public profile.
                                </div>

                                <div className="cb-actions-row">
                                    <a className="kx-btn kx-btn--black" href="/profiles">
                                        Go to profiles
                                    </a>
                                    <a className="kx-btn kx-btn--white" href="/cards">
                                        Manage cards
                                    </a>
                                </div>
                            </div>
                        ) : (
                            <div className="cb-list" aria-busy={isLoading ? "true" : "false"}>
                                {isLoading ? (
                                    <>
                                        <div className="cb-skelItem" />
                                        <div className="cb-skelItem" />
                                        <div className="cb-skelItem" />
                                        <div className="cb-skelItem" />
                                        <div className="cb-skelItem" />
                                    </>
                                ) : (
                                    <>
                                        {filtered.map((c) => (
                                            <button
                                                key={c.id}
                                                type="button"
                                                className={`cb-item ${selected?.id === c.id ? "active" : ""}`}
                                                onClick={() => setSelectedId(c.id)}
                                            >
                                                <div className="cb-item-left">
                                                    <div className="cb-avatar" aria-hidden="true">
                                                        {(c.name || "U").slice(0, 1).toUpperCase()}
                                                    </div>

                                                    <div className="cb-item-meta">
                                                        <div className="cb-item-title">{c.name || "Unknown"}</div>
                                                        <div className="cb-item-sub">
                                                            <span className="cb-source">{sourceLabel(c.source)}</span>
                                                            <span className="cb-dot">•</span>
                                                            <span className="cb-mutedInline">Received {c.lastSeen || "—"}</span>
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
                                            <div className="cb-empty-inline">No contacts match “{search}”.</div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </section>

                    {/* RIGHT: DETAIL */}
                    <section className="cb-card cb-span-5 cb-detailCard">
                        <div className="cb-card-head">
                            <div>
                                <h2 className="cb-card-title">Details</h2>
                                <p className="cb-muted">Information submitted through Exchange Contact.</p>
                            </div>

                            {!isLoading && selected ? (
                                <div className="cb-detailTopActions">
                                    <button type="button" className="kx-btn kx-btn--white" onClick={exportCSV}>
                                        Export
                                    </button>
                                    <button
                                        type="button"
                                        className="kx-btn kx-btn--orange"
                                        onClick={() => deleteContact(selected.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            ) : null}
                        </div>

                        {isLoading ? (
                            <div className="cb-detailSkel">
                                <div className="cb-skelHead" />
                                <div className="cb-skelRow" />
                                <div className="cb-skelRow" />
                                <div className="cb-skelRow" />
                                <div className="cb-skelRow" />
                                <div className="cb-skelNote" />
                            </div>
                        ) : isError ? (
                            <div className="cb-inlineState cb-error">
                                <div className="cb-inlineTitle">Details unavailable</div>
                                <div className="cb-inlineText">Fix the error on the left and try again.</div>
                            </div>
                        ) : showEmpty ? (
                            <div className="cb-inlineState">
                                <div className="cb-inlineTitle">Nothing to show</div>
                                <div className="cb-inlineText">When you receive contacts, select one to view details.</div>
                            </div>
                        ) : !selected ? (
                            <div className="cb-inlineState">
                                <div className="cb-inlineTitle">Select a contact</div>
                                <div className="cb-inlineText">Pick someone from the list to view their details.</div>
                            </div>
                        ) : (
                            <div className="cb-detail">
                                <div className="cb-detail-top">
                                    <div className="cb-detail-avatar" aria-hidden="true">
                                        {(selected.name || "U").slice(0, 1).toUpperCase()}
                                    </div>

                                    <div className="cb-detail-meta">
                                        <div className="cb-detail-name">{selected.name || "Unknown"}</div>
                                        <div className="cb-detail-sub">
                                            Source: <strong>{sourceLabel(selected.source)}</strong>
                                        </div>
                                    </div>
                                </div>

                                <div className="cb-detail-grid">
                                    <div className="cb-detail-row">
                                        <div className="cb-detail-label">Email</div>
                                        <div className="cb-detail-value">{nonEmpty(selected.email) ? selected.email : "—"}</div>
                                    </div>

                                    <div className="cb-detail-row">
                                        <div className="cb-detail-label">Phone</div>
                                        <div className="cb-detail-value">{nonEmpty(selected.phone) ? selected.phone : "—"}</div>
                                    </div>

                                    <div className="cb-detail-row">
                                        <div className="cb-detail-label">Received</div>
                                        <div className="cb-detail-value">{selected.firstSeen || "—"}</div>
                                    </div>

                                    <div className="cb-detail-row">
                                        <div className="cb-detail-label">Profile</div>
                                        <div className="cb-detail-value">{selected.raw?.profile_slug || "—"}</div>
                                    </div>
                                </div>

                                <div className="cb-note">
                                    <div className="cb-note-title">Message</div>
                                    <div className="cb-note-body">{nonEmpty(selected.note) ? selected.note : "No message."}</div>
                                </div>

                                <div className="cb-hint">Tip: Add “Exchange Contact” on your profile to collect leads faster.</div>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </DashboardLayout>
    );
}
