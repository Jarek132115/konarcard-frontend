// frontend/src/components/PlasticCard3D.jsx
import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, useTexture } from "@react-three/drei";

import "../styling/products/plasticcard3d.css";

/**
 * ✅ CRITICAL SAFETY:
 * useTexture MUST NEVER receive undefined / "" / null,
 * otherwise it throws "Could not load undefined" and your page crash-loops.
 */
const TRANSPARENT_1PX =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO9qWZkAAAAASUVORK5CYII=";

const safeTexSrc = (src) => {
    const s = (src ?? "").toString().trim();
    return s ? s : TRANSPARENT_1PX;
};

export default function PlasticCard3D({ logoSrc, qrSrc, logoSize = 44 }) {
    const safeLogo = safeTexSrc(logoSrc);
    const safeQr = safeTexSrc(qrSrc);

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
                    <CardMesh logoSrc={safeLogo} qrSrc={safeQr} logoSize={logoSize} />
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

function CardMesh({ logoSrc, qrSrc, logoSize }) {
    const w = 0.92;
    const h = w * (54 / 85.6);
    const t = 0.010;

    const bodyGeo = useMemo(() => {
        const shape = roundedRectShape(w, h, 0.06);
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

    // ✅ Now ALWAYS valid strings (never undefined)
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
            <mesh geometry={bodyGeo} material={edgeMat} castShadow receiveShadow />

            <mesh geometry={logoPlaneGeo} material={logoMat} position={[0, 0, zFront]} castShadow receiveShadow />

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
