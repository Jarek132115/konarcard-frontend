import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import Sidebar from '../../components/Sidebar';
import PageHeader from '../../components/PageHeader';
import LogoIcon from '../../assets/icons/Logo-Icon.svg';

export default function HelpCentreInterface() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1000);
  const [isSmallMobile, setIsSmallMobile] = useState(window.innerWidth <= 600);

  useEffect(() => {
    const handleResize = () => {
      const m = window.innerWidth <= 1000;
      const sm = window.innerWidth <= 600;
      setIsMobile(m);
      setIsSmallMobile(sm);
      if (!m && sidebarOpen) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);

  useEffect(() => {
    if (sidebarOpen && isMobile) document.body.classList.add('body-no-scroll');
    else document.body.classList.remove('body-no-scroll');
  }, [sidebarOpen, isMobile]);

  const sections = [
    { id: 'getting-started', title: 'Getting Started' },
    { id: 'profile', title: 'Create & Edit Your Profile' },
    { id: 'konar-card', title: 'Using Your Konar Card' },
    { id: 'branding', title: 'Branding & Themes' },
    { id: 'troubleshooting', title: 'Troubleshooting' },
  ];

  return (
    <div className={`app-layout ${sidebarOpen ? 'sidebar-active' : ''}`}>
      {/* Mobile header */}
      <div className="myprofile-mobile-header">
        <Link to="/myprofile" className="myprofile-logo-link">
          <img src={LogoIcon} alt="Logo" className="myprofile-logo" />
        </Link>
        <div
          className={`sidebar-menu-toggle ${sidebarOpen ? 'active' : ''}`}
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <span></span><span></span><span></span>
        </div>
      </div>

      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      {sidebarOpen && isMobile && (
        <div className="sidebar-overlay active" onClick={() => setSidebarOpen(false)} />
      )}

      <main className="main-content-container">
        <PageHeader
          title="Help Centre"
          isMobile={isMobile}
          isSmallMobile={isSmallMobile}
        />

        {/* Cards list (same shell as My Orders) */}
        <section className="help-container">
          <div className="help-list">
            {sections.map((s) => (
              <article key={s.id} className="help-card">
                <div className="help-status-badge status-maintenance">Under maintenance</div>

                <div className="help-thumb" aria-hidden="true">
                  {/* Simple placeholder mark */}
                  <div className="help-thumb-mark">🎬</div>
                </div>

                <div className="help-details">
                  <header className="help-meta">
                    <span className="type">{s.title}</span>
                    <span aria-hidden="true">•</span>
                    <span className="status">Temporarily unavailable</span>
                  </header>

                  <div className="help-fields">
                    <div className="help-kv">
                      <div className="kv-label">What’s happening</div>
                      <div className="kv-value">
                        Sorry — this section is under maintenance. We’re polishing the
                        tutorials for a smoother experience.
                      </div>
                    </div>

                    <div className="help-kv">
                      <div className="kv-label">What you’ll get</div>
                      <div className="kv-value">
                        Short videos with step-by-step guidance, tips, and best practices.
                      </div>
                    </div>

                    <div className="help-kv">
                      <div className="kv-label">Need help now?</div>
                      <div className="kv-value">
                        Try the Help Centre or{" "}
                        <button
                          type="button"
                          className="link-like"
                          onClick={() => window.tidioChatApi?.open?.()}
                        >
                          start a live chat
                        </button>.
                      </div>
                    </div>
                  </div>

                  <div className="help-actions">
                    <button
                      type="button"
                      onClick={() => window.tidioChatApi?.open?.()}
                      className="cta-black-button desktop-button"
                    >
                      Live chat
                    </button>
                    <Link to="/contact" className="cta-blue-button desktop-button">
                      Contact support
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
