import React from "react";

const nonEmpty = (v) => typeof v === "string" && v.trim().length > 0;

export default function Template2({ vm }) {
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
        onExchangeContact,
    } = vm;

    const shell = {
        maxWidth: 980,
        margin: "0 auto",
        padding: "28px 18px 48px",
    };

    const heroCard = {
        borderRadius: 18,
        overflow: "hidden",
        border: "1px solid rgba(0,0,0,0.08)",
        background: themeStyles?.backgroundColor === "#1F1F1F" ? "rgba(255,255,255,0.04)" : "#fff",
        boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
    };

    const sectionTitle = {
        margin: "26px 0 10px",
        fontWeight: 900,
        fontSize: 18,
        letterSpacing: 0.2,
        textAlign: "center",
    };

    const grid = {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        gap: 10,
    };

    const pill = {
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 14px",
        borderRadius: 999,
        border: "1px solid rgba(0,0,0,0.10)",
        background: themeStyles?.backgroundColor === "#1F1F1F" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
    };

    const MainSection = () =>
        showMainSection ? (
            <div style={heroCard}>
                {nonEmpty(cover) && (
                    <div style={{ height: 260, width: "100%", overflow: "hidden" }}>
                        <img
                            src={cover}
                            alt="Cover"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                    </div>
                )}

                <div style={{ padding: 18, textAlign: "center" }}>
                    {nonEmpty(mainHeading) && (
                        <h2 style={{ margin: 0, fontSize: 26, fontWeight: 950 }}>{mainHeading}</h2>
                    )}
                    {nonEmpty(subHeading) && (
                        <p style={{ margin: "8px 0 0", opacity: 0.85 }}>{subHeading}</p>
                    )}

                    {(nonEmpty(fullName) || nonEmpty(jobTitle) || nonEmpty(avatar)) && (
                        <div style={{ marginTop: 16, display: "flex", justifyContent: "center", gap: 12 }}>
                            {nonEmpty(avatar) && (
                                <img
                                    src={avatar}
                                    alt="Avatar"
                                    style={{
                                        width: 56,
                                        height: 56,
                                        borderRadius: 14,
                                        objectFit: "cover",
                                        border: "1px solid rgba(0,0,0,0.10)",
                                    }}
                                />
                            )}
                            <div style={{ textAlign: "left" }}>
                                {nonEmpty(fullName) && <div style={{ fontWeight: 900 }}>{fullName}</div>}
                                {nonEmpty(jobTitle) && <div style={{ opacity: 0.8, fontSize: 14 }}>{jobTitle}</div>}
                            </div>
                        </div>
                    )}

                    {hasContact && (
                        <button
                            type="button"
                            onClick={onExchangeContact}
                            style={{
                                ...ctaStyle,
                                marginTop: 18,
                                padding: "12px 18px",
                                borderRadius: 12,
                                border: "none",
                                fontWeight: 900,
                                cursor: "pointer",
                            }}
                        >
                            Save Contact
                        </button>
                    )}
                </div>
            </div>
        ) : null;

    const AboutSection = () =>
        showAboutMeSection ? (
            <div>
                <div style={sectionTitle}>About</div>
                {nonEmpty(bio) && (
                    <div
                        style={{
                            padding: 16,
                            borderRadius: 16,
                            border: "1px solid rgba(0,0,0,0.08)",
                            background: themeStyles?.backgroundColor === "#1F1F1F" ? "rgba(255,255,255,0.04)" : "#fff",
                            lineHeight: 1.45,
                            textAlign: "center",
                            opacity: 0.95,
                        }}
                    >
                        {bio}
                    </div>
                )}
            </div>
        ) : null;

    const WorkSection = () =>
        showWorkSection ? (
            <div>
                <div style={sectionTitle}>Work</div>
                <div style={grid}>
                    {works.map((url, i) => (
                        <div
                            key={i}
                            style={{
                                borderRadius: 14,
                                overflow: "hidden",
                                border: "1px solid rgba(0,0,0,0.08)",
                                background: themeStyles?.backgroundColor === "#1F1F1F" ? "rgba(255,255,255,0.04)" : "#fff",
                            }}
                        >
                            <img src={url} alt={`work-${i}`} style={{ width: "100%", height: 160, objectFit: "cover" }} />
                        </div>
                    ))}
                </div>
            </div>
        ) : null;

    const ServicesSection = () =>
        showServicesSection ? (
            <div>
                <div style={sectionTitle}>Services</div>
                <div style={{ display: "grid", gap: 10 }}>
                    {services.map((s, i) => (
                        <div key={i} style={{ ...pill, justifyContent: "space-between" }}>
                            <div style={{ fontWeight: 900 }}>{s.name}</div>
                            {nonEmpty(s.price) && <div style={{ opacity: 0.85 }}>{s.price}</div>}
                        </div>
                    ))}
                </div>
            </div>
        ) : null;

    const ReviewsSection = () =>
        showReviewsSection ? (
            <div>
                <div style={sectionTitle}>Reviews</div>
                <div style={{ display: "grid", gap: 10 }}>
                    {reviews.map((r, i) => (
                        <div
                            key={i}
                            style={{
                                padding: 14,
                                borderRadius: 16,
                                border: "1px solid rgba(0,0,0,0.08)",
                                background: themeStyles?.backgroundColor === "#1F1F1F" ? "rgba(255,255,255,0.04)" : "#fff",
                            }}
                        >
                            <div style={{ fontWeight: 900, marginBottom: 6 }}>
                                {nonEmpty(r.name) ? r.name : "Review"}
                            </div>
                            {nonEmpty(r.text) && <div style={{ opacity: 0.9 }}>{`"${r.text}"`}</div>}
                            {typeof r.rating === "number" && r.rating > 0 && (
                                <div style={{ marginTop: 8, opacity: 0.9 }}>
                                    {"★".repeat(Math.min(5, Math.max(0, r.rating)))}
                                    <span style={{ opacity: 0.35 }}>
                                        {"★".repeat(Math.max(0, 5 - Math.min(5, Math.max(0, r.rating))))}
                                    </span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        ) : null;

    const ContactSection = () =>
        showContactSection ? (
            <div>
                <div style={sectionTitle}>Contact</div>
                <div style={{ display: "grid", gap: 10, justifyItems: "center" }}>
                    {nonEmpty(email) && <div style={pill}>{email}</div>}
                    {nonEmpty(phone) && <div style={pill}>{phone}</div>}
                    {socialLinks?.length > 0 && (
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
                            {socialLinks.map((s) => (
                                <a
                                    key={s.key}
                                    href={s.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: 12,
                                        display: "inline-flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        border: "1px solid rgba(0,0,0,0.10)",
                                        background: themeStyles?.backgroundColor === "#1F1F1F" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
                                    }}
                                    aria-label={s.label}
                                >
                                    <img src={s.icon} alt="" style={{ width: 20, height: 20 }} />
                                </a>
                            ))}
                        </div>
                    )}
                </div>
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
        <div className="user-landing-page template-2" style={themeStyles}>
            <div style={shell}>{sectionOrder.map((k) => sectionMap[k]).filter(Boolean)}</div>
        </div>
    );
}
