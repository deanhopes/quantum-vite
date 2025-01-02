import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface MagneticOptions {
    strength?: number;
    radius?: number;
    ease?: number;
}

export const useMagneticEffect = ({
    strength = 0.5,
    radius = 100,
    ease = 0.3,
}: MagneticOptions = {}) => {
    const elementRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = element.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const distanceX = e.clientX - centerX;
            const distanceY = e.clientY - centerY;

            const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

            if (distance < radius) {
                const pull = (radius - distance) / radius;
                const moveX = distanceX * pull * 0.5;
                const moveY = distanceY * pull * 0.5;

                gsap.to(element, {
                    x: moveX,
                    y: moveY,
                    duration: ease,
                    ease: "power2.out",
                });
            } else {
                gsap.to(element, {
                    x: 0,
                    y: 0,
                    duration: ease,
                    ease: "power2.out",
                });
            }
        };

        const handleMouseLeave = () => {
            gsap.to(element, {
                x: 0,
                y: 0,
                duration: ease,
                ease: "power2.out",
            });
        };

        document.addEventListener("mousemove", handleMouseMove);
        element.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            element?.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, [radius, ease]);

    return elementRef;
}; 