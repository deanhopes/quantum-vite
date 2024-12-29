import React from 'react';

export function InteractiveGrid() {
    // Base unit for grid calculations
    const UNIT = 24; // Base grid unit in pixels
    const LARGE_UNIT = UNIT * 4; // 96px for larger grid elements

    return (
        <div className="absolute inset-0">
            {/* Grid Container */}
            <div className="absolute inset-0">
                {/* Base Grid - Dots at intersections */}
                <div className="absolute inset-0"
                    style={{
                        backgroundImage: `
                            radial-gradient(circle at center, rgba(255,255,255,0.025) 0.5px, transparent 0.5px)
                        `,
                        backgroundSize: `${UNIT}px ${UNIT}px`
                    }}
                />

                {/* Primary Grid - Dashed lines */}
                <div className="absolute inset-0"
                    style={{
                        backgroundImage: `
                            repeating-linear-gradient(to right, 
                                transparent,
                                transparent ${UNIT - 1}px,
                                rgba(255,255,255,0.02) ${UNIT - 1}px,
                                rgba(255,255,255,0.02) ${UNIT}px
                            ),
                            repeating-linear-gradient(to bottom,
                                transparent,
                                transparent ${UNIT - 1}px,
                                rgba(255,255,255,0.02) ${UNIT - 1}px,
                                rgba(255,255,255,0.02) ${UNIT}px
                            )
                        `,
                        backgroundSize: `${UNIT}px ${UNIT}px`
                    }}
                />

                {/* Secondary Grid - Solid lines */}
                <div className="absolute inset-0"
                    style={{
                        backgroundImage: `
                            linear-gradient(to right, rgba(255,255,255,0.035) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255,255,255,0.035) 1px, transparent 1px)
                        `,
                        backgroundSize: `${LARGE_UNIT}px ${LARGE_UNIT}px`
                    }}
                />

                {/* Accent Lines - Diagonal */}
                <div className="absolute inset-0"
                    style={{
                        backgroundImage: `
                            repeating-linear-gradient(45deg,
                                transparent,
                                transparent ${LARGE_UNIT * Math.SQRT2 - 1}px,
                                rgba(255,255,255,0.015) ${LARGE_UNIT * Math.SQRT2 - 1}px,
                                rgba(255,255,255,0.015) ${LARGE_UNIT * Math.SQRT2}px
                            ),
                            repeating-linear-gradient(-45deg,
                                transparent,
                                transparent ${LARGE_UNIT * Math.SQRT2 - 1}px,
                                rgba(255,255,255,0.015) ${LARGE_UNIT * Math.SQRT2 - 1}px,
                                rgba(255,255,255,0.015) ${LARGE_UNIT * Math.SQRT2}px
                            )
                        `,
                        backgroundSize: `${LARGE_UNIT * 2}px ${LARGE_UNIT * 2}px`
                    }}
                />

                {/* Corner Accents */}
                <div className="absolute inset-0"
                    style={{
                        backgroundImage: `
                            radial-gradient(circle at center, rgba(255,255,255,0.05) 1px, transparent 1px)
                        `,
                        backgroundSize: `${LARGE_UNIT * 2}px ${LARGE_UNIT * 2}px`
                    }}
                />
            </div>
        </div>
    );
} 