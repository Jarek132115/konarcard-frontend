// frontend/src/components/KonarTag3D.jsx
import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, useTexture } from "@react-three/drei";

import "../styling/products/konartag3d.css";

/**
 * ✅ CRITICAL SAFETY:
 * useTexture MUST NEVER receive undefined / "" / null
 * otherwise it throws "Could not load undefined" and your page crash-loops.
 */
const TRANSPARENT_1PX =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO9qWZkAAAAASUVORK5CYII=";

const safeTexSrc = (src) => {
    const s = (src ?? "").toString().trim();
    return s ? s : TRANSPARENT_1PX;
};

export default function KonarTag3D({ logoSrc, qrSrc, logoSize = 44, finish = "black" }) {
    const safeLogo = safeTexSrc(logoSrc);
    const safeQr = safeTexSrc(qrSrc);

    return (
        <div className="kt3d">
            <Canvas
                dpr={[1, 2]}
                camera={{ position: [0, 0.20, 1.32], fov: 36 }}
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
                <ambientLight intensity={0.72} />
                <directionalLight position={[2.8, 3.6, 2.6]} intensity={1.18} castShadow />
                <directionalLight position={[-2, 1.1, -2]} intensity={0.55} />

                <Environment preset="studio" />

                <TagRig>
                    <TagMesh logoSrc={safeLogo} qrSrc={safeQr} logoSize={logoSize} finish={finish} />
                </TagRig>

                <ContactShadows position={[0, -0.52, 0]} opacity={0.28} blur={2.2} scale={2.6} far={3} />
            </Canvas>
        </div>
    );
}

/**
 * Drag rotate + slow idle spin (same speed as PlasticCard3D)
 */
function TagRig({ children }) {
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

function TagMesh({ logoSrc, qrSrc, logoSize, finish }) {
    const w = 0.84;
    const h = w * 0.86;
    const t = 0.014;

    const holeR = w * 0.088;
    const holeY = h * 0.30;

    const bodyGeo = useMemo(() => {
        const shape = tagShape(w, h, holeR, holeY);
        const geo = new THREE.ExtrudeGeometry(shape, {
            depth: t,
            bevelEnabled: true,
            bevelThickness: 0.0032,
            bevelSize: 0.0065,
            bevelSegments: 10,
            curveSegments: 36,
            steps: 1,
        });
        geo.center();
        return geo;
    }, [w, h, t, holeR, holeY]);

    // ✅ safeLogo/safeQr already guaranteed valid strings
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

    const artY = -h * 0.08;

    const logoPlaneDims = useMemo(() => {
        const baseH = h * 0.46;
        const s = Math.max(28, Math.min(70, Number(logoSize || 44))) / 44;
        const planeH = Math.min(h * 0.62, Math.max(h * 0.16, baseH * (0.58 + (s - 1) * 0.25)));

        const img = logoTex?.image;
        const aspect = img && img.width && img.height ? img.width / img.height : 1;

        const maxW = w * 0.78;
        const planeW = Math.min(maxW, planeH * aspect);

        return { planeW, planeH };
    }, [logoTex, w, h, logoSize]);

    const qrPlaneDims = useMemo(() => {
        const plane = Math.min(h * 0.50, Math.max(h * 0.18, h * 0.42));
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

    const metalMat = useMemo(() => {
        const isGold = String(finish).toLowerCase() === "gold";
        const base = isGold ? "#b38a2f" : "#101318";
        const rough = isGold ? 0.22 : 0.30;

        const m = new THREE.MeshPhysicalMaterial({
            color: base,
            metalness: 1.0,
            roughness: rough,
            clearcoat: 0.6,
            clearcoatRoughness: 0.22,
        });
        m.envMapIntensity = isGold ? 1.35 : 1.15;
        return m;
    }, [finish]);

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
            <mesh geometry={bodyGeo} material={metalMat} castShadow receiveShadow />
            <mesh geometry={logoPlaneGeo} material={logoMat} position={[0, artY, zFront]} castShadow receiveShadow />
            <mesh
                geometry={qrPlaneGeo}
                material={qrMat}
                position={[0, artY, zBack]}
                rotation={[0, Math.PI, 0]}
                castShadow
                receiveShadow
            />
        </group>
    );
}

function tagShape(w, h, holeR, holeY) {
    const shape = new THREE.Shape();
    const x = -w / 2;
    const y = -h / 2;

    const topR = w * 0.22;
    const botR = w * 0.16;
    const pinch = w * 0.06;

    shape.moveTo(x + botR, y);

    shape.lineTo(x + w - botR, y);
    shape.quadraticCurveTo(x + w, y, x + w, y + botR);

    shape.lineTo(x + w, y + h * 0.44);
    shape.quadraticCurveTo(x + w - pinch, y + h * 0.55, x + w, y + h * 0.66);

    shape.lineTo(x + w, y + h - topR);
    shape.quadraticCurveTo(x + w, y + h, x + w - topR, y + h);

    shape.lineTo(x + topR, y + h);
    shape.quadraticCurveTo(x, y + h, x, y + h - topR);

    shape.lineTo(x, y + h * 0.66);
    shape.quadraticCurveTo(x + pinch, y + h * 0.55, x, y + h * 0.44);

    shape.lineTo(x, y + botR);
    shape.quadraticCurveTo(x, y, x + botR, y);

    const hole = new THREE.Path();
    hole.absellipse(0, holeY, holeR, holeR, 0, Math.PI * 2, false, 0);
    shape.holes.push(hole);

    return shape;
}
