import React, { useRef, useEffect, useState, useContext } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Suspense } from "react"
import * as THREE from "three"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import {
    Box,
    Float,
    SpotLight,
    ContactShadows,
    Environment,
    MeshTransmissionMaterial,
    Preload,
} from "@react-three/drei"

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger)

// Create a context for sharing scroll state
interface ScrollContextType {
    scrollProgress: number
    isHorizontalSection: boolean
}

const ScrollContext = React.createContext<ScrollContextType>({
    scrollProgress: 0,
    isHorizontalSection: false,
})

export const useScrollContext = () => useContext(ScrollContext)

function AnimatedCan() {
    const canRef = useRef<THREE.Mesh>(null)
    const floatRef = useRef<THREE.Group>(null)
    const [isReady, setIsReady] = useState(false)
    const { scrollProgress, isHorizontalSection } = useScrollContext()
    const rotationRef = useRef({
        current: 0,
        target: 0,
        defaultRotation: 0,
        sideRotation: Math.PI / 2, // 90 degrees for opposite orientation
    })

    // Initial animation timeline
    useEffect(() => {
        if (!canRef.current) return

        const tl = gsap.timeline()
        tl.to(canRef.current.position, {
            y: 0,
            duration: 1.5,
            ease: "power2.out",
        })
        tl.to(
            canRef.current.scale,
            {
                x: 1,
                y: 1,
                z: 1,
                duration: 1.2,
                ease: "back.out(1.7)",
            },
            "-=1.2"
        )

        setIsReady(true)

        return () => {
            tl.kill()
        }
    }, [])

    // Update rotation based on scroll progress
    useFrame((state) => {
        if (!canRef.current || !isReady) return

        if (isHorizontalSection) {
            // Smoother rotation timing curve
            const rotationProgress = THREE.MathUtils.smoothstep(
                Math.max((scrollProgress - 0.1) * 1.5, 0),
                0,
                1
            )

            rotationRef.current.target = THREE.MathUtils.lerp(
                rotationRef.current.defaultRotation,
                rotationRef.current.sideRotation,
                rotationProgress
            )

            // Smoother camera movement during rotation
            const cameraX = THREE.MathUtils.lerp(-2, -1.5, rotationProgress)
            const cameraY = THREE.MathUtils.lerp(1, 1.2, rotationProgress)
            const cameraZ = THREE.MathUtils.lerp(4, 3.5, rotationProgress)

            state.camera.position.lerp(
                new THREE.Vector3(cameraX, cameraY, cameraZ),
                0.03
            )

            // Smoother position adjustments for the can
            if (canRef.current) {
                canRef.current.position.y = THREE.MathUtils.lerp(
                    0,
                    0.2,
                    rotationProgress
                )
                canRef.current.position.z = THREE.MathUtils.lerp(
                    0,
                    -0.3,
                    rotationProgress
                )
            }
        } else {
            // Reset camera and can position smoothly
            state.camera.position.lerp(
                new THREE.Vector3(-2, 1, 4),
                0.03
            )
            
            rotationRef.current.target = rotationRef.current.defaultRotation
            if (canRef.current) {
                canRef.current.position.y = THREE.MathUtils.lerp(
                    canRef.current.position.y,
                    0,
                    0.03
                )
                canRef.current.position.z = THREE.MathUtils.lerp(
                    canRef.current.position.z,
                    0,
                    0.03
                )
            }
        }

        // Even smoother rotation transition
        rotationRef.current.current += (
            rotationRef.current.target - rotationRef.current.current
        ) * 0.03 // Reduced from 0.05 for even smoother motion

        // Apply rotations
        canRef.current.rotation.z = rotationRef.current.current
    })

    return (
        <Float
            ref={floatRef}
            speed={1.5} // Reduced for more subtle movement
            rotationIntensity={0.1} // Reduced for more subtle movement
            floatIntensity={0.3} // Reduced for more subtle movement
            floatingRange={[-0.05, 0.05]} // Reduced range
        >
            <Box
                ref={canRef}
                args={[0.54, 1.23, 0.54]}
                rotation={[0, 0, 0]}
                position={[0, -5, 0]}
                scale={[0, 0, 0]}
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
                    color='#ffffff'
                />
            </Box>
        </Float>
    )
}

function SceneContent() {
    return (
        <>
            <Environment preset='studio' />
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
                color='#ffffff'
            />
            <SpotLight
                position={[-5, 3, 2]}
                angle={0.5}
                penumbra={1}
                intensity={0.5}
                distance={6}
                color='#b1e1ff'
            />
            <ContactShadows
                position={[0, -3, 0]}
                opacity={0.4}
                scale={20}
                blur={2}
                far={4}
                resolution={512}
                color='#000000'
            />
            <AnimatedCan />
            <Preload all />
        </>
    )
}

const QuantumPage = () => {
    const containerRef = useRef<HTMLDivElement>(null)
    const canvasContainerRef = useRef<HTMLDivElement>(null)
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
    const [scrollState, setScrollState] = useState<ScrollContextType>({
        scrollProgress: 0,
        isHorizontalSection: false,
    })

    // Handle canvas dimensions
    useEffect(() => {
        if (!canvasContainerRef.current) return

        const updateDimensions = () => {
            if (canvasContainerRef.current) {
                setDimensions({
                    width: canvasContainerRef.current.clientWidth,
                    height: canvasContainerRef.current.clientHeight,
                })
            }
        }

        updateDimensions()
        const resizeObserver = new ResizeObserver(updateDimensions)
        resizeObserver.observe(canvasContainerRef.current)

        return () => resizeObserver.disconnect()
    }, [])

    // Setup horizontal scroll animation
    useEffect(() => {
        const sections = gsap.utils.toArray<HTMLElement>(".panel")

        const scrollTween = gsap.to(sections, {
            xPercent: -100 * (sections.length - 1),
            ease: "none",
            scrollTrigger: {
                trigger: "#horizontalSection",
                pin: true,
                scrub: 1,
                end: () => `+=${window.innerWidth * (sections.length - 1)}`,
                invalidateOnRefresh: true,
                onUpdate: (self) => {
                    setScrollState({
                        scrollProgress: self.progress,
                        isHorizontalSection: self.isActive,
                    })
                },
            },
        })

        return () => {
            scrollTween.kill()
        }
    }, [])

    return (
        <ScrollContext.Provider value={scrollState}>
            <div
                ref={canvasContainerRef}
                className='fixed inset-0 w-full h-full overflow-hidden'
                style={{
                    background:
                        "radial-gradient(circle at center, #1a1a1a 0%, #000000 100%)",
                }}
            >
                {dimensions.width > 0 && (
                    <Canvas
                        shadows
                        camera={{ position: [-2, 1, 4], fov: 35 }}
                        style={{
                            position: "absolute",
                            width: `${dimensions.width}px`,
                            height: `${dimensions.height}px`,
                        }}
                        gl={{
                            antialias: true,
                            toneMapping: THREE.ACESFilmicToneMapping,
                            toneMappingExposure: 1.5,
                        }}
                    >
                        <color
                            attach='background'
                            args={["#000000"]}
                        />
                        <fog
                            attach='fog'
                            args={["#000000", 5, 15]}
                        />
                        <Suspense fallback={null}>
                            <SceneContent />
                        </Suspense>
                    </Canvas>
                )}
            </div>

            <div
                ref={containerRef}
                className='relative w-full'
            >
                {/* Hero Section */}
                <section className='h-screen flex flex-col items-center justify-start pt-24'>
                    <h1 className='text-white font-editorial text-[4.5vw] text-center max-w-[60vw]'>
                        For those moments when you need a different version of
                        now.
                    </h1>
                    <h2 className='text-white/80 font-mono text-2xl mt-4'>
                        CTRL-Z: Reality's Undo Button
                    </h2>
                </section>

                {/* Horizontal Scroll Section */}
                <section
                    id='horizontalSection'
                    className='relative h-screen overflow-hidden'
                >
                    <div className='flex'>
                        {/* Panel 1 */}
                        <div className='panel min-w-[100vw] h-screen p-16 grid grid-rows-6 grid-cols-12 gap-8'>
                            <h2 className='col-span-4 col-start-2 row-start-3 row-span-2 text-white/95 font-editorial text-[4.5vw] tracking-[-0.02em] leading-[1.2] flex items-center'>
                                You've been there. That moment when everything
                                goes sideways.
                            </h2>
                        </div>

                        {/* Panel 2 */}
                        <div className='panel min-w-[100vw] h-screen p-16 grid grid-rows-6 grid-cols-12 gap-8'>
                            {/* Core Features - Using modular scale */}
                            <div className='col-span-5 col-start-2 row-start-2 row-span-2 flex flex-col gap-12'>
                                <p className='text-white/95 font-mono text-base uppercase tracking-[0.25em]'>
                                    Core Features
                                </p>
                                <div className='text-white/80 font-mono text-sm leading-[2.4] tracking-wide space-y-6'>
                                    <p className='border-l border-white/20 pl-6 transition-all hover:border-white/95 hover:text-white/95'>
                                        TIMESTREAM™ NAVIGATION SYSTEM
                                    </p>
                                    <p className='border-l border-white/20 pl-6 transition-all hover:border-white/95 hover:text-white/95'>
                                        REALITY-GRADE QUANTUM STABILIZERS
                                    </p>
                                    <p className='border-l border-white/20 pl-6 transition-all hover:border-white/95 hover:text-white/95'>
                                        NEURAL-SYNC TASTE PROFILE
                                    </p>
                                    <p className='border-l border-white/20 pl-6 transition-all hover:border-white/95 hover:text-white/95'>
                                        INSTANT TIMELINE ACCESS
                                    </p>
                                </div>
                            </div>

                            <h2 className='col-span-8 col-start-2 row-start-6 text-white/95 font-editorial text-[2.5vw] tracking-[-0.01em] leading-[1.3] flex items-center'>
                                When the timeline you're in is not the one you
                                wanted.
                            </h2>
                        </div>

                        {/* Panel 3 */}
                        <div className='panel min-w-[100vw] h-screen p-16 grid grid-rows-6 grid-cols-12 gap-8'>
                            <h2 className='col-span-8 row-span-1 row-start-1 text-white/95 font-editorial text-[4.5vw] tracking-[-0.02em] leading-[1.1] flex items-center font-light'>
                                Until now, you lived with it.
                            </h2>
                            <div className='col-span-4 col-start-12 row-start-5 flex flex-col gap-12'>
                                <p className='text-white/95 font-mono text-base uppercase tracking-[0.25em]'>
                                    Technical Details
                                </p>
                                <div className='text-white/80 font-mono text-sm leading-[2.4] tracking-wide flex flex-col'>
                                    <p className='py-5 border-t border-white/20 transition-all hover:text-white/95'>QUANTUM CORE RT-749</p>
                                    <p className='py-5 border-t border-white/20 transition-all hover:text-white/95'>SERIES SHIFT-X</p>
                                    <p className='py-5 border-t border-b border-white/20 transition-all hover:text-white/95'>EST. 2038</p>
                                </div>
                            </div>
                        </div>

                        {/* Panel 4 */}
                        <div className='panel min-w-[100vw] h-screen p-16 grid grid-rows-6 grid-cols-12 gap-8'>
                            <h2 className='col-span-12 row-span-1 row-start-1 text-white/95 text-[7vw] tracking-[-0.03em] leading-[1] flex items-center justify-center'>
                                Now you can fix it.
                            </h2>
                        </div>
                    </div>
                </section>

                <section className='h-screen flex flex-col items-center justify-center'>
                    <div className='container mx-auto grid grid-cols-12 gap-8 px-8'>
                        {/* Left side - Large heading */}
                        <div className='col-span-6'>
                            <h2 className='text-white font-editorial text-6xl leading-tight'>
                                When we first announced
                                <br />
                                a beverage that could alter
                                <br />
                                reality, they called us mad.
                                <br />
                                <br />
                                88 billion successful
                                <br />
                                reality shifts later, they
                                <br />
                                call us the future.
                            </h2>
                        </div>

                        {/* Right side - Reviews */}
                        <div className='col-span-5 col-start-8 space-y-8'>
                            {/* Review 1 */}
                            <div className='space-y-4'>
                                <div className='flex'>
                                    {[...Array(5)].map((_, i) => (
                                        <span
                                            key={i}
                                            className='text-white text-xl'
                                        >
                                            ★
                                        </span>
                                    ))}
                                </div>
                                <p className='text-white/90 font-mono text-lg leading-relaxed'>
                                    Yesterday, I made the worst presentation of
                                    my career. Or I would have, if ctrl-z hadn't
                                    helped me find the timeline where I
                                    remembered to actually save my slides. The
                                    look on my alternate self's face was
                                    priceless. Worth every penny.
                                </p>
                            </div>

                            {/* Review 2 */}
                            <div className='space-y-4'>
                                <div className='flex'>
                                    {[...Array(5)].map((_, i) => (
                                        <span
                                            key={i}
                                            className='text-white text-xl'
                                        >
                                            ★
                                        </span>
                                    ))}
                                </div>
                                <p className='text-white/90 font-mono text-lg leading-relaxed'>
                                    Used to spend hours overthinking my
                                    decisions. Now I just ctrl-z through a few
                                    realities until I find the one that clicks.
                                    Though I should mention - don't try it
                                    during a job interview. Explaining why
                                    you're suddenly speaking fluent Mandarin
                                    when your resume says you only know English
                                    can get... awkward.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer Section */}
                <section className='h-screen flex items-center justify-center'>
                    <div className='text-center px-4'>
                        <h2 className='text-white/90 font-editorial text-6xl mb-8'>
                            BEGIN YOUR QUANTUM JOURNEY
                        </h2>
                        <p className='text-white/70 text-xl font-geist-mono max-w-2xl mx-auto mb-12'>
                            Step into the future of computing where
                            possibilities are limitless.
                        </p>
                        <div className='space-x-6'>
                            <button className='px-8 py-3 text-white/90 font-mono rounded hover:bg-white/20 transition-all duration-300'>
                                EXPLORE NOW
                            </button>
                            <button className='px-8 py-3 text-white/90 font-mono rounded hover:bg-white/10 transition-all duration-300'>
                                LEARN MORE
                            </button>
                        </div>
                    </div>
                </section>
            </div >
        </ScrollContext.Provider >
    )
}

export default QuantumPage
