// src/pages/website/products/PlasticCard3D.jsx
import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, useTexture } from "@react-three/drei";

import "../styling/products/plasticcard3d.css";

export default function PlasticCard3D({ logoSrc, qrSrc, logoSize = 44 }) {
    return (
        <div className="pc3d">
            <Canvas
                dpr={[1, 2]}
                // ✅ pull camera back a bit so card never clips top/bottom
                camera={{ position: [0, 0.16, 1.22], fov: 36 }}
                gl={{
                    antialias: true,
                    alpha: true,
                    premultipliedAlpha: false,
                    // ✅ helps avoid jaggy black edge artifacts
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
                    <CardMesh logoSrc={logoSrc} qrSrc={qrSrc} />
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
            drag.current.ry += 0.32 * dt; // ✅ smooth slow spin
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

function CardMesh({ logoSrc, qrSrc }) {
    // real card proportions
    const w = 0.92;
    const h = w * (54 / 85.6);

    // ✅ MUCH thinner (plastic NFC card feel)
    const t = 0.010; // was 0.024

    // Rounded body geometry
    const bodyGeo = useMemo(() => {
        const shape = roundedRectShape(w, h, 0.06);
        const geo = new THREE.ExtrudeGeometry(shape, {
            depth: t,
            bevelEnabled: true,
            bevelThickness: 0.0025,
            bevelSize: 0.004,
            bevelSegments: 6,
            curveSegments: 18,
            steps: 1,
        });
        geo.center();
        return geo;
    }, [w, h, t]);

    // Face planes
    const planeGeo = useMemo(() => new THREE.PlaneGeometry(w * 0.985, h * 0.985), [w, h]);

    const [logoTex, qrTex] = useTexture([logoSrc, qrSrc]);

    // ✅ ensure textures show correctly (common gotchas)
    useEffect(() => {
        if (logoTex) {
            logoTex.colorSpace = THREE.SRGBColorSpace;
            logoTex.anisotropy = 12;
            logoTex.wrapS = THREE.ClampToEdgeWrapping;
            logoTex.wrapT = THREE.ClampToEdgeWrapping;
            logoTex.minFilter = THREE.LinearMipmapLinearFilter;
            logoTex.magFilter = THREE.LinearFilter;
            logoTex.flipY = false; // ✅ important in many Vite/Three setups
            logoTex.needsUpdate = true;
        }

        if (qrTex) {
            qrTex.colorSpace = THREE.SRGBColorSpace;
            qrTex.anisotropy = 12;
            qrTex.wrapS = THREE.ClampToEdgeWrapping;
            qrTex.wrapT = THREE.ClampToEdgeWrapping;
            qrTex.minFilter = THREE.LinearMipmapLinearFilter;
            qrTex.magFilter = THREE.LinearFilter;
            qrTex.flipY = false; // ✅ fixes “not showing / inverted” issues
            qrTex.needsUpdate = true;
        }
    }, [logoTex, qrTex]);

    /**
     * ✅ You asked:
     * - Logo should be 55% of the card HEIGHT, centered.
     * - QR should be 45% of the card HEIGHT, centered.
     *
     * Since the textures are images with their own aspect ratio,
     * we scale by height and keep centered.
     */
    useEffect(() => {
        if (!logoTex) return;

        const desiredH = 0.55; // 55% of card height
        // keep centered
        logoTex.center.set(0.5, 0.5);
        // scale equally (best visual)
        logoTex.repeat.set(desiredH, desiredH);
        logoTex.offset.set(0.5 - desiredH / 2, 0.5 - desiredH / 2);
        logoTex.needsUpdate = true;
    }, [logoTex]);

    useEffect(() => {
        if (!qrTex) return;

        const desiredH = 0.45; // 45% of card height
        qrTex.center.set(0.5, 0.5);
        qrTex.repeat.set(desiredH, desiredH);
        qrTex.offset.set(0.5 - desiredH / 2, 0.5 - desiredH / 2);
        qrTex.needsUpdate = true;
    }, [qrTex]);

    // Materials
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

    const frontMat = useMemo(() => {
        const m = new THREE.MeshPhysicalMaterial({
            color: "#ffffff",
            roughness: 0.36,
            metalness: 0.0,
            clearcoat: 0.6,
            clearcoatRoughness: 0.25,
            map: logoTex || null,
        });

        // ✅ prevent black “edge line” artifacts where plane meets body
        m.polygonOffset = true;
        m.polygonOffsetFactor = -2;
        m.polygonOffsetUnits = -2;

        // keep visible even if viewing angle is sharp
        m.side = THREE.DoubleSide;
        return m;
    }, [logoTex]);

    const backMat = useMemo(() => {
        const m = new THREE.MeshPhysicalMaterial({
            color: "#ffffff",
            roughness: 0.36,
            metalness: 0.0,
            clearcoat: 0.6,
            clearcoatRoughness: 0.25,
            map: qrTex || null,
        });

        m.polygonOffset = true;
        m.polygonOffsetFactor = -2;
        m.polygonOffsetUnits = -2;

        m.side = THREE.DoubleSide;
        return m;
    }, [qrTex]);

    // ✅ push planes a hair outward to avoid z-fighting
    const halfT = t / 2;
    const zFront = halfT + 0.0022;
    const zBack = -halfT - 0.0022;

    return (
        <group>
            {/* Body (edges only) */}
            <mesh geometry={bodyGeo} material={edgeMat} castShadow receiveShadow />

            {/* Front (logo) */}
            <mesh geometry={planeGeo} material={frontMat} position={[0, 0, zFront]} castShadow receiveShadow />

            {/* Back (QR) */}
            <mesh
                geometry={planeGeo}
                material={backMat}
                position={[0, 0, zBack]}
                rotation={[0, Math.PI, 0]}
                castShadow
                receiveShadow
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
