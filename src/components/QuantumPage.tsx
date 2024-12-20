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
import SplitType from "split-type"

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
        uTime: {value: number}
        uResolution: {value: THREE.Vector2}
        uGlitchIntensity: {value: number}
        uScrollProgress: {value: number}
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
extend({PS1Material})

// Add proper type declarations
declare module "@react-three/fiber" {
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
            starsRef.current.rotation.x =
                Math.sin(state.clock.elapsedTime * 0.1) * 0.1
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
                canRef.current.position.y = THREE.MathUtils.lerp(
                    -0.8,
                    0,
                    progress
                )
                canRef.current.rotation.y = THREE.MathUtils.lerp(
                    0,
                    Math.PI * 2,
                    progress
                )
            }
            // Second panel: Can splits into multiple versions
            else if (scrollProgress < 0.66) {
                const progress = (scrollProgress - 0.33) / 0.33
                groupRef.current.position.x = THREE.MathUtils.lerp(
                    0,
                    -0.5,
                    progress
                )
                canRef.current.rotation.z = THREE.MathUtils.lerp(
                    0,
                    Math.PI * 0.1,
                    progress
                )
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
        <group
            ref={groupRef}
            position={[0, -2, 0]}
        >
            <Float
                speed={1.5}
                rotationIntensity={0.1}
                floatIntensity={0.3}
                floatingRange={[-0.05, 0.05]}
            >
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

            <group
                ref={sphereRef}
                position={[0, sphereAnimation.startY, 0]}
                visible={sphereVisible}
            >
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
        const rotationAngle = THREE.MathUtils.lerp(
            0,
            Math.PI / 2,
            scrollProgress
        )
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

    // Add CSS for new cyber effects
    const cyberStyles = `
        /* Base text styles */
        .cyber-text {
            position: relative;
            display: inline-block;
        }

        /* Large text effect - ultra subtle */
        .cyber-large {
            position: relative;
            display: inline-block;
            color: rgba(255, 255, 255, 0.95);
            text-shadow: 0 0 2px rgba(255, 255, 255, 0.2);
            transition: text-shadow 0.4s ease;
        }

        .cyber-large:hover {
            text-shadow: 0 0 4px rgba(255, 255, 255, 0.3);
        }

        /* Medium text effect - minimal movement */
        .cyber-medium {
            position: relative;
            display: inline-block;
            transition: opacity 0.4s ease;
        }

        /* Small text effect - fade only */
        .cyber-small {
            position: relative;
            display: inline-block;
            transition: opacity 0.4s ease;
        }

        /* Technical details */
        .technical-readout {
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.75rem;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            opacity: 0.6;
            transition: opacity 0.3s ease;
        }

        .technical-readout:hover {
            opacity: 0.8;
        }

        /* Grid lines - more subtle */
        .technical-grid {
            position: absolute;
            inset: 0;
            background-image: 
                linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
            background-size: 24px 24px, 24px 24px, 96px 96px;
            mask-image: none;
            opacity: 1;
            pointer-events: none;
        }

        /* Enhanced technical markers */
        .technical-marker {
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.65rem;
            letter-spacing: 0.15em;
            opacity: 0.6;
            color: rgba(255, 255, 255, 0.8);
            text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
            position: relative;
            padding-left: 16px;
        }

        .technical-marker::before {
            content: '';
            position: absolute;
            left: 0;
            top: 50%;
            width: 8px;
            height: 1px;
            background: rgba(255, 255, 255, 0.4);
        }

        /* Technical readout enhancements */
        .technical-readout {
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.75rem;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            opacity: 0.8;
            color: rgba(255, 255, 255, 0.9);
            text-shadow: 0 0 8px rgba(255, 255, 255, 0.2);
            position: relative;
            padding-left: 20px;
        }

        .technical-readout::before {
            content: '[';
            position: absolute;
            left: 0;
            color: rgba(255, 255, 255, 0.4);
        }

        .technical-readout::after {
            content: ']';
            position: absolute;
            right: -12px;
            color: rgba(255, 255, 255, 0.4);
        }

        /* Feature block refinements */
        .feature-block {
            position: relative;
            padding: 2rem;
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            border: 1px solid rgba(255, 255, 255, 0.03);
        }

        .feature-block:hover {
            background: rgba(255, 255, 255, 0.02);
            border-color: rgba(255, 255, 255, 0.05);
        }

        /* Spec items - simplified */
        .spec-item {
            position: relative;
            padding: 1rem;
            transition: transform 0.3s ease;
        }

        .spec-item:hover {
            transform: translateX(4px);
        }

        /* Enhanced grid system */
        .horizontal-grid-container {
            position: absolute;
            inset: 0;
            width: 300vw; /* Match total scroll width */
            height: 100vh;
            overflow: hidden;
            pointer-events: none;
        }

        .technical-grid {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            background-image: 
                linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
            background-size: 24px 24px, 24px 24px, 96px 96px;
            opacity: 0;
            transform: scale(1.1);
            transition: opacity 0.5s ease, transform 0.5s ease;
        }

        .technical-grid.is-visible {
            opacity: 1;
            transform: scale(1);
        }

        /* Parallax text containers */
        .parallax-text-container {
            transform-style: preserve-3d;
            perspective: 1000px;
        }

        .parallax-layer-back {
            transform: translateZ(-10px) scale(2);
        }

        .parallax-layer-mid {
            transform: translateZ(-5px) scale(1.5);
        }

        .parallax-layer-front {
            transform: translateZ(0) scale(1);
        }

        /* Enhanced HUD elements */
        .hud-element {
            position: absolute;
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.65rem;
            color: rgba(255, 255, 255, 0.4);
            pointer-events: none;
        }

        .hud-corner {
            width: 20px;
            height: 20px;
            border-style: solid;
            border-width: 1px;
            border-color: rgba(255, 255, 255, 0.1);
        }

        .hud-corner-tl {
            top: 16px;
            left: 16px;
            border-right: none;
            border-bottom: none;
        }

        .hud-corner-tr {
            top: 16px;
            right: 16px;
            border-left: none;
            border-bottom: none;
        }

        .hud-corner-bl {
            bottom: 16px;
            left: 16px;
            border-right: none;
            border-top: none;
        }

        .hud-corner-br {
            bottom: 16px;
            right: 16px;
            border-left: none;
            border-top: none;
        }

        .hud-scan-line {
            position: absolute;
            left: 0;
            width: 100%;
            height: 2px;
            background: linear-gradient(
                90deg,
                transparent,
                rgba(255, 255, 255, 0.1),
                transparent
            );
            opacity: 0.5;
            animation: scan-line 8s linear infinite;
        }

        @keyframes scan-line {
            0% { top: -2px; }
            100% { top: 100%; }
        }

        /* Enhanced CTA Button Styles */
        .cta-button {
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            position: relative;
            overflow: hidden;
        }

        .cta-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: left 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .cta-button:hover::before {
            left: 100%;
        }

        .cta-button::after {
            content: '';
            position: absolute;
            bottom: 0;
            right: -100%;
            width: 100%;
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: right 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .cta-button:hover::after {
            right: 100%;
        }
    `

    // Update the text animation setup
    useEffect(() => {
        const panelTexts = gsap.utils.toArray<HTMLElement>(".panel-text")
        const horizontalSection = document.querySelector("#horizontalSection")
        const panels = gsap.utils.toArray<HTMLElement>(".panel")
        const grids = gsap.utils.toArray<HTMLElement>(".technical-grid")
        const totalWidth = panels.length * window.innerWidth

        // Create main scroll animation
        const horizontalScroll = gsap.timeline({
            scrollTrigger: {
                trigger: horizontalSection,
                start: "top top",
                end: () => `+=${totalWidth - window.innerWidth}`,
                pin: true,
                scrub: 0.8,
                onUpdate: (self) => {
                    setScrollState({
                        scrollProgress: self.progress,
                        isHorizontalSection: self.isActive,
                    })

                    // Update grid visibility based on scroll progress
                    grids.forEach((grid, index) => {
                        const gridProgress =
                            self.progress * panels.length - index
                        if (gridProgress > 0 && gridProgress < 1) {
                            grid.classList.add("is-visible")
                        } else {
                            grid.classList.remove("is-visible")
                        }
                    })
                },
            },
        })

        // Smoother panel animation with parallax
        horizontalScroll.to(panels, {
            x: () => -(totalWidth - window.innerWidth),
            ease: "none",
        })

        // Parallax text animations
        panelTexts.forEach((text) => {
            const splitText = new SplitType(text, {
                types: "words",
                tagName: "span",
            })

            // Set initial states
            gsap.set(text, {opacity: 0, y: 20})
            gsap.set(splitText.words, {opacity: 0, y: 10})

            // Create parallax effect based on text container class
            const parallaxAmount = text.closest(".parallax-layer-back")
                ? 100
                : text.closest(".parallax-layer-mid")
                ? 50
                : 20

            ScrollTrigger.create({
                trigger: text,
                start: "left center+=15%",
                end: "right center-=15%",
                containerAnimation: horizontalScroll,
                onEnter: () => {
                    const tl = gsap.timeline({
                        defaults: {ease: "power2.out"},
                    })

                    tl.to(text, {
                        opacity: 1,
                        y: 0,
                        duration: 0.5,
                    }).to(
                        splitText.words,
                        {
                            opacity: 1,
                            y: 0,
                            duration: 0.4,
                            stagger: {
                                amount: 0.3,
                                from: "start",
                            },
                        },
                        "-=0.2"
                    )

                    // Add parallax movement
                    gsap.to(text, {
                        x: parallaxAmount,
                        ease: "none",
                        scrollTrigger: {
                            trigger: text,
                            containerAnimation: horizontalScroll,
                            start: "left right",
                            end: "right left",
                            scrub: true,
                        },
                    })

                    // Apply size-based styles
                    const fontSize = parseFloat(
                        window.getComputedStyle(text).fontSize
                    )
                    if (fontSize > 40) {
                        text.classList.add("cyber-large")
                    } else if (fontSize > 24) {
                        text.classList.add("cyber-medium")
                    } else {
                        text.classList.add("cyber-small")
                    }
                },
            })
        })

        return () => {
            ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
        }
    }, [])

    return (
        <ScrollContext.Provider value={scrollState}>
            {/* Canvas Container - Fixed */}
            <div
                ref={canvasContainerRef}
                className='fixed inset-0 w-full h-full overflow-hidden bg-gradient-to-b from-black via-purple-900/20 to-black pointer-events-none'
            >
                {dimensions.width > 0 && (
                    <Canvas
                        shadows
                        camera={{position: [0, 1, 4], fov: 35}}
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
                        <color
                            attach='background'
                            args={["#000000"]}
                        />
                        <fog
                            attach='fog'
                            args={["#000000", 5, 15]}
                        />
                        <Suspense fallback={null}>
                            <SceneContent />
                        </Suspense>
                    </Canvas>
                )}
            </div>

            {/* Main Scrollable Content */}
            <div
                ref={containerRef}
                className='relative w-full'
            >
                {/* Hero Section */}
                <section className='relative h-screen flex flex-col items-center justify-start pt-24 overflow-hidden'>
                    <div className='glitch-container relative'>
                        <h1
                            ref={heroTextRef}
                            className='text-white font-editorial text-[4.5vw] text-center max-w-[60vw] leading-tight tracking-tight mix-blend-difference'
                        >
                            For those moments when you need a different version
                            of now.
                        </h1>
                    </div>
                    <h2
                        ref={subTextRef}
                        className='text-white/80 font-mono text-2xl mt-8 tracking-widest glitch-text'
                    >
                        CTRL-Z: Reality's Undo Button
                    </h2>
                    <div className='absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center space-y-4'>
                        <span className='text-white/40 font-mono text-sm tracking-wider'>
                            Scroll to explore
                        </span>
                        <div className='w-6 h-10 border-2 border-white/20 rounded-full flex items-start p-1'>
                            <div className='w-1 h-2 bg-white/40 rounded-full animate-scroll-hint mx-auto' />
                        </div>
                    </div>
                </section>

                {/* Horizontal Scroll Section */}
                <section
                    id='horizontalSection'
                    className='relative h-screen w-screen overflow-hidden'
                >
                    {/* Grid Container */}
                    <div className='horizontal-grid-container'>
                        {Array.from({length: 4}).map((_, index) => (
                            <div
                                key={index}
                                className='technical-grid'
                                style={{left: `${index * 100}vw`}}
                            />
                        ))}
                        <div className='hud-scan-line' />
                        <div className='hud-corner hud-corner-tl' />
                        <div className='hud-corner hud-corner-tr' />
                        <div className='hud-corner hud-corner-bl' />
                        <div className='hud-corner hud-corner-br' />
                    </div>

                    <div className='absolute top-0 left-0 h-full flex'>
                        {/* Update panel content with parallax containers */}
                        <div className='panel w-screen h-screen flex-shrink-0 p-16 grid grid-rows-6 grid-cols-12 gap-8 relative'>
                            <div className='col-span-8 col-start-2 row-start-2 row-span-4 grid grid-rows-[auto_1fr] gap-16'>
                                <div className='parallax-layer-front'>
                                    <h2 className='panel-text text-white/95 font-editorial text-[3.5vw] tracking-[-0.02em] leading-[1.1] max-w-[24ch] mix-blend-difference'>
                                        You've been there. That moment when
                                        everything goes sideways.
                                    </h2>
                                </div>
                                <div className='self-end space-y-6'>
                                    <p className='technical-readout mb-4'>
                                        System Status: Active
                                    </p>
                                    <div className='grid grid-cols-3 gap-4 text-xs font-mono text-white/40'>
                                        <div>CPU: 98.2%</div>
                                        <div>MEM: 64.7%</div>
                                        <div>TEMP: 42°C</div>
                                    </div>
                                    <div className='w-16 h-[1px] bg-white/20'></div>
                                </div>
                            </div>
                        </div>

                        {/* Panel 2 */}
                        <div className='panel w-screen h-screen flex-shrink-0'>
                            {/* Main Grid Container */}
                            <div className='w-full h-full grid grid-cols-12 grid-rows-6 p-16 gap-8'>
                                {/* Technical Details Top */}
                                <div className='col-span-12 row-span-1 flex justify-between items-start'>
                                    <div className='technical-readout'>
                                        <div className='text-xs opacity-60'>
                                            SYSTEM STATUS
                                        </div>
                                        <div className='text-sm mt-1'>
                                            QUANTUM FIELD: STABLE
                                        </div>
                                    </div>
                                    <div className='technical-readout text-right'>
                                        <div className='text-xs opacity-60'>
                                            TIMELINE
                                        </div>
                                        <div className='text-sm mt-1'>
                                            BRANCH: ALPHA-7
                                        </div>
                                    </div>
                                </div>

                                {/* Main Content Grid */}
                                <div className='col-span-12 row-span-4 grid grid-cols-2 gap-x-32 content-center'>
                                    {/* Left Column */}
                                    <div className='space-y-24'>
                                        <div className='panel-text feature-block group relative overflow-hidden'>
                                            <div className='absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>
                                            <div className='relative z-10'>
                                                <p className='technical-readout mb-4 text-sm'>
                                                    <span className='inline-block w-2 h-2 bg-white/20 group-hover:bg-white/40 transition-colors mr-2'></span>
                                                    Core Technology
                                                </p>
                                                <h3 className='text-white/95 font-editorial text-[1.5vw] leading-[1.1] mb-4 transform group-hover:translate-x-2 transition-transform duration-500'>
                                                    TIMESTREAM™ NAVIGATION
                                                </h3>
                                                <p className='text-white/70 font-mono text-sm leading-relaxed max-w-[40ch] group-hover:text-white/90 transition-colors duration-300'>
                                                    Proprietary quantum
                                                    tunneling allows seamless
                                                    timeline transitions with
                                                    zero temporal artifacts.
                                                </p>
                                                <div className='mt-6 grid grid-cols-2 gap-4 text-xs font-mono text-white/30'>
                                                    <div className='group-hover:text-white/50 transition-colors duration-300'>
                                                        Latency: 0.0042ms
                                                    </div>
                                                    <div className='group-hover:text-white/50 transition-colors duration-300'>
                                                        Quantum State: Stable
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000'></div>
                                        </div>

                                        <div className='panel-text feature-block group relative overflow-hidden'>
                                            <div className='absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>
                                            <div className='relative z-10'>
                                                <h3 className='text-white/95 font-editorial text-[4vw] leading-[0.9] mb-8 transform group-hover:translate-x-2 transition-transform duration-500'>
                                                    NEURAL-SYNC
                                                    <br />
                                                    INTERFACE
                                                </h3>
                                                <p className='text-white/70 font-mono text-base leading-relaxed max-w-[40ch] transition-opacity duration-300 group-hover:text-white/90'>
                                                    Memory preservation across
                                                    realities, ensuring
                                                    cognitive continuity.
                                                </p>
                                            </div>
                                            <div className='absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-transparent via-white/20 to-transparent transform translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-1000'></div>
                                        </div>
                                    </div>

                                    {/* Right Column */}
                                    <div className='space-y-32 mt-48'>
                                        <div className='panel-text feature-block group relative overflow-hidden'>
                                            <div className='absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>
                                            <div className='relative z-10'>
                                                <h3 className='text-white/95 font-editorial text-[4vw] leading-[0.9] mb-8 transform group-hover:translate-x-2 transition-transform duration-500'>
                                                    QUANTUM
                                                    <br />
                                                    STABILIZERS
                                                </h3>
                                                <p className='text-white/70 font-mono text-base leading-relaxed max-w-[40ch] transition-opacity duration-300 group-hover:text-white/90'>
                                                    Reality-grade containment
                                                    field prevents unwanted
                                                    timeline bleed.
                                                </p>
                                                <div className='mt-6 grid grid-cols-3 gap-2'>
                                                    {Array.from({
                                                        length: 3,
                                                    }).map((_, i) => (
                                                        <div
                                                            key={i}
                                                            className='h-[2px] bg-white/20 group-hover:bg-white/40 transition-colors duration-300 delay-[${i * 100}ms]'
                                                        ></div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className='panel-text feature-block group relative overflow-hidden'>
                                            <div className='absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>
                                            <div className='relative z-10'>
                                                <h3 className='text-white/95 font-editorial text-[4vw] leading-[0.9] mb-8 transform group-hover:translate-x-2 transition-transform duration-500'>
                                                    INSTANT
                                                    <br />
                                                    ACCESS
                                                </h3>
                                                <p className='text-white/70 font-mono text-base leading-relaxed max-w-[40ch] transition-opacity duration-300 group-hover:text-white/90'>
                                                    Zero latency between
                                                    decision and implementation.
                                                </p>
                                                <div className='absolute bottom-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity duration-300'>
                                                    <div className='font-mono text-[10px] tracking-wider'>
                                                        ACCESS_POINT_01
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Technical Details Bottom */}
                                <div className='col-span-12 row-span-1 flex justify-between items-end font-mono text-xs text-white/40'>
                                    <div className='grid grid-cols-3 gap-8'>
                                        <div>MEMORY: 87.2%</div>
                                        <div>UPTIME: 847:23:12</div>
                                        <div>TEMP: 42.3°C</div>
                                    </div>
                                    <div className='text-right'>
                                        <div>LOC: 37.7749° N, 122.4194° W</div>
                                        <div className='mt-1'>
                                            TIME: {new Date().toISOString()}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Background Elements */}
                            <div className='absolute inset-0 pointer-events-none'>
                                <div className='absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent'></div>
                                <div className='absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent'></div>
                                <div className='absolute top-8 right-8 flex items-center space-x-2'>
                                    <div className='w-2 h-2 bg-white/20'></div>
                                    <div className='w-2 h-2 bg-white/30'></div>
                                    <div className='w-2 h-2 bg-white/40'></div>
                                </div>
                            </div>
                        </div>

                        {/* Panel 3 */}
                        <div className='panel w-screen h-screen flex-shrink-0 p-16 grid grid-rows-6 grid-cols-12 gap-8'>
                            <div className='col-span-10 col-start-2 row-span-full grid grid-cols-[1fr_auto] items-center gap-32'>
                                <div className='panel-text max-w-[32ch] fade-up'>
                                    <h2 className='text-white/95 font-editorial text-[4vw] tracking-[-0.03em] leading-[0.95] mb-8'>
                                        Until now, you lived with it.
                                    </h2>
                                    <p className='text-white/70 font-mono text-sm leading-relaxed mb-6'>
                                        Every decision point creates infinite
                                        branches. We just help you find the
                                        right one.
                                    </p>
                                    <div className='grid grid-cols-2 gap-4 text-xs font-mono text-white/40 mt-8'>
                                        <div>Branch Count: ∞</div>
                                        <div>Success Rate: 99.99%</div>
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
                                <p className='panel-text text-white/40 font-mono text-base tracking-[0.5em] uppercase mb-8 fade-up'>
                                    Introducing
                                </p>
                                <h2 className='panel-text text-white/95 font-editorial text-[10vw] tracking-[-0.03em] leading-[0.9] mb-12 fade-up'>
                                    Now you can fix it.
                                </h2>
                                <div className='panel-text mt-12 flex items-center gap-8 fade-up'>
                                    <div className='w-12 h-[1px] bg-white/20'></div>
                                    <p className='text-white/60 font-mono text-sm tracking-[0.2em] uppercase'>
                                        Continue to experience
                                    </p>
                                    <div className='w-12 h-[1px] bg-white/20'></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Testimonial Section */}
                <section className='relative min-h-screen bg-black/90 flex items-center justify-center py-24'>
                    <div className='container mx-auto grid grid-cols-12 gap-8 px-8'>
                        <div className='col-span-6'>
                            <h2 className='text-white font-editorial text-6xl leading-tight mb-16'>
                                When we first announced
                                <br />
                                a beverage that could alter
                                <br />
                                reality, they called us mad.
                                <br />
                                <br />
                                88 billion successful
                                <br />
                                reality shifts later, they
                                <br />
                                call us the future.
                            </h2>
                        </div>
                        <div className='col-span-5 col-start-8 space-y-12'>
                            <div className='space-y-6'>
                                <div className='flex'>
                                    {Array.from({length: 5}, (_, index) => (
                                        <span
                                            key={index}
                                            className='text-white text-xl'
                                        >
                                            ★
                                        </span>
                                    ))}
                                </div>
                                <p className='text-white/90 font-mono text-lg leading-relaxed'>
                                    "Yesterday, I made the worst presentation of
                                    my career. Or I would have, if ctrl-z hadn't
                                    helped me find the timeline where I
                                    remembered to actually save my slides. The
                                    look on my alternate self's face was
                                    priceless."
                                </p>
                            </div>
                            <div className='space-y-6'>
                                <div className='flex'>
                                    {Array.from({length: 5}, (_, index) => (
                                        <span
                                            key={index}
                                            className='text-white text-xl'
                                        >
                                            ★
                                        </span>
                                    ))}
                                </div>
                                <p className='text-white/90 font-mono text-lg leading-relaxed'>
                                    "Used to spend hours overthinking my
                                    decisions. Now I just ctrl-z through a few
                                    realities until I find the one that clicks.
                                    Though I should mention - don't try it
                                    during a job interview."
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Final CTA Section */}
                <section className='relative min-h-screen bg-black flex items-center justify-center overflow-hidden'>
                    {/* Technical Grid Background */}
                    <div className='technical-grid opacity-20'></div>
                    <div className='hud-scan-line'></div>

                    {/* Corner Brackets */}
                    <div className='hud-corner hud-corner-tl'></div>
                    <div className='hud-corner hud-corner-tr'></div>
                    <div className='hud-corner hud-corner-bl'></div>
                    <div className='hud-corner hud-corner-br'></div>

                    {/* Main Content */}
                    <div className='text-center px-4 relative z-10 max-w-6xl mx-auto'>
                        {/* Technical Readout Header */}
                        <div className='technical-readout text-sm mb-8 tracking-[0.3em]'>
                            QUANTUM SHIFT PROTOCOL: READY
                        </div>

                        {/* Main Title */}
                        <h2 className='panel-text text-white/90 font-editorial text-8xl mb-12 leading-[0.9]'>
                            Begin Your
                            <br />
                            Quantum Journey
                        </h2>

                        {/* Technical Stats */}
                        <div className='grid grid-cols-3 gap-8 mb-16 font-mono'>
                            <div className='technical-readout text-left'>
                                <div className='text-xs mb-2 opacity-60'>
                                    REALITY SHIFTS
                                </div>
                                <div className='text-2xl'>88.2B+</div>
                            </div>
                            <div className='technical-readout text-center'>
                                <div className='text-xs mb-2 opacity-60'>
                                    SUCCESS RATE
                                </div>
                                <div className='text-2xl'>99.99%</div>
                            </div>
                            <div className='technical-readout text-right'>
                                <div className='text-xs mb-2 opacity-60'>
                                    QUANTUM STABILITY
                                </div>
                                <div className='text-2xl'>100%</div>
                            </div>
                        </div>

                        {/* Description */}
                        <p className='text-white/70 font-mono text-lg max-w-2xl mx-auto mb-16 leading-relaxed'>
                            Step into a future where every possibility is within
                            reach. Your perfect timeline awaits.
                        </p>

                        {/* CTA Buttons */}
                        <div className='space-x-8'>
                            <button className='cta-button group relative px-12 py-5 bg-white/5 hover:bg-white/10'>
                                <div className='absolute inset-0 border border-white/20 group-hover:border-white/40 transition-colors'></div>
                                <div className='absolute top-0 left-0 w-2 h-2 border-l-2 border-t-2 border-white/40 group-hover:border-white/60 transition-colors'></div>
                                <div className='absolute top-0 right-0 w-2 h-2 border-r-2 border-t-2 border-white/40 group-hover:border-white/60 transition-colors'></div>
                                <div className='absolute bottom-0 left-0 w-2 h-2 border-l-2 border-b-2 border-white/40 group-hover:border-white/60 transition-colors'></div>
                                <div className='absolute bottom-0 right-0 w-2 h-2 border-r-2 border-b-2 border-white/40 group-hover:border-white/60 transition-colors'></div>
                                <span className='text-white/90 font-mono text-lg tracking-wider relative z-10'>
                                    INITIATE SHIFT
                                </span>
                            </button>
                            <button className='cta-button group relative px-12 py-5'>
                                <div className='absolute inset-0 border border-white/10 group-hover:border-white/20 transition-colors'></div>
                                <span className='text-white/70 font-mono text-lg tracking-wider relative z-10'>
                                    LEARN MORE
                                </span>
                            </button>
                        </div>

                        {/* Technical Details */}
                        <div className='absolute bottom-8 left-8 font-mono text-xs text-white/40 tracking-wider'>
                            <div>MODEL: QS-749-X</div>
                            <div>BUILD: 2038.12.1</div>
                        </div>
                        <div className='absolute bottom-8 right-8 font-mono text-xs text-white/40 tracking-wider text-right'>
                            <div>LAT: 37.7749° N</div>
                            <div>LONG: 122.4194° W</div>
                        </div>
                    </div>

                    {/* Background Gradient */}
                    <div className='absolute inset-0 bg-gradient-to-t from-black via-purple-900/10 to-black opacity-70'></div>
                </section>

                {/* Add this CSS to your global styles or a CSS module */}
                <style
                    dangerouslySetInnerHTML={{
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
                    `,
                    }}
                />
            </div>
            <style dangerouslySetInnerHTML={{__html: cyberStyles}} />
        </ScrollContext.Provider>
    )
}

export default QuantumPage
