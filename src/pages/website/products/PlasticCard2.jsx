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
            heroSubtext="A bold black NFC business card with QR backup — designed to feel premium and stand out instantly."
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