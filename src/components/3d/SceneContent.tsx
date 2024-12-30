import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Environment, SpotLight, ContactShadows, Preload } from "@react-three/drei";
import * as THREE from "three";
import { useScrollContext } from "../types/ScrollContext";
import { SpaceBackground } from "./SpaceBackground";
import { QuantumGroup } from "./QuantumGroup";
import { lerpV3 } from "../../utils/animations";

export function SceneContent() {
    const { scrollProgress, isHorizontalSection } = useScrollContext();
    const cameraState = useRef({
        position: new THREE.Vector3(0, 2, 4),
        lookAt: new THREE.Vector3(0, 0, 0),
        velocity: new THREE.Vector3(),
        transitionProgress: 0
    });

    useFrame(({ camera, scene }) => {
        // Remove fog
        scene.fog = null;

        const lerpFactor = 0.02; // Adjust for camera smoothness
        const transitionSpeed = 0.05; // Speed of transition when leaving horizontal section

        // Update transition progress
        if (isHorizontalSection) {
            cameraState.current.transitionProgress = Math.min(1, cameraState.current.transitionProgress + transitionSpeed);
        } else {
            cameraState.current.transitionProgress = Math.max(0, cameraState.current.transitionProgress - transitionSpeed);
        }

        // Calculate camera position based on transition progress
        const startRadius = 4;
        const endRadius = 2;
        const radius = THREE.MathUtils.lerp(startRadius, endRadius, scrollProgress);
        const rotationAngle = THREE.MathUtils.lerp(0, Math.PI / 2, scrollProgress);
        const targetX = radius * Math.sin(rotationAngle);
        const targetZ = radius * Math.cos(rotationAngle);
        const targetY = THREE.MathUtils.lerp(2, 1, scrollProgress);

        // Calculate positions for both states
        const horizontalPosition = new THREE.Vector3(targetX, targetY, targetZ);
        const normalPosition = new THREE.Vector3(0, 2, 4);
        const finalPosition = new THREE.Vector3();
        finalPosition.lerpVectors(normalPosition, horizontalPosition, cameraState.current.transitionProgress);

        // Smooth camera position transition
        cameraState.current.position.copy(finalPosition);
        lerpV3(camera.position, cameraState.current.position, lerpFactor);

        // Smooth lookAt transition
        const lookAtY = THREE.MathUtils.lerp(0, 0.5, scrollProgress * cameraState.current.transitionProgress);
        cameraState.current.lookAt.set(0, lookAtY, 0);
        camera.lookAt(cameraState.current.lookAt);
        camera.updateProjectionMatrix();
    });

    return (
        <>
            <SpaceBackground />
            <Environment preset='night' background={false} />

            {/* Ambient base light */}
            <ambientLight intensity={0.3} />

            {/* Main directional key light */}
            <directionalLight
                position={[5, 5, 5]}
                intensity={0.8}
                color="#b1e1ff"
                castShadow
                shadow-bias={-0.0001}
                shadow-mapSize={[2048, 2048]}
            />

            {/* Fill light from opposite side */}
            <directionalLight
                position={[-5, 3, -2]}
                intensity={0.4}
                color="#4499ff"
            />

            {/* Soft top light */}
            <directionalLight
                position={[0, 8, 0]}
                intensity={0.2}
                color="#ffffff"
            />

            <ContactShadows
                position={[0, -0.49, 0]}
                opacity={0.15}
                scale={20}
                blur={3}
                far={4}
                resolution={512}
                color='#000000'
            />
            <QuantumGroup />
            <Preload all />
        </>
    );
} 