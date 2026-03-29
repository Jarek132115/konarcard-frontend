import React from "react";
import PlasticCard3D from "../PlasticCard3D";
import MetalCard3D from "../MetalCard3D";
import KonarTag3D from "../KonarTag3D";
import { finishFromVariant } from "./cardsHelpers";

class CardPreviewErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(err) {
        console.error("3D preview crashed:", err);
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback || null;
        }
        return this.props.children;
    }
}

function Card3DRenderer({ productKey, logoSrc, qrSrc, variantRaw }) {
    const pk = String(productKey || "");

    if (pk === "metal-card") {
        return (
            <MetalCard3D
                logoSrc={logoSrc}
                qrSrc={qrSrc}
                finish={finishFromVariant(variantRaw)}
            />
        );
    }

    if (pk === "konartag") {
        return (
            <KonarTag3D
                logoSrc={logoSrc}
                qrSrc={qrSrc}
                finish={finishFromVariant(variantRaw)}
            />
        );
    }

    return <PlasticCard3D logoSrc={logoSrc} qrSrc={qrSrc} />;
}

export default function Card3DPreview({
    productKey,
    logoSrc,
    qrSrc,
    variantRaw,
    fallback = "3D Card Preview",
}) {
    return (
        <CardPreviewErrorBoundary fallback={<div className="cp-previewFallback">{fallback}</div>}>
            <Card3DRenderer
                productKey={productKey}
                logoSrc={logoSrc}
                qrSrc={qrSrc}
                variantRaw={variantRaw}
            />
        </CardPreviewErrorBoundary>
    );
}