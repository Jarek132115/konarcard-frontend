import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, useTexture } from "@react-three/drei";

import "../styling/products/plasticcard3d.css";

const TRANSPARENT_1PX =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO9qWZkAAAAASUVORK5CYII=";

const safeTexSrc = (src) => {
    const s = (src ?? "").toString().trim();
    return s ? s : TRANSPARENT_1PX;
};

export default function PlasticCard3D({
    frontSrc,
    backSrc,
    qrSrc,
    edgeColor = "#ffffff",
    interactive = true,
    autoRotate = true,
    autoRotateSpeed = 0.68,
    rotationOffset = 0,
    stageClassName = "",
    compact = false,
}) {
    const safeFront = safeTexSrc(frontSrc);
    const safeBack = safeTexSrc(backSrc);
    const safeQr = safeTexSrc(qrSrc);

    return (
        <div
            className={`pc3d ${compact ? "pc3d--compact" : ""} ${interactive ? "pc3d--interactive" : "pc3d--locked"
                } ${stageClassName}`.trim()}
            aria-label="3D KonarCard preview"
        >
            <div className="pc3d__stage">
                <Canvas
                    dpr={[1, 2]}
                    camera={{ position: [0, 0.14, 1.22], fov: 32 }}
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
                    <ambientLight intensity={0.78} />
                    <directionalLight position={[2.3, 3.3, 2.3]} intensity={1.12} />
                    <directionalLight position={[-2, 1.2, -2]} intensity={0.6} />

                    <Environment preset="studio" />

                    <ResponsiveRig compact={compact}>
                        <CardRig
                            interactive={interactive}
                            autoRotate={autoRotate}
                            autoRotateSpeed={autoRotateSpeed}
                            rotationOffset={rotationOffset}
                        >
                            <group position={[0, compact ? 0.025 : -0.01, 0]}>
                                <CardMesh
                                    frontSrc={safeFront}
                                    backSrc={safeBack}
                                    qrSrc={safeQr}
                                    edgeColor={edgeColor}
                                />
                            </group>
                        </CardRig>
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
                    ? 0.98
                    : w >= 1200
                        ? 0.95
                        : w >= 980
                            ? 0.92
                            : w >= 720
                                ? 0.89
                                : w >= 520
                                    ? 0.86
                                    : 0.83;
        } else {
            scale =
                w >= 1400
                    ? 0.96
                    : w >= 1200
                        ? 0.94
                        : w >= 980
                            ? 0.92
                            : w >= 720
                                ? 0.88
                                : w >= 520
                                    ? 0.84
                                    : 0.8;
        }

        g.current.scale.setScalar(scale);
    }, [size.width, compact]);

    return <group ref={g}>{children}</group>;
}

function CardRig({
    children,
    interactive = true,
    autoRotate = true,
    autoRotateSpeed = 0.68,
    rotationOffset = 0,
}) {
    const group = useRef();

    const drag = useRef({
        isDown: false,
        startX: 0,
        startY: 0,
        baseRX: 0.08,
        baseRY: 0.7 + rotationOffset,
        rx: 0.08,
        ry: 0.7 + rotationOffset,
        idle: true,
        t: rotationOffset * 2,
    });

    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

    useFrame((_, dt) => {
        if (!group.current) return;

        if (drag.current.idle) {
            drag.current.t += dt;

            if (autoRotate) {
                drag.current.ry += autoRotateSpeed * dt;
            }

            const breathe = Math.sin(drag.current.t * 1.05) * 0.03;
            const targetRx = clamp(drag.current.baseRX + breathe, -0.55, 0.55);

            drag.current.rx = THREE.MathUtils.lerp(drag.current.rx, targetRx, 0.08);
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
            0.02,
            0.08
        );
    });

    const onPointerDown = (e) => {
        if (!interactive) return;

        e.stopPropagation();
        drag.current.isDown = true;
        drag.current.idle = false;

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
        >
            {children}
        </group>
    );
}

function CardMesh({ frontSrc, backSrc, qrSrc, edgeColor }) {
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
    }, [w, h, t]);

    const faceGeo = useMemo(() => new THREE.PlaneGeometry(w, h), [w, h]);

    const [frontTex, backTex, qrTex] = useTexture([frontSrc, backSrc, qrSrc]);

    useEffect(() => {
        const setupColorTexture = (tex) => {
            if (!tex) return;
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.anisotropy = 12;
            tex.wrapS = THREE.ClampToEdgeWrapping;
            tex.wrapT = THREE.ClampToEdgeWrapping;
            tex.minFilter = THREE.LinearMipmapLinearFilter;
            tex.magFilter = THREE.LinearFilter;
            tex.generateMipmaps = true;
            tex.needsUpdate = true;
        };

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
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.wrapS = THREE.ClampToEdgeWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.generateMipmaps = true;
        tex.needsUpdate = true;

        return tex;
    }, []);

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
            const qrSize = height * 0.6; /* 60% of card height */
            const x = (width - qrSize) / 2;
            const y = (height - qrSize) / 2;

            ctx.drawImage(qrImg, x, y, qrSize, qrSize);
        }

        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 12;
        tex.wrapS = THREE.ClampToEdgeWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.generateMipmaps = true;
        tex.needsUpdate = true;

        return tex;
    }, [backTex, qrTex]);

    useEffect(() => {
        return () => {
            if (roundedMaskTexture) roundedMaskTexture.dispose();
            if (composedBackTexture) composedBackTexture.dispose();
        };
    }, [roundedMaskTexture, composedBackTexture]);

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
            map: frontTex || null,
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
    }, [frontTex, roundedMaskTexture]);

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
            {/* Middle plastic card body */}
            <mesh geometry={bodyGeo} material={edgeMat} />

            {/* Front artwork layer */}
            <mesh
                geometry={faceGeo}
                material={frontMat}
                position={[0, 0, zFront]}
                renderOrder={2}
            />

            {/* Back artwork layer */}
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