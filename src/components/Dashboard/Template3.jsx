// src/components/Dashboard/Template3.jsx
import React from "react";

const nonEmpty = (v) => typeof v === "string" && v.trim().length > 0;

export default function Template3({ vm }) {
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

    const wrap = {
        maxWidth: 1100,
        margin: "0 auto",
        padding: "24px 16px 48px",
        display: "grid",
        gridTemplateColumns: "340px 1fr",
        gap: 16,
    };

    const card = {
        borderRadius: 18,
        overflow: "hidden",
        border: "1px solid rgba(0,0,0,0.08)",
        background: themeStyles?.backgroundColor === "#1F1F1F" ? "rgba(255,255,255,0.04)" : "#fff",
        boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
    };

    const section = {
        padding: 16,
        borderRadius: 18,
        border: "1px solid rgba(0,0,0,0.08)",
        background: themeStyles?.backgroundColor === "#1F1F1F" ? "rgba(255,255,255,0.04)" : "#fff",
        marginBottom: 12,
    };

    const title = { margin: "0 0 10px", fontWeight: 950, fontSize: 18 };

    const leftBtnStyle = {
        ...ctaStyle,
        width: "100%",
        padding: "12px 14px",
        borderRadius: 12,
        border: "none",
        fontWeight: 900,
        cursor: "pointer",
    };

    const Left = () => (
        <div style={{ position: "sticky", top: 14, alignSelf: "start" }}>
            <div style={card}>
                {nonEmpty(cover) && (
                    <img src={cover} alt="Cover" style={{ width: "100%", height: 170, objectFit: "cover" }} />
                )}

                <div style={{ padding: 16 }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        {nonEmpty(avatar) && (
                            <img
                                src={avatar}
                                alt="Avatar"
                                style={{ width: 56, height: 56, borderRadius: 14, objectFit: "cover" }}
                            />
                        )}
                        <div style={{ minWidth: 0 }}>
                            {nonEmpty(fullName) && (
                                <div style={{ fontWeight: 950, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {fullName}
                                </div>
                            )}
                            {nonEmpty(jobTitle) && (
                                <div style={{ opacity: 0.8, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {jobTitle}
                                </div>
                            )}
                        </div>
                    </div>

                    {nonEmpty(mainHeading) && <h2 style={{ margin: "14px 0 0", fontSize: 22 }}>{mainHeading}</h2>}
                    {nonEmpty(subHeading) && <p style={{ margin: "6px 0 0", opacity: 0.85 }}>{subHeading}</p>}

                    {hasContact && (
                        <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
                            {/* ✅ Save contact (vCard download) */}
                            <button type="button" onClick={onSaveMyNumber} style={leftBtnStyle}>
                                Save My Number
                            </button>

                            {/* ✅ New: open exchange modal */}
                            <button type="button" onClick={onOpenExchangeContact} style={leftBtnStyle}>
                                Exchange Contact
                            </button>
                        </div>
                    )}

                    {(nonEmpty(email) || nonEmpty(phone)) && (
                        <div style={{ marginTop: 12, display: "grid", gap: 6 }}>
                            {nonEmpty(email) && <div style={{ opacity: 0.9, fontSize: 14 }}>{email}</div>}
                            {nonEmpty(phone) && <div style={{ opacity: 0.9, fontSize: 14 }}>{phone}</div>}
                        </div>
                    )}

                    {socialLinks?.length > 0 && (
                        <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                            {socialLinks.map((s) => (
                                <a
                                    key={s.key}
                                    href={s.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 12,
                                        display: "inline-flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        border: "1px solid rgba(0,0,0,0.10)",
                                        background:
                                            themeStyles?.backgroundColor === "#1F1F1F"
                                                ? "rgba(255,255,255,0.05)"
                                                : "rgba(0,0,0,0.03)",
                                    }}
                                    aria-label={s.label}
                                >
                                    <img src={s.icon} alt="" style={{ width: 18, height: 18 }} />
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const MainSection = () =>
        showMainSection ? (
            <div style={section}>
                <div style={title}>Main</div>
                {nonEmpty(mainHeading) && <div style={{ fontWeight: 950, fontSize: 18 }}>{mainHeading}</div>}
                {nonEmpty(subHeading) && <div style={{ opacity: 0.85, marginTop: 6 }}>{subHeading}</div>}
            </div>
        ) : null;

    const AboutSection = () =>
        showAboutMeSection ? (
            <div style={section}>
                <div style={title}>About</div>
                {nonEmpty(bio) && <div style={{ opacity: 0.92, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{bio}</div>}
            </div>
        ) : null;

    const WorkSection = () =>
        showWorkSection ? (
            <div style={section}>
                <div style={title}>Work</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 10 }}>
                    {(works || []).map((url, i) => (
                        <img
                            key={i}
                            src={url}
                            alt={`work-${i}`}
                            style={{ width: "100%", height: 160, objectFit: "cover", borderRadius: 14 }}
                        />
                    ))}
                </div>
            </div>
        ) : null;

    const ServicesSection = () =>
        showServicesSection ? (
            <div style={section}>
                <div style={title}>Services</div>
                <div style={{ display: "grid", gap: 8 }}>
                    {(services || []).map((s, i) => (
                        <div
                            key={i}
                            style={{
                                padding: 12,
                                borderRadius: 14,
                                border: "1px solid rgba(0,0,0,0.10)",
                                display: "flex",
                                justifyContent: "space-between",
                                gap: 10,
                            }}
                        >
                            <div style={{ fontWeight: 900 }}>{s?.name || ""}</div>
                            {nonEmpty(s?.price) && <div style={{ opacity: 0.85 }}>{s.price}</div>}
                        </div>
                    ))}
                </div>
            </div>
        ) : null;

    const ReviewsSection = () =>
        showReviewsSection ? (
            <div style={section}>
                <div style={title}>Reviews</div>
                <div style={{ display: "grid", gap: 10 }}>
                    {(reviews || []).map((r, i) => {
                        const rating = Number(r?.rating || 0);
                        const fullStars = Math.min(5, Math.max(0, rating));
                        const emptyStars = Math.max(0, 5 - fullStars);

                        return (
                            <div
                                key={i}
                                style={{ padding: 12, borderRadius: 14, border: "1px solid rgba(0,0,0,0.10)" }}
                            >
                                <div style={{ fontWeight: 900 }}>{r?.name || "Review"}</div>
                                {nonEmpty(r?.text) && <div style={{ opacity: 0.9, marginTop: 6 }}>{`"${r.text}"`}</div>}

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

    const ContactSection = () =>
        showContactSection ? (
            <div style={section}>
                <div style={title}>Contact</div>
                {nonEmpty(email) && <div style={{ opacity: 0.9 }}>{email}</div>}
                {nonEmpty(phone) && <div style={{ opacity: 0.9, marginTop: 6 }}>{phone}</div>}
            </div>
        ) : null;

    const sectionMap = {
        main: <MainSection key="main" />,
        about: <AboutSection key="about" />,
        work: <WorkSection key="work" />,
        services: <ServicesSection key="services" />,
        reviews: <ReviewsSection key="reviews" />,
        contact: <ContactSection key="contact" />,
    };

    return (
        <div className="user-landing-page template-3" style={themeStyles}>
            <div style={wrap}>
                <Left />
                <div>{(sectionOrder || []).map((k) => sectionMap[k]).filter(Boolean)}</div>
            </div>
        </div>
    );
}
