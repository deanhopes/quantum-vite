import React, { useRef, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from 'split-type';
import { ScrollContext, ScrollContextType } from "./types/ScrollContext";
import { SceneContent } from "./3d/SceneContent";
import { InteractiveGrid } from "./ui/InteractiveGrid";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

interface QuantumPageProps {
    isLoading: boolean;
}

const QuantumPage = ({ isLoading }: QuantumPageProps) => {
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
    const [isSceneReady, setIsSceneReady] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

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

    // Scene ready handler
    const handleSceneReady = () => {
        setIsSceneReady(true);
    };

    useEffect(() => {
        // Reset scroll position on mount/refresh
        window.history.scrollRestoration = 'manual';
        window.scrollTo(0, 0);
        document.body.style.overflow = 'hidden';

        // Set initial opacity of parent container
        if (containerRef.current) {
            gsap.set(containerRef.current, { autoAlpha: 0 });
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    // Handle initial animations
    useEffect(() => {
        if (!isSceneReady || isLoading) return;

        // Start animations after a short delay
        const startAnimations = () => {
            setIsVisible(true);

            // Create main timeline
            const tl = gsap.timeline({
                defaults: { ease: "power3.out" }
            });

            // Set parent container to visible first
            if (containerRef.current) {
                tl.to(containerRef.current, {
                    autoAlpha: 1,
                    duration: 0.5
                });
            }

            // Hero section animation
            if (heroTextRef.current && subTextRef.current) {
                const heroTitle = new SplitType(heroTextRef.current, {
                    types: 'words,chars',
                    tagName: 'span'
                });
                const heroSubtitle = new SplitType(subTextRef.current, {
                    types: 'words,chars',
                    tagName: 'span'
                });

                // Set initial states
                gsap.set([heroTextRef.current, subTextRef.current], { autoAlpha: 0 });
                gsap.set([initiateBtnRef.current, learnMoreBtnRef.current], { autoAlpha: 0 });

                tl.fromTo(
                    heroTitle.chars,
                    {
                        y: 100,
                        opacity: 0
                    },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 1,
                        stagger: 0.02,
                        onStart: function () { gsap.set(heroTextRef.current, { autoAlpha: 1 }); }
                    }
                )
                    .fromTo(
                        heroSubtitle.chars,
                        {
                            y: 50,
                            opacity: 0
                        },
                        {
                            y: 0,
                            opacity: 1,
                            duration: 0.8,
                            stagger: 0.02,
                            onStart: function () { gsap.set(subTextRef.current, { autoAlpha: 1 }); }
                        },
                        "-=0.5"
                    )
                    .fromTo(
                        [initiateBtnRef.current, learnMoreBtnRef.current],
                        {
                            scale: 0.9,
                            opacity: 0,
                            y: 20
                        },
                        {
                            scale: 1,
                            opacity: 1,
                            y: 0,
                            duration: 0.8,
                            stagger: 0.1,
                            ease: "back.out(1.2)",
                            onStart: function () { gsap.set([initiateBtnRef.current, learnMoreBtnRef.current], { autoAlpha: 1 }); }
                        },
                        "-=0.4"
                    )
                    .fromTo(
                        [logoRef.current, magneticBtnRef.current],
                        {
                            y: -100,
                            opacity: 0,
                            scale: 0.8,
                        },
                        {
                            y: 0,
                            opacity: 1,
                            scale: 1,
                            duration: 1.2,
                            stagger: 0.2,
                            ease: "elastic.out(1, 0.75)"
                        },
                        "+=0.2"
                    );

                // Clean up split text
                return () => {
                    heroTitle.revert();
                    heroSubtitle.revert();
                };
            }
        };

        // Add a small delay before starting animations
        const timer = setTimeout(startAnimations, 100);
        return () => clearTimeout(timer);
    }, [isSceneReady, isLoading]);

    // Handle scroll animations
    useEffect(() => {
        if (!isSceneReady || isLoading) return;

        const horizontalSection = document.querySelector("#horizontalSection");
        if (!horizontalSection) return;

        const panels = gsap.utils.toArray<HTMLElement>(".panel");
        const totalWidth = panels.length * window.innerWidth;

        // Create horizontal scroll animation
        const horizontalScroll = gsap.timeline({
            scrollTrigger: {
                trigger: horizontalSection,
                start: "top top",
                end: () => `+=${totalWidth}`,
                pin: true,
                scrub: 1,
                anticipatePin: 1,
                invalidateOnRefresh: true,
                onUpdate: (self) => {
                    setScrollState({
                        scrollProgress: self.progress,
                        isHorizontalSection: self.isActive,
                    });
                },
            },
        });

        // Animate panels
        horizontalScroll.to(".horizontal-scroll-content", {
            x: () => -(totalWidth - window.innerWidth),
            ease: "none",
        });

        // Set up scroll-triggered text animations for each panel separately
        panels.forEach((panel, index) => {
            // Only animate non-mono font text elements
            const textElements = panel.querySelectorAll('.animate-text:not(.technical-readout)');
            textElements.forEach(element => {
                const splitText = new SplitType(element as HTMLElement, {
                    types: 'words,chars',
                    tagName: 'span'
                });

                gsap.fromTo(
                    splitText.chars,
                    {
                        y: 50,
                        opacity: 0
                    },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 1,
                        stagger: 0.02,
                        scrollTrigger: {
                            trigger: panel,
                            containerAnimation: horizontalScroll,
                            start: "left center",
                            end: "right center",
                            toggleActions: "play none none none"
                        }
                    }
                );
            });
        });

        // Set up testimonial section animations separately
        const testimonialSection = document.querySelector('.testimonial-section');
        if (testimonialSection) {
            const testimonialTexts = testimonialSection.querySelectorAll('.animate-text:not(.technical-readout)');
            testimonialTexts.forEach(element => {
                const splitText = new SplitType(element as HTMLElement, {
                    types: 'words,chars',
                    tagName: 'span'
                });

                gsap.fromTo(
                    splitText.chars,
                    {
                        y: 50,
                        opacity: 0
                    },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 1,
                        stagger: 0.02,
                        scrollTrigger: {
                            trigger: element,
                            start: "top 80%",
                            end: "top 20%",
                            toggleActions: "play none none none"
                        }
                    }
                );
            });
        }

        // Enable scrolling after loader and initial animations
        document.body.style.overflow = '';

        // Cleanup
        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
            document.body.style.overflow = '';
        };
    }, [isSceneReady, isLoading]);

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
                                handleSceneReady();
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
                            <Suspense fallback={null}>
                                <SceneContent />
                            </Suspense>
                        </Canvas>
                    )}
                </div>

                {/* Content Container - Remove opacity transition from here */}
                <div className='relative'>
                    {/* Navbar */}
                    <nav className={`fixed top-0 left-0 w-full h-20 flex items-center justify-between px-16 z-50 transition-all duration-500 ${isLoading ? 'opacity-0 translate-y-[-20px] pointer-events-none' : ''}`}>
                        <div ref={logoRef} className='w-[8rem] origin-top will-change-transform opacity-0'>
                            <img
                                src='/src/assets/ctrlz-logo.svg'
                                alt='CTRL-Z'
                                className='w-full object-contain'
                            />
                        </div>
                        <div ref={magneticBtnRef} className='relative flex items-center justify-center will-change-transform opacity-0'>
                            <button className='cta-button hover-highlight group relative w-32 h-12 flex items-center justify-center'>
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
                        <section className='hero-section relative h-screen flex flex-col overflow-hidden'>
                            <div className='container mx-auto max-w-[80vw] h-full flex flex-col justify-center'>
                                <div className='grid grid-cols-12 gap-8'>
                                    <div className='col-span-12 text-center mb-16'>
                                        <h1 ref={heroTextRef} className='font-[PPEditorialOld] text-white/95 text-[5vw] leading-[1.1] tracking-[-0.02em] mb-8 will-change-transform'>
                                            In this timeline, you're reading this ad.
                                        </h1>
                                        <h2 ref={subTextRef} className='font-[PPEditorialOld] text-[3vw] leading-[1.2] text-white/70 tracking-[-0.02em] mb-12 will-change-transform'>
                                            In another, you've already tried our drink.
                                        </h2>
                                        <div className='flex gap-6 justify-center'>
                                            <div ref={initiateBtnRef}>
                                                <button className='cta-button hover-highlight group'>
                                                    <div className='corner corner-tl'></div>
                                                    <div className='corner corner-tr'></div>
                                                    <div className='corner corner-bl'></div>
                                                    <div className='corner corner-br'></div>
                                                    <span className='technical-readout text-white/90'>
                                                        INITIATE SHIFT
                                                    </span>
                                                </button>
                                            </div>
                                            <div ref={learnMoreBtnRef}>
                                                <button className='cta-button group'>
                                                    <div className='corner corner-tl'></div>
                                                    <div className='corner corner-tr'></div>
                                                    <div className='corner corner-bl'></div>
                                                    <div className='corner corner-br'></div>
                                                    <span className='technical-readout text-white/40'>
                                                        LEARN MORE
                                                    </span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Technical Details - Minimal and Elegant */}
                                    <div className='col-span-12 flex justify-center gap-8'>
                                        <div className='technical-readout text-[10px] flex items-center gap-4'>
                                            <div className='w-1.5 h-1.5 bg-white/20 rotate-45'></div>
                                            <span>NEURAL SYNC: 99.99%</span>
                                            <span className='text-green-500/60'>ACTIVE</span>
                                        </div>
                                        <div className='technical-readout text-[10px] flex items-center gap-4'>
                                            <div className='w-1.5 h-1.5 bg-white/20 rotate-45'></div>
                                            <span>TIMELINE INTEGRITY: 100%</span>
                                            <span className='text-green-500/60'>VERIFIED</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Horizontal Scroll Section */}
                        <section
                            id='horizontalSection'
                            className='relative h-screen w-screen overflow-hidden'
                        >
                            <div className='absolute top-0 left-0 h-full flex horizontal-scroll-content'>
                                {/* Panel 1 */}
                                <div className='panel w-screen h-screen flex-shrink-0'>
                                    <div className='absolute inset-0 p-24 flex flex-col justify-between'>
                                        {/* Top Content */}
                                        <div className='flex justify-between items-start'>
                                            <div className='border-l-2 border-quantum-green/20 pl-16 max-w-[50vw]'>
                                                <div className='flex items-center gap-4 mb-8'>
                                                    <div className='w-2 h-2 bg-quantum-green/30 rotate-45 animate-pulse'></div>
                                                    <p className='font-quantum-mono text-quantum-green/60 text-sm tracking-[0.2em]'>QUANTUM ANALYSIS</p>
                                                    <div className='ml-auto text-[8px] font-quantum-mono text-quantum-green/40 animate-pulse'>PROCESSING</div>
                                                </div>
                                                <h2 className='animate-text text-quantum-green/90 font-[PPEditorialOld] text-[3.5vw] tracking-[-0.02em] leading-[1.1] mix-blend-difference mb-16'>
                                                    In a third, you invented it.
                                                </h2>
                                            </div>
                                        </div>

                                        {/* Bottom Content */}
                                        <div className='flex justify-end'>
                                            <div className='w-[600px]'>
                                                <div className='border-l-2 border-quantum-green/20 pl-8'>
                                                    <div className='flex items-center gap-4 mb-4'>
                                                        <div className='w-1 h-1 bg-quantum-green/30 rotate-45'></div>
                                                        <p className='font-quantum-mono text-quantum-green/60 text-xs tracking-[0.2em]'>SYSTEM STATUS</p>
                                                        <div className='ml-auto text-[8px] font-quantum-mono text-quantum-green/40 animate-pulse'>ACTIVE</div>
                                                    </div>
                                                    <div className='border border-quantum-green/10 bg-quantum-green/5 p-8 backdrop-blur-sm'>
                                                        <div className='grid grid-cols-3 gap-12'>
                                                            <div className='space-y-2'>
                                                                <div className='flex items-center gap-2'>
                                                                    <div className='w-1 h-1 bg-quantum-green/30 rotate-45'></div>
                                                                    <p className='font-quantum-mono text-quantum-green/60 text-xs tracking-[0.2em]'>CPU LOAD</p>
                                                                </div>
                                                                <p className='font-quantum-mono text-quantum-green/80 quantum-glow'>98.2%</p>
                                                            </div>
                                                            <div className='space-y-2'>
                                                                <div className='flex items-center gap-2'>
                                                                    <div className='w-1 h-1 bg-quantum-green/30 rotate-45'></div>
                                                                    <p className='font-quantum-mono text-quantum-green/60 text-xs tracking-[0.2em]'>MEMORY</p>
                                                                </div>
                                                                <p className='font-quantum-mono text-quantum-green/80 quantum-glow'>64.7%</p>
                                                            </div>
                                                            <div className='space-y-2'>
                                                                <div className='flex items-center gap-2'>
                                                                    <div className='w-1 h-1 bg-quantum-green/30 rotate-45'></div>
                                                                    <p className='font-quantum-mono text-quantum-green/60 text-xs tracking-[0.2em]'>TEMP</p>
                                                                </div>
                                                                <p className='font-quantum-mono text-quantum-green/80 quantum-glow'>42°C</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Add scanline and glitch effects */}
                                    <div className='absolute inset-0 pointer-events-none bg-scanline opacity-[0.03] animate-scan' />
                                    <div className='absolute inset-0 pointer-events-none bg-glitch-pattern opacity-[0.02] animate-glitch-fast' />
                                    <div className='absolute inset-0 bg-gradient-radial from-transparent via-black/30 to-black/70 pointer-events-none' />

                                    {/* Enhanced CTA Button */}
                                    <button className='cta-button group relative overflow-hidden'>
                                        <div className='corner corner-tl bg-quantum-green/20'></div>
                                        <div className='corner corner-tr bg-quantum-green/20'></div>
                                        <div className='corner corner-bl bg-quantum-green/20'></div>
                                        <div className='corner corner-br bg-quantum-green/20'></div>
                                        <span className='font-quantum-mono text-quantum-green/80 relative z-10 tracking-[0.2em] quantum-glow'>
                                            INITIATE SHIFT
                                        </span>
                                        <div className='absolute inset-0 bg-gradient-to-r from-transparent via-quantum-green/10 to-transparent animate-glitch-slide' />
                                    </button>
                                </div>

                                {/* Panel 2 */}
                                <div className='panel w-screen h-screen flex-shrink-0'>
                                    <div className='absolute inset-0 p-24 flex items-center'>
                                        <div className='grid grid-cols-2 gap-32 w-full'>
                                            {/* Left Content */}
                                            <div className='border-l border-white/10 pl-16'>
                                                <div className='flex items-center gap-4 mb-8'>
                                                    <div className='w-2 h-2 bg-white/20 rotate-45'></div>
                                                    <p className='technical-readout'>SYSTEM ANALYSIS</p>
                                                    <div className='ml-auto text-[8px] font-mono text-green-500/60'>VERIFIED</div>
                                                </div>
                                                <h2 className='animate-text text-white/95 font-[PPEditorialOld] text-[3.5vw] tracking-[-0.02em] leading-[1.1] mb-16'>
                                                    The first quantum beverage <br />
                                                    that exists in all states <br />
                                                    until you take a sip.
                                                </h2>
                                                <div className='border border-white/5 bg-white/5 p-4'>
                                                    <p className='animate-text technical-readout'>
                                                        Our quantum-infused beverage opens doorways to parallel timelines, letting you find the reality where you made the right choice.
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Right Content - Technical Details */}
                                            <div className='space-y-8'>
                                                <div className='flex items-center gap-2 text-[8px] font-mono text-white/40'>
                                                    <div>HASH: 0xB8E3</div>
                                                    <div className='ml-auto'>REV: 2.0.1</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Panel 3 */}
                                <div className='panel w-screen h-screen flex-shrink-0'>
                                    <div className='absolute inset-0 p-24 flex items-center justify-center'>
                                        <div className='max-w-[80vw] text-center'>
                                            <div className='border-l border-white/10 pl-16 mb-16'>
                                                <div className='flex items-center gap-4 mb-8'>
                                                    <div className='w-2 h-2 bg-white/20 rotate-45'></div>
                                                    <p className='technical-readout'>DIRECTIVE</p>
                                                    <div className='ml-auto text-[8px] font-mono text-white/40'>ID:DR-001</div>
                                                </div>
                                                <h2 className='animate-text text-white/95 font-[PPEditorialOld] text-[8vw] tracking-[-0.03em] leading-[1.1]'>
                                                    Choose your reality.
                                                    <br />
                                                    All of them are true.
                                                </h2>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Grid Container - Scrolls with content */}
                            <div className='absolute top-0 left-0 h-screen horizontal-scroll-content'>
                                <div className='w-[400vw] h-full'>
                                    <InteractiveGrid />
                                </div>
                            </div>
                        </section>

                        {/* Testimonial Section */}
                        <section className='testimonial-section relative min-h-screen flex items-center justify-center py-24'>
                            <div className='container mx-auto grid grid-cols-12 gap-8 px-8'>
                                {/* Left side - Field Report */}
                                <div className='col-span-6 border-l border-white/10 pl-8'>
                                    <div className='flex items-center gap-4 mb-4'>
                                        <div className='w-2 h-2 bg-white/20 rotate-45'></div>
                                        <p className='technical-readout'>FIELD REPORT: QUANTUM-STATE BEVERAGE INNOVATION</p>
                                        <div className='ml-auto text-[8px] font-mono text-green-500/60'>VERIFIED</div>
                                    </div>
                                    <div className='space-y-2 mb-8'>
                                        <div className='technical-readout text-white/60'>VERSION: 4.0.1</div>
                                        <div className='technical-readout text-white/60'>HASH: 0xQSM-2024-001</div>
                                    </div>
                                    <div className='mb-12'>
                                        <div className='flex items-center gap-4 mb-4'>
                                            <div className='w-1 h-1 bg-white/20 rotate-45'></div>
                                            <p className='technical-readout'>EXECUTIVE SUMMARY</p>
                                        </div>
                                        <h2 className='animate-text font-[PPEditorialOld] text-white/95 text-[3.5vw] leading-[1.1] mb-16'>
                                            When we introduced quantum-state manipulation in beverage form, skeptics called it impossible. <br /><br /> After 88 billion documented reality corrections across 1.2 million users, they call it inevitable.
                                        </h2>
                                    </div>
                                    <div className='border border-white/5 bg-white/5 p-8 mb-8'>
                                        <div className='flex items-center gap-4 mb-4'>
                                            <div className='w-1 h-1 bg-white/20 rotate-45'></div>
                                            <p className='technical-readout'>VERIFICATION METRICS</p>
                                        </div>
                                        <div className='grid grid-cols-2 gap-4'>
                                            <div className='technical-readout text-white/90'>Success Rate: 99.997%</div>
                                            <div className='technical-readout text-white/90'>Reality Coherence: 100%</div>
                                            <div className='technical-readout text-white/90'>User Satisfaction: 98.9%</div>
                                            <div className='technical-readout text-white/90'>Timeline Stability: ∆0.0001</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right side - Case Studies */}
                                <div className='col-span-5 col-start-8 space-y-12'>
                                    <div className='flex items-center gap-4 mb-8'>
                                        <div className='w-2 h-2 bg-white/20 rotate-45'></div>
                                        <p className='technical-readout'>USER IMPACT ANALYSIS</p>
                                    </div>

                                    {/* Case Study 001 */}
                                    <div className='border-l border-white/10 pl-8'>
                                        <div className='flex items-center gap-4 mb-4'>
                                            <div className='w-1 h-1 bg-white/20 rotate-45'></div>
                                            <p className='technical-readout'>CASE STUDY 001</p>
                                            <div className='ml-auto text-[8px] font-mono text-white/40'>HASH: 0xCS001-24</div>
                                        </div>
                                        <div className='technical-readout text-white/60 mb-4'>CONTEXT: High-Stakes Professional Presentation</div>
                                        <div className='border border-white/5 bg-white/5 p-4 mb-4'>
                                            <p className='technical-readout text-white/90'>
                                                "The presentation was destined for failure - critical data missing, wrong format, obsolete figures. One precision-timed application of CTRL-Z revealed the optimal timeline where meticulous preparation met flawless execution. Board approval secured."
                                            </p>
                                        </div>
                                        <div className='flex justify-between items-center'>
                                            <div className='flex mb-4'>
                                                {Array.from({ length: 5 }, (_, index) => (
                                                    <span key={index} className='text-white/80 text-xl'>★</span>
                                                ))}
                                            </div>
                                            <div className='technical-readout text-white/60'>Temporal Shift: -3.5 hours</div>
                                        </div>
                                    </div>

                                    {/* Case Study 002 */}
                                    <div className='border-l border-white/10 pl-8'>
                                        <div className='flex items-center gap-4 mb-4'>
                                            <div className='w-1 h-1 bg-white/20 rotate-45'></div>
                                            <p className='technical-readout'>CASE STUDY 002</p>
                                            <div className='ml-auto text-[8px] font-mono text-white/40'>HASH: 0xCS002-24</div>
                                        </div>
                                        <div className='technical-readout text-white/60 mb-4'>CONTEXT: Personal Value Recovery</div>
                                        <div className='border border-white/5 bg-white/5 p-4 mb-4'>
                                            <p className='technical-readout text-white/90'>
                                                "Mediterranean vacation, platinum wedding band, unexpected wave pattern. CTRL-Z identified the convergence point where foresight prevented loss. Asset secured, marriage harmony maintained, vacation uninterrupted."
                                            </p>
                                        </div>
                                        <div className='flex justify-between items-center'>
                                            <div className='flex mb-4'>
                                                {Array.from({ length: 5 }, (_, index) => (
                                                    <span key={index} className='text-white/80 text-xl'>★</span>
                                                ))}
                                            </div>
                                            <div className='technical-readout text-white/60'>Temporal Shift: -45 minutes</div>
                                        </div>
                                    </div>

                                    {/* Case Study 003 */}
                                    <div className='border-l border-white/10 pl-8'>
                                        <div className='flex items-center gap-4 mb-4'>
                                            <div className='w-1 h-1 bg-white/20 rotate-45'></div>
                                            <p className='technical-readout'>CASE STUDY 003</p>
                                            <div className='ml-auto text-[8px] font-mono text-white/40'>HASH: 0xCS003-24</div>
                                        </div>
                                        <div className='technical-readout text-white/60 mb-4'>CONTEXT: Corporate Communication Crisis</div>
                                        <div className='border border-white/5 bg-white/5 p-4 mb-4'>
                                            <p className='technical-readout text-white/90'>
                                                "All-company email incident avoided through quantum intervention. CTRL-Z facilitated access to the decision point where standard verification protocols were observed. Professional reputation preserved, workflow maintained."
                                            </p>
                                        </div>
                                        <div className='flex justify-between items-center'>
                                            <div className='flex mb-4'>
                                                {Array.from({ length: 5 }, (_, index) => (
                                                    <span key={index} className='text-white/80 text-xl'>★</span>
                                                ))}
                                            </div>
                                            <div className='technical-readout text-white/60'>Temporal Shift: -2.2 minutes</div>
                                        </div>
                                    </div>

                                    {/* System Integrity */}
                                    <div className='border-l border-white/10 pl-8 mt-16'>
                                        <div className='flex items-center gap-4 mb-4'>
                                            <div className='w-1 h-1 bg-white/20 rotate-45'></div>
                                            <p className='technical-readout'>SYSTEM INTEGRITY VERIFICATION</p>
                                            <div className='ml-auto text-[8px] font-mono text-white/40'>HASH: 0xSYS-QA-24</div>
                                        </div>
                                        <div className='space-y-2'>
                                            <div className='technical-readout text-white/60'>All reports quantum-authenticated</div>
                                            <div className='technical-readout text-white/60'>Timeline coherence validated</div>
                                            <div className='technical-readout text-white/60'>Causality chains intact</div>
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
                                    <div className='border-l-2 border-quantum-green/20 pl-8'>
                                        <div className='flex items-center gap-2 mb-4'>
                                            <div className='w-1 h-1 bg-quantum-green/30 rotate-45'></div>
                                            <p className='font-quantum-mono text-quantum-green/60 text-xs tracking-[0.2em]'>REALITY SHIFTS</p>
                                        </div>
                                        <p className='text-quantum-green/90 font-[PPEditorialOld] text-[2vw] quantum-glow'>88.2B+</p>
                                        <div className='w-12 h-[1px] bg-quantum-green/10 my-4'></div>
                                        <div className='flex items-center gap-2 text-[8px] font-quantum-mono text-quantum-green/40'>
                                            <div>HASH: 0xE2A1</div>
                                            <div className='ml-auto'>REV: 4.0.2</div>
                                        </div>
                                    </div>

                                    <div className='border-l-2 border-quantum-green/20 pl-8'>
                                        <div className='flex items-center gap-2 mb-4'>
                                            <div className='w-1 h-1 bg-quantum-green/30 rotate-45'></div>
                                            <p className='font-quantum-mono text-quantum-green/60 text-xs tracking-[0.2em]'>SUCCESS RATE</p>
                                        </div>
                                        <p className='text-quantum-green/90 font-[PPEditorialOld] text-[2vw] quantum-glow'>99.99%</p>
                                        <div className='w-12 h-[1px] bg-quantum-green/10 my-4'></div>
                                        <div className='flex items-center gap-2 text-[8px] font-quantum-mono text-quantum-green/40'>
                                            <div>HASH: 0xF3B2</div>
                                            <div className='ml-auto'>REV: 3.1.4</div>
                                        </div>
                                    </div>

                                    <div className='border-l-2 border-quantum-green/20 pl-8'>
                                        <div className='flex items-center gap-2 mb-4'>
                                            <div className='w-1 h-1 bg-quantum-green/30 rotate-45'></div>
                                            <p className='font-quantum-mono text-quantum-green/60 text-xs tracking-[0.2em]'>QUANTUM STABILITY</p>
                                        </div>
                                        <p className='text-quantum-green/90 font-[PPEditorialOld] text-[2vw] quantum-glow'>100%</p>
                                        <div className='w-12 h-[1px] bg-quantum-green/10 my-4'></div>
                                        <div className='flex items-center gap-2 text-[8px] font-quantum-mono text-quantum-green/40'>
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
                                    <p className='animate-text technical-readout text-white/90'>
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
                                    <div className='border-l-2 border-quantum-green/20 pl-8'>
                                        <div className='flex items-center gap-2 mb-4'>
                                            <div className='w-1 h-1 bg-quantum-green/30 rotate-45'></div>
                                            <p className='font-quantum-mono text-quantum-green/60 text-xs tracking-[0.2em]'>SYSTEM INFO</p>
                                        </div>
                                        <div className='space-y-2'>
                                            <div className='technical-readout'>MODEL: QS-749-X</div>
                                            <div className='technical-readout'>BUILD: 2038.12.1</div>
                                        </div>
                                        <div className='w-12 h-[1px] bg-quantum-green/10 my-4'></div>
                                        <div className='flex items-center gap-2 text-[8px] font-quantum-mono text-quantum-green/40'>
                                            <div>HASH: 0xA1B2</div>
                                            <div className='ml-auto'>REV: 1.0.0</div>
                                        </div>
                                    </div>

                                    <div className='border-l-2 border-quantum-green/20 pl-8'>
                                        <div className='flex items-center gap-2 mb-4'>
                                            <div className='w-1 h-1 bg-quantum-green/30 rotate-45'></div>
                                            <p className='font-quantum-mono text-quantum-green/60 text-xs tracking-[0.2em]'>LOCATION DATA</p>
                                        </div>
                                        <div className='space-y-2'>
                                            <div className='technical-readout'>LAT: 37.7749° N</div>
                                            <div className='technical-readout'>LONG: 122.4194° W</div>
                                        </div>
                                        <div className='w-12 h-[1px] bg-quantum-green/10 my-4'></div>
                                        <div className='flex items-center gap-2 text-[8px] font-quantum-mono text-quantum-green/40'>
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
            </div>
        </ScrollContext.Provider>
    );
};

export default QuantumPage;
