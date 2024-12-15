import { Canvas } from '@react-three/fiber';
import { Box, Float, SpotLight, ContactShadows, Environment, OrbitControls, MeshTransmissionMaterial, Preload } from '@react-three/drei';
import { Suspense, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import * as THREE from 'three';

function AnimatedCan() {
    const canRef = useRef<THREE.Mesh>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // Mark component as ready for animation
        setIsReady(true);
    }, []);

    useEffect(() => {
        if (!canRef.current || !isReady) return;

        // Reset initial position and rotation
        canRef.current.position.y = -5;
        canRef.current.rotation.y = 0;
        canRef.current.scale.set(0, 0, 0);

        // Create animation timeline
        const tl = gsap.timeline({
            defaults: { duration: 2, ease: "elastic.out(1, 0.8)" }
        });

        // Entrance animation sequence
        tl.to(canRef.current.position, {
            y: 0,
            duration: 2.5,
            ease: "power3.out"
        })
            .to(canRef.current.scale, {
                x: 1,
                y: 1,
                z: 1,
                duration: 2,
                ease: "elastic.out(1, 0.8)"
            }, "<0.2")
            .to(canRef.current.rotation, {
                y: Math.PI * 2,
                duration: 2.5,
                ease: "power2.inOut"
            }, "<0.4");

        return () => {
            tl.kill();
            gsap.killTweensOf(canRef.current.rotation);
        };
    }, [isReady]);

    return (
        <Float
            speed={2}
            rotationIntensity={0.2}
            floatIntensity={0.5}
            floatingRange={[-0.1, 0.1]}
        >
            <Box
                ref={canRef}
                args={[0.54, 1.23, 0.54]}
                position={[0, 0, 0]}
                castShadow
                receiveShadow
            >
                <MeshTransmissionMaterial
                    backside
                    samples={4}
                    thickness={0.5}
                    chromaticAberration={0.2}
                    anisotropy={0.1}
                    distortion={0.2}
                    distortionScale={0.1}
                    temporalDistortion={0.1}
                    metalness={0.9}
                    roughness={0.1}
                    envMapIntensity={1}
                    clearcoat={1}
                    clearcoatRoughness={0.1}
                    ior={1.5}
                    color="#ffffff"
                />
            </Box>
        </Float>
    );
}

// Preload component to handle scene initialization
function SceneContent() {
    return (
        <>
            <Environment preset="studio" />
            <ambientLight intensity={0.5} />

            <SpotLight
                position={[5, 5, 2]}
                angle={0.4}
                penumbra={0.8}
                intensity={1}
                distance={6}
                castShadow
                shadow-bias={-0.0001}
                shadow-mapSize={[2048, 2048]}
                color="#ffffff"
            />

            <SpotLight
                position={[-5, 3, 2]}
                angle={0.5}
                penumbra={1}
                intensity={0.5}
                distance={6}
                color="#b1e1ff"
            />

            <SpotLight
                position={[0, 2, -5]}
                angle={0.5}
                penumbra={0.8}
                intensity={0.8}
                distance={6}
                color="#ffffff"
            />

            <ContactShadows
                position={[0, -3, 0]}
                opacity={0.4}
                scale={20}
                blur={2}
                far={4}
                resolution={512}
                color="#000000"
            />

            <AnimatedCan />

            {/* Preload all scene assets */}
            <Preload all />
        </>
    );
}

export default function Scene() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isCanvasReady, setIsCanvasReady] = useState(false);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        if (!containerRef.current) return;

        // Initial size measurement
        setDimensions({
            width: containerRef.current.clientWidth,
            height: containerRef.current.clientHeight
        });

        // Set up resize observer
        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setDimensions({
                    width: entry.contentRect.width,
                    height: entry.contentRect.height
                });
            }
        });

        resizeObserver.observe(containerRef.current);

        // Cleanup
        return () => resizeObserver.disconnect();
    }, []);

    useEffect(() => {
        if (!containerRef.current) return;

        gsap.set(containerRef.current, {
            opacity: 0,
        });

        gsap.to(containerRef.current, {
            opacity: 1,
            duration: 1.2,
            ease: "power4.out"
        });
    }, []);

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 w-full h-full overflow-hidden m-0 p-0"
            style={{
                willChange: 'transform, opacity',
                background: 'radial-gradient(circle at center, #1a1a1a 0%, #000000 100%)',
                margin: 0,
                padding: 0
            }}
        >
            {dimensions.width > 0 && dimensions.height > 0 && (
                <Canvas
                    shadows
                    camera={{ position: [-2, 1, 4], fov: 35 }}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        touchAction: 'none',
                        display: 'block',
                        width: `${dimensions.width}px`,
                        height: `${dimensions.height}px`,
                        margin: 0,
                        padding: 0
                    }}
                    gl={{
                        antialias: true,
                        toneMapping: THREE.ACESFilmicToneMapping,
                        toneMappingExposure: 1.5,
                        powerPreference: "high-performance"
                    }}
                    onCreated={() => setIsCanvasReady(true)}
                    performance={{ min: 0.5 }}
                >
                    <color attach="background" args={['#000000']} />
                    <fog attach="fog" args={['#000000', 5, 15]} />

                    <Suspense fallback={null}>
                        <SceneContent />
                    </Suspense>
                </Canvas>
            )}
        </div>
    );
} 