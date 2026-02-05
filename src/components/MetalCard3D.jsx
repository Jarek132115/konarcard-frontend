import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, useTexture } from "@react-three/drei";

import "../styling/products/plasticcard3d.css";

export default function MetalCard3D({ logoSrc, qrSrc, logoSize = 44, finish = "black" }) {
    return (
        <div className="pc3d">
            <Canvas
                dpr={[1, 2]}
                camera={{ position: [0, 0.16, 1.22], fov: 36 }}
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
                <ambientLight intensity={0.78} />
                <directionalLight position={[2.3, 3.3, 2.3]} intensity={1.12} castShadow />
                <directionalLight position={[-2, 1.2, -2]} intensity={0.6} />

                <Environment preset="studio" />

                <CardRig>
                    <CardMesh logoSrc={logoSrc} qrSrc={qrSrc} logoSize={logoSize} finish={finish} />
                </CardRig>

                <ContactShadows position={[0, -0.42, 0]} opacity={0.32} blur={1.9} scale={2.35} far={2.4} />
            </Canvas>
        </div>
    );
}

/**
 * Drag rotate + slow idle spin (same feel as Plastic)
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
            drag.current.ry += 0.32 * dt;
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

function CardMesh({ logoSrc, qrSrc, logoSize, finish }) {
    const w = 0.92;
    const h = w * (54 / 85.6);

    // ✅ slightly thicker than plastic, still realistic for metal
    const t = 0.013;

    const bodyGeo = useMemo(() => {
        const shape = roundedRectShape(w, h, 0.06);
        const geo = new THREE.ExtrudeGeometry(shape, {
            depth: t,
            bevelEnabled: true,
            bevelThickness: 0.0025,
            bevelSize: 0.004,
            bevelSegments: 10,
            curveSegments: 28,
            steps: 1,
        });
        geo.center();
        return geo;
    }, [w, h, t]);

    const [logoTex, qrTex] = useTexture([logoSrc, qrSrc]);

    useEffect(() => {
        const setup = (tex) => {
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
        setup(logoTex);
        setup(qrTex);
    }, [logoTex, qrTex]);

    // planes sized the same as plastic (55% logo height / 45% QR height)
    const logoPlaneDims = useMemo(() => {
        const desiredH = h * 0.55;
        const maxW = w * 0.78;

        const s = Math.max(28, Math.min(70, Number(logoSize || 44))) / 44;
        const scaledH = desiredH * (s * 0.55);

        const img = logoTex?.image;
        const aspect = img && img.width && img.height ? img.width / img.height : 1;

        const planeH = Math.min(h * 0.70, Math.max(h * 0.18, scaledH));
        const planeW = Math.min(maxW, planeH * aspect);

        return { planeW, planeH };
    }, [logoTex, w, h, logoSize]);

    const qrPlaneDims = useMemo(() => {
        const desired = h * 0.45;
        const plane = Math.min(h * 0.62, Math.max(h * 0.18, desired));
        return { planeW: plane, planeH: plane };
    }, [h]);

    const logoPlaneGeo = useMemo(
        () => new THREE.PlaneGeometry(logoPlaneDims.planeW, logoPlaneDims.planeH),
        [logoPlaneDims]
    );

    const qrPlaneGeo = useMemo(
        () => new THREE.PlaneGeometry(qrPlaneDims.planeW, qrPlaneDims.planeH),
        [qrPlaneDims]
    );

    // ✅ metal finish presets
    const metalPreset = useMemo(() => {
        if (String(finish).toLowerCase() === "gold") {
            return {
                base: "#b88a2a",
                edge: "#caa24a",
                roughness: 0.22,
                metalness: 1.0,
                clearcoat: 0.35,
                clearcoatRoughness: 0.22,
                env: 1.35,
            };
        }
        // black metal default
        return {
            base: "#121417",
            edge: "#1a1d22",
            roughness: 0.28,
            metalness: 1.0,
            clearcoat: 0.25,
            clearcoatRoughness: 0.25,
            env: 1.25,
        };
    }, [finish]);

    // Body material (real metal look)
    const bodyMat = useMemo(() => {
        const m = new THREE.MeshPhysicalMaterial({
            color: metalPreset.base,
            roughness: metalPreset.roughness,
            metalness: metalPreset.metalness,
            clearcoat: metalPreset.clearcoat,
            clearcoatRoughness: metalPreset.clearcoatRoughness,
        });
        m.envMapIntensity = metalPreset.env;
        return m;
    }, [metalPreset]);

    // Edge material (slightly different tone for nicer bevel)
    const edgeMat = useMemo(() => {
        const m = new THREE.MeshPhysicalMaterial({
            color: metalPreset.edge,
            roughness: Math.min(0.55, metalPreset.roughness + 0.10),
            metalness: metalPreset.metalness,
            clearcoat: metalPreset.clearcoat,
            clearcoatRoughness: metalPreset.clearcoatRoughness,
        });
        m.envMapIntensity = metalPreset.env;
        return m;
    }, [metalPreset]);

    // Logo/QR always readable (not affected by lighting)
    const logoMat = useMemo(() => {
        const m = new THREE.MeshBasicMaterial({
            map: logoTex || null,
            transparent: true,
            opacity: 1,
            toneMapped: false,
        });
        m.alphaTest = 0.02;
        m.side = THREE.DoubleSide;
        m.polygonOffset = true;
        m.polygonOffsetFactor = -3;
        m.polygonOffsetUnits = -3;
        return m;
    }, [logoTex]);

    const qrMat = useMemo(() => {
        const m = new THREE.MeshBasicMaterial({
            map: qrTex || null,
            transparent: true,
            opacity: 1,
            toneMapped: false,
        });
        m.alphaTest = 0.02;
        m.side = THREE.DoubleSide;
        m.polygonOffset = true;
        m.polygonOffsetFactor = -3;
        m.polygonOffsetUnits = -3;
        return m;
    }, [qrTex]);

    const halfT = t / 2;
    const zFront = halfT + 0.002;
    const zBack = -halfT - 0.002;

    return (
        <group>
            {/* Body split: main + edges for nicer bevel contrast */}
            <mesh geometry={bodyGeo} material={bodyMat} castShadow receiveShadow />
            {/* subtle second pass edge tint (same geo, different mat, helps bevel pop) */}
            <mesh geometry={bodyGeo} material={edgeMat} castShadow receiveShadow />

            {/* Front */}
            <mesh geometry={logoPlaneGeo} material={logoMat} position={[0, 0, zFront]} castShadow receiveShadow />

            {/* Back */}
            <mesh
                geometry={qrPlaneGeo}
                material={qrMat}
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
