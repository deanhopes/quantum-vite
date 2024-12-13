import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useEncryptionEffect } from '../hooks/useEncryptionEffect';

interface QuantumLoaderProps {
    children: React.ReactNode;
}

// Enhanced random function with better distribution
const random = (min: number, max: number, decimals = 3) => {
    const val = Math.random() * (max - min) + min;
    return Number(val.toFixed(decimals));
};

const PROGRESS_STEPS = [15, 35, 65, 85, 100] as const;
const LOADING_TEXTS = [
    "QUANTUM INITIALIZATION",
    "ENTANGLEMENT SYNC",
    "SUPERPOSITION MAPPING",
    "QUANTUM DECOHERENCE",
    "REALITY STABILIZED"
] as const;

const BINARY_CHARS = "01";
const QUANTUM_STATES = "⟨ψ|H|ψ⟩ |0⟩ |1⟩ |+⟩ |-⟩ ⊗ √ π Δ ℏ ∞ ∫ ∑ ∏ ∈ ∉ ∪ ∩ ⊆ ⊇";
const CIRCUIT_SYMBOLS = "━ ┃ ┏ ┓ ┗ ┛ ╋ ┣ ┫ ┳ ┻ ═ ║ ╔ ╗ ╚ ╝ ╬ ╠ ╣ ╦ ╩";
const MATRIX_CHARS = "αβγδεζηθικλμνξπρστυφχψω∀∃∄∅∈∉∊∋∌∍∎∏∐∑√∛∜∝∞∟∠∡∢∣";

// Generate quantum particles with more properties
const QUANTUM_PARTICLES = Array.from({ length: 35 }, (_, i) => ({
    id: i,
    size: Math.random() * 5 + 1,
    delay: Math.random() * 22,
    symbol: QUANTUM_STATES.split(' ')[Math.floor(Math.random() * QUANTUM_STATES.split(' ').length)],
    orbitRadius: random(30, 222),
    orbitSpeed: random(1, 1),
    phase: random(0, Math.PI * 1),
    pulseSpeed: random(0.1, 0.2),
    glowIntensity: random(0.5, 1)
}));

// Generate circuit elements with more variety
const CIRCUIT_ELEMENTS = Array.from({ length: 25 }, (_, i) => ({
    id: i + 1000,
    symbol: CIRCUIT_SYMBOLS[Math.floor(Math.random() * CIRCUIT_SYMBOLS.length)],
    x: random(-1000, 1000),
    y: random(-1000, 1000),
    rotation: random(0, 360),
    scale: random(0.2, 0.5),
    opacity: random(0.1, 0.2),
    rotationSpeed: random(0.5, 2)
}));

// Generate matrix rain with quantum characters
const createMatrixRain = () => {
    return Array.from({ length: 150 }, () => ({
        x: random(-2550, 2550),
        y: random(-2550, 2550),
        speed: random(0.5, 2),
        opacity: random(0.1, 0.3),
        char: MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)],
        scale: random(0.8, 1.2)
    }));
};

export function QuantumLoader({ children }: QuantumLoaderProps) {
    const [showScene, setShowScene] = useState(false);
    const [progress, setProgress] = useState(0);
    const progressBarRefs = useRef<(HTMLDivElement | null)[]>([]);
    const progressTextRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const particlesRef = useRef<(HTMLDivElement | null)[]>([]);
    const binaryRainRef = useRef<(HTMLDivElement | null)[]>([]);
    const circuitElementsRef = useRef<(HTMLDivElement | null)[]>([]);
    const { createEncryptionEffect } = useEncryptionEffect();

    const setProgressBarRef = (element: HTMLDivElement | null, index: number) => {
        progressBarRefs.current[index] = element;
    };

    const setParticleRef = (element: HTMLDivElement | null, index: number) => {
        particlesRef.current[index] = element;
    };

    const setBinaryRainRef = (element: HTMLDivElement | null, index: number) => {
        binaryRainRef.current[index] = element;
    };

    const setCircuitElementRef = (element: HTMLDivElement | null, index: number) => {
        circuitElementsRef.current[index] = element;
    };

    useEffect(() => {
        if (!containerRef.current || !progressTextRef.current) return;
        if (progressBarRefs.current.some(ref => !ref)) return;

        // Initialize all elements
        const initTl = gsap.timeline();

        // Initialize circuit elements with enhanced fade in
        circuitElementsRef.current.forEach((element, i) => {
            if (!element) return;
            const circuit = CIRCUIT_ELEMENTS[i];
            gsap.set(element, {
                x: circuit.x,
                y: circuit.y,
                rotation: circuit.rotation,
                scale: 0,
                opacity: 0
            });

            // Add floating animation
            gsap.to(element, {
                y: `+=${random(-20, 20)}`,
                x: `+=${random(-20, 20)}`,
                rotation: `+=${random(-45, 45)}`,
                duration: random(2, 4),
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });

            initTl.to(element, {
                scale: circuit.scale,
                opacity: circuit.opacity,
                duration: 1,
                ease: "power2.out"
            }, random(0, 0.5));
        });

        // Initialize particles with enhanced orbital motion
        particlesRef.current.forEach((particle, i) => {
            if (!particle) return;
            const p = QUANTUM_PARTICLES[i];
            gsap.set(particle, {
                x: Math.cos(p.phase) * p.orbitRadius,
                y: Math.sin(p.phase) * p.orbitRadius,
                scale: 0,
                opacity: 0,
                rotation: random(0, 360)
            });

            // Add glow pulse animation
            gsap.to(particle, {
                filter: `blur(0.5px) brightness(${1 + p.glowIntensity * 2})`,
                duration: random(1, 2),
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
        });

        // Initialize matrix rain with staggered fade in
        binaryRainRef.current.forEach((rain, i) => {
            if (!rain) return;
            gsap.set(rain, {
                x: random(-100, 100),
                y: random(-200, 0),
                opacity: 0,
                scale: 0
            });

            // Add floating and fading animation
            gsap.to(rain, {
                y: '+=300',
                opacity: random(0.1, 0.3),
                scale: random(0.8, 1.2),
                duration: random(2, 4),
                repeat: -1,
                ease: "none",
                delay: random(0, 2),
                onRepeat: () => {
                    gsap.set(rain, {
                        y: random(-200, -100),
                        x: random(-100, 100)
                    });
                }
            });
        });

        const tl = gsap.timeline({
            onComplete: () => {
                const fadeOut = gsap.timeline();

                // Enhanced particle implosion
                particlesRef.current.forEach((particle) => {
                    if (!particle) return;
                    fadeOut.to(particle, {
                        scale: 0,
                        opacity: 0,
                        x: 0,
                        y: 0,
                        rotation: random(-180, 180),
                        duration: 0.5,
                        ease: "power2.in"
                    }, random(0, 0.2));
                });

                // Circuit elements fade out
                circuitElementsRef.current.forEach((element) => {
                    if (!element) return;
                    fadeOut.to(element, {
                        opacity: 0,
                        scale: 0,
                        rotation: "+=45",
                        duration: 0.3,
                        ease: "power2.in"
                    }, 0);
                });

                // Binary rain fade out
                binaryRainRef.current.forEach((rain) => {
                    if (!rain) return;
                    fadeOut.to(rain, {
                        y: '+=100',
                        opacity: 0,
                        duration: 0.3,
                        ease: "power2.in"
                    }, 0);
                });

                // Container fade out
                fadeOut.to(containerRef.current, {
                    opacity: 0,
                    duration: 0.5,
                    ease: "power2.inOut",
                    onComplete: () => setShowScene(true)
                }, 0.3);
            }
        });

        // Enhanced particle animations
        particlesRef.current.forEach((particle, i) => {
            if (!particle) return;
            const p = QUANTUM_PARTICLES[i];

            // Pulse animation
            gsap.to(particle, {
                scale: `+=${random(0.1, 0.3)}`,
                duration: p.pulseSpeed,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });

            // Rotation animation
            gsap.to(particle, {
                rotation: "+=360",
                duration: random(4, 8),
                repeat: -1,
                ease: "none"
            });

            // Initial appearance
            tl.to(particle, {
                scale: 1,
                opacity: random(0.4, 0.8),
                duration: 0.5,
                ease: "power2.out"
            }, random(0, 0.5));

            // Continuous orbital motion
            gsap.to(particle, {
                duration: p.orbitSpeed,
                repeat: -1,
                ease: "none",
                keyframes: [
                    {
                        x: Math.cos(p.phase) * p.orbitRadius,
                        y: Math.sin(p.phase) * p.orbitRadius
                    },
                    {
                        x: Math.cos(p.phase + Math.PI) * p.orbitRadius,
                        y: Math.sin(p.phase + Math.PI) * p.orbitRadius
                    },
                    {
                        x: Math.cos(p.phase + Math.PI * 2) * p.orbitRadius,
                        y: Math.sin(p.phase + Math.PI * 2) * p.orbitRadius
                    }
                ]
            });
        });

        // Circuit elements continuous animation
        circuitElementsRef.current.forEach((element, i) => {
            if (!element) return;
            gsap.to(element, {
                rotation: "+=45",
                duration: random(4, 8),
                repeat: -1,
                ease: "none"
            });
        });

        // Animate binary rain
        binaryRainRef.current.forEach((rain, i) => {
            if (!rain) return;
            gsap.to(rain, {
                y: '+=300',
                opacity: random(0.1, 0.3),
                duration: random(2, 4),
                repeat: -1,
                ease: "none",
                delay: random(0, 2)
            });
        });

        // Progress animation sequence
        PROGRESS_STEPS.forEach((step, index) => {
            const stepTl = gsap.timeline();

            // Animate progress bars with quantum fluctuations
            progressBarRefs.current.forEach((bar) => {
                if (!bar) return;
                stepTl.to(bar, {
                    width: `${step + random(-2, 2)}%`,
                    duration: random(0.4, 0.8),
                    ease: "steps(12)",
                    opacity: random(0.7, 1)
                }, random(0, 0.2));

                // Enhanced glitch effects
                if (random(0, 1) > 0.6) {
                    stepTl.to(bar, {
                        x: random(-3, 3),
                        scaleX: random(0.98, 1.02),
                        duration: 0.1,
                        yoyo: true,
                        repeat: 1,
                        ease: "none"
                    }, `>-${random(0.1, 0.3)}`);
                }
            });

            // Update progress text with enhanced encryption effect
            stepTl.add(() => {
                setProgress(step);
                if (progressTextRef.current) {
                    progressTextRef.current.textContent = LOADING_TEXTS[index];
                    createEncryptionEffect(progressTextRef.current, () => {
                        gsap.to(progressTextRef.current, {
                            opacity: random(0.8, 1),
                            scale: random(0.98, 1.02),
                            duration: 0.05,
                            repeat: 3,
                            yoyo: true
                        });
                    });
                }
            });

            // Particle intensity variation during steps
            particlesRef.current.forEach((particle) => {
                if (!particle) return;
                stepTl.to(particle, {
                    opacity: random(0.4, 0.8),
                    scale: random(0.8, 1.2),
                    duration: random(0.5, 1),
                    ease: "power1.inOut"
                }, random(0, 0.5));
            });

            tl.add(stepTl);
            tl.to({}, { duration: random(0.2, 0.4) });
        });

        return () => {
            tl.kill();
            gsap.killTweensOf(particlesRef.current);
            gsap.killTweensOf(circuitElementsRef.current);
            gsap.killTweensOf(binaryRainRef.current);
        };
    }, []);

    return (
        <>
            <div
                ref={containerRef}
                className="fixed inset-0 bg-quantum-black z-50 flex items-center justify-center overflow-hidden"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
            >
                {/* Matrix rain effect */}
                {createMatrixRain().map((rain, i) => (
                    <div
                        key={i}
                        ref={(el) => setBinaryRainRef(el, i)}
                        className="absolute font-geist-mono text-quantum-white/30 pointer-events-none transform"
                        style={{
                            fontSize: '14px',
                            willChange: 'transform, opacity',
                            transform: `scale(${rain.scale})`,
                            textShadow: '0 0 8px rgba(255,255,255,0.5)'
                        }}
                    >
                        {rain.char}
                    </div>
                ))}

                {/* Circuit background elements with enhanced styling */}
                {CIRCUIT_ELEMENTS.map((circuit) => (
                    <div
                        key={circuit.id}
                        ref={(el) => setCircuitElementRef(el, circuit.id - 1000)}
                        className="absolute font-geist-mono text-quantum-white pointer-events-none flex items-center justify-center transform"
                        style={{
                            fontSize: '24px',
                            willChange: 'transform, opacity',
                            textShadow: '0 0 10px rgba(255,255,255,0.3)',
                            filter: 'blur(0.5px)'
                        }}
                    >
                        {circuit.symbol}
                    </div>
                ))}

                {/* Quantum particles with enhanced effects */}
                {QUANTUM_PARTICLES.map((particle) => (
                    <div
                        key={particle.id}
                        ref={(el) => setParticleRef(el, particle.id)}
                        className="absolute font-geist-mono text-quantum-white/50 pointer-events-none flex items-center justify-center transform"
                        style={{
                            width: `${particle.size * 10}px`,
                            height: `${particle.size * 10}px`,
                            fontSize: `${particle.size * 4}px`,
                            filter: `blur(0.5px) brightness(${1 + particle.glowIntensity})`,
                            willChange: 'transform, opacity',
                            textShadow: `0 0 ${particle.size * 2}px rgba(255,255,255,${particle.glowIntensity})`
                        }}
                    >
                        {particle.symbol}
                    </div>
                ))}

                <div className="w-[80vw] max-w-2xl space-y-6 relative">
                    <div
                        ref={progressTextRef}
                        className="text-quantum-white font-geist-mono text-2xl text-center mb-4 h-8 transform"
                        style={{ 
                            willChange: 'transform, opacity',
                            textShadow: '0 0 15px rgba(255,255,255,0.5)'
                        }}
                    >
                        {LOADING_TEXTS[0]}
                    </div>

                    <div className="relative h-4 bg-quantum-white/10 overflow-hidden rounded-sm backdrop-blur-sm">
                        {[0, 1, 2].map((index) => (
                            <div
                                key={index}
                                ref={(el) => setProgressBarRef(el, index)}
                                className={`absolute top-0 left-0 h-full w-0 bg-quantum-white/80
                                    ${index === 1 ? 'mix-blend-difference' : ''}
                                    ${index === 2 ? 'mix-blend-overlay' : ''}`}
                                style={{
                                    boxShadow: '0 0 20px rgba(255,255,255,0.5), 0 0 40px rgba(255,255,255,0.3)',
                                    transform: `translateY(${index * 33.33}%)`,
                                    willChange: 'transform, width, opacity',
                                    backdropFilter: 'blur(4px)'
                                }}
                            />
                        ))}

                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-quantum-white/20 to-transparent animate-glitch" />
                    </div>

                    <div 
                        className="text-quantum-white/50 font-geist-mono text-sm text-center transform"
                        style={{
                            textShadow: '0 0 8px rgba(255,255,255,0.3)'
                        }}
                    >
                        {progress}% COMPLETE
                    </div>
                </div>
            </div>
            {showScene && children}
        </>
    );
} 