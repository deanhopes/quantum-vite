import {useEffect, useRef, useState} from "react"
import gsap from "gsap"
import {useEncryptionEffect} from "../hooks/useEncryptionEffect"

interface QuantumLoaderProps {
    children?: React.ReactNode
    onLoadComplete?: () => void
}

// Enhanced random function with better distribution
const random = (min: number, max: number, decimals = 3) => {
    const val = Math.random() * (max - min) + min
    return Number(val.toFixed(decimals))
}

const PROGRESS_STEPS = [15, 35, 65, 85, 100] as const
const LOADING_TEXTS = [
    "QUANTUM CORE INITIALIZATION",
    "NEURAL INTERFACE SYNC",
    "TIMELINE STABILIZATION",
    "REALITY MATRIX MAPPING",
    "QUANTUM STATE VERIFIED",
] as const

// Enhanced quantum symbols with more variety
const QUANTUM_STATES = "⟨ψ|H|ψ⟩ |0⟩ |1⟩ |+⟩ |-⟩ ⊗ √ π Δ ℏ ∞ ∫ ∑ ∏ ∈ ∉ ∪ ∩ ⊆ ⊇"
const CIRCUIT_SYMBOLS = "━ ┃ ┏ ┓ ┗ ┛ ╋ ┣ ┫ ┳ ┻ ═ ║ ╔ ╗ ╚ ╝ ╬ ╠ ╣ ╦ ╩"
const MATRIX_CHARS = "αβγδεζηθικλμνξπρστυφχψω∀∃∄∅∈∉∊∋∌∍∎∏∐∑√∛∜∝∞∟∠∡∢∣"

// Generate quantum particles with more properties
const QUANTUM_PARTICLES = Array.from({length: 150}, (_, i) => ({
    id: i,
    size: random(0.5, 2),
    delay: random(0, 15),
    symbol: QUANTUM_STATES.split(" ")[
        Math.floor(Math.random() * QUANTUM_STATES.split(" ").length)
    ],
    orbitRadius: random(20, 150),
    orbitSpeed: random(2, 4),
    phase: random(0, Math.PI * 2),
    pulseSpeed: random(0.5, 1),
    glowIntensity: random(0.1, 0.3),
}))

// Generate circuit elements with more variety
const CIRCUIT_ELEMENTS = Array.from({length: 100}, (_, i) => ({
    id: i + 1000,
    symbol: CIRCUIT_SYMBOLS[Math.floor(Math.random() * CIRCUIT_SYMBOLS.length)],
    x: random(-1500, 1500),
    y: random(-1500, 1500),
    rotation: random(0, 360),
    scale: random(0.1, 0.3),
    opacity: random(0.05, 0.15),
    rotationSpeed: random(0.2, 0.8),
}))

// Generate matrix rain with quantum characters
const createMatrixRain = () => {
    // Create columns across the entire viewport width
    const columns = Math.floor(window.innerWidth / 20) // Adjust spacing between characters
    return Array.from({length: columns}, (_, i) => ({
        x: i * 20, // Evenly space columns
        y: random(-2000, 0), // Start above viewport for staggered entry
        speed: random(1, 3),
        opacity: random(0.1, 0.4),
        char: MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)],
        scale: random(0.8, 1.1),
        glowIntensity: random(0.2, 0.4),
    }))
}

export function QuantumLoader({children, onLoadComplete}: QuantumLoaderProps) {
    const [showScene, setShowScene] = useState(false)
    const [progress, setProgress] = useState(0)
    const [isUnmounting, setIsUnmounting] = useState(false)
    const progressBarRefs = useRef<(HTMLDivElement | null)[]>([])
    const progressTextRef = useRef<HTMLDivElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const particlesRef = useRef<(HTMLDivElement | null)[]>([])
    const binaryRainRef = useRef<(HTMLDivElement | null)[]>([])
    const circuitElementsRef = useRef<(HTMLDivElement | null)[]>([])
    const {createEncryptionEffect} = useEncryptionEffect()

    const setProgressBarRef = (
        element: HTMLDivElement | null,
        index: number
    ) => {
        progressBarRefs.current[index] = element
    }

    const setParticleRef = (element: HTMLDivElement | null, index: number) => {
        particlesRef.current[index] = element
    }

    const setBinaryRainRef = (
        element: HTMLDivElement | null,
        index: number
    ) => {
        binaryRainRef.current[index] = element
    }

    const setCircuitElementRef = (
        element: HTMLDivElement | null,
        index: number
    ) => {
        circuitElementsRef.current[index] = element
    }

    useEffect(() => {
        if (!containerRef.current || !progressTextRef.current) return
        if (progressBarRefs.current.some((ref) => !ref)) return

        // Initialize all elements
        const initTl = gsap.timeline()

        // Initialize circuit elements with enhanced fade in
        circuitElementsRef.current.forEach((element, i) => {
            if (!element) return
            const circuit = CIRCUIT_ELEMENTS[i]
            gsap.set(element, {
                x: circuit.x,
                y: circuit.y,
                rotation: circuit.rotation,
                scale: 0,
                opacity: 0,
            })

            // Add subtle floating animation
            gsap.to(element, {
                y: `+=${random(-10, 10)}`,
                x: `+=${random(-10, 10)}`,
                rotation: `+=${random(-15, 15)}`,
                duration: random(3, 6),
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
            })

            initTl.to(
                element,
                {
                    scale: circuit.scale,
                    opacity: circuit.opacity,
                    duration: 1.5,
                    ease: "power1.out",
                },
                random(0, 1)
            )
        })

        // Initialize particles with enhanced orbital motion
        particlesRef.current.forEach((particle, i) => {
            if (!particle) return
            const p = QUANTUM_PARTICLES[i]
            gsap.set(particle, {
                x: Math.cos(p.phase) * p.orbitRadius,
                y: Math.sin(p.phase) * p.orbitRadius,
                scale: 0,
                opacity: 0,
                rotation: random(0, 360),
            })

            // Subtle glow pulse animation
            gsap.to(particle, {
                filter: `blur(0.3px) brightness(${1 + p.glowIntensity})`,
                duration: random(2, 3),
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
            })
        })

        // Initialize matrix rain with enhanced animation
        binaryRainRef.current.forEach((rain, i) => {
            if (!rain) return
            gsap.set(rain, {
                y: random(-2000, 0),
                opacity: 0,
                scale: 0,
            })

            // Enhanced floating and fading animation
            gsap.to(rain, {
                y: "+=2000", // Longer travel distance
                opacity: (i) => random(0.1, 0.4), // Varied opacity
                scale: (i) => random(0.8, 1.1),
                duration: (i) => random(4, 8), // Slower, more elegant movement
                repeat: -1,
                ease: "none",
                delay: (i) => random(0, 4), // More staggered delays
                onRepeat: () => {
                    gsap.set(rain, {
                        y: random(-500, 0), // Reset above viewport
                        x: rain._gsap.x, // Maintain column position
                        opacity: random(0.1, 0.4),
                    })
                },
            })
        })

        const tl = gsap.timeline({
            onComplete: () => {
                const fadeOut = gsap.timeline({
                    onComplete: () => {
                        setIsUnmounting(true)
                        // Slight delay before triggering the complete callback
                        setTimeout(() => {
                            setShowScene(true)
                            onLoadComplete?.()
                        }, 500)
                    },
                })

                // Enhanced particle implosion
                particlesRef.current.forEach((particle) => {
                    if (!particle) return
                    fadeOut.to(
                        particle,
                        {
                            scale: 0,
                            opacity: 0,
                            x: 0,
                            y: 0,
                            rotation: random(-180, 180),
                            duration: 0.5,
                            ease: "power2.in",
                        },
                        random(0, 0.2)
                    )
                })

                // Circuit elements fade out
                circuitElementsRef.current.forEach((element) => {
                    if (!element) return
                    fadeOut.to(
                        element,
                        {
                            opacity: 0,
                            scale: 0,
                            rotation: "+=45",
                            duration: 0.3,
                            ease: "power2.in",
                        },
                        0
                    )
                })

                // Binary rain fade out
                binaryRainRef.current.forEach((rain) => {
                    if (!rain) return
                    fadeOut.to(
                        rain,
                        {
                            y: "+=100",
                            opacity: 0,
                            duration: 0.3,
                            ease: "power2.in",
                        },
                        0
                    )
                })

                // Container fade out
                fadeOut.to(
                    containerRef.current,
                    {
                        opacity: 0,
                        duration: 0.5,
                        ease: "power2.inOut",
                    },
                    0.3
                )
            },
        })

        // Enhanced particle animations
        particlesRef.current.forEach((particle, i) => {
            if (!particle) return
            const p = QUANTUM_PARTICLES[i]

            // Pulse animation
            gsap.to(particle, {
                scale: `+=${random(0.1, 0.3)}`,
                duration: p.pulseSpeed,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
            })

            // Rotation animation
            gsap.to(particle, {
                rotation: "+=360",
                duration: random(4, 8),
                repeat: -1,
                ease: "none",
            })

            // Initial appearance
            tl.to(
                particle,
                {
                    scale: 1,
                    opacity: random(0.4, 0.8),
                    duration: 0.5,
                    ease: "power2.out",
                },
                random(0, 0.5)
            )

            // Continuous orbital motion
            gsap.to(particle, {
                duration: p.orbitSpeed,
                repeat: -1,
                ease: "none",
                keyframes: [
                    {
                        x: Math.cos(p.phase) * p.orbitRadius,
                        y: Math.sin(p.phase) * p.orbitRadius,
                    },
                    {
                        x: Math.cos(p.phase + Math.PI) * p.orbitRadius,
                        y: Math.sin(p.phase + Math.PI) * p.orbitRadius,
                    },
                    {
                        x: Math.cos(p.phase + Math.PI * 2) * p.orbitRadius,
                        y: Math.sin(p.phase + Math.PI * 2) * p.orbitRadius,
                    },
                ],
            })
        })

        // Circuit elements continuous animation
        circuitElementsRef.current.forEach((element, i) => {
            if (!element) return
            gsap.to(element, {
                rotation: "+=45",
                duration: random(4, 8),
                repeat: -1,
                ease: "none",
            })
        })

        // Animate binary rain
        binaryRainRef.current.forEach((rain, i) => {
            if (!rain) return
            gsap.to(rain, {
                y: "+=300",
                opacity: random(0.1, 0.3),
                duration: random(2, 4),
                repeat: -1,
                ease: "none",
                delay: random(0, 2),
            })
        })

        // Progress animation sequence
        PROGRESS_STEPS.forEach((step, index) => {
            const stepTl = gsap.timeline()

            // Animate progress bars with quantum fluctuations
            progressBarRefs.current.forEach((bar) => {
                if (!bar) return
                stepTl.to(
                    bar,
                    {
                        width: `${step + random(-2, 2)}%`,
                        duration: random(0.4, 0.8),
                        ease: "steps(12)",
                        opacity: random(0.7, 1),
                    },
                    random(0, 0.2)
                )

                // Enhanced glitch effects
                if (random(0, 1) > 0.6) {
                    stepTl.to(
                        bar,
                        {
                            x: random(-3, 3),
                            scaleX: random(0.98, 1.02),
                            duration: 0.1,
                            yoyo: true,
                            repeat: 1,
                            ease: "none",
                        },
                        `>-${random(0.1, 0.3)}`
                    )
                }
            })

            // Update progress text with enhanced encryption effect
            stepTl.add(() => {
                setProgress(step)
                if (progressTextRef.current) {
                    progressTextRef.current.textContent = LOADING_TEXTS[index]
                    createEncryptionEffect(progressTextRef.current, () => {
                        gsap.to(progressTextRef.current, {
                            opacity: random(0.8, 1),
                            scale: random(0.98, 1.02),
                            duration: 0.05,
                            repeat: 3,
                            yoyo: true,
                        })
                    })
                }
            })

            // Particle intensity variation during steps
            particlesRef.current.forEach((particle) => {
                if (!particle) return
                stepTl.to(
                    particle,
                    {
                        opacity: random(0.4, 0.8),
                        scale: random(0.8, 1.2),
                        duration: random(0.5, 1),
                        ease: "power1.inOut",
                    },
                    random(0, 0.5)
                )
            })

            tl.add(stepTl)
            tl.to({}, {duration: random(0.2, 0.4)})
        })

        return () => {
            tl.kill()
            gsap.killTweensOf(particlesRef.current)
            gsap.killTweensOf(circuitElementsRef.current)
            gsap.killTweensOf(binaryRainRef.current)
        }
    }, [onLoadComplete])

    if (isUnmounting) return null

    return (
        <div
            ref={containerRef}
            className='fixed inset-0 bg-black z-[200] flex items-center justify-center overflow-hidden'
            role='progressbar'
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
        >
            {/* Technical Grid Background */}
            <div className='absolute inset-0'>
                <div className='absolute inset-0 technical-grid opacity-5' />
                <div className='absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/90' />
            </div>

            {/* Main Content Container */}
            <div className='w-[90vw] max-w-3xl relative p-4 md:p-8'>
                {/* Header Section */}
                <div className='technical-border-bottom pb-6 mb-8'>
                    <div className='flex items-center justify-between mb-6'>
                        <div className='flex items-center gap-4'>
                            <div className='technical-diamond-lg'></div>
                            <div>
                                <p className='technical-readout-lg'>
                                    QUANTUM INTERFACE
                                </p>
                                <div className='flex items-center gap-2 mt-1'>
                                    <div className='w-1.5 h-1.5 bg-green-500/60 rounded-full'></div>
                                    <p className='quantum-data'>
                                        INITIALIZATION SEQUENCE
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className='text-right'>
                            <div className='quantum-data mb-1'>SYSTEM ID</div>
                            <div className='quantum-value text-xs'>
                                QT-
                                {Math.floor(progress)
                                    .toString()
                                    .padStart(3, "0")}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress Section */}
                <div className='mb-8'>
                    <div
                        ref={progressTextRef}
                        className='quantum-value text-2xl mb-6 text-center'
                        style={{letterSpacing: "0.2em"}}
                    >
                        {LOADING_TEXTS[0]}
                    </div>

                    {/* Enhanced Progress Bar */}
                    <div className='technical-panel p-6'>
                        <div className='relative'>
                            <div className='h-1 w-full bg-white/5'>
                                <div
                                    ref={(el) => setProgressBarRef(el, 0)}
                                    className='h-full bg-white/80'
                                    style={{width: `${progress}%`}}
                                />
                            </div>
                        </div>
                        <div className='mt-4 flex justify-between items-center'>
                            <div className='quantum-data'>QUANTUM SYNC</div>
                            <div className='quantum-value'>{progress}%</div>
                        </div>
                    </div>
                </div>

                {/* Status Grid */}
                <div className='grid grid-cols-4 gap-4 mb-8'>
                    {/* Neural Sync */}
                    <div className='border-l border-white/10 pl-4'>
                        <div className='flex items-center gap-2 mb-2'>
                            <div className='w-1 h-1 bg-white/20 rotate-45'></div>
                            <span className='font-input text-[8px] text-white/40'>
                                NEURAL SYNC
                            </span>
                        </div>
                        <div className='flex items-center gap-2'>
                            <span className='text-[24px] font-editorial text-white/90'>
                                99.99%
                            </span>
                            <span className='text-[8px] text-green-500/60'>
                                ACTIVE
                            </span>
                        </div>
                    </div>

                    {/* Timeline Integrity */}
                    <div className='border-l border-white/10 pl-4'>
                        <div className='flex items-center gap-2 mb-2'>
                            <div className='w-1 h-1 bg-white/20 rotate-45'></div>
                            <span className='font-input text-[8px] text-white/40'>
                                TIMELINE
                            </span>
                        </div>
                        <div className='flex items-center gap-2'>
                            <span className='text-[24px] font-editorial text-white/90'>
                                100%
                            </span>
                            <span className='text-[8px] text-green-500/60'>
                                STABLE
                            </span>
                        </div>
                    </div>

                    {/* Additional status panels... */}
                </div>

                {/* Footer */}
                <div className='technical-border-top pt-6'>
                    <div className='flex justify-between items-center'>
                        <div className='quantum-data'>QUANTUM BASECAMP</div>
                        <div className='quantum-data'>REV. 2.0.1</div>
                    </div>
                </div>
            </div>

            {/* Quantum Particles Overlay */}
            {QUANTUM_PARTICLES.map((particle, index) => (
                <div
                    key={particle.id}
                    ref={(el) => setParticleRef(el, index)}
                    className='absolute pointer-events-none text-white/40'
                    style={{
                        fontSize: `${particle.size}rem`,
                    }}
                >
                    {particle.symbol}
                </div>
            ))}

            {/* Circuit Elements */}
            {CIRCUIT_ELEMENTS.map((circuit, index) => (
                <div
                    key={circuit.id}
                    ref={(el) => setCircuitElementRef(el, index)}
                    className='absolute pointer-events-none text-white/20'
                >
                    {circuit.symbol}
                </div>
            ))}
        </div>
    )
}
