import React, { useMemo } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

/* Global typography/tokens */
import "../../styling/fonts.css";

/* Page CSS */
import "../../styling/reviews.css";

/* Avatars */
import pp1 from "../../assets/images/pp1.png";
import pp2 from "../../assets/images/pp2.png";
import pp3 from "../../assets/images/pp3.png";
import pp4 from "../../assets/images/pp4.png";
import pp5 from "../../assets/images/pp5.png";
import pp6 from "../../assets/images/pp6.png";
import pp7 from "../../assets/images/pp7.png";
import pp8 from "../../assets/images/pp8.png";
import pp9 from "../../assets/images/pp9.png";
import pp10 from "../../assets/images/pp10.png";
import pp11 from "../../assets/images/pp11.png";
import pp12 from "../../assets/images/pp12.png";

function Stars({ value = 5 }) {
  const pct = Math.max(0, Math.min(5, value)) / 5;

  return (
    <div className="kc-rev__stars" aria-label={`${value} out of 5 stars`}>
      <div className="kc-rev__starsBase" aria-hidden="true">
        {"★★★★★"}
      </div>
      <div
        className="kc-rev__starsFill"
        style={{ width: `${pct * 100}%` }}
        aria-hidden="true"
      >
        {"★★★★★"}
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="kc-rev__stat">
      <p className="kc-rev__statValue">{value}</p>
      <p className="body-xs kc-rev__statLabel">{label}</p>
    </div>
  );
}

export default function Reviews() {
  const reviews = useMemo(
    () => [
      {
        id: "r1",
        avatar: pp1,
        trade: "Plumber",
        name: "Mark B",
        location: "Manchester",
        rating: 5,
        date: "2 days ago",
        plan: "Plus plan",
        products: ["KonarCard"],
        text:
          "Since using KonarCard I’m actually getting replies.\nClients say it looks slick and I’m getting referrals.",
      },
      {
        id: "r2",
        avatar: pp2,
        trade: "Electrician",
        name: "Jake C",
        location: "Leeds",
        rating: 4.5,
        date: "1 week ago",
        plan: "Free plan",
        products: ["KonarCard"],
        text:
          "Saved me a fortune on printing.\nTap the card and customers have everything in seconds.",
      },
      {
        id: "r3",
        avatar: pp3,
        trade: "Builder",
        name: "Tom G",
        location: "Birmingham",
        rating: 5,
        date: "3 weeks ago",
        plan: "Teams plan",
        products: ["KonarCard"],
        text:
          "Gives me a proper online presence without a pricey website.\nPhotos and reviews do the selling.",
      },
      {
        id: "r4",
        avatar: pp4,
        trade: "Roofer",
        name: "Sam H",
        location: "Sheffield",
        rating: 4,
        date: "1 month ago",
        plan: "Plus plan",
        products: [],
        text:
          "I update prices and services on my phone. No reprinting, no fuss.\nMore enquiries coming in.",
      },
      {
        id: "r5",
        avatar: pp5,
        trade: "Decorator",
        name: "Steve L",
        location: "Liverpool",
        rating: 5,
        date: "5 days ago",
        plan: "Plus plan",
        products: ["KonarCard"],
        text:
          "Looks professional on mobile.\nClients can call, WhatsApp or request a quote right away.",
      },
      {
        id: "r6",
        avatar: pp6,
        trade: "Joiner",
        name: "Matt D",
        location: "Glasgow",
        rating: 5,
        date: "2 months ago",
        plan: "Plus plan",
        products: ["KonarCard"],
        text:
          "Before this I relied on word of mouth.\nNow people find me online and book.\nWorth every penny.",
      },
      {
        id: "r7",
        avatar: pp7,
        trade: "Tiler",
        name: "Chris S",
        location: "Nottingham",
        rating: 4.5,
        date: "2 weeks ago",
        plan: "Free plan",
        products: [],
        text:
          "Cheaper than keeping a website going.\nThe gallery shows my best work and wins trust.",
      },
      {
        id: "r8",
        avatar: pp8,
        trade: "Heating Engineer",
        name: "Alex M",
        location: "Newcastle",
        rating: 5,
        date: "6 days ago",
        plan: "Plus plan",
        products: ["KonarCard"],
        text:
          "Tap, scan or share the link — it just works.\nBooking more local jobs than ever.",
      },
      {
        id: "r9",
        avatar: pp9,
        trade: "Handyman",
        name: "Dan R",
        location: "Bristol",
        rating: 5,
        date: "3 months ago",
        plan: "Free plan",
        products: [],
        text:
          "Not techy at all and still set it up in minutes.\nTidy, modern and saves me on marketing.",
      },
      {
        id: "r10",
        avatar: pp10,
        trade: "Gardener",
        name: "Ben K",
        location: "Cardiff",
        rating: 4,
        date: "4 weeks ago",
        plan: "Plus plan",
        products: [],
        text:
          "Clients love the map and service list.\nStopped reprinting cards — this pays for itself.",
      },
      {
        id: "r11",
        avatar: pp11,
        trade: "Bricklayer",
        name: "John P",
        location: "London",
        rating: 5,
        date: "8 days ago",
        plan: "Plus plan",
        products: [],
        text:
          "All my links in one place — quote form, photos, socials.\nHelped me close jobs faster.",
      },
      {
        id: "r12",
        avatar: pp12,
        trade: "Plasterer",
        name: "Lewis J",
        location: "Belfast",
        rating: 4.5,
        date: "2 months ago",
        plan: "Plus plan",
        products: ["KonarCard"],
        text:
          "Looks professional when I’m on site.\nOne tap and the client has my details + portfolio.\n(Edited after 2 weeks)",
      },
    ],
    []
  );

  const summary = useMemo(() => {
    const avg = 4.8;
    const total = reviews.length;
    return {
      avg,
      total,
      stats: [
        { label: "Average rating", value: `${avg} / 5` },
        { label: "Total reviews", value: `${total}` },
      ],
    };
  }, [reviews.length]);

  return (
    <>
      <Navbar />

      <main className="kc-rev kc-page">
        {/* HERO */}
        <section className="kc-rev__hero" aria-label="Reviews hero">
          <div className="kc-rev__container">
            {/* grid backdrop wrapper (slightly larger than cards + oval fade) */}
            <div className="kc-rev__heroGridWrap">
              <div className="kc-rev__heroGrid">
                <div className="kc-rev__heroCopy">
                  <p className="label kc-rev__kicker">Customer reviews</p>

                  <h1 className="h2 kc-rev__title">
                    Tradespeople use KonarCard to look more professional — fast.
                  </h1>

                  <p className="body kc-rev__subtitle">
                    Clear profiles, easy sharing, and a better first impression. Here’s what
                    customers are saying after switching.
                  </p>

                  <div className="kc-rev__trustRow" aria-label="Average rating">
                    <div className="kc-rev__trustScore">
                      <span className="kc-rev__trustNum">{summary.avg}</span>
                      <span className="body-xs kc-rev__trustOut">/5</span>
                    </div>

                    <Stars value={summary.avg} />

                    <span className="body-xs kc-rev__trustNote">
                      Based on {summary.total} reviews
                    </span>
                  </div>

                  <div className="kc-rev__chips" aria-label="Highlights">
                    <span className="pill">Verified purchases</span>
                    <span className="pill">Real trades</span>
                    <span className="pill">UK customers</span>
                  </div>
                </div>

                <aside className="kc-rev__summary" aria-label="Review summary">
                  <div className="kc-rev__summaryTop">
                    <p className="h6 kc-rev__summaryTitle">Summary</p>
                    <p className="body-xs kc-rev__summaryDesc">
                      Short, honest feedback from people using KonarCard day-to-day.
                    </p>
                  </div>

                  <div className="kc-rev__stats" role="list">
                    {summary.stats.map((s) => (
                      <div key={s.label} role="listitem">
                        <Stat label={s.label} value={s.value} />
                      </div>
                    ))}
                  </div>

                  <a className="kc-rev__summaryBtn button-text" href="/claimyourlink">
                    Claim your link
                  </a>

                  <p className="body-xs kc-rev__summaryHint">Set up in minutes. Update anytime.</p>
                </aside>
              </div>
            </div>
          </div>
        </section>

        {/* LIST */}
        <section className="kc-rev__list" aria-label="Customer reviews">
          <div className="kc-rev__container">
            <div className="kc-rev__grid">
              {reviews.map((r) => {
                const oneParagraph = r.text.replace(/\s*\n\s*/g, " ").trim();

                return (
                  <article className="kc-rev__card" key={r.id}>
                    <header className="kc-rev__cardHeader">
                      <div className="kc-rev__person">
                        <img className="kc-rev__avatar" src={r.avatar} alt={`${r.name} avatar`} />

                        <div className="kc-rev__personMeta">
                          <p className="kc-rev__nameLine">
                            <span className="kc-rev__name">{r.name}</span>
                            <span className="kc-rev__sep" aria-hidden="true">
                              •
                            </span>
                            <span className="kc-rev__trade" title={r.trade}>
                              {r.trade}
                            </span>
                          </p>

                          <p className="body-xs kc-rev__metaLine">
                            {r.location}
                            <span className="kc-rev__sep" aria-hidden="true">
                              •
                            </span>
                            {r.date}
                          </p>
                        </div>
                      </div>

                      <div className="kc-rev__rating">
                        <Stars value={r.rating} />
                        <span className="body-xs kc-rev__ratingText">{r.rating.toFixed(1)}</span>
                      </div>
                    </header>

                    {/* plan + product pills (grey style) */}
                    <div className="kc-rev__tags" aria-label="Tags">
                      {r.plan ? (
                        <span className="pill kc-rev__pill kc-rev__pill--plan">{r.plan}</span>
                      ) : null}

                      {r.products?.map((p) => (
                        <span key={p} className="pill kc-rev__pill kc-rev__pill--product">
                          {p}
                        </span>
                      ))}
                    </div>

                    <p className="body-s kc-rev__text">“{oneParagraph}”</p>
                  </article>
                );
              })}
            </div>

            {/* CTA (like FAQ page style) */}
            <div className="kc-rev__cta">
              <p className="body-s kc-rev__ctaText">Share your personal experience with KonarCard.</p>
              <button type="button" className="kx-btn kx-btn--black kc-rev__ctaBtn">
                Add your own review
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
