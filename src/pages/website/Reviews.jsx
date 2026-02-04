// frontend/src/pages/website/Reviews.jsx
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
  // value: 1..5 (supports halves: 4.5)
  const pct = Math.max(0, Math.min(5, value)) / 5;

  return (
    <div className="kc-rev__stars" aria-label={`${value} out of 5 stars`}>
      {/* base (empty stars) */}
      <div className="kc-rev__starsBase" aria-hidden="true">
        {"★★★★★"}
      </div>
      {/* fill overlay */}
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
        tags: ["Verified purchase", "NFC card"],
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
        tags: ["Verified purchase"],
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
        tags: ["Team use"],
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
        tags: ["Profile edit"],
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
        tags: ["Live chat help"],
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
        tags: ["Verified purchase"],
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
        tags: ["Gallery"],
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
        tags: ["QR backup"],
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
        tags: ["Easy setup"],
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
        tags: ["Map + services"],
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
        tags: ["Quote form"],
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
        tags: ["On-site"],
        text:
          "Looks professional when I’m on site.\nOne tap and the client has my details + portfolio.\n(Edited after 2 weeks)",
      },
    ],
    []
  );

  return (
    <>
      <Navbar />

      <main className="kc-rev kc-page">
        {/* HERO */}
        <section className="kc-rev__hero">
          <div className="kc-rev__heroInner">
            <h1 className="h2 kc-rev__title">
              The <span className="kc-rev__accent">#1 Tool</span> Tradies Are Talking About
            </h1>
            <p className="body-s kc-rev__subtitle">
              Don’t take our word for it — see why tradespeople are switching to smarter, faster profiles.
            </p>

            {/* Summary bar */}
            <div className="kc-rev__summary" role="region" aria-label="Review summary">
              <div className="kc-rev__summaryLeft">
                <p className="kc-rev__score">
                  <span className="kc-rev__scoreNum">4.8</span>
                  <span className="kc-rev__scoreOut">/5</span>
                </p>
                <Stars value={4.8} />
                <p className="body-xs kc-rev__count">Based on recent customer feedback</p>
              </div>

              <div className="kc-rev__summaryRight">
                <div className="kc-rev__pill">Verified purchases</div>
                <div className="kc-rev__pill">Real trades</div>
                <div className="kc-rev__pill">UK customers</div>
              </div>
            </div>
          </div>
        </section>

        {/* GRID */}
        <section className="kc-rev__gridSection" aria-label="Customer reviews">
          <div className="kc-rev__grid">
            {reviews.map((r) => (
              <article className="kc-rev__card" key={r.id}>
                <header className="kc-rev__cardTop">
                  <div className="kc-rev__person">
                    <img className="kc-rev__avatar" src={r.avatar} alt={`${r.name} avatar`} />
                    <div className="kc-rev__personMeta">
                      <p className="kc-rev__nameLine">
                        <span className="kc-rev__name">{r.name}</span>
                        <span className="kc-rev__dotSep" aria-hidden="true">
                          •
                        </span>
                        <span className="kc-rev__trade">{r.trade}</span>
                      </p>
                      <p className="body-xs kc-rev__subLine">
                        {r.location} <span className="kc-rev__dotSep">•</span> {r.date}
                      </p>
                    </div>
                  </div>

                  <div className="kc-rev__rating">
                    <Stars value={r.rating} />
                    <span className="body-xs kc-rev__ratingText">{r.rating.toFixed(1)}</span>
                  </div>
                </header>

                <div className="kc-rev__tags">
                  {r.tags.map((t) => (
                    <span key={t} className="kc-rev__tag">
                      {t}
                    </span>
                  ))}
                </div>

                <p className="body-s kc-rev__text">
                  {r.text.split("\n").map((line, idx) => (
                    <React.Fragment key={idx}>
                      {line}
                      {idx !== r.text.split("\n").length - 1 ? <br /> : null}
                    </React.Fragment>
                  ))}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="kc-rev__cta">
          <div className="kc-rev__ctaInner">
            <h2 className="h3 kc-rev__ctaTitle">Ready to look more professional?</h2>
            <p className="body-s kc-rev__ctaSub">
              Claim your KonarCard link, build your profile, and start sharing instantly.
            </p>
            <a className="kc-rev__ctaBtn" href="/claimyourlink">
              Claim your link
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
