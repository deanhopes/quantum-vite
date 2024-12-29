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
        lookAt: new THREE.Vector3(0, -0, 0),
        velocity: new THREE.Vector3()
    });

    useFrame(({ camera }) => {
        const lerpFactor = 0.02; // Adjust for camera smoothness

        if (isHorizontalSection) {
            const radius = 12;
            const rotationAngle = THREE.MathUtils.lerp(0, Math.PI / 2, scrollProgress);
            const targetX = radius * Math.sin(rotationAngle);
            const targetZ = radius * Math.cos(rotationAngle);

            // Smooth camera position transition
            cameraState.current.position.set(targetX, 2, targetZ);
            lerpV3(camera.position, cameraState.current.position, lerpFactor);
        } else {
            // Transition back to initial position
            cameraState.current.position.set(0, 2, 4);
            lerpV3(camera.position, cameraState.current.position, lerpFactor);
        }

        // Smooth lookAt transition
        camera.lookAt(cameraState.current.lookAt);
        camera.updateProjectionMatrix();
    });

    return (
        <>
            <SpaceBackground />
            <Environment preset='night' />
            <ambientLight intensity={4} />
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
    );
} 