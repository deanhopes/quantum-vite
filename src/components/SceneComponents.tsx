import {
    Box,
    Float,
    SpotLight,
    ContactShadows,
    Environment,
    MeshTransmissionMaterial,
    Preload,
} from "@react-three/drei"
import {useEffect, useRef, useState, useCallback} from "react"
import * as THREE from "three"
import {useScrollContext} from "../context/ScrollContext"
import {useFrame} from "@react-three/fiber"
import {useControls, folder} from "leva"

interface SpringConfig {
    stiffness?: number
    damping?: number
    mass?: number
}

interface Spring {
    target: number
    current: number
    velocity: number
    set: (value: number) => void
    get: () => number
    update: (deltaTime?: number) => number
}

interface MaterialProps {
    thickness: number
    chromaticAberration: number
    anisotropy: number
    distortion: number
    metalness: number
    roughness: number
    clearcoat: number
    ior: number
    color: string
}

interface SceneControls {
    keyLight: {
        keyPosition: [number, number, number]
        keyIntensity: number
        keyColor: string
        keyAngle: number
        keyPenumbra: number
    }
    fillLight: {
        fillPosition: [number, number, number]
        fillIntensity: number
        fillColor: string
    }
    rimLight: {
        rimPosition: [number, number, number]
        rimIntensity: number
        rimColor: string
    }
    shadows: {
        shadowOpacity: number
        shadowBlur: number
        shadowFar: number
    }
    material: MaterialProps
}

// Spring animation helper
const createSpring = (initialValue = 0, config: SpringConfig = {}): Spring => {
    const {
        stiffness = 80,
        damping = 10,
        mass = 1,
    } = config

    return {
        target: initialValue,
        current: initialValue,
        velocity: 0,

        set(value: number) {
            this.target = value
        },

        get() {
            return this.current
        },

        update(deltaTime = 1/60) {
            const spring = -stiffness * (this.current - this.target)
            const damper = -damping * this.velocity
            const acceleration = (spring + damper) / mass
            
            this.velocity += acceleration * deltaTime
            this.current += this.velocity * deltaTime
            
            return this.current
        }
    }
}

export function AnimatedCan({material}: {material: MaterialProps}) {
    const canRef = useRef<THREE.Mesh>(null)
    const [isReady, setIsReady] = useState(false)
    const {scrollProgress, isHorizontalSection} = useScrollContext()
    const floatRef = useRef<THREE.Group>(null)
    const lastLogTime = useRef(0)

    // Custom spring instances
    const smoothRotation = useRef(createSpring(0, {
        stiffness: 400,
        damping: 50,
        mass: 0.5
    }))

    const initialY = useRef(createSpring(-5, {
        stiffness: 50,
        damping: 15
    }))

    const initialScale = useRef(createSpring(0, {
        stiffness: 60,
        damping: 12
    }))

    // Store previous scroll state to detect changes
    const prevScrollState = useRef({progress: 0, isInSection: false})

    // Debounced logging function
    const logRotationUpdate = useCallback(
        (currentRotation: number) => {
            const now = Date.now()
            if (now - lastLogTime.current > 100) {
                console.log("Rotation Update:", {
                    scrollProgress,
                    isHorizontalSection,
                    currentRotation,
                    time: new Date().toISOString(),
                })
                lastLogTime.current = now
            }
        },
        [scrollProgress, isHorizontalSection]
    )

    // Update rotation spring
    useEffect(() => {
        console.log("Rotation Effect:", {
            isHorizontalSection,
            scrollProgress,
            prevProgress: prevScrollState.current.progress,
            prevInSection: prevScrollState.current.isInSection,
            time: new Date().toISOString(),
        })

        if (isHorizontalSection) {
            const targetRotation = scrollProgress * Math.PI * 2
            console.log("Setting rotation:", targetRotation)
            smoothRotation.current.set(targetRotation)
        } else {
            console.log("Resetting rotation")
            smoothRotation.current.set(0)
        }

        prevScrollState.current = {
            progress: scrollProgress,
            isInSection: isHorizontalSection,
        }
    }, [scrollProgress, isHorizontalSection])

    // Initial animation
    useEffect(() => {
        setIsReady(true)
        initialY.current.set(0)
        initialScale.current.set(1)
    }, [])

    // Animate can rotation and position using spring values
    useFrame((_, delta) => {
        if (!canRef.current || !isReady) return

        // Update spring physics
        const currentRotation = smoothRotation.current.update(delta)
        const currentY = initialY.current.update(delta)
        const currentScale = initialScale.current.update(delta)

        // Log rotation updates (debounced)
        logRotationUpdate(currentRotation)

        // Only apply rotation when in horizontal section
        if (isHorizontalSection) {
            canRef.current.rotation.y = currentRotation

            // Add subtle tilt based on rotation speed
            const rotationSpeed = Math.abs(
                currentRotation - prevScrollState.current.progress
            )
            canRef.current.rotation.z =
                Math.sin(currentRotation) * 0.1 * rotationSpeed
        }

        // Initial animation values
        canRef.current.position.y = currentY
        canRef.current.scale.set(currentScale, currentScale, currentScale)

        if (floatRef.current) {
            floatRef.current.position.y = isHorizontalSection
                ? -0.5 + Math.sin(currentRotation) * 0.1
                : 0
        }
    })

    return (
        <Float
            ref={floatRef}
            speed={2}
            rotationIntensity={isHorizontalSection ? 0.1 : 0.2}
            floatIntensity={isHorizontalSection ? 0.3 : 0.5}
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
                    thickness={material.thickness}
                    chromaticAberration={material.chromaticAberration}
                    anisotropy={material.anisotropy}
                    distortion={material.distortion}
                    distortionScale={0.1}
                    temporalDistortion={0.1}
                    metalness={material.metalness}
                    roughness={material.roughness}
                    envMapIntensity={1}
                    clearcoat={material.clearcoat}
                    clearcoatRoughness={0.1}
                    ior={material.ior}
                    color={material.color}
                />
            </Box>
        </Float>
    )
}

export function SceneContent() {
    const controls = useControls({
        keyLight: folder({
            keyPosition: {value: [3, 2, 2] as [number, number, number], step: 0.1},
            keyIntensity: {value: 1.5, min: 0, max: 5, step: 0.1},
            keyColor: "#ffffff",
            keyAngle: {value: 0.4, min: 0, max: Math.PI / 2},
            keyPenumbra: {value: 0.8, min: 0, max: 1},
        }),
        fillLight: folder({
            fillPosition: {value: [-2, 1, -1] as [number, number, number], step: 0.1},
            fillIntensity: {value: 0.8, min: 0, max: 5, step: 0.1},
            fillColor: "#b1e1ff",
        }),
        rimLight: folder({
            rimPosition: {value: [-1, 3, 3] as [number, number, number], step: 0.1},
            rimIntensity: {value: 1.2, min: 0, max: 5, step: 0.1},
            rimColor: "#ffffff",
        }),
        shadows: folder({
            shadowOpacity: {value: 0.5, min: 0, max: 1, step: 0.1},
            shadowBlur: {value: 2, min: 0, max: 10, step: 0.1},
            shadowFar: {value: 4, min: 1, max: 10, step: 0.1},
        }),
        material: folder({
            thickness: {value: 0.5, min: 0, max: 2, step: 0.1},
            chromaticAberration: {value: 0.2, min: 0, max: 1, step: 0.1},
            anisotropy: {value: 0.1, min: 0, max: 1, step: 0.1},
            distortion: {value: 0.2, min: 0, max: 1, step: 0.1},
            metalness: {value: 0.9, min: 0, max: 1, step: 0.1},
            roughness: {value: 0.1, min: 0, max: 1, step: 0.1},
            clearcoat: {value: 1, min: 0, max: 1, step: 0.1},
            ior: {value: 1.5, min: 1, max: 2.5, step: 0.1},
            color: "#ffffff",
        }),
    })

    // Extract the values from the controls
    const sceneControls: SceneControls = {
        keyLight: {
            keyPosition: controls.keyPosition,
            keyIntensity: controls.keyIntensity,
            keyColor: controls.keyColor,
            keyAngle: controls.keyAngle,
            keyPenumbra: controls.keyPenumbra,
        },
        fillLight: {
            fillPosition: controls.fillPosition,
            fillIntensity: controls.fillIntensity,
            fillColor: controls.fillColor,
        },
        rimLight: {
            rimPosition: controls.rimPosition,
            rimIntensity: controls.rimIntensity,
            rimColor: controls.rimColor,
        },
        shadows: {
            shadowOpacity: controls.shadowOpacity,
            shadowBlur: controls.shadowBlur,
            shadowFar: controls.shadowFar,
        },
        material: {
            thickness: controls.thickness,
            chromaticAberration: controls.chromaticAberration,
            anisotropy: controls.anisotropy,
            distortion: controls.distortion,
            metalness: controls.metalness,
            roughness: controls.roughness,
            clearcoat: controls.clearcoat,
            ior: controls.ior,
            color: controls.color,
        },
    }

    return (
        <>
            <Environment preset='night' />
            <ambientLight intensity={0.3} />

            <SpotLight
                position={sceneControls.keyLight.keyPosition}
                angle={sceneControls.keyLight.keyAngle}
                penumbra={sceneControls.keyLight.keyPenumbra}
                intensity={sceneControls.keyLight.keyIntensity}
                distance={6}
                castShadow
                shadow-bias={-0.0001}
                shadow-mapSize={[2048, 2048]}
                color={sceneControls.keyLight.keyColor}
            />

            <SpotLight
                position={sceneControls.fillLight.fillPosition}
                angle={0.5}
                penumbra={1}
                intensity={sceneControls.fillLight.fillIntensity}
                distance={6}
                color={sceneControls.fillLight.fillColor}
            />

            <SpotLight
                position={sceneControls.rimLight.rimPosition}
                angle={0.5}
                penumbra={0.8}
                intensity={sceneControls.rimLight.rimIntensity}
                distance={6}
                color={sceneControls.rimLight.rimColor}
            />

            <ContactShadows
                position={[0, -3, 0]}
                opacity={sceneControls.shadows.shadowOpacity}
                scale={20}
                blur={sceneControls.shadows.shadowBlur}
                far={sceneControls.shadows.shadowFar}
                resolution={512}
                color='#000000'
            />
            <AnimatedCan material={sceneControls.material} />
            <Preload all />
        </>
    )
}
