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

const nonEmpty = (v) => typeof v === "string" && v.trim().length > 0;

function prettyDate(d) {
    try {
        const dt = new Date(d);
        if (Number.isNaN(dt.getTime())) return "—";
        return dt.toLocaleDateString("en-GB");
    } catch {
        return "—";
    }
}

export default function ContactBook() {
    const { user: authUser } = useContext(AuthContext);
    const queryClient = useQueryClient();

    const [search, setSearch] = useState("");
    const [selectedId, setSelectedId] = useState(null);

    const [visibleCount, setVisibleCount] = useState(10);

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
        staleTime: 60000,
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
            received: prettyDate(x.createdAt),
            raw: x,
        }));
    }, [exchanges]);

    useEffect(() => {
        if (!selectedId && contacts.length) {
            setSelectedId(contacts[0].id);
        }
    }, [contacts]);

    const selected = useMemo(
        () => contacts.find((c) => c.id === selectedId),
        [contacts, selectedId]
    );

    const filtered = useMemo(() => {
        const q = search.toLowerCase().trim();

        if (!q) return contacts;

        return contacts.filter((c) =>
            `${c.name} ${c.email} ${c.phone}`.toLowerCase().includes(q)
        );
    }, [contacts, search]);

    const displayedContacts = filtered.slice(0, visibleCount);

    const deleteContact = async (id) => {
        const ok = window.confirm("Delete this contact?");
        if (!ok) return;

        try {
            await api.delete(`/contact-exchanges/${id}`);
            toast.success("Contact deleted");
            queryClient.invalidateQueries(["contact-exchanges"]);
        } catch (e) {
            toast.error("Failed to delete contact");
        }
    };

    const exportCSV = () => {
        if (!selected) return;

        const rows = [
            ["Name", "Email", "Phone", "Profile", "Message"],
            [selected.name, selected.email, selected.phone, selected.profile, selected.message],
        ];

        const csv = rows.map((r) => r.join(",")).join("\n");

        const blob = new Blob([csv]);
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "contact.csv";
        a.click();
    };

    return (
        <DashboardLayout hideDesktopHeader>
            <div className="cb-shell">
                <PageHeader
                    title="Contact Book"
                    subtitle="People who exchanged their details from your public KonarCard profile."
                />

                <div className="cb-grid">
                    {/* LEFT */}
                    <section className="cb-card cb-listCard">
                        <div className="cb-listHeader">
                            <h3>My Contacts</h3>
                            <p>Search and select a contact to view details.</p>

                            <input
                                className="cb-search"
                                placeholder="Search Contacts"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <div className="cb-contactList">
                            {displayedContacts.map((c) => (
                                <button
                                    key={c.id}
                                    className={`cb-contactCard ${selectedId === c.id ? "active" : ""
                                        }`}
                                    onClick={() => setSelectedId(c.id)}
                                >
                                    <div className="cb-contactName">{c.name}</div>
                                    <div className="cb-contactMeta">{c.phone}</div>
                                    <div className="cb-contactMeta">{c.email}</div>
                                    <div className="cb-contactDate">
                                        Received: {c.received}
                                    </div>
                                </button>
                            ))}
                        </div>

                        {visibleCount < filtered.length && (
                            <button
                                className="cb-viewMore"
                                onClick={() => setVisibleCount((v) => v + 10)}
                            >
                                View More
                            </button>
                        )}
                    </section>

                    {/* RIGHT */}
                    <section className="cb-card cb-detailCard">
                        {selected ? (
                            <>
                                <div className="cb-detailTop">
                                    <h3>{selected.name}</h3>
                                    <div className="cb-detailDate">
                                        Received: {selected.received}
                                    </div>
                                </div>

                                <div className="cb-detailRows">
                                    <div className="cb-detailRow">
                                        <span>Email</span>
                                        <span>{selected.email || "—"}</span>
                                    </div>

                                    <div className="cb-detailRow">
                                        <span>Phone</span>
                                        <span>{selected.phone || "—"}</span>
                                    </div>

                                    <div className="cb-detailRow">
                                        <span>Profile</span>
                                        <span>{selected.profile || "—"}</span>
                                    </div>

                                    <div className="cb-detailRow">
                                        <span>Message</span>
                                        <span>{selected.message || "No message."}</span>
                                    </div>
                                </div>

                                <div className="cb-actions">
                                    <button
                                        className="cb-btn cb-btn-delete"
                                        onClick={() => deleteContact(selected.id)}
                                    >
                                        <img src={DeleteIcon} alt="" />
                                        Delete Contact
                                    </button>

                                    <button
                                        className="cb-btn cb-btn-save"
                                        onClick={exportCSV}
                                    >
                                        <img src={SaveIcon} alt="" />
                                        Save Contact
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="cb-empty">Select a contact</div>
                        )}
                    </section>
                </div>
            </div>
        </DashboardLayout>
    );
}