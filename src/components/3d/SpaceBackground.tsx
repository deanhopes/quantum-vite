import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";

export function SpaceBackground() {
    const starsRef = useRef<THREE.Points>(null);

    useFrame((state) => {
        if (starsRef.current) {
            starsRef.current.rotation.y += 0.0001;
            starsRef.current.rotation.x =
                Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
        }
    });

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
    );
} 