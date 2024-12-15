import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense } from 'react';
import * as THREE from 'three';
import { ScrollContextProvider } from '../context/ScrollContext';
import { Box, Float, SpotLight, ContactShadows, Environment, MeshTransmissionMaterial, Preload } from '@react-three/drei';
import { useScrollContext } from '../context/ScrollContext';

// AnimatedCan component
function AnimatedCan() {
    const canRef = useRef<THREE.Mesh>(null);
    const [isReady, setIsReady] = useState(false);
    const { scrollProgress, isHorizontalSection } = useScrollContext();
    const floatRef = useRef<THREE.Group>(null);
    const lastLogTime = useRef(0);

    // More responsive spring settings
    const smoothRotation = useSpring(0, {
        stiffness: 400,
        damping: 50,
        mass: 0.5,
        restSpeed: 0.001
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
        if (now - lastLogTime.current > 100) {
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
        if (isHorizontalSection) {
            const targetRotation = scrollProgress * Math.PI * 2;
            smoothRotation.set(targetRotation);
        } else {
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
        
        logRotationUpdate(currentRotation);

        if (isHorizontalSection) {
            canRef.current.rotation.y = currentRotation;
            
            const rotationSpeed = Math.abs(currentRotation - prevScrollState.current.progress);
            canRef.current.rotation.z = Math.sin(currentRotation) * 0.1 * rotationSpeed;
        }

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

// Scene content with lighting setup
function SceneContent() {
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

// Main QuantumPage component
const QuantumPage = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const targetRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const lastScrollLogTime = useRef(0);
    const canvasContainerRef = useRef<HTMLDivElement>(null);

    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [currentProgress, setCurrentProgress] = useState(0);
    const [isInHorizontalSection, setIsInHorizontalSection] = useState(false);

    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start start", "end start"],
        container: scrollContainerRef
    });

    const totalPanels = 4;
    const translateDistance = totalPanels * 100;

    const containerX = useTransform(
        scrollYProgress,
        [0, 1],
        [`0%`, `-${translateDistance}%`]
    );

    useEffect(() => {
        if (!canvasContainerRef.current) return;

        const updateDimensions = () => {
            if (canvasContainerRef.current) {
                setDimensions({
                    width: canvasContainerRef.current.clientWidth,
                    height: canvasContainerRef.current.clientHeight
                });
            }
        };

        updateDimensions();
        const resizeObserver = new ResizeObserver(updateDimensions);
        resizeObserver.observe(canvasContainerRef.current);
        
        return () => resizeObserver.disconnect();
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                const isSignificantlyVisible = entry.intersectionRatio > 0.5;
                setIsInHorizontalSection(isSignificantlyVisible);
                
                console.log('Intersection:', {
                    ratio: entry.intersectionRatio,
                    isSignificantlyVisible,
                    boundingClientRect: entry.boundingClientRect.top
                });
            },
            { 
                threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
                rootMargin: "-50% 0px -50% 0px"
            }
        );

        if (targetRef.current) {
            observer.observe(targetRef.current);
        }

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const unsubscribe = scrollYProgress.on("change", (value) => {
            setCurrentProgress(value);
        });

        return () => unsubscribe();
    }, [scrollYProgress]);

    const logScrollProgress = useCallback((value: number) => {
        const now = Date.now();
        if (now - lastScrollLogTime.current > 100) {
            console.log('Scroll Progress:', {
                value,
                isInHorizontalSection,
                time: new Date().toISOString()
            });
            lastScrollLogTime.current = now;
        }
    }, [isInHorizontalSection]);

    return (
        <>
            {/* 3D Scene */}
            <motion.div
                ref={canvasContainerRef}
                className="fixed inset-0 w-full h-full overflow-hidden m-0 p-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                style={{
                    willChange: 'transform, opacity',
                    background: 'radial-gradient(circle at center, #1a1a1a 0%, #000000 100%)',
                    margin: 0,
                    padding: 0
                }}
            >
                {dimensions.width > 0 && dimensions.height > 0 && (
<Canvas
    shadows
    camera={{ position: [-2, 1, 4], fov: 35 }}
    style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        touchAction: 'none',
        display: 'block',
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`,
        margin: 0,
        padding: 0
    }}
    gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.5,
        powerPreference: "high-performance"
    }}
>
    <color attach="background" args={['#000000']} />
    <fog attach="fog" args={['#000000', 5, 15]} />
    <Suspense fallback={null}>
        <ScrollContextProvider value={{
            scrollProgress: currentProgress,
            isHorizontalSection: isInHorizontalSection
        }}>
            <SceneContent />
        </ScrollContextProvider>
    </Suspense>
</Canvas>
                )}
            </motion.div>

            {/* Page Content */}
            <ScrollContextProvider value={{
                scrollProgress: currentProgress,
                isHorizontalSection: isInHorizontalSection
            }}>
                <div
                    ref={scrollContainerRef}
                    className="relative w-full h-screen overflow-y-auto overflow-x-hidden"
                    style={{ perspective: '1px' }}
                >
                    {/* Debug indicator */}
                    <div className="fixed top-4 left-4 z-50 bg-black/50 text-white px-4 py-2 rounded">
                        {isInHorizontalSection ? 'In Horizontal' : 'Outside'} - {(currentProgress * 100).toFixed(1)}%
                    </div>

                    <div ref={containerRef} className="relative w-full">
                        {/* Hero Section */}
                        <section className="h-screen flex flex-col items-center justify-start pt-24">
                            <h1 className="text-quantum-white font-sans text-3xl md:text-4xl lg:text-5xl text-center max-w-3xl">
                                For those moments when you need a different version of now.
                            </h1>
                            <h2 className="text-quantum-white/80 font-sans text-lg md:text-xl lg:text-2xl mt-4">
                                CTRL-Z: Reality's Undo Button
                            </h2>
                        </section>

                        {/* Horizontal Scroll Section */}
                        <section
                            ref={targetRef}
                            className="h-[400vh] relative backdrop-blur-sm"
                            style={{
                                willChange: 'transform',
                                contain: 'paint',
                                backfaceVisibility: 'hidden'
                            }}
                        >
                            <div className="sticky top-0 h-screen overflow-hidden">
                                <motion.div
                                    style={{ x: containerX }}
                                    className="relative flex gap-8 justify-start items-center h-full"
                                >
                                    {/* Panel 1 */}
                                    <div className="grid grid-rows-6 grid-cols-12 gap-4 p-8 min-w-[100vw] h-full">
                                        <h2 className="col-span-8 col-start-5 row-start-3 row-span-2 text-quantum-white/90 font-geist-mono text-2xl md:text-4xl lg:text-5xl tracking-tight leading-tight flex items-center justify-end">
                                            You've been there. That moment when everything goes sideways.
                                        </h2>
                                        <div className="col-span-12 row-span-4 flex items-end">
                                            <p className="text-quantum-white/50 font-geist-mono text-xs md:text-sm leading-relaxed">
                                                QUANTUM MECHANICS • SUPERPOSITION • ENTANGLEMENT
                                            </p>
                                        </div>
                                    </div>

                                    {/* Panel 2 */}
                                    <div className="grid grid-rows-6 grid-cols-12 gap-4 p-8 min-w-[100vw] h-full">
                                        <div className="col-span-12 row-span-2 flex flex-col gap-2">
                                            <p className='text-quantum-white/90 font-geist-mono text-sm md:text-base leading-relaxed flex items-center'>
                                                CORE FEATURES
                                            </p>
                                            <p className="text-quantum-white/70 font-geist-mono text-sm md:text-base leading-relaxed flex items-center">
                                                TIMESTREAM™ NAVIGATION SYSTEM<br />
                                                REALITY-GRADE QUANTUM STABILIZERS<br />
                                                NEURAL-SYNC TASTE PROFILE<br />
                                                INSTANT TIMELINE ACCESS
                                            </p>
                                        </div>
                                        <h2 className="col-span-8 row-start-6 row-span-3 text-quantum-white/90 font-geist-mono text-2xl md:text-4xl lg:text-5xl tracking-tight leading-tight flex items-center justify-end">
                                            When the reality you're in isn't the one you wanted.
                                        </h2>
                                        <div className="col-span-12 row-span-3 flex items-end justify-end">
                                            <p className="text-quantum-white/50 font-geist-mono text-xs md:text-sm leading-relaxed">
                                                COHERENCE • DECOHERENCE • QUANTUM GATES
                                            </p>
                                        </div>
                                    </div>

                                    {/* Panel 3 */}
                                    <div className="grid grid-rows-6 grid-cols-12 gap-4 p-8 min-w-[100vw] h-full">
                                        <h2 className="col-span-7 row-span-3 text-quantum-white/90 font-geist-mono text-2xl md:text-4xl lg:text-5xl tracking-tight leading-tight flex items-center">
                                            Until now, you lived with it.
                                        </h2>
                                        <div className="col-span-5 row-span-3 space-y-4 flex flex-col justify-center">
                                            <p className="text-quantum-white/70 font-geist-mono text-sm md:text-base leading-relaxed">
                                                Venturing into a realm where traditional computing boundaries dissolve.
                                            </p>
                                            <p className="text-quantum-white/50 font-geist-mono text-xs md:text-sm leading-relaxed">
                                                QUANTUM ADVANTAGE • COHERENCE • INTERFERENCE
                                            </p>
                                        </div>
                                    </div>

                                    {/* Panel 4 */}
                                    <div className="grid grid-rows-6 grid-cols-12 gap-4 p-8 min-w-[100vw] h-full">
                                        <h2 className="col-span-12 row-span-3 text-quantum-white/90 font-geist-mono text-2xl md:text-4xl lg:text-5xl tracking-tight leading-tight flex items-center justify-center">
                                            Now, you can fix it.
                                        </h2>
                                        <div className="col-span-5 row-span-12 row-start-6 space-y-4 flex flex-col justify-center">
                                            <p className="text-quantum-white/70 font-geist-mono text-sm md:text-base leading-relaxed">
                                                Venturing into a realm where traditional computing boundaries dissolve.
                                            </p>
                                            <p className="text-quantum-white/50 font-geist-mono text-xs md:text-sm leading-relaxed">
                                                QUANTUM ADVANTAGE • COHERENCE • INTERFERENCE
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </section>

                        {/* Footer Section */}
                        <section className="h-screen flex items-center justify-center">
                            <div className="text-center px-4">
                                <h2 className="text-quantum-white/90 font-geist-mono text-5xl md:text-6xl mb-8">
                                    BEGIN YOUR QUANTUM JOURNEY
                                </h2>
                                <p className="text-quantum-white/70 font-geist-mono text-lg md:text-xl max-w-2xl mx-auto mb-12">
                                    Step into the future of computing where possibilities are limitless
                                    and reality bends to quantum principles.
                                </p>
                                <div className="space-x-6">
                                    <button className="px-8 py-3 text-quantum-white/90 
                                        font-geist-mono rounded hover:bg-quantum-white/20 transition-all duration-300">
                                        EXPLORE NOW
                                    </button>
                                    <button className="px-8 py-3 text-quantum-white/90 
                                        font-geist-mono rounded hover:bg-quantum-white/10 transition-all duration-300">
                                        LEARN MORE
                                    </button>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </ScrollContextProvider>
        </>
    );
};

export default QuantumPage; 