// src/pages/interface/HelpCentreInterface.jsx
import React, { useContext, useMemo } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import PageHeader from "../../components/Dashboard/PageHeader";
import "../../styling/dashboard/helpcentreinterface.css";

import { AuthContext } from "../../components/AuthContext";
import { useFetchBusinessCard } from "../../hooks/useFetchBusinessCard";

export default function HelpCentreInterface() {
  const { user: authUser } = useContext(AuthContext);

  const userId = authUser?._id;
  const userUsername = authUser?.username;

  // keep your consistency hook
  useFetchBusinessCard(userId);

  const currentProfileUrl = userUsername
    ? `https://www.konarcard.com/u/${userUsername}`
    : "";

  const openChat = () => {
    try {
      window.tidioChatApi?.open?.();
    } catch {
      // ignore
    }
  };

  const videos = useMemo(
    () => [
      {
        id: "v1",
        icon: "🚀",
        title: "Getting started (2 minutes)",
        desc: "Create your first profile, add the essentials, and share your link.",
        length: "2:08",
        level: "Beginner",
      },
      {
        id: "v2",
        icon: "🧩",
        title: "Edit your profile like a pro",
        desc: "Update services, add links, and keep your details always current.",
        length: "3:12",
        level: "Beginner",
      },
      {
        id: "v3",
        icon: "📸",
        title: "Add photos that build trust",
        desc: "Upload the right images to show proof, quality, and your best work.",
        length: "2:41",
        level: "Beginner",
      },
      {
        id: "v4",
        icon: "⭐",
        title: "Collect reviews (the simple method)",
        desc: "Ask at the right moment and display reviews to win more quotes.",
        length: "4:05",
        level: "Intermediate",
      },
      {
        id: "v5",
        icon: "🔗",
        title: "Share your profile link (fast)",
        desc: "Copy + send to customers, add to WhatsApp, and post to socials.",
        length: "2:22",
        level: "Beginner",
      },
      {
        id: "v6",
        icon: "📲",
        title: "Using your KonarCard (tap-to-share)",
        desc: "How tap works, what customers see, and best practices on-site.",
        length: "3:48",
        level: "Beginner",
      },
      {
        id: "v7",
        icon: "🎨",
        title: "Branding & themes",
        desc: "Pick a clean theme, match colours, and keep everything consistent.",
        length: "3:25",
        level: "Intermediate",
      },
      {
        id: "v8",
        icon: "📈",
        title: "Analytics: understand what’s working",
        desc: "See profile views, taps, and link clicks — then improve your results.",
        length: "4:16",
        level: "Intermediate",
      },
      {
        id: "v9",
        icon: "👥",
        title: "Contact Book: follow up properly",
        desc: "Track people who saved you and message them at the right time.",
        length: "3:03",
        level: "Intermediate",
      },
      {
        id: "v10",
        icon: "🛠️",
        title: "Troubleshooting (quick fixes)",
        desc: "If tap/share isn’t working, fix it in under 60 seconds.",
        length: "1:18",
        level: "Beginner",
      },
    ],
    []
  );

  const headerRight = (
    <div className="hc3-headRight">
      {currentProfileUrl ? (
        <a className="kc-pill hc3-pillLink" href={currentProfileUrl} target="_blank" rel="noreferrer">
          Visit your profile
        </a>
      ) : (
        <span className="kc-pill">Profile: —</span>
      )}

      <button type="button" className="kx-btn kx-btn--white" onClick={openChat}>
        Live chat
      </button>

      <Link to="/contact" className="kx-btn kx-btn--orange">
        Contact support
      </Link>
    </div>
  );

  return (
    <DashboardLayout title={null} subtitle={null} hideDesktopHeader>
      <div className="hc3-shell">
        <PageHeader
          title="Help Centre"
          subtitle="Watch quick tutorials and follow step-by-step guides."
          rightSlot={headerRight}
        />

        <section className="hc3-grid" aria-label="Help videos">
          {videos.map((v) => (
            <article key={v.id} className="hc3-card">
              <div className="hc3-top">
                <div className="hc3-titleWrap">
                  <div className="hc3-ico" aria-hidden="true">
                    {v.icon}
                  </div>

                  <div className="hc3-txt">
                    <div className="kc-title hc3-title">{v.title}</div>
                    <div className="kc-body hc3-desc">{v.desc}</div>
                  </div>
                </div>

                <div className="hc3-meta">
                  <span className="hc3-chip">{v.level}</span>
                  <span className="hc3-chip hc3-chip--ghost">{v.length}</span>
                </div>
              </div>

              <div className="hc3-actions">
                {/* ✅ does nothing for now */}
                <button type="button" className="kx-btn kx-btn--black" onClick={() => { }}>
                  Watch video
                </button>

                <button type="button" className="kx-btn kx-btn--white" onClick={openChat}>
                  Live chat
                </button>
              </div>
            </article>
          ))}
        </section>
      </div>
    </DashboardLayout>
  );
}