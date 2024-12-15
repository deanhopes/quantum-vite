import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const PageContent = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const targetRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start start", "end start"]
    });

    // Calculate total width of panels (4 panels * 100vw)
    // We want to move left by (totalPanels - 1) * 100%
    const totalPanels = 4;
    const translateDistance = (totalPanels) * 100;

    // Transform from 0% to -(totalPanels-1)00%
    const containerX = useTransform(
        scrollYProgress,
        [0, 1],
        [`0%`, `-${translateDistance}%`]
    );

    return (
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
    );
};

export default PageContent;
