import React, { useEffect } from "react"
import { useMagneticEffect } from "../hooks/useMagneticEffect"
import clsx from "clsx"

interface MagneticButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode
    className?: string
    strength?: number
    radius?: number
    ease?: number
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
    children,
    className,
    strength = 2,
    radius = 200,
    ease = 0.15,
    ...props
}) => {
    const magneticRef = useMagneticEffect({ strength, radius, ease })

    // Debug mount
    useEffect(() => {
        if (magneticRef.current) {
            console.log("MagneticButton mounted", {
                strength,
                radius,
                ease,
                element: magneticRef.current,
            })
        }
    }, [strength, radius, ease])

    return (
        <button
            ref={magneticRef}
            className={clsx(
                "relative inline-block cursor-pointer select-none",
                "transform-gpu will-change-transform transition-none",
                "hover:z-10",
                className
            )}
            {...props}
        >
            {children}
        </button>
    )
}
