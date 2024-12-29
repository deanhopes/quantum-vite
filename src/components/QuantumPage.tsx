import React, { useRef, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollContext, ScrollContextType } from "./types/ScrollContext";
import { SceneContent } from "./3d/SceneContent";
import { InteractiveGrid } from "./ui/InteractiveGrid";
import { DataReadout } from "./ui/DataReadout";

// #


// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Move component definitions outside the main component
const QuantumPage = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasContainerRef = useRef<HTMLDivElement>(null);
    const heroTextRef = useRef<HTMLHeadingElement>(null);
    const subTextRef = useRef<HTMLHeadingElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [scrollState, setScrollState] = useState<ScrollContextType>({
        scrollProgress: 0,
        isHorizontalSection: false,
    });

    // Handle canvas dimensions
    useEffect(() => {
        if (!canvasContainerRef.current) return;

        const updateDimensions = () => {
            if (canvasContainerRef.current) {
                setDimensions({
                    width: canvasContainerRef.current.clientWidth,
                    height: canvasContainerRef.current.clientHeight,
                });
            }
        };

        updateDimensions();
        const resizeObserver = new ResizeObserver(updateDimensions);
        resizeObserver.observe(canvasContainerRef.current);

        return () => resizeObserver.disconnect();
    }, []);

    // Update the text animation setup
    useEffect(() => {
        const horizontalSection = document.querySelector("#horizontalSection");
        const panels = gsap.utils.toArray<HTMLElement>(".panel");
        const grids = gsap.utils.toArray<HTMLElement>(".technical-grid");
        const totalWidth = panels.length * window.innerWidth;

        // Create main scroll animation
        const horizontalScroll = gsap.timeline({
            scrollTrigger: {
                trigger: horizontalSection,
                start: "top top",
                end: () => `+=${totalWidth - window.innerWidth}`,
                pin: true,
                scrub: 0.8,
                onUpdate: (self) => {
                    const newState = {
                        scrollProgress: self.progress,
                        isHorizontalSection: self.isActive,
                    };

                    // Log state changes
                    console.log('Scroll State Update:', {
                        progress: self.progress,
                        isActive: self.isActive,
                        direction: self.direction,
                        velocity: self.getVelocity(),
                        scrollTop: window.scrollY
                    });

                    setScrollState(newState);

                    // Update grid visibility based on scroll progress
                    grids.forEach((grid, index) => {
                        const gridProgress = self.progress * panels.length - index;
                        if (gridProgress > 0 && gridProgress < 1) {
                            grid.classList.add("is-visible");
                        } else {
                            grid.classList.remove("is-visible");
                        }
                    });
                },
                onEnter: () => console.log('Entered horizontal section'),
                onLeave: () => console.log('Left horizontal section'),
                onEnterBack: () => console.log('Entered horizontal section (backwards)'),
                onLeaveBack: () => console.log('Left horizontal section (backwards)'),
            },
        });

        // Smoother panel animation with parallax
        const scrollContent = gsap.utils.toArray<HTMLElement>(".horizontal-scroll-content");
        horizontalScroll.to(scrollContent, {
            x: () => -(totalWidth - window.innerWidth),
            ease: "none",
        });

        return () => {
            ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
        };
    }, []);

    return (
        <ScrollContext.Provider value={scrollState}>
            <div className='relative'>
                {/* Canvas Container */}
                <div
                    ref={canvasContainerRef}
                    className='fixed inset-0 w-full h-full overflow-hidden bg-gradient-to-b from-black via-purple-900/20 to-black'
                >
                    {dimensions.width > 0 && (
                        <Canvas
                            shadows
                            camera={{ position: [0, 1, 4], fov: 35 }}
                            onCreated={state => {
                                console.log('Canvas created', state);
                            }}
                            style={{
                                position: "absolute",
                                width: `${dimensions.width}px`,
                                height: `${dimensions.height}px`,
                                imageRendering: "pixelated",
                            }}
                            gl={{
                                antialias: false,
                                powerPreference: "high-performance",
                                alpha: true,
                            }}
                        >
                            <color attach='background' args={["#000000"]} />
                            <fog attach='fog' args={["#000000", 5, 15]} />
                            <Suspense fallback={
                                <mesh>
                                    <boxGeometry args={[1, 1, 1]} />
                                    <meshBasicMaterial color="red" wireframe />
                                </mesh>
                            }>
                                <SceneContent />
                            </Suspense>
                        </Canvas>
                    )}
                </div>

                {/* Main Content */}
                <div ref={containerRef} className='relative w-full'>
                    {/* Hero Section */}
                    <section className='relative h-screen flex flex-col items-center justify-center overflow-hidden'>
                        {/* Background Elements */}
                        <div className='absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50'></div>

                        {/* Main Content Container */}
                        <div className='relative z-10 flex flex-col items-center max-w-[90vw] mx-auto px-8'>
                            {/* Main Title Group */}
                            <div className='glitch-container relative mb-16 mt-24'>
                                {/* Interface Label */}
                                <div className='hero-interface-label overflow-hidden mb-12'>
                                    <div className='technical-readout text-[10px] tracking-[0.5em] text-white/40 flex items-center justify-center gap-4'>
                                        <span className='inline-block'>QUANTUM</span>
                                        <span className='inline-block'>REALITY</span>
                                        <span className='inline-block'>INTERFACE</span>
                                    </div>
                                </div>

                                {/* Main Title */}
                                <div className='hero-title-wrapper overflow-visible px-16 mb-24'>
                                    <h1 ref={heroTextRef}
                                        className='font-[PPEditorialOld] text-white/90 text-[4vw] md:text-[3.5vw] lg:text-[3vw] text-center leading-[1.2] tracking-tight mix-blend-difference max-w-[24ch] mx-auto'
                                        data-splitting
                                    >
                                        For those moments when you need a different version of now.
                                    </h1>
                                </div>

                                {/* Decorative Lines */}
                                <div className='absolute -left-8 top-1/2 w-6 h-[1px] bg-white/20 opacity-0 transform -translate-y-1/2 hero-line-left transition-opacity duration-300'></div>
                                <div className='absolute -right-8 top-1/2 w-6 h-[1px] bg-white/20 opacity-0 transform -translate-y-1/2 hero-line-right transition-opacity duration-300'></div>
                            </div>

                            {/* Subtitle */}
                            <div className='hero-subtitle-wrapper overflow-hidden mb-48 px-8'>
                                <h2 ref={subTextRef}
                                    className='technical-readout text-white/80 font-mono text-xl tracking-[0.5em] glitch-text'
                                    data-text="CTRL-Z: Reality's Undo Button"
                                >
                                    CTRL-Z: Reality's Undo Button
                                </h2>
                            </div>

                            {/* Scroll Indicator */}
                            <div className='hero-scroll fixed bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center space-y-4'>
                                <span className='technical-readout text-[10px] tracking-[0.5em] text-white/40 overflow-hidden'>
                                    <span className='inline-block'>SCROLL TO INITIALIZE</span>
                                </span>
                                <div className='scroll-indicator w-6 h-10 border-2 border-white/20 rounded-full flex items-start p-1'>
                                    <div className='w-1 h-2 bg-white/40 rounded-full animate-scroll-hint mx-auto'></div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Horizontal Scroll Section */}
                    <section
                        id='horizontalSection'
                        className='relative h-screen w-screen overflow-hidden'
                    >
                        {/* Grid Container - Scrolls with content */}
                        <div className='absolute top-0 left-0 h-screen horizontal-scroll-content'>
                            <div className='w-[400vw] h-full'>
                                <InteractiveGrid />
                            </div>
                        </div>

                        <div className='absolute top-0 left-0 h-full flex horizontal-scroll-content'>
                            {/* Panel 1 */}
                            <div className='panel w-screen h-screen flex-shrink-0'>
                                <div className='absolute top-0 left-0 w-full h-full' style={{ padding: '96px' }}>
                                    <div className='relative' style={{ marginTop: '96px', marginLeft: '96px' }}>
                                        <h2 className='text-white/95 font-[PPEditorialOld] text-[3.5vw] tracking-[-0.02em] leading-[96px] mix-blend-difference'>
                                            You've been there. That moment
                                            <br />
                                            when everything goes sideways.
                                        </h2>
                                        <div style={{ marginTop: '96px' }}>
                                            <p className='technical-readout' style={{ height: '24px', lineHeight: '24px' }}>
                                                System Status: Active
                                            </p>
                                            <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                                                <div style={{ height: '24px', lineHeight: '24px' }} className='text-xs font-mono text-white/40'>CPU: 98.2%</div>
                                                <div style={{ height: '24px', lineHeight: '24px' }} className='text-xs font-mono text-white/40'>MEM: 64.7%</div>
                                                <div style={{ height: '24px', lineHeight: '24px' }} className='text-xs font-mono text-white/40'>TEMP: 42°C</div>
                                            </div>
                                            <div style={{ marginTop: '24px', width: '24px', height: '1px' }} className='bg-white/20'></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Panel 2 */}
                            <div className='panel w-screen h-screen'>
                                <div className='w-full h-full grid grid-cols-[repeat(12,1fr)] grid-rows-[repeat(12,1fr)] gap-4 justify-items-center justify-between'>
                                    {/* Feature Blocks */}
                                    <div className='feature-block col-start-4 col-span-5 row-start-2'>
                                        <div className='grid grid-cols-6 gap-4'>
                                            <h3 className='font-[PPEditorialOld] text-white/95 text-[2.5vw] leading-[1.1] col-span-12'>
                                                ⌬Neural-Sync
                                                <br />
                                                Interface
                                            </h3>
                                            <p className='text-white/50 font-mono text-sm col-start-2 col-span-4'>
                                                Memory preservation across realities, ensuring cognitive continuity through quantum state preservation.
                                            </p>
                                        </div>
                                    </div>

                                    <div className='feature-block col-start-9 col-span-12 row-start-8'>
                                        <div className='grid grid-cols-8 gap-4'>
                                            <h3 className='font-[PPEditorialOld] text-white/95 text-[2.5vw] leading-[1.1] col-span-12'>
                                                ◈Quantum
                                                <br />
                                                Stabilization
                                            </h3>
                                            <p className='text-white/50 font-mono text-sm col-start-2 col-span-4'>
                                                Reality-grade containment field prevents unwanted timeline bleed and maintains dimensional integrity.
                                            </p>
                                        </div>
                                    </div>

                                    <div className='feature-block col-start-1 col-span-5 row-start-9'>
                                        <div className='grid grid-cols-8 gap-4'>
                                            <h3 className='font-[PPEditorialOld] text-white/95 text-[2.5vw] leading-[1.1] col-span-12'>
                                                ⎔Interface
                                                <br />
                                                Alignment
                                                Delta
                                            </h3>
                                            <p className='text-white/50 font-mono text-sm col-start-2 col-span-4'>
                                                Zero latency between decision and implementation through quantum entanglement protocols.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Panel 3 */}
                            <div className='panel w-screen h-screen flex-shrink-0 p-16 grid grid-rows-6 grid-cols-12 gap-8'>
                                <div className='col-span-10 col-start-2 row-span-full grid grid-cols-[1fr_auto] items-center gap-32'>
                                    <div className='max-w-[50vw]'>
                                        <div className='technical-readout text-[10px] tracking-[0.5em] text-white/40 mb-8'>SYSTEM ANALYSIS</div>
                                        <h2 className='font-[PPEditorialOld] text-white/95 text-[4vw] tracking-[-0.03em] leading-[0.95] mb-8'>
                                            Until now, you lived with it.
                                        </h2>
                                        <p className='technical-readout text-white/70 font-mono text-sm leading-relaxed mb-6'>
                                            Every decision point creates infinite branches. We just help you find the right one.
                                        </p>
                                        <div className='grid grid-cols-2 gap-4 text-[10px] font-mono text-white/40 tracking-[0.3em] mt-8'>
                                            <div className='technical-readout'>BRANCH COUNT: ∞</div>
                                            <div className='technical-readout'>SUCCESS RATE: 99.99%</div>
                                        </div>
                                    </div>
                                    <div className='panel-text w-[360px] border-l border-white/10 pl-16 tech-specs'>
                                        <p className='text-white/40 font-mono text-sm tracking-[0.2em] uppercase mb-12'>
                                            Technical Specifications
                                        </p>
                                        <div className='space-y-12'>
                                            <div className='spec-item group'>
                                                <p className='text-white/40 font-mono text-xs tracking-[0.15em] uppercase mb-2 transition-colors duration-300 group-hover:text-white/60'>
                                                    MODEL
                                                </p>
                                                <p className='text-white/90 font-mono text-xl transition-transform duration-500 group-hover:translate-x-2'>
                                                    QUANTUM CORE RT-749
                                                </p>
                                            </div>
                                            <div className='spec-item group'>
                                                <p className='text-white/40 font-mono text-xs tracking-[0.15em] uppercase mb-2 transition-colors duration-300 group-hover:text-white/60'>
                                                    SERIES
                                                </p>
                                                <p className='text-white/90 font-mono text-xl transition-transform duration-500 group-hover:translate-x-2'>
                                                    SHIFT-X
                                                </p>
                                            </div>
                                            <div className='spec-item group'>
                                                <p className='text-white/40 font-mono text-xs tracking-[0.15em] uppercase mb-2 transition-colors duration-300 group-hover:text-white/60'>
                                                    ESTABLISHED
                                                </p>
                                                <p className='text-white/90 font-mono text-xl transition-transform duration-500 group-hover:translate-x-2'>
                                                    2038
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Panel 4 */}
                            <div className='panel w-screen h-screen flex-shrink-0 p-16 grid grid-rows-6 grid-cols-12 gap-8'>
                                <div className='col-span-full row-span-full flex flex-col items-center justify-center text-center'>
                                    <p className='text-white/40 font-mono text-base tracking-[0.5em] uppercase mb-8 fade-up'>
                                        CRTL-Z
                                    </p>
                                    <h2 className='font-[PPEditorialOld] text-white/95 text-[10vw] tracking-[-0.03em] leading-[0.9]  fade-up'>
                                        Now you can fix it.
                                    </h2>
                                    <div className='mt-12 flex items-center gap-8 fade-up'>
                                        <p className='text-white/60 font-mono text-sm tracking-[0.2em] uppercase'>
                                            Continue to experience
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Testimonial Section */}
                    <section className='relative min-h-screen bg-black/90 flex items-center justify-center py-24'>
                        <div className='container mx-auto grid grid-cols-12 gap-8 px-8'>
                            <div className='col-span-6'>
                                <div className='technical-readout text-[10px] tracking-[0.5em] text-white/40 mb-8'>FIELD REPORTS</div>
                                <h2 className='font-[PPEditorialOld] text-white/95 text-5xl leading-tight mb-16'>
                                    When we first announced
                                    <br />
                                    a beverage that could alter
                                    <br />
                                    reality, they called us mad.
                                    <br />
                                    <br />
                                    <span className='text-white/70'>88 billion successful
                                        <br />
                                        reality shifts later, they
                                        <br />
                                        call us the future.</span>
                                </h2>
                            </div>
                            <div className='col-span-5 col-start-8 space-y-12'>
                                <div className='space-y-6'>
                                    <div className='technical-readout text-[10px] tracking-[0.5em] text-white/40 mb-4'>USER TESTIMONIAL_01</div>
                                    <div className='flex mb-4'>
                                        {Array.from({ length: 5 }, (_, index) => (
                                            <span key={index} className='text-white/80 text-xl'>★</span>
                                        ))}
                                    </div>
                                    <p className='technical-readout text-white/90 font-mono text-lg leading-relaxed'>
                                        "Yesterday, I made the worst presentation of my career. Or I would have, if ctrl-z hadn't helped me find the timeline where I remembered to actually save my slides."
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Final CTA Section */}
                    <section className='relative min-h-screen bg-black flex items-center justify-center overflow-hidden'>
                        {/* Technical Grid Background */}
                        <InteractiveGrid />

                        {/* Main Content */}
                        <div className='text-center relative z-10 max-w-6xl mx-auto flex flex-col items-center'>
                            {/* Technical Readout Header */}
                            <div className='technical-readout text-[10px] tracking-[0.5em] text-white/40 mb-32'>
                                QUANTUM SHIFT PROTOCOL: READY
                            </div>

                            {/* Technical Stats */}
                            <div className='grid grid-cols-3 gap-32 mb-32 font-mono w-full max-w-2xl'>
                                <DataReadout label="REALITY SHIFTS" value="88.2B+" />
                                <DataReadout label="SUCCESS RATE" value="99.99%" />
                                <DataReadout label="QUANTUM STABILITY" value="100%" />
                            </div>

                            {/* Description */}
                            <p className='text-white/60 font-mono text-md max-w-2xl mx-auto mb-8 leading-relaxed tracking-wider'>
                                Step into a future where every possibility is within reach. Your perfect timeline awaits.
                            </p>

                            {/* CTA Buttons */}
                            <div className='space-x-8'>
                                <button className='cta-button hover-highlight group relative px-12 py-4 bg-transparent'>
                                    <div className='corner corner-tl'></div>
                                    <div className='corner corner-tr'></div>
                                    <div className='corner corner-bl'></div>
                                    <div className='corner corner-br'></div>
                                    <span className='text-white/90 font-mono text-sm tracking-[0.3em] relative z-10'>
                                        INITIATE SHIFT
                                    </span>
                                </button>
                                <button className='cta-button group relative px-12 py-4'>
                                    <div className='absolute inset-0 border border-white/10'></div>
                                    <span className='text-white/40 font-mono text-sm tracking-[0.3em] relative z-10'>
                                        LEARN MORE
                                    </span>
                                </button>
                            </div>

                            {/* Technical Details */}
                            <div className='font-mono text-[10px] text-white/40 tracking-[0.2em]'>
                                <div>MODEL: QS-749-X</div>
                                <div>BUILD: 2038.12.1</div>
                            </div>
                            <div className='font-mono text-[10px] text-white/40 tracking-[0.2em] text-right'>
                                <div>LAT: 37.7749° N</div>
                                <div>LONG: 122.4194° W</div>
                            </div>
                        </div>

                        {/* Background Gradient */}
                        <div className='absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-70'></div>
                    </section>
                </div>
            </div>
        </ScrollContext.Provider>
    );
};

export default QuantumPage;
