import React, {useRef, useEffect, useState, useContext} from "react"
import {Canvas, useFrame} from "@react-three/fiber"
import {Suspense} from "react"
import * as THREE from "three"
import gsap from "gsap"
import {ScrollTrigger} from "gsap/ScrollTrigger"
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
    const {scrollProgress, isHorizontalSection} = useScrollContext()
    const rotationRef = useRef({value: 0})

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
    useFrame(() => {
        if (!canRef.current || !isReady) return

        // Only rotate when in horizontal section
        if (isHorizontalSection) {
            // Calculate rotation based on scroll progress
            const targetRotation = scrollProgress * Math.PI * 2 // Full 360-degree rotation

            // Smooth lerp to target rotation
            rotationRef.current.value +=
                (targetRotation - rotationRef.current.value) * 0.1

            // Apply rotations
            canRef.current.rotation.y = rotationRef.current.value
            canRef.current.rotation.z =
                Math.sin(rotationRef.current.value) * 0.2
        }

        // Update float position
        if (floatRef.current) {
            floatRef.current.position.y =
                -0.5 + Math.sin(rotationRef.current.value) * 0.1
        }
    })

    return (
        <Float
            ref={floatRef}
            speed={2}
            rotationIntensity={0.2}
            floatIntensity={0.5}
            floatingRange={[-0.1, 0.1]}
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
    const [dimensions, setDimensions] = useState({width: 0, height: 0})
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
                        camera={{position: [-2, 1, 4], fov: 35}}
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
                    <h1 className='text-white font-sans text-5xl text-center max-w-3xl'>
                        For those moments when you need a different version of
                        now.
                    </h1>
                    <h2 className='text-white/80 font-sans text-2xl mt-4'>
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
                        <div className='panel min-w-[100vw] h-screen p-8 grid grid-rows-6 grid-cols-12 gap-4'>
                            <h2 className='col-span-8 col-start-5 row-start-3 row-span-2 text-white/90 font-mono text-4xl tracking-tight leading-tight flex items-center justify-end'>
                                You've been there. That moment when everything
                                goes sideways.
                            </h2>
                        </div>

                        {/* Panel 2 */}
                        <div className='panel min-w-[100vw] h-screen p-8 grid grid-rows-6 grid-cols-12 gap-4'>
                            <div className='col-span-12 row-span-2 flex flex-col gap-2'>
                                <p className='text-white/90 font-mono text-base leading-relaxed'>
                                    CORE FEATURES
                                </p>
                                <p className='text-white/70 font-mono text-base leading-relaxed'>
                                    TIMESTREAM™ NAVIGATION SYSTEM
                                    <br />
                                    REALITY-GRADE QUANTUM STABILIZERS
                                    <br />
                                    NEURAL-SYNC TASTE PROFILE
                                    <br />
                                    INSTANT TIMELINE ACCESS
                                </p>
                            </div>
                        </div>

                        {/* Panel 3 */}
                        <div className='panel min-w-[100vw] h-screen p-8 grid grid-rows-6 grid-cols-12 gap-4'>
                            <h2 className='col-span-7 row-span-3 text-white/90 font-mono text-4xl tracking-tight leading-tight flex items-center'>
                                Until now, you lived with it.
                            </h2>
                        </div>

                        {/* Panel 4 */}
                        <div className='panel min-w-[100vw] h-screen p-8 grid grid-rows-6 grid-cols-12 gap-4'>
                            <h2 className='col-span-7 row-span-3 text-white/90 font-mono text-4xl tracking-tight leading-tight flex items-center'>
                                Now you can undo it.
                            </h2>
                        </div>
                    </div>
                </section>

                {/* Footer Section */}
                <section className='h-screen flex items-center justify-center'>
                    <div className='text-center px-4'>
                        <h2 className='text-white/90 font-mono text-6xl mb-8'>
                            BEGIN YOUR QUANTUM JOURNEY
                        </h2>
                        <p className='text-white/70 font-mono text-xl max-w-2xl mx-auto mb-12'>
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
            </div>
        </ScrollContext.Provider>
    )
}

export default QuantumPage
