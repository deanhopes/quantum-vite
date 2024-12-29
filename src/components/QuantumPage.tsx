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
    const logoRef = useRef<HTMLDivElement>(null);
    const magneticBtnRef = useRef<HTMLDivElement>(null);
    const initiateBtnRef = useRef<HTMLDivElement>(null);
    const learnMoreBtnRef = useRef<HTMLDivElement>(null);
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

    useEffect(() => {
        const buttons = [initiateBtnRef.current, learnMoreBtnRef.current, magneticBtnRef.current];

        const handleMouseMove = (e: MouseEvent, btn: HTMLElement) => {
            const rect = btn.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const distanceX = e.clientX - centerX;
            const distanceY = e.clientY - centerY;

            const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
            const radius = 100;

            if (distance < radius) {
                const pull = (radius - distance) / radius;
                const moveX = (distanceX * pull) * 0.5;
                const moveY = (distanceY * pull) * 0.5;

                gsap.to(btn, {
                    x: moveX,
                    y: moveY,
                    duration: 0.3,
                    ease: "power2.out"
                });
            } else {
                gsap.to(btn, {
                    x: 0,
                    y: 0,
                    duration: 0.3,
                    ease: "power2.out"
                });
            }
        };

        const handleMouseLeave = (btn: HTMLElement) => {
            gsap.to(btn, {
                x: 0,
                y: 0,
                duration: 0.3,
                ease: "power2.out"
            });
        };

        buttons.forEach(btn => {
            if (!btn) return;

            const moveHandler = (e: MouseEvent) => handleMouseMove(e, btn);
            const leaveHandler = () => handleMouseLeave(btn);

            document.addEventListener('mousemove', moveHandler);
            btn.addEventListener('mouseleave', leaveHandler);

            return () => {
                document.removeEventListener('mousemove', moveHandler);
                btn.removeEventListener('mouseleave', leaveHandler);
            };
        });
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

                {/* Navbar */}
                <nav className='fixed top-0 left-0 w-full h-16 flex items-center justify-between px-8 z-50'>
                    <div className='w-16'></div> {/* Spacer for centering */}
                    <div ref={logoRef} className='w-[8rem] origin-bottom'>
                        <img
                            src='/src/assets/ctrlz-logo.svg'
                            alt='CTRL-Z'
                            className='w-full object-contain'
                        />
                    </div>
                    <div ref={magneticBtnRef} className='relative w-16 h-16 flex items-center justify-center'>
                        <button className='cta-button hover-highlight group relative w-12 h-12 flex items-center justify-center'>
                            <div className='corner corner-tl'></div>
                            <div className='corner corner-tr'></div>
                            <div className='corner corner-bl'></div>
                            <div className='corner corner-br'></div>
                            <span className='technical-readout text-white/60 hover:text-white/90 transition-colors'>
                                MENU
                            </span>
                        </button>
                    </div>
                </nav>

                {/* Main Content */}
                <div ref={containerRef} className='relative w-full'>
                    {/* Hero Section */}
                    <section className='relative h-screen flex flex-col overflow-hidden p-8'>
                        {/* Main Content */}
                        <div className='flex-1 flex'>
                            {/* Left Side */}
                            <div className='flex flex-col justify-start mt-24'>
                                <div className='border-l border-white/10 pl-8'>
                                    <div className='flex items-center gap-4 mb-4'>
                                        <div className='w-2 h-2 bg-white/20 rotate-45'></div>
                                        <p className='technical-readout'>QUANTUM METRICS</p>
                                        <div className='ml-auto text-[8px] font-mono text-green-500/60'>ACTIVE</div>
                                    </div>
                                    <div className='space-y-2'>
                                        <div className='technical-readout'>12QT × 8QT</div>
                                        <div className='technical-readout'>⟨MAINTAIN NEURAL INTERFACE STABILITY⟩</div>
                                    </div>
                                    <div className='w-12 h-[1px] bg-white/10 my-4'></div>
                                    <div className='flex items-center gap-2 text-[8px] font-mono text-white/40'>
                                        <div>HASH: 0xA7D2</div>
                                        <div className='ml-auto'>REV: 1.4.2</div>
                                    </div>
                                </div>
                                <div className='mt-48 border-l border-white/10 pl-8'>
                                    <div className='flex items-center gap-4 mb-4'>
                                        <div className='w-2 h-2 bg-white/20 rotate-45'></div>
                                        <p className='technical-readout'>TEMPORAL INDEX</p>
                                        <div className='ml-auto text-[8px] font-mono text-white/40'>ID:TI-001</div>
                                    </div>
                                    <div className='text-[4vw] leading-none font-[PPEditorialOld] tracking-tighter'>
                                        20//
                                        <br />
                                        40
                                    </div>
                                    <div className='w-12 h-[1px] bg-white/10 my-4'></div>
                                    <div className='flex items-center gap-2 text-[8px] font-mono text-white/40'>
                                        <div>HASH: 0xB8E3</div>
                                        <div className='ml-auto'>REV: 2.0.1</div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side */}
                            <div className='flex-1 flex flex-col justify-center items-end'>
                                <div className='max-w-[40vw] border-l border-white/10 pl-8'>
                                    <div className='flex items-center gap-4 mb-4'>
                                        <div className='w-2 h-2 bg-white/20 rotate-45'></div>
                                        <p className='technical-readout'>SYSTEM DIRECTIVE</p>
                                        <div className='ml-auto text-[8px] font-mono text-green-500/60'>VERIFIED</div>
                                    </div>
                                    <h1 className='text-[3vw] leading-[1.1] font-[PPEditorialOld] tracking-[-0.02em] mb-8 text-justify'>
                                        One sip to access
                                        <br />
                                        infinite timelines.
                                    </h1>
                                    <h2 className='text-[4vw] leading-[1.1] font-[PPEditorialOld] tracking-[-0.02em] text-white/80 text-justify'>
                                        Rewrite your reality.
                                    </h2>
                                    <div className='w-12 h-[1px] bg-white/10 my-4'></div>
                                    <div className='technical-readout text-right mt-12'>
                                        <div className='flex items-center gap-2 mb-2'>
                                            <div className='w-1 h-1 bg-white/20 rotate-45'></div>
                                            <p className='technical-readout text-white/60'>SYSTEM STATUS</p>
                                        </div>
                                        <div className='space-y-2'>
                                            <div className='technical-readout'>⟨14.40×23.40⟩</div>
                                            <div className='technical-readout'>⟨NEURAL-SYNC_REQUIRED⟩</div>
                                            <div className='technical-readout'>⟨QUANTUM STABILIZATION_ACTIVE⟩</div>
                                        </div>
                                    </div>
                                    <div className='flex items-center gap-2 text-[8px] font-mono text-white/40 mt-6'>
                                        <div>HASH: 0xC9F4</div>
                                        <div className='ml-auto'>REV: 3.2.0</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='flex justify-between items-end'>
                            <div className='border-l border-white/10 pl-8'>
                                <div className='flex items-center gap-2 mb-2'>
                                    <div className='w-1 h-1 bg-white/20 rotate-45'></div>
                                    <p className='technical-readout text-white/60'>SESSION DATA</p>
                                </div>
                                <div className='technical-readout'>
                                    11.07+
                                    <br />
                                    SSM24
                                </div>
                                <div className='flex items-center gap-2 text-[8px] font-mono text-white/40 mt-4'>
                                    <div>HASH: 0xE5B6</div>
                                    <div className='ml-auto'>REV: 1.1.3</div>
                                </div>
                            </div>
                            <div className='border-l border-white/10 pl-8'>
                                <div className='flex items-center gap-2 mb-2'>
                                    <div className='w-1 h-1 bg-white/20 rotate-45'></div>
                                    <p className='technical-readout text-white/60'>INSTANCE ID</p>
                                </div>
                                <div className='technical-readout text-right'>
                                    QMO2040
                                    <br />
                                    355⟩CTRL-Z
                                </div>
                                <div className='flex items-center gap-2 text-[8px] font-mono text-white/40 mt-4'>
                                    <div>HASH: 0xF7A8</div>
                                    <div className='ml-auto'>REV: 2.3.1</div>
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
                                <div className='absolute top-0 left-0 w-full h-full p-24'>
                                    {/* Top Left - Quantum Analysis */}
                                    <div className='border-l border-white/10 pl-16'>
                                        <div className='flex items-center gap-4 mb-8'>
                                            <div className='w-2 h-2 bg-white/20 rotate-45'></div>
                                            <p className='technical-readout'>QUANTUM ANALYSIS</p>
                                            <div className='ml-auto text-[8px] font-mono text-green-500/60'>PROCESSING</div>
                                        </div>
                                        <h2 className='text-white/95 font-[PPEditorialOld] text-[3.5vw] tracking-[-0.02em] leading-[1.1] mix-blend-difference mb-16'>
                                            We all have those moments.
                                            <br />
                                            The ones we wish we could undo.
                                        </h2>
                                        <div className='w-12 h-[1px] bg-white/10 my-8'></div>
                                    </div>

                                    {/* Bottom Right - System Status */}
                                    <div className='absolute bottom-24 right-24 w-[600px]'>
                                        <div className='border-l border-white/10 pl-8'>
                                            <div className='flex items-center gap-4 mb-4'>
                                                <div className='w-1 h-1 bg-white/20 rotate-45'></div>
                                                <p className='technical-readout text-white/60'>SYSTEM STATUS</p>
                                                <div className='ml-auto text-[8px] font-mono text-green-500/60'>ACTIVE</div>
                                            </div>
                                            <div className='border border-white/5 bg-white/5 p-8'>
                                                <div className='grid grid-cols-3 gap-12'>
                                                    <div className='space-y-2'>
                                                        <div className='flex items-center gap-2'>
                                                            <div className='w-1 h-1 bg-white/20 rotate-45'></div>
                                                            <p className='technical-readout text-white/60'>CPU LOAD</p>
                                                        </div>
                                                        <p className='technical-readout'>98.2%</p>
                                                        <div className='flex items-center gap-2 text-[8px] font-mono text-white/40 mt-4'>
                                                            <div>HASH: 0xD2E4</div>
                                                            <div className='ml-auto'>REV: 1.0.1</div>
                                                        </div>
                                                    </div>
                                                    <div className='space-y-2'>
                                                        <div className='flex items-center gap-2'>
                                                            <div className='w-1 h-1 bg-white/20 rotate-45'></div>
                                                            <p className='technical-readout text-white/60'>MEMORY</p>
                                                        </div>
                                                        <p className='technical-readout'>64.7%</p>
                                                        <div className='flex items-center gap-2 text-[8px] font-mono text-white/40 mt-4'>
                                                            <div>HASH: 0xE3F5</div>
                                                            <div className='ml-auto'>REV: 2.1.0</div>
                                                        </div>
                                                    </div>
                                                    <div className='space-y-2'>
                                                        <div className='flex items-center gap-2'>
                                                            <div className='w-1 h-1 bg-white/20 rotate-45'></div>
                                                            <p className='technical-readout text-white/60'>TEMP</p>
                                                        </div>
                                                        <p className='technical-readout'>42°C</p>
                                                        <div className='flex items-center gap-2 text-[8px] font-mono text-white/40 mt-4'>
                                                            <div>HASH: 0xF4G6</div>
                                                            <div className='ml-auto'>REV: 1.5.2</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Panel 2 */}
                            <div className='panel w-screen h-screen'>
                                <div className='w-full h-full flex flex-col p-24'>
                                    {/* Top Row - Interface and Alignment */}
                                    <div className='grid grid-cols-2 gap-12 mb-auto'>
                                        {/* Neural Sync */}
                                        <div className='flex justify-center'>
                                            <div className='feature-block max-w-[600px] w-full'>
                                                <div className='panel-text border-l border-white/10 pl-16 tech-specs'>
                                                    <div className='flex items-center gap-4 mb-4'>
                                                        <div className='w-2 h-2 bg-white/20 rotate-45'></div>
                                                        <p className='technical-readout'>NEURAL SYNC</p>
                                                        <div className='ml-auto text-[8px] font-mono text-white/40'>ID:NS-001</div>
                                                    </div>
                                                    <p className='text-white/90 font-[PPEditorialOld] text-[1.5vw]'>
                                                        Interface
                                                    </p>
                                                    <div className='w-12 h-[1px] bg-white/10 my-6'></div>
                                                    <div className='space-y-4'>
                                                        <div className='flex items-center gap-2'>
                                                            <div className='w-1 h-1 bg-white/20 rotate-45'></div>
                                                            <p className='technical-readout text-white/60'>STATUS: ACTIVE</p>
                                                            <div className='ml-auto text-[8px] font-mono text-green-500/60'>VERIFIED</div>
                                                        </div>
                                                        <div className='border border-white/5 bg-white/5 p-4'>
                                                            <p className='technical-readout'>
                                                                Advanced neural mapping ensures your consciousness remains stable across quantum transitions.
                                                            </p>
                                                        </div>
                                                        <div className='grid grid-cols-2 gap-4'>
                                                            <div className='flex items-center gap-2'>
                                                                <div className='w-1 h-1 bg-white/20 rotate-45'></div>
                                                                <p className='technical-readout text-white/60'>SYNC RATE: 99.99%</p>
                                                            </div>
                                                            <div className='flex items-center gap-2'>
                                                                <div className='w-1 h-1 bg-white/20 rotate-45'></div>
                                                                <p className='technical-readout text-white/60'>UPTIME: 100%</p>
                                                            </div>
                                                        </div>
                                                        <div className='flex items-center gap-2 text-[8px] font-mono text-white/40 mt-6'>
                                                            <div>HASH: 0xF7A9</div>
                                                            <div className='ml-auto'>REV: 2.1.0</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Interface */}
                                        <div className='flex justify-center'>
                                            <div className='feature-block max-w-[600px] w-full'>
                                                <div className='panel-text border-l border-white/10 pl-16 tech-specs'>
                                                    <div className='flex items-center gap-4 mb-4'>
                                                        <div className='w-2 h-2 bg-white/20 rotate-45'></div>
                                                        <p className='technical-readout'>INTERFACE</p>
                                                        <div className='ml-auto text-[8px] font-mono text-white/40'>ID:IF-003</div>
                                                    </div>
                                                    <p className='text-white/90 font-[PPEditorialOld] text-[1.5vw]'>
                                                        Alignment Delta
                                                    </p>
                                                    <div className='w-12 h-[1px] bg-white/10 my-6'></div>
                                                    <div className='space-y-4'>
                                                        <div className='flex items-center gap-2'>
                                                            <div className='w-1 h-1 bg-white/20 rotate-45'></div>
                                                            <p className='technical-readout text-white/60'>STATUS: ALIGNED</p>
                                                            <div className='ml-auto text-[8px] font-mono text-green-500/60'>VERIFIED</div>
                                                        </div>
                                                        <div className='border border-white/5 bg-white/5 p-4'>
                                                            <p className='technical-readout'>
                                                                Seamless integration between thought and action, allowing precise timeline selection.
                                                            </p>
                                                        </div>
                                                        <div className='grid grid-cols-2 gap-4'>
                                                            <div className='flex items-center gap-2'>
                                                                <div className='w-1 h-1 bg-white/20 rotate-45'></div>
                                                                <p className='technical-readout text-white/60'>LAT: 0ms</p>
                                                            </div>
                                                            <div className='flex items-center gap-2'>
                                                                <div className='w-1 h-1 bg-white/20 rotate-45'></div>
                                                                <p className='technical-readout text-white/60'>QBits: 1024</p>
                                                            </div>
                                                        </div>
                                                        <div className='flex items-center gap-2 text-[8px] font-mono text-white/40 mt-6'>
                                                            <div>HASH: 0xD1F8</div>
                                                            <div className='ml-auto'>REV: 1.9.2</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bottom Row - Quantum Core */}
                                    <div className='flex justify-center'>
                                        <div className='feature-block max-w-[600px] w-full'>
                                            <div className='panel-text border-l border-white/10 pl-16 tech-specs'>
                                                <div className='flex items-center gap-4 mb-4'>
                                                    <div className='w-2 h-2 bg-white/20 rotate-45'></div>
                                                    <p className='technical-readout'>QUANTUM CORE</p>
                                                    <div className='ml-auto text-[8px] font-mono text-white/40'>ID:QC-002</div>
                                                </div>
                                                <p className='text-white/90 font-[PPEditorialOld] text-[1.5vw]'>
                                                    Stabilization
                                                </p>
                                                <div className='w-12 h-[1px] bg-white/10 my-6'></div>
                                                <div className='space-y-4'>
                                                    <div className='flex items-center gap-2'>
                                                        <div className='w-1 h-1 bg-white/20 rotate-45'></div>
                                                        <p className='technical-readout text-white/60'>STATUS: OPTIMAL</p>
                                                        <div className='ml-auto text-[8px] font-mono text-green-500/60'>VERIFIED</div>
                                                    </div>
                                                    <div className='border border-white/5 bg-white/5 p-4'>
                                                        <p className='technical-readout'>
                                                            Proprietary quantum stabilization prevents timeline collapse while accessing parallel realities.
                                                        </p>
                                                    </div>
                                                    <div className='grid grid-cols-2 gap-4'>
                                                        <div className='flex items-center gap-2'>
                                                            <div className='w-1 h-1 bg-white/20 rotate-45'></div>
                                                            <p className='technical-readout text-white/60'>FIELD: 100%</p>
                                                        </div>
                                                        <div className='flex items-center gap-2'>
                                                            <div className='w-1 h-1 bg-white/20 rotate-45'></div>
                                                            <p className='technical-readout text-white/60'>TEMP: 42°K</p>
                                                        </div>
                                                    </div>
                                                    <div className='flex items-center gap-2 text-[8px] font-mono text-white/40 mt-6'>
                                                        <div>HASH: 0xB2E4</div>
                                                        <div className='ml-auto'>REV: 3.0.1</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Panel 3 */}
                            <div className='panel w-screen h-screen flex-shrink-0 p-16 flex items-center justify-center'>
                                <div className='max-w-[1200px] mx-auto grid grid-cols-[1fr_auto] gap-32'>
                                    {/* Left Side - Main Content */}
                                    <div className='max-w-[50vw]'>
                                        <div className='border-l border-white/10 pl-16'>
                                            <div className='flex items-center gap-4 mb-8'>
                                                <div className='w-2 h-2 bg-white/20 rotate-45'></div>
                                                <div className='technical-readout'>SYSTEM ANALYSIS</div>
                                                <div className='ml-auto text-[8px] font-mono text-green-500/60'>VERIFIED</div>
                                            </div>
                                            <h2 className='font-[PPEditorialOld] text-white/95 text-[3vw] tracking-[-0.02em] leading-[1.1] mb-8'>
                                                Traditional solutions told you to move on.
                                                <br />
                                                <br />
                                                We found a better way.
                                            </h2>
                                            <div className='w-12 h-[1px] bg-white/10 my-6'></div>
                                            <div className='space-y-4'>
                                                <div className='flex items-center gap-2'>
                                                    <div className='w-1 h-1 bg-white/20 rotate-45'></div>
                                                    <p className='technical-readout text-white/60'>ANALYSIS STATUS: COMPLETE</p>
                                                    <div className='ml-auto text-[8px] font-mono text-green-500/60'>VERIFIED</div>
                                                </div>
                                                <div className='border border-white/5 bg-white/5 p-4'>
                                                    <p className='technical-readout'>
                                                        Our quantum-infused beverage opens doorways to parallel timelines, letting you find the reality where you made the right choice.
                                                    </p>
                                                </div>
                                                <div className='grid grid-cols-2 gap-4'>
                                                    <div className='flex items-center gap-2'>
                                                        <div className='w-1 h-1 bg-white/20 rotate-45'></div>
                                                        <div className='technical-readout text-white/60'>BRANCH COUNT: ∞</div>
                                                    </div>
                                                    <div className='flex items-center gap-2'>
                                                        <div className='w-1 h-1 bg-white/20 rotate-45'></div>
                                                        <div className='technical-readout text-white/60'>SUCCESS RATE: 99.99%</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='flex items-center gap-2 text-[8px] font-mono text-white/40 mt-6'>
                                                <div>HASH: 0xG7H8</div>
                                                <div className='ml-auto'>REV: 2.5.0</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Side - Technical Specs */}
                                    <div className='panel-text w-[360px] border-l border-white/10 pl-16 tech-specs'>
                                        <div className='flex items-center gap-4 mb-12'>
                                            <div className='w-2 h-2 bg-white/20 rotate-45'></div>
                                            <p className='technical-readout'>Technical Specifications</p>
                                            <div className='ml-auto text-[8px] font-mono text-white/40'>ID:TS-001</div>
                                        </div>
                                        <div className='space-y-12'>
                                            <div className='spec-item'>
                                                <div className='flex items-center gap-2 mb-2'>
                                                    <div className='w-1 h-1 bg-white/20 rotate-45'></div>
                                                    <p className='technical-readout text-white/60'>MODEL</p>
                                                </div>
                                                <p className='text-white/90 font-[PPEditorialOld] text-[1.5vw]'>
                                                    QUANTUM CORE RT-749
                                                </p>
                                                <div className='w-12 h-[1px] bg-white/10 my-6'></div>
                                                <div className='flex items-center gap-2 text-[8px] font-mono text-white/40'>
                                                    <div>HASH: 0xJ6K7</div>
                                                    <div className='ml-auto'>REV: 1.8.3</div>
                                                </div>
                                            </div>
                                            <div className='spec-item'>
                                                <div className='flex items-center gap-2 mb-2'>
                                                    <div className='w-1 h-1 bg-white/20 rotate-45'></div>
                                                    <p className='technical-readout text-white/60'>SERIES</p>
                                                </div>
                                                <p className='text-white/90 font-[PPEditorialOld] text-[1.5vw]'>
                                                    SHIFT-X
                                                </p>
                                                <div className='w-12 h-[1px] bg-white/10 my-6'></div>
                                                <div className='flex items-center gap-2 text-[8px] font-mono text-white/40'>
                                                    <div>HASH: 0xL4M5</div>
                                                    <div className='ml-auto'>REV: 2.2.1</div>
                                                </div>
                                            </div>
                                            <div className='spec-item'>
                                                <div className='flex items-center gap-2 mb-2'>
                                                    <div className='w-1 h-1 bg-white/20 rotate-45'></div>
                                                    <p className='technical-readout text-white/60'>ESTABLISHED</p>
                                                </div>
                                                <p className='text-white/90 font-[PPEditorialOld] text-[1.5vw]'>
                                                    2038
                                                </p>
                                                <div className='w-12 h-[1px] bg-white/10 my-6'></div>
                                                <div className='flex items-center gap-2 text-[8px] font-mono text-white/40'>
                                                    <div>HASH: 0xN2P3</div>
                                                    <div className='ml-auto'>REV: 1.6.4</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Panel 4 */}
                            <div className='panel w-screen h-screen flex-shrink-0 p-16 grid grid-rows-6 grid-cols-12 gap-8'>
                                <div className='col-span-full row-span-full flex flex-col items-center justify-center text-center'>
                                    <div className='border-l border-white/10 pl-8 mb-16'>
                                        <div className='flex items-center gap-4 mb-4'>
                                            <div className='w-2 h-2 bg-white/20 rotate-45'></div>
                                            <p className='technical-readout'>SYSTEM IDENTITY</p>
                                            <div className='ml-auto text-[8px] font-mono text-green-500/60'>VERIFIED</div>
                                        </div>
                                        <p className='technical-readout'>
                                            CRTL-Z
                                        </p>
                                        <div className='w-12 h-[1px] bg-white/10 my-4'></div>
                                        <div className='flex items-center gap-2 text-[8px] font-mono text-white/40'>
                                            <div>HASH: 0xK8L9</div>
                                            <div className='ml-auto'>REV: 4.2.0</div>
                                        </div>
                                    </div>

                                    <div className='border-l border-white/10 pl-8 mb-16'>
                                        <div className='flex items-center gap-4 mb-4'>
                                            <div className='w-2 h-2 bg-white/20 rotate-45'></div>
                                            <p className='technical-readout'>DIRECTIVE</p>
                                            <div className='ml-auto text-[8px] font-mono text-white/40'>ID:DR-001</div>
                                        </div>
                                        <h2 className='font-[PPEditorialOld] text-white/95 text-[8vw] tracking-[-0.03em] leading-[1.1]'>
                                            Your perfect timeline exists.
                                            <br />
                                            We'll help you find it.
                                        </h2>
                                        <div className='w-12 h-[1px] bg-white/10 my-4'></div>
                                        <div className='flex items-center gap-2 text-[8px] font-mono text-white/40'>
                                            <div>HASH: 0xM7N8</div>
                                            <div className='ml-auto'>REV: 2.8.1</div>
                                        </div>
                                    </div>

                                    <div className='border-l border-white/10 pl-8'>
                                        <div className='flex items-center gap-4 mb-4'>
                                            <div className='w-2 h-2 bg-white/20 rotate-45'></div>
                                            <p className='technical-readout'>USER ACTION</p>
                                            <div className='ml-auto text-[8px] font-mono text-green-500/60'>REQUIRED</div>
                                        </div>
                                        <p className='technical-readout'>
                                            Continue to experience
                                        </p>
                                        <div className='w-12 h-[1px] bg-white/10 my-4'></div>
                                        <div className='flex items-center gap-2 text-[8px] font-mono text-white/40'>
                                            <div>HASH: 0xP5Q6</div>
                                            <div className='ml-auto'>REV: 1.3.4</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Testimonial Section */}
                    <section className='relative min-h-screen flex items-center justify-center py-24'>
                        <div className='container grid grid-cols-12 gap-8 px-8'>
                            <div className='col-span-6 border-l border-white/10 pl-8'>
                                <div className='flex items-center gap-4 mb-8'>
                                    <div className='w-2 h-2 bg-white/20 rotate-45'></div>
                                    <p className='technical-readout'>FIELD REPORTS</p>
                                    <div className='ml-auto text-[8px] font-mono text-green-500/60'>VERIFIED</div>
                                </div>
                                <h2 className='font-[PPEditorialOld] text-white/95 text-[3.5vw] leading-[1.1] mb-16'>
                                    When we first introduced quantum-state manipulation in beverage form, they called us impossible.
                                    <br />
                                    <br />
                                    <span className='text-white/70'>88 billion successful reality shifts later, they call us revolutionary.</span>
                                </h2>
                                <div className='w-12 h-[1px] bg-white/10 my-4'></div>
                                <div className='flex items-center gap-2 text-[8px] font-mono text-white/40'>
                                    <div>HASH: 0xR4S5</div>
                                    <div className='ml-auto'>REV: 3.5.0</div>
                                </div>
                            </div>

                            <div className='col-span-5 col-start-8 space-y-24'>
                                {/* Testimonial 1 */}
                                <div className='border-l border-white/10 pl-8'>
                                    <div className='flex items-center gap-4 mb-4'>
                                        <div className='w-2 h-2 bg-white/20 rotate-45'></div>
                                        <p className='technical-readout'>USER TESTIMONIAL</p>
                                        <div className='ml-auto text-[8px] font-mono text-white/40'>ID:UT-001</div>
                                    </div>
                                    <div className='flex mb-4'>
                                        {Array.from({ length: 5 }, (_, index) => (
                                            <span key={index} className='text-white/80 text-xl'>★</span>
                                        ))}
                                    </div>
                                    <div className='border border-white/5 bg-white/5 p-4'>
                                        <p className='technical-readout text-white/90'>
                                            "Yesterday, I made the worst presentation of my career. Or I would have, if ctrl-z hadn't helped me find the timeline where I remembered to actually save my slides."
                                        </p>
                                    </div>
                                    <div className='w-12 h-[1px] bg-white/10 my-4'></div>
                                    <div className='flex items-center gap-2 text-[8px] font-mono text-white/40'>
                                        <div>HASH: 0xT3U4</div>
                                        <div className='ml-auto'>REV: 1.2.3</div>
                                    </div>
                                </div>

                                {/* Testimonial 2 */}
                                <div className='border-l border-white/10 pl-8'>
                                    <div className='flex items-center gap-4 mb-4'>
                                        <div className='w-2 h-2 bg-white/20 rotate-45'></div>
                                        <p className='technical-readout'>USER TESTIMONIAL</p>
                                        <div className='ml-auto text-[8px] font-mono text-white/40'>ID:UT-002</div>
                                    </div>
                                    <div className='flex mb-4'>
                                        {Array.from({ length: 5 }, (_, index) => (
                                            <span key={index} className='text-white/80 text-xl'>★</span>
                                        ))}
                                    </div>
                                    <div className='border border-white/5 bg-white/5 p-4'>
                                        <p className='technical-readout text-white/90'>
                                            "Lost my wedding ring at the beach. One sip of ctrl-z and I was back in the timeline where I remembered to take it off before swimming. Life-saver!"
                                        </p>
                                    </div>
                                    <div className='w-12 h-[1px] bg-white/10 my-4'></div>
                                    <div className='flex items-center gap-2 text-[8px] font-mono text-white/40'>
                                        <div>HASH: 0xV2W3</div>
                                        <div className='ml-auto'>REV: 2.4.1</div>
                                    </div>
                                </div>

                                {/* Testimonial 3 */}
                                <div className='border-l border-white/10 pl-8'>
                                    <div className='flex items-center gap-4 mb-4'>
                                        <div className='w-2 h-2 bg-white/20 rotate-45'></div>
                                        <p className='technical-readout'>USER TESTIMONIAL</p>
                                        <div className='ml-auto text-[8px] font-mono text-white/40'>ID:UT-003</div>
                                    </div>
                                    <div className='flex mb-4'>
                                        {Array.from({ length: 5 }, (_, index) => (
                                            <span key={index} className='text-white/80 text-xl'>★</span>
                                        ))}
                                    </div>
                                    <div className='border border-white/5 bg-white/5 p-4'>
                                        <p className='technical-readout text-white/90'>
                                            "Sent an email to the entire company instead of just my team. ctrl-z helped me find the reality where I double-checked the recipient list. Worth every penny."
                                        </p>
                                    </div>
                                    <div className='w-12 h-[1px] bg-white/10 my-4'></div>
                                    <div className='flex items-center gap-2 text-[8px] font-mono text-white/40'>
                                        <div>HASH: 0xX1Y2</div>
                                        <div className='ml-auto'>REV: 1.7.2</div>
                                    </div>
                                </div>

                                {/* Testimonial 4 */}
                                <div className='border-l border-white/10 pl-8'>
                                    <div className='flex items-center gap-4 mb-4'>
                                        <div className='w-2 h-2 bg-white/20 rotate-45'></div>
                                        <p className='technical-readout'>USER TESTIMONIAL</p>
                                        <div className='ml-auto text-[8px] font-mono text-white/40'>ID:UT-004</div>
                                    </div>
                                    <div className='flex mb-4'>
                                        {Array.from({ length: 5 }, (_, index) => (
                                            <span key={index} className='text-white/80 text-xl'>★</span>
                                        ))}
                                    </div>
                                    <div className='border border-white/5 bg-white/5 p-4'>
                                        <p className='technical-readout text-white/90'>
                                            "Accidentally deleted three months of work with no backup. One ctrl-z later, I'm in a timeline where I religiously use cloud storage. Absolute game changer."
                                        </p>
                                    </div>
                                    <div className='w-12 h-[1px] bg-white/10 my-4'></div>
                                    <div className='flex items-center gap-2 text-[8px] font-mono text-white/40'>
                                        <div>HASH: 0xZ9A1</div>
                                        <div className='ml-auto'>REV: 2.0.4</div>
                                    </div>
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
                            <div className='technical-readout mb-32 flex items-center gap-4'>
                                <div className='w-2 h-2 bg-white/20 rotate-45'></div>
                                <span>QUANTUM SHIFT PROTOCOL</span>
                                <div className='ml-auto text-[8px] font-mono text-green-500/60'>READY</div>
                            </div>

                            {/* Technical Stats */}
                            <div className='grid grid-cols-3 gap-32 mb-32 w-full max-w-2xl'>
                                <div className='border-l border-white/10 pl-8'>
                                    <div className='flex items-center gap-2 mb-4'>
                                        <div className='w-1 h-1 bg-white/20 rotate-45'></div>
                                        <p className='technical-readout text-white/60'>REALITY SHIFTS</p>
                                    </div>
                                    <p className='text-white/90 font-[PPEditorialOld] text-[2vw]'>88.2B+</p>
                                    <div className='w-12 h-[1px] bg-white/10 my-4'></div>
                                    <div className='flex items-center gap-2 text-[8px] font-mono text-white/40'>
                                        <div>HASH: 0xE2A1</div>
                                        <div className='ml-auto'>REV: 4.0.2</div>
                                    </div>
                                </div>

                                <div className='border-l border-white/10 pl-8'>
                                    <div className='flex items-center gap-2 mb-4'>
                                        <div className='w-1 h-1 bg-white/20 rotate-45'></div>
                                        <p className='technical-readout text-white/60'>SUCCESS RATE</p>
                                    </div>
                                    <p className='text-white/90 font-[PPEditorialOld] text-[2vw]'>99.99%</p>
                                    <div className='w-12 h-[1px] bg-white/10 my-4'></div>
                                    <div className='flex items-center gap-2 text-[8px] font-mono text-white/40'>
                                        <div>HASH: 0xF3B2</div>
                                        <div className='ml-auto'>REV: 3.1.4</div>
                                    </div>
                                </div>

                                <div className='border-l border-white/10 pl-8'>
                                    <div className='flex items-center gap-2 mb-4'>
                                        <div className='w-1 h-1 bg-white/20 rotate-45'></div>
                                        <p className='technical-readout text-white/60'>QUANTUM STABILITY</p>
                                    </div>
                                    <p className='text-white/90 font-[PPEditorialOld] text-[2vw]'>100%</p>
                                    <div className='w-12 h-[1px] bg-white/10 my-4'></div>
                                    <div className='flex items-center gap-2 text-[8px] font-mono text-white/40'>
                                        <div>HASH: 0xC4D9</div>
                                        <div className='ml-auto'>REV: 2.8.0</div>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className='border border-white/5 bg-white/5 p-8 mb-16 max-w-2xl'>
                                <div className='flex items-center gap-4 mb-4'>
                                    <div className='w-2 h-2 bg-white/20 rotate-45'></div>
                                    <p className='technical-readout'>SYSTEM MESSAGE</p>
                                    <div className='ml-auto text-[8px] font-mono text-white/40'>ID:SM-001</div>
                                </div>
                                <p className='technical-readout text-white/90'>
                                    Every mistake is just a timeline waiting to be corrected. Your perfect reality is just one sip away.
                                </p>
                            </div>

                            {/* CTA Buttons */}
                            <div className='flex gap-8 mb-32'>
                                <div ref={initiateBtnRef} className='relative'>
                                    <button className='cta-button hover-highlight group relative'>
                                        <div className='corner corner-tl'></div>
                                        <div className='corner corner-tr'></div>
                                        <div className='corner corner-bl'></div>
                                        <div className='corner corner-br'></div>
                                        <span className='technical-readout relative z-10 text-white/90'>
                                            INITIATE SHIFT
                                        </span>
                                    </button>
                                </div>

                                <div ref={learnMoreBtnRef} className='relative'>
                                    <button className='cta-button group relative'>
                                        <div className='corner corner-tl'></div>
                                        <div className='corner corner-tr'></div>
                                        <div className='corner corner-bl'></div>
                                        <div className='corner corner-br'></div>
                                        <span className='technical-readout relative z-10 text-white/40'>
                                            LEARN MORE
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {/* Technical Details */}
                            <div className='grid grid-cols-2 gap-32 w-full max-w-2xl'>
                                <div className='border-l border-white/10 pl-8'>
                                    <div className='flex items-center gap-2 mb-4'>
                                        <div className='w-1 h-1 bg-white/20 rotate-45'></div>
                                        <p className='technical-readout text-white/60'>SYSTEM INFO</p>
                                    </div>
                                    <div className='space-y-2'>
                                        <div className='technical-readout'>MODEL: QS-749-X</div>
                                        <div className='technical-readout'>BUILD: 2038.12.1</div>
                                    </div>
                                    <div className='w-12 h-[1px] bg-white/10 my-4'></div>
                                    <div className='flex items-center gap-2 text-[8px] font-mono text-white/40'>
                                        <div>HASH: 0xA1B2</div>
                                        <div className='ml-auto'>REV: 1.0.0</div>
                                    </div>
                                </div>

                                <div className='border-l border-white/10 pl-8'>
                                    <div className='flex items-center gap-2 mb-4'>
                                        <div className='w-1 h-1 bg-white/20 rotate-45'></div>
                                        <p className='technical-readout text-white/60'>LOCATION DATA</p>
                                    </div>
                                    <div className='space-y-2'>
                                        <div className='technical-readout'>LAT: 37.7749° N</div>
                                        <div className='technical-readout'>LONG: 122.4194° W</div>
                                    </div>
                                    <div className='w-12 h-[1px] bg-white/10 my-4'></div>
                                    <div className='flex items-center gap-2 text-[8px] font-mono text-white/40'>
                                        <div>HASH: 0xD3E4</div>
                                        <div className='ml-auto'>REV: 2.1.5</div>
                                    </div>
                                </div>
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
