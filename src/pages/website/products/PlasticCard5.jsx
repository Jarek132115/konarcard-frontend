import React from "react";
import PlasticCardPageBase from "./PlasticCardPageBase";

import MagentaFrontImg from "../../../assets/images/Products/MagentaFront.jpg";
import MagentaBackImg from "../../../assets/images/Products/MagentaBack.jpg";

export default function PlasticCard5() {
    return (
        <PlasticCardPageBase
            productKey="plastic-magenta"
            productName="KonarCard Magenta"
            crumbName="KonarCard – Magenta"
            heroSubtext="Tap this card to a customer's phone and your profile opens straight away. No app. No typing. QR code on the back for any phone that can't tap. £19.99 with free UK delivery."
            badgeText="Bold choice"
            frontSrc={MagentaFrontImg}
            backSrc={MagentaBackImg}
            edgeColor="#be185d"
            frontTextColor="#ffffff"
            variant="magenta"
            styleKey="magenta"
            frontTemplate="MagentaFront"
            backTemplate="MagentaBack"
            buyButtonText="Buy Magenta Card"
        />
    );
}