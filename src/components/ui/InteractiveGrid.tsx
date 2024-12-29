export function InteractiveGrid() {
    return (
        <div className="absolute inset-0 pointer-events-none">
            {/* Primary Grid */}
            <div className="absolute inset-0 bg-[length:24px_24px] [mask-image:linear-gradient(to_bottom,transparent,black,transparent)]"
                style={{
                    backgroundImage: `
                    linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
                `
                }}
            />

            {/* Secondary Grid */}
            <div className="absolute inset-0 bg-[length:96px_96px]"
                style={{
                    backgroundImage: `
                    linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
                `
                }}
            />

            {/* Radial Points */}
            <div className="absolute inset-0 bg-[length:48px_48px] opacity-30"
                style={{
                    backgroundImage: `radial-gradient(circle at center, rgba(255,255,255,0.1) 1px, transparent 1px)`
                }}
            />

            {/* Scanning Line Effect */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent animate-scan-y" />
                <div className="absolute w-[1px] h-full bg-gradient-to-b from-transparent via-white/10 to-transparent animate-scan-x" />
            </div>
        </div>
    );
} 