import React from "react";
import PlasticCardPageBase from "./PlasticCardPageBase";

import BlackFrontImg from "../../../assets/images/Products/BlackFront.jpg";
import BlackBackImg from "../../../assets/images/Products/BlackBack.jpg";

export default function PlasticCard2() {
    return (
        <PlasticCardPageBase
            productKey="plastic-black"
            productName="KonarCard Black"
            crumbName="KonarCard – Black"
            heroSubtext="Tap this card to a customer's phone and your profile opens straight away. No app. No typing. QR code on the back for any phone that can't tap. £19.99 with free UK delivery."
            badgeText="Popular"
            frontSrc={BlackFrontImg}
            backSrc={BlackBackImg}
            edgeColor="#171717"
            frontTextColor="#ffffff"
            variant="black"
            styleKey="black"
            frontTemplate="BlackFront"
            backTemplate="BlackBack"
            buyButtonText="Buy Black Card"
        />
    );
}