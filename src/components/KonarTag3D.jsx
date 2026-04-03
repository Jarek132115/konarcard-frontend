import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, useTexture } from "@react-three/drei";

import "../styling/products/plasticcard3d.css";
import LogoIcon from "../assets/icons/Logo-Icon.svg";
import LogoIconWhite from "../assets/icons/Logo-Icon-White.svg";
import KonarTagNFC from "../assets/icons/KonarTagNFC.svg";

const TRANSPARENT_1PX =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO9qWZkAAAAASUVORK5CYII=";

const safeTexSrc = (src) => {
    const s = (src ?? "").toString().trim();
    return s ? s : TRANSPARENT_1PX;
};

export default function KonarTag3D({
    finish = "white",
    interactive = true,
    autoRotate = true,
    autoRotateSpeed = 0.68,
    rotationOffset = 0,
    stageClassName = "",
    compact = false,
}) {
    const isBlack = String(finish).toLowerCase() === "black";

    const fixedFrontLogo = safeTexSrc(isBlack ? LogoIconWhite : LogoIcon);
    const fixedBackIcon = safeTexSrc(KonarTagNFC);

    return (
        <div
            className={`pc3d ${compact ? "pc3d--compact" : ""} ${interactive ? "pc3d--interactive" : "pc3d--locked"
                } ${stageClassName}`.trim()}
            aria-label="3D KonarTag preview"
        >
            <div className="pc3d__stage">
                <Canvas
                    dpr={[1, 2]}
                    camera={{ position: [0, 0.12, 1.18], fov: 31 }}
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
                        gl.toneMappingExposure = 1.04;
                        gl.domElement.style.touchAction = interactive ? "none" : "auto";
                    }}
                >
                    <ambientLight intensity={0.95} />
                    <directionalLight position={[2.8, 3.3, 2.5]} intensity={1.15} />
                    <directionalLight position={[-2.1, 1.5, -2.1]} intensity={0.5} />
                    <directionalLight position={[0.2, -1.2, 1.7]} intensity={0.1} />

                    <Environment preset="studio" />

                    <ResponsiveRig compact={compact}>
                        <TagRig
                            interactive={interactive}
                            autoRotate={autoRotate}
                            autoRotateSpeed={autoRotateSpeed}
                            rotationOffset={rotationOffset}
                        >
                            <group position={[0, compact ? 0.025 : -0.01, 0]}>
                                <TagMesh
                                    frontLogoSrc={fixedFrontLogo}
                                    backIconSrc={fixedBackIcon}
                                    isBlack={isBlack}
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
                    ? 0.98
                    : w >= 1200
                        ? 0.95
                        : w >= 980
                            ? 0.92
                            : w >= 720
                                ? 0.89
                                : w >= 520
                                    ? 0.86
                                    : 0.83;
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
        baseRX: 0.08,
        baseRY: 0.74 + rotationOffset,
        rx: 0.08,
        ry: 0.74 + rotationOffset,
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

            const breathe = Math.sin(drag.current.t * 1.02) * 0.02;
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
            0.012,
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

function TagMesh({ frontLogoSrc, backIconSrc, isBlack }) {
    const cardW = 0.92;
    const cardH = cardW * (54 / 85.6);

    const diameter = cardH;
    const bodyThickness = 0.06;
    const faceInsetScale = 0.9;

    const bodyGeo = useMemo(() => {
        const shape = circleShape(diameter);
        const geo = new THREE.ExtrudeGeometry(shape, {
            depth: bodyThickness,
            bevelEnabled: true,
            bevelThickness: 0.003,
            bevelSize: 0.0045,
            bevelSegments: 16,
            curveSegments: 48,
            steps: 1,
        });
        geo.center();
        geo.computeVertexNormals();
        return geo;
    }, [diameter, bodyThickness]);

    const faceGeo = useMemo(
        () => new THREE.CircleGeometry((diameter * faceInsetScale) / 2, 64),
        [diameter]
    );

    const [frontLogoTex, backIconTex] = useTexture([frontLogoSrc, backIconSrc]);

    useEffect(() => {
        const setupColorTexture = (tex) => {
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

        setupColorTexture(frontLogoTex);
        setupColorTexture(backIconTex);
    }, [frontLogoTex, backIconTex]);

    const iconPlaneSize = useMemo(() => diameter * 0.3, [diameter]);

    const iconPlaneGeo = useMemo(
        () => new THREE.PlaneGeometry(iconPlaneSize, iconPlaneSize),
        [iconPlaneSize]
    );

    const bodyMat = useMemo(() => {
        const m = new THREE.MeshPhysicalMaterial({
            color: "#bcc4ce",
            roughness: 0.16,
            metalness: 1,
            clearcoat: 0.28,
            clearcoatRoughness: 0.1,
            specularIntensity: 1,
            specularColor: new THREE.Color("#ffffff"),
        });
        m.envMapIntensity = 1.75;
        return m;
    }, []);

    const faceMat = useMemo(() => {
        const m = new THREE.MeshPhysicalMaterial({
            color: isBlack ? "#06080d" : "#ffffff",
            roughness: isBlack ? 0.28 : 0.18,
            metalness: 0.02,
            clearcoat: 0.55,
            clearcoatRoughness: isBlack ? 0.16 : 0.12,
        });
        m.envMapIntensity = isBlack ? 0.42 : 0.2;
        return m;
    }, [isBlack]);

    const frontLogoMat = useMemo(() => {
        const m = new THREE.MeshBasicMaterial({
            map: frontLogoTex || null,
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
    }, [frontLogoTex]);

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

    const halfT = bodyThickness / 2;
    const faceFrontZ = halfT + 0.0015;
    const faceBackZ = -halfT - 0.0015;
    const iconFrontZ = halfT + 0.004;
    const iconBackZ = -halfT - 0.004;

    return (
        <group>
            <mesh geometry={bodyGeo} material={bodyMat} />

            <mesh
                geometry={faceGeo}
                material={faceMat}
                position={[0, 0, faceFrontZ]}
            />

            <mesh
                geometry={faceGeo}
                material={faceMat}
                position={[0, 0, faceBackZ]}
                rotation={[0, Math.PI, 0]}
            />

            <mesh
                geometry={iconPlaneGeo}
                material={frontLogoMat}
                position={[0, 0, iconFrontZ]}
            />

            <mesh
                geometry={iconPlaneGeo}
                material={backIconMat}
                position={[0, 0, iconBackZ]}
                rotation={[0, Math.PI, 0]}
            />
        </group>
    );
}

function circleShape(size) {
    const shape = new THREE.Shape();
    shape.absarc(0, 0, size / 2, 0, Math.PI * 2, false);
    return shape;
}