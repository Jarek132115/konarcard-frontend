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
            heroSubtext="Tap this card to a customer's phone and your profile opens straight away. No app. No typing. QR code on the back for any phone that can't tap. £19.99 with free UK delivery."
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