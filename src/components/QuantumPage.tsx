import {useRef, useEffect, useState} from "react"
import {Canvas} from "@react-three/fiber"
import {Suspense} from "react"
import gsap from "gsap"
import {ScrollTrigger} from "gsap/ScrollTrigger"
import SplitType from "split-type"
import {ScrollContext, ScrollContextType} from "./types/ScrollContext"
import {SceneContent} from "./3d/SceneContent"
import {InteractiveGrid} from "./ui/InteractiveGrid"
import {MagneticButton} from "./MagneticButton"
import StatsTicker from "./ui/StatsTicker"
import Footer from "./ui/Footer"
import Testimonials from "./ui/Testimonials"

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger)

interface QuantumPageProps {
    isLoading: boolean
}

const QuantumPage = ({isLoading}: QuantumPageProps) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const canvasContainerRef = useRef<HTMLDivElement>(null)
    const heroTextRef = useRef<HTMLHeadingElement>(null)
    const initiateBtnRef = useRef<HTMLDivElement>(null)
    const learnMoreBtnRef = useRef<HTMLDivElement>(null)
    const statsContainerRef = useRef<HTMLDivElement>(null)
    const statusBadgeRef = useRef<HTMLDivElement>(null)
    const [dimensions, setDimensions] = useState({width: 0, height: 0})
    const [scrollState, setScrollState] = useState<ScrollContextType>({
        scrollProgress: 0,
        isHorizontalSection: false,
    })
    const [isSceneReady, setIsSceneReady] = useState(false)

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

    // Scene ready handler
    const handleSceneReady = () => {
        setIsSceneReady(true)
    }

    useEffect(() => {
        // Reset scroll position on mount/refresh
        window.history.scrollRestoration = "manual"
        window.scrollTo(0, 0)
        document.body.style.overflow = "hidden"

        // Set initial opacity of parent container
        if (containerRef.current) {
            gsap.set(containerRef.current, {autoAlpha: 0})
        }

        return () => {
            document.body.style.overflow = ""
        }
    }, [])

    // Handle initial animations
    useEffect(() => {
        if (!isSceneReady || isLoading) return

        // Start animations after a short delay
        const startAnimations = () => {
            // Create main timeline
            const tl = gsap.timeline({
                defaults: {ease: "power3.out"},
            })

            // Set parent container to visible first
            if (containerRef.current) {
                tl.to(containerRef.current, {
                    autoAlpha: 1,
                    duration: 0.5,
                })
            }

            // Get references to elements
            const heroTitle = new SplitType(heroTextRef.current!, {
                types: "words,chars",
                tagName: "span",
            })

            // Set initial states
            gsap.set([heroTextRef.current, statusBadgeRef.current], {
                autoAlpha: 0,
            })
            gsap.set([initiateBtnRef.current, learnMoreBtnRef.current], {
                autoAlpha: 0,
            })

            // Animation sequence
            tl
                // Animate in status badge first
                .fromTo(
                    statusBadgeRef.current,
                    {
                        y: -20,
                        opacity: 0,
                    },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 0.8,
                        ease: "power2.out",
                    }
                )
                // Then animate in the title
                .fromTo(
                    heroTitle.chars,
                    {
                        y: 100,
                        opacity: 0,
                    },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 1,
                        stagger: 0.02,
                        onStart: function () {
                            gsap.set(heroTextRef.current, {autoAlpha: 1})
                        },
                    },
                    "-=0.4" // Overlap with previous animation
                )
                // Finally, animate in the buttons
                .fromTo(
                    [initiateBtnRef.current, learnMoreBtnRef.current],
                    {
                        scale: 0.9,
                        opacity: 0,
                        y: 20,
                    },
                    {
                        scale: 1,
                        opacity: 1,
                        y: 0,
                        duration: 0.8,
                        stagger: 0.1,
                        ease: "back.out(1.2)",
                        onStart: function () {
                            gsap.set(
                                [
                                    initiateBtnRef.current,
                                    learnMoreBtnRef.current,
                                ],
                                {autoAlpha: 1}
                            )
                        },
                    },
                    "-=0.4"
                )

            // Clean up split text
            return () => {
                heroTitle.revert()
            }
        }

        // Add a small delay before starting animations
        const timer = setTimeout(startAnimations, 100)
        return () => clearTimeout(timer)
    }, [isSceneReady, isLoading])

    // Handle scroll animations
    useEffect(() => {
        if (!isSceneReady || isLoading) return

        const horizontalSection = document.querySelector("#horizontalSection")
        if (!horizontalSection) return

        const panels = gsap.utils.toArray<HTMLElement>(".panel")
        const totalWidth = panels.length * window.innerWidth

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
                    })
                },
            },
        })

        // Animate panels
        horizontalScroll.to(".horizontal-scroll-content", {
            x: () => -(totalWidth - window.innerWidth),
            ease: "none",
        })

        // Set up scroll-triggered text animations for each panel separately
        panels.forEach((panel) => {
            // Only animate non-mono font text elements
            const textElements = panel.querySelectorAll(
                ".animate-text:not(.technical-readout)"
            )
            textElements.forEach((element) => {
                const splitText = new SplitType(element as HTMLElement, {
                    types: "words,chars",
                    tagName: "span",
                })

                gsap.fromTo(
                    splitText.chars,
                    {
                        y: 50,
                        opacity: 0,
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
                            toggleActions: "play none none none",
                        },
                    }
                )
            })
        })

        // Set up testimonial section animations separately
        const testimonialSection = document.querySelector(
            ".testimonial-section"
        )
        if (testimonialSection) {
            const testimonialTexts = testimonialSection.querySelectorAll(
                ".animate-text:not(.technical-readout)"
            )
            testimonialTexts.forEach((element) => {
                const splitText = new SplitType(element as HTMLElement, {
                    types: "words,chars",
                    tagName: "span",
                })

                gsap.fromTo(
                    splitText.chars,
                    {
                        y: 50,
                        opacity: 0,
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
                            toggleActions: "play none none none",
                        },
                    }
                )
            })
        }

        // Enable scrolling after loader and initial animations
        document.body.style.overflow = ""

        // Cleanup
        return () => {
            ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
            document.body.style.overflow = ""
        }
    }, [isSceneReady, isLoading])

    useEffect(() => {
        // Initialize Split Type for all buttons
        const buttons =
            document.querySelectorAll<HTMLElement>(".cta-button span")
        const splitInstances: SplitType[] = []
        const timelines: gsap.core.Timeline[] = []

        buttons.forEach((button) => {
            const instance = new SplitType(button, {
                types: "words,chars",
                tagName: "span",
            })
            splitInstances.push(instance)

            // Create hover animation timeline
            const tl = gsap.timeline({paused: true})
            const chars = button.querySelectorAll(".char")

            // Reset initial state
            gsap.set(chars, {
                opacity: 1,
                scale: 1,
                y: 0,
                rotateY: 0,
                transformOrigin: "center center",
            })

            // Build timeline
            tl.to(chars, {
                opacity: 0.7,
                scale: 0.95,
                y: 2,
                rotateY: -15,
                stagger: {
                    each: 0.015,
                    from: "start",
                },
                duration: 0.2,
                ease: "power2.in",
            }).to(chars, {
                opacity: 1,
                scale: 1,
                y: 0,
                rotateY: 0,
                stagger: {
                    each: 0.015,
                    from: "start",
                },
                duration: 0.2,
                ease: "power2.out",
            })

            // Subtle quantum flicker effect
            const glitchTl = gsap.timeline({paused: true, repeat: -1})
            glitchTl.to(chars, {
                opacity: "random(0.85, 1)",
                y: "random(-1, 1)",
                duration: 0.2,
                stagger: {
                    each: 0.02,
                    repeat: 1,
                    yoyo: true,
                    from: "random",
                },
            })

            timelines.push(tl, glitchTl)

            // Add event listeners
            const buttonParent = button.closest(".cta-button")
            if (buttonParent) {
                buttonParent.addEventListener("mouseenter", () => {
                    tl.restart()
                    glitchTl.restart().play()
                })

                buttonParent.addEventListener("mouseleave", () => {
                    glitchTl.pause()
                    gsap.to(chars, {
                        opacity: 1,
                        y: 0,
                        duration: 0.2,
                        ease: "power2.out",
                        overwrite: true,
                    })
                })
            }
        })

        // Cleanup function
        return () => {
            splitInstances.forEach((instance) => {
                instance.revert()
            })
            timelines.forEach((timeline) => {
                timeline.kill()
            })
        }
    }, []) // Run once on mount

    // Update the stats animation effect
    useEffect(() => {
        if (!statsContainerRef.current) return

        const statsContainer = statsContainerRef.current
        const firstItem = statsContainer.children[0] as HTMLElement
        const itemWidth = firstItem.offsetWidth

        // Create the infinite loop
        const loop = gsap.to(statsContainer, {
            x: -itemWidth,
            duration: 20,
            ease: "none",
            repeat: -1,
            modifiers: {
                x: gsap.utils.unitize(gsap.utils.wrap(-itemWidth, 0)),
            },
        })

        return () => {
            loop.kill()
        }
    }, [])

    return (
        <ScrollContext.Provider value={scrollState}>
            <div className='relative'>
                {/* Canvas Container */}
                <div
                    ref={canvasContainerRef}
                    className='fixed inset-0 w-full h-full overflow-hidden bg-black'
                >
                    {dimensions.width > 0 && (
                        <Canvas
                            shadows
                            camera={{position: [0, 1, 44], fov: 35}}
                            onCreated={(state) => {
                                console.log("Canvas created", state)
                                handleSceneReady()
                            }}
                            style={{
                                position: "absolute",
                                width: `${dimensions.width}px`,
                                height: `${dimensions.height}px`,
                            }}
                            gl={{
                                antialias: true,
                                powerPreference: "high-performance",
                                alpha: true,
                            }}
                        >
                            <Suspense fallback={null}>
                                <SceneContent />
                            </Suspense>
                        </Canvas>
                    )}
                </div>

                {/* Content Container - Remove opacity transition from here */}
                <div className='relative'>
                    {/* Main Content */}
                    <div
                        ref={containerRef}
                        className='relative w-full'
                    >
                        {/* Hero Section */}
                        <section className='relative h-[100vh] flex flex-col justify-between overflow-hidden'>
                            {/* Technical Grid Overlay */}

                            <div className='container mx-auto max-w-[90vw] h-full flex flex-col justify-between relative z-10 space-y-8'>
                                <div className='grid grid-cols-12 gap-8 h-full'>
                                    {/* Technical Header */}
                                    <div className='col-span-12 flex justify-between items-top'>
                                        <div className='flex items-center gap-4'>
                                            <div className='w-1.5 h-1.5 bg-white/20 rotate-45'></div>
                                            <div className='font-input text-[10px] text-white/40'>
                                                QUANTUM INTERFACE v2.0.38
                                            </div>
                                        </div>
                                        {/* Center Logo */}
                                        <div className='absolute left-1/2 mt-[3vh] -translate-x-1/2'>
                                            <img
                                                src='/src/assets/ctrlz-logo.svg'
                                                alt='CTRL-Z'
                                                className='w-24 opacity-80'
                                            />
                                        </div>
                                        <div className='flex items-center gap-8'>
                                            <div className='font-input text-[10px] text-white/40 flex items-center gap-2'>
                                                <span className='w-1 h-1 bg-green-500/60 rounded-full animate-pulse'></span>
                                                SYSTEM ACTIVE
                                            </div>
                                            <div className='font-input text-[10px] text-white/40'>
                                                ID:QS-749-X
                                            </div>
                                        </div>
                                    </div>

                                    {/* Main Content */}
                                    <div className='col-span-12 text-center mt-[15vh]'>
                                        {/* Status Badge */}
                                        <div
                                            ref={statusBadgeRef}
                                            className='status-badge inline-flex items-center gap-4 px-6 py-3 rounded-full bg-white/2 border border-white/10 backdrop-blur-sm'
                                        >
                                            <div className='w-1 h-1 bg-green-500/60 rounded-full animate-pulse'></div>
                                            <span className='font-input text-[10px] text-white/60'>
                                                REALITY MANIPULATION SYSTEM
                                                ONLINE
                                            </span>
                                        </div>

                                        {/* Main Title */}
                                        <h1
                                            ref={heroTextRef}
                                            className='font-[PPEditorialOld] text-white/95 text-[10vw] leading-[1.05] tracking-[-0.03em] mb-8 will-change-transform max-w-[80%] mx-auto'
                                        >
                                            One sip to access
                                            <br />
                                            <span className='relative inline-block'>
                                                <span className='animate-title-gradient bg-clip-text text-transparent bg-gradient-to-r from-white/95 via-white/40 to-white/95'>
                                                    infinite timelines.
                                                </span>
                                            </span>
                                        </h1>

                                        {/* CTA Buttons */}
                                        <div className='flex gap-8 justify-center mb-16'>
                                            <div ref={initiateBtnRef}>
                                                <MagneticButton
                                                    className='cta-button hover-highlight group relative px-8 py-4'
                                                    strength={0.5}
                                                    radius={100}
                                                >
                                                    <span className='relative z-10 text-white/90 text-[10px] tracking-wider'>
                                                        INITIATE SHIFT
                                                    </span>
                                                </MagneticButton>
                                            </div>
                                            <div ref={learnMoreBtnRef}>
                                                <MagneticButton
                                                    className='cta-button group relative px-8 py-4'
                                                    strength={0.5}
                                                    radius={100}
                                                >
                                                    <span className='relative z-10 text-white/40 text-[10px] tracking-wider'>
                                                        LEARN MORE
                                                    </span>
                                                </MagneticButton>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats Ticker - Now positioned at bottom */}
                                    <div className='col-span-12 mt-auto'>
                                        <StatsTicker />
                                    </div>
                                </div>
                            </div>

                            {/* Gradient Overlay */}
                            <div
                                className='absolute inset-0 z-[5] pointer-events-none'
                                style={{
                                    background:
                                        "linear-gradient(90deg, black 0%, transparent 15%, transparent 85%, black 100%), linear-gradient(180deg, black 0%, transparent 15%, transparent 85%, black 100%)",
                                }}
                            />
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
                                            <div className='border-l border-white/10 pl-16 max-w-[50vw]'>
                                                <div className='flex items-center gap-4 mb-8'>
                                                    <div className='w-2 h-2 bg-white/20 rotate-45'></div>
                                                    <p className='font-input text-white/40 text-[12px]'>
                                                        QUANTUM ANALYSIS
                                                    </p>
                                                    <div className='ml-auto text-[8px] font-input text-green-500/60'>
                                                        PROCESSING
                                                    </div>
                                                </div>
                                                <h2 className='animate-text text-white/95 font-[PPEditorialOld] text-[4.5vw] tracking-[-0.02em] leading-[1.1] mix-blend-difference mb-16'>
                                                    In this timeline, you're
                                                    reading this ad. <br />{" "}
                                                    <br /> In another, you've
                                                    already tried our drink.{" "}
                                                    <br /> <br /> In a third,
                                                    you invented it.
                                                </h2>
                                            </div>
                                        </div>

                                        {/* Bottom Content */}
                                        <div className='flex justify-end'>
                                            <div className=''>
                                                <div className='border-l border-white/10 pl-8'>
                                                    <div className='flex items-center gap-2 mb-4'>
                                                        <div className='w-1 h-1 bg-white/[40%] rotate-45'></div>
                                                        <p className='font-input text-white/40 text-[12px]'>
                                                            SYSTEM STATUS
                                                        </p>
                                                        <div className='ml-auto text-[8px] font-input text-green-500/60'>
                                                            ACTIVE
                                                        </div>
                                                    </div>
                                                    <div className='border border-white/5 bg-white/[0.01] p-8'>
                                                        <div className='grid grid-cols-3 gap-12'>
                                                            <div className='space-y-2'>
                                                                <div className='flex items-center gap-2'>
                                                                    <div className='w-1 h-1 bg-white/20 rotate-45'></div>
                                                                    <p className='font-input text-white/40 text-[12px]'>
                                                                        CPU LOAD
                                                                    </p>
                                                                </div>
                                                                <p className='font-input text-white/80 text-[18px]'>
                                                                    98.2%
                                                                </p>
                                                            </div>
                                                            <div className='space-y-2'>
                                                                <div className='flex items-center gap-2'>
                                                                    <div className='w-1 h-1 bg-white/20 rotate-45'></div>
                                                                    <p className='font-input text-white/40 text-[12px]'>
                                                                        MEMORY
                                                                    </p>
                                                                </div>
                                                                <p className='font-input text-white/80 text-[18px]'>
                                                                    64.7%
                                                                </p>
                                                            </div>
                                                            <div className='space-y-2'>
                                                                <div className='flex items-center gap-2'>
                                                                    <div className='w-1 h-1 bg-white/20 rotate-45'></div>
                                                                    <p className='font-input text-white/40 text-[12px]'>
                                                                        TEMP
                                                                    </p>
                                                                </div>
                                                                <p className='font-input text-white/80 text-[18px]'>
                                                                    42°C
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Panel Gradient */}
                                    <div
                                        className='absolute inset-0 z-[-5] pointer-events-none'
                                        style={{
                                            background:
                                                "linear-gradient(180deg, black 0%, transparent 15%, transparent 100%)",
                                        }}
                                    />
                                </div>

                                {/* Panel 2 */}
                                <div className='panel w-screen h-screen flex-shrink-0'>
                                    <div className='absolute inset-0 p-24 flex items-center'>
                                        <div className='grid grid-cols-2 gap-32 w-full'>
                                            {/* Left Content */}
                                            <div className='border-l border-white/10 pl-16'>
                                                <div className='flex items-center gap-4 mb-8'>
                                                    <div className='w-2 h-2 bg-white/20 rotate-45'></div>
                                                    <p className='font-input text-white/40 text-[12px]'>
                                                        SYSTEM ANALYSIS
                                                    </p>
                                                    <div className='ml-auto text-[8px] font-input text-green-500/60'>
                                                        VERIFIED
                                                    </div>
                                                </div>
                                                <h2 className='animate-text text-white/95 font-[PPEditorialOld] text-[3.5vw] tracking-[-0.02em] leading-[1.1] mb-16'>
                                                    The first quantum beverage
                                                    that exists in all states
                                                    until you take a sip.
                                                </h2>
                                                <div className='border border-white/[0.04] bg-white/[0.01] p-8'>
                                                    <p
                                                        className='font-sans font-light text-white'
                                                        style={{opacity: 0.6}}
                                                    >
                                                        Our quantum-infused
                                                        beverage opens doorways
                                                        to parallel timelines,
                                                        letting you find the
                                                        reality where you made
                                                        the right choice.
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Right Content - Technical Details */}
                                            <div className='space-y-8'>
                                                <div className='flex items-center gap-2 text-[8px] font-input text-white/40'>
                                                    <div>HASH: 0xB8E3</div>
                                                    <div className='ml-auto'>
                                                        REV: 2.0.1
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Panel Gradient */}
                                    <div
                                        className='absolute inset-0 z-[5] pointer-events-none'
                                        style={{
                                            background:
                                                "linear-gradient(180deg, black 0%, transparent 15%, transparent 100%)",
                                        }}
                                    />
                                </div>

                                {/* Panel 3 */}
                                <div className='panel w-screen h-screen flex-shrink-0'>
                                    <div className='absolute inset-0 p-24 flex items-center justify-center'>
                                        <div className='max-w-[80vw] text-center'>
                                            <div className='border-l border-white/10 pl-16 mb-16'>
                                                <div className='flex items-center gap-4 mb-8'>
                                                    <div className='w-2 h-2 bg-white/20 rotate-45'></div>
                                                    <p className='font-input text-white/40 text-[12px]'>
                                                        DIRECTIVE
                                                    </p>
                                                    <div className='ml-auto text-[8px] font-input text-white/40'>
                                                        ID:DR-001
                                                    </div>
                                                </div>
                                                <h2 className='animate-text text-white/95 font-[PPEditorialOld] text-[8vw] tracking-[-0.03em] leading-[1.1]'>
                                                    Choose your reality.
                                                    <br /> All of them are true.
                                                </h2>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Panel Gradient */}
                                    <div
                                        className='absolute inset-0 z-[5] pointer-events-none'
                                        style={{
                                            background:
                                                "linear-gradient(180deg, black 0%, transparent 15%, transparent 100%)",
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Grid Container - Scrolls with content */}
                            <div className='absolute top-0 left-0 h-screen horizontal-scroll-content'>
                                <div className='w-[400vw] h-full'>
                                    <InteractiveGrid />
                                </div>
                            </div>
                        </section>

                        <section>
                            {/* Testimonial Section */}
                            <Testimonials />
                        </section>

                        {/* Final CTA Section */}
                        <section className='relative min-h-[50vh] bg-black flex items-center justify-center overflow-hidden'>
                            {/* Technical Grid Background */}
                            <InteractiveGrid />

                            {/* Footer Content */}
                            <Footer />

                            {/* Background Gradient */}
                            <div className='absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-70 z-[1]'></div>
                        </section>
                    </div>
                </div>
            </div>
        </ScrollContext.Provider>
    )
}

export default QuantumPage
