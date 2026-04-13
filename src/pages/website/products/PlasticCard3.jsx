import React from "react";
import PlasticCardPageBase from "./PlasticCardPageBase";

import BlueFrontImg from "../../../assets/images/Products/BlueFront.jpg";
import BlueBackImg from "../../../assets/images/Products/BlueBack.jpg";

export default function PlasticCard3() {
    return (
        <PlasticCardPageBase
            productKey="plastic-blue"
            productName="KonarCard Blue"
            crumbName="KonarCard – Blue"
            heroSubtext="Tap this card to a customer's phone and your profile opens straight away. No app. No typing. QR code on the back for any phone that can't tap. £19.99 with free UK delivery."
            badgeText="Clean & modern"
            frontSrc={BlueFrontImg}
            backSrc={BlueBackImg}
            edgeColor="#1e3a8a"
            frontTextColor="#ffffff"
            variant="blue"
            styleKey="blue"
            frontTemplate="BlueFront"
            backTemplate="BlueBack"
            buyButtonText="Buy Blue Card"
        />
    );
}