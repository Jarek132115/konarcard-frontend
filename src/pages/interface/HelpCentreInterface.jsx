import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";

import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import PageHeader from "../../components/Dashboard/PageHeader";
import ShareProfile from "../../components/ShareProfile";

import "../../styling/spacing.css";
import "../../styling/dashboard/helpcentreinterface.css";

import { AuthContext } from "../../components/AuthContext";
import { useFetchBusinessCard } from "../../hooks/useFetchBusinessCard";
import { useAuthUser } from "../../hooks/useAuthUser";
import { useMyProfiles } from "../../hooks/useBusinessCard";

import UpgradeToPlusImage from "../../assets/images/UpgradeToPlus.png";
import LiveChatIcon from "../../assets/icons/LiveChatIcon.svg";

const centerTrim = (v) => (v ?? "").toString().trim();
const safeLower = (v) => centerTrim(v).toLowerCase();

const normalizeSlug = (raw) =>
  safeLower(raw)
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const buildPublicUrl = (profileSlug) => {
  const s = normalizeSlug(profileSlug);
  if (!s) return `${window.location.origin}/u/`;
  return `${window.location.origin}/u/${encodeURIComponent(s)}`;
};

function PlayIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
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

function formatVideoLength(totalSeconds) {
  const seconds = Number(totalSeconds) || 0;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  if (mins <= 0) {
    return `${secs} sec`;
  }

  return `${mins} min ${secs} sec`;
}

export default function HelpCentreInterface() {
  const { user } = useContext(AuthContext);
  useFetchBusinessCard(user?._id);

  const { data: authUser } = useAuthUser();
  const { data: cards } = useMyProfiles();

  const [activeVideo, setActiveVideo] = useState(null);
  const videoRef = useRef(null);

  const [shareOpen, setShareOpen] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState(null);

  const profilesForShare = useMemo(() => {
    const xs = Array.isArray(cards) ? cards : [];

    return xs
      .map((c) => {
        const slug = centerTrim(c?.profile_slug);
        if (!slug) return null;

        const name =
          centerTrim(c?.business_card_name) ||
          centerTrim(c?.business_name) ||
          centerTrim(c?.full_name) ||
          (slug === "main" ? "Main Profile" : "Profile");

        return {
          slug,
          name,
          url: buildPublicUrl(slug),
        };
      })
      .filter(Boolean);
  }, [cards]);

  useEffect(() => {
    if (!profilesForShare.length) {
      setSelectedSlug(null);
      return;
    }

    setSelectedSlug((prev) => prev || profilesForShare[0].slug);
  }, [profilesForShare]);

  const selectedProfile = useMemo(() => {
    if (!profilesForShare.length) return null;
    return profilesForShare.find((p) => p.slug === selectedSlug) || profilesForShare[0];
  }, [profilesForShare, selectedSlug]);

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
        id: "1",
        title: "Getting Started with Your Digital Business Card",
        desc: "Learn how to create your first profile, organise your key information properly, and get your KonarCard ready to share with potential clients.",
        lengthSeconds: 86,
        thumbnail: UpgradeToPlusImage,
        videoUrl: "",
      },
      {
        id: "2",
        title: "Editing and Optimising Your Profile for More Conversions",
        desc: "Update your details, improve how your profile looks, and make sure customers instantly understand your service and trust your business.",
        lengthSeconds: 94,
        thumbnail: UpgradeToPlusImage,
        videoUrl: "",
      },
      {
        id: "3",
        title: "Adding Photos That Actually Help You Win More Work",
        desc: "Upload strong, high-quality images that build trust, showcase your work clearly, and help customers feel confident choosing you.",
        lengthSeconds: 73,
        thumbnail: UpgradeToPlusImage,
        videoUrl: "",
      },
      {
        id: "4",
        title: "Collecting Reviews to Build Stronger Social Proof",
        desc: "Learn how to gather customer reviews and display them effectively so new visitors quickly see that other people trust your work.",
        lengthSeconds: 102,
        thumbnail: UpgradeToPlusImage,
        videoUrl: "",
      },
      {
        id: "5",
        title: "Sharing Your Profile the Right Way",
        desc: "Send your KonarCard link strategically so customers can quickly view your details, save your information, and contact you without friction.",
        lengthSeconds: 68,
        thumbnail: UpgradeToPlusImage,
        videoUrl: "",
      },
      {
        id: "6",
        title: "Using Your NFC Card in Real Customer Situations",
        desc: "Understand how tap-to-share works in practice and how customers interact with your card in real life when you hand it over or tap it.",
        lengthSeconds: 91,
        thumbnail: UpgradeToPlusImage,
        videoUrl: "",
      },
      {
        id: "7",
        title: "Branding and Themes That Make You Look More Professional",
        desc: "Keep your profile clean, consistent, and visually strong so it represents your business properly and leaves a better first impression.",
        lengthSeconds: 88,
        thumbnail: UpgradeToPlusImage,
        videoUrl: "",
      },
      {
        id: "8",
        title: "Understanding Your Analytics and Improving Results",
        desc: "Learn how to read your analytics properly and use the data to improve profile performance, visibility, and lead generation over time.",
        lengthSeconds: 97,
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
        // ignore autoplay failures
      }
    };

    tryPlay();
  }, [activeVideo]);

  const handleOpenShareProfile = () => {
    if (!selectedProfile) {
      toast.error("Create a profile first.");
      return;
    }
    setShareOpen(true);
  };

  const handleCloseShareProfile = () => {
    setShareOpen(false);
  };

  const shareToFacebook = () => {
    if (!selectedProfile?.url) {
      toast.error("No profile link available yet.");
      return;
    }

    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      selectedProfile.url
    )}`;

    window.open(url, "_blank", "noopener,noreferrer,width=680,height=720");
  };

  const shareToInstagram = async () => {
    if (!selectedProfile?.url) {
      toast.error("No profile link available yet.");
      return;
    }

    try {
      await navigator.clipboard.writeText(selectedProfile.url);
      toast.success("Profile link copied for Instagram sharing.");
    } catch {
      toast.error("Could not copy the link.");
    }

    window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
  };

  const shareToMessenger = async () => {
    if (!selectedProfile?.url) {
      toast.error("No profile link available yet.");
      return;
    }

    const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(
      navigator.userAgent || ""
    );

    if (isMobile) {
      try {
        await navigator.clipboard.writeText(selectedProfile.url);
        toast.success(
          "Messenger sharing is not supported on mobile browsers. Link copied instead."
        );
      } catch {
        toast.error("Could not copy the link.");
      }
      return;
    }

    const url = `https://www.facebook.com/dialog/send?link=${encodeURIComponent(
      selectedProfile.url
    )}&app_id=291494419107518&redirect_uri=${encodeURIComponent(selectedProfile.url)}`;

    window.open(url, "_blank", "noopener,noreferrer,width=680,height=720");
  };

  const shareToWhatsApp = () => {
    if (!selectedProfile?.url) {
      toast.error("No profile link available yet.");
      return;
    }

    const text = `Check out my profile: ${selectedProfile.url}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const shareByText = () => {
    if (!selectedProfile?.url) {
      toast.error("No profile link available yet.");
      return;
    }

    const body = `Check out my profile: ${selectedProfile.url}`;
    window.location.href = `sms:?&body=${encodeURIComponent(body)}`;
  };

  const handleAppleWallet = () => {
    toast("Apple Wallet is coming soon.");
  };

  const handleGoogleWallet = () => {
    toast("Google Wallet is coming soon.");
  };

  return (
    <DashboardLayout hideDesktopHeader>
      <div className="hc4-shell">
        <PageHeader
          title="Help Center"
          subtitle="Find quick answers, tutorials, and best practices."
          onShareClick={handleOpenShareProfile}
          shareDisabled={!selectedProfile}
        />

        <ShareProfile
          isOpen={shareOpen}
          onClose={handleCloseShareProfile}
          profiles={profilesForShare}
          selectedSlug={selectedSlug}
          onSelectSlug={setSelectedSlug}
          username={authUser?.name || "konarcard"}
          profileUrl={selectedProfile?.url || ""}
          onFacebook={shareToFacebook}
          onInstagram={shareToInstagram}
          onMessenger={shareToMessenger}
          onWhatsApp={shareToWhatsApp}
          onText={shareByText}
          onAppleWallet={handleAppleWallet}
          onGoogleWallet={handleGoogleWallet}
        />

        <section className="hc4-heroCard">
          <div className="hc4-heroMain">
            <div className="hc4-heroEyebrow">Here is your guide</div>

            <h2 className="hc4-heroTitle">
              8 quick videos to help you set up, improve, and share your KonarCard
            </h2>

            <p className="hc4-heroText">
              Work through the tutorials below to learn everything step by step. If
              you get stuck at any point and need help from someone on our team, live
              chat with us now.
            </p>
          </div>

          <div className="hc4-heroActions">
            <button type="button" className="hc4-liveBtn" onClick={openChat}>
              <img src={LiveChatIcon} alt="" aria-hidden="true" />
              <span>Start Live Chat</span>
            </button>
          </div>
        </section>

        <section className="hc4-grid" aria-label="Help videos">
          {videos.map((video) => {
            return (
              <article key={video.id} className="hc4-card">
                <button
                  type="button"
                  className="hc4-cardMedia"
                  onClick={() => handleOpenVideo(video)}
                  aria-label={`Watch ${video.title}`}
                >
                  <img
                    src={video.thumbnail}
                    alt=""
                    aria-hidden="true"
                    className="hc4-cardImg"
                  />
                  <span className="hc4-cardPlay">
                    <span className="hc4-cardPlayCircle">
                      <PlayIcon className="hc4-cardPlayIcon" />
                    </span>
                  </span>
                </button>

                <div className="hc4-cardBody">
                  <div className="hc4-cardTop">
                    <div className="hc4-cardTag">Tutorial</div>
                    <h3 className="hc4-cardTitle">{video.title}</h3>
                    <p className="hc4-cardDesc">{video.desc}</p>
                  </div>

                  <div className="hc4-cardBottom">
                    <div className="hc4-cardLength">
                      {formatVideoLength(video.lengthSeconds)}
                    </div>

                    <button
                      type="button"
                      className="hc4-watchBtn"
                      onClick={() => handleOpenVideo(video)}
                    >
                      <PlayIcon className="hc4-watchBtnIcon" />
                      <span>Watch Video</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
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
                        This popup is fully wired up and ready. Once you add
                        a real video file URL to this tutorial, it will play
                        here automatically with full video controls.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="hc4-modalFoot">
                <div className="hc4-modalHint">
                  {activeVideo.videoUrl
                    ? "Use the player controls to pause, skip, replay, or go fullscreen."
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