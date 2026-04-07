import React, { useMemo, useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import PageHeader from "../../components/Dashboard/PageHeader";
import api from "../../services/api";
import { useAuthUser } from "../../hooks/useAuthUser";

import "../../styling/spacing.css";
import "../../styling/dashboard/contactbook.css";

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

function escapeVCardValue(value = "") {
    return String(value)
        .replace(/\\/g, "\\\\")
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "")
        .replace(/,/g, "\\,")
        .replace(/;/g, "\\;");
}

function sanitizeFileName(value = "") {
    const clean = String(value || "")
        .trim()
        .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "")
        .replace(/\s+/g, "-");

    return clean || "contact";
}

function buildPublicProfileUrl(profileSlug = "") {
    if (!nonEmpty(profileSlug) || typeof window === "undefined") return "";
    return `${window.location.origin}/u/${encodeURIComponent(profileSlug.trim())}`;
}

function buildVCard(contact) {
    const fullName = nonEmpty(contact?.name) ? contact.name.trim() : "Unknown Contact";
    const email = nonEmpty(contact?.email) ? contact.email.trim() : "";
    const phone = nonEmpty(contact?.phone) ? contact.phone.trim() : "";
    const profile = nonEmpty(contact?.profile) ? contact.profile.trim() : "";
    const profileUrl = buildPublicProfileUrl(profile);
    const received = nonEmpty(contact?.received) ? contact.received.trim() : "";
    const message = nonEmpty(contact?.message) ? contact.message.trim() : "";

    const noteParts = [
        profile ? `KonarCard profile: ${profile}` : "",
        profileUrl ? `Profile link: ${profileUrl}` : "",
        received ? `Received: ${received}` : "",
        message ? `Message: ${message}` : "",
    ].filter(Boolean);

    const lines = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `FN:${escapeVCardValue(fullName)}`,
        `N:${escapeVCardValue(fullName)};;;;`,
    ];

    if (phone) {
        lines.push(`TEL;TYPE=CELL:${escapeVCardValue(phone)}`);
    }

    if (email) {
        lines.push(`EMAIL;TYPE=INTERNET:${escapeVCardValue(email)}`);
    }

    if (noteParts.length) {
        lines.push(`NOTE:${escapeVCardValue(noteParts.join("\n"))}`);
    }

    if (profileUrl) {
        lines.push(`URL:${escapeVCardValue(profileUrl)}`);
    }

    lines.push("END:VCARD");

    return lines.join("\r\n");
}

function isLikelyMobileDevice() {
    if (typeof navigator === "undefined") return false;

    const ua = navigator.userAgent || "";
    return /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
}

export default function ContactBook() {
    const { data: authUser } = useAuthUser();
    const queryClient = useQueryClient();

    const [search, setSearch] = useState("");
    const [selectedId, setSelectedId] = useState(null);
    const [visibleCount, setVisibleCount] = useState(10);
    const [isCompact, setIsCompact] = useState(() =>
        typeof window !== "undefined" ? window.innerWidth <= 1200 : false
    );
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

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
        refetch,
    } = useQuery({
        queryKey: ["contact-exchanges"],
        queryFn: async () => {
            const res = await api.get("/contact-exchanges");
            const status = Number(res?.status || 0);

            if (status >= 400) {
                throw new Error(res?.data?.error || "Failed to load contacts.");
            }

            const payload = res?.data;
            return Array.isArray(payload) ? payload : [];
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

        if (!contacts.length) {
            setSelectedId(null);
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
        if (!id || isDeleting) return;

        try {
            setIsDeleting(true);

            const res = await api.delete(`/contact-exchanges/${id}`);
            const status = Number(res?.status || 0);

            if (status >= 400) {
                throw new Error(res?.data?.error || "Failed to delete contact");
            }

            toast.success("Contact deleted");
            setConfirmDeleteId(null);

            await queryClient.invalidateQueries({ queryKey: ["contact-exchanges"] });
        } catch (err) {
            toast.error(err?.response?.data?.error || err?.message || "Failed to delete contact");
        } finally {
            setIsDeleting(false);
        }
    };

    const saveSelectedContact = async () => {
        if (!selected) {
            toast.error("Select a contact first.");
            return;
        }

        if (!nonEmpty(selected.name) && !nonEmpty(selected.phone) && !nonEmpty(selected.email)) {
            toast.error("This contact doesn’t have enough information to save.");
            return;
        }

        try {
            const vcard = buildVCard(selected);
            const fileName = `${sanitizeFileName(selected.name)}.vcf`;
            const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8" });
            const file = new File([blob], fileName, { type: "text/vcard" });

            if (
                typeof navigator !== "undefined" &&
                navigator.share &&
                typeof navigator.canShare === "function" &&
                navigator.canShare({ files: [file] })
            ) {
                try {
                    await navigator.share({
                        files: [file],
                        title: selected.name || "Contact",
                        text: "Save contact",
                    });
                    return;
                } catch (shareError) {
                    if (shareError?.name === "AbortError") {
                        return;
                    }
                }
            }

            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;

            if (isLikelyMobileDevice()) {
                link.target = "_self";
                link.rel = "noopener";
            } else {
                link.download = fileName;
            }

            document.body.appendChild(link);
            link.click();
            link.remove();

            window.setTimeout(() => {
                URL.revokeObjectURL(url);
            }, 1500);

            if (!isLikelyMobileDevice()) {
                toast.success("Contact file opened/downloaded.");
            }
        } catch (err) {
            toast.error(err?.message || "Couldn’t prepare this contact.");
        }
    };

    const showEmpty = !isLoading && !isError && contacts.length === 0;
    const showDeleteConfirm = !!selected && confirmDeleteId === selected.id;

    return (
        <DashboardLayout hideDesktopHeader>
            <div className="cb-shell">
                <PageHeader
                    title="Contact Book"
                    subtitle="People who exchanged their details from your public KonarCard profile."
                />

                <div className="cb-grid">
                    <section className="cb-card cb-listCard">
                        <div className="cb-card-head cb-card-head--row">
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
                                    {error?.message || "Something went wrong."}
                                </div>

                                <div className="profiles-actions-row" style={{ marginTop: 12 }}>
                                    <button
                                        type="button"
                                        className="kx-btn kx-btn--black"
                                        onClick={() => refetch()}
                                    >
                                        Retry
                                    </button>
                                </div>
                            </div>
                        ) : showEmpty ? (
                            <div className="cb-inlineState cb-emptyState">
                                <div className="cb-inlineTitle">No contacts yet</div>
                                <div className="cb-inlineText">
                                    This page will populate when someone uses{" "}
                                    <strong>Exchange Contact</strong> on your public profile.
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
                                                        className={`cb-contactCard ${selected?.id === c.id ? "is-active" : ""
                                                            }`}
                                                        onClick={() => {
                                                            setSelectedId(c.id);
                                                            setConfirmDeleteId(null);
                                                        }}
                                                    >
                                                        <div className="cb-contactCard-title">
                                                            {c.name || "Unknown"}
                                                        </div>

                                                        <div className="cb-contactMetaGroup">
                                                            <div className="cb-contactMeta cb-contactMeta--withIcon">
                                                                <img
                                                                    src={ContactBookPhoneIcon}
                                                                    alt=""
                                                                    aria-hidden="true"
                                                                    className="cb-contactMetaIcon"
                                                                />
                                                                <span>
                                                                    {nonEmpty(c.phone)
                                                                        ? c.phone
                                                                        : "No phone"}
                                                                </span>
                                                            </div>

                                                            <div className="cb-contactMeta cb-contactMeta--withIcon">
                                                                <img
                                                                    src={ContactBookEmailIcon}
                                                                    alt=""
                                                                    aria-hidden="true"
                                                                    className="cb-contactMetaIcon"
                                                                />
                                                                <span>
                                                                    {nonEmpty(c.email)
                                                                        ? c.email
                                                                        : "No email"}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="cb-contactDate">
                                                            Received: {c.received || "—"}
                                                        </div>
                                                    </button>
                                                ))}

                                                {filtered.length === 0 && (
                                                    <div className="cb-empty-inline">
                                                        No contacts match “{search}”.
                                                    </div>
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
                                <p className="cb-muted">
                                    Information submitted through Exchange Contact.
                                </p>
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
                                <div className="cb-inlineText">
                                    Fix the error on the left and try again.
                                </div>
                            </div>
                        ) : showEmpty ? (
                            <div className="cb-inlineState cb-emptyState">
                                <div className="cb-inlineTitle">Nothing to show</div>
                                <div className="cb-inlineText">
                                    When you receive contacts, they’ll appear here.
                                </div>
                            </div>
                        ) : !selected ? (
                            <div className="cb-inlineState cb-emptyState">
                                <div className="cb-inlineTitle">Select a contact</div>
                                <div className="cb-inlineText">
                                    Pick someone from the list to view their details.
                                </div>
                            </div>
                        ) : (
                            <div className="cb-detailBody">
                                <div className="cb-detailPanel">
                                    <div className="cb-detailName">{selected.name || "Unknown"}</div>
                                    <div className="cb-detailReceived">
                                        Received: {selected.received || "—"}
                                    </div>

                                    <div className="cb-detailRows">
                                        <div className="cb-detailRow">
                                            <div className="cb-detailLabel">Email</div>
                                            <div className="cb-detailValue">
                                                {nonEmpty(selected.email) ? selected.email : "—"}
                                            </div>
                                        </div>

                                        <div className="cb-detailRow">
                                            <div className="cb-detailLabel">Phone</div>
                                            <div className="cb-detailValue">
                                                {nonEmpty(selected.phone) ? selected.phone : "—"}
                                            </div>
                                        </div>

                                        <div className="cb-detailRow">
                                            <div className="cb-detailLabel">Profile</div>
                                            <div className="cb-detailValue">
                                                {nonEmpty(selected.profile) ? selected.profile : "—"}
                                            </div>
                                        </div>

                                        <div className="cb-detailRow cb-detailRow--message">
                                            <div className="cb-detailLabel">Message</div>
                                            <div className="cb-detailValue cb-detailValue--message">
                                                {nonEmpty(selected.message)
                                                    ? selected.message
                                                    : "No message."}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {showDeleteConfirm ? (
                                    <div className="cb-inlineState cb-error cb-inlineState--confirm">
                                        <div className="cb-inlineTitle">Delete this contact?</div>
                                        <div className="cb-inlineText">This cannot be undone.</div>

                                        <div className="profiles-actions-row" style={{ marginTop: 12 }}>
                                            <button
                                                type="button"
                                                className="kx-btn kx-btn--white"
                                                onClick={() => setConfirmDeleteId(null)}
                                                disabled={isDeleting}
                                            >
                                                Cancel
                                            </button>

                                            <button
                                                type="button"
                                                className="kx-btn kx-btn--black"
                                                onClick={() => deleteContact(selected.id)}
                                                disabled={isDeleting}
                                            >
                                                {isDeleting ? "Deleting..." : "Confirm Delete"}
                                            </button>
                                        </div>
                                    </div>
                                ) : null}

                                <div className="cb-detailActions">
                                    <button
                                        type="button"
                                        className="cb-actionBtn cb-actionBtn--delete"
                                        onClick={() => setConfirmDeleteId(selected.id)}
                                        disabled={isDeleting}
                                    >
                                        <img
                                            src={DeleteIcon}
                                            alt=""
                                            aria-hidden="true"
                                            className="cb-actionIcon cb-actionIcon--delete"
                                        />
                                        <span>Delete Contact</span>
                                    </button>

                                    <button
                                        type="button"
                                        className="cb-actionBtn cb-actionBtn--save"
                                        onClick={saveSelectedContact}
                                    >
                                        <img
                                            src={SaveIcon}
                                            alt=""
                                            aria-hidden="true"
                                            className="cb-actionIcon cb-actionIcon--save"
                                        />
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