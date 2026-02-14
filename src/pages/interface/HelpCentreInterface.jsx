// src/pages/interface/HelpCentreInterface.jsx
import React, { useMemo, useContext } from "react";
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

  const currentProfileUrl = userUsername ? `https://www.konarcard.com/u/${userUsername}` : "";

  const isMobile = typeof window !== "undefined" ? window.innerWidth <= 1000 : false;
  const isSmallMobile = typeof window !== "undefined" ? window.innerWidth <= 520 : false;

  const sections = useMemo(
    () => [
      { id: "getting-started", title: "Getting Started", icon: "🚀", desc: "Set up your first profile and share it." },
      { id: "profile", title: "Create & Edit Your Profile", icon: "🧩", desc: "Update your details, services and links." },
      { id: "konar-card", title: "Using Your KonarCard", icon: "📲", desc: "How taps work, sharing, and best practices." },
      { id: "branding", title: "Branding & Themes", icon: "🎨", desc: "Themes, colors, layout and customization." },
      { id: "troubleshooting", title: "Troubleshooting", icon: "🛠️", desc: "Common issues and quick fixes." },
    ],
    []
  );

  const openChat = () => {
    try {
      window.tidioChatApi?.open?.();
    } catch {
      // ignore
    }
  };

  const scrollTo = (id) => {
    const el = document.getElementById(`hc-${id}`);
    el?.scrollIntoView?.({ behavior: "smooth", block: "start" });
  };

  return (
    <DashboardLayout title="Help Centre" subtitle="Tutorials, guides, and support for your KonarCard." hideDesktopHeader>
      <div className="hc-shell">
        <PageHeader
          title="Help Centre"
          subtitle="Find quick answers, tutorials, and best practices."
          isMobile={isMobile}
          isSmallMobile={isSmallMobile}
          visitUrl={currentProfileUrl}
          rightSlot={
            <div className="hc-header-actions">
              <button type="button" className="kx-btn kx-btn--white" onClick={openChat}>
                Live chat
              </button>
              <Link to="/contact" className="kx-btn kx-btn--orange">
                Contact support
              </Link>
            </div>
          }
        />

        <div className="hc-grid">
          {/* LEFT: rail */}
          <aside className="hc-rail">
            <div className="hc-rail-card">
              <div className="hc-rail-head">
                <div>
                  <div className="hc-eyebrow">Browse</div>
                  <div className="hc-rail-title">Help topics</div>
                  <div className="hc-muted">Quick links to sections (more coming soon).</div>
                </div>
                <span className="hc-chip">BETA</span>
              </div>

              <div className="hc-rail-list">
                {sections.map((s) => (
                  <button key={s.id} type="button" className="hc-rail-item" onClick={() => scrollTo(s.id)}>
                    <span className="hc-rail-ico" aria-hidden="true">
                      {s.icon}
                    </span>
                    <div className="hc-rail-meta">
                      <div className="hc-rail-item-title">{s.title}</div>
                      <div className="hc-rail-item-sub">{s.desc}</div>
                    </div>
                    <span className="hc-rail-tag">Soon</span>
                  </button>
                ))}
              </div>

              <div className="hc-rail-divider" />

              <div className="hc-rail-cta">
                <div className="hc-callout">
                  Need help now? Use <button type="button" className="hc-linklike" onClick={openChat}>live chat</button> or contact support.
                </div>

                <div className="hc-rail-actions">
                  <button type="button" className="kx-btn kx-btn--white" onClick={openChat}>
                    Live chat
                  </button>
                  <Link to="/contact" className="kx-btn kx-btn--black">
                    Contact support
                  </Link>
                </div>
              </div>
            </div>
          </aside>

          {/* RIGHT: content */}
          <section className="hc-main">
            <div className="hc-list">
              {sections.map((s) => (
                <article key={s.id} id={`hc-${s.id}`} className="hc-card">
                  <div className="hc-card-top">
                    <div className="hc-card-titlewrap">
                      <div className="hc-card-emoji" aria-hidden="true">
                        {s.icon}
                      </div>
                      <div>
                        <h3 className="hc-card-title">{s.title}</h3>
                        <p className="hc-muted">{s.desc}</p>
                      </div>
                    </div>

                    <span className="hc-status">Under maintenance</span>
                  </div>

                  <div className="hc-card-body">
                    <div className="hc-kv">
                      <div className="hc-k">What’s happening</div>
                      <div className="hc-v">
                        This section is being improved. We’re polishing the tutorials for a smoother experience.
                      </div>
                    </div>

                    <div className="hc-kv">
                      <div className="hc-k">What you’ll get</div>
                      <div className="hc-v">
                        Short videos, step-by-step guides, best practices, and quick fixes you can follow on-site.
                      </div>
                    </div>

                    <div className="hc-kv">
                      <div className="hc-k">Need help now?</div>
                      <div className="hc-v">
                        Use <button type="button" className="hc-linklike" onClick={openChat}>live chat</button> or go to{" "}
                        <Link to="/contact" className="hc-inline-link">contact support</Link>.
                      </div>
                    </div>
                  </div>

                  <div className="hc-card-actions">
                    <button type="button" onClick={openChat} className="kx-btn kx-btn--white">
                      Live chat
                    </button>
                    <Link to="/contact" className="kx-btn kx-btn--orange">
                      Contact support
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
