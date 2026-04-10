import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, useTexture } from "@react-three/drei";

import "../styling/products/plasticcard3d.css";

import WhiteFrontImg from "../assets/images/Products/WhiteFront.jpg";
import WhiteBackImg from "../assets/images/Products/WhiteBack.jpg";
import BlackFrontImg from "../assets/images/Products/BlackFront.jpg";
import BlackBackImg from "../assets/images/Products/BlackBack.jpg";
import BlueFrontImg from "../assets/images/Products/BlueFront.jpg";
import BlueBackImg from "../assets/images/Products/BlueBack.jpg";
import GreenFrontImg from "../assets/images/Products/GreenFront.jpg";
import GreenBackImg from "../assets/images/Products/GreenBack.jpg";
import MagentaFrontImg from "../assets/images/Products/MagentaFront.jpg";
import MagentaBackImg from "../assets/images/Products/MagentaBack.jpg";
import OrangeFrontImg from "../assets/images/Products/OrangeFront.jpg";
import OrangeBackImg from "../assets/images/Products/OrangeBack.jpg";

const TRANSPARENT_1PX =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO9qWZkAAAAASUVORK5CYII=";

const VARIANT_ARTWORK = {
    white: {
        front: WhiteFrontImg,
        back: WhiteBackImg,
        textColor: "#111111",
        edgeColor: "#ffffff",
    },
    black: {
        front: BlackFrontImg,
        back: BlackBackImg,
        textColor: "#ffffff",
        edgeColor: "#111111",
    },
    blue: {
        front: BlueFrontImg,
        back: BlueBackImg,
        textColor: "#ffffff",
        edgeColor: "#0f52ff",
    },
    green: {
        front: GreenFrontImg,
        back: GreenBackImg,
        textColor: "#ffffff",
        edgeColor: "#15a53a",
    },
    magenta: {
        front: MagentaFrontImg,
        back: MagentaBackImg,
        textColor: "#ffffff",
        edgeColor: "#d1008f",
    },
    orange: {
        front: OrangeFrontImg,
        back: OrangeBackImg,
        textColor: "#ffffff",
        edgeColor: "#ff7b00",
    },
};

const safeTexSrc = (src) => {
    const s = (src ?? "").toString().trim();
    return s ? s : TRANSPARENT_1PX;
};

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

function setupColorTexture(tex) {
    if (!tex) return;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 12;
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = true;
    tex.needsUpdate = true;
}

function getCanvasFontFamily() {
    return `"Cal Sans", "Inter", "Helvetica Neue", Arial, sans-serif`;
}

function resolveFrontTextSize({
    ctx,
    text,
    requestedSize,
    maxWidth,
    minSize = 36,
    maxSize = 320,
    fontFamily,
    fontWeight = 700,
    letterSpacingPx = 0,
}) {
    if (!ctx || !text) return minSize;

    let size = clamp(requestedSize, minSize, maxSize);

    const measure = (fontSize) => {
        ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
        const metrics = ctx.measureText(text);
        const extraSpacing = Math.max(0, text.length - 1) * letterSpacingPx;
        return metrics.width + extraSpacing;
    };

    while (size > minSize && measure(size) > maxWidth) {
        size -= 2;
    }

    return clamp(size, minSize, maxSize);
}

function drawTrackedText(ctx, text, x, y, letterSpacing = 0) {
    if (!ctx || !text) return;

    if (!letterSpacing) {
        ctx.fillText(text, x, y);
        return;
    }

    let cursorX = x;

    for (let i = 0; i < text.length; i += 1) {
        const char = text[i];
        ctx.fillText(char, cursorX, y);
        const metrics = ctx.measureText(char);
        cursorX += metrics.width + letterSpacing;
    }
}

function resolveVariantAssets(variant) {
    return VARIANT_ARTWORK[String(variant || "").toLowerCase()] || VARIANT_ARTWORK.white;
}

export default function PlasticCard3D({
    frontSrc,
    backSrc,
    qrSrc,
    edgeColor,
    interactive = true,
    autoRotate = true,
    autoRotateSpeed = 0.68,
    rotationOffset = 0,
    stageClassName = "",
    compact = false,
    variant = "white",
    frontText = "",
    frontFontSize = 30,
    frontFontWeight = 700,
    frontTextColor,
}) {
    const variantAssets = resolveVariantAssets(variant);

    const safeFront = safeTexSrc(frontSrc || variantAssets.front);
    const safeBack = safeTexSrc(backSrc || variantAssets.back);
    const safeQr = safeTexSrc(qrSrc);
    const resolvedEdgeColor = edgeColor || variantAssets.edgeColor;
    const resolvedTextColor = frontTextColor || variantAssets.textColor;

    return (
        <div
            className={`pc3d ${compact ? "pc3d--compact" : ""} ${interactive ? "pc3d--interactive" : "pc3d--locked"} ${stageClassName}`.trim()}
            aria-label="3D KonarCard preview"
        >
            <div className="pc3d__stage">
                <Canvas
                    dpr={[1, 2]}
                    camera={{ position: [0, 0.015, 1.68], fov: 25 }}
                    gl={{
                        antialias: true,
                        alpha: true,
                        premultipliedAlpha: false,
                        powerPreference: "high-performance",
                    }}
                    onCreated={({ gl }) => {
                        gl.setClearColor(0x000000, 0);
                        gl.outputColorSpace = THREE.SRGBColorSpace;
                        gl.domElement.style.touchAction = interactive ? "none" : "auto";
                    }}
                >
                    <ambientLight intensity={0.8} />
                    <directionalLight position={[2.3, 3.3, 2.3]} intensity={1.12} />
                    <directionalLight position={[-2, 1.2, -2]} intensity={0.6} />
                    <directionalLight position={[0, -1.5, 1.5]} intensity={0.18} />

                    <Environment preset="studio" />

                    <ResponsiveRig compact={compact}>
                        <CardFitWrapper compact={compact}>
                            <CardRig
                                interactive={interactive}
                                autoRotate={autoRotate}
                                autoRotateSpeed={autoRotateSpeed}
                                rotationOffset={rotationOffset}
                                compact={compact}
                            >
                                <group position={[0, compact ? -0.004 : -0.008, 0]}>
                                    <CardMesh
                                        frontSrc={safeFront}
                                        backSrc={safeBack}
                                        qrSrc={safeQr}
                                        edgeColor={resolvedEdgeColor}
                                        frontText={frontText}
                                        frontFontSize={frontFontSize}
                                        frontFontWeight={frontFontWeight}
                                        frontTextColor={resolvedTextColor}
                                    />
                                </group>
                            </CardRig>
                        </CardFitWrapper>
                    </ResponsiveRig>
                </Canvas>
            </div>
        </div>
    );
}

function ResponsiveRig({ children, compact = false }) {
    const g = useRef();
    const { size } = useThree();

    useEffect(() => {
        if (!g.current) return;

        const w = size.width;

        let scale;
        if (compact) {
            scale =
                w >= 1400
                    ? 1.02
                    : w >= 1200
                        ? 1
                        : w >= 980
                            ? 0.985
                            : w >= 720
                                ? 0.97
                                : w >= 520
                                    ? 0.955
                                    : 0.94;
        } else {
            scale =
                w >= 1400
                    ? 1.03
                    : w >= 1200
                        ? 1.01
                        : w >= 980
                            ? 0.99
                            : w >= 720
                                ? 0.97
                                : w >= 520
                                    ? 0.95
                                    : 0.93;
        }

        g.current.scale.setScalar(scale);
    }, [size.width, compact]);

    return <group ref={g}>{children}</group>;
}

function CardFitWrapper({ children, compact = false }) {
    const g = useRef();
    const { size } = useThree();

    useEffect(() => {
        if (!g.current) return;

        const w = size.width;

        let fitScale;

        if (compact) {
            fitScale =
                w >= 1400
                    ? 0.78
                    : w >= 1200
                        ? 0.765
                        : w >= 980
                            ? 0.75
                            : w >= 720
                                ? 0.735
                                : w >= 520
                                    ? 0.715
                                    : 0.69;
        } else {
            fitScale =
                w >= 1400
                    ? 0.82
                    : w >= 1200
                        ? 0.8
                        : w >= 980
                            ? 0.78
                            : w >= 720
                                ? 0.755
                                : w >= 520
                                    ? 0.73
                                    : 0.705;
        }

        g.current.scale.setScalar(fitScale);
    }, [size.width, compact]);

    return <group ref={g}>{children}</group>;
}

function CardRig({
    children,
    interactive = true,
    autoRotate = true,
    autoRotateSpeed = 0.68,
    rotationOffset = 0,
    compact = false,
}) {
    const group = useRef();

    const baseRX = compact ? 0.11 : 0.085;
    const baseRY = 0.64 + rotationOffset;

    const drag = useRef({
        isDown: false,
        hasUserInteracted: false,
        startX: 0,
        startY: 0,
        baseRX,
        baseRY,
        rx: baseRX,
        ry: baseRY,
        idle: true,
        t: rotationOffset * 2,
    });

    useEffect(() => {
        drag.current.baseRX = baseRX;
        drag.current.baseRY = baseRY;
        drag.current.rx = baseRX;
        drag.current.ry = baseRY;
        drag.current.idle = true;
        drag.current.isDown = false;
        drag.current.hasUserInteracted = false;
    }, [baseRX, baseRY]);

    useFrame((_, dt) => {
        if (!group.current) return;

        if (drag.current.idle) {
            drag.current.t += dt;

            if (autoRotate && !drag.current.hasUserInteracted) {
                drag.current.ry += autoRotateSpeed * dt;

                const breathe = Math.sin(drag.current.t * 1.05) * (compact ? 0.02 : 0.03);
                const targetRx = clamp(drag.current.baseRX + breathe, -0.55, 0.55);
                drag.current.rx = THREE.MathUtils.lerp(drag.current.rx, targetRx, 0.08);
            }
        }

        group.current.rotation.x = THREE.MathUtils.lerp(
            group.current.rotation.x,
            drag.current.rx,
            0.1
        );
        group.current.rotation.y = THREE.MathUtils.lerp(
            group.current.rotation.y,
            drag.current.ry,
            0.1
        );
        group.current.rotation.z = THREE.MathUtils.lerp(
            group.current.rotation.z,
            0.015,
            0.08
        );
    });

    const onPointerDown = (e) => {
        if (!interactive) return;

        e.stopPropagation();
        drag.current.isDown = true;
        drag.current.idle = false;
        drag.current.hasUserInteracted = true;

        drag.current.startX = e.clientX;
        drag.current.startY = e.clientY;

        drag.current.baseRX = drag.current.rx;
        drag.current.baseRY = drag.current.ry;

        try {
            e.target.setPointerCapture(e.pointerId);
        } catch {
            // ignore
        }
    };

    const onPointerMove = (e) => {
        if (!interactive || !drag.current.isDown) return;

        const dx = e.clientX - drag.current.startX;
        const dy = e.clientY - drag.current.startY;

        const gainX = 0.0064;
        const gainY = 0.0046;

        drag.current.ry = drag.current.baseRY + dx * gainX;
        drag.current.rx = clamp(drag.current.baseRX - dy * gainY, -0.55, 0.55);
    };

    const onPointerUp = () => {
        if (!interactive) return;

        drag.current.isDown = false;
        drag.current.baseRX = drag.current.rx;
        drag.current.baseRY = drag.current.ry;
        drag.current.idle = true;
    };

    return (
        <group
            ref={group}
            onPointerDown={interactive ? onPointerDown : undefined}
            onPointerMove={interactive ? onPointerMove : undefined}
            onPointerUp={interactive ? onPointerUp : undefined}
            onPointerCancel={interactive ? onPointerUp : undefined}
            onPointerLeave={interactive ? onPointerUp : undefined}
        >
            {children}
        </group>
    );
}

function CardMesh({
    frontSrc,
    backSrc,
    qrSrc,
    edgeColor,
    frontText,
    frontFontSize,
    frontFontWeight,
    frontTextColor,
}) {
    const w = 0.92;
    const h = w * (54 / 85.6);
    const t = 0.01;
    const cornerR = 0.06;

    const bodyGeo = useMemo(() => {
        const shape = roundedRectShape(w, h, cornerR);
        const geo = new THREE.ExtrudeGeometry(shape, {
            depth: t,
            bevelEnabled: true,
            bevelThickness: 0.0025,
            bevelSize: 0.004,
            bevelSegments: 8,
            curveSegments: 24,
            steps: 1,
        });
        geo.center();
        return geo;
    }, [w, h, t, cornerR]);

    const faceGeo = useMemo(() => new THREE.PlaneGeometry(w, h), [w, h]);

    const [frontTex, backTex, qrTex] = useTexture([frontSrc, backSrc, qrSrc]);

    useEffect(() => {
        setupColorTexture(frontTex);
        setupColorTexture(backTex);
        setupColorTexture(qrTex);
    }, [frontTex, backTex, qrTex]);

    const roundedMaskTexture = useMemo(() => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return null;

        const size = 1024;
        canvas.width = size;
        canvas.height = size;

        ctx.clearRect(0, 0, size, size);
        ctx.fillStyle = "#ffffff";

        const r = 72;
        roundedRectPath(ctx, 0, 0, size, size, r);
        ctx.fill();

        const tex = new THREE.CanvasTexture(canvas);
        setupColorTexture(tex);

        return tex;
    }, []);

    const composedFrontTexture = useMemo(() => {
        const frontImg = frontTex?.image;
        if (!frontImg) return null;

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return null;

        const width = frontImg.width || 1200;
        const height = frontImg.height || 800;

        canvas.width = width;
        canvas.height = height;

        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(frontImg, 0, 0, width, height);

        const safeText = String(frontText || "");
        const trimmedText = safeText.trim();

        if (trimmedText) {
            const fontFamily = getCanvasFontFamily();
            const fontWeight = clamp(Number(frontFontWeight || 700), 400, 900);

            const requestedPx = clamp(
                Number(frontFontSize || 30) * (height / 800) * 3.8,
                36,
                320
            );

            const maxWidth = width * 0.8;
            const centerX = width / 2;
            const centerY = height / 2;
            const letterSpacing = 0;

            const resolvedSize = resolveFrontTextSize({
                ctx,
                text: trimmedText,
                requestedSize: requestedPx,
                maxWidth,
                minSize: 36,
                maxSize: 320,
                fontFamily,
                fontWeight,
                letterSpacingPx: letterSpacing,
            });

            ctx.save();
            ctx.font = `${fontWeight} ${resolvedSize}px ${fontFamily}`;
            ctx.fillStyle = frontTextColor || "#111111";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            if (letterSpacing) {
                const totalWidth =
                    ctx.measureText(trimmedText).width +
                    Math.max(0, trimmedText.length - 1) * letterSpacing;

                drawTrackedText(
                    ctx,
                    trimmedText,
                    centerX - totalWidth / 2,
                    centerY,
                    letterSpacing
                );
            } else {
                ctx.fillText(trimmedText, centerX, centerY);
            }

            ctx.restore();
        }

        const tex = new THREE.CanvasTexture(canvas);
        setupColorTexture(tex);

        return tex;
    }, [frontTex, frontText, frontFontSize, frontFontWeight, frontTextColor]);

    const composedBackTexture = useMemo(() => {
        const backImg = backTex?.image;
        const qrImg = qrTex?.image;

        if (!backImg) return null;

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return null;

        const width = backImg.width || 1200;
        const height = backImg.height || 800;

        canvas.width = width;
        canvas.height = height;

        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(backImg, 0, 0, width, height);

        if (qrImg) {
            const qrSize = height * 0.6;
            const x = (width - qrSize) / 2;
            const y = (height - qrSize) / 2;
            ctx.drawImage(qrImg, x, y, qrSize, qrSize);
        }

        const tex = new THREE.CanvasTexture(canvas);
        setupColorTexture(tex);

        return tex;
    }, [backTex, qrTex]);

    useEffect(() => {
        return () => {
            if (roundedMaskTexture) roundedMaskTexture.dispose();
            if (composedFrontTexture) composedFrontTexture.dispose();
            if (composedBackTexture) composedBackTexture.dispose();
        };
    }, [roundedMaskTexture, composedFrontTexture, composedBackTexture]);

    const edgeMat = useMemo(() => {
        return new THREE.MeshPhysicalMaterial({
            color: edgeColor,
            roughness: 0.42,
            metalness: 0,
            clearcoat: 0.55,
            clearcoatRoughness: 0.28,
            sheen: 0.08,
            sheenRoughness: 0.75,
        });
    }, [edgeColor]);

    const frontMat = useMemo(() => {
        const m = new THREE.MeshBasicMaterial({
            map: composedFrontTexture || frontTex || null,
            alphaMap: roundedMaskTexture || null,
            transparent: true,
            opacity: 1,
            toneMapped: false,
            side: THREE.FrontSide,
            depthTest: true,
            depthWrite: false,
        });
        m.alphaTest = 0.01;
        m.polygonOffset = true;
        m.polygonOffsetFactor = -6;
        m.polygonOffsetUnits = -6;
        return m;
    }, [composedFrontTexture, frontTex, roundedMaskTexture]);

    const backMat = useMemo(() => {
        const m = new THREE.MeshBasicMaterial({
            map: composedBackTexture || backTex || null,
            alphaMap: roundedMaskTexture || null,
            transparent: true,
            opacity: 1,
            toneMapped: false,
            side: THREE.FrontSide,
            depthTest: true,
            depthWrite: false,
        });
        m.alphaTest = 0.01;
        m.polygonOffset = true;
        m.polygonOffsetFactor = -6;
        m.polygonOffsetUnits = -6;
        return m;
    }, [composedBackTexture, backTex, roundedMaskTexture]);

    const halfT = t / 2;
    const zFront = halfT + 0.0045;
    const zBack = -halfT - 0.0045;

    return (
        <group>
            <mesh geometry={bodyGeo} material={edgeMat} />

            <mesh
                geometry={faceGeo}
                material={frontMat}
                position={[0, 0, zFront]}
                renderOrder={2}
            />

            <mesh
                geometry={faceGeo}
                material={backMat}
                position={[0, 0, zBack]}
                rotation={[0, Math.PI, 0]}
                renderOrder={2}
            />
        </group>
    );
}

function roundedRectShape(w, h, r) {
    const shape = new THREE.Shape();
    const x = -w / 2;
    const y = -h / 2;

    shape.moveTo(x + r, y);
    shape.lineTo(x + w - r, y);
    shape.quadraticCurveTo(x + w, y, x + w, y + r);
    shape.lineTo(x + w, y + h - r);
    shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    shape.lineTo(x + r, y + h);
    shape.quadraticCurveTo(x, y + h, x, y + h - r);
    shape.lineTo(x, y + r);
    shape.quadraticCurveTo(x, y, x + r, y);

    return shape;
}

function roundedRectPath(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}