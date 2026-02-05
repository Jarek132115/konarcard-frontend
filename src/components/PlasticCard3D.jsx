// src/pages/website/products/PlasticCard3D.jsx
import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, useTexture } from "@react-three/drei";

import "../../../styling/products/plasticcard3d.css";

export default function PlasticCard3D({ logoSrc, qrSrc, logoSize = 44 }) {
    return (
        <div className="pc3d">
            <Canvas
                dpr={[1, 2]}
                camera={{ position: [0, 0.22, 1.05], fov: 38 }} // ✅ closer + better framing (less “long” look)
                gl={{ antialias: true, alpha: true, premultipliedAlpha: false }}
                onCreated={({ gl }) => {
                    gl.setClearColor(0x000000, 0);
                    gl.outputColorSpace = THREE.SRGBColorSpace;
                    gl.domElement.style.touchAction = "none"; // ✅ crucial for dragging on touch
                }}
            >
                {/* Lights */}
                <ambientLight intensity={0.55} />
                <directionalLight position={[2, 3, 2]} intensity={1.05} castShadow />
                <directionalLight position={[-2, 1, -2]} intensity={0.45} />

                <Environment preset="studio" />

                {/* ✅ Drag + idle spin controller */}
                <CardRig>
                    <CardMesh logoSrc={logoSrc} qrSrc={qrSrc} logoSize={logoSize} />
                </CardRig>

                <ContactShadows position={[0, -0.37, 0]} opacity={0.38} blur={1.6} scale={2.2} far={2} />
            </Canvas>
        </div>
    );
}

/**
 * Wraps the card and restores the “drag to rotate + idle spin” feel.
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

        // idle spin (matches your old “premium” vibe)
        if (drag.current.idle) {
            drag.current.t += dt;

            drag.current.ry += 0.22 * dt * 60; // keep similar speed across FPS
            const breathe = Math.sin(drag.current.t * 1.2) * 0.03;

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

        // same “feel” as your old CSS version (drag left/right = yaw, up/down = pitch)
        const gainX = 0.0065;
        const gainY = 0.0045;

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
        // Make the whole area “grabbable”
        >
            {children}
        </group>
    );
}

function CardMesh({ logoSrc, qrSrc, logoSize }) {
    // ✅ keep real card proportions (85.6 × 54mm)
    const w = 0.92;
    const h = w * (54 / 85.6);

    // ✅ thickness (not chunky)
    const t = 0.024;

    const geometry = useMemo(() => {
        const shape = roundedRectShape(w, h, 0.06);
        const extrude = new THREE.ExtrudeGeometry(shape, {
            depth: t,
            bevelEnabled: true,
            bevelThickness: 0.006,
            bevelSize: 0.008,
            bevelSegments: 6,
            curveSegments: 18,
            steps: 1,
        });

        extrude.center();
        return extrude;
    }, [w, h, t]);

    const [logoTex, qrTex] = useTexture([logoSrc, qrSrc]);

    [logoTex, qrTex].forEach((tex) => {
        tex.anisotropy = 12;
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.wrapS = THREE.ClampToEdgeWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.needsUpdate = true;
    });

    // ✅ scale the logo texture (keep centered) using your slider
    useMemo(() => {
        const s = Math.max(28, Math.min(70, Number(logoSize || 44))) / 100;
        logoTex.center.set(0.5, 0.5);
        logoTex.repeat.set(s, s);
        logoTex.offset.set(0.5 - s / 2, 0.5 - s / 2);
        logoTex.needsUpdate = true;
    }, [logoTex, logoSize]);

    const materials = useMemo(() => {
        // ✅ sides/bevel: SOLID white (prevents that “grey frame” look)
        const edge = new THREE.MeshPhysicalMaterial({
            color: "#ffffff",
            roughness: 0.42,
            metalness: 0.0,
            clearcoat: 0.55,
            clearcoatRoughness: 0.28,
            sheen: 0.08,
            sheenRoughness: 0.75,
        });

        const front = new THREE.MeshPhysicalMaterial({
            color: "#ffffff",
            roughness: 0.36,
            metalness: 0.0,
            clearcoat: 0.6,
            clearcoatRoughness: 0.25,
            map: logoTex,
            transparent: false,
        });

        const back = new THREE.MeshPhysicalMaterial({
            color: "#ffffff",
            roughness: 0.36,
            metalness: 0.0,
            clearcoat: 0.6,
            clearcoatRoughness: 0.25,
            map: qrTex,
            transparent: false,
        });

        // Extrude groups: 0 front, 1 back, 2+ sides
        return [front, back, edge];
    }, [logoTex, qrTex]);

    return (
        <mesh geometry={geometry} material={materials} castShadow receiveShadow position={[0, 0, 0]}>
            {/* nothing else */}
        </mesh>
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
