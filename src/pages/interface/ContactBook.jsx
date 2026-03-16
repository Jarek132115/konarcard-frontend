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

function prettyDate(d) {
    try {
        const dt = new Date(d);
        if (Number.isNaN(dt.getTime())) return "—";
        return dt.toLocaleDateString("en-GB");
    } catch {
        return "—";
    }
}

function SearchIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="cb-searchIcon">
            <path
                d="M10.5 18a7.5 7.5 0 1 1 5.303-12.803A7.5 7.5 0 0 1 10.5 18Zm0-13a5.5 5.5 0 1 0 3.89 1.61A5.5 5.5 0 0 0 10.5 5Zm8.707 14.293-4.05-4.05 1.414-1.414 4.05 4.05-1.414 1.414Z"
                fill="currentColor"
            />
        </svg>
    );
}

function PhoneIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="cb-inlineIcon">
            <path
                d="M6.62 10.79a15.054 15.054 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24 11.36 11.36 0 0 0 3.57.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.49a1 1 0 0 1 1 1 11.36 11.36 0 0 0 .57 3.57 1 1 0 0 1-.24 1.01l-2.2 2.21Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function EmailIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="cb-inlineIcon">
            <path
                d="M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Zm0 1 8 5 8-5M4 18l5.5-5M20 18l-5.5-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
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
                prettySeen: prettyDate(x.createdAt),
                note,
                profileSlug: x.profile_slug || "",
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
                (c.note || "").toLowerCase().includes(q) ||
                (c.profileSlug || "").toLowerCase().includes(q)
            );
        });
    }, [contacts, search]);

    const sourceLabel = (s) => {
        if (s === "exchange_contact") return "Exchange Contact";
        return "Unknown";
    };

    const exportCSV = (rowsSource = contacts) => {
        if (!rowsSource.length) {
            toast.error("No contacts to export.");
            return;
        }

        const rows = [
            ["Name", "Email", "Phone", "Source", "Received", "Profile", "Message"],
            ...rowsSource.map((c) => [
                c.name || "",
                c.email || "",
                c.phone || "",
                sourceLabel(c.source),
                c.firstSeen || "",
                c.profileSlug || "",
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

    const exportSelected = () => {
        if (!selected) {
            toast.error("Select a contact first.");
            return;
        }
        exportCSV([selected]);
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

    const showEmpty = !isLoading && !isError && contacts.length === 0;

    return (
        <DashboardLayout title="Contact Book" subtitle="People who exchanged details with you." hideDesktopHeader>
            <div className="cb-shell">
                <PageHeader
                    title="Contact Book"
                    subtitle="People who exchanged their details from your public KonarCard profile."
                    rightSlot={null}
                />

                <div className="cb-grid">
                    <section className="cb-card cb-listCard">
                        <div className="cb-card-head cb-card-head--stack">
                            <div className="cb-titleWrap">
                                <h2 className="cb-card-title">My Contacts</h2>
                                <p className="cb-muted">Search and select a contact to view details.</p>
                            </div>

                            <div className="cb-search">
                                <SearchIcon />
                                <input
                                    className="cb-search-input"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search Contacts"
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
                            <div className="cb-inlineState cb-emptyState">
                                <div className="cb-inlineTitle">No contacts yet</div>
                                <div className="cb-inlineText">
                                    This will populate when someone uses <strong>Exchange Contact</strong> on your public profile.
                                </div>
                            </div>
                        ) : (
                            <div className="cb-listWrap" aria-busy={isLoading ? "true" : "false"}>
                                <div className="cb-list">
                                    {isLoading ? (
                                        <>
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
                                                    className={`cb-contactCard ${selected?.id === c.id ? "is-active" : ""}`}
                                                    onClick={() => setSelectedId(c.id)}
                                                >
                                                    <div className="cb-contactCard-title">{c.name || "Unknown"}</div>

                                                    <div className="cb-contactCard-lines">
                                                        <div className="cb-contactLine">
                                                            <PhoneIcon />
                                                            <span>{nonEmpty(c.phone) ? c.phone : "No phone"}</span>
                                                        </div>

                                                        <div className="cb-contactLine">
                                                            <EmailIcon />
                                                            <span>{nonEmpty(c.email) ? c.email : "No email"}</span>
                                                        </div>
                                                    </div>

                                                    <div className="cb-contactCard-date">
                                                        Received: {c.prettySeen || "—"}
                                                    </div>
                                                </button>
                                            ))}

                                            {filtered.length === 0 && (
                                                <div className="cb-empty-inline">No contacts match “{search}”.</div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </section>

                    <section className="cb-card cb-detailCard">
                        <div className="cb-card-head cb-card-head--stack">
                            <div className="cb-titleWrap">
                                <h2 className="cb-card-title">Details</h2>
                                <p className="cb-muted">Information submitted through Exchange Contact.</p>
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="cb-detailBody">
                                <div className="cb-detailPanel cb-detailPanel--skeleton">
                                    <div className="cb-skelHead" />
                                    <div className="cb-skelRow" />
                                    <div className="cb-skelRow" />
                                    <div className="cb-skelRow" />
                                    <div className="cb-skelRow" />
                                    <div className="cb-skelNote" />
                                </div>
                            </div>
                        ) : isError ? (
                            <div className="cb-inlineState cb-error">
                                <div className="cb-inlineTitle">Details unavailable</div>
                                <div className="cb-inlineText">Fix the error on the left and try again.</div>
                            </div>
                        ) : showEmpty ? (
                            <div className="cb-inlineState cb-emptyState">
                                <div className="cb-inlineTitle">Nothing to show</div>
                                <div className="cb-inlineText">When you receive contacts, they’ll appear here.</div>
                            </div>
                        ) : !selected ? (
                            <div className="cb-inlineState cb-emptyState">
                                <div className="cb-inlineTitle">Select a contact</div>
                                <div className="cb-inlineText">Pick someone from the list to view their details.</div>
                            </div>
                        ) : (
                            <div className="cb-detailBody">
                                <div className="cb-detailPanel">
                                    <div className="cb-detailName">{selected.name || "Unknown"}</div>
                                    <div className="cb-detailReceived">Received: {selected.prettySeen || "—"}</div>

                                    <div className="cb-detailRows">
                                        <div className="cb-detailRow">
                                            <div className="cb-detailLabel">Email</div>
                                            <div className="cb-detailValue">{nonEmpty(selected.email) ? selected.email : "—"}</div>
                                        </div>

                                        <div className="cb-detailRow">
                                            <div className="cb-detailLabel">Phone</div>
                                            <div className="cb-detailValue">{nonEmpty(selected.phone) ? selected.phone : "—"}</div>
                                        </div>

                                        <div className="cb-detailRow">
                                            <div className="cb-detailLabel">Received</div>
                                            <div className="cb-detailValue">{selected.firstSeen || "—"}</div>
                                        </div>

                                        <div className="cb-detailRow">
                                            <div className="cb-detailLabel">Profile</div>
                                            <div className="cb-detailValue">{selected.profileSlug || "—"}</div>
                                        </div>

                                        <div className="cb-detailRow cb-detailRow--message">
                                            <div className="cb-detailLabel">Message</div>
                                            <div className="cb-detailValue cb-detailValue--message">
                                                {nonEmpty(selected.note) ? selected.note : "No message."}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="cb-detailActions">
                                    <button
                                        type="button"
                                        className="cb-actionBtn cb-actionBtn--danger"
                                        onClick={() => deleteContact(selected.id)}
                                    >
                                        Delete Contact
                                    </button>

                                    <button
                                        type="button"
                                        className="cb-actionBtn cb-actionBtn--primary"
                                        onClick={exportSelected}
                                    >
                                        Save Contact
                                    </button>
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </DashboardLayout>
    );
}