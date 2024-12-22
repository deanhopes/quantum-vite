import React from 'react'

export const InteractiveGrid: React.FC = () => (
    <div className='interactive-grid absolute inset-0'>
        {/* Primary Grid */}
        <div className='grid-lines absolute inset-0 bg-[length:24px_24px] [mask-image:linear-gradient(to_bottom,transparent,black,transparent)]'
            style={{
                backgroundImage: `
                    linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
                `
            }}
        />

        {/* Secondary Grid */}
        <div className='grid-points absolute inset-0 bg-[length:96px_96px]'
            style={{
                backgroundImage: `
                    linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
                `
            }}
        />

        {/* Radial Points */}
        <div className='grid-scan absolute inset-0 bg-[length:48px_48px] opacity-30'
            style={{
                backgroundImage: `radial-gradient(circle at center, rgba(255,255,255,0.1) 1px, transparent 1px)`
            }}
        />

        {/* Scanning Line Effect */}
        <div className='grid-noise absolute inset-0 overflow-hidden'>
            <div className='absolute w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent animate-scan-y' />
            <div className='absolute w-[1px] h-full bg-gradient-to-b from-transparent via-white/10 to-transparent animate-scan-x' />
        </div>

        {/* Data Particles */}
        <div className='data-particles absolute inset-0 pointer-events-none'>
            {Array.from({ length: 20 }).map((_, i) => (
                <div
                    key={i}
                    className='data-stream'
                    style={{
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 2}s`,
                        animationDuration: `${2 + Math.random() * 2}s`
                    }}
                />
            ))}
        </div>
    </div>
) 