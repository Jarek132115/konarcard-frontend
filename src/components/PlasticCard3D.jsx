// src/pages/website/products/PlasticCard3D.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment } from "@react-three/drei";

import "../styling/products/plasticcard3d.css";

export default function PlasticCard3D({ logoSrc, qrSrc, logoSize = 44 }) {
    return (
        <div className="pc3d">
            <Canvas
                dpr={[1, 2]}
                camera={{ position: [0, 0.12, 1.32], fov: 36 }}
                gl={{
                    antialias: true,
                    alpha: true,
                    premultipliedAlpha: false,
                    powerPreference: "high-performance",
                }}
                onCreated={({ gl }) => {
                    gl.setClearColor(0x000000, 0);
                    gl.outputColorSpace = THREE.SRGBColorSpace;
                    gl.domElement.style.touchAction = "none";
                }}
            >
                {/* Lights */}
                <ambientLight intensity={0.78} />
                <directionalLight position={[2.3, 3.3, 2.3]} intensity={1.12} castShadow />
                <directionalLight position={[-2, 1.2, -2]} intensity={0.6} />

                <Environment preset="studio" />

                <CardRig>
                    <CardMesh logoSrc={logoSrc} qrSrc={qrSrc} logoSize={logoSize} />
                </CardRig>

                <ContactShadows position={[0, -0.42, 0]} opacity={0.32} blur={1.9} scale={2.35} far={2.4} />
            </Canvas>
        </div>
    );
}

/**
 * Drag rotate + slow idle spin
 */
function CardRig({ children }) {
    const group = useRef();

    const drag = useRef({
        isDown: false,
        startX: 0,
        startY: 0,
        baseRX: 0.08,
        baseRY: 0.7,
        rx: 0.08,
        ry: 0.7,
        idle: true,
        t: 0,
    });

    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

    useFrame((_, dt) => {
        if (!group.current) return;

        if (drag.current.idle) {
            drag.current.t += dt;
            drag.current.ry += 0.32 * dt; // slow spin
            const breathe = Math.sin(drag.current.t * 1.05) * 0.03;
            drag.current.rx = clamp(drag.current.baseRX + breathe, -0.55, 0.55);
        }

        group.current.rotation.x = drag.current.rx;
        group.current.rotation.y = drag.current.ry;
        group.current.rotation.z = 0.02;
    });

    const onPointerDown = (e) => {
        e.stopPropagation();
        drag.current.isDown = true;
        drag.current.idle = false;

        drag.current.startX = e.clientX;
        drag.current.startY = e.clientY;

        drag.current.baseRX = drag.current.rx;
        drag.current.baseRY = drag.current.ry;

        try {
            e.target.setPointerCapture(e.pointerId);
        } catch { }
    };

    const onPointerMove = (e) => {
        if (!drag.current.isDown) return;

        const dx = e.clientX - drag.current.startX;
        const dy = e.clientY - drag.current.startY;

        const gainX = 0.0062;
        const gainY = 0.0044;

        drag.current.ry = drag.current.baseRY + dx * gainX;
        drag.current.rx = clamp(drag.current.baseRX - dy * gainY, -0.55, 0.55);
    };

    const onPointerUp = () => {
        drag.current.isDown = false;
        drag.current.baseRX = drag.current.rx;
        drag.current.baseRY = drag.current.ry;
        drag.current.idle = true;
    };

    return (
        <group
            ref={group}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
        >
            {children}
        </group>
    );
}

/**
 * SVG-safe texture loader (canvas → CanvasTexture)
 */
function useCanvasTexture(src) {
    const [out, setOut] = useState({ tex: null, aspect: 1 });

    useEffect(() => {
        if (!src) {
            setOut({ tex: null, aspect: 1 });
            return;
        }

        let cancelled = false;
        let textureToDispose = null;

        const img = new Image();
        img.crossOrigin = "anonymous";

        img.onload = () => {
            if (cancelled) return;

            const max = 1024;
            const scale = Math.min(1, max / Math.max(img.width || 1, img.height || 1));
            const cw = Math.max(1, Math.round((img.width || 1) * scale));
            const ch = Math.max(1, Math.round((img.height || 1) * scale));

            const canvas = document.createElement("canvas");
            canvas.width = cw;
            canvas.height = ch;

            const ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, cw, ch);
            ctx.drawImage(img, 0, 0, cw, ch);

            const tex = new THREE.CanvasTexture(canvas);
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.anisotropy = 12;
            tex.wrapS = THREE.ClampToEdgeWrapping;
            tex.wrapT = THREE.ClampToEdgeWrapping;
            tex.minFilter = THREE.LinearMipmapLinearFilter;
            tex.magFilter = THREE.LinearFilter;
            tex.needsUpdate = true;

            textureToDispose = tex;

            setOut({
                tex,
                aspect: (img.width || 1) / (img.height || 1),
            });
        };

        img.onerror = () => {
            if (!cancelled) setOut({ tex: null, aspect: 1 });
        };

        img.src = src;

        return () => {
            cancelled = true;
            if (textureToDispose) textureToDispose.dispose();
        };
    }, [src]);

    return out;
}

function CardMesh({ logoSrc, qrSrc, logoSize }) {
    // real card proportions
    const w = 0.92;
    const h = w * (54 / 85.6);

    // thin plastic feel
    const t = 0.010;

    // Card body
    const bodyGeo = useMemo(() => {
        const shape = roundedRectShape(w, h, 0.06);
        const geo = new THREE.ExtrudeGeometry(shape, {
            depth: t,
            bevelEnabled: true,
            bevelThickness: 0.0022,
            bevelSize: 0.0038,
            bevelSegments: 6,
            curveSegments: 18,
            steps: 1,
        });
        geo.center();
        return geo;
    }, [w, h, t]);

    // ✅ Rounded face geometry (THIS REMOVES THE STRAIGHT CORNERS)
    const faceGeo = useMemo(() => {
        // tiny inset so it never sticks out past the body bevel
        const inset = 0.986;
        const shape = roundedRectShape(w * inset, h * inset, 0.06 * inset);
        const geo = new THREE.ShapeGeometry(shape, 32);
        geo.center();
        return geo;
    }, [w, h]);

    // textures
    const { tex: logoTex, aspect: logoAspect } = useCanvasTexture(logoSrc);
    const { tex: qrTex, aspect: qrAspect } = useCanvasTexture(qrSrc);

    // materials
    const edgeMat = useMemo(
        () =>
            new THREE.MeshPhysicalMaterial({
                color: "#ffffff",
                roughness: 0.42,
                metalness: 0.0,
                clearcoat: 0.55,
                clearcoatRoughness: 0.28,
                sheen: 0.08,
                sheenRoughness: 0.75,
            }),
        []
    );

    const baseFaceMat = useMemo(
        () =>
            new THREE.MeshPhysicalMaterial({
                color: "#ffffff",
                roughness: 0.36,
                metalness: 0.0,
                clearcoat: 0.6,
                clearcoatRoughness: 0.25,
            }),
        []
    );

    const decalMatLogo = useMemo(() => {
        const m = new THREE.MeshStandardMaterial({
            color: "#ffffff",
            map: logoTex || null,
            transparent: true,
            opacity: 1,
            alphaTest: 0.05,
            side: THREE.DoubleSide,
        });
        m.polygonOffset = true;
        m.polygonOffsetFactor = -3;
        m.polygonOffsetUnits = -3;
        return m;
    }, [logoTex]);

    const decalMatQr = useMemo(() => {
        const m = new THREE.MeshStandardMaterial({
            color: "#ffffff",
            map: qrTex || null,
            transparent: true,
            opacity: 1,
            alphaTest: 0.05,
            side: THREE.DoubleSide,
        });
        m.polygonOffset = true;
        m.polygonOffsetFactor = -3;
        m.polygonOffsetUnits = -3;
        return m;
    }, [qrTex]);

    // logo sizing (55% height * slider)
    const logoHeightFracBase = 0.55;
    const qrHeightFrac = 0.45;

    const slider = Math.max(28, Math.min(70, Number(logoSize || 44)));
    const sliderScale = 0.7 + ((slider - 28) / (70 - 28)) * 0.5;

    let logoH = h * logoHeightFracBase * sliderScale;
    let logoW = logoH * (logoAspect || 1);
    const maxLogoW = w * 0.82;
    if (logoW > maxLogoW) {
        logoW = maxLogoW;
        logoH = logoW / (logoAspect || 1);
    }

    let qrH = h * qrHeightFrac;
    let qrW = qrH * (qrAspect || 1);
    const maxQrW = w * 0.62;
    if (qrW > maxQrW) {
        qrW = maxQrW;
        qrH = qrW / (qrAspect || 1);
    }

    // ✅ decals are also rounded (prevents corner silhouette on overlays)
    const logoGeo = useMemo(() => {
        const r = Math.min(logoW, logoH) * 0.12;
        const s = roundedRectShape(logoW, logoH, r);
        const g = new THREE.ShapeGeometry(s, 24);
        g.center();
        return g;
    }, [logoW, logoH]);

    const qrGeo = useMemo(() => {
        const r = Math.min(qrW, qrH) * 0.12;
        const s = roundedRectShape(qrW, qrH, r);
        const g = new THREE.ShapeGeometry(s, 24);
        g.center();
        return g;
    }, [qrW, qrH]);

    // z offsets
    const halfT = t / 2;
    const zFront = halfT + 0.0024;
    const zBack = -halfT - 0.0024;

    const zFrontDecal = zFront + 0.0018;
    const zBackDecal = zBack - 0.0018;

    return (
        <group>
            {/* Body */}
            <mesh geometry={bodyGeo} material={edgeMat} castShadow receiveShadow />

            {/* ✅ Rounded white faces (no more straight corners) */}
            <mesh geometry={faceGeo} material={baseFaceMat} position={[0, 0, zFront]} />
            <mesh geometry={faceGeo} material={baseFaceMat} position={[0, 0, zBack]} rotation={[0, Math.PI, 0]} />

            {/* Logo */}
            {logoTex && (
                <mesh geometry={logoGeo} material={decalMatLogo} position={[0, 0, zFrontDecal]} castShadow receiveShadow />
            )}

            {/* QR */}
            {qrTex && (
                <mesh
                    geometry={qrGeo}
                    material={decalMatQr}
                    position={[0, 0, zBackDecal]}
                    rotation={[0, Math.PI, 0]}
                    castShadow
                    receiveShadow
                />
            )}
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
