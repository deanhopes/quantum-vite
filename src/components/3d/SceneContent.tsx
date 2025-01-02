import {useRef, useMemo} from "react"
import {useFrame} from "@react-three/fiber"
import {
    Environment,
    ContactShadows,
    Preload,
    BakeShadows,
    AdaptiveEvents,
} from "@react-three/drei"
import * as THREE from "three"
import {useScrollContext} from "../types/ScrollContext"
import {SpaceBackground} from "./SpaceBackground"
import {QuantumGroup} from "./QuantumGroup"
import {lerpV3} from "../../utils/animations"

export function SceneContent() {
    const {scrollProgress, isHorizontalSection} = useScrollContext()
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
            transitionSpeed: 0.05,
            startRadius: 4,
            endRadius: 2,
        }),
        []
    )

    useFrame(({camera, scene, gl}) => {
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
            Math.PI / 2,
            scrollProgress
        )

        // Use temp vectors to avoid garbage collection
        const targetPosition = _tempVector.set(
            radius * Math.sin(rotationAngle),
            THREE.MathUtils.lerp(2, 1, scrollProgress),
            radius * Math.cos(rotationAngle)
        )

        // Calculate positions for both states using pooled vectors
        const horizontalPosition = _tempVector2.copy(targetPosition)
        const normalPosition = _tempVector3.set(0, 2, 4)
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
            0.9,
            scrollProgress * cameraState.current.transitionProgress
        )
        cameraState.current.lookAt.set(0, lookAtY, 0)
        camera.lookAt(cameraState.current.lookAt)
        camera.updateProjectionMatrix()

        // Optimize render calls
        gl.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    })

    // Create reusable temp vectors outside the frame loop
    const _tempVector = useMemo(() => new THREE.Vector3(), [])
    const _tempVector2 = useMemo(() => new THREE.Vector3(), [])
    const _tempVector3 = useMemo(() => new THREE.Vector3(), [])
    const _tempVector4 = useMemo(() => new THREE.Vector3(), [])

    return (
        <>
            <AdaptiveEvents />
            <SpaceBackground />
            <Environment
                preset='night'
                background={false}
            />

            {/* Optimized lighting setup */}
            <ambientLight intensity={0.8} />
            <directionalLight
                position={[5, 5, 5]}
                intensity={0.8}
                color='#ffffff'
                castShadow
                shadow-bias={-0.0001}
                shadow-mapSize={[1024, 1024]} // Reduced for better performance
                shadow-camera-far={20}
                shadow-camera-near={0.1}
            />
            <directionalLight
                position={[-5, 3, -2]}
                intensity={0.4}
                color='#ffffff'
            />
            <directionalLight
                position={[0, 8, 0]}
                intensity={0.2}
                color='#ffffff'
            />

            <ContactShadows
                position={[0, -0.49, 0]}
                opacity={0.15}
                scale={20}
                blur={2}
                far={4}
                resolution={256}
                color='#000000'
            />
            <QuantumGroup />
            <BakeShadows />
            <Preload all />
        </>
    )
}
