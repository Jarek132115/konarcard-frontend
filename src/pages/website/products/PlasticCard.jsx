import React from "react";
import PlasticCardPageBase from "./PlasticCardPageBase";

import WhiteFrontImg from "../../../assets/images/Products/WhiteFront.jpg";
import WhiteBackImg from "../../../assets/images/Products/WhiteBack.jpg";

export default function PlasticCard() {
    return (
        <PlasticCardPageBase
            productKey="plastic-white"
            productName="KonarCard White"
            crumbName="KonarCard – White"
            heroSubtext="Tap this card to a customer's phone and your profile opens straight away. No app. No typing. QR code on the back for any phone that can't tap. £19.99 with free UK delivery."
            badgeText="Most versatile"
            frontSrc={WhiteFrontImg}
            backSrc={WhiteBackImg}
            edgeColor="#ffffff"
            frontTextColor="#111111"
            variant="white"
            styleKey="white"
            frontTemplate="WhiteFront"
            backTemplate="WhiteBack"
            buyButtonText="Buy White Card"
        />
    );
}