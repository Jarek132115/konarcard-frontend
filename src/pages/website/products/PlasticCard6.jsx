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
            heroSubtext="A vibrant orange NFC business card with QR backup — built to grab attention instantly."
            badgeText="High visibility"
            frontSrc={OrangeFrontImg}
            backSrc={OrangeBackImg}
            edgeColor="#ea580c"
            frontTextColor="#ffffff"
            variant="orange"
            styleKey="orange"
            frontTemplate="OrangeFront"
            backTemplate="OrangeBack"
            buyButtonText="Buy Orange Card"
        />
    );
}