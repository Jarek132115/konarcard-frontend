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
                camera={{ position: [0, 0.18, 1.08], fov: 36 }}
                gl={{ antialias: true, alpha: true, premultipliedAlpha: false }}
                onCreated={({ gl }) => {
                    gl.setClearColor(0x000000, 0);
                    gl.outputColorSpace = THREE.SRGBColorSpace;
                    gl.domElement.style.touchAction = "none";
                }}
            >
                {/* Lights */}
                <ambientLight intensity={0.7} />
                <directionalLight position={[2.2, 3.2, 2.2]} intensity={1.1} castShadow />
                <directionalLight position={[-2, 1, -2]} intensity={0.55} />

                <Environment preset="studio" />

                <CardRig>
                    <CardMesh logoSrc={logoSrc} qrSrc={qrSrc} logoSize={logoSize} />
                </CardRig>

                <ContactShadows position={[0, -0.37, 0]} opacity={0.34} blur={1.7} scale={2.25} far={2} />
            </Canvas>
        </div>
    );
}

/**
 * Drag rotate + slow idle spin (NOT crazy fast).
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

            // ✅ MUCH slower idle spin (radians)
            drag.current.ry += 0.35 * dt; // ~0.35 rad/sec = smooth, not insane
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

        // ✅ Good “premium” feel
        const gainX = 0.0062;
        const gainY = 0.0044;

        const nextRY = drag.current.baseRY + dx * gainX;
        const nextRX = drag.current.baseRX - dy * gainY;

        drag.current.ry = nextRY;
        drag.current.rx = clamp(nextRX, -0.55, 0.55);
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
 * ✅ Correct approach:
 * - 1 extruded rounded body (edges only)
 * - 1 front plane for logo
 * - 1 back plane for QR
 * This guarantees the logo/QR show and the card stays white.
 */
function CardMesh({ logoSrc, qrSrc, logoSize }) {
    // Real card proportions
    const w = 0.92;
    const h = w * (54 / 85.6);
    const t = 0.024;

    // rounded body geometry
    const bodyGeo = useMemo(() => {
        const shape = roundedRectShape(w, h, 0.06);
        const geo = new THREE.ExtrudeGeometry(shape, {
            depth: t,
            bevelEnabled: true,
            bevelThickness: 0.006,
            bevelSize: 0.008,
            bevelSegments: 6,
            curveSegments: 18,
            steps: 1,
        });
        geo.center();
        return geo;
    }, [w, h, t]);

    // front/back planes (slightly inset so no z-fighting)
    const planeGeo = useMemo(() => new THREE.PlaneGeometry(w * 0.985, h * 0.985), [w, h]);

    const [logoTex, qrTex] = useTexture([logoSrc, qrSrc]);

    useEffect(() => {
        [logoTex, qrTex].forEach((tex) => {
            if (!tex) return;
            tex.anisotropy = 12;
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.wrapS = THREE.ClampToEdgeWrapping;
            tex.wrapT = THREE.ClampToEdgeWrapping;
            tex.minFilter = THREE.LinearMipmapLinearFilter;
            tex.magFilter = THREE.LinearFilter;
            tex.needsUpdate = true;
        });
    }, [logoTex, qrTex]);

    // ✅ logo scaling (centered)
    useEffect(() => {
        if (!logoTex) return;
        const s = Math.max(28, Math.min(70, Number(logoSize || 44))) / 100;
        logoTex.center.set(0.5, 0.5);
        logoTex.repeat.set(s, s);
        logoTex.offset.set(0.5 - s / 2, 0.5 - s / 2);
        logoTex.needsUpdate = true;
    }, [logoTex, logoSize]);

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

    const faceBase = useMemo(
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

    // clone face material per side so we can attach maps
    const frontMat = useMemo(() => {
        const m = faceBase.clone();
        m.map = logoTex || null;
        m.needsUpdate = true;
        return m;
    }, [faceBase, logoTex]);

    const backMat = useMemo(() => {
        const m = faceBase.clone();
        m.map = qrTex || null;
        m.needsUpdate = true;
        return m;
    }, [faceBase, qrTex]);

    // position planes just above surfaces
    const halfT = t / 2;
    const zFront = halfT + 0.0008;
    const zBack = -halfT - 0.0008;

    return (
        <group>
            {/* Body (edges) */}
            <mesh geometry={bodyGeo} material={edgeMat} castShadow receiveShadow />

            {/* Front face (logo) */}
            <mesh geometry={planeGeo} material={frontMat} position={[0, 0, zFront]} castShadow receiveShadow />

            {/* Back face (QR) - rotate so it faces outward */}
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
