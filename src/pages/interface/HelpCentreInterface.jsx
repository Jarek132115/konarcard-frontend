import React, { useContext, useMemo } from "react";
import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import PageHeader from "../../components/Dashboard/PageHeader";
import "../../styling/dashboard/helpcentreinterface.css";

import { AuthContext } from "../../components/AuthContext";
import { useFetchBusinessCard } from "../../hooks/useFetchBusinessCard";

import UpgradeToPlusImage from "../../assets/images/UpgradeToPlus.png";

export default function HelpCentreInterface() {
  const { user: authUser } = useContext(AuthContext);

  const userId = authUser?._id;

  useFetchBusinessCard(userId);

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
        title: "Getting Started",
        desc: "Set up your first profile and share it.",
        length: "86 second video",
      },
      {
        id: "v2",
        title: "Edit Your Profile",
        desc: "Update your details, services, and contact info.",
        length: "94 second video",
      },
      {
        id: "v3",
        title: "Add Photos",
        desc: "Upload clean images that build trust and showcase your work.",
        length: "73 second video",
      },
      {
        id: "v4",
        title: "Collect Reviews",
        desc: "Display customer reviews to help win more work.",
        length: "102 second video",
      },
      {
        id: "v5",
        title: "Share Your Link",
        desc: "Send your profile fast and make it easy for customers to save.",
        length: "68 second video",
      },
      {
        id: "v6",
        title: "Use Your KonarCard",
        desc: "Understand tap-to-share and how customers view your profile.",
        length: "91 second video",
      },
      {
        id: "v7",
        title: "Branding & Themes",
        desc: "Keep your profile looking clean, clear, and consistent.",
        length: "88 second video",
      },
      {
        id: "v8",
        title: "Analytics Basics",
        desc: "See what’s working and improve your results over time.",
        length: "97 second video",
      },
    ],
    []
  );

  return (
    <DashboardLayout title={null} subtitle={null} hideDesktopHeader>
      <div className="hc4-shell">
        <PageHeader
          title="Help Center"
          subtitle="Find quick answers, tutorials, and best practices."
          rightSlot={null}
        />

        <section className="hc4-supportBanner">
          <div className="hc4-supportLeft">
            <div className="hc4-supportIcon" aria-hidden="true">
              <svg viewBox="0 0 24 24" className="hc4-supportIconSvg">
                <path
                  d="M7 17l-4 4V6a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H7Zm10-3h1a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3h-1"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div className="hc4-supportCopy">
              <h2 className="hc4-supportTitle">We’re here to help</h2>
              <p className="hc4-supportText">
                Live chat is the quickest way to get support. Email is available anytime.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="hc4-liveBtn"
            onClick={openChat}
          >
            Start Live Chat
          </button>
        </section>

        <section className="hc4-grid" aria-label="Help videos">
          {videos.map((video) => (
            <article key={video.id} className="hc4-card">
              <div className="hc4-cardMedia">
                <img
                  src={UpgradeToPlusImage}
                  alt=""
                  aria-hidden="true"
                  className="hc4-cardImg"
                />
              </div>

              <div className="hc4-cardBody">
                <div className="hc4-cardText">
                  <h3 className="hc4-cardTitle">{video.title}</h3>
                  <p className="hc4-cardDesc">{video.desc}</p>
                  <div className="hc4-cardLength">{video.length}</div>
                </div>

                <button
                  type="button"
                  className="hc4-watchBtn"
                  onClick={() => { }}
                >
                  <svg viewBox="0 0 24 24" className="hc4-watchBtnIcon" aria-hidden="true">
                    <path
                      d="M8 6.5v11l9-5.5-9-5.5Z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>Watch Video</span>
                </button>
              </div>
            </article>
          ))}
        </section>
      </div>
    </DashboardLayout>
  );
}