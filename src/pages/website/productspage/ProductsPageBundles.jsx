// frontend/src/pages/website/productspage/ProductsPageBundles.jsx
import React from "react";
import { Link } from "react-router-dom";

import "../../../styling/fonts.css";
import "../../../styling/productspage/productspagebundles.css";

export default function ProductsPageBundles({ bundles = [] }) {
    return (
        <section className="kpb" aria-labelledby="kpb-title">
            <div className="kpb__container">
                <header className="kpb__head">
                    <p className="kc-pill kpb__pill">Bundles & Subscription Packages</p>

                    <h2 id="kpb-title" className="h3 kpb__title">
                        NFC Business Card <span className="kpb__accent">Bundles</span> That{" "}
                        <span className="kpb__accent">Save</span> You More
                    </h2>

                    <p className="kc-subheading kpb__sub">
                        Get your NFC card, key tag, and 12-month Plus subscription in one complete package.
                    </p>
                </header>

                <div className="kpb__list" role="list" aria-label="KonarCard bundles">
                    {bundles.map((b) => (
                        <article key={b.sku} className="kpb-card" role="listitem">
                            {/* LEFT */}
                            <div className="kpb-left">
                                <span className="kpb-tag" aria-label={b.tag}>
                                    {b.tag}
                                </span>

                                <h3 className="kc-title kpb-name">{b.name}</h3>
                                <p className="body kpb-desc">{b.desc}</p>

                                <div className="kpb-includeBlock" aria-label="What's included">
                                    <div className="kpb-includeTitle">What’s Included</div>

                                    <ul className="kpb-list">
                                        {b.includes?.map((line) => (
                                            <li key={line} className="body kpb-li">
                                                {line}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="kpb-priceRow" aria-label="Bundle price">
                                    <span className="kpb-price">{b.price}</span>
                                    {b.was ? <span className="kpb-was">{b.was}</span> : null}
                                    {b.save ? <span className="kpb-save">{b.save}</span> : null}
                                </div>

                                <Link to={b.to} className="kx-btn kx-btn--white kpb-btn" aria-label={`View ${b.name}`}>
                                    {b.cta}
                                </Link>
                            </div>

                            {/* RIGHT */}
                            <div className="kpb-right" aria-label="Bundle items">
                                <div className="kpb-items">
                                    <div className="kpb-item">
                                        <div className="kpb-itemThumb">
                                            <img src={b.imgCard} alt={b.altCard} loading="lazy" decoding="async" />
                                        </div>
                                    </div>

                                    <div className="kpb-plus" aria-hidden="true">
                                        +
                                    </div>

                                    <div className="kpb-item">
                                        <div className="kpb-itemThumb">
                                            <img src={b.imgTag} alt={b.altTag} loading="lazy" decoding="async" />
                                        </div>
                                    </div>

                                    <div className="kpb-plus" aria-hidden="true">
                                        +
                                    </div>

                                    <div className="kpb-item">
                                        <div className="kpb-subBox" aria-label="12 Month Subscription Included">
                                            <div className="kpb-subPill">12 Month Subscription</div>
                                            <div className="kpb-subTitle">Plus Plan</div>
                                            <div className="body kpb-subDesc">Everything You Need</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}