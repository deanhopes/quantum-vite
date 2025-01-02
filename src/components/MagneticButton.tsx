import React from "react"
import {useMagneticEffect} from "../hooks/useMagneticEffect"
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
    strength = 0.5,
    radius = 100,
    ease = 0.3,
    ...props
}) => {
    const magneticRef = useMagneticEffect({strength, radius, ease})

    return (
        <button
            ref={magneticRef}
            className={clsx(
                "relative inline-block transform-gpu will-change-transform",
                className
            )}
            {...props}
        >
            {children}
        </button>
    )
}
