// src/pages/interface/HelpCentreInterface.jsx
import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import PageHeader from "../../components/Dashboard/PageHeader";
import "../../styling/dashboard/helpcentreinetrface.css";

import { AuthContext } from "../../components/AuthContext";
import { useFetchBusinessCard } from "../../hooks/useFetchBusinessCard";
import { useContext } from "react";

const safeLower = (v) => String(v || "").toLowerCase();

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
      { id: "getting-started", title: "Getting Started", icon: "🚀" },
      { id: "profile", title: "Create & Edit Your Profile", icon: "🧩" },
      { id: "konar-card", title: "Using Your Konar Card", icon: "📲" },
      { id: "branding", title: "Branding & Themes", icon: "🎨" },
      { id: "troubleshooting", title: "Troubleshooting", icon: "🛠️" },
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

  return (
    <DashboardLayout
      title="Help Centre"
      subtitle="Tutorials, guides, and support for your KonarCard."
      hideDesktopHeader
    >
      <div className="help-shell">
        <PageHeader
          title="Help Centre"
          subtitle="Find quick answers, tutorials, and best practices."
          isMobile={isMobile}
          isSmallMobile={isSmallMobile}
          visitUrl={currentProfileUrl}
          rightSlot={
            <div className="help-header-actions">
              <button type="button" className="help-btn help-btn-ghost" onClick={openChat}>
                Live chat
              </button>
              <Link to="/contact" className="help-btn help-btn-primary">
                Contact support
              </Link>
            </div>
          }
        />

        <div className="help-grid">
          {/* LEFT: navigation / quick actions */}
          <aside className="help-card help-rail">
            <div className="help-card-head">
              <div>
                <h2 className="help-card-title">Browse</h2>
                <p className="help-muted">Tutorial sections (more coming soon).</p>
              </div>

              <span className="help-pill">STATUS: BETA</span>
            </div>

            <div className="help-rail-list">
              {sections.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className="help-rail-item"
                  onClick={() => {
                    const el = document.getElementById(`hc-${s.id}`);
                    el?.scrollIntoView?.({ behavior: "smooth", block: "start" });
                  }}
                >
                  <span className="help-rail-ico" aria-hidden="true">
                    {s.icon}
                  </span>
                  <div className="help-rail-meta">
                    <div className="help-rail-title">{s.title}</div>
                    <div className="help-rail-sub">Under maintenance</div>
                  </div>
                </button>
              ))}
            </div>

            <div className="help-rail-cta">
              <div className="help-alert neutral">
                Need help now? Use{" "}
                <button type="button" className="help-linklike" onClick={openChat}>
                  live chat
                </button>{" "}
                or contact support.
              </div>

              <div className="help-rail-actions">
                <button type="button" className="help-btn help-btn-ghost" onClick={openChat}>
                  Live chat
                </button>
                <Link to="/contact" className="help-btn help-btn-primary">
                  Contact support
                </Link>
              </div>
            </div>
          </aside>

          {/* RIGHT: content cards */}
          <section className="help-right">
            <div className="help-list">
              {sections.map((s) => (
                <article key={s.id} id={`hc-${s.id}`} className="help-card help-item">
                  <div className="help-item-top">
                    <div className="help-item-titlewrap">
                      <div className="help-item-emoji" aria-hidden="true">
                        {s.icon}
                      </div>
                      <div>
                        <h3 className="help-item-title">{s.title}</h3>
                        <p className="help-muted">Short videos and step-by-step tutorials.</p>
                      </div>
                    </div>

                    <span className="help-badge maintenance">Under maintenance</span>
                  </div>

                  <div className="help-item-body">
                    <div className="help-kv">
                      <div className="help-k">What’s happening</div>
                      <div className="help-v">
                        This section is being improved. We’re polishing the tutorials for a smoother experience.
                      </div>
                    </div>

                    <div className="help-kv">
                      <div className="help-k">What you’ll get</div>
                      <div className="help-v">
                        Short videos, best practices, and quick fixes you can follow on-site.
                      </div>
                    </div>

                    <div className="help-kv">
                      <div className="help-k">Need help now?</div>
                      <div className="help-v">
                        Use{" "}
                        <button type="button" className="help-linklike" onClick={openChat}>
                          live chat
                        </button>{" "}
                        or go to{" "}
                        <Link to="/contact" className="help-inline-link">
                          contact support
                        </Link>
                        .
                      </div>
                    </div>
                  </div>

                  <div className="help-item-actions">
                    <button type="button" onClick={openChat} className="help-btn help-btn-ghost">
                      Live chat
                    </button>
                    <Link to="/contact" className="help-btn help-btn-primary">
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
