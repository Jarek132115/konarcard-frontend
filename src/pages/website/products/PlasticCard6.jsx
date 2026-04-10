import React from "react";
import PlasticCardPageBase from "./PlasticCardPageBase";

import OrangeFrontImg from "../../../assets/images/Products/OrangeFront.jpg";
import OrangeBackImg from "../../../assets/images/Products/OrangeBack.jpg";

export default function PlasticCard6() {
    return (
        <PlasticCardPageBase
            productKey="plastic-orange"
            productName="KonarCard Orange"
            crumbName="KonarCard – Orange"
            heroSubtext="A high-impact orange NFC business card with QR backup — designed to feel confident and stand out instantly."
            badgeText="Warm"
            frontSrc={OrangeFrontImg}
            backSrc={OrangeBackImg}
            edgeColor="#ff8a00"
            frontTextColor="#ffffff"
            variant="orange"
            styleKey="orange"
            frontTemplate="OrangeFront"
            backTemplate="OrangeBack"
        />
    );
}