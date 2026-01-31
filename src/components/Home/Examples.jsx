import React from "react";
import { Link } from "react-router-dom";
import "../../styling/home/examples.css";

/*
  HOME — Examples section
  Matches screenshot:
  - Title + subtitle centered
  - 4 cards with image area and text
  - 2 CTA buttons centered (primary orange + ghost)
  - Images are placeholders: swap to your real assets anytime
*/

export default function Examples() {
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
        {
            title: "Electrician — James",
            desc: "Uses KonarCard to share contact details instantly after jobs and quotes.",
            image: null,
        },
    ];

    return (
        <section className="kc-examples section" aria-label="Real examples">
            <div className="kc-examples__inner">
                <div className="kc-examples__header">
                    <h2 className="kc-examples__title desktop-h2 text-center">See How Other Tradies Use KonarCard</h2>
                    <p className="kc-examples__sub desktop-body-s text-center">
                        Real profiles. Real cards. Real examples of how KonarCard helps win more work.
                    </p>
                </div>

                <div className="kc-examples__grid">
                    {items.map((it, i) => (
                        <article className="kc-examples__card" key={i}>
                            <div className="kc-examples__media">
                                {it.image ? (
                                    <img src={it.image} alt={it.title} loading="lazy" />
                                ) : (
                                    <div className="kc-examples__placeholder" aria-hidden="true">
                                        <div className="kc-examples__phone" />
                                        <div className="kc-examples__cardMock" />
                                    </div>
                                )}
                            </div>

                            <div className="kc-examples__body">
                                <h3 className="kc-examples__name">{it.title}</h3>
                                <p className="kc-examples__desc">{it.desc}</p>
                            </div>
                        </article>
                    ))}
                </div>

                <div className="kc-examples__ctaRow">
                    <Link to="/examples" className="kc-examples__btn kc-examples__btn--primary">
                        See More Real Examples
                    </Link>
                    <Link to="/register" className="kc-examples__btn kc-examples__btn--ghost">
                        Create Your Own Profile
                    </Link>
                </div>
            </div>
        </section>
    );
}
