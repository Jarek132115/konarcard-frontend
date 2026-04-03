import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, useTexture } from "@react-three/drei";

import "../styling/products/plasticcard3d.css";

const TRANSPARENT_1PX =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO9qWZkAAAAASUVORK5CYII=";

const NFC_ICON_WHITE_DATA_URI = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <g fill="none" stroke="#ffffff" stroke-linecap="round" stroke-linejoin="round">
    <path d="M28 74 C35 66, 41 58, 47 50" stroke-width="10"/>
    <path d="M52 84 C63 72, 70 58, 74 42" stroke-width="10"/>
    <path d="M75 90 C88 76, 96 58, 99 37" stroke-width="10"/>
    <path d="M95 95 C108 80, 115 61, 117 38" stroke-width="10"/>
  </g>
</svg>
`)}`;

const safeTexSrc = (src) => {
    const s = (src ?? "").toString().trim();
    return s ? s : TRANSPARENT_1PX;
};

export default function KonarTag3D({
    logoSrc,
    qrSrc,
    logoSize = 75,
    finish = "black",
    interactive = true,
    autoRotate = true,
    autoRotateSpeed = 0.68,
    rotationOffset = 0,
    stageClassName = "",
    compact = false,
}) {
    const safeLogo = safeTexSrc(logoSrc);
    const safeBackIcon = NFC_ICON_WHITE_DATA_URI;

    return (
        <div
            className={`pc3d ${compact ? "pc3d--compact" : ""} ${interactive ? "pc3d--interactive" : "pc3d--locked"
                } ${stageClassName}`.trim()}
            aria-label="3D KonarTag preview"
        >
            <div className="pc3d__stage">
                <Canvas
                    dpr={[1, 2]}
                    camera={{ position: [0, 0.16, 1.24], fov: 31 }}
                    gl={{
                        antialias: true,
                        alpha: true,
                        premultipliedAlpha: false,
                        powerPreference: "high-performance",
                    }}
                    onCreated={({ gl }) => {
                        gl.setClearColor(0x000000, 0);
                        gl.outputColorSpace = THREE.SRGBColorSpace;
                        gl.toneMapping = THREE.ACESFilmicToneMapping;
                        gl.toneMappingExposure = 1.08;
                        gl.domElement.style.touchAction = interactive ? "none" : "auto";
                    }}
                >
                    <ambientLight intensity={0.9} />
                    <directionalLight position={[2.8, 3.6, 2.4]} intensity={1.22} />
                    <directionalLight position={[-2.4, 1.8, -2.2]} intensity={0.64} />
                    <directionalLight position={[0.2, 2.0, -3.0]} intensity={0.34} />

                    <Environment preset="studio" />

                    <ResponsiveRig compact={compact}>
                        <TagRig
                            interactive={interactive}
                            autoRotate={autoRotate}
                            autoRotateSpeed={autoRotateSpeed}
                            rotationOffset={rotationOffset}
                        >
                            <group position={[0, compact ? 0.02 : -0.015, 0]}>
                                <KeyfobMesh
                                    logoSrc={safeLogo}
                                    backIconSrc={safeBackIcon}
                                    logoSize={logoSize}
                                    finish={finish}
                                />
                            </group>
                        </TagRig>
                    </ResponsiveRig>
                </Canvas>
            </div>
        </div>
    );
}

function ResponsiveRig({ children, compact = false }) {
    const g = useRef();
    const { size } = useThree();

    useEffect(() => {
        if (!g.current) return;
        const w = size.width;

        let scale;
        if (compact) {
            scale =
                w >= 1400
                    ? 0.96
                    : w >= 1200
                        ? 0.93
                        : w >= 980
                            ? 0.9
                            : w >= 720
                                ? 0.87
                                : w >= 520
                                    ? 0.84
                                    : 0.81;
        } else {
            scale =
                w >= 1400
                    ? 0.96
                    : w >= 1200
                        ? 0.94
                        : w >= 980
                            ? 0.92
                            : w >= 720
                                ? 0.88
                                : w >= 520
                                    ? 0.84
                                    : 0.8;
        }

        g.current.scale.setScalar(scale);
    }, [size.width, compact]);

    return <group ref={g}>{children}</group>;
}

function TagRig({
    children,
    interactive = true,
    autoRotate = true,
    autoRotateSpeed = 0.68,
    rotationOffset = 0,
}) {
    const group = useRef();

    const drag = useRef({
        isDown: false,
        startX: 0,
        startY: 0,
        baseRX: 0.11,
        baseRY: 0.62 + rotationOffset,
        rx: 0.11,
        ry: 0.62 + rotationOffset,
        idle: true,
        t: rotationOffset * 2,
    });

    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

    useFrame((_, dt) => {
        if (!group.current) return;

        if (drag.current.idle) {
            drag.current.t += dt;

            if (autoRotate) {
                drag.current.ry += autoRotateSpeed * dt;
            }

            const breathe = Math.sin(drag.current.t * 1.02) * 0.018;
            const targetRx = clamp(drag.current.baseRX + breathe, -0.55, 0.55);

            drag.current.rx = THREE.MathUtils.lerp(drag.current.rx, targetRx, 0.08);
        }

        group.current.rotation.x = THREE.MathUtils.lerp(
            group.current.rotation.x,
            drag.current.rx,
            0.1
        );
        group.current.rotation.y = THREE.MathUtils.lerp(
            group.current.rotation.y,
            drag.current.ry,
            0.1
        );
        group.current.rotation.z = THREE.MathUtils.lerp(
            group.current.rotation.z,
            0.01,
            0.08
        );
    });

    const onPointerDown = (e) => {
        if (!interactive) return;

        e.stopPropagation();
        drag.current.isDown = true;
        drag.current.idle = false;
        drag.current.startX = e.clientX;
        drag.current.startY = e.clientY;
        drag.current.baseRX = drag.current.rx;
        drag.current.baseRY = drag.current.ry;

        try {
            e.target.setPointerCapture(e.pointerId);
        } catch {
            // ignore
        }
    };

    const onPointerMove = (e) => {
        if (!interactive || !drag.current.isDown) return;

        const dx = e.clientX - drag.current.startX;
        const dy = e.clientY - drag.current.startY;

        const gainX = 0.0064;
        const gainY = 0.0046;

        drag.current.ry = drag.current.baseRY + dx * gainX;
        drag.current.rx = clamp(drag.current.baseRX - dy * gainY, -0.55, 0.55);
    };

    const onPointerUp = () => {
        if (!interactive) return;

        drag.current.isDown = false;
        drag.current.baseRX = drag.current.rx;
        drag.current.baseRY = drag.current.ry;
        drag.current.idle = true;
    };

    return (
        <group
            ref={group}
            onPointerDown={interactive ? onPointerDown : undefined}
            onPointerMove={interactive ? onPointerMove : undefined}
            onPointerUp={interactive ? onPointerUp : undefined}
            onPointerCancel={interactive ? onPointerUp : undefined}
        >
            {children}
        </group>
    );
}

function KeyfobMesh({ logoSrc, backIconSrc, logoSize, finish }) {
    const isGold = String(finish).toLowerCase() === "gold";

    const discRadius = 0.35;
    const rimThickness = 0.045;
    const epoxyFaceThickness = 0.012;
    const epoxyInset = 0.026;

    const ringRadius = 0.165;
    const ringTube = 0.016;

    const [logoTex, backIconTex] = useTexture([logoSrc, backIconSrc]);

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
        setup(backIconTex);
    }, [logoTex, backIconTex]);

    const chromeMat = useMemo(() => {
        const m = new THREE.MeshPhysicalMaterial({
            color: "#dfe4ea",
            metalness: 1,
            roughness: 0.14,
            clearcoat: 0.35,
            clearcoatRoughness: 0.08,
            envMapIntensity: 2.2,
        });
        return m;
    }, []);

    const epoxyBaseColor = isGold ? "#b08e43" : "#121826";

    const epoxyFrontMat = useMemo(() => {
        return new THREE.MeshPhysicalMaterial({
            color: epoxyBaseColor,
            roughness: 0.16,
            metalness: 0.02,
            clearcoat: 1,
            clearcoatRoughness: 0.04,
            envMapIntensity: 1.5,
        });
    }, [epoxyBaseColor]);

    const epoxyBackMat = useMemo(() => {
        return new THREE.MeshPhysicalMaterial({
            color: epoxyBaseColor,
            roughness: 0.16,
            metalness: 0.02,
            clearcoat: 1,
            clearcoatRoughness: 0.04,
            envMapIntensity: 1.5,
        });
    }, [epoxyBaseColor]);

    const logoPlaneDims = useMemo(() => {
        const d = discRadius * 2;
        const percent = Math.max(10, Math.min(100, Number(logoSize || 75))) / 100;

        let planeH = d * percent * 0.62;

        const img = logoTex?.image;
        const aspect =
            img && img.width && img.height ? img.width / img.height : 1;

        let planeW = planeH * aspect;
        const maxW = d * 0.58;
        const maxH = d * 0.34;

        if (planeH > maxH) {
            planeH = maxH;
            planeW = planeH * aspect;
        }

        if (planeW > maxW) {
            planeW = maxW;
            planeH = planeW / aspect;
        }

        return { planeW, planeH };
    }, [logoTex, discRadius, logoSize]);

    const backIconDims = useMemo(() => {
        const d = discRadius * 2;
        const plane = d * 0.28;
        return { planeW: plane, planeH: plane };
    }, [discRadius]);

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

    const backIconMat = useMemo(() => {
        const m = new THREE.MeshBasicMaterial({
            map: backIconTex || null,
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
    }, [backIconTex]);

    const frontArtZ = rimThickness / 2 + epoxyFaceThickness + 0.0015;
    const backArtZ = -rimThickness / 2 - epoxyFaceThickness - 0.0015;

    return (
        <group>
            <group position={[0, 0.02, 0]}>
                {/* main split ring */}
                <mesh
                    position={[0, 0.735, 0]}
                    rotation={[Math.PI / 2, 0, 0]}
                    material={chromeMat}
                >
                    <torusGeometry args={[ringRadius, ringTube, 24, 96]} />
                </mesh>

                {/* small jump ring */}
                <mesh
                    position={[0, 0.515, 0]}
                    rotation={[Math.PI / 2, 0, 0]}
                    material={chromeMat}
                >
                    <torusGeometry args={[0.052, 0.0105, 18, 56]} />
                </mesh>

                {/* metal strap */}
                <mesh position={[0, 0.43, 0]} material={chromeMat}>
                    <boxGeometry args={[0.084, 0.145, 0.03]} />
                </mesh>

                {/* round metal rim */}
                <mesh material={chromeMat}>
                    <cylinderGeometry args={[discRadius, discRadius, rimThickness, 96]} />
                </mesh>

                {/* front epoxy */}
                <mesh
                    position={[0, 0, rimThickness / 2 + epoxyFaceThickness * 0.55]}
                    material={epoxyFrontMat}
                >
                    <cylinderGeometry
                        args={[discRadius - epoxyInset, discRadius - epoxyInset, epoxyFaceThickness, 96]}
                    />
                </mesh>

                {/* back epoxy */}
                <mesh
                    position={[0, 0, -rimThickness / 2 - epoxyFaceThickness * 0.55]}
                    material={epoxyBackMat}
                >
                    <cylinderGeometry
                        args={[discRadius - epoxyInset, discRadius - epoxyInset, epoxyFaceThickness, 96]}
                    />
                </mesh>

                {/* front logo */}
                <mesh position={[0, 0, frontArtZ]} material={logoMat}>
                    <planeGeometry args={[logoPlaneDims.planeW, logoPlaneDims.planeH]} />
                </mesh>

                {/* back nfc icon */}
                <mesh
                    position={[0, 0, backArtZ]}
                    rotation={[0, Math.PI, 0]}
                    material={backIconMat}
                >
                    <planeGeometry args={[backIconDims.planeW, backIconDims.planeH]} />
                </mesh>

                {/* subtle front gloss */}
                <mesh position={[0, 0, rimThickness / 2 + epoxyFaceThickness + 0.0028]}>
                    <circleGeometry args={[discRadius - epoxyInset - 0.006, 96]} />
                    <meshPhysicalMaterial
                        color="#ffffff"
                        transparent
                        opacity={0.07}
                        roughness={0.04}
                        metalness={0}
                        clearcoat={1}
                        clearcoatRoughness={0.04}
                        depthWrite={false}
                    />
                </mesh>

                {/* soft diagonal shine */}
                <mesh
                    position={[0.045, 0.04, rimThickness / 2 + epoxyFaceThickness + 0.0032]}
                    rotation={[0, 0, -0.7]}
                >
                    <planeGeometry args={[0.22, 0.56]} />
                    <meshBasicMaterial
                        color="#ffffff"
                        transparent
                        opacity={0.06}
                        depthWrite={false}
                    />
                </mesh>
            </group>
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