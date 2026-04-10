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
            heroSubtext="A professional blue NFC business card with QR backup — designed to stand out cleanly and work instantly."
            badgeText="Modern"
            frontSrc={BlueFrontImg}
            backSrc={BlueBackImg}
            edgeColor="#3150ff"
            frontTextColor="#ffffff"
            variant="blue"
            styleKey="blue"
            frontTemplate="BlueFront"
            backTemplate="BlueBack"
        />
    );
}