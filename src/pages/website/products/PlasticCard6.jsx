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
            heroSubtext="Tap this card to a customer's phone and your profile opens straight away. No app. No typing. QR code on the back for any phone that can't tap. £19.99 with free UK delivery."
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