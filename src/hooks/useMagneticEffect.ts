import {useEffect, useRef, useCallback} from "react"
import gsap from "gsap"

interface MagneticOptions {
    strength?: number
    radius?: number
    ease?: number
}

export const useMagneticEffect = ({
    strength = 2,
    radius = 200,
    ease = 0.15,
}: MagneticOptions = {}) => {
    const elementRef = useRef<HTMLButtonElement>(null)
    const animationRef = useRef<number>()
    const isHovered = useRef(false)
    const bounds = useRef<DOMRect | null>(null)

    // Update bounds on scroll/resize
    const updateBounds = useCallback(() => {
        if (elementRef.current) {
            bounds.current = elementRef.current.getBoundingClientRect()
        }
    }, [])

    const animate = useCallback(
        (moveX: number, moveY: number) => {
            const element = elementRef.current
            if (!element) return

            gsap.to(element, {
                x: moveX,
                y: moveY,
                duration: ease,
                ease: "power4.out",
                overwrite: "auto",
            })
        },
        [ease]
    )

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (!isHovered.current || !bounds.current || !elementRef.current) return

            const centerX = bounds.current.left + bounds.current.width / 2
            const centerY = bounds.current.top + bounds.current.height / 2

            const distanceX = e.clientX - centerX
            const distanceY = e.clientY - centerY
            const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY)

            if (distance < radius) {
                const pull = Math.pow((radius - distance) / radius, 2)
                const moveX = (distanceX * pull * strength) * 1.2
                const moveY = (distanceY * pull * strength) * 1.2

                cancelAnimationFrame(animationRef.current!)
                animationRef.current = requestAnimationFrame(() => {
                    animate(moveX, moveY)
                })
            } else if (isHovered.current) {
                resetPosition()
            }
        },
        [radius, strength, animate]
    )

    const resetPosition = useCallback(() => {
        cancelAnimationFrame(animationRef.current!)
        animationRef.current = requestAnimationFrame(() => {
            animate(0, 0)
        })
    }, [animate])

    const handleMouseEnter = useCallback(() => {
        isHovered.current = true
        updateBounds()
    }, [updateBounds])

    const handleMouseLeave = useCallback(() => {
        isHovered.current = false
        resetPosition()
    }, [resetPosition])

    useEffect(() => {
        const element = elementRef.current
        if (!element) return

        // Initial bounds
        updateBounds()

        // Event listeners
        element.addEventListener("mouseenter", handleMouseEnter, {passive: true})
        document.addEventListener("mousemove", handleMouseMove, {passive: true})
        element.addEventListener("mouseleave", handleMouseLeave, {passive: true})
        window.addEventListener("scroll", updateBounds, {passive: true})
        window.addEventListener("resize", updateBounds, {passive: true})

        return () => {
            element.removeEventListener("mouseenter", handleMouseEnter)
            document.removeEventListener("mousemove", handleMouseMove)
            element.removeEventListener("mouseleave", handleMouseLeave)
            window.removeEventListener("scroll", updateBounds)
            window.removeEventListener("resize", updateBounds)
            cancelAnimationFrame(animationRef.current!)
        }
    }, [handleMouseMove, handleMouseEnter, handleMouseLeave, updateBounds])

    return elementRef
}
