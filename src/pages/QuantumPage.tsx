import { Canvas } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { setupScrollAnimations } from "../utils/animations";
import { Can } from "../components/Can";
import { Sphere } from "../components/Sphere";
import { useControls } from "leva";

export default function QuantumPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const horizontalRef = useRef<HTMLDivElement>(null);
    const heroTextRef = useRef<HTMLHeadingElement>(null);
    const subTextRef = useRef<HTMLHeadingElement>(null);

    // Leva controls for sphere and lighting
    const { sphereScale, spherePosition } = useControls("Sphere", {
        sphereScale: { value: 3, min: 0.1, max: 10, step: 0.1 },
        spherePosition: { 
            value: { x: 5, y: 3, z: -30 },
            step: 0.1
        }
    });

    const { ambientIntensity, pointLightIntensity } = useControls("Lighting", {
        ambientIntensity: { value: 0.5, min: 0, max: 2, step: 0.1 },
        pointLightIntensity: { value: 1, min: 0, max: 5, step: 0.1 }
    });

    useEffect(() => {
        if (!containerRef.current) return;

        const panels = Array.from(document.querySelectorAll('.panel'));
        const cleanup = setupScrollAnimations(
            containerRef.current,
            horizontalRef.current,
            panels as HTMLElement[]
        );

        return cleanup;
    }, []);

    return (
        <div ref={containerRef} className="relative w-screen h-screen overflow-hidden">
            <Canvas>
                <ambientLight intensity={ambientIntensity} />
                <pointLight position={[10, 10, 10]} intensity={pointLightIntensity} />
                
                <Can position={[0, 0, 0]} />
                <Sphere 
                    scale={[sphereScale, sphereScale, sphereScale]}
                    position={[spherePosition.x, spherePosition.y, spherePosition.z]}
                />
            </Canvas>

            <div ref={horizontalRef} className="absolute top-0 left-0 w-[300vw] h-screen">
                <section className="hero-section w-screen h-screen float-left">
                    <div className="glitch-container relative mb-16 mt-24">
                        <div className="hero-interface-label overflow-hidden mb-12">
                            <div className="technical-readout text-[10px] tracking-[0.5em] text-white/40 flex items-center justify-center gap-4">
                                <span className="inline-block">QUANTUM</span>
                                <span className="inline-block">REALITY</span>
                                <span className="inline-block">INTERFACE</span>
                            </div>
                        </div>

                        <div className="hero-title-wrapper overflow-visible px-16 mb-24">
                            <h1 ref={heroTextRef}
                                className="text-white/90 font-editorial text-[4vw] md:text-[3.5vw] lg:text-[3vw] text-center leading-[1.2] tracking-tight mix-blend-difference max-w-[24ch] mx-auto"
                                data-splitting
                            >
                                For those moments when you need a different version of now.
                            </h1>
                        </div>

                        <div className="hero-subtitle-wrapper overflow-hidden mb-48 px-8">
                            <h2 ref={subTextRef}
                                className="technical-readout text-white/80 font-mono text-xl tracking-[0.5em] glitch-text"
                                data-text="CTRL-Z: Reality's Undo Button"
                            >
                                CTRL-Z: Reality's Undo Button
                            </h2>
                        </div>
                    </div>
                </section>

                <section className="w-screen h-screen float-left flex items-center justify-center">
                    <div className="panel-text text-white text-4xl">
                        Second Section
                    </div>
                </section>

                <section className="w-screen h-screen float-left flex items-center justify-center">
                    <div className="panel-text text-white text-4xl">
                        Third Section
                    </div>
                </section>
            </div>
        </div>
    );
} 
} 