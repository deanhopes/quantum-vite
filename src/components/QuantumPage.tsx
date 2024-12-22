import React, { useRef, useEffect, useState, useContext } from "react"
import { Canvas, useFrame, extend } from "@react-three/fiber"
import { Suspense } from "react"
import * as THREE from "three"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import {
    Float,
    SpotLight,
    ContactShadows,
    Environment,
    Preload,
    Stars,
    Cylinder,
} from "@react-three/drei"
import { DataReadout } from "./ui/DataReadout"
import { PS1Material, PS1MaterialType } from "../shaders/PS1Material"
import { TechnicalHeader } from "./ui/TechnicalHeader"
import { InteractiveGrid } from "./ui/InteractiveGrid"
import "../styles/animations.css"
import "../styles/technical.css"
import { useControls, folder } from 'leva';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger)

// Extend Three.js with our custom material
extend({ PS1Material })

// Add proper type declarations
declare global {
    namespace JSX {
        interface IntrinsicElements {
            pS1Material: any
        }
    }
}

// Create a context for sharing scroll state
interface ScrollContextType {
    scrollProgress: number
    isHorizontalSection: boolean
}

const ScrollContext = React.createContext<ScrollContextType>({
    scrollProgress: 0,
    isHorizontalSection: false,
})

export const useScrollContext = () => useContext(ScrollContext)

function SpaceBackground() {
    const starsRef = useRef<THREE.Points>(null)

    useFrame((state) => {
        if (starsRef.current) {
            starsRef.current.rotation.y += 0.0001
            starsRef.current.rotation.x =
                Math.sin(state.clock.elapsedTime * 0.1) * 0.1
        }
    })

    return (
        <group>
            <Stars
                ref={starsRef}
                radius={50}
                depth={50}
                count={5000}
                factor={4}
                saturation={0}
                fade
                speed={1}
            />
        </group>
    )
}

// First, let's create a reusable lerp utility
const lerp = (start: number, end: number, factor: number) => {
    return start + (end - start) * factor;
};

// Vector3 lerp utility
const lerpV3 = (current: THREE.Vector3, target: THREE.Vector3, factor: number) => {
    current.x = lerp(current.x, target.x, factor);
    current.y = lerp(current.y, target.y, factor);
    current.z = lerp(current.z, target.z, factor);
};

// Quaternion slerp utility
const slerpQ = (current: THREE.Quaternion, target: THREE.Quaternion, factor: number) => {
    current.slerp(target, factor);
};

function QuantumGroup() {
    const groupRef = useRef<THREE.Group>(null)
    const canRef = useRef<THREE.Group>(null)
    const [isReady, setIsReady] = useState(false)
    const { scrollProgress, isHorizontalSection } = useScrollContext()
    const materialRef = useRef<PS1MaterialType>(null)
    const sphereRef = useRef<THREE.Group>(null)
    const [sphereVisible, setSphereVisible] = useState(false)
    const [sphereAnimation, setSphereAnimation] = useState({
        startY: -8,
        targetY: -4,
        progress: 0,
    })
    const atmosphereMaterialRef = useRef<PS1MaterialType>(null)
    const coreMaterialRef = useRef<PS1MaterialType>(null)
    const glowMaterialRef = useRef<PS1MaterialType>(null)

    const values = useControls({
        glitchIntensity: {
            value: 0.72,
            min: 0,
            max: 1,
            step: 0.01,
            label: 'Glitch'
        },
        scrollEffect: {
            value: 0.30,
            min: 0,
            max: 1,
            step: 0.01,
            label: 'Scroll Effect'
        },
        ambientIntensity: {
            value: 0.20,
            min: 0,
            max: 1,
            step: 0.01,
            label: 'Ambient'
        },
        spot1Intensity: {
            value: 2.0,
            min: 0,
            max: 5,
            step: 0.1,
            label: 'Light 1 Intensity'
        },
        spot1Position: {
            value: [5.0, 5.0, 2.0],
            step: 0.1,
            label: 'Light 1 Position'
        },
        spot1Angle: {
            value: 0.10,
            min: 0,
            max: Math.PI / 2,
            step: 0.01,
            label: 'Light 1 Angle'
        },
        spot1Penumbra: {
            value: 0.81,
            min: 0,
            max: 1,
            step: 0.01,
            label: 'Light 1 Penumbra'
        },
        spot1Color: {
            value: '#b1e1ff',
            label: 'Light 1 Color'
        },
        spot2Intensity: {
            value: 5.0,
            min: 0,
            max: 5,
            step: 0.1,
            label: 'Light 2 Intensity'
        },
        spot2Position: {
            value: [-5.0, 3.0, 2.0],
            step: 0.1,
            label: 'Light 2 Position'
        },
        spot2Angle: {
            value: 0.06,
            min: 0,
            max: Math.PI / 2,
            step: 0.01,
            label: 'Light 2 Angle'
        },
        spot2Penumbra: {
            value: 1.00,
            min: 0,
            max: 1,
            step: 0.01,
            label: 'Light 2 Penumbra'
        },
        spot2Color: {
            value: '#4499ff',
            label: 'Light 2 Color'
        }
    });

    // Debug mounting
    useEffect(() => {
        console.log('QuantumGroup mounted');
        return () => console.log('QuantumGroup unmounted');
    }, []);

    // Initial animation timeline
    useEffect(() => {
        if (!canRef.current || !groupRef.current) return;

        const tl = gsap.timeline();
        tl.fromTo(groupRef.current.position,
            { y: -2 },
            { y: 0, duration: 1.5, ease: "power2.out" }
        );
        tl.fromTo(
            canRef.current.scale,
            { x: 0, y: 0, z: 0 },
            { x: 1, y: 1, z: 1, duration: 1.2, ease: "back.out(1.7)" },
            "-=1.2"
        );

        // Show sphere initially
        setSphereVisible(true);
        setIsReady(true);

        return () => {
            tl.kill();
        };
    }, []);

    // Debug refs
    useEffect(() => {
        console.log('Refs status:', {
            groupRef: !!groupRef.current,
            canRef: !!canRef.current,
            isReady
        });
    }, [isReady]);

    // Add state for transition targets
    const [transitionState] = useState({
        position: new THREE.Vector3(),
        rotation: new THREE.Euler(),
        scale: new THREE.Vector3(1, 1, 1),
        quaternion: new THREE.Quaternion(),
        targetPosition: new THREE.Vector3(),
        targetRotation: new THREE.Euler(),
        targetScale: new THREE.Vector3(1, 1, 1),
        targetQuaternion: new THREE.Quaternion(),
        velocity: new THREE.Vector3(),
        springVelocity: 0,
        dampedProgress: 0
    });

    // Add a ref to track the previous state
    const prevState = useRef({
        isHorizontalSection: false,
        position: new THREE.Vector3(),
        rotation: new THREE.Euler(),
        scale: new THREE.Vector3(1, 1, 1)
    });

    useFrame((state) => {
        if (!canRef.current || !groupRef.current || !isReady) return;

        const deltaTime = state.clock.getDelta();
        const lerpFactor = deltaTime * 1.0;
        const time = state.clock.elapsedTime;

        // Store previous position before any updates
        prevState.current.position.copy(canRef.current.position);
        prevState.current.rotation.copy(canRef.current.rotation);
        prevState.current.scale.copy(canRef.current.scale);

        const stateChanged = prevState.current.isHorizontalSection !== isHorizontalSection;
        if (stateChanged) {
            console.log('State transition:', {
                from: prevState.current.isHorizontalSection,
                to: isHorizontalSection,
                currentPos: canRef.current.position.toArray(),
                prevPos: prevState.current.position.toArray(),
                scrollProgress,
                time: state.clock.elapsedTime
            });

            // Show sphere when entering horizontal section and keep it visible
            if (isHorizontalSection) {
                setSphereVisible(true);
            }
        }
        prevState.current.isHorizontalSection = isHorizontalSection;

        // Update sphere animation regardless of section
        if (sphereRef.current && sphereVisible) {
            // Animate sphere position based on scroll progress
            const sphereY = THREE.MathUtils.lerp(-8, -4, scrollProgress);
            sphereRef.current.position.y = sphereY;

            // Update sphere material uniforms
            if (atmosphereMaterialRef.current) {
                atmosphereMaterialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
                atmosphereMaterialRef.current.uniforms.uScrollProgress.value = scrollProgress;
            }
        }

        if (isHorizontalSection) {
            const totalProgress = scrollProgress;
            const section1Progress = Math.min(1, totalProgress / 0.33);
            const section2Progress = Math.max(0, Math.min(1, (totalProgress - 0.28) / 0.33));
            const section3Progress = Math.max(0, Math.min(1, (totalProgress - 0.61) / 0.34));

            // More dynamic position calculations
            let targetX = 0;
            let targetY = 0;
            let targetZ = 0;

            // Section 1: Dramatic rise and spin
            if (section1Progress > 0) {
                targetY = THREE.MathUtils.lerp(0, 1.5, section1Progress);
                targetZ = THREE.MathUtils.lerp(0, -1, section1Progress);
                targetY += Math.sin(time * 3) * 0.1 * (1 - section1Progress);
            }

            // Section 2: Sweeping side movement
            if (section2Progress > 0) {
                targetX = THREE.MathUtils.lerp(0, -3.0, section2Progress);
                targetY = THREE.MathUtils.lerp(targetY, 0.8, section2Progress) +
                    Math.sin(section2Progress * Math.PI) * 0.5;
                targetZ = THREE.MathUtils.lerp(targetZ, 0.5, section2Progress) +
                    Math.cos(section2Progress * Math.PI) * 0.3;
            }

            // Section 3: Dynamic final positioning
            if (section3Progress > 0) {
                targetX = THREE.MathUtils.lerp(targetX, -1.5, section3Progress);
                targetY = THREE.MathUtils.lerp(targetY, 1.2, section3Progress);
                targetZ = THREE.MathUtils.lerp(targetZ, -0.5, section3Progress);
                // Add floating motion in final position
                targetY += Math.sin(time * 2) * 0.1 * section3Progress;
                targetX += Math.sin(time * 1.5) * 0.1 * section3Progress;
            }

            // Add continuous motion
            targetY += Math.sin(time * 2) * 0.05;
            targetZ += Math.sin(time * 1.5) * 0.05;

            // Wider position ranges but still clamped
            targetX = THREE.MathUtils.clamp(targetX, -3.5, 1);
            targetY = THREE.MathUtils.clamp(targetY, -0.5, 2);
            targetZ = THREE.MathUtils.clamp(targetZ, -1.5, 1);

            transitionState.targetPosition.set(targetX, targetY, targetZ);

            // More dramatic rotation
            const targetEuler = new THREE.Euler(
                Math.sin(time) * 0.2 + section2Progress * Math.PI * 0.2,
                THREE.MathUtils.lerp(0, Math.PI * 3, section1Progress) +
                Math.sin(time * 0.5) * 0.3,
                Math.sin(time * 0.7) * 0.15 * (1 - section3Progress)
            );
            transitionState.targetQuaternion.setFromEuler(targetEuler);

            // Dynamic scale pulsing
            const baseScale = 1 - section3Progress * 0.15;
            const pulseScale = 1 + Math.sin(time * 2) * 0.1 * (1 - section3Progress);
            transitionState.targetScale.setScalar(baseScale * pulseScale);

            // Faster transitions for more dynamic movement
            const transitionSpeed = stateChanged ? 0.1 : 0.3;

            // Apply transitions
            lerpV3(canRef.current.position, transitionState.targetPosition, lerpFactor * transitionSpeed);

            const currentQuat = new THREE.Quaternion();
            currentQuat.setFromEuler(canRef.current.rotation);
            slerpQ(currentQuat, transitionState.targetQuaternion, lerpFactor * transitionSpeed);
            canRef.current.setRotationFromQuaternion(currentQuat);

            lerpV3(canRef.current.scale, transitionState.targetScale, lerpFactor * transitionSpeed);

        } else {
            // More dynamic idle animation
            const idlePosition = new THREE.Vector3(
                Math.sin(time * 0.5) * 0.1,
                Math.sin(time) * 0.15 + Math.sin(time * 0.5) * 0.1,
                Math.sin(time * 0.7) * 0.1
            );
            const idleRotation = new THREE.Euler(
                Math.sin(time * 0.5) * 0.1,
                time * 0.2 + Math.sin(time * 0.3) * 0.1,
                Math.sin(time * 0.7) * 0.05
            );
            const idleScale = new THREE.Vector3().setScalar(
                1 + Math.sin(time * 0.8) * 0.05
            );

            const transitionSpeed = stateChanged ? 0.1 : 0.2;
            lerpV3(canRef.current.position, idlePosition, lerpFactor * transitionSpeed);

            const idleQuat = new THREE.Quaternion().setFromEuler(idleRotation);
            const currentQuat = new THREE.Quaternion();
            currentQuat.setFromEuler(canRef.current.rotation);
            slerpQ(currentQuat, idleQuat, lerpFactor * transitionSpeed);
            canRef.current.setRotationFromQuaternion(currentQuat);

            lerpV3(canRef.current.scale, idleScale, lerpFactor * transitionSpeed);
        }

        // Smoother position clamping
        const maxDelta = 0.2; // Increased for more dynamic movement
        const positionDelta = canRef.current.position.clone().sub(prevState.current.position);
        const deltaLength = positionDelta.length();

        if (deltaLength > maxDelta) {
            positionDelta.multiplyScalar(maxDelta / deltaLength);
            canRef.current.position.copy(prevState.current.position).add(positionDelta);
        }
    });

    return (
        <group
            ref={groupRef}
            position={[0, -1, 0]}
        >
            <Float
                speed={1.5}
                rotationIntensity={0.1}
                floatIntensity={0.3}
                floatingRange={[-0.05, 0.05]}
            >
                {/* Main can body */}
                <group ref={canRef}>
                    {/* Can body */}
                    <Cylinder
                        args={[0.3, 0.3, 1.2, 32]}
                        castShadow
                        receiveShadow
                    >
                        <meshPhysicalMaterial
                            color="#303040"
                            metalness={0.9}
                            roughness={0.1}
                            clearcoat={1}
                            clearcoatRoughness={0.1}
                            reflectivity={1}
                        />
                    </Cylinder>

                    {/* Top rim */}
                    <Cylinder
                        args={[0.31, 0.31, 0.05, 32]}
                        position={[0, 0.6, 0]}
                    >
                        <meshStandardMaterial
                            color="#505060"
                            metalness={0.8}
                            roughness={0.2}
                        />
                    </Cylinder>

                    {/* Bottom rim */}
                    <Cylinder
                        args={[0.31, 0.31, 0.05, 32]}
                        position={[0, -0.6, 0]}
                    >
                        <meshStandardMaterial
                            color="#505060"
                            metalness={0.8}
                            roughness={0.2}
                        />
                    </Cylinder>

                    {/* Top lid detail */}
                    <Cylinder
                        args={[0.28, 0.28, 0.02, 32]}
                        position={[0, 0.62, 0]}
                    >
                        <meshStandardMaterial
                            color="#404050"
                            metalness={0.9}
                            roughness={0.1}
                        />
                    </Cylinder>

                    {/* Bottom indent */}
                    <Cylinder
                        args={[0.28, 0.28, 0.02, 32]}
                        position={[0, -0.62, 0]}
                    >
                        <meshStandardMaterial
                            color="#404050"
                            metalness={0.9}
                            roughness={0.1}
                        />
                    </Cylinder>
                </group>
            </Float>

            <group
                ref={sphereRef}
                position={[0, sphereAnimation.startY, 0]}
                visible={sphereVisible}
            >
                {/* Main atmospheric sphere */}
                <mesh scale={1.2}>
                    <sphereGeometry args={[2, 128, 128]} />
                    <pS1Material
                        ref={atmosphereMaterialRef}
                        transparent={true}
                        depthWrite={false}
                        depthTest={true}
                        blending={THREE.AdditiveBlending}
                        uniforms={{
                            uTime: { value: 0 },
                            uGlitchIntensity: { value: values.glitchIntensity },
                            uScrollProgress: { value: scrollProgress * values.scrollEffect }
                        }}
                    />
                </mesh>
            </group>

            <ambientLight intensity={values.ambientIntensity} />
            <SpotLight
                position={values.spot1Position}
                angle={values.spot1Angle}
                penumbra={values.spot1Penumbra}
                intensity={values.spot1Intensity}
                distance={6}
                castShadow
                shadow-bias={-0.0001}
                shadow-mapSize={[2048, 2048]}
                color={values.spot1Color}
            />
            <SpotLight
                position={values.spot2Position}
                angle={values.spot2Angle}
                penumbra={values.spot2Penumbra}
                intensity={values.spot2Intensity}
                distance={6}
                color={values.spot2Color}
            />
        </group>
    )
}

// Update SceneContent to include space background
function SceneContent() {
    const { scrollProgress, isHorizontalSection } = useScrollContext()
    const cameraState = useRef({
        position: new THREE.Vector3(0, 1.5, 4),
        lookAt: new THREE.Vector3(0, -0, 0),
        velocity: new THREE.Vector3()
    });

    useFrame(({ camera }) => {
        const lerpFactor = 0.008; // Adjust for camera smoothness

        if (isHorizontalSection) {
            const radius = 12;
            const rotationAngle = THREE.MathUtils.lerp(0, Math.PI / 2, scrollProgress);
            const targetX = radius * Math.sin(rotationAngle);
            const targetZ = radius * Math.cos(rotationAngle);

            // Smooth camera position transition
            cameraState.current.position.set(targetX, 1.5, targetZ);
            lerpV3(camera.position, cameraState.current.position, lerpFactor);
        } else {
            // Transition back to initial position
            cameraState.current.position.set(0, 1.5, 4);
            lerpV3(camera.position, cameraState.current.position, lerpFactor);
        }

        // Smooth lookAt transition
        camera.lookAt(cameraState.current.lookAt);
        camera.updateProjectionMatrix()
    })

    return (
        <>
            <SpaceBackground />
            <Environment preset='night' />
            <ambientLight intensity={0.2} />
            <SpotLight
                position={[5, 5, 2]}
                angle={0.4}
                penumbra={0.8}
                intensity={2}
                distance={6}
                castShadow
                shadow-bias={-0.0001}
                shadow-mapSize={[2048, 2048]}
                color='#b1e1ff'
            />
            <SpotLight
                position={[-5, 3, 2]}
                angle={0.5}
                penumbra={1}
                intensity={0.3}
                distance={6}
                color='#4499ff'
            />
            <ContactShadows
                position={[0, -0.49, 0]}
                opacity={0.3}
                scale={20}
                blur={2}
                far={4}
                resolution={512}
                color='#000000'
            />
            <QuantumGroup />
            <Preload all />
        </>
    )
}

// Move component definitions outside the main component
const QuantumPage = () => {
    const containerRef = useRef<HTMLDivElement>(null)
    const canvasContainerRef = useRef<HTMLDivElement>(null)
    const heroTextRef = useRef<HTMLHeadingElement>(null)
    const subTextRef = useRef<HTMLHeadingElement>(null)
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
    const [scrollState, setScrollState] = useState<ScrollContextType>({
        scrollProgress: 0,
        isHorizontalSection: false,
    })

    // Handle canvas dimensions
    useEffect(() => {
        if (!canvasContainerRef.current) return

        const updateDimensions = () => {
            if (canvasContainerRef.current) {
                setDimensions({
                    width: canvasContainerRef.current.clientWidth,
                    height: canvasContainerRef.current.clientHeight,
                })
            }
        }

        updateDimensions()
        const resizeObserver = new ResizeObserver(updateDimensions)
        resizeObserver.observe(canvasContainerRef.current)

        return () => resizeObserver.disconnect()
    }, [])

    // Add CSS for new cyber effects
    const cyberStyles = `
        /* Base text styles */
        .cyber-text {
            position: relative;
            display: inline-block;
        }

        /* Large text effect - ultra subtle */
        .cyber-large {
            position: relative;
            display: inline-block;
            color: rgba(255, 255, 255, 0.95);
            text-shadow: 0 0 2px rgba(255, 255, 255, 0.2);
            transition: text-shadow 0.4s ease;
        }

        .cyber-large:hover {
            text-shadow: 0 0 4px rgba(255, 255, 255, 0.3);
        }

        /* Medium text effect - minimal movement */
        .cyber-medium {
            position: relative;
            display: inline-block;
            transition: opacity 0.4s ease;
        }

        /* Small text effect - fade only */
        .cyber-small {
            position: relative;
            display: inline-block;
            transition: opacity 0.4s ease;
        }

        /* Technical details */
        .technical-readout {
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.75rem;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            opacity: 0.6;
            transition: opacity 0.3s ease;
        }

        .technical-readout:hover {
            opacity: 0.8;
        }

        /* Grid lines - more subtle */
        .technical-grid {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            background-image: 
                linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
            background-size: 24px 24px, 24px 24px, 96px 96px;
            opacity: 0;
            transform: scale(1.1);
            transition: opacity 0.5s ease, transform 0.5s ease;
        }

        .technical-grid.is-visible {
            opacity: 1;
            transform: scale(1);
        }

        /* Parallax text containers */
        .parallax-text-container {
            transform-style: preserve-3d;
            perspective: 1000px;
        }

        .parallax-layer-back {
            transform: translateZ(-10px) scale(2);
        }

        .parallax-layer-mid {
            transform: translateZ(-5px) scale(1.5);
        }

        .parallax-layer-front {
            transform: translateZ(0) scale(1);
        }

        /* Enhanced HUD elements */
        .hud-element {
            position: absolute;
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.65rem;
            color: rgba(255, 255, 255, 0.4);
            pointer-events: none;
        }

        .hud-corner {
            width: 20px;
            height: 20px;
            border-style: solid;
            border-width: 1px;
            border-color: rgba(255, 255, 255, 0.1);
        }

        .hud-corner-tl {
            top: 16px;
            left: 16px;
            border-right: none;
            border-bottom: none;
        }

        .hud-corner-tr {
            top: 16px;
            right: 16px;
            border-left: none;
            border-bottom: none;
        }

        .hud-corner-bl {
            bottom: 16px;
            left: 16px;
            border-right: none;
            border-top: none;
        }

        .hud-corner-br {
            bottom: 16px;
            right: 16px;
            border-left: none;
            border-top: none;
        }

        .hud-scan-line {
            position: absolute;
            left: 0;
            width: 100%;
            height: 2px;
            background: linear-gradient(
                90deg,
                transparent,
                rgba(255, 255, 255, 0.1),
                transparent
            );
            opacity: 0.5;
            animation: scan-line 8s linear infinite;
        }

        @keyframes scan-line {
            0% { top: -2px; }
            100% { top: 100%; }
        }

        /* Enhanced CTA Button Styles */
        .cta-button {
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            position: relative;
            overflow: visible;
        }

        .cta-button::before {
            content: '';
            position: absolute;
            inset: 0;
            border: 1px solid rgba(255, 255, 255, 0.2);
            transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .cta-button .corner {
            position: absolute;
            width: 6px;
            height: 6px;
            border-color: rgba(255, 255, 255, 0.4);
            transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
            filter: drop-shadow(0 0 0 rgba(255, 255, 255, 0));
        }

        .cta-button .corner-tl {
            top: 0;
            left: 0;
            border-top: 1px solid;
            border-left: 1px solid;
        }

        .cta-button .corner-tr {
            top: 0;
            right: 0;
            border-top: 1px solid;
            border-right: 1px solid;
        }

        .cta-button .corner-bl {
            bottom: 0;
            left: 0;
            border-bottom: 1px solid;
            border-left: 1px solid;
        }

        .cta-button .corner-br {
            bottom: 0;
            right: 0;
            border-bottom: 1px solid;
            border-right: 1px solid;
        }

        .cta-button:hover .corner-tl {
            transform: translate(-4px, -4px);
        }

        .cta-button:hover .corner-tr {
            transform: translate(4px, -4px);
        }

        .cta-button:hover .corner-bl {
            transform: translate(-4px, 4px);
        }

        .cta-button:hover .corner-br {
            transform: translate(4px, 4px);
        }

        .cta-button:hover .corner {
            border-color: rgba(255, 255, 255, 0.8);
            filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.4));
        }

        .cta-button:hover::before {
            border-color: rgba(255, 255, 255, 0.4);
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
        }

        .cta-button::after {
            content: '';
            position: absolute;
            bottom: 0;
            right: -100%;
            width: 100%;
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: right 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .cta-button:hover::after {
            right: 100%;
        }

        /* Update technical readout styles */
        .technical-readout {
            font-family: 'JetBrains Mono', monospace;
            position: relative;
            display: inline-block;
            text-transform: uppercase;
            letter-spacing: 0.5em;
            opacity: 0.8;
            transition: opacity 0.3s ease;
        }

        .technical-readout::before,
        .technical-readout::after {
            content: '';
            position: absolute;
            opacity: 0;
            transition: all 0.3s ease;
        }

        .technical-readout:hover {
            opacity: 1;
        }

        .technical-readout:hover::before,
        .technical-readout:hover::after {
            opacity: 0.4;
        }

        /* Update header styles */
        h1, h2, h3, h4 {
            position: relative;
            margin: 0;
            padding: 0.5em 0;
        }

        h1::after, h2::after, h3::after, h4::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 1px;
            background: linear-gradient(to right, transparent, rgba(255,255,255,0.2), transparent);
            opacity: 0;
            transition: all 0.5s ease;
        }

        h1:hover::after, h2:hover::after, h3:hover::after, h4:hover::after {
            width: 100%;
            opacity: 1;
        }

        /* Update panel text styles */
        .panel-text {
            position: relative;
            padding: 2rem;
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .panel-text.is-visible {
            opacity: 1;
            transform: translateY(0);
        }

        /* Update feature block styles */
        .feature-block {
            position: relative;
            padding: 2rem;
            transition: all 0.3s ease;
        }

        .feature-block::before {
            content: '';
            position: absolute;
            inset: 0;
            border: 1px solid rgba(255,255,255,0);
            opacity: 0;
            transition: all 0.5s ease;
        }

        .feature-block:hover::before {
            border-color: rgba(255,255,255,0.1);
            opacity: 1;
        }

        /* Update hero lines animation */
        .hero-line-left,
        .hero-line-right {
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        .glitch-container:hover .hero-line-left,
        .glitch-container:hover .hero-line-right {
            opacity: 0.2;
        }

        /* Update status bar styles */
        .hero-status-bar {
            backdrop-filter: blur(4px);
            background: rgba(0,0,0,0.2);
            padding: 1rem;
            border-radius: 4px;
            z-index: 50;
        }

        .status-item {
            position: relative;
            padding: 0.5rem 1rem;
        }

        .status-item::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 0;
            width: 4px;
            height: 4px;
            background: currentColor;
            border-radius: 50%;
            opacity: 0.4;
            transform: translate(-50%, -50%);
        }
    `

    // Update the text animation setup
    useEffect(() => {
        const horizontalSection = document.querySelector("#horizontalSection")
        const panels = gsap.utils.toArray<HTMLElement>(".panel")
        const grids = gsap.utils.toArray<HTMLElement>(".technical-grid")
        const totalWidth = panels.length * window.innerWidth

        // Create main scroll animation
        const horizontalScroll = gsap.timeline({
            scrollTrigger: {
                trigger: horizontalSection,
                start: "top top",
                end: () => `+=${totalWidth - window.innerWidth}`,
                pin: true,
                scrub: 0.8,
                onUpdate: (self) => {
                    const newState = {
                        scrollProgress: self.progress,
                        isHorizontalSection: self.isActive,
                    };

                    // Log state changes
                    console.log('Scroll State Update:', {
                        progress: self.progress,
                        isActive: self.isActive,
                        direction: self.direction,
                        velocity: self.getVelocity(),
                        scrollTop: window.scrollY
                    });

                    setScrollState(newState);

                    // Update grid visibility based on scroll progress
                    grids.forEach((grid, index) => {
                        const gridProgress = self.progress * panels.length - index
                        if (gridProgress > 0 && gridProgress < 1) {
                            grid.classList.add("is-visible")
                        } else {
                            grid.classList.remove("is-visible")
                        }
                    })
                },
                onEnter: () => console.log('Entered horizontal section'),
                onLeave: () => console.log('Left horizontal section'),
                onEnterBack: () => console.log('Entered horizontal section (backwards)'),
                onLeaveBack: () => console.log('Left horizontal section (backwards)'),
            },
        })

        // Smoother panel animation with parallax
        horizontalScroll.to(panels, {
            x: () => -(totalWidth - window.innerWidth),
            ease: "none",
        })

        return () => {
            ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
        }
    }, [])

    return (
        <ScrollContext.Provider value={scrollState}>
            <div className='relative'>
                {/* Canvas Container */}
                <div
                    ref={canvasContainerRef}
                    className='fixed inset-0 w-full h-full overflow-hidden bg-gradient-to-b from-black via-purple-900/20 to-black pointer-events-none'
                >
                    {dimensions.width > 0 && (
                        <Canvas
                            shadows
                            camera={{ position: [0, 1, 4], fov: 35 }}
                            onCreated={state => {
                                console.log('Canvas created', state);
                            }}
                            style={{
                                position: "absolute",
                                width: `${dimensions.width}px`,
                                height: `${dimensions.height}px`,
                                imageRendering: "pixelated",
                            }}
                            gl={{
                                antialias: false,
                                powerPreference: "high-performance",
                                alpha: true,
                            }}
                        >
                            <color attach='background' args={["#000000"]} />
                            <fog attach='fog' args={["#000000", 5, 15]} />
                            <Suspense fallback={
                                <mesh>
                                    <boxGeometry args={[1, 1, 1]} />
                                    <meshBasicMaterial color="red" wireframe />
                                </mesh>
                            }>
                                <SceneContent />
                            </Suspense>
                        </Canvas>
                    )}
                </div>

                {/* Main Content */}
                <div ref={containerRef} className='relative w-full'>
                    {/* Hero Section */}
                    <section className='relative h-screen flex flex-col items-center justify-center overflow-hidden'>
                        {/* Background Elements */}
                        <InteractiveGrid />
                        <div className='absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50'></div>

                        {/* Main Content Container */}
                        <div className='relative z-10 flex flex-col items-center max-w-[90vw] mx-auto px-8'>


                            {/* Main Title Group */}
                            <div className='glitch-container relative mb-16 mt-24'>
                                {/* Interface Label */}
                                <div className='hero-interface-label overflow-hidden mb-12'>
                                    <div className='technical-readout text-[10px] tracking-[0.5em] text-white/40 flex items-center justify-center gap-4'>
                                        <span className='inline-block'>QUANTUM</span>
                                        <span className='inline-block'>REALITY</span>
                                        <span className='inline-block'>INTERFACE</span>
                                    </div>
                                </div>

                                {/* Main Title */}
                                <div className='hero-title-wrapper overflow-visible px-16 mb-24'>
                                    <h1 ref={heroTextRef}
                                        className='font-[PPEditorialOld] text-white/90 text-[4vw] md:text-[3.5vw] lg:text-[3vw] text-center leading-[1.2] tracking-tight mix-blend-difference max-w-[24ch] mx-auto'
                                        data-splitting
                                    >
                                        For those moments when you need a different version of now.
                                    </h1>
                                </div>

                                {/* Decorative Lines */}
                                <div className='absolute -left-8 top-1/2 w-6 h-[1px] bg-white/20 opacity-0 transform -translate-y-1/2 hero-line-left transition-opacity duration-300'></div>
                                <div className='absolute -right-8 top-1/2 w-6 h-[1px] bg-white/20 opacity-0 transform -translate-y-1/2 hero-line-right transition-opacity duration-300'></div>
                            </div>

                            {/* Subtitle */}
                            <div className='hero-subtitle-wrapper overflow-hidden mb-48 px-8'>
                                <h2 ref={subTextRef}
                                    className='technical-readout text-white/80 font-mono text-xl tracking-[0.5em] glitch-text'
                                    data-text="CTRL-Z: Reality's Undo Button"
                                >
                                    CTRL-Z: Reality's Undo Button
                                </h2>
                            </div>

                            {/* Scroll Indicator */}
                            <div className='hero-scroll fixed bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center space-y-4'>
                                <span className='technical-readout text-[10px] tracking-[0.5em] text-white/40 overflow-hidden'>
                                    <span className='inline-block'>SCROLL TO INITIALIZE</span>
                                </span>
                                <div className='scroll-indicator w-6 h-10 border-2 border-white/20 rounded-full flex items-start p-1'>
                                    <div className='w-1 h-2 bg-white/40 rounded-full animate-scroll-hint mx-auto'></div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Horizontal Scroll Section */}
                    <section
                        id='horizontalSection'
                        className='relative h-screen w-screen overflow-hidden'
                    >
                        {/* Grid Container */}
                        <div className='horizontal-grid-container'>
                            {Array.from({ length: 4 }).map((_, index) => (
                                <div
                                    key={index}
                                    className='technical-grid'
                                    style={{ left: `${index * 100}vw` }}
                                />
                            ))}
                            <div className='hud-scan-line' />
                            <div className='hud-corner hud-corner-tl' />
                            <div className='hud-corner hud-corner-tr' />
                            <div className='hud-corner hud-corner-bl' />
                            <div className='hud-corner hud-corner-br' />
                        </div>

                        <div className='absolute top-0 left-0 h-full flex'>
                            {/* Update panel content with parallax containers */}
                            <div className='panel w-screen h-screen flex-shrink-0 p-16 grid grid-rows-6 grid-cols-12 gap-8 relative'>
                                <div className='col-span-8 col-start-2 row-start-2 row-span-4 grid grid-rows-[auto_1fr] gap-16'>
                                    <div className='parallax-layer-front'>
                                        <h2 className='text-white/95 font-editorial text-[3.5vw] tracking-[-0.02em] leading-[1.1] max-w-[24ch] mix-blend-difference'>
                                            You've been there. That moment when
                                            everything goes sideways.
                                        </h2>
                                    </div>
                                    <div className='self-end space-y-6'>
                                        <p className='technical-readout mb-4'>
                                            System Status: Active
                                        </p>
                                        <div className='grid grid-cols-3 gap-4 text-xs font-mono text-white/40'>
                                            <div>CPU: 98.2%</div>
                                            <div>MEM: 64.7%</div>
                                            <div>TEMP: 42°C</div>
                                        </div>
                                        <div className='w-16 h-[1px] bg-white/20'></div>
                                    </div>
                                </div>
                            </div>

                            {/* Panel 2 */}
                            <div className='panel w-screen h-screen flex-shrink-0'>
                                {/* Main Grid Container */}
                                <div className='w-full h-full grid grid-cols-12 grid-rows-6 p-16 gap-8'>
                                    {/* Technical Details Top */}
                                    <div className='col-span-12 row-span-1 flex justify-between items-start'>


                                    </div>

                                    {/* Main Content Grid */}
                                    <div className='col-span-12 row-span-4 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-x-16 lg:gap-x-32 content-center p-4 md:p-8'>
                                        {/* Left Column */}
                                        <div className='space-y-12 md:space-y-24'>
                                            <div className='feature-block group relative overflow-visible p-8 md:p-12'>
                                                <div className='absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>
                                                <div className='relative z-10 space-y-6'>
                                                    <h3 className='font-[PPEditorialOld] text-white/95 text-[3vw] md:text-[2.5vw] lg:text-[2vw] leading-[1.1] transform group-hover:translate-x-2 transition-transform duration-500'>
                                                        NEURAL-SYNC
                                                        <br />
                                                        INTERFACE
                                                    </h3>
                                                    <p className='text-white/70 font-mono text-base leading-relaxed max-w-[40ch] transition-opacity duration-300 group-hover:text-white/90'>
                                                        Memory preservation across
                                                        realities, ensuring
                                                        cognitive continuity.
                                                    </p>
                                                </div>
                                            </div>

                                            <div className='feature-block group relative overflow-hidden'>
                                                <div className='absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>
                                                <div className='relative z-10'>
                                                    <h3 className='font-[PPEditorialOld] text-white/95 text-[4vw] leading-[0.9] mb-8 transform group-hover:translate-x-2 transition-transform duration-500'>
                                                        QUANTUM
                                                        <br />
                                                        STABILIZERS
                                                    </h3>
                                                    <p className='text-white/70 font-mono text-base leading-relaxed max-w-[40ch] transition-opacity duration-300 group-hover:text-white/90'>
                                                        Reality-grade containment
                                                        field prevents unwanted
                                                        timeline bleed.
                                                    </p>
                                                    <div className='mt-6 grid grid-cols-3 gap-2'>
                                                        {Array.from({
                                                            length: 3,
                                                        }).map((_, i) => (
                                                            <div
                                                                key={i}
                                                                className='h-[2px] bg-white/20 group-hover:bg-white/40 transition-colors duration-300 delay-[${i * 100}ms]'
                                                            ></div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Column */}
                                        <div className='space-y-16 md:space-y-32 mt-12 md:mt-48'>
                                            <div className='feature-block group relative overflow-hidden'>
                                                <div className='absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>
                                                <div className='relative z-10'>
                                                    <h3 className='font-[PPEditorialOld] text-white/95 text-[4vw] leading-[0.9] mb-8 transform group-hover:translate-x-2 transition-transform duration-500'>
                                                        INSTANT
                                                        <br />
                                                        ACCESS
                                                    </h3>
                                                    <p className='text-white/70 font-mono text-base leading-relaxed max-w-[40ch] transition-opacity duration-300 group-hover:text-white/90'>
                                                        Zero latency between
                                                        decision and implementation.
                                                    </p>
                                                    <div className='absolute bottom-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity duration-300'>
                                                        <div className='font-mono text-[10px] tracking-wider'>
                                                            ACCESS_POINT_01
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Technical Details Bottom */}
                                    <div className='col-span-12 row-span-1 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 font-mono text-xs text-white/40 p-4'>
                                        <div className='grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-2'>
                                            <div className='whitespace-nowrap'>MEMORY: 87.2%</div>
                                            <div className='whitespace-nowrap'>UPTIME: 847:23:12</div>
                                            <div className='whitespace-nowrap'>TEMP: 42.3°C</div>
                                        </div>
                                        <div className='text-left md:text-right space-y-1'>
                                            <div className='whitespace-nowrap'>LOC: 37.7749° N, 122.4194° W</div>
                                            <div className='whitespace-nowrap'>
                                                TIME: {new Date().toISOString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Background Elements */}
                                <div className='absolute inset-0 pointer-events-none'>
                                    <div className='absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent'></div>
                                    <div className='absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent'></div>
                                    <div className='absolute top-8 right-8 flex items-center space-x-2'>
                                        <div className='w-2 h-2 bg-white/20'></div>
                                        <div className='w-2 h-2 bg-white/30'></div>
                                        <div className='w-2 h-2 bg-white/40'></div>
                                    </div>
                                </div>
                            </div>

                            {/* Panel 3 */}
                            <div className='panel w-screen h-screen flex-shrink-0 p-16 grid grid-rows-6 grid-cols-12 gap-8'>
                                <div className='col-span-10 col-start-2 row-span-full grid grid-cols-[1fr_auto] items-center gap-32'>
                                    <div className='max-w-[50vw]'>
                                        <div className='technical-readout text-[10px] tracking-[0.5em] text-white/40 mb-8'>SYSTEM ANALYSIS</div>
                                        <h2 className='font-[PPEditorialOld] text-white/95 text-[4vw] tracking-[-0.03em] leading-[0.95] mb-8'>
                                            Until now, you lived with it.
                                        </h2>
                                        <p className='technical-readout text-white/70 font-mono text-sm leading-relaxed mb-6'>
                                            Every decision point creates infinite branches. We just help you find the right one.
                                        </p>
                                        <div className='grid grid-cols-2 gap-4 text-[10px] font-mono text-white/40 tracking-[0.3em] mt-8'>
                                            <div className='technical-readout'>BRANCH COUNT: ∞</div>
                                            <div className='technical-readout'>SUCCESS RATE: 99.99%</div>
                                        </div>
                                    </div>
                                    <div className='panel-text w-[360px] border-l border-white/10 pl-16 tech-specs'>
                                        <p className='text-white/40 font-mono text-sm tracking-[0.2em] uppercase mb-12'>
                                            Technical Specifications
                                        </p>
                                        <div className='space-y-12'>
                                            <div className='spec-item group'>
                                                <p className='text-white/40 font-mono text-xs tracking-[0.15em] uppercase mb-2 transition-colors duration-300 group-hover:text-white/60'>
                                                    MODEL
                                                </p>
                                                <p className='text-white/90 font-mono text-xl transition-transform duration-500 group-hover:translate-x-2'>
                                                    QUANTUM CORE RT-749
                                                </p>
                                            </div>
                                            <div className='spec-item group'>
                                                <p className='text-white/40 font-mono text-xs tracking-[0.15em] uppercase mb-2 transition-colors duration-300 group-hover:text-white/60'>
                                                    SERIES
                                                </p>
                                                <p className='text-white/90 font-mono text-xl transition-transform duration-500 group-hover:translate-x-2'>
                                                    SHIFT-X
                                                </p>
                                            </div>
                                            <div className='spec-item group'>
                                                <p className='text-white/40 font-mono text-xs tracking-[0.15em] uppercase mb-2 transition-colors duration-300 group-hover:text-white/60'>
                                                    ESTABLISHED
                                                </p>
                                                <p className='text-white/90 font-mono text-xl transition-transform duration-500 group-hover:translate-x-2'>
                                                    2038
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Panel 4 */}
                            <div className='panel w-screen h-screen flex-shrink-0 p-16 grid grid-rows-6 grid-cols-12 gap-8'>
                                <div className='col-span-full row-span-full flex flex-col items-center justify-center text-center'>
                                    <p className='text-white/40 font-mono text-base tracking-[0.5em] uppercase mb-8 fade-up'>
                                        CRTL-Z
                                    </p>
                                    <h2 className='font-[PPEditorialOld] text-white/95 text-[10vw] tracking-[-0.03em] leading-[0.9]  fade-up'>
                                        Now you can fix it.
                                    </h2>
                                    <div className='mt-12 flex items-center gap-8 fade-up'>

                                        <p className='text-white/60 font-mono text-sm tracking-[0.2em] uppercase'>
                                            Continue to experience
                                        </p>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Testimonial Section */}
                    <section className='relative min-h-screen bg-black/90 flex items-center justify-center py-24'>
                        <div className='container mx-auto grid grid-cols-12 gap-8 px-8'>
                            <div className='col-span-6'>
                                <div className='technical-readout text-[10px] tracking-[0.5em] text-white/40 mb-8'>FIELD REPORTS</div>
                                <h2 className='font-[PPEditorialOld] text-white/95 text-5xl leading-tight mb-16'>
                                    When we first announced
                                    <br />
                                    a beverage that could alter
                                    <br />
                                    reality, they called us mad.
                                    <br />
                                    <br />
                                    <span className='text-white/70'>88 billion successful
                                        <br />
                                        reality shifts later, they
                                        <br />
                                        call us the future.</span>
                                </h2>
                            </div>
                            <div className='col-span-5 col-start-8 space-y-12'>
                                <div className='space-y-6'>
                                    <div className='technical-readout text-[10px] tracking-[0.5em] text-white/40 mb-4'>USER TESTIMONIAL_01</div>
                                    <div className='flex mb-4'>
                                        {Array.from({ length: 5 }, (_, index) => (
                                            <span key={index} className='text-white/80 text-xl'>★</span>
                                        ))}
                                    </div>
                                    <p className='technical-readout text-white/90 font-mono text-lg leading-relaxed'>
                                        "Yesterday, I made the worst presentation of my career. Or I would have, if ctrl-z hadn't helped me find the timeline where I remembered to actually save my slides."
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Final CTA Section */}
                    <section className='relative min-h-screen bg-black flex items-center justify-center overflow-hidden'>
                        {/* Technical Grid Background */}
                        <div className='technical-grid absolute inset-0 w-full h-full'>
                            {/* Primary Grid */}
                            <div className='absolute inset-0 bg-[length:24px_24px] [mask-image:linear-gradient(to_bottom,transparent,black,transparent)]'
                                style={{
                                    backgroundImage: `
                                    linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
                                    linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
                                `
                                }}
                            />

                            {/* Secondary Grid */}
                            <div className='absolute inset-0 bg-[length:96px_96px]'
                                style={{
                                    backgroundImage: `
                                    linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
                                    linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
                                `
                                }}
                            />

                            {/* Radial Points */}
                            <div className='absolute inset-0 bg-[length:48px_48px] opacity-30'
                                style={{
                                    backgroundImage: `radial-gradient(circle at center, rgba(255,255,255,0.1) 1px, transparent 1px)`
                                }}
                            />

                            {/* Scanning Line Effect */}
                            <div className='absolute inset-0 overflow-hidden'>
                                <div className='absolute w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent animate-scan-y' />
                                <div className='absolute w-[1px] h-full bg-gradient-to-b from-transparent via-white/10 to-transparent animate-scan-x' />
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className='text-center relative z-10 max-w-6xl mx-auto flex flex-col items-center'>
                            {/* Technical Readout Header */}
                            <div className='technical-readout text-[10px] tracking-[0.5em] text-white/40 mb-32'>
                                QUANTUM SHIFT PROTOCOL: READY
                            </div>

                            {/* Technical Stats */}
                            <div className='grid grid-cols-3 gap-32 mb-32 font-mono w-full max-w-2xl'>
                                <DataReadout label="REALITY SHIFTS" value="88.2B+" />
                                <DataReadout label="SUCCESS RATE" value="99.99%" />
                                <DataReadout label="QUANTUM STABILITY" value="100%" />
                            </div>

                            {/* Description */}
                            <p className='text-white/60 font-mono text-md max-w-2xl mx-auto mb-8 leading-relaxed tracking-wider'>
                                Step into a future where every possibility is within reach. Your perfect timeline awaits.
                            </p>

                            {/* CTA Buttons */}
                            <div className='space-x-8'>
                                <button className='cta-button hover-highlight group relative px-12 py-4 bg-transparent'>
                                    <div className='corner corner-tl'></div>
                                    <div className='corner corner-tr'></div>
                                    <div className='corner corner-bl'></div>
                                    <div className='corner corner-br'></div>
                                    <span className='text-white/90 font-mono text-sm tracking-[0.3em] relative z-10'>
                                        INITIATE SHIFT
                                    </span>
                                </button>
                                <button className='cta-button group relative px-12 py-4'>
                                    <div className='absolute inset-0 border border-white/10'></div>
                                    <span className='text-white/40 font-mono text-sm tracking-[0.3em] relative z-10'>
                                        LEARN MORE
                                    </span>
                                </button>
                            </div>

                            {/* Technical Details */}
                            <div className=' font-mono text-[10px] text-white/40 tracking-[0.2em]'>
                                <div>MODEL: QS-749-X</div>
                                <div>BUILD: 2038.12.1</div>
                            </div>
                            <div className=' font-mono text-[10px] text-white/40 tracking-[0.2em] text-right'>
                                <div>LAT: 37.7749° N</div>
                                <div>LONG: 122.4194° W</div>
                            </div>
                        </div>

                        {/* Background Gradient */}
                        <div className='absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-70'></div>
                    </section>

                    {/* Add this CSS to your global styles or a CSS module */}
                    <style
                        dangerouslySetInnerHTML={{
                            __html: `
                        @keyframes glitch {
                            0% {
                                transform: translate(0);
                            }
                            20% {
                                transform: translate(-2px, 2px);
                            }
                            40% {
                                transform: translate(-2px, -2px);
                            }
                            60% {
                                transform: translate(2px, 2px);
                            }
                            80% {
                                transform: translate(2px, -2px);
                            }
                            100% {
                                transform: translate(0);
                            }
                        }

                        .glitch-text {
                            position: relative;
                            animation: glitch 5s infinite;
                        }

                        .glitch-text::before,
                        .glitch-text::after {
                            content: attr(data-text);
                            position: absolute;
                            top: 0;
                            left: 0;
                            width: 100%;
                            height: 100%;
                        }

                        .glitch-text::before {
                            left: 2px;
                            text-shadow: -2px 0 #ff00ff;
                            clip: rect(44px, 450px, 56px, 0);
                            animation: glitch-anim 5s infinite linear alternate-reverse;
                        }

                        .glitch-text::after {
                            left: -2px;
                            text-shadow: -2px 0 #00ffff;
                            clip: rect(44px, 450px, 56px, 0);
                            animation: glitch-anim 5s infinite linear alternate-reverse;
                        }

                        @keyframes scroll-hint {
                            0%, 100% { transform: translateY(0); }
                            50% { transform: translateY(5px); }
                        }
                        }

                        .animate-scroll-hint {
                            animation: scroll-hint 2s infinite;
                        }

                        .feature-item {
                            transition: all 0.3s ease;
                        }

                        .feature-item:hover {
                            transform: translateX(10px);
                            text-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
                        }

                        @keyframes glitch-anim {
                            0% {
                                clip: rect(44px, 450px, 56px, 0);
                            }
                            20% {
                                clip: rect(12px, 450px, 92px, 0);
                            }
                            40% {
                                clip: rect(76px, 450px, 24px, 0);
                            }
                            60% {
                                clip: rect(33px, 450px, 77px, 0);
                            }
                            80% {
                                clip: rect(89px, 450px, 11px, 0);
                            }
                            100% {
                                clip: rect(21px, 450px, 88px, 0);
                            }
                        }

                        /* Update Swiss typography styles */
                        .panel-text {
                            transform: translateY(20px);
                            will-change: transform, opacity;
                        }

                        .panel {
                            position: relative;
                        }

                        .panel::after {
                            content: '';
                            position: absolute;
                            top: 16px;
                            right: 16px;
                            bottom: 16px;
                            left: 16px;
                            border: 1px solid rgba(255, 255, 255, 0.03);
                            pointer-events: none;
                        }

                        /* Add debug styles to help visualize text */
                        .word {
                            opacity: 1 !important; /* Ensure words are visible */
                            color: inherit;
                            display: inline-block;
                        }

                        /* Enhanced typography styles */
                        .feature-block {
                            position: relative;
                            padding: 2rem;
                            transition: all 0.5s ease;
                        }

                        .feature-block::before {
                            content: '';
                            position: absolute;
                            inset: 0;
                            border: 1px solid rgba(255,255,255,0.05);
                            opacity: 0;
                            transition: all 0.5s ease;
                        }

                        .feature-block:hover::before {
                            opacity: 1;
                            transform: scale(1.05);
                        }

                        .tech-specs {
                            position: relative;
                            overflow: hidden;
                        }

                        .tech-specs::before {
                            content: '';
                            position: absolute;
                            top: 0;
                            left: 0;
                            width: 1px;
                            height: 100%;
                            background: linear-gradient(
                                to bottom,
                                transparent,
                                rgba(255, 255, 255, 0.1),
                                transparent
                            );
                            animation: scanline 4s ease-in-out infinite;
                        }

                        @keyframes scanline {
                            0% { transform: translateY(-100%); }
                            100% { transform: translateY(100%); }
                        }

                        .spec-item {
                            position: relative;
                            padding: 1rem;
                            transition: all 0.3s ease;
                        }

                        .spec-item::after {
                            content: '';
                            position: absolute;
                            left: -1rem;
                            top: 50%;
                            width: 0.5rem;
                            height: 1px;
                            background: rgba(255, 255, 255, 0.2);
                            transform: scaleX(0);
                            transform-origin: left;
                            transition: transform 0.3s ease;
                        }

                        .spec-item:hover::after {
                            transform: scaleX(1);
                        }

                        /* Improved animation styles */
                        .panel-text {
                            opacity: 0;
                            transform: translateY(30px);
                            transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
                        }

                        .panel-text.is-visible {
                            opacity: 1;
                            transform: translateY(0);
                        }

                        .word {
                            display: inline-block;
                            opacity: 0;
                            transform: translateY(20px);
                            transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
                        }

                        .word.is-visible {
                            opacity: 1;
                            transform: translateY(0);
                        }

                        @keyframes scan-y {
                            from { transform: translateY(-100%); }
                            to { transform: translateY(100%); }
                        }

                        @keyframes scan-x {
                            from { transform: translateX(-100%); }
                            to { transform: translateX(100%); }
                        }

                        .animate-scan-y {
                            animation: scan-y 8s linear infinite;
                        }

                        .animate-scan-x {
                            animation: scan-x 12s linear infinite;
                        }

                        .technical-grid {
                            mask-image: linear-gradient(to bottom, 
                                transparent,
                                rgba(0,0,0,0.8) 15%,
                                rgba(0,0,0,0.8) 85%,
                                transparent
                            );
                            opacity: 0.6;
                            pointer-events: none;
                        }

                        /* Add responsive scaling */
                        @media (max-width: 768px) {
                            .technical-grid div {
                                background-size: 16px 16px, 16px 16px;
                            }
                            .technical-grid div:nth-child(2) {
                                background-size: 64px 64px, 64px 64px;
                            }
                            .technical-grid div:nth-child(3) {
                                background-size: 32px 32px;
                            }
                        }
                        .technical-readout {
                            font-family: 'JetBrains Mono', monospace;
                            position: relative;
                            display: inline-block;
                            text-transform: uppercase;
                            letter-spacing: 0.5em;
                            opacity: 0.8;
                            transition: opacity 0.3s ease;
                        }

                        .technical-readout::before {
                            content: '[';
                            position: absolute;
                            left: -1em;
                            opacity: 0.4;
                        }

                        .technical-readout::after {
                            content: ']';
                            position: absolute;
                            right: -1em;
                            opacity: 0.4;
                        }

                        .technical-readout:hover {
                            opacity: 1;
                        }

                        h1, h2, h3, h4 {
                            position: relative;
                        }

                        h1::after, h2::after, h3::after, h4::after {
                            content: '';
                            position: absolute;
                            bottom: -0.5em;
                            left: 0;
                            width: 2em;
                            height: 1px;
                            background: linear-gradient(to right, rgba(255,255,255,0.2), transparent);
                        }

                        .panel-text {
                            position: relative;
                            padding: 2rem;
                        }

                        .panel-text::before {
                            content: '';
                            position: absolute;
                            top: 0;
                            left: 0;
                            width: 2px;
                            height: 1em;
                            background: rgba(255,255,255,0.2);
                        }

                        .feature-block {
                            position: relative;
                            padding: 2rem;
                            border: 1px solid rgba(255,255,255,0.05);
                            transition: all 0.3s ease;
                        }

                        .feature-block:hover {
                            border-color: rgba(255,255,255,0.1);
                            transform: translateX(4px);
                        }

                        .feature-block::before {
                            content: '';
                            position: absolute;
                            top: -1px;
                            left: -1px;
                            width: 8px;
                            height: 8px;
                            border-top: 1px solid rgba(255,255,255,0.2);
                            border-left: 1px solid rgba(255,255,255,0.2);
                        }

                        .technical-readout {
                            position: relative;
                            padding-left: 1em;
                            padding-right: 1em;
                        }

                        .technical-readout::before,
                        .technical-readout::after {
                            font-family: monospace;
                            position: absolute;
                            top: 50%;
                            transform: translateY(-50%);
                            opacity: 0.4;
                            transition: opacity 0.3s ease;
                        }

                        .technical-readout::before {
                            content: '[';
                            left: 0;
                            transform-origin: left center;
                        }

                        .technical-readout::after {
                            content: ']';
                            right: 0;
                            transform-origin: right center;
                        }

                        .technical-readout:hover::before {
                            transform: translateY(-50%) translateX(-2px);
                            opacity: 0.8;
                        }

                        .technical-readout:hover::after {
                            transform: translateY(-50%) translateX(2px);
                            opacity: 0.8;
                        }

                        .feature-block {
                            position: relative;
                            background: linear-gradient(
                                to bottom,
                                rgba(255,255,255,0.02),
                                transparent
                            );
                        }

                        .feature-block::before,
                        .feature-block::after {
                            content: '';
                            position: absolute;
                            width: 1px;
                            height: 40px;
                            background: linear-gradient(
                                to bottom,
                                rgba(255,255,255,0.2),
                                transparent
                            );
                        }

                        .feature-block::before {
                            top: 0;
                            left: 0;
                        }

                        .feature-block::after {
                            top: 0;
                            right: 0;
                        }

                        .feature-block:hover {
                            background: linear-gradient(
                                to bottom,
                                rgba(255,255,255,0.03),
                                transparent
                            );
                        }

                        /* Enhanced heading decorations */
                        h1::before, h2::before, h3::before {
                            content: '';
                            position: absolute;
                            top: -0.5em;
                            left: 0;
                            width: 40px;
                            height: 1px;
                            background: linear-gradient(to right, rgba(255,255,255,0.2), transparent);
                        }

                        /* Technical corner decorations */
                        .technical-corner {
                            position: absolute;
                            width: 8px;
                            height: 8px;
                            border: 1px solid rgba(255,255,255,0.2);
                        }

                        .technical-corner-tl {
                            top: 0;
                            left: 0;
                            border-right: none;
                            border-bottom: none;
                        }

                        .technical-corner-tr {
                            top: 0;
                            right: 0;
                            border-left: none;
                            border-bottom: none;
                        }

                        .technical-corner-bl {
                            bottom: 0;
                            left: 0;
                            border-right: none;
                            border-top: none;
                        }

                        .technical-corner-br {
                            bottom: 0;
                            right: 0;
                            border-left: none;
                            border-top: none;
                        }

                        /* Scanning effect */
                        @keyframes scan {
                            0% { transform: translateY(-100%); opacity: 0; }
                            50% { opacity: 1; }
                            100% { transform: translateY(100%); opacity: 0; }
                        }

                        .scan-line {
                            position: absolute;
                            left: 0;
                            width: 100%;
                            height: 1px;
                            background: linear-gradient(
                                90deg,
                                transparent,
                                rgba(255,255,255,0.1),
                                transparent
                            );
                            animation: scan 4s linear infinite;
                            pointer-events: none;
                        }

                        /* Glitch effect */
                        @keyframes glitch-1 {
                            0% { clip-path: inset(40% 0 61% 0); }
                            20% { clip-path: inset(92% 0 1% 0); }
                            40% { clip-path: inset(43% 0 1% 0); }
                            60% { clip-path: inset(25% 0 58% 0); }
                            80% { clip-path: inset(54% 0 7% 0); }
                            100% { clip-path: inset(58% 0 43% 0); }
                        }

                        .glitch-text {
                            position: relative;
                        }

                        .glitch-text::before,
                        .glitch-text::after {
                            content: attr(data-text);
                            position: absolute;
                            top: 0;
                            left: 0;
                            width: 100%;
                            height: 100%;
                            opacity: 0.8;
                        }

                        .glitch-text::before {
                            animation: glitch-1 0.3s infinite;
                            color: #0ff;
                            transform: translateX(-2px);
                        }

                        .glitch-text::after {
                            animation: glitch-1 0.3s infinite reverse;
                            color: #f0f;
                            transform: translateX(2px);
                        }

                        /* Pulse effect */
                        @keyframes pulse {
                            0% { transform: scale(1); opacity: 0.5; }
                            50% { transform: scale(1.05); opacity: 0.8; }
                            100% { transform: scale(1); opacity: 0.5; }
                        }

                        .pulse {
                            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                        }

                        /* Loading bar */
                        @keyframes loading {
                            from { width: 0; }
                            to { width: 100%; }
                        }

                        .loading-bar {
                            position: relative;
                            height: 1px;
                            background: rgba(255,255,255,0.1);
                            overflow: hidden;
                        }

                        .loading-bar::after {
                            content: '';
                            position: absolute;
                            top: 0;
                            left: 0;
                            height: 100%;
                            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
                            animation: loading 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                        }

                        /* Enhanced corner decorations */
                        .corner-decoration {
                            position: absolute;
                            width: 6px;
                            height: 6px;
                            border: 1px solid rgba(255,255,255,0.2);
                            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                        }

                        .corner-tl { top: 0; left: 0; border-right: none; border-bottom: none; }
                        .corner-tr { top: 0; right: 0; border-left: none; border-bottom: none; }
                        .corner-bl { bottom: 0; left: 0; border-right: none; border-top: none; }
                        .corner-br { bottom: 0; right: 0; border-left: none; border-top: none; }

                        *:hover > .corner-decoration {
                            width: 12px;
                            height: 12px;
                            border-color: rgba(255,255,255,0.4);
                        }

                        /* Data stream effect */
                        @keyframes data-stream {
                            0% { transform: translateY(-100%); }
                            100% { transform: translateY(100%); }
                        }

                        .data-stream {
                            position: absolute;
                            top: 0;
                            width: 1px;
                            height: 100px;
                            background: linear-gradient(
                                to bottom,
                                transparent,
                                rgba(255,255,255,0.2),
                                transparent
                            );
                            animation: data-stream 3s linear infinite;
                        }

                        /* Hover highlight */
                        .hover-highlight {
                            position: relative;
                            overflow: hidden;
                        }

                        .hover-highlight::after {
                            content: '';
                            position: absolute;
                            top: 0;
                            left: -100%;
                            width: 100%;
                            height: 100%;
                            background: linear-gradient(
                                90deg,
                                transparent,
                                rgba(255,255,255,0.1),
                                transparent
                            );
                            transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
                        }

                        .hover-highlight:hover::after {
                            transform: translateX(200%);
                        }
                    `,
                        }}
                    />
                </div>
                <style dangerouslySetInnerHTML={{ __html: cyberStyles }} />
            </div>
        </ScrollContext.Provider>
    )
}

export default QuantumPage
