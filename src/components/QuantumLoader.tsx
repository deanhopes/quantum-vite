import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useEncryptionEffect } from '../hooks/useEncryptionEffect';

interface QuantumLoaderProps {
    children: React.ReactNode;
}

const PROGRESS_STEPS = [25, 50, 75, 100] as const;
const LOADING_TEXTS = [
    "QUANTUM INITIALIZATION",
    "TIMELINE SYNC",
    "REALITY CALIBRATION",
    "STABILIZATION COMPLETE"
] as const;

export function QuantumLoader({ children }: QuantumLoaderProps) {
    const [showScene, setShowScene] = useState(false);
    const [progress, setProgress] = useState(0);
    const progressBarRef = useRef<HTMLDivElement>(null);
    const progressTextRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const { createEncryptionEffect } = useEncryptionEffect();

    useEffect(() => {
        if (!containerRef.current || !progressBarRef.current || !progressTextRef.current) return;

        const tl = gsap.timeline({
            onComplete: () => {
                gsap.to(containerRef.current, {
                    opacity: 0,
                    duration: 0.5,
                    onComplete: () => setShowScene(true)
                });
            }
        });

        // Animate through each progress step
        PROGRESS_STEPS.forEach((step, index) => {
            tl.to(progressBarRef.current, {
                width: `${step}%`,
                duration: 0.5,
                ease: "steps(10)",
                onStart: () => {
                    setProgress(step);
                    if (progressTextRef.current) {
                        progressTextRef.current.textContent = LOADING_TEXTS[index];
                        createEncryptionEffect(progressTextRef.current, () => {
                            gsap.to(progressTextRef.current, {
                                opacity: 0.7,
                                duration: 0.05,
                                repeat: 2,
                                yoyo: true,
                            });
                        });
                    }
                }
            })
                .to({}, { duration: 0.5 }); // Pause between steps
        });

        return () => {
            tl.kill();
        };
    }, []);

    return (
        <>
            <div
                ref={containerRef}
                className="fixed inset-0 bg-quantum-black z-50 flex items-center justify-center"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
            >
                <div className="w-[80vw] max-w-2xl space-y-6">
                    <div
                        ref={progressTextRef}
                        className="text-quantum-white font-geist-mono text-2xl text-center mb-4 h-8"
                    >
                        {LOADING_TEXTS[0]}
                    </div>

                    <div className="relative h-2 bg-quantum-white/10 overflow-hidden">
                        <div
                            ref={progressBarRef}
                            className="absolute top-0 left-0 h-full w-0 bg-quantum-white"
                            style={{
                                boxShadow: '0 0 10px rgba(255,255,255,0.5), 0 0 20px rgba(255,255,255,0.3)'
                            }}
                        />

                        {/* Glitch overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-quantum-white/20 to-transparent animate-glitch" />
                    </div>

                    <div className="text-quantum-white/50 font-geist-mono text-sm text-center">
                        {progress}% COMPLETE
                    </div>
                </div>
            </div>
            {showScene && children}
        </>
    );
} 