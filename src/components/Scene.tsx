import { Canvas } from '@react-three/fiber';
import { Suspense, useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function Scene() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Start from translated position
        gsap.set(containerRef.current, {
            yPercent: 100
        });

        // Animate upwards
        const tl = gsap.timeline();
        tl.to(containerRef.current, {
            yPercent: 0,
            duration: 1.2,
            ease: "power3.out",
            delay: 0.2 // Small delay after loader completes
        });

        return () => {
            tl.kill();
        };
    }, []);

    return (
        <div ref={containerRef} className="fixed inset-0">
            <Canvas>
                <Suspense fallback={null}>
                    <ambientLight intensity={0.5} />
                    <directionalLight position={[10, 10, 5]} intensity={1} />
                    <mesh>
                        <boxGeometry args={[1, 1, 1]} />
                        <meshStandardMaterial color="#ffffff" />
                    </mesh>
                </Suspense>
            </Canvas>
        </div>
    );
} 