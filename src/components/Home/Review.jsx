import React from "react";
import "../../styling/home/review.css";

/*
  HOME — REVIEW SECTION (final section)
  Matches screenshot:
  - Title + subtitle
  - 3 large cards with image area + copy
  - Placeholder artwork for the phone + card (swap to real image if you want)
*/

export default function Review() {
    const items = [
        {
            title: "Electrician — James",
            desc: "Uses KonarCard to share contact details instantly after jobs and quotes.",
            image: null,
        },
        {
            title: "Electrician — James",
            desc: "Uses KonarCard to share contact details instantly after jobs and quotes.",
            image: null,
        },
        {
            title: "Electrician — James",
            desc: "Uses KonarCard to share contact details instantly after jobs and quotes.",
            image: null,
        },
    ];

    return (
        <section className="kc-review section" aria-label="Reviews">
            <div className="kc-review__inner">
                <div className="kc-review__header">
                    <h2 className="kc-review__title desktop-h2 text-center">Why Trades Choose KonarCard</h2>
                    <p className="kc-review__sub desktop-body-s text-center">
                        Real trades sharing how KonarCard helps them win more work.
                    </p>
                </div>

                <div className="kc-review__grid">
                    {items.map((it, i) => (
                        <article className="kc-review__card" key={i}>
                            <div className="kc-review__media">
                                {it.image ? (
                                    <img src={it.image} alt={it.title} loading="lazy" />
                                ) : (
                                    <div className="kc-review__placeholder" aria-hidden="true">
                                        <div className="kc-review__phone" />
                                        <div className="kc-review__cardMock" />
                                    </div>
                                )}
                            </div>

                            <div className="kc-review__body">
                                <h3 className="kc-review__name">{it.title}</h3>
                                <p className="kc-review__desc">{it.desc}</p>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
