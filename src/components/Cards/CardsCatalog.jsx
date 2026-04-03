import React from "react";
import { CARDS_PRODUCT_CATALOG } from "./cardsConfig";
import ProductCardPreview3D from "./ProductCardPreview3D";

export default function CardsCatalog({ onChooseProduct, hasPurchasedCards = false }) {
    return (
        <section className="cp-card cp-card--catalog">
            <div className="cp-cardHead cp-cardHead--intro">
                <div>
                    <div className="cp-eyebrow">{hasPurchasedCards ? "Buy more cards" : "Buy a card"}</div>
                    <h2 className="cp-cardTitle">
                        {hasPurchasedCards ? "Get another product" : "Get your first product"}
                    </h2>
                    <p className="cp-muted">
                        {hasPurchasedCards
                            ? "Order more NFC products for your business and customise each one before checkout."
                            : "Choose your first NFC product, customise it, and check out in seconds."}
                    </p>
                </div>
            </div>

            <div className="cp-catalogGrid">
                {CARDS_PRODUCT_CATALOG.map((item) => (
                    <article key={item.key} className="cp-catalogCard">
                        <div className="cp-catalogMedia">
                            <span className="cp-catalogTag">{item.tag}</span>

                            <div className="cp-catalogPreview3D">
                                <ProductCardPreview3D productKey={item.key} />
                            </div>
                        </div>

                        <div className="cp-catalogBody">
                            <div className="cp-catalogTextGroup">
                                <h3 className="cp-catalogTitle">{item.title}</h3>
                                <p className="cp-catalogDesc">{item.desc}</p>
                            </div>

                            <div className="cp-catalogFoot">
                                <div className="cp-catalogPrice">{item.priceText}</div>

                                <button
                                    type="button"
                                    className="kx-btn kx-btn--black cp-catalogBtn"
                                    onClick={() => onChooseProduct(item.key)}
                                >
                                    {item.cta}
                                </button>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}