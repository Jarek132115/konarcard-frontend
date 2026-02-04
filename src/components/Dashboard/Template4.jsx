// src/components/Dashboard/Template4.jsx
import React from "react";

const nonEmpty = (v) => typeof v === "string" && v.trim().length > 0;

export default function Template4({ vm }) {
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

    const shell = { maxWidth: 860, margin: "0 auto", padding: "34px 18px 56px" };
    const hr = { border: 0, height: 1, background: "rgba(0,0,0,0.12)", margin: "20px 0" };

    const header = {
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: 14,
        alignItems: "center",
    };

    const btn = {
        ...ctaStyle,
        padding: "12px 18px",
        borderRadius: 14,
        border: "none",
        fontWeight: 900,
        cursor: "pointer",
    };

    const Head = () =>
        showMainSection ? (
            <>
                {nonEmpty(cover) && (
                    <div style={{ borderRadius: 18, overflow: "hidden" }}>
                        <img src={cover} alt="Cover" style={{ width: "100%", height: 240, objectFit: "cover" }} />
                    </div>
                )}

                <div style={{ marginTop: 18, ...header }}>
                    <div style={{ minWidth: 0 }}>
                        {nonEmpty(mainHeading) && (
                            <h1
                                style={{
                                    margin: 0,
                                    fontSize: 34,
                                    fontWeight: 1000,
                                    letterSpacing: -0.5,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                }}
                            >
                                {mainHeading}
                            </h1>
                        )}
                        {nonEmpty(subHeading) && <div style={{ marginTop: 10, opacity: 0.85, fontSize: 16 }}>{subHeading}</div>}

                        {(nonEmpty(fullName) || nonEmpty(jobTitle)) && (
                            <div style={{ marginTop: 14, opacity: 0.85 }}>
                                {nonEmpty(fullName) && <div style={{ fontWeight: 900 }}>{fullName}</div>}
                                {nonEmpty(jobTitle) && <div style={{ fontSize: 14 }}>{jobTitle}</div>}
                            </div>
                        )}
                    </div>

                    {nonEmpty(avatar) && (
                        <img
                            src={avatar}
                            alt="Avatar"
                            style={{ width: 74, height: 74, borderRadius: 18, objectFit: "cover" }}
                        />
                    )}
                </div>

                {hasContact && (
                    <div style={{ marginTop: 16, display: "grid", gap: 10, maxWidth: 420 }}>
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
            </>
        ) : null;

    const About = () =>
        showAboutMeSection ? (
            <>
                <div style={hr} />
                <h3 style={{ margin: "0 0 10px", fontSize: 18, fontWeight: 1000 }}>About</h3>
                {nonEmpty(bio) && <div style={{ opacity: 0.92, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{bio}</div>}
            </>
        ) : null;

    const Work = () =>
        showWorkSection ? (
            <>
                <div style={hr} />
                <h3 style={{ margin: "0 0 10px", fontSize: 18, fontWeight: 1000 }}>Work</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
                    {(works || []).map((url, i) => (
                        <img
                            key={i}
                            src={url}
                            alt={`work-${i}`}
                            style={{ width: "100%", height: 170, borderRadius: 16, objectFit: "cover" }}
                        />
                    ))}
                </div>
            </>
        ) : null;

    const Services = () =>
        showServicesSection ? (
            <>
                <div style={hr} />
                <h3 style={{ margin: "0 0 10px", fontSize: 18, fontWeight: 1000 }}>Services</h3>
                <div style={{ display: "grid", gap: 10 }}>
                    {(services || []).map((s, i) => (
                        <div
                            key={i}
                            style={{
                                padding: 14,
                                borderRadius: 16,
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
            </>
        ) : null;

    const Reviews = () =>
        showReviewsSection ? (
            <>
                <div style={hr} />
                <h3 style={{ margin: "0 0 10px", fontSize: 18, fontWeight: 1000 }}>Reviews</h3>
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
                                    border: "1px solid rgba(0,0,0,0.10)",
                                }}
                            >
                                <div style={{ fontWeight: 900 }}>{r?.name || "Review"}</div>
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
            </>
        ) : null;

    const Contact = () =>
        showContactSection ? (
            <>
                <div style={hr} />
                <h3 style={{ margin: "0 0 10px", fontSize: 18, fontWeight: 1000 }}>Contact</h3>
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
                                    width: 44,
                                    height: 44,
                                    borderRadius: 14,
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    border: "1px solid rgba(0,0,0,0.10)",
                                }}
                                aria-label={s.label}
                            >
                                <img src={s.icon} alt="" style={{ width: 20, height: 20 }} />
                            </a>
                        ))}
                    </div>
                )}
            </>
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
        <div className="user-landing-page template-4" style={themeStyles}>
            <div style={shell}>{(sectionOrder || []).map((k) => sectionMap[k]).filter(Boolean)}</div>
        </div>
    );
}
