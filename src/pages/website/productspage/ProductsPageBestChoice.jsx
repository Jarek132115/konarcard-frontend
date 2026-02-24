// frontend/src/pages/website/productspage/ProductsPageBestChoice.jsx
import React, { useMemo } from "react";

import "../../../styling/fonts.css";
import "../../../styling/productspage/productspagebestchoice.css";

/* Images */
import PlasticCardImg from "../../../assets/images/PlasticCard.jpg";
import MetalCardImg from "../../../assets/images/MetalCard.jpg";
import KonarTagImg from "../../../assets/images/KonarTag.jpg";

export default function ProductsPageBestChoice() {
    const cards = useMemo(
        () => [
            {
                title: "Plastic KonarCard",
                desc: "Pop it in your wallet like a normal card and you’ll always have your digital business card ready to tap and share.",
                img: PlasticCardImg,
                alt: "Plastic KonarCard product image",
            },
            {
                title: "Metal KonarCard",
                desc: "A stronger, heavier NFC business card that lives in your wallet but makes a bigger first impression.",
                img: MetalCardImg,
                alt: "Metal KonarCard product image",
            },
            {
                title: "KonarTag",
                desc: "Clip it onto your keys and share your digital business card anywhere - if you’ve got your keys, you’ve got your details.",
                img: KonarTagImg,
                alt: "KonarTag product image",
            },
        ],
        []
    );

    return (
        <section className="kbc" aria-label="Choose the right NFC business card">
            <div className="kbc__inner">
                <header className="kbc__head">
                    <p className="kc-pill kbc__kicker">Best Choice</p>

                    <h2 className="h3 kbc__title">
                        Choose the <span className="kbc__accent">Right</span> NFC Business Card for{" "}
                        <span className="kbc__accent">Your Work</span>
                    </h2>

                    <p className="kc-subheading kbc__sub">
                        Compare plastic, metal, and key tag NFC business cards - all linked to the same digital profile.
                    </p>
                </header>

                <div className="kbc__grid" role="list" aria-label="KonarCard options">
                    {cards.map((c) => (
                        <article key={c.title} className="kbc__card" role="listitem">
                            <div className="kbc__copy">
                                <h3 className="kc-title kbc__cardTitle">{c.title}</h3>
                                <p className="body kbc__cardDesc">{c.desc}</p>
                            </div>

                            <div className="kbc__imgWrap" aria-hidden="true">
                                <img className="kbc__img" src={c.img} alt={c.alt} loading="lazy" decoding="async" />
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}