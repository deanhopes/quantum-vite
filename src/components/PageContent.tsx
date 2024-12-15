import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ScrollContextProvider } from '../context/ScrollContext';

const PageContent = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const targetRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const lastScrollLogTime = useRef(0);

    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start start", "end start"],
        container: scrollContainerRef
    });

    // Calculate total width of panels (4 panels * 100vw)
    const totalPanels = 4;
    const translateDistance = (totalPanels) * 100;

    // Transform from 0% to -(totalPanels-1)00%
    const containerX = useTransform(
        scrollYProgress,
        [0, 1],
        [`0%`, `-${translateDistance}%`]
    );

    const [currentProgress, setCurrentProgress] = useState(0);
    const [isInHorizontalSection, setIsInHorizontalSection] = useState(false);

    // Debounced scroll logging
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

    // Increase the number of threshold points for smoother detection
    const INTERSECTION_THRESHOLDS = Array.from({ length: 100 }, (_, i) => i / 100);

    // Track when we're in the horizontal section
    useEffect(() => {
        console.log('Setting up intersection observer');
        
        const observer = new IntersectionObserver(
            ([entry]) => {
                const isIntersecting = entry.isIntersecting;
                console.log('Intersection Change:', {
                    isIntersecting,
                    ratio: entry.intersectionRatio,
                    rect: entry.boundingClientRect,
                    rootBounds: entry.rootBounds
                });
                setIsInHorizontalSection(isIntersecting);
            },
            { 
                root: scrollContainerRef.current,  // Set the scroll container as root
                threshold: [0, 0.1, 0.5, 1],      // Simplified thresholds
                rootMargin: "0px"                 // No margin needed
            }
        );

        const targetElement = targetRef.current;
        if (targetElement) {
            console.log('Observing target element:', targetElement);
            observer.observe(targetElement);
        }

        return () => {
            if (targetElement) {
                console.log('Cleaning up observer');
                observer.unobserve(targetElement);
            }
            observer.disconnect();
        };
    }, []);

    // Log state changes
    useEffect(() => {
        console.log('Section State Changed:', {
            isInHorizontalSection,
            currentProgress
        });
    }, [isInHorizontalSection, currentProgress]);

    // Add immediate scroll progress updates
    useEffect(() => {
        const unsubscribe = scrollYProgress.on("change", (value) => {
            setCurrentProgress(value);
        });

        return () => unsubscribe();
    }, [scrollYProgress]);

    return (
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
                                        <p className='text-quantum-white/90 font-geist-mono text-sm md:text-base leading-relaxed flex items-center'>CORE FEATURES</p>
                                        <p className="text-quantum-white/70 font-geist-mono text-sm md:text-base leading-relaxed flex items-center">
                                            TIMESTREAM™ NAVIGATION SYSTEM<br />
                                            REALITY-GRADE QUANTUM STABILIZERS<br />
                                            NEURAL-SYNC TASTE PROFILE<br />
                                            INSTANT TIMELINE ACCESS
                                        </p>
                                    </div>
                                    <h2 className="col-span-8 row-start-6 row-span-3 text-quantum-white/90 font-geist-mono text-2xl md:text-4xl lg:text-5xl tracking-tight leading-tight  flex items-center justify-end">
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
                                    <div className="col-span-12 row-span-3 flex items-end">
                                        <p className="text-quantum-white/40 font-geist-mono text-xs md:text-sm leading-relaxed">
                                            QUANTUM ALGORITHMS • ERROR CORRECTION • QUANTUM SUPREMACY
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
                                    <div className="col-span-12 row-span-3 flex items-end">
                                        <p className="text-quantum-white/40 font-geist-mono text-xs md:text-sm leading-relaxed">
                                            QUANTUM ALGORITHMS • ERROR CORRECTION • QUANTUM SUPREMACY
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
    );
};

export default PageContent;
