import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import PageHeader from "../../components/Dashboard/PageHeader";
import "../../styling/dashboard/helpcentreinterface.css";

import { AuthContext } from "../../components/AuthContext";
import { useFetchBusinessCard } from "../../hooks/useFetchBusinessCard";

import UpgradeToPlusImage from "../../assets/images/UpgradeToPlus.png";
import LiveChatIcon from "../../assets/icons/LiveChatIcon.svg";

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" className="hc4-watchBtnIcon" aria-hidden="true">
      <path
        d="M8 6.5v11l9-5.5-9-5.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="hc4-modalCloseIcon" aria-hidden="true">
      <path
        d="M6 6l12 12M18 6L6 18"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function HelpCentreInterface() {
  const { user: authUser } = useContext(AuthContext);
  const userId = authUser?._id;

  useFetchBusinessCard(userId);

  const [activeVideo, setActiveVideo] = useState(null);
  const videoRef = useRef(null);

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
        thumbnail: UpgradeToPlusImage,
        videoUrl: "",
      },
      {
        id: "v2",
        title: "Edit Your Profile",
        desc: "Update your details, services, and contact info.",
        length: "94 second video",
        thumbnail: UpgradeToPlusImage,
        videoUrl: "",
      },
      {
        id: "v3",
        title: "Add Photos",
        desc: "Upload clean images that build trust and showcase your work.",
        length: "73 second video",
        thumbnail: UpgradeToPlusImage,
        videoUrl: "",
      },
      {
        id: "v4",
        title: "Collect Reviews",
        desc: "Display customer reviews to help win more work.",
        length: "102 second video",
        thumbnail: UpgradeToPlusImage,
        videoUrl: "",
      },
      {
        id: "v5",
        title: "Share Your Link",
        desc: "Send your profile fast and make it easy for customers to save.",
        length: "68 second video",
        thumbnail: UpgradeToPlusImage,
        videoUrl: "",
      },
      {
        id: "v6",
        title: "Use Your KonarCard",
        desc: "Understand tap-to-share and how customers view your profile.",
        length: "91 second video",
        thumbnail: UpgradeToPlusImage,
        videoUrl: "",
      },
      {
        id: "v7",
        title: "Branding & Themes",
        desc: "Keep your profile looking clean, clear, and consistent.",
        length: "88 second video",
        thumbnail: UpgradeToPlusImage,
        videoUrl: "",
      },
      {
        id: "v8",
        title: "Analytics Basics",
        desc: "See what’s working and improve your results over time.",
        length: "97 second video",
        thumbnail: UpgradeToPlusImage,
        videoUrl: "",
      },
    ],
    []
  );

  const handleOpenVideo = (video) => {
    setActiveVideo(video);
  };

  const handleCloseVideo = () => {
    if (videoRef.current) {
      try {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      } catch {
        // ignore
      }
    }

    setActiveVideo(null);
  };

  useEffect(() => {
    if (!activeVideo) return undefined;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        handleCloseVideo();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [activeVideo]);

  useEffect(() => {
    if (!activeVideo?.videoUrl || !videoRef.current) return;

    const player = videoRef.current;

    const tryPlay = async () => {
      try {
        await player.play();
      } catch {
        // autoplay can fail depending on browser rules
      }
    };

    tryPlay();
  }, [activeVideo]);

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
              <img
                src={LiveChatIcon}
                alt=""
                aria-hidden="true"
                className="hc4-supportIconImg"
              />
            </div>

            <div className="hc4-supportCopy">
              <h2 className="hc4-supportTitle">We’re here to help</h2>
              <p className="hc4-supportText">
                Live chat is the quickest way to get support. Watch quick tutorials
                below or chat with us if you need a hand.
              </p>
            </div>
          </div>

          <button type="button" className="hc4-liveBtn" onClick={openChat}>
            <img
              src={LiveChatIcon}
              alt=""
              aria-hidden="true"
              className="hc4-liveBtnIcon"
            />
            <span>Start Live Chat</span>
          </button>
        </section>

        <section className="hc4-introCard">
          <div className="hc4-introCopy">
            <div className="hc4-kicker">Video Help Library</div>
            <h2 className="hc4-introTitle">
              Learn the essentials of building and sharing your KonarCard profile
            </h2>
            <p className="hc4-introText">
              These walkthroughs are designed to help users set up their profile
              faster, improve trust, and understand how to get more value from the
              platform.
            </p>
          </div>

          <div className="hc4-introMeta">
            <div className="hc4-introStat">
              <span className="hc4-introStatValue">{videos.length}</span>
              <span className="hc4-introStatLabel">Guides</span>
            </div>
          </div>
        </section>

        <section className="hc4-grid" aria-label="Help videos">
          {videos.map((video) => (
            <article key={video.id} className="hc4-card">
              <button
                type="button"
                className="hc4-cardMedia hc4-cardMediaBtn"
                onClick={() => handleOpenVideo(video)}
                aria-label={`Watch ${video.title}`}
              >
                <img
                  src={video.thumbnail}
                  alt=""
                  aria-hidden="true"
                  className="hc4-cardImg"
                />

                <span className="hc4-mediaOverlay" aria-hidden="true">
                  <span className="hc4-mediaPlay">
                    <PlayIcon />
                  </span>
                </span>
              </button>

              <div className="hc4-cardBody">
                <div className="hc4-cardTop">
                  <div className="hc4-cardBadge">Tutorial</div>
                  <h3 className="hc4-cardTitle">{video.title}</h3>
                  <p className="hc4-cardDesc">{video.desc}</p>
                </div>

                <div className="hc4-cardActions">
                  <div className="hc4-cardLength">{video.length}</div>

                  <button
                    type="button"
                    className="hc4-watchBtn"
                    onClick={() => handleOpenVideo(video)}
                  >
                    <PlayIcon />
                    <span>Watch Video</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>

        {activeVideo ? (
          <div
            className="hc4-modalOverlay"
            onClick={handleCloseVideo}
            role="presentation"
          >
            <div
              className="hc4-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="hc4-video-title"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="hc4-modalHead">
                <div className="hc4-modalHeadCopy">
                  <div className="hc4-modalEyebrow">Help Video</div>
                  <h3 id="hc4-video-title" className="hc4-modalTitle">
                    {activeVideo.title}
                  </h3>
                  <p className="hc4-modalText">{activeVideo.desc}</p>
                </div>

                <button
                  type="button"
                  className="hc4-modalClose"
                  onClick={handleCloseVideo}
                  aria-label="Close video"
                >
                  <CloseIcon />
                </button>
              </div>

              <div className="hc4-modalPlayer">
                {activeVideo.videoUrl ? (
                  <video
                    ref={videoRef}
                    className="hc4-video"
                    src={activeVideo.videoUrl}
                    poster={activeVideo.thumbnail}
                    controls
                    autoPlay
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  <div className="hc4-videoPlaceholder">
                    <img
                      src={activeVideo.thumbnail}
                      alt=""
                      aria-hidden="true"
                      className="hc4-videoPlaceholderImg"
                    />

                    <div className="hc4-videoPlaceholderOverlay">
                      <div className="hc4-videoPlaceholderBadge">
                        Video coming soon
                      </div>
                      <h4 className="hc4-videoPlaceholderTitle">
                        {activeVideo.title}
                      </h4>
                      <p className="hc4-videoPlaceholderText">
                        This tutorial popup is now fully wired up. As soon as
                        you add a real video file URL to this card, it will
                        autoplay here with stop, skip, and close controls.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="hc4-modalFoot">
                <div className="hc4-modalHint">
                  {activeVideo.videoUrl
                    ? "Use the player controls to pause, skip, or replay."
                    : "Add a real video URL later and this player will work automatically."}
                </div>

                <button
                  type="button"
                  className="hc4-modalDoneBtn"
                  onClick={handleCloseVideo}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  );
}