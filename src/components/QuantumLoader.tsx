import {useEffect, useRef, useState} from "react"
import gsap from "gsap"
import {useEncryptionEffect} from "../hooks/useEncryptionEffect"

interface QuantumLoaderProps {
    onLoadComplete?: () => void
}

const PROGRESS_STEPS = [15, 35, 65, 85, 100] as const
const LOADING_TEXTS = [
    "QUANTUM CORE INITIALIZATION",
    "NEURAL INTERFACE SYNC",
    "TIMELINE STABILIZATION",
    "REALITY MATRIX MAPPING",
    "QUANTUM STATE VERIFIED",
] as const

const SYSTEM_METRICS = [
    {
        label: "QUANTUM SYNC",
        value: "99.99%",
        status: "ACTIVE",
    },
    {
        label: "TIMELINE",
        value: "100%",
        status: "STABLE",
    },
    {
        label: "NEURAL LINK",
        value: "95.5%",
        status: "OPTIMAL",
    },
    {
        label: "ENTROPY",
        value: "0.01%",
        status: "MINIMAL",
    },
] as const

export function QuantumLoader({onLoadComplete}: QuantumLoaderProps) {
    const [progress, setProgress] = useState(0)
    const [currentStep, setCurrentStep] = useState(0)
    const [isUnmounting, setIsUnmounting] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const progressTextRef = useRef<HTMLDivElement>(null)
    const {createEncryptionEffect} = useEncryptionEffect()

    useEffect(() => {
        if (!containerRef.current || !progressTextRef.current) return

        const tl = gsap.timeline({
            onComplete: () => {
                const fadeOut = gsap.timeline({
                    onComplete: () => {
                        setIsUnmounting(true)
                        setTimeout(() => {
                            onLoadComplete?.()
                        }, 500)
                    },
                })

                fadeOut.to(containerRef.current, {
                    opacity: 0,
                    duration: 0.5,
                    ease: "power2.inOut",
                })
            },
        })

        // Progress animation sequence
        PROGRESS_STEPS.forEach((step, index) => {
            tl.to(
                {},
                {
                    duration: 0.8,
                    onStart: () => {
                        setCurrentStep(index)
                        setProgress(step)
                        if (progressTextRef.current) {
                            progressTextRef.current.textContent =
                                LOADING_TEXTS[index]
                            createEncryptionEffect(
                                progressTextRef.current,
                                () => {
                                    // Optional callback after encryption effect
                                }
                            )
                        }
                    },
                }
            )
        })

        return () => {
            tl.kill()
        }
    }, [onLoadComplete])

    if (isUnmounting) return null

    return (
        <div
            ref={containerRef}
            className='fixed inset-0 bg-black z-[200] flex items-center justify-center'
            role='progressbar'
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
        >
            <div className='container mx-auto px-16'>
                <div className='max-w-4xl mx-auto space-y-16'>
                    {/* Header */}
                    <div className='border-b border-white/10 pb-6'>
                        <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-4'>
                                <div className='w-1 h-1 bg-white/20 rotate-45'></div>
                                <div>
                                    <p className='font-input text-[10px] text-white/60'>
                                        QUANTUM INTERFACE
                                    </p>
                                    <div className='flex items-center gap-2 mt-1'>
                                        <div className='w-1.5 h-1.5 bg-green-500/60 rounded-full'></div>
                                        <p className='font-input text-[8px] text-white/40'>
                                            INITIALIZATION SEQUENCE
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className='text-right'>
                                <div className='font-input text-[8px] text-white/40 mb-1'>
                                    SYSTEM ID
                                </div>
                                <div className='font-input text-[10px] text-white/60'>
                                    QT-
                                    {Math.floor(progress)
                                        .toString()
                                        .padStart(3, "0")}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Progress Section */}
                    <div className='space-y-8'>
                        <div
                            ref={progressTextRef}
                            className='font-input text-[10px] text-white/60 text-center tracking-[0.2em]'
                        >
                            {LOADING_TEXTS[currentStep]}
                        </div>

                        <div className='border border-white/10 p-6 space-y-4'>
                            <div className='h-[1px] w-full bg-white/5 overflow-hidden'>
                                <div
                                    className='h-full bg-white/40 transition-all duration-500 ease-out'
                                    style={{width: `${progress}%`}}
                                />
                            </div>
                            <div className='flex justify-between items-center'>
                                <div className='font-input text-[8px] text-white/40'>
                                    QUANTUM SYNC
                                </div>
                                <div className='font-input text-[10px] text-white/60'>
                                    {progress}%
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* System Metrics Grid */}
                    <div className='grid grid-cols-4 gap-4'>
                        {SYSTEM_METRICS.map((metric, index) => (
                            <div
                                key={index}
                                className='border-l border-white/10 pl-4'
                            >
                                <div className='flex items-center gap-2 mb-2'>
                                    <div className='w-1 h-1 bg-white/20 rotate-45'></div>
                                    <span className='font-input text-[8px] text-white/40'>
                                        {metric.label}
                                    </span>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <span className='font-input text-[14px] text-white/90'>
                                        {metric.value}
                                    </span>
                                    <span className='font-input text-[8px] text-green-500/60'>
                                        {metric.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className='border-t border-white/10 pt-6'>
                        <div className='flex justify-between items-center'>
                            <div className='font-input text-[8px] text-white/40'>
                                QUANTUM BASECAMP
                            </div>
                            <div className='flex items-center gap-4 font-input text-[8px] text-white/40'>
                                <div>HASH: 0xQ1Z9</div>
                                <div>REV: 2.0.1</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
