import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "motion/react";

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

const PLACEHOLDER_VIDEO_URL = "https://www.w3schools.com/html/mov_bbb.mp4";

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
        fill="currentColor"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="hc5-modalCloseIcon" aria-hidden="true">
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

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="hc5-searchIcon" aria-hidden="true">
      <circle
        cx="11"
        cy="11"
        r="6.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M16 16l4 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" className="hc5-liveBtnIconSvg" aria-hidden="true">
      <path
        d="M6 7.5A3.5 3.5 0 0 1 9.5 4h5A3.5 3.5 0 0 1 18 7.5v4A3.5 3.5 0 0 1 14.5 15H11l-4 3v-3.4A3.48 3.48 0 0 1 6 11.5v-4Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function formatVideoLength(totalSeconds) {
  const seconds = Number(totalSeconds) || 0;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  if (mins <= 0) return `${secs} sec`;
  return `${mins} min ${secs} sec`;
}

function HelpCard({ video, onOpen, index }) {
  return (
    <motion.article
      className="hc5-card"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.34, ease: "easeOut", delay: 0.03 * index }}
    >
      <button
        type="button"
        className="hc5-cardMedia"
        onClick={() => onOpen(video)}
        aria-label={`Watch ${video.title}`}
      >
        <img
          src={video.thumbnail}
          alt=""
          aria-hidden="true"
          className="hc5-cardImg"
        />

        <div className="hc5-cardMediaOverlay" />

        <span className="hc5-cardPlay">
          <span className="hc5-cardPlayCircle">
            <PlayIcon className="hc5-cardPlayIcon" />
          </span>
        </span>

        <span className="hc5-cardDuration">{formatVideoLength(video.lengthSeconds)}</span>
      </button>

      <div className="hc5-cardBody">
        <div className="hc5-cardTop">
          <div className="hc5-cardPills">
            <span className="hc5-pill hc5-pill--soft">Tutorial</span>
            <span className="hc5-pill hc5-pill--neutral">{video.category}</span>
          </div>

          <h3 className="hc5-cardTitle">{video.title}</h3>
          <p className="hc5-cardDesc">{video.desc}</p>
        </div>

        <div className="hc5-cardBottom">
          <button
            type="button"
            className="hc5-watchBtn"
            onClick={() => onOpen(video)}
          >
            <PlayIcon className="hc5-watchBtnIcon" />
            <span>Watch video</span>
          </button>
        </div>
      </div>
    </motion.article>
  );
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

  const [search, setSearch] = useState("");

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
      toast("Live chat is not available right now.");
    }
  };

  const videos = useMemo(
    () => [
      {
        id: "1",
        category: "Setup",
        title: "Getting started with your digital business card",
        desc: "Create your first profile, organise your information properly, and get your KonarCard ready to share confidently.",
        lengthSeconds: 86,
        thumbnail: UpgradeToPlusImage,
        videoUrl: PLACEHOLDER_VIDEO_URL,
      },
      {
        id: "2",
        category: "Profile",
        title: "Editing and optimising your profile for more conversions",
        desc: "Improve your layout, content, and overall trust signals so customers instantly understand who you are and what you offer.",
        lengthSeconds: 94,
        thumbnail: UpgradeToPlusImage,
        videoUrl: PLACEHOLDER_VIDEO_URL,
      },
      {
        id: "3",
        category: "Photos",
        title: "Adding photos that actually help you win more work",
        desc: "Upload stronger images that build trust, show your work clearly, and make your profile feel more professional.",
        lengthSeconds: 73,
        thumbnail: UpgradeToPlusImage,
        videoUrl: PLACEHOLDER_VIDEO_URL,
      },
      {
        id: "4",
        category: "Reviews",
        title: "Collecting reviews to build stronger social proof",
        desc: "Learn how to gather customer reviews and display them in a way that helps future visitors trust you faster.",
        lengthSeconds: 102,
        thumbnail: UpgradeToPlusImage,
        videoUrl: PLACEHOLDER_VIDEO_URL,
      },
      {
        id: "5",
        category: "Sharing",
        title: "Sharing your profile the right way",
        desc: "Send your KonarCard link strategically so customers can instantly view your details, save your info, and contact you.",
        lengthSeconds: 68,
        thumbnail: UpgradeToPlusImage,
        videoUrl: PLACEHOLDER_VIDEO_URL,
      },
      {
        id: "6",
        category: "NFC",
        title: "Using your NFC card in real customer situations",
        desc: "See how tap-to-share works in practice and understand what customers experience when you hand over your card.",
        lengthSeconds: 91,
        thumbnail: UpgradeToPlusImage,
        videoUrl: PLACEHOLDER_VIDEO_URL,
      },
      {
        id: "7",
        category: "Branding",
        title: "Branding and themes that make you look more professional",
        desc: "Keep your profile clean, consistent, and visually strong so it represents your business properly every time.",
        lengthSeconds: 88,
        thumbnail: UpgradeToPlusImage,
        videoUrl: PLACEHOLDER_VIDEO_URL,
      },
      {
        id: "8",
        category: "Analytics",
        title: "Understanding your analytics and improving results",
        desc: "Read your analytics properly and use the data to improve profile performance, visibility, and lead generation.",
        lengthSeconds: 97,
        thumbnail: UpgradeToPlusImage,
        videoUrl: PLACEHOLDER_VIDEO_URL,
      },
    ],
    []
  );

  const filteredVideos = useMemo(() => {
    const q = safeLower(search);
    if (!q) return videos;

    return videos.filter((video) => {
      return (
        safeLower(video.title).includes(q) ||
        safeLower(video.desc).includes(q) ||
        safeLower(video.category).includes(q)
      );
    });
  }, [videos, search]);

  const quickStats = useMemo(() => {
    const totalVideos = videos.length;
    const totalMinutes = videos.reduce((sum, item) => sum + Number(item.lengthSeconds || 0), 0);
    const roundedMinutes = Math.max(1, Math.round(totalMinutes / 60));

    return {
      totalVideos,
      roundedMinutes,
    };
  }, [videos]);

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
      <div className="hc5-shell">
        <PageHeader
          title="Help Center"
          subtitle="Tutorials, walkthroughs, and practical best practices for getting the most from KonarCard."
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

        <motion.section
          className="hc5-heroCard"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.34, ease: "easeOut" }}
        >
          <div className="hc5-heroMain">
            <div className="hc5-heroPills">
              <span className="hc5-pill hc5-pill--accent">Help Center</span>
              <span className="hc5-pill hc5-pill--neutral">
                {quickStats.totalVideos} videos
              </span>
              <span className="hc5-pill hc5-pill--neutral">
                {quickStats.roundedMinutes} min total
              </span>
            </div>

            <h2 className="hc5-heroTitle">
              Learn how to set up, improve, and use your KonarCard like a pro
            </h2>

            <p className="hc5-heroText">
              Browse quick step-by-step tutorials covering profile setup, reviews,
              photos, branding, NFC usage, sharing, and analytics. Everything is designed
              to help you get value faster and look more professional.
            </p>

            <div className="hc5-heroToolbar">
              <label className="hc5-searchWrap" aria-label="Search help videos">
                <SearchIcon />
                <input
                  type="text"
                  className="hc5-searchInput"
                  placeholder="Search tutorials, topics, or keywords"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </label>
            </div>
          </div>

          <div className="hc5-heroAside">
            <div className="hc5-supportCard">
              <div className="hc5-supportIcon">
                <ChatIcon />
              </div>

              <div className="hc5-supportCopy">
                <h3>Need direct help?</h3>
                <p>
                  Chat with our team if you need support with your profile, NFC card,
                  orders, or setup.
                </p>
              </div>

              <button type="button" className="hc5-liveBtn" onClick={openChat}>
                <img src={LiveChatIcon} alt="" aria-hidden="true" />
                <span>Start live chat</span>
              </button>
            </div>
          </div>
        </motion.section>

        <section className="hc5-resultsBar" aria-label="Help results summary">
          <div className="hc5-resultsText">
            {filteredVideos.length === videos.length
              ? `Showing all ${videos.length} tutorials`
              : `Showing ${filteredVideos.length} result${filteredVideos.length === 1 ? "" : "s"}`}
          </div>
        </section>

        <section className="hc5-grid" aria-label="Help videos">
          {filteredVideos.length ? (
            filteredVideos.map((video, index) => (
              <HelpCard
                key={video.id}
                video={video}
                index={index}
                onOpen={handleOpenVideo}
              />
            ))
          ) : (
            <motion.div
              className="hc5-emptyState"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <div className="hc5-emptyStateInner">
                <h3>No tutorials found</h3>
                <p>Try a different keyword or clear your search to see all videos again.</p>
              </div>
            </motion.div>
          )}
        </section>

        <AnimatePresence>
          {activeVideo ? (
            <motion.div
              className="hc5-modalOverlay"
              onClick={handleCloseVideo}
              role="presentation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <motion.div
                className="hc5-modal"
                role="dialog"
                aria-modal="true"
                aria-label={activeVideo.title}
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, y: 18, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.985 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
              >
                <button
                  type="button"
                  className="hc5-modalClose"
                  onClick={handleCloseVideo}
                  aria-label="Close video"
                >
                  <CloseIcon />
                </button>

                <div className="hc5-modalPlayer">
                  <video
                    ref={videoRef}
                    className="hc5-video"
                    src={activeVideo.videoUrl || PLACEHOLDER_VIDEO_URL}
                    poster={activeVideo.thumbnail}
                    controls
                    autoPlay
                    playsInline
                    preload="metadata"
                  />
                </div>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}