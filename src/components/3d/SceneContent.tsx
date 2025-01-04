import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import {
    Environment,
    ContactShadows,
    Preload,
    BakeShadows,
    AdaptiveEvents,
} from "@react-three/drei"
import { EffectComposer, Bloom, DepthOfField } from "@react-three/postprocessing"
import { BlendFunction, KernelSize } from "postprocessing"
import * as THREE from "three"
import { useScrollContext } from "../types/ScrollContext"
import { SpaceBackground } from "./SpaceBackground"
import { QuantumGroup } from "./QuantumGroup"
import { lerpV3 } from "../../utils/animations"

export function SceneContent() {
    const { scrollProgress, isHorizontalSection } = useScrollContext()
    const cameraState = useRef({
        position: new THREE.Vector3(0, 2, 4),
        lookAt: new THREE.Vector3(0, 0, 0),
        velocity: new THREE.Vector3(),
        transitionProgress: 0,
    })

    // Memoize constant values
    const constants = useMemo(
        () => ({
            lerpFactor: 0.02,
            transitionSpeed: 0.4,
            startRadius: 4,
            endRadius: 2,
        }),
        []
    )

    useFrame(({ camera, scene, gl }) => {
        scene.fog = null

        // Update transition progress with memoized constants
        if (isHorizontalSection) {
            cameraState.current.transitionProgress = Math.min(
                1,
                cameraState.current.transitionProgress +
                constants.transitionSpeed
            )
        } else {
            cameraState.current.transitionProgress = Math.max(
                0,
                cameraState.current.transitionProgress -
                constants.transitionSpeed
            )
        }

        // Calculate camera position based on transition progress
        const radius = THREE.MathUtils.lerp(
            constants.startRadius,
            constants.endRadius,
            scrollProgress
        )
        const rotationAngle = THREE.MathUtils.lerp(
            0,
            Math.PI / 4,
            scrollProgress
        )

        // Use temp vectors to avoid garbage collection
        const targetPosition = _tempVector.set(
            radius * Math.sin(rotationAngle),
            THREE.MathUtils.lerp(4, 1, scrollProgress),
            radius * Math.cos(rotationAngle)
        )

        // Calculate positions for both states using pooled vectors
        const horizontalPosition = _tempVector2.copy(targetPosition)
        const normalPosition = _tempVector3.set(0, 1, 6)
        const finalPosition = _tempVector4.lerpVectors(
            normalPosition,
            horizontalPosition,
            cameraState.current.transitionProgress
        )

        // Smooth camera position transition
        cameraState.current.position.copy(finalPosition)
        lerpV3(
            camera.position,
            cameraState.current.position,
            constants.lerpFactor
        )

        // Smooth lookAt transition
        const lookAtY = THREE.MathUtils.lerp(
            0,
            0.1,
            scrollProgress * cameraState.current.transitionProgress
        )
        cameraState.current.lookAt.set(0, lookAtY, 0)
        camera.lookAt(cameraState.current.lookAt)
        camera.updateProjectionMatrix()

        // Optimize render calls
        gl.setPixelRatio(Math.min(window.devicePixelRatio, 1))
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1

        // Enable depth test and proper depth buffer clearing
        const glContext = gl.getContext()
        glContext.enable(glContext.DEPTH_TEST)
        glContext.depthFunc(glContext.LEQUAL)
        glContext.clearDepth(1.0)
    })

    // Create reusable temp vectors outside the frame loop
    const _tempVector = useMemo(() => new THREE.Vector3(), [])
    const _tempVector2 = useMemo(() => new THREE.Vector3(), [])
    const _tempVector3 = useMemo(() => new THREE.Vector3(), [])
    const _tempVector4 = useMemo(() => new THREE.Vector3(), [])

    return (
        <>
            <SpaceBackground />

            {/* Enhanced lighting setup */}
            <ambientLight intensity={1} color="#b0c4de" />

            {/* Center blue glow light */}
            <spotLight
                position={[0, -1, 0]}
                angle={0.8}
                penumbra={1}
                intensity={2}
                color="#b6b6ff"
                distance={40}
                castShadow
                shadow-bias={-0.0001}
                shadow-mapSize={[512, 512]}
            />

            {/* Primary key light - dramatic top-down illumination */}
            <directionalLight
                position={[10, 1, 8]}
                intensity={2}
                color='#faf4e8'
                castShadow
                shadow-bias={-0.0001}
                shadow-mapSize={[2048, 2048]}
                shadow-camera-far={50}
                shadow-camera-near={0.1}
                shadow-camera-left={-10}
                shadow-camera-right={10}
                shadow-camera-top={10}
                shadow-camera-bottom={-10}
            />

            {/* Cool fill light for depth */}
            <directionalLight
                position={[-8, 5, -8]}
                intensity={0.7}
                color='#a6d1ff'
            />

            {/* Warm rim light for definition */}
            <directionalLight
                position={[0, -5, -15]}
                intensity={0.8}
                color='#ffd4a6'
            />

            {/* Atmospheric top light */}
            <directionalLight
                position={[0, 20, 0]}
                intensity={0.3}
                color='#ffffff'
            />

            {/* Enhanced contact shadows */}
            <ContactShadows
                position={[0, -0.1, 0]}
                opacity={0.6}
                scale={40}
                blur={2.5}
                far={4}
                resolution={512}
                color='#000000'
            />

            <QuantumGroup />
            <BakeShadows />
            <Preload all />


        </>
    )
}
