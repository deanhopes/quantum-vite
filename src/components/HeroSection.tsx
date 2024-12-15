import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface HeroSectionProps {
    title?: string;
    scrollTexts?: string[];
}

const DEFAULT_SCROLL_TEXTS = [
    "QUANTUM COMPUTING • NEXT GENERATION TECHNOLOGY",
    "SUPERPOSITION • ENTANGLEMENT • QUANTUM SUPREMACY",
    "EXPLORING THE QUANTUM REALM • BEYOND CLASSICAL LIMITS"
];

export function HeroSection({
    title = "QUANTUM FUTURE",
    scrollTexts = DEFAULT_SCROLL_TEXTS
}: HeroSectionProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const textRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        if (!containerRef.current || !scrollContainerRef.current) return;

        // Hero title animation
        gsap.from('.hero-title', {
            y: 100,
            opacity: 0,
            duration: 1.5,
            ease: 'power4.out',
        });

        // Horizontal scroll animation
        const scrollTween = gsap.to(scrollContainerRef.current, {
            x: '-200vw', // Move left by 200vw (300vw total width - 100vw viewport)
            ease: 'none',
            scrollTrigger: {
                trigger: scrollContainerRef.current,
                start: 'top top',
                end: '+=300%', // Scroll duration is 3x the viewport height
                pin: true,
                scrub: 1,
            },
        });

        // Animate scroll texts
        textRefs.current.forEach((textRef, index) => {
            if (!textRef) return;

            gsap.to(textRef, {
                opacity: 1,
                y: 0,
                duration: 1,
                delay: index * 0.2,
                scrollTrigger: {
                    trigger: textRef,
                    start: 'top center',
                    toggleActions: 'play none none reverse',
                },
            });
        });

        return () => {
            scrollTween.kill();
        };
    }, []);

    return (
        <div ref={containerRef} className="relative">
            {/* Hero Section */}
            <section className="relative h-screen flex items-center justify-center bg-quantum-black overflow-hidden">
                <div className="relative z-10 text-center">
                    <h1 className="hero-title text-quantum-white font-geist-mono text-7xl md:text-8xl lg:text-9xl 
                        tracking-tighter mb-8 transform transition-transform duration-700 hover:scale-105">
                        {title}
                    </h1>
                    <div className="w-16 h-16 mx-auto mt-12 animate-bounce opacity-50">
                        <svg
                            className="w-full h-full text-quantum-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 14l-7 7m0 0l-7-7m7 7V3"
                            />
                        </svg>
                    </div>
                </div>

                {/* Hero Background Effect */}
                <div className="absolute inset-0 bg-gradient-to-b from-quantum-black/50 to-quantum-black" />
            </section>

            {/* Horizontal Scroll Section */}
            <section className="relative h-screen overflow-hidden bg-quantum-black">
                <div
                    ref={scrollContainerRef}
                    className="absolute top-0 left-0 h-full w-[300vw] flex items-center"
                >
                    {scrollTexts.map((text, index) => (
                        <div
                            key={index}
                            ref={el => textRefs.current[index] = el}
                            className="w-screen h-screen flex items-center justify-center px-8"
                        >
                            <div className="relative">
                                <h2 className="text-quantum-white/80 font-geist-mono text-4xl md:text-6xl lg:text-7xl
                                    tracking-tight transform transition-all duration-700 hover:scale-105
                                    opacity-0 translate-y-8"
                                >
                                    {text}
                                </h2>
                                <div className="absolute -bottom-4 left-0 w-full h-px bg-gradient-to-r 
                                    from-transparent via-quantum-white/20 to-transparent"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer Section */}
            <footer className="relative h-screen bg-quantum-black flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-quantum-white/90 font-geist-mono text-5xl md:text-6xl mb-8
                        tracking-tighter transform transition-all duration-700 hover:scale-105">
                        EXPLORE THE QUANTUM REALM
                    </h2>
                    <p className="text-quantum-white/50 font-geist-mono text-lg md:text-xl
                        max-w-2xl mx-auto px-6">
                        Journey into the future of computing, where classical limits dissolve
                        and new possibilities emerge from the quantum fabric of reality.
                    </p>
                    <div className="mt-12 space-x-6">
                        <button className="px-8 py-3 bg-quantum-white/10 text-quantum-white/90
                            font-geist-mono rounded-sm hover:bg-quantum-white/20 transition-all
                            duration-300 backdrop-blur-sm">
                            LEARN MORE
                        </button>
                        <button className="px-8 py-3 bg-quantum-white/5 text-quantum-white/90
                            font-geist-mono rounded-sm hover:bg-quantum-white/10 transition-all
                            duration-300 backdrop-blur-sm">
                            CONTACT
                        </button>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r 
                    from-transparent via-quantum-white/20 to-transparent" />
            </footer>
        </div>
    );
} 