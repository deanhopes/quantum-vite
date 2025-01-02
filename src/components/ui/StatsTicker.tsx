import {useEffect, useRef} from "react"
import gsap from "gsap"

const stats = [
    {
        label: "NEURAL SYNC",
        value: "99.99%",
        status: "ACTIVE",
    },
    {
        label: "TIMELINE INTEGRITY",
        value: "100%",
        status: "VERIFIED",
    },
    {
        label: "QUANTUM STABILITY",
        value: "98.7%",
        status: "OPTIMAL",
    },
    {
        label: "REALITY SHIFTS",
        value: "88.2B+",
        status: "LOGGED",
    },
    {
        label: "QUANTUM COHERENCE",
        value: "99.98%",
        status: "STABLE",
    },
    {
        label: "ENTROPY LEVEL",
        value: "0.001%",
        status: "MINIMAL",
    },
    {
        label: "TIMELINE BRANCHES",
        value: "∞",
        status: "ACTIVE",
    },
    {
        label: "QUANTUM MEMORY",
        value: "1.2YB",
        status: "ALLOCATED",
    },
    {
        label: "SYNC RATE",
        value: "10TB/s",
        status: "OPTIMAL",
    },
    {
        label: "QUANTUM CORES",
        value: "1024",
        status: "ONLINE",
    },
]

const StatsTicker = () => {
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!containerRef.current) return

        const container = containerRef.current
        const firstItem = container.children[0] as HTMLElement
        const itemWidth = firstItem.offsetWidth

        const loop = gsap.to(container, {
            x: -itemWidth,
            duration: 30,
            ease: "none",
            repeat: -1,
            modifiers: {
                x: gsap.utils.unitize(gsap.utils.wrap(-itemWidth, 0)),
            },
        })

        return () => {
            loop.kill()
        }
    }, [])

    return (
        <div className=' bottom-0 left-0 w-screen overflow-hidden bg-black/20 backdrop-blur-sm border-t border-white/5'>
            <div
                ref={containerRef}
                className='flex gap-4 py-8'
            >
                {[...Array(3)].map((_, setIndex) => (
                    <div
                        key={setIndex}
                        className='flex items-center min-w-max'
                    >
                        {stats.map((stat, statIndex) => (
                            <div
                                key={statIndex}
                                className='border-l border-white/10 pl-4 pr-8'
                            >
                                <div className='flex items-center gap-2 mb-2'>
                                    <div className='w-1 h-1 bg-white/20 rotate-45'></div>
                                    <span className='font-input text-[8px] text-white/40'>
                                        {stat.label}
                                    </span>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <span className='stat-value text-[24px] font-editorial text-white/90'>
                                        {stat.value}
                                    </span>
                                    <span className='text-[8px] text-green-500/60'>
                                        {stat.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default StatsTicker
