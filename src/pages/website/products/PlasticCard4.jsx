import React from "react";
import PlasticCardPageBase from "./PlasticCardPageBase";

import GreenFrontImg from "../../../assets/images/Products/GreenFront.jpg";
import GreenBackImg from "../../../assets/images/Products/GreenBack.jpg";

export default function PlasticCard4() {
    return (
        <PlasticCardPageBase
            productKey="plastic-green"
            productName="KonarCard Green"
            crumbName="KonarCard – Green"
            heroSubtext="A modern green NFC business card with QR backup — designed to look sharp and work instantly."
            badgeText="Fresh"
            frontSrc={GreenFrontImg}
            backSrc={GreenBackImg}
            edgeColor="#29a63b"
            frontTextColor="#ffffff"
            variant="green"
            styleKey="green"
            frontTemplate="GreenFront"
            backTemplate="GreenBack"
        />
    );
}