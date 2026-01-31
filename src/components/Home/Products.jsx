import React from "react";
import { Link } from "react-router-dom";
import "../../styling/home/products.css";

/*
  Products section (Home)
  - Matches screenshot: header + sub, 3 product cards, best value pill on first
  - Uses existing typography classes from fonts.css where possible
  - Images are intentionally placeholders — swap src to your real assets if needed
*/

export default function Products() {
    const products = [
        {
            tag: "Best Value",
            name: "KonarCard - Plastic Edition",
            desc: "Durable, lightweight NFC business card for everyday use.",
            price: "£29.99",
            // Replace with your real asset if you have it:
            // image: PlasticCardImg,
            image: null,
        },
        {
            tag: null,
            name: "KonarCard - Metal Edition",
            desc: "Premium metal NFC card designed to make a strong first impression.",
            price: "£44.99",
            image: null,
        },
        {
            tag: null,
            name: "KonarTag",
            desc: "Compact NFC key tag that shares your profile with a tap.",
            price: "£9.99",
            image: null,
        },
    ];

    return (
        <section className="kc-products section" aria-label="Products">
            <div className="kc-products__inner">
                <div className="kc-products__header">
                    <h2 className="kc-products__title desktop-h2 text-center">
                        Business Cards That Share Your Profile Instantly
                    </h2>
                    <p className="kc-products__sub desktop-body-s text-center">
                        The KonarCard is an NFC business card that opens your digital profile with a tap. It’s
                        <br />
                        the easiest way to share your details in person — without paper cards.
                    </p>
                </div>

                <div className="kc-products__grid">
                    {products.map((p, i) => (
                        <article key={i} className="kc-products__card">
                            <div className="kc-products__media">
                                {p.tag && <div className="kc-products__pill">{p.tag}</div>}

                                {/* If you have real images, swap this placeholder */}
                                {p.image ? (
                                    <img src={p.image} alt={p.name} loading="lazy" />
                                ) : (
                                    <div className="kc-products__placeholder" aria-hidden="true">
                                        <div className="kc-products__placeholderMark">K</div>
                                    </div>
                                )}
                            </div>

                            <div className="kc-products__body">
                                <h3 className="kc-products__name">{p.name}</h3>
                                <p className="kc-products__desc">{p.desc}</p>
                                <div className="kc-products__price">{p.price}</div>
                            </div>
                        </article>
                    ))}
                </div>

                <p className="kc-products__note">
                    Your KonarCard works with your digital profile. The card is a one-time purchase. Profiles are free to start.
                </p>

                <div className="kc-products__ctaRow">
                    <Link to="/products" className="kc-products__btn kc-products__btn--primary">
                        Shop Business Cards
                    </Link>

                    <Link to="/how-it-works" className="kc-products__btn kc-products__btn--ghost">
                        See How The Cards Work
                    </Link>
                </div>
            </div>
        </section>
    );
}
