import React, { useMemo } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { Environment, ContactShadows, useTexture } from "@react-three/drei";

/**
 * Photoreal KonarCard (3D)
 * - Real thickness
 * - Front logo texture
 * - Back QR texture
 * - Real lighting + contact shadow
 *
 * Props:
 *  - logoSrc: string (image url, can be objectURL)
 *  - qrSrc: string (static QR png)
 */
export default function PlasticCard3D({ logoSrc, qrSrc }) {
    return (
        <div style={{ width: "100%", height: "520px" }}>
            <Canvas
                dpr={[1, 2]}
                camera={{ position: [0, 0.35, 1.35], fov: 38 }}
                gl={{ antialias: true, alpha: true }}
            >
                <color attach="background" args={["transparent"]} />

                {/* Lights */}
                <ambientLight intensity={0.55} />
                <directionalLight position={[2, 3, 2]} intensity={1.15} castShadow />
                <directionalLight position={[-2, 1, -2]} intensity={0.55} />

                {/* Nice studio env */}
                <Environment preset="studio" />

                <CardMesh logoSrc={logoSrc} qrSrc={qrSrc} />

                {/* Soft shadow under the card */}
                <ContactShadows
                    position={[0, -0.37, 0]}
                    opacity={0.38}
                    blur={1.6}
                    scale={2.2}
                    far={2}
                />
            </Canvas>
        </div>
    );
}

function CardMesh({ logoSrc, qrSrc }) {
    // Card size in meters-ish (doesn't matter, just consistent)
    const w = 0.95;
    const h = w * (54 / 85.6);
    const t = 0.03; // thickness

    // Rounded edges
    const geometry = useMemo(() => {
        const shape = roundedRectShape(w, h, 0.06);
        const extrude = new THREE.ExtrudeGeometry(shape, {
            depth: t,
            bevelEnabled: true,
            bevelThickness: 0.01,
            bevelSize: 0.012,
            bevelSegments: 8,
            curveSegments: 18,
            steps: 1,
        });

        // Center geometry around origin (important for rotation)
        extrude.center();
        return extrude;
    }, []);

    // Load textures
    const [logoTex, qrTex] = useTexture([logoSrc, qrSrc]);

    // Better texture sampling
    [logoTex, qrTex].forEach((tex) => {
        tex.anisotropy = 8;
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.needsUpdate = true;
    });

    const materials = useMemo(() => {
        // White plastic base (slight sheen)
        const base = new THREE.MeshPhysicalMaterial({
            color: "#ffffff",
            roughness: 0.35,
            metalness: 0.0,
            clearcoat: 0.6,
            clearcoatRoughness: 0.25,
            sheen: 0.15,
            sheenRoughness: 0.7,
        });

        // Edges slightly darker to feel thick
        const edge = new THREE.MeshPhysicalMaterial({
            color: "#f2f2f2",
            roughness: 0.45,
            metalness: 0.0,
            clearcoat: 0.4,
            clearcoatRoughness: 0.35,
        });

        // Front face: logo decal look (texture on top)
        const front = new THREE.MeshPhysicalMaterial({
            color: "#ffffff",
            roughness: 0.35,
            metalness: 0.0,
            clearcoat: 0.6,
            clearcoatRoughness: 0.25,
            map: logoTex,
            transparent: true,
        });

        // Back face: QR texture
        const back = new THREE.MeshPhysicalMaterial({
            color: "#ffffff",
            roughness: 0.35,
            metalness: 0.0,
            clearcoat: 0.6,
            clearcoatRoughness: 0.25,
            map: qrTex,
            transparent: true,
        });

        // ExtrudeGeometry groups:
        // 0: front, 1: back, 2+: sides (depends on bevel/shape)
        // We'll use an array: [front, back, edge]
        return [front, back, edge];
    }, [logoTex, qrTex]);

    return (
        <group>
            <mesh
                geometry={geometry}
                material={materials}
                castShadow
                receiveShadow
                rotation={[0.08, 0.7, 0.02]}
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
