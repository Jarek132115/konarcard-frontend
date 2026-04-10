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
            heroSubtext="A clean white NFC business card with QR backup — designed to look premium and work instantly."
            badgeText="Most versatile"
            frontSrc={WhiteFrontImg}
            backSrc={WhiteBackImg}
            edgeColor="#ffffff"
            frontTextColor="#111111"
            variant="white"
            styleKey="white"
            frontTemplate="WhiteFront"
            backTemplate="WhiteBack"
        />
    );
}