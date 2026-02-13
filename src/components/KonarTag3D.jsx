// frontend/src/components/KonarTag3D.jsx
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

export default function KonarTag3D({ logoSrc, qrSrc, logoSize = 70, finish = "black" }) {
    const safeLogo = safeTexSrc(logoSrc);
    const safeQr = safeTexSrc(qrSrc);

    return (
        <div className="pc3d" aria-label="3D KonarTag preview">
            <div className="pc3d__stage">
                <Canvas
                    dpr={[1, 2]}
                    camera={{ position: [0, 0.24, 1.62], fov: 34 }}
                    gl={{
                        antialias: true,
                        alpha: true,
                        premultipliedAlpha: false,
                        powerPreference: "high-performance",
                    }}
                    onCreated={({ gl }) => {
                        gl.setClearColor(0x000000, 0);
                        gl.outputColorSpace = THREE.SRGBColorSpace;

                        // ✅ keeps gold bright + not muddy
                        gl.toneMapping = THREE.ACESFilmicToneMapping;
                        gl.toneMappingExposure = 1.25;

                        gl.domElement.style.touchAction = "none";
                    }}
                >
                    <ambientLight intensity={1.05} />
                    <directionalLight position={[3.2, 3.6, 2.6]} intensity={1.4} />
                    <directionalLight position={[-3.4, 2.4, 2.1]} intensity={1.0} />
                    <directionalLight position={[0, 1.8, -3.2]} intensity={0.85} />

                    <Environment preset="warehouse" />

                    <ResponsiveRig>
                        <TagRig>
                            <group position={[0, -0.01, 0]}>
                                <TagMesh logoSrc={safeLogo} qrSrc={safeQr} logoSize={logoSize} finish={finish} />
                            </group>
                        </TagRig>
                    </ResponsiveRig>
                </Canvas>
            </div>
        </div>
    );
}

/** ✅ same scale breakpoints as Plastic/Metal */
function ResponsiveRig({ children }) {
    const g = useRef();
    const { size } = useThree();

    useEffect(() => {
        if (!g.current) return;
        const w = size.width;

        const scale =
            w >= 1400 ? 0.96 :
                w >= 1200 ? 0.94 :
                    w >= 980 ? 0.92 :
                        w >= 720 ? 0.88 :
                            w >= 520 ? 0.84 :
                                0.80;

        g.current.scale.setScalar(scale);
    }, [size.width]);

    return <group ref={g}>{children}</group>;
}

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

        const gainX = 0.0064;
        const gainY = 0.0046;

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
    // tag is slightly smaller than card, but we keep the same overall canvas sizing
    const w = 0.86;
    const h = w * 0.96;
    const t = 0.014;

    const holeR = w * 0.09;
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

    // art area slightly below center (feels like a real tag)
    const artY = -h * 0.06;

    const logoPlaneDims = useMemo(() => {
        const desiredH = h * 0.46;
        const maxW = w * 0.74;

        const clamped = Math.max(60, Math.min(80, Number(logoSize || 70)));
        const s = clamped / 70;

        const scaledH = desiredH * (s * 0.72);

        const img = logoTex?.image;
        const aspect = img && img.width && img.height ? img.width / img.height : 1;

        const planeH = Math.min(h * 0.62, Math.max(h * 0.18, scaledH));
        const planeW = Math.min(maxW, planeH * aspect);

        return { planeW, planeH };
    }, [logoTex, w, h, logoSize]);

    const qrPlaneDims = useMemo(() => {
        const plane = Math.min(h * 0.50, Math.max(h * 0.18, h * 0.42));
        return { planeW: plane, planeH: plane };
    }, [h]);

    const logoPlaneGeo = useMemo(() => new THREE.PlaneGeometry(logoPlaneDims.planeW, logoPlaneDims.planeH), [logoPlaneDims]);
    const qrPlaneGeo = useMemo(() => new THREE.PlaneGeometry(qrPlaneDims.planeW, qrPlaneDims.planeH), [qrPlaneDims]);

    const metalPreset = useMemo(() => {
        const f = String(finish).toLowerCase();
        if (f === "gold") {
            return {
                base: "#d6b24a",
                edge: "#e1c36a",
                roughness: 0.16,
                metalness: 1.0,
                clearcoat: 0.42,
                clearcoatRoughness: 0.12,
                env: 2.2,
                specularIntensity: 0.95,
                specularColor: "#fff4c8",
            };
        }
        return {
            base: "#14171c",
            edge: "#1c2027",
            roughness: 0.26,
            metalness: 1.0,
            clearcoat: 0.28,
            clearcoatRoughness: 0.22,
            env: 1.55,
            specularIntensity: 0.75,
            specularColor: "#ffffff",
        };
    }, [finish]);

    const bodyMat = useMemo(() => {
        const m = new THREE.MeshPhysicalMaterial({
            color: metalPreset.base,
            roughness: metalPreset.roughness,
            metalness: metalPreset.metalness,
            clearcoat: metalPreset.clearcoat,
            clearcoatRoughness: metalPreset.clearcoatRoughness,
            specularIntensity: metalPreset.specularIntensity,
            specularColor: new THREE.Color(metalPreset.specularColor),
        });
        m.envMapIntensity = metalPreset.env;
        return m;
    }, [metalPreset]);

    const edgeMat = useMemo(() => {
        const m = new THREE.MeshPhysicalMaterial({
            color: metalPreset.edge,
            roughness: Math.min(0.5, metalPreset.roughness + 0.08),
            metalness: metalPreset.metalness,
            clearcoat: metalPreset.clearcoat,
            clearcoatRoughness: metalPreset.clearcoatRoughness,
            specularIntensity: metalPreset.specularIntensity,
            specularColor: new THREE.Color(metalPreset.specularColor),
        });
        m.envMapIntensity = metalPreset.env;
        return m;
    }, [metalPreset]);

    // ✅ front-only (no bleed), like Plastic/Metal
    const logoMat = useMemo(() => {
        const m = new THREE.MeshBasicMaterial({
            map: logoTex || null,
            transparent: true,
            opacity: 1,
            toneMapped: false,
            side: THREE.FrontSide,
            depthTest: true,
            depthWrite: false,
        });
        m.alphaTest = 0.02;
        m.polygonOffset = true;
        m.polygonOffsetFactor = -6;
        m.polygonOffsetUnits = -6;
        return m;
    }, [logoTex]);

    const qrMat = useMemo(() => {
        const m = new THREE.MeshBasicMaterial({
            map: qrTex || null,
            transparent: true,
            opacity: 1,
            toneMapped: false,
            side: THREE.FrontSide,
            depthTest: true,
            depthWrite: false,
        });
        m.alphaTest = 0.02;
        m.polygonOffset = true;
        m.polygonOffsetFactor = -6;
        m.polygonOffsetUnits = -6;
        return m;
    }, [qrTex]);

    const halfT = t / 2;
    const zFront = halfT + 0.004;
    const zBack = -halfT - 0.004;

    return (
        <group>
            <mesh geometry={bodyGeo} material={bodyMat} />
            <mesh geometry={bodyGeo} material={edgeMat} />

            <mesh geometry={logoPlaneGeo} material={logoMat} position={[0, artY, zFront]} />
            <mesh geometry={qrPlaneGeo} material={qrMat} position={[0, artY, zBack]} rotation={[0, Math.PI, 0]} />
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
