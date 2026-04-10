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
            heroSubtext="A bold magenta NFC business card with QR backup — designed to stand out instantly and feel premium."
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