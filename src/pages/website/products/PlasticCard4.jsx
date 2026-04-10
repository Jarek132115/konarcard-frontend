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
            heroSubtext="A strong green NFC business card with QR backup — built to look professional and stand out in person."
            badgeText="Bold choice"
            frontSrc={GreenFrontImg}
            backSrc={GreenBackImg}
            edgeColor="#166534"
            frontTextColor="#ffffff"
            variant="green"
            styleKey="green"
            frontTemplate="GreenFront"
            backTemplate="GreenBack"
            buyButtonText="Buy Green Card"
        />
    );
}