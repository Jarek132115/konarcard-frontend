import React, { useEffect, useMemo, useRef, useState } from "react";
import NotificationIcon from "../../assets/icons/Notification.svg";
import SharePageIcon from "../../assets/icons/SharePage.svg";
import "../../styling/dashboard/pageheader.css";
import { useAuthUser } from "../../hooks/useAuthUser";

function cleanString(v) {
  return String(v || "").trim();
}

function cleanLower(v) {
  return cleanString(v).toLowerCase();
}

function getPlanLabel(user) {
  const rawPlan =
    cleanString(user?.plan) ||
    cleanString(user?.subscriptionPlan) ||
    cleanString(user?.subscription_plan) ||
    cleanString(user?.membershipPlan) ||
    cleanString(user?.membership_plan) ||
    cleanString(user?.stripePlan) ||
    cleanString(user?.stripe_plan) ||
    cleanString(user?.accountType) ||
    cleanString(user?.account_type);

  const plan = cleanLower(rawPlan);

  if (!plan) return "Free";

  if (
    plan === "team" ||
    plan === "teams" ||
    plan === "team plan" ||
    plan === "teams plan"
  ) {
    return "Teams";
  }

  if (plan === "plus" || plan === "plus plan") {
    return "Plus";
  }

  if (plan === "pro" || plan === "professional") {
    return "Pro";
  }

  if (plan === "free" || plan === "starter" || plan === "basic") {
    return "Free";
  }

  return rawPlan.charAt(0).toUpperCase() + rawPlan.slice(1);
}

function formatTimeAgo(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);

  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export default function PageHeader({
  title,
  subtitle,
  notifications = [],
  rightSlot = null,
  onShareClick,
  shareDisabled = false,
  shareAriaLabel = "Share profile",
}) {
  const { data: authUser } = useAuthUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const planLabel = useMemo(() => getPlanLabel(authUser), [authUser]);
  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const unreadCount = safeNotifications.length;

  useEffect(() => {
    if (!menuOpen) return;

    function handleClickOutside(event) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  const shouldUseCustomRightSlot = rightSlot !== null && rightSlot !== undefined;

  return (
    <header className="ph4">
      <div className="ph4-left">
        {title ? <h1 className="ph4-title h3">{title}</h1> : null}
        {subtitle ? <p className="ph4-sub kc-subheading">{subtitle}</p> : null}
      </div>

      <div className="ph4-right">
        {shouldUseCustomRightSlot ? (
          rightSlot
        ) : (
          <>
            <div className="ph4-pill">
              <span>Plan:</span>
              <strong>{planLabel}</strong>
            </div>

            <div className="ph4-dd" ref={menuRef}>
              <button
                type="button"
                className="ph4-iconBtn"
                aria-label="Notifications"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((prev) => !prev)}
              >
                <img
                  src={NotificationIcon}
                  alt=""
                  className="ph4-iconImg"
                  aria-hidden="true"
                />
                {unreadCount > 0 ? <span className="ph4-dot" /> : null}
              </button>

              {menuOpen ? (
                <div className="ph4-menu" role="menu" aria-label="Notifications menu">
                  <div className="ph4-menuHead">Notifications</div>

                  {safeNotifications.length > 0 ? (
                    <div className="ph4-menuList">
                      {safeNotifications.map((item, index) => (
                        <div
                          key={item?.id || item?._id || `notification-${index}`}
                          className="ph4-item"
                        >
                          <div className="ph4-itemTitle">
                            {cleanString(item?.title) ||
                              cleanString(item?.message) ||
                              "New notification"}
                          </div>
                          <div className="ph4-itemTime">
                            {formatTimeAgo(
                              item?.createdAt ||
                              item?.date ||
                              item?.timestamp
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="ph4-empty">No notifications yet.</div>
                  )}
                </div>
              ) : null}
            </div>

            <button
              type="button"
              className="ph4-avatarBtn"
              aria-label={shareAriaLabel}
              onClick={onShareClick}
              disabled={shareDisabled}
              title={shareDisabled ? "Create a profile first" : "Share profile"}
            >
              <span className="ph4-avatar">
                <img
                  src={SharePageIcon}
                  alt=""
                  className="ph4-avatarIcon"
                  aria-hidden="true"
                />
              </span>
            </button>
          </>
        )}
      </div>
    </header>
  );
}