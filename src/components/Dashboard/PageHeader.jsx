import React, { useMemo } from "react";
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

export default function PageHeader({
  title,
  subtitle,
  rightSlot = null,
  onShareClick,
  shareDisabled = false,
  shareAriaLabel = "Share profile",
}) {
  const { data: authUser } = useAuthUser();
  const planLabel = useMemo(() => getPlanLabel(authUser), [authUser]);

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

            <button
              type="button"
              className="ph4-shareBtn"
              aria-label={shareAriaLabel}
              onClick={onShareClick}
              disabled={shareDisabled}
              title={shareDisabled ? "Create a profile first" : "Share profile"}
            >
              <span className="ph4-shareBtnInner">
                <img
                  src={SharePageIcon}
                  alt=""
                  className="ph4-shareIcon"
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