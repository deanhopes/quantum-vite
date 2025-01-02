import {useCallback, useMemo} from "react"

interface EncryptionOptions {
    speed?: number
    glitchChars?: string
    smoothness?: number
}

export function useEncryptionEffect() {
    const defaultGlitchChars = useMemo(() => "!<>-_\\/[]{}—=+*^?#_$%&@", [])

    const createEncryptionEffect = useCallback(
        (
            element: HTMLDivElement,
            onComplete: () => void,
            options: EncryptionOptions = {}
        ) => {
            const {
                speed = 1,
                glitchChars = defaultGlitchChars,
                smoothness = 0.5,
            } = options

            const originalText = element.textContent || ""
            let iterations = 0
            let animationFrameId: number

            const animate = () => {
                element.textContent = originalText
                    .split("")
                    .map((_, index) => {
                        if (index < iterations) return originalText[index]
                        return glitchChars[
                            Math.floor(Math.random() * glitchChars.length)
                        ]
                    })
                    .join("")

                iterations += smoothness * speed

                if (iterations >= originalText.length) {
                    element.textContent = originalText
                    onComplete()
                    return
                }

                animationFrameId = requestAnimationFrame(animate)
            }

            animationFrameId = requestAnimationFrame(animate)

            return () => {
                if (animationFrameId) {
                    cancelAnimationFrame(animationFrameId)
                }
            }
        },
        []
    )

    return {createEncryptionEffect}
}
