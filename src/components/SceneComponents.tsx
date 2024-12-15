import { Box, Float, SpotLight, ContactShadows, Environment, MeshTransmissionMaterial, Preload } from '@react-three/drei';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useSpring, useTransform } from 'framer-motion';
import * as THREE from 'three';
import { useScrollContext } from '../context/ScrollContext';
import { useFrame } from '@react-three/fiber';

export function AnimatedCan() {
    const canRef = useRef<THREE.Mesh>(null);
    const [isReady, setIsReady] = useState(false);
    const { scrollProgress, isHorizontalSection } = useScrollContext();
    const floatRef = useRef<THREE.Group>(null);
    const lastLogTime = useRef(0);

    // More responsive spring settings
    const smoothRotation = useSpring(0, {
        stiffness: 400,    // Increased for faster response
        damping: 50,       // Balanced damping
        mass: 0.5,         // Reduced mass for quicker movement
        restSpeed: 0.001   // Smaller rest speed for more precision
    });

    // Initial position and scale springs
    const initialY = useSpring(-5, {
        stiffness: 50,
        damping: 15,
        restDelta: 0.001
    });

    const initialScale = useSpring(0, {
        stiffness: 60,
        damping: 12,
        restDelta: 0.001
    });

    // Store previous scroll state to detect changes
    const prevScrollState = useRef({ progress: 0, isInSection: false });

    // Debounced logging function
    const logRotationUpdate = useCallback((currentRotation: number) => {
        const now = Date.now();
        if (now - lastLogTime.current > 100) { // Only log every 100ms
            console.log('Rotation Update:', {
                scrollProgress,
                isHorizontalSection,
                currentRotation,
                time: new Date().toISOString()
            });
            lastLogTime.current = now;
        }
    }, [scrollProgress, isHorizontalSection]);

    // Update rotation spring
    useEffect(() => {
        console.log('Rotation Effect:', {
            isHorizontalSection,
            scrollProgress,
            prevProgress: prevScrollState.current.progress,
            prevInSection: prevScrollState.current.isInSection,
            time: new Date().toISOString()
        });

        if (isHorizontalSection) {
            const targetRotation = scrollProgress * Math.PI * 2;
            console.log('Setting rotation:', targetRotation);
            smoothRotation.set(targetRotation);
        } else {
            console.log('Resetting rotation');
            smoothRotation.set(0);
        }

        prevScrollState.current = {
            progress: scrollProgress,
            isInSection: isHorizontalSection
        };
    }, [scrollProgress, isHorizontalSection]);

    // Initial animation
    useEffect(() => {
        setIsReady(true);
        initialY.set(0);
        initialScale.set(1);
    }, []);

    // Animate can rotation and position using spring values
    useFrame(() => {
        if (!canRef.current || !isReady) return;

        const currentRotation = smoothRotation.get();
        
        // Log rotation updates (debounced)
        logRotationUpdate(currentRotation);

        // Only apply rotation when in horizontal section
        if (isHorizontalSection) {
            canRef.current.rotation.y = currentRotation;
            
            // Add subtle tilt based on rotation speed
            const rotationSpeed = Math.abs(currentRotation - prevScrollState.current.progress);
            canRef.current.rotation.z = Math.sin(currentRotation) * 0.1 * rotationSpeed;
        }

        // Initial animation values
        canRef.current.position.y = initialY.get();
        const scale = initialScale.get();
        canRef.current.scale.set(scale, scale, scale);
        
        if (floatRef.current) {
            floatRef.current.position.y = isHorizontalSection 
                ? -0.5 + Math.sin(currentRotation) * 0.1 
                : 0;
        }
    });

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

export function SceneContent() {
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
            <Preload all />
        </>
    );
} 