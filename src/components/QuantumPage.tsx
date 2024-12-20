import React, {useRef, useEffect, useState, useContext} from "react"
import {Canvas, useFrame, extend, Object3DNode} from "@react-three/fiber"
import {Suspense} from "react"
import * as THREE from "three"
import gsap from "gsap"
import {ScrollTrigger} from "gsap/ScrollTrigger"
import {
    Float,
    SpotLight,
    ContactShadows,
    Environment,
    Preload,
    shaderMaterial,
    Stars,
    Cylinder,
} from "@react-three/drei"

// Import SplitType with proper type declarations
import SplitType from 'split-type'

// Extend SplitType types
type SplitTypeResult = {
    chars: HTMLElement[]
    words: HTMLElement[]
    lines: HTMLElement[]
    revert: () => void
}

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger)

// Define the material type
type PS1MaterialType = THREE.ShaderMaterial & {
    uniforms: {
        uTime: { value: number }
        uResolution: { value: THREE.Vector2 }
        uGlitchIntensity: { value: number }
        uScrollProgress: { value: number }
    }
}

// PS1 Style Material with proper uniform types
const PS1Material = shaderMaterial(
    // Uniforms
    {
        uTime: 0,
        uResolution: new THREE.Vector2(320, 240),
        uGlitchIntensity: 0.0,
        uScrollProgress: 0.0,
    },
    // Vertex shader with PS1-style vertex snapping
    `
        uniform float uTime;
        uniform float uGlitchIntensity;
        uniform float uScrollProgress;
        uniform vec2 uResolution;
        varying vec2 vUv;
        varying vec3 vPosition;
        varying vec3 vNormal;

        // PS1-style vertex snapping
        vec4 getPS1Snap(vec4 vertex) {
            vec4 snapped = vertex;
            snapped.xyz = vertex.xyz / vertex.w;
            // Adjust the quantization factor for more/less jitter
            snapped.xyz = floor(snapped.xyz * 32.0) / 32.0;
            snapped.xyz *= vertex.w;
            return snapped;
        }

        void main() {
            vUv = uv;
            vPosition = position;
            vNormal = normalize(normalMatrix * normal);

            // Apply glitch effect
            vec3 pos = position;
            float glitchOffset = sin(uTime * 10.0 + position.y * 20.0) * uGlitchIntensity;
            pos.x += glitchOffset * (1.0 + uScrollProgress);

            // Transform and snap vertices
            vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
            vec4 viewPosition = viewMatrix * modelPosition;
            vec4 ps1Position = getPS1Snap(viewPosition);
            
            gl_Position = projectionMatrix * ps1Position;
        }
    `,
    // Fragment shader with CRT and glitch effects
    `
        uniform float uTime;
        uniform vec2 uResolution;
        uniform float uGlitchIntensity;
        uniform float uScrollProgress;
        varying vec2 vUv;
        varying vec3 vPosition;
        varying vec3 vNormal;

        float random(vec2 st) {
            return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
        }

        float scanline(vec2 uv) {
            return sin(uv.y * 400.0) * 0.05;
        }

        void main() {
            vec2 uv = vUv;
            
            // Gentler CRT distortion
            vec2 crtUv = uv;
            float distortAmount = sin(uTime * 0.2) * 0.0005 + 0.0005;
            crtUv.x += sin(uv.y * 10.0 + uTime) * distortAmount;
            
            // Softer glitch effect
            float glitchNoise = random(vec2(floor(uTime * 5.0), floor(vUv.y * 5.0)));
            vec2 glitchOffset = vec2(
                glitchNoise * 0.01 * uGlitchIntensity * uScrollProgress,
                0.0
            );
            uv += glitchOffset;

            // Dreamy base color with PS1-style lighting
            vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
            float diff = max(dot(vNormal, lightDir), 0.0);
            
            // Create a more ethereal color palette
            vec3 baseColor = mix(
                vec3(0.2, 0.4, 0.8),
                vec3(0.8, 0.9, 1.0),
                0.5 + 0.5 * sin(vPosition.y * 0.5 + uTime * 0.2)
            );
            
            // Gentler color quantization
            vec3 color = floor(baseColor * diff * 16.0) / 16.0;

            // Subtle scanlines
            color += vec3(scanline(crtUv));

            // Softer vignette
            float vignette = length(vec2(0.5) - uv);
            color *= 1.0 - vignette * 0.3;

            // Very subtle color bleeding
            float bleed = sin(uTime) * 0.005;
            color.r += bleed;
            color.b -= bleed;

            // Gentle noise
            float noise = random(uv + uTime * 0.05) * 0.02;
            color += noise;

            gl_FragColor = vec4(color, 0.9);
        }
    `
)

// Extend Three.js with our custom material
extend({ PS1Material })

// Add proper type declarations
declare module '@react-three/fiber' {
    interface ThreeElements {
        pS1Material: Object3DNode<PS1MaterialType, typeof PS1Material>
    }
}

// Create a context for sharing scroll state
interface ScrollContextType {
    scrollProgress: number
    isHorizontalSection: boolean
}

const ScrollContext = React.createContext<ScrollContextType>({
    scrollProgress: 0,
    isHorizontalSection: false,
})

export const useScrollContext = () => useContext(ScrollContext)

function SpaceBackground() {
    const starsRef = useRef<THREE.Points>(null)
    
    useFrame((state) => {
        if (starsRef.current) {
            starsRef.current.rotation.y += 0.0001
            starsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1
        }
    })

    return (
        <group>
            <Stars 
                ref={starsRef}
                radius={50}
                depth={50}
                count={5000}
                factor={4}
                saturation={0}
                fade
                speed={1}
            />
        </group>
    )
}

function QuantumGroup() {
    const groupRef = useRef<THREE.Group>(null)
    const canRef = useRef<THREE.Mesh>(null)
    const [isReady, setIsReady] = useState(false)
    const {scrollProgress, isHorizontalSection} = useScrollContext()
    const materialRef = useRef<PS1MaterialType>(null)
    const sphereRef = useRef<THREE.Group>(null)
    const [sphereVisible, setSphereVisible] = useState(false)
    const [sphereAnimation, setSphereAnimation] = useState({
        startY: -8,
        targetY: -4,
        progress: 0,
    })

    // Initial animation timeline
    useEffect(() => {
        if (!canRef.current || !groupRef.current) return

        const tl = gsap.timeline()
        tl.to(groupRef.current.position, {
            y: 0,
            duration: 1.5,
            ease: "power2.out",
        })
        tl.to(
            canRef.current.scale,
            {
                x: 1,
                y: 1,
                z: 1,
                duration: 1.2,
                ease: "back.out(1.7)",
            },
            "-=1.2"
        )

        setIsReady(true)

        return () => {
            tl.kill()
        }
    }, [])

    useFrame((state) => {
        if (!groupRef.current || !canRef.current || !isReady) return

        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
            materialRef.current.uniforms.uGlitchIntensity.value = 
                Math.max(0, Math.sin(state.clock.elapsedTime * 2)) * 0.2 +
                (scrollProgress > 0.1 ? scrollProgress * 0.3 : 0)
            materialRef.current.uniforms.uScrollProgress.value = scrollProgress
        }

        // Enhanced can animations based on scroll progress
        if (isHorizontalSection) {
            // First panel: Can floats up and rotates
            if (scrollProgress < 0.33) {
                const progress = scrollProgress / 0.33
                canRef.current.position.y = THREE.MathUtils.lerp(-0.8, 0, progress)
                canRef.current.rotation.y = THREE.MathUtils.lerp(0, Math.PI * 2, progress)
            }
            // Second panel: Can splits into multiple versions
            else if (scrollProgress < 0.66) {
                const progress = (scrollProgress - 0.33) / 0.33
                groupRef.current.position.x = THREE.MathUtils.lerp(0, -0.5, progress)
                canRef.current.rotation.z = THREE.MathUtils.lerp(0, Math.PI * 0.1, progress)
            }
            // Third panel: Can transforms into sphere
            else {
                const progress = (scrollProgress - 0.66) / 0.34
                if (progress > 0.8 && !sphereVisible) {
                    setSphereVisible(true)
                }
                if (sphereVisible) {
                    canRef.current.scale.setScalar(1 - progress)
                }
            }
        }

        // Animate sphere when visible
        if (sphereVisible && sphereRef.current) {
            setSphereAnimation((prev) => ({
                ...prev,
                progress: Math.min(prev.progress + 0.003, 1),
            }))

            const eased = 1 - Math.pow(1 - sphereAnimation.progress, 3)
            sphereRef.current.position.y = THREE.MathUtils.lerp(
                sphereAnimation.startY,
                sphereAnimation.targetY,
                eased
            )
            sphereRef.current.rotation.y += 0.01
        }
    })

    return (
        <group ref={groupRef} position={[0, -2, 0]}>
            <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3} floatingRange={[-0.05, 0.05]}>
                <Cylinder 
                    ref={canRef}
                    args={[0.3, 0.3, 1.2, 32]}
                    scale={[0, 0, 0]}
                    castShadow
                    receiveShadow
                >
                    <pS1Material 
                        ref={materialRef} 
                        transparent={true}
                        depthWrite={true}
                        side={THREE.DoubleSide}
                    />
                </Cylinder>
            </Float>

            <group ref={sphereRef} position={[0, sphereAnimation.startY, 0]} visible={sphereVisible}>
                <mesh scale={3}>
                    <sphereGeometry args={[1, 32, 32]} />
                    <pS1Material 
                        ref={materialRef}
                        transparent={true}
                        depthWrite={false}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            </group>
        </group>
    )
}

// Update SceneContent to include space background
function SceneContent() {
    const {scrollProgress, isHorizontalSection} = useScrollContext()

    useFrame(({camera}) => {
        if (!isHorizontalSection) return

        const radius = 4
        const cameraHeight = 1.5
        const rotationAngle = THREE.MathUtils.lerp(0, Math.PI / 2, scrollProgress)
        const newX = radius * Math.sin(rotationAngle)
        const newZ = radius * Math.cos(rotationAngle)

        camera.position.x = newX
        camera.position.y = cameraHeight
        camera.position.z = newZ

        const lookAtPoint = new THREE.Vector3(0, -0.5, 0)
        camera.lookAt(lookAtPoint)
        camera.updateProjectionMatrix()
    })

    return (
        <>
            <SpaceBackground />
            <Environment preset='night' />
            <ambientLight intensity={0.2} />
            <SpotLight
                position={[5, 5, 2]}
                angle={0.4}
                penumbra={0.8}
                intensity={0.7}
                distance={6}
                castShadow
                shadow-bias={-0.0001}
                shadow-mapSize={[2048, 2048]}
                color='#b1e1ff'
            />
            <SpotLight
                position={[-5, 3, 2]}
                angle={0.5}
                penumbra={1}
                intensity={0.3}
                distance={6}
                color='#4499ff'
            />
            <ContactShadows
                position={[0, -0.49, 0]}
                opacity={0.3}
                scale={20}
                blur={2}
                far={4}
                resolution={512}
                color='#000000'
            />
            <QuantumGroup />
            <Preload all />
        </>
    )
}

const QuantumPage = () => {
    const containerRef = useRef<HTMLDivElement>(null)
    const canvasContainerRef = useRef<HTMLDivElement>(null)
    const heroTextRef = useRef<HTMLHeadingElement>(null)
    const subTextRef = useRef<HTMLHeadingElement>(null)
    const [dimensions, setDimensions] = useState({width: 0, height: 0})
    const [scrollState, setScrollState] = useState<ScrollContextType>({
        scrollProgress: 0,
        isHorizontalSection: false,
    })

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

    // Update the text animation setup
    useEffect(() => {
        if (!heroTextRef.current || !subTextRef.current) return

        // Helper function to preserve whitespace and line breaks
        const preserveWhitespace = (element: HTMLElement) => {
            const html = element.innerHTML
            const preservedHtml = html.replace(/<br\s*\/?>/gi, '§')
            element.innerHTML = preservedHtml

            const textNodes = Array.from(element.childNodes).filter(node => 
                node.nodeType === Node.TEXT_NODE && node.textContent?.trim()
            )
            
            textNodes.forEach(node => {
                const span = document.createElement('span')
                span.style.whiteSpace = 'pre-wrap'
                const text = node.textContent?.replace(/§/g, '<br>') || ''
                span.innerHTML = text
                node.parentNode?.replaceChild(span, node)
            })
        }

        // Apply whitespace preservation
        preserveWhitespace(heroTextRef.current)
        preserveWhitespace(subTextRef.current)

        // Split hero text
        const heroText = new SplitType(heroTextRef.current, {
            types: 'chars,words,lines',
            tagName: 'span',
        }) as SplitTypeResult

        // Split subtitle
        const subText = new SplitType(subTextRef.current, {
            types: 'words',
            tagName: 'span',
        }) as SplitTypeResult

        // Hero text animation
        const tl = gsap.timeline()
        
        // Set initial states
        gsap.set(heroText.chars, { opacity: 0, y: 100, rotationX: 180 })
        gsap.set(subText.words, { opacity: 0, y: 20 })
        
        // Animate hero text
        tl.to(heroText.chars, {
            duration: 1.5,
            opacity: 1,
            y: 0,
            rotationX: 0,
            stagger: {
                amount: 1,
                from: "random"
            },
            ease: "back.out(1.7)",
        })

        // Animate subtitle
        tl.to(subText.words, {
            duration: 1,
            opacity: 1,
            y: 0,
            stagger: {
                amount: 0.5,
                from: "start"
            },
            ease: "power4.out",
        }, "-=1")

        // Cleanup
        return () => {
            tl.kill()
            heroText.revert()
            subText.revert()
        }
    }, [])

    // Update the horizontal scroll animation setup
    useEffect(() => {
        const horizontalSection = document.querySelector("#horizontalSection") as HTMLElement
        const panels = gsap.utils.toArray<HTMLElement>(".panel")
        const panelTexts = document.querySelectorAll<HTMLElement>('.panel-text')
        const featureBlocks = document.querySelectorAll<HTMLElement>('.feature-block')
        const specItems = document.querySelectorAll<HTMLElement>('.spec-item')

        // Set initial states
        gsap.set(panelTexts, { opacity: 0, y: 50 })

        // Create main horizontal scroll animation
        const horizontalScroll = gsap.timeline({
            scrollTrigger: {
                trigger: "#horizontalSection",
                start: "top top",
                end: () => `+=${(panels.length - 1) * window.innerWidth}`,
                pin: true,
                scrub: 1,
                snap: 1 / (panels.length - 1),
                invalidateOnRefresh: true,
                anticipatePin: 1,
                onUpdate: (self) => {
                    setScrollState({
                        scrollProgress: self.progress,
                        isHorizontalSection: self.isActive,
                    })
                },
            }
        })

        // Animate panels horizontally
        horizontalScroll.to(panels, {
            xPercent: -100 * (panels.length - 1),
            ease: "none",
        })

        // Animate panel texts
        panelTexts.forEach((text) => {
            gsap.to(text, {
                scrollTrigger: {
                    trigger: text,
                    start: "left center",
                    end: "right center",
                    containerAnimation: horizontalScroll,
                    toggleActions: "play none none reverse",
                    onEnter: () => text.classList.add('is-visible'),
                    onLeave: () => text.classList.remove('is-visible'),
                    onEnterBack: () => text.classList.add('is-visible'),
                    onLeaveBack: () => text.classList.remove('is-visible'),
                },
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: "power3.out",
            })
        })

        // Setup feature block hover animations
        featureBlocks.forEach(block => {
            const title = block.querySelector('h3')
            const content = block.querySelector('p')

            // Create hover animation
            const hoverTl = gsap.timeline({ paused: true })
                .to(title, {
                    x: 10,
                    duration: 0.3,
                    ease: "power2.out"
                })
                .to(content, {
                    opacity: 0.9,
                    duration: 0.3
                }, 0)

            // Add event listeners
            block.addEventListener('mouseenter', () => hoverTl.play())
            block.addEventListener('mouseleave', () => hoverTl.reverse())
        })

        // Setup spec items hover animations
        specItems.forEach(item => {
            const label = item.querySelector('p:first-child')
            const value = item.querySelector('p:last-child')

            // Create hover animation
            const hoverTl = gsap.timeline({ paused: true })
                .to(label, {
                    opacity: 0.8,
                    duration: 0.3
                })
                .to(value, {
                    x: 10,
                    duration: 0.3,
                    ease: "power2.out"
                }, 0)

            // Add event listeners
            item.addEventListener('mouseenter', () => hoverTl.play())
            item.addEventListener('mouseleave', () => hoverTl.reverse())
        })

        return () => {
            horizontalScroll.kill()
        }
    }, [])

    return (
        <ScrollContext.Provider value={scrollState}>
            <div
                ref={canvasContainerRef}
                className="fixed inset-0 w-full h-full overflow-hidden bg-gradient-to-b from-black via-purple-900/20 to-black"
            >
                {dimensions.width > 0 && (
                    <Canvas
                        shadows
                        camera={{position: [0, 1, 4], fov: 35}}
                        style={{
                            position: "absolute",
                            width: `${dimensions.width}px`,
                            height: `${dimensions.height}px`,
                            imageRendering: "pixelated", // PS1-style pixelation
                        }}
                        gl={{
                            antialias: false, // Disable antialiasing for PS1 look
                            powerPreference: "high-performance",
                            alpha: true,
                        }}
                    >
                        <color
                            attach='background'
                            args={["#000000"]}
                        />
                        <fog
                            attach='fog'
                            args={["#000000", 5, 15]}
                        /> {/* Reduced fog distance for PS1 feel */}
                        <Suspense fallback={null}>
                            <SceneContent />
                        </Suspense>
                    </Canvas>
                )}
            </div>

            <div ref={containerRef} className="relative w-full">
                {/* Hero Section */}
                <section className="h-screen flex flex-col items-center justify-start pt-24 relative overflow-hidden">
                    <div className="glitch-container relative">
                        <h1
                            ref={heroTextRef}
                            className="text-white font-editorial text-[4.5vw] text-center max-w-[60vw] leading-tight tracking-tight mix-blend-difference"
                        >
                            For those moments when you need a different version of now.
                        </h1>
                    </div>
                    <h2
                        ref={subTextRef}
                        className="text-white/80 font-mono text-2xl mt-8 tracking-widest glitch-text"
                    >
                        CTRL-Z: Reality's Undo Button
                    </h2>
                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center space-y-4">
                        <span className="text-white/40 font-mono text-sm tracking-wider">Scroll to explore</span>
                        <div className="w-6 h-10 border-2 border-white/20 rounded-full flex items-start p-1">
                            <div className="w-1 h-2 bg-white/40 rounded-full animate-scroll-hint mx-auto" />
                        </div>
                    </div>
                </section>

                {/* Horizontal Scroll Section */}
                <section id="horizontalSection" className="horizontal-scroll">
                    <div className="horizontal-scroll-content">
                        {/* Panel 1 - Impact Statement */}
                        <div className="panel p-16 grid grid-rows-6 grid-cols-12 gap-8">
                            <div className="col-span-8 col-start-2 row-start-2 row-span-4 grid grid-rows-[auto_1fr] gap-16">
                                <h2 className="panel-text text-white/95 font-editorial text-[12vw] tracking-[-0.04em] leading-[0.85] max-w-[12ch] mix-blend-difference fade-up">
                                    You've been there. That moment when everything goes sideways.
                                </h2>
                                <div className="self-end">
                                    <p className="text-white/60 font-mono text-sm tracking-[0.2em] uppercase mb-4">Scroll to continue</p>
                                    <div className="w-16 h-[1px] bg-white/20"></div>
                                </div>
                            </div>
                        </div>

                        {/* Panel 2 - Features Grid */}
                        <div className="panel p-16 grid grid-rows-6 grid-cols-12 gap-8">
                            <div className="col-span-10 col-start-2 row-span-full grid grid-cols-2 gap-x-32 content-center">
                                <div className="space-y-32">
                                    <div className="panel-text feature-block group">
                                        <p className="text-white/40 font-mono text-sm tracking-[0.2em] uppercase mb-6 group-hover:text-white/60 transition-colors">
                                            Core Technology
                                        </p>
                                        <h3 className="text-white/95 font-editorial text-[4vw] leading-[0.9] mb-8 transform group-hover:translate-x-2 transition-transform">
                                            TIMESTREAM™<br />NAVIGATION
                                        </h3>
                                        <p className="text-white/70 font-mono text-base leading-relaxed max-w-[40ch] group-hover:text-white/90 transition-opacity">
                                            Proprietary quantum tunneling allows seamless timeline transitions with zero temporal artifacts.
                                        </p>
                                    </div>
                                    <div className="panel-text feature-block group">
                                        <h3 className="text-white/95 font-editorial text-[4vw] leading-[0.9] mb-8 transition-transform duration-500 group-hover:translate-x-2">
                                            NEURAL-SYNC<br />INTERFACE
                                        </h3>
                                        <p className="text-white/70 font-mono text-base leading-relaxed max-w-[40ch] transition-opacity duration-300 group-hover:text-white/90">
                                            Memory preservation across realities, ensuring cognitive continuity.
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-32 mt-48">
                                    <div className="panel-text feature-block group">
                                        <h3 className="text-white/95 font-editorial text-[4vw] leading-[0.9] mb-8 transition-transform duration-500 group-hover:translate-x-2">
                                            QUANTUM<br />STABILIZERS
                                        </h3>
                                        <p className="text-white/70 font-mono text-base leading-relaxed max-w-[40ch] transition-opacity duration-300 group-hover:text-white/90">
                                            Reality-grade containment field prevents unwanted timeline bleed.
                                        </p>
                                    </div>
                                    <div className="panel-text feature-block group">
                                        <h3 className="text-white/95 font-editorial text-[4vw] leading-[0.9] mb-8 transition-transform duration-500 group-hover:translate-x-2">
                                            INSTANT<br />ACCESS
                                        </h3>
                                        <p className="text-white/70 font-mono text-base leading-relaxed max-w-[40ch] transition-opacity duration-300 group-hover:text-white/90">
                                            Zero latency between decision and implementation.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Panel 3 - Technical Details */}
                        <div className="panel p-16 grid grid-rows-6 grid-cols-12 gap-8">
                            <div className="col-span-10 col-start-2 row-span-full grid grid-cols-[1fr_auto] items-center gap-32">
                                <div className="panel-text max-w-[24ch] fade-up">
                                    <h2 className="text-white/95 font-editorial text-[10vw] tracking-[-0.03em] leading-[0.85] mb-16">
                                        Until now, you lived with it.
                                    </h2>
                                    <p className="text-white/70 font-mono text-lg leading-relaxed">
                                        Every decision point creates infinite branches. We just help you find the right one.
                                    </p>
                                </div>
                                <div className="panel-text w-[360px] border-l border-white/10 pl-16 tech-specs">
                                    <p className="text-white/40 font-mono text-sm tracking-[0.2em] uppercase mb-12">
                                        Technical Specifications
                                    </p>
                                    <div className="space-y-12">
                                        <div className="spec-item group">
                                            <p className="text-white/40 font-mono text-xs tracking-[0.15em] uppercase mb-2 transition-colors duration-300 group-hover:text-white/60">MODEL</p>
                                            <p className="text-white/90 font-mono text-xl transition-transform duration-500 group-hover:translate-x-2">QUANTUM CORE RT-749</p>
                                        </div>
                                        <div className="spec-item group">
                                            <p className="text-white/40 font-mono text-xs tracking-[0.15em] uppercase mb-2 transition-colors duration-300 group-hover:text-white/60">SERIES</p>
                                            <p className="text-white/90 font-mono text-xl transition-transform duration-500 group-hover:translate-x-2">SHIFT-X</p>
                                        </div>
                                        <div className="spec-item group">
                                            <p className="text-white/40 font-mono text-xs tracking-[0.15em] uppercase mb-2 transition-colors duration-300 group-hover:text-white/60">ESTABLISHED</p>
                                            <p className="text-white/90 font-mono text-xl transition-transform duration-500 group-hover:translate-x-2">2038</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Panel 4 - Call to Action */}
                        <div className="panel p-16 grid grid-rows-6 grid-cols-12 gap-8">
                            <div className="col-span-full row-span-full flex flex-col items-center justify-center text-center">
                                <p className="panel-text text-white/40 font-mono text-base tracking-[0.5em] uppercase mb-8 fade-up">
                                    Introducing
                                </p>
                                <h2 className="panel-text text-white/95 font-editorial text-[10vw] tracking-[-0.03em] leading-[0.9] mb-12 fade-up">
                                    Now you can fix it.
                                </h2>
                                <div className="panel-text mt-12 flex items-center gap-8 fade-up">
                                    <div className="w-12 h-[1px] bg-white/20"></div>
                                    <p className="text-white/60 font-mono text-sm tracking-[0.2em] uppercase">Continue to experience</p>
                                    <div className="w-12 h-[1px] bg-white/20"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Testimonial Section */}
                <section className="min-h-screen bg-black/90 flex items-center justify-center py-24">
                    <div className="container mx-auto grid grid-cols-12 gap-8 px-8">
                        <div className="col-span-6">
                            <h2 className="text-white font-editorial text-6xl leading-tight mb-16">
                                When we first announced<br />
                                a beverage that could alter<br />
                                reality, they called us mad.<br />
                                <br />
                                88 billion successful<br />
                                reality shifts later, they<br />
                                call us the future.
                            </h2>
                        </div>
                        <div className="col-span-5 col-start-8 space-y-12">
                            <div className="space-y-6">
                                <div className="flex">
                                    {Array.from({length: 5}, (_, index) => (
                                        <span key={index} className="text-white text-xl">★</span>
                                    ))}
                                </div>
                                <p className="text-white/90 font-mono text-lg leading-relaxed">
                                    "Yesterday, I made the worst presentation of my career. Or I would have, 
                                    if ctrl-z hadn't helped me find the timeline where I remembered to actually 
                                    save my slides. The look on my alternate self's face was priceless."
                                </p>
                            </div>
                            <div className="space-y-6">
                                <div className="flex">
                                    {Array.from({length: 5}, (_, index) => (
                                        <span key={index} className="text-white text-xl">★</span>
                                    ))}
                                </div>
                                <p className="text-white/90 font-mono text-lg leading-relaxed">
                                    "Used to spend hours overthinking my decisions. Now I just ctrl-z through 
                                    a few realities until I find the one that clicks. Though I should mention - 
                                    don't try it during a job interview."
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Final CTA Section */}
                <section className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
                    <div className="text-center px-4 relative z-10">
                        <h2 className="text-white/90 font-editorial text-7xl mb-8">
                            BEGIN YOUR QUANTUM JOURNEY
                        </h2>
                        <p className="text-white/70 text-xl font-mono max-w-2xl mx-auto mb-12">
                            Step into a future where every possibility is within reach.
                        </p>
                        <div className="space-x-6">
                            <button className="px-8 py-4 text-white/90 font-mono text-lg border border-white/20 rounded-sm hover:bg-white/10 transition-all duration-300">
                                EXPLORE NOW
                            </button>
                            <button className="px-8 py-4 text-white/90 font-mono text-lg border border-white/20 rounded-sm hover:bg-white/10 transition-all duration-300">
                                LEARN MORE
                            </button>
                        </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-purple-900/20 to-black opacity-50"></div>
                </section>

                {/* Add this CSS to your global styles or a CSS module */}
                <style dangerouslySetInnerHTML={{
                    __html: `
                        @keyframes glitch {
                            0% {
                                transform: translate(0);
                            }
                            20% {
                                transform: translate(-2px, 2px);
                            }
                            40% {
                                transform: translate(-2px, -2px);
                            }
                            60% {
                                transform: translate(2px, 2px);
                            }
                            80% {
                                transform: translate(2px, -2px);
                            }
                            100% {
                                transform: translate(0);
                            }
                        }

                        .glitch-text {
                            position: relative;
                            animation: glitch 5s infinite;
                        }

                        .glitch-text::before,
                        .glitch-text::after {
                            content: attr(data-text);
                            position: absolute;
                            top: 0;
                            left: 0;
                            width: 100%;
                            height: 100%;
                        }

                        .glitch-text::before {
                            left: 2px;
                            text-shadow: -2px 0 #ff00ff;
                            clip: rect(44px, 450px, 56px, 0);
                            animation: glitch-anim 5s infinite linear alternate-reverse;
                        }

                        .glitch-text::after {
                            left: -2px;
                            text-shadow: -2px 0 #00ffff;
                            clip: rect(44px, 450px, 56px, 0);
                            animation: glitch-anim 5s infinite linear alternate-reverse;
                        }

                        @keyframes scroll-hint {
                            0%, 100% { transform: translateY(0); }
                            50% { transform: translateY(5px); }
                        }

                        .animate-scroll-hint {
                            animation: scroll-hint 2s infinite;
                        }

                        .feature-item {
                            transition: all 0.3s ease;
                        }

                        .feature-item:hover {
                            transform: translateX(10px);
                            text-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
                        }

                        @keyframes glitch-anim {
                            0% {
                                clip: rect(44px, 450px, 56px, 0);
                            }
                            20% {
                                clip: rect(12px, 450px, 92px, 0);
                            }
                            40% {
                                clip: rect(76px, 450px, 24px, 0);
                            }
                            60% {
                                clip: rect(33px, 450px, 77px, 0);
                            }
                            80% {
                                clip: rect(89px, 450px, 11px, 0);
                            }
                            100% {
                                clip: rect(21px, 450px, 88px, 0);
                            }
                        }

                        /* Update Swiss typography styles */
                        .panel-text {
                            transform: translateY(20px);
                            will-change: transform, opacity;
                        }

                        .panel {
                            position: relative;
                        }

                        .panel::after {
                            content: '';
                            position: absolute;
                            top: 16px;
                            right: 16px;
                            bottom: 16px;
                            left: 16px;
                            border: 1px solid rgba(255, 255, 255, 0.03);
                            pointer-events: none;
                        }

                        /* Add debug styles to help visualize text */
                        .word {
                            opacity: 1 !important; /* Ensure words are visible */
                            color: inherit;
                            display: inline-block;
                        }

                        /* Enhanced typography styles */
                        .feature-block {
                            position: relative;
                            padding: 2rem;
                            transition: all 0.5s ease;
                        }

                        .feature-block::before {
                            content: '';
                            position: absolute;
                            inset: 0;
                            border: 1px solid rgba(255, 255, 255, 0.05);
                            opacity: 0;
                            transition: all 0.5s ease;
                        }

                        .feature-block:hover::before {
                            opacity: 1;
                            transform: scale(1.05);
                        }

                        .tech-specs {
                            position: relative;
                            overflow: hidden;
                        }

                        .tech-specs::before {
                            content: '';
                            position: absolute;
                            top: 0;
                            left: 0;
                            width: 1px;
                            height: 100%;
                            background: linear-gradient(
                                to bottom,
                                transparent,
                                rgba(255, 255, 255, 0.1),
                                transparent
                            );
                            animation: scanline 4s ease-in-out infinite;
                        }

                        @keyframes scanline {
                            0% { transform: translateY(-100%); }
                            100% { transform: translateY(100%); }
                        }

                        .spec-item {
                            position: relative;
                            padding: 1rem;
                            transition: all 0.3s ease;
                        }

                        .spec-item::after {
                            content: '';
                            position: absolute;
                            left: -1rem;
                            top: 50%;
                            width: 0.5rem;
                            height: 1px;
                            background: rgba(255, 255, 255, 0.2);
                            transform: scaleX(0);
                            transform-origin: left;
                            transition: transform 0.3s ease;
                        }

                        .spec-item:hover::after {
                            transform: scaleX(1);
                        }

                        /* Improved animation styles */
                        .panel-text {
                            opacity: 0;
                            transform: translateY(30px);
                            transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
                        }

                        .panel-text.is-visible {
                            opacity: 1;
                            transform: translateY(0);
                        }

                        .word {
                            display: inline-block;
                            opacity: 0;
                            transform: translateY(20px);
                            transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
                        }

                        .word.is-visible {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    `
                }} />
            </div>
        </ScrollContext.Provider>
    )
}

export default QuantumPage
