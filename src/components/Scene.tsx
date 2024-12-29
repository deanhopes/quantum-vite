import { Canvas } from "@react-three/fiber"
import { Suspense, useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { SceneContent } from "./SceneComponents"
import { motion, useSpring } from "framer-motion"

export default function Scene() {
    const containerRef = useRef<HTMLDivElement>(null)
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

    useEffect(() => {
        if (!containerRef.current) return

        setDimensions({
            width: containerRef.current.clientWidth,
            height: containerRef.current.clientHeight,
        })

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setDimensions({
                    width: entry.contentRect.width,
                    height: entry.contentRect.height,
                })
            }
        })

        resizeObserver.observe(containerRef.current)
        return () => resizeObserver.disconnect()
    }, [])

    return (
        <motion.div
            ref={containerRef}
            className='fixed inset-0 w-full h-full overflow-hidden m-0 p-0'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            style={{
                willChange: "transform, opacity",
                background:
                    "radial-gradient(circle at center, #1a1a1a 0%, #000000 100%)",
                margin: 0,
                padding: 0,
            }}
        >
            {dimensions.width > 0 && dimensions.height > 0 && (
                <Canvas
                    shadows
                    camera={{ position: [-2, 1, 4], fov: 35 }}
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        touchAction: "none",
                        display: "block",
                        width: `${dimensions.width}px`,
                        height: `${dimensions.height}px`,
                        margin: 0,
                        padding: 0,
                    }}
                    gl={{
                        antialias: true,
                        toneMapping: THREE.ACESFilmicToneMapping,
                        toneMappingExposure: 1.5,
                        powerPreference: "high-performance",
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
        </motion.div>
    )
}
