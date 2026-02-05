// src/pages/website/products/PlasticCard3D.jsx
import React, { useMemo } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment, useTexture } from "@react-three/drei";

import "../../../styling/products/plasticcard3d.css";

export default function PlasticCard3D({ logoSrc, qrSrc, logoSize = 44 }) {
    return (
        <div className="pc3d">
            <Canvas
                dpr={[1, 2]}
                camera={{ position: [0, 0.35, 1.35], fov: 38 }}
                gl={{ antialias: true, alpha: true, premultipliedAlpha: false }}
                onCreated={({ gl }) => {
                    gl.setClearColor(0x000000, 0);
                    gl.outputColorSpace = THREE.SRGBColorSpace;
                }}
            >
                {/* Lights */}
                <ambientLight intensity={0.55} />
                <directionalLight position={[2, 3, 2]} intensity={1.05} castShadow />
                <directionalLight position={[-2, 1, -2]} intensity={0.45} />

                <Environment preset="studio" />

                <CardMesh logoSrc={logoSrc} qrSrc={qrSrc} logoSize={logoSize} />

                <ContactShadows position={[0, -0.37, 0]} opacity={0.38} blur={1.6} scale={2.2} far={2} />
            </Canvas>
        </div>
    );
}

function CardMesh({ logoSrc, qrSrc, logoSize }) {
    const w = 0.95;
    const h = w * (54 / 85.6);

    // Slightly thinner + softer bevel
    const t = 0.026;

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
    }, []);

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

    const materials = useMemo(() => {
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

    // scale the logo texture (keep centered)
    useMemo(() => {
        const s = Math.max(28, Math.min(70, Number(logoSize || 44))) / 100;
        logoTex.center.set(0.5, 0.5);
        logoTex.repeat.set(s, s);
        logoTex.offset.set(0.5 - s / 2, 0.5 - s / 2);
        logoTex.needsUpdate = true;
    }, [logoTex, logoSize]);

    return (
        <group>
            <mesh geometry={geometry} material={materials} castShadow receiveShadow rotation={[0.08, 0.7, 0.02]} />
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
