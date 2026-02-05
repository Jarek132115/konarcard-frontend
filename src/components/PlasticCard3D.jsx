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
                camera={{ position: [0, 0.18, 1.08], fov: 38 }}
                gl={{ antialias: true, alpha: true, premultipliedAlpha: false }}
                onCreated={({ gl }) => {
                    gl.setClearColor(0x000000, 0);
                    gl.outputColorSpace = THREE.SRGBColorSpace;
                    gl.domElement.style.touchAction = "none";
                }}
            >
                {/* Lights */}
                <ambientLight intensity={0.75} />
                <directionalLight position={[2, 3, 2]} intensity={1.05} castShadow />
                <directionalLight position={[-2, 1, -2]} intensity={0.55} />

                <Environment preset="studio" />

                {/* Drag + idle spin controller */}
                <CardRig>
                    <CardMesh logoSrc={logoSrc} qrSrc={qrSrc} logoSize={logoSize} />
                </CardRig>

                <ContactShadows
                    position={[0, -0.37, 0]}
                    opacity={0.34}
                    blur={1.8}
                    scale={2.2}
                    far={2}
                />
            </Canvas>
        </div>
    );
}

/**
 * Drag to rotate + slow idle spin (like your old “premium” feel)
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

            // ✅ slow idle spin
            drag.current.ry += 0.11 * dt * 60;

            // subtle “breathe”
            const breathe = Math.sin(drag.current.t * 1.1) * 0.025;
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
        >
            {children}
        </group>
    );
}

function CardMesh({ logoSrc, qrSrc, logoSize }) {
    // real card proportion (85.6 × 54)
    const w = 0.92;
    const h = w * (54 / 85.6);

    // ✅ thin plastic thickness
    const t = 0.012;

    const geometry = useMemo(() => {
        const shape = roundedRectShape(w, h, 0.06);
        const extrude = new THREE.ExtrudeGeometry(shape, {
            depth: t,
            bevelEnabled: true,
            bevelThickness: 0.0035,
            bevelSize: 0.005,
            bevelSegments: 6,
            curveSegments: 18,
            steps: 1,
        });

        extrude.center();
        return extrude;
    }, [w, h, t]);

    // load source images
    const [logoTexRaw, qrTexRaw] = useTexture([logoSrc, qrSrc]);

    // ✅ create 2 canvas textures (front/back), then draw logo/qr at exact sizes
    const { frontCanvasTex, backCanvasTex, frontCanvas, backCanvas } = useMemo(() => {
        const make = () => {
            const canvas = document.createElement("canvas");
            // higher res = sharper
            canvas.width = 1024;
            canvas.height = 648; // matches card aspect ratio-ish
            const tex = new THREE.CanvasTexture(canvas);
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.anisotropy = 12;
            tex.wrapS = THREE.ClampToEdgeWrapping;
            tex.wrapT = THREE.ClampToEdgeWrapping;
            tex.minFilter = THREE.LinearMipmapLinearFilter;
            tex.magFilter = THREE.LinearFilter;
            return { canvas, tex };
        };

        const a = make();
        const b = make();

        return {
            frontCanvas: a.canvas,
            frontCanvasTex: a.tex,
            backCanvas: b.canvas,
            backCanvasTex: b.tex,
        };
    }, []);

    // helper: draw centered image at target height ratio
    const drawCentered = (ctx, img, targetHeightPx, canvasW, canvasH) => {
        if (!img || !img.width || !img.height) return;

        const scale = targetHeightPx / img.height;
        const dw = img.width * scale;
        const dh = img.height * scale;

        const x = (canvasW - dw) / 2;
        const y = (canvasH - dh) / 2;

        // smooth edges
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, x, y, dw, dh);
    };

    // redraw textures whenever images/slider change
    useEffect(() => {
        const drawFace = (canvas, tex, img, heightRatio) => {
            const ctx = canvas.getContext("2d");
            const cw = canvas.width;
            const ch = canvas.height;

            // solid white face background
            ctx.clearRect(0, 0, cw, ch);
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, cw, ch);

            // padding zone so it never touches edges
            const pad = Math.round(ch * 0.10);
            const usableH = ch - pad * 2;

            const targetH = usableH * heightRatio;

            drawCentered(ctx, img, targetH, cw, ch);

            tex.needsUpdate = true;
        };

        // logo: base 55% height, slider scales around that
        const sliderFactor = Math.max(0.6, Math.min(1.6, Number(logoSize || 44) / 44));
        const logoHeightRatio = Math.max(0.25, Math.min(0.75, 0.55 * sliderFactor));

        // qr: fixed 45% height
        const qrHeightRatio = 0.45;

        // if textures are loaded, their .image is ready
        const logoImg = logoTexRaw?.image;
        const qrImg = qrTexRaw?.image;

        drawFace(frontCanvas, frontCanvasTex, logoImg, logoHeightRatio);
        drawFace(backCanvas, backCanvasTex, qrImg, qrHeightRatio);
    }, [
        logoTexRaw,
        qrTexRaw,
        logoSize,
        frontCanvas,
        backCanvas,
        frontCanvasTex,
        backCanvasTex,
    ]);

    const materials = useMemo(() => {
        // sides/bevel: keep white + tiny emissive so they never go “black”
        const edge = new THREE.MeshPhysicalMaterial({
            color: "#ffffff",
            roughness: 0.55,
            metalness: 0.0,
            clearcoat: 0.35,
            clearcoatRoughness: 0.35,
            emissive: new THREE.Color("#0a0a0a"),
            emissiveIntensity: 0.06,
        });

        const front = new THREE.MeshPhysicalMaterial({
            color: "#ffffff",
            roughness: 0.38,
            metalness: 0.0,
            clearcoat: 0.5,
            clearcoatRoughness: 0.28,
            map: frontCanvasTex,
            transparent: false,
        });

        const back = new THREE.MeshPhysicalMaterial({
            color: "#ffffff",
            roughness: 0.38,
            metalness: 0.0,
            clearcoat: 0.5,
            clearcoatRoughness: 0.28,
            map: backCanvasTex,
            transparent: false,
        });

        // Extrude groups: 0 front, 1 back, 2+ sides
        return [front, back, edge];
    }, [frontCanvasTex, backCanvasTex]);

    return (
        <mesh geometry={geometry} material={materials} castShadow receiveShadow position={[0, 0, 0]} />
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
