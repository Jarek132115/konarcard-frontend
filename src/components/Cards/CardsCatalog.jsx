import React from "react";
import { CARDS_PRODUCT_CATALOG } from "./cardsConfig";

export default function CardsCatalog({ onChooseProduct }) {
    return (
        <section className="cp-card">
            <div className="cp-cardHead">
                <div>
                    <h2 className="cp-cardTitle">Choose your product</h2>
                    <p className="cp-muted">
                        Pick the NFC product you want to buy, then customise it before checkout.
                    </p>
                </div>
            </div>

            <div className="cp-catalogGrid">
                {CARDS_PRODUCT_CATALOG.map((item) => (
                    <article key={item.key} className="cp-catalogCard">
                        <div className="cp-catalogMedia">
                            <span className="cp-catalogTag">{item.tag}</span>

                            <img
                                src={item.image}
                                alt={item.imageAlt}
                                className="cp-catalogImg"
                                loading="lazy"
                                decoding="async"
                            />
                        </div>

                        <div className="cp-catalogBody">
                            <div className="cp-catalogTitle">{item.title}</div>
                            <div className="cp-catalogDesc">{item.desc}</div>
                            <div className="cp-catalogPrice">{item.priceText}</div>

                            <button
                                type="button"
                                className="kx-btn kx-btn--white cp-catalogBtn"
                                onClick={() => onChooseProduct(item.key)}
                            >
                                {item.cta}
                            </button>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}