// src/components/Dashboard/Template5.jsx
import React from "react";

const nonEmpty = (v) => typeof v === "string" && v.trim().length > 0;

export default function Template5({ vm }) {
    const {
        themeStyles,
        sectionOrder,

        showMainSection,
        showAboutMeSection,
        showWorkSection,
        showServicesSection,
        showReviewsSection,
        showContactSection,

        cover,
        avatar,
        mainHeading,
        subHeading,
        fullName,
        jobTitle,
        bio,
        works,
        services,
        reviews,
        email,
        phone,
        hasContact,
        socialLinks,

        ctaStyle,

        // ✅ actions from UserPage vm
        onSaveMyNumber,
        onOpenExchangeContact,
    } = vm;

    const shell = { maxWidth: 980, margin: "0 auto", padding: "26px 16px 56px" };

    const card = {
        borderRadius: 20,
        border: "2px solid rgba(0,0,0,0.10)",
        background: themeStyles?.backgroundColor === "#1F1F1F" ? "rgba(255,255,255,0.05)" : "#fff",
        padding: 16,
        boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
    };

    const title = { margin: "0 0 12px", fontWeight: 1000, fontSize: 18 };

    const btn = {
        ...ctaStyle,
        padding: "12px 18px",
        borderRadius: 14,
        border: "none",
        fontWeight: 1000,
        cursor: "pointer",
    };

    const Head = () =>
        showMainSection ? (
            <div style={{ ...card, padding: 0, overflow: "hidden" }}>
                {nonEmpty(cover) && (
                    <img src={cover} alt="Cover" style={{ width: "100%", height: 240, objectFit: "cover" }} />
                )}

                <div style={{ padding: 16 }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        {nonEmpty(avatar) && (
                            <img
                                src={avatar}
                                alt="Avatar"
                                style={{
                                    width: 64,
                                    height: 64,
                                    borderRadius: 18,
                                    objectFit: "cover",
                                    border: "2px solid rgba(0,0,0,0.10)",
                                }}
                            />
                        )}
                        <div style={{ minWidth: 0 }}>
                            {nonEmpty(fullName) && <div style={{ fontWeight: 1000 }}>{fullName}</div>}
                            {nonEmpty(jobTitle) && <div style={{ opacity: 0.8, fontSize: 14 }}>{jobTitle}</div>}
                        </div>
                    </div>

                    {nonEmpty(mainHeading) && (
                        <h1 style={{ margin: "14px 0 0", fontSize: 30, fontWeight: 1000 }}>{mainHeading}</h1>
                    )}
                    {nonEmpty(subHeading) && <p style={{ margin: "8px 0 0", opacity: 0.85 }}>{subHeading}</p>}

                    {hasContact && (
                        <div style={{ marginTop: 14, display: "grid", gap: 10, maxWidth: 520 }}>
                            {/* ✅ existing: download vCard */}
                            <button type="button" onClick={onSaveMyNumber} style={btn}>
                                Save My Number
                            </button>

                            {/* ✅ new: open exchange modal */}
                            <button type="button" onClick={onOpenExchangeContact} style={btn}>
                                Exchange Contact
                            </button>
                        </div>
                    )}
                </div>
            </div>
        ) : null;

    const About = () =>
        showAboutMeSection ? (
            <div style={card}>
                <div style={title}>About</div>
                {nonEmpty(bio) && <div style={{ opacity: 0.92, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{bio}</div>}
            </div>
        ) : null;

    const Work = () =>
        showWorkSection ? (
            <div style={card}>
                <div style={title}>Work</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
                    {(works || []).map((url, i) => (
                        <img
                            key={i}
                            src={url}
                            alt={`work-${i}`}
                            style={{ width: "100%", height: 170, borderRadius: 18, objectFit: "cover" }}
                        />
                    ))}
                </div>
            </div>
        ) : null;

    const Services = () =>
        showServicesSection ? (
            <div style={card}>
                <div style={title}>Services</div>
                <div style={{ display: "grid", gap: 10 }}>
                    {(services || []).map((s, i) => (
                        <div
                            key={i}
                            style={{
                                padding: 14,
                                borderRadius: 16,
                                border: "2px solid rgba(0,0,0,0.08)",
                                display: "flex",
                                justifyContent: "space-between",
                                gap: 10,
                            }}
                        >
                            <div style={{ fontWeight: 1000 }}>{s?.name || ""}</div>
                            {nonEmpty(s?.price) && <div style={{ opacity: 0.85 }}>{s.price}</div>}
                        </div>
                    ))}
                </div>
            </div>
        ) : null;

    const Reviews = () =>
        showReviewsSection ? (
            <div style={card}>
                <div style={title}>Reviews</div>
                <div style={{ display: "grid", gap: 10 }}>
                    {(reviews || []).map((r, i) => {
                        const rating = Number(r?.rating || 0);
                        const fullStars = Math.min(5, Math.max(0, rating));
                        const emptyStars = Math.max(0, 5 - fullStars);

                        return (
                            <div
                                key={i}
                                style={{
                                    padding: 14,
                                    borderRadius: 16,
                                    border: "2px solid rgba(0,0,0,0.08)",
                                }}
                            >
                                <div style={{ fontWeight: 1000 }}>{r?.name || "Review"}</div>
                                {nonEmpty(r?.text) && <div style={{ marginTop: 8, opacity: 0.9 }}>{`"${r.text}"`}</div>}

                                {fullStars > 0 && (
                                    <div style={{ marginTop: 8, opacity: 0.9 }}>
                                        {"★".repeat(fullStars)}
                                        <span style={{ opacity: 0.35 }}>{"★".repeat(emptyStars)}</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        ) : null;

    const Contact = () =>
        showContactSection ? (
            <div style={card}>
                <div style={title}>Contact</div>
                <div style={{ display: "grid", gap: 8 }}>
                    {nonEmpty(email) && <div style={{ opacity: 0.9 }}>{email}</div>}
                    {nonEmpty(phone) && <div style={{ opacity: 0.9 }}>{phone}</div>}
                </div>

                {socialLinks?.length > 0 && (
                    <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                        {socialLinks.map((s) => (
                            <a
                                key={s.key}
                                href={s.url}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 16,
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    border: "2px solid rgba(0,0,0,0.08)",
                                }}
                                aria-label={s.label}
                            >
                                <img src={s.icon} alt="" style={{ width: 22, height: 22 }} />
                            </a>
                        ))}
                    </div>
                )}
            </div>
        ) : null;

    const sectionMap = {
        main: <Head key="main" />,
        about: <About key="about" />,
        work: <Work key="work" />,
        services: <Services key="services" />,
        reviews: <Reviews key="reviews" />,
        contact: <Contact key="contact" />,
    };

    return (
        <div className="user-landing-page template-5" style={themeStyles}>
            <div style={shell}>
                <div style={{ display: "grid", gap: 14 }}>
                    {(sectionOrder || []).map((k) => sectionMap[k]).filter(Boolean)}
                </div>
            </div>
        </div>
    );
}
