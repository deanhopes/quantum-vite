import React, { useRef, useState, useMemo } from "react"
import { useFrame, extend } from "@react-three/fiber"
import {
    Float,
    SpotLight,
    useGLTF,
    MeshTransmissionMaterial,
} from "@react-three/drei"
import * as THREE from "three"
import { useControls } from "leva"
import { useScrollContext } from "../types/ScrollContext"
import { PS1Material, PS1MaterialType } from "../../shaders/PS1Material"
import { lerpV3, slerpQ } from "../../utils/animations"
import gsap from "gsap"

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

interface ModelProps {
    canRef: React.RefObject<THREE.Group>
}

function Model({ canRef }: ModelProps) {
    const { scene } = useGLTF("/src/assets/can.glb")

    React.useEffect(() => {
        if (scene) {
            // Method 1: Scale the scene directly
            scene.scale.set(4, 4, 4)

            // Method 2: Scale each mesh
            scene.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.scale.set(16, 16, 16)
                    child.castShadow = true
                    child.receiveShadow = true
                }
            })
        }
    }, [scene])

    return (
        <primitive
            object={scene}
            ref={canRef}
            scale={[4, 4, 4]}
            position={[0, 0, 1]}
            rotation={[0, Math.PI * 3, 0]}
        />
    )
}

export function QuantumGroup() {
    const groupRef = useRef<THREE.Group>(null)
    const canRef = useRef<THREE.Group>(null)
    const [isReady, setIsReady] = useState(false)
    const { scrollProgress, isHorizontalSection } = useScrollContext()
    const materialRef = useRef<PS1MaterialType>(null)
    const sphereRef = useRef<THREE.Group>(null)
    const [sphereVisible, setSphereVisible] = useState(false)
    const [sphereAnimation] = useState({
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
            label: "Glitch",
        },
        scrollEffect: {
            value: 0.3,
            min: 0,
            max: 1,
            step: 0.01,
            label: "Scroll Effect",
        },
        ambientIntensity: {
            value: 0.2,
            min: 0,
            max: 1,
            step: 0.01,
            label: "Ambient",
        },
        spot1Intensity: {
            value: 2.0,
            min: 0,
            max: 5,
            step: 0.1,
            label: "Light 1 Intensity",
        },
        spot1Position: {
            value: [5.0, 5.0, 2.0],
            step: 0.1,
            label: "Light 1 Position",
        },
        spot1Angle: {
            value: 0.1,
            min: 0,
            max: Math.PI / 2,
            step: 0.01,
            label: "Light 1 Angle",
        },
        spot1Penumbra: {
            value: 0.81,
            min: 0,
            max: 1,
            step: 0.01,
            label: "Light 1 Penumbra",
        },
        spot1Color: {
            value: "#b1e1ff",
            label: "Light 1 Color",
        },
        spot2Intensity: {
            value: 5.0,
            min: 0,
            max: 5,
            step: 0.1,
            label: "Light 2 Intensity",
        },
        spot2Position: {
            value: [-5.0, 3.0, 2.0],
            step: 0.1,
            label: "Light 2 Position",
        },
        spot2Angle: {
            value: 0.06,
            min: 0,
            max: Math.PI / 2,
            step: 0.01,
            label: "Light 2 Angle",
        },
        spot2Penumbra: {
            value: 4.0,
            min: 0,
            max: 1,
            step: 0.01,
            label: "Light 2 Penumbra",
        },
        spot2Color: {
            value: "#4499ff",
            label: "Light 2 Color",
        },
        lightTransitionSpeed: {
            value: 0.8,
            min: 0.1,
            max: 2.0,
            step: 0.1,
            label: "Light Transition Speed",
        },
        atmosphereIntensity: {
            value: 0.8,
            min: 0,
            max: 3,
            step: 0.1,
            label: "Atmosphere Intensity",
        },
        pulseFrequency: {
            value: 1.5,
            min: 0.1,
            max: 5,
            step: 0.1,
            label: "Pulse Frequency",
        },
    })

    // Memoized material configurations
    const materialConfigs = useMemo(
        () => ({
            transmission: {
                samples: 16,
                transmission: 1,
                thickness: 0.5,
                roughness: 0.2,
                chromaticAberration: 0.06,
            },
        }),
        []
    )



    // Enhanced animation timeline
    React.useEffect(() => {
        if (!canRef.current || !groupRef.current) return

        const tl = gsap.timeline({
            defaults: { ease: "power3.inOut" },
        })

        // More sophisticated entrance animation
        tl.fromTo(
            groupRef.current.position,
            { y: -4, x: -2 },
            { y: 0, x: 0, duration: 2, ease: "elastic.out(1, 0.75)" }
        ).fromTo(
            canRef.current.scale,
            { x: 0, y: 0, z: 0 },
            {
                x: 1,
                y: 1,
                z: 1,
                duration: 1.5,
                ease: "back.out(2)",
                onComplete: () => setIsReady(true),
            },
            "-=1.5"
        )

        setSphereVisible(true)

        return () => {
            tl.kill()
            return undefined
        }
    }, [])



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
        dampedProgress: 0,
    })

    // Add a ref to track the previous state
    const prevState = useRef({
        isHorizontalSection: false,
        position: new THREE.Vector3(),
        rotation: new THREE.Euler(),
        scale: new THREE.Vector3(1, 1, 1),
    })

    useFrame((state) => {
        if (!canRef.current || !groupRef.current || !isReady) return

        const deltaTime = state.clock.getDelta()
        const time = state.clock.elapsedTime

        // Dynamic material updates
        const materials = [
            materialRef,
            atmosphereMaterialRef,
            coreMaterialRef,
            glowMaterialRef,
        ]
        materials.forEach((material) => {
            if (material.current?.uniforms) {
                material.current.uniforms.uTime.value = time
                material.current.uniforms.uScrollProgress.value =
                    scrollProgress * values.scrollEffect
                if (material.current.uniforms.uAtmosphereIntensity) {
                    material.current.uniforms.uAtmosphereIntensity.value =
                        values.atmosphereIntensity
                }
            }
        })

        const lerpFactor = deltaTime * 1.0

        // Store previous position before any updates
        prevState.current.position.copy(canRef.current.position)
        prevState.current.rotation.copy(canRef.current.rotation)
        prevState.current.scale.copy(canRef.current.scale)

        const stateChanged =
            prevState.current.isHorizontalSection !== isHorizontalSection
        if (stateChanged) {
            console.log("State transition:", {
                from: prevState.current.isHorizontalSection,
                to: isHorizontalSection,
                currentPos: canRef.current.position.toArray(),
                prevPos: prevState.current.position.toArray(),
                scrollProgress,
                time: state.clock.elapsedTime,
            })

            // Show sphere when entering horizontal section and keep it visible
            if (isHorizontalSection) {
                setSphereVisible(true)
            }
        }
        prevState.current.isHorizontalSection = isHorizontalSection

        // Update sphere animation regardless of section
        if (sphereRef.current && sphereVisible) {
            // Animate sphere position based on scroll progress
            const sphereY = THREE.MathUtils.lerp(-8, -4, scrollProgress)
            sphereRef.current.position.y = sphereY

            // Update sphere material uniforms
            if (atmosphereMaterialRef.current) {
                atmosphereMaterialRef.current.uniforms.uTime.value =
                    state.clock.elapsedTime
                atmosphereMaterialRef.current.uniforms.uScrollProgress.value =
                    scrollProgress * values.scrollEffect
            }
        }

        if (isHorizontalSection) {
            const totalProgress = scrollProgress
            const section1Progress = Math.min(1, totalProgress / 0.33)
            const section2Progress = Math.max(
                0,
                Math.min(1, (totalProgress - 0.28) / 0.33)
            )
            const section3Progress = Math.max(
                0,
                Math.min(1, (totalProgress - 0.61) / 0.34)
            )

            // More dynamic position calculations
            let targetX = 0
            let targetY = 0
            let targetZ = 0

            // Section 1: Dramatic rise and spin
            if (section1Progress > 0) {
                targetY = THREE.MathUtils.lerp(0, 1.2, section1Progress)
                targetZ = THREE.MathUtils.lerp(0, -0.8, section1Progress)
                targetY += Math.sin(time * 3) * 0.08 * (1 - section1Progress)
            }

            // Section 2: Sweeping side movement
            if (section2Progress > 0) {
                targetX = THREE.MathUtils.lerp(0, -2.0, section2Progress)
                targetY =
                    THREE.MathUtils.lerp(targetY, 0.6, section2Progress) +
                    Math.sin(section2Progress * Math.PI) * 0.4
                targetZ =
                    THREE.MathUtils.lerp(targetZ, 0.4, section2Progress) +
                    Math.cos(section2Progress * Math.PI) * 0.2
            }

            // Section 3: Dynamic final positioning
            if (section3Progress > 0) {
                targetX = THREE.MathUtils.lerp(targetX, -1.2, section3Progress)
                targetY = THREE.MathUtils.lerp(targetY, 0.8, section3Progress)
                targetZ = THREE.MathUtils.lerp(targetZ, -0.3, section3Progress)
                // Add floating motion in final position
                targetY += Math.sin(time * 2) * 0.08 * section3Progress
                targetX += Math.sin(time * 1.5) * 0.08 * section3Progress
            }

            // Add continuous motion
            targetY += Math.sin(time * 2) * 0.04
            targetZ += Math.sin(time * 1.5) * 0.04

            // Wider position ranges but still clamped
            targetX = THREE.MathUtils.clamp(targetX, -2.2, 1)
            targetY = THREE.MathUtils.clamp(targetY, -0.4, 1.5)
            targetZ = THREE.MathUtils.clamp(targetZ, -1.0, 1)

            transitionState.targetPosition.set(targetX, targetY, targetZ)

            // More dramatic rotation
            const targetEuler = new THREE.Euler(
                Math.sin(time) * 0.2 + section2Progress * Math.PI * 0.2,
                THREE.MathUtils.lerp(0, Math.PI * 12, section1Progress) +
                Math.sin(time * 0.5) * 0.3,
                Math.sin(time * 0.7) * 0.15 * (1 - section3Progress)
            )
            transitionState.targetQuaternion.setFromEuler(targetEuler)

            // Dynamic scale pulsing
            const baseScale = 1 - section3Progress * 0.15
            const pulseScale =
                1 + Math.sin(time * 2) * 0.1 * (1 - section3Progress)
            transitionState.targetScale.setScalar(baseScale * pulseScale)

            // Faster transitions for more dynamic movement
            const transitionSpeed = stateChanged ? 0.1 : 0.3

            // Apply transitions
            lerpV3(
                canRef.current.position,
                transitionState.targetPosition,
                lerpFactor * transitionSpeed
            )

            const currentQuat = new THREE.Quaternion()
            currentQuat.setFromEuler(canRef.current.rotation)
            slerpQ(
                currentQuat,
                transitionState.targetQuaternion,
                lerpFactor * transitionSpeed
            )
            canRef.current.setRotationFromQuaternion(currentQuat)

            lerpV3(
                canRef.current.scale,
                transitionState.targetScale,
                lerpFactor * transitionSpeed
            )
        } else {
            // Enhanced idle animation with dynamic influences
            if (!isHorizontalSection) {
                const pulseInfluence = Math.sin(time * values.pulseFrequency)
                const windEffect = Math.sin(time * 0.3) * Math.cos(time * 0.7)

                const idlePosition = new THREE.Vector3(
                    Math.sin(time * 0.5) * 0.15 + windEffect * 0.05,
                    Math.sin(time) * 0.2 + Math.sin(time * 0.5) * 0.15,
                    Math.sin(time * 0.7) * 0.15 + pulseInfluence * 0.05
                )

                const idleRotation = new THREE.Euler(
                    Math.sin(time * 0.5) * 0.15,
                    time * 0.15 + Math.sin(time * 0.3) * 0.2,
                    Math.sin(time * 0.7) * 0.1 * (1 + pulseInfluence * 0.2)
                )

                const breathingScale =
                    1 + Math.sin(time * 0.8) * 0.08 * (1 + pulseInfluence * 0.1)
                const idleScale = new THREE.Vector3().setScalar(breathingScale)

                const transitionSpeed = stateChanged ? 0.1 : 0.2
                lerpV3(
                    canRef.current.position,
                    idlePosition,
                    lerpFactor * transitionSpeed
                )

                const idleQuat = new THREE.Quaternion().setFromEuler(
                    idleRotation
                )
                const currentQuat = new THREE.Quaternion()
                currentQuat.setFromEuler(canRef.current.rotation)
                slerpQ(currentQuat, idleQuat, lerpFactor * transitionSpeed)
                canRef.current.setRotationFromQuaternion(currentQuat)

                lerpV3(
                    canRef.current.scale,
                    idleScale,
                    lerpFactor * transitionSpeed
                )
            }
        }

        // Smoother position clamping
        const maxDelta = 0.2 // Increased for more dynamic movement
        const positionDelta = canRef.current.position
            .clone()
            .sub(prevState.current.position)
        const deltaLength = positionDelta.length()

        if (deltaLength > maxDelta) {
            positionDelta.multiplyScalar(maxDelta / deltaLength)
            canRef.current.position
                .copy(prevState.current.position)
                .add(positionDelta)
        }
    })

    return (
        <group
            ref={groupRef}
            position={[0, -1, 0]}
        >
            <Float
                speed={1.5}
                rotationIntensity={0.6}
                floatIntensity={0.6}
                floatingRange={[-0.1, 0.1]}
            >
                <Model canRef={canRef} />
            </Float>

            <group
                ref={sphereRef}
                position={[0, sphereAnimation.startY, 0]}
                visible={sphereVisible}
            >
                {/* Enhanced atmospheric sphere */}
                <mesh scale={1}>
                    <sphereGeometry args={[2.86, 256, 256]} />
                    <pS1Material
                        ref={atmosphereMaterialRef}
                        transparent={true}
                        depthWrite={true}
                        depthTest={true}
                        blending={THREE.AdditiveBlending}
                    />
                </mesh>

                {/* Inner glow sphere */}
                <mesh scale={0.75}>
                    <sphereGeometry args={[3.8, 256, 256]} />
                    <MeshTransmissionMaterial
                        {...materialConfigs.transmission}
                    />
                </mesh>
            </group>

            {/* Enhanced lighting setup */}
            <ambientLight intensity={values.ambientIntensity * 0.1} />

            {/* Dynamic lighting system */}
            {useFrame(({ clock }) => {
                const time = clock.elapsedTime
                return (
                    <>
                        {/* Dynamic key light */}
                        <SpotLight
                            position={[3, 4, 2]}
                            angle={0.3}
                            penumbra={0.9}
                            intensity={
                                2.5 *
                                (1 +
                                    Math.sin(
                                        time * values.lightTransitionSpeed
                                    ) *
                                    0.2)
                            }
                            distance={8}
                            castShadow
                            shadow-bias={-0.0001}
                            shadow-mapSize={[1080, 1080]}
                            color='#b1e1ff'
                        />

                        {/* Animated fill light */}
                        <SpotLight
                            position={[-4, 2, -2]}
                            angle={0.4}
                            penumbra={1}
                            intensity={
                                1.5 *
                                (1 +
                                    Math.sin(
                                        time * values.lightTransitionSpeed * 0.7
                                    ) *
                                    0.15)
                            }
                            distance={10}
                            color='#4499ff'
                        />

                        {/* Dynamic rim light */}
                        <SpotLight
                            position={[-2, 3, 4]}
                            angle={0.3}
                            penumbra={0.8}
                            intensity={
                                1.2 *
                                (1 +
                                    Math.sin(
                                        time * values.lightTransitionSpeed * 1.2
                                    ) *
                                    0.1)
                            }
                            distance={8}
                            color='#ffffff'
                        />

                        {/* Atmospheric ground fill */}
                        <SpotLight
                            position={[0, -3, 0]}
                            angle={0.8}
                            penumbra={1}
                            intensity={
                                0.3 *
                                (1 +
                                    Math.sin(
                                        time * values.lightTransitionSpeed * 0.5
                                    ) *
                                    0.2)
                            }
                            distance={5}
                            color='#4466ff'
                        />
                    </>
                )
            })}
        </group>
    )
}

// Preload the model
useGLTF.preload("/src/assets/can.glb")
