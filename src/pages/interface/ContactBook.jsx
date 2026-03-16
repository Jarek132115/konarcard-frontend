import React, { useMemo, useState, useEffect, useContext } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import PageHeader from "../../components/Dashboard/PageHeader";
import "../../styling/dashboard/contactbook.css";
import api from "../../services/api";
import { AuthContext } from "../../components/AuthContext";
import { toast } from "react-hot-toast";

import DeleteIcon from "../../assets/icons/ShareOnDelete.svg";
import SaveIcon from "../../assets/icons/SaveProfileIcon.svg";
import ContactBookPhoneIcon from "../../assets/icons/ContactBookPhone.svg";
import ContactBookEmailIcon from "../../assets/icons/ContactBookEmail.svg";

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

export default function ContactBook() {
    const { user: authUser } = useContext(AuthContext);
    const queryClient = useQueryClient();

    const [search, setSearch] = useState("");
    const [selectedId, setSelectedId] = useState(null);
    const [visibleCount, setVisibleCount] = useState(10);
    const [isCompact, setIsCompact] = useState(() =>
        typeof window !== "undefined" ? window.innerWidth <= 1200 : false
    );

    useEffect(() => {
        const onResize = () => setIsCompact(window.innerWidth <= 1200);
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

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
        return xs.map((x) => ({
            id: x._id,
            name: x.visitor_name || "Unknown Visitor",
            email: x.visitor_email || "",
            phone: x.visitor_phone || "",
            message: x.message || "",
            profile: x.profile_slug || "",
            source: "exchange_contact",
            firstSeen: safeDate(x.createdAt),
            received: prettyDate(x.createdAt),
            raw: x,
        }));
    }, [exchanges]);

    useEffect(() => {
        if (!selectedId && contacts.length > 0) {
            setSelectedId(contacts[0].id);
            return;
        }

        if (selectedId && contacts.length > 0) {
            const stillExists = contacts.some((c) => c.id === selectedId);
            if (!stillExists) setSelectedId(contacts[0].id);
        }
    }, [contacts, selectedId]);

    useEffect(() => {
        setVisibleCount(10);
    }, [search]);

    const selected = useMemo(() => {
        if (!contacts.length) return null;
        return contacts.find((c) => c.id === selectedId) || contacts[0] || null;
    }, [contacts, selectedId]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return contacts;

        return contacts.filter((c) =>
            [c.name, c.email, c.phone, c.message, c.profile]
                .filter(Boolean)
                .join(" ")
                .toLowerCase()
                .includes(q)
        );
    }, [contacts, search]);

    const displayedContacts = useMemo(() => {
        if (!isCompact) return filtered;
        return filtered.slice(0, visibleCount);
    }, [filtered, isCompact, visibleCount]);

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

    const exportCSV = (rowsSource = contacts) => {
        if (!rowsSource.length) {
            toast.error("No contacts to export.");
            return;
        }

        const rows = [
            ["Name", "Email", "Phone", "Profile", "Received", "Message"],
            ...rowsSource.map((c) => [
                c.name || "",
                c.email || "",
                c.phone || "",
                c.profile || "",
                c.firstSeen || "",
                (c.message || "").replace(/\n/g, " "),
            ]),
        ];

        const csv = rows
            .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
            .join("\n");

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "konarcard-contact-book.csv";
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

    const showEmpty = !isLoading && !isError && contacts.length === 0;

    return (
        <DashboardLayout hideDesktopHeader>
            <div className="cb-shell">
                <PageHeader
                    title="Contact Book"
                    subtitle="People who exchanged their details from your public KonarCard profile."
                />

                <div className="cb-grid">
                    <section className="cb-card cb-listCard">
                        <div className="cb-card-head cb-card-head--stack">
                            <div className="cb-titleWrap">
                                <h2 className="cb-card-title">My Contacts</h2>
                                <p className="cb-muted">Search and select a contact to view details.</p>
                            </div>

                            <div className="cb-searchWrap">
                                <SearchIcon />
                                <input
                                    className="cb-searchInput"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search contacts"
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
                                    This page will populate when someone uses <strong>Exchange Contact</strong> on your public profile.
                                </div>
                            </div>
                        ) : (
                            <>
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
                                                {displayedContacts.map((c) => (
                                                    <button
                                                        key={c.id}
                                                        type="button"
                                                        className={`cb-contactCard ${selected?.id === c.id ? "is-active" : ""}`}
                                                        onClick={() => setSelectedId(c.id)}
                                                    >
                                                        <div className="cb-contactCard-title">{c.name || "Unknown"}</div>

                                                        <div className="cb-contactMetaGroup">
                                                            <div className="cb-contactMeta cb-contactMeta--withIcon">
                                                                <img
                                                                    src={ContactBookPhoneIcon}
                                                                    alt=""
                                                                    aria-hidden="true"
                                                                    className="cb-contactMetaIcon"
                                                                />
                                                                <span>{nonEmpty(c.phone) ? c.phone : "No phone"}</span>
                                                            </div>

                                                            <div className="cb-contactMeta cb-contactMeta--withIcon">
                                                                <img
                                                                    src={ContactBookEmailIcon}
                                                                    alt=""
                                                                    aria-hidden="true"
                                                                    className="cb-contactMetaIcon"
                                                                />
                                                                <span>{nonEmpty(c.email) ? c.email : "No email"}</span>
                                                            </div>
                                                        </div>

                                                        <div className="cb-contactDate">Received: {c.received || "—"}</div>
                                                    </button>
                                                ))}

                                                {filtered.length === 0 && (
                                                    <div className="cb-empty-inline">No contacts match “{search}”.</div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>

                                {isCompact && visibleCount < filtered.length ? (
                                    <button
                                        type="button"
                                        className="cb-viewMore"
                                        onClick={() => setVisibleCount((v) => v + 10)}
                                    >
                                        View More
                                    </button>
                                ) : null}
                            </>
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
                                    <div className="cb-detailReceived">Received: {selected.received || "—"}</div>

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
                                            <div className="cb-detailLabel">Profile</div>
                                            <div className="cb-detailValue">{nonEmpty(selected.profile) ? selected.profile : "—"}</div>
                                        </div>

                                        <div className="cb-detailRow cb-detailRow--message">
                                            <div className="cb-detailLabel">Message</div>
                                            <div className="cb-detailValue cb-detailValue--message">
                                                {nonEmpty(selected.message) ? selected.message : "No message."}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="cb-detailActions">
                                    <button
                                        type="button"
                                        className="cb-actionBtn cb-actionBtn--delete"
                                        onClick={() => deleteContact(selected.id)}
                                    >
                                        <img src={DeleteIcon} alt="" aria-hidden="true" className="cb-actionIcon cb-actionIcon--delete" />
                                        <span>Delete Contact</span>
                                    </button>

                                    <button
                                        type="button"
                                        className="cb-actionBtn cb-actionBtn--save"
                                        onClick={exportSelected}
                                    >
                                        <img src={SaveIcon} alt="" aria-hidden="true" className="cb-actionIcon cb-actionIcon--save" />
                                        <span>Save Contact</span>
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