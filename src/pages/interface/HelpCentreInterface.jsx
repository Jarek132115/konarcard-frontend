import React, { useContext, useMemo, useState } from "react";
import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import PageHeader from "../../components/Dashboard/PageHeader";

import "../../styling/dashboard/helpcentreinterface.css";
import "../../styling/spacing.css";

import { AuthContext } from "../../components/AuthContext";
import { useFetchBusinessCard } from "../../hooks/useFetchBusinessCard";

import UpgradeToPlusImage from "../../assets/images/UpgradeToPlus.png";
import LiveChatIcon from "../../assets/icons/LiveChatIcon.svg";

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" className="hc4-play" aria-hidden="true">
      <path d="M8 6.5v11l9-5.5-9-5.5Z" fill="currentColor" />
    </svg>
  );
}

export default function HelpCentreInterface() {
  const { user } = useContext(AuthContext);
  useFetchBusinessCard(user?._id);

  const [activeVideo, setActiveVideo] = useState(null);

  const openChat = () => {
    try {
      window.tidioChatApi?.open?.();
    } catch { }
  };

  const videos = useMemo(() => [
    {
      id: "1",
      title: "Getting Started with Your Digital Business Card",
      desc: "Learn how to create your first profile, structure your information properly, and get your KonarCard ready to share with potential clients.",
      length: "86 sec",
    },
    {
      id: "2",
      title: "Editing and Optimising Your Profile for Conversions",
      desc: "Update your details, improve how your profile looks, and make sure customers instantly trust and understand your service.",
      length: "94 sec",
    },
    {
      id: "3",
      title: "Adding Photos That Actually Win You More Work",
      desc: "Upload strong, high-quality images that build trust, showcase your work clearly, and increase conversions.",
      length: "73 sec",
    },
    {
      id: "4",
      title: "Collecting Reviews to Build Social Proof",
      desc: "Learn how to gather customer reviews and display them effectively so new customers feel confident choosing you.",
      length: "102 sec",
    },
    {
      id: "5",
      title: "Sharing Your Profile the Right Way",
      desc: "Send your KonarCard link strategically so customers can quickly view, save, and contact you.",
      length: "68 sec",
    },
    {
      id: "6",
      title: "Using Your NFC Card in Real Situations",
      desc: "Understand how tap-to-share works and how customers interact with your card in real life.",
      length: "91 sec",
    },
    {
      id: "7",
      title: "Branding & Themes That Make You Look Professional",
      desc: "Keep your profile clean, consistent, and visually strong so it represents your business properly.",
      length: "88 sec",
    },
    {
      id: "8",
      title: "Understanding Your Analytics & Improving Results",
      desc: "Learn how to read your analytics and use the data to improve performance and get more leads.",
      length: "97 sec",
    },
  ], []);

  return (
    <DashboardLayout hideDesktopHeader>
      <div className="hc4-shell">

        <PageHeader
          title="Help Center"
          subtitle="Find quick answers, tutorials, and best practices."
        />

        {/* HERO */}
        <section className="hc4-hero">
          <div className="hc4-heroContent">
            <div className="hc4-kicker">Here is your guide</div>

            <h2 className="hc4-title">
              8 quick videos to help you set up, improve, and share your KonarCard
            </h2>

            <p className="hc4-sub">
              Work through the tutorials below to learn everything step by step.
              If you get stuck at any point, you can speak directly with our team.
            </p>
          </div>

          <div className="hc4-heroCta">
            <button className="hc4-liveBtn" onClick={openChat}>
              <img src={LiveChatIcon} alt="" />
              Start Live Chat
            </button>
          </div>
        </section>

        {/* GRID */}
        <section className="hc4-grid">
          {videos.map(v => (
            <div key={v.id} className="hc4-card">

              <div className="hc4-media">
                <img src={UpgradeToPlusImage} alt="" />
                <div className="hc4-playWrap">
                  <PlayIcon />
                </div>
              </div>

              <div className="hc4-body">
                <div className="hc4-badge">Tutorial</div>

                <h3 className="hc4-cardTitle">{v.title}</h3>

                <p className="hc4-cardDesc">{v.desc}</p>

                <div className="hc4-actions">
                  <span className="hc4-length">{v.length}</span>

                  <button className="hc4-watchBtn">
                    <PlayIcon />
                    Watch Video
                  </button>
                </div>
              </div>

            </div>
          ))}
        </section>

      </div>
    </DashboardLayout>
  );
}