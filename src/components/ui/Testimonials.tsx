import React from 'react'
import { InteractiveGrid } from './InteractiveGrid'

const Testimonials: React.FC = () => {
    return (
        <section className='testimonial-section relative min-h-screen flex items-center justify-center py-24'>
            {/* Grid Background */}
            <div className='absolute inset-0 -z-10'>
                <InteractiveGrid />
            </div>

            <div className='container mx-auto grid grid-cols-12 gap-8 px-8 relative z-10'>
                {/* Left side - Field Reports */}
                <div className='col-span-6 border-l border-white/10 pl-8'>
                    <div className='flex items-center gap-4 mb-8'>
                        <div className='w-2 h-2 bg-white/20 rotate-45'></div>
                        <p className='font-input text-[8px]'>
                            FIELD REPORTS
                        </p>
                        <div className='ml-auto text-[8px] font-input text-green-500/60'>
                            VERIFIED
                        </div>
                    </div>
                    <h2 className='animate-text font-[PPEditorialOld] text-white/95 text-[3.5vw] leading-[1.1] mb-16'>
                        When we first introduced quantum-state
                        manipulation in beverage form, they
                        called us impossible.
                        <br />
                        <br />
                        88 billion successful reality shifts
                        later, they call us revolutionary.
                    </h2>
                    <div className='w-12 h-[1px] bg-white/10 my-4'></div>
                    <div className='flex items-center gap-2 text-[8px] font-input text-white/40'>
                        <div>HASH: 0xR4S5</div>
                        <div className='ml-auto'>
                            REV: 3.5.0
                        </div>
                    </div>
                </div>

                {/* Right side - Testimonials */}
                <div className='col-span-5 col-start-8 space-y-12'>
                    {/* Testimonial 1 */}
                    <div className='border-l border-white/10 pl-8'>
                        <div className='flex items-center gap-4 mb-4'>
                            <div className='w-2 h-2 bg-white/20 rotate-45'></div>
                            <p className='font-input text-[8px]'>
                                USER TESTIMONIAL
                            </p>
                            <div className='ml-auto text-[8px] font-input text-white/40'>
                                ID:UT-001
                            </div>
                        </div>

                        <div className='border border-white/5 bg-white/5 p-4'>
                            <div className='flex mb-4'>
                                {Array.from(
                                    {length: 5},
                                    (_, index) => (
                                        <span
                                            key={index}
                                            className='text-white/80 text-xl'
                                        >
                                            ★
                                        </span>
                                    )
                                )}
                            </div>
                            <p className='font-sans text-[1rem] font-light leading-[1.4] text-white/60'>
                                "Yesterday, I made the worst
                                presentation of my career. Or I
                                would have, if CTRL-Z hadn't
                                helped me find the timeline
                                where I remembered to actually
                                save my slides."
                            </p>
                        </div>
                        <div className='w-12 h-[1px] bg-white/10 my-4'></div>
                        <div className='flex items-center gap-2 text-[8px] font-input text-white/40'>
                            <div>HASH: 0xT3U4</div>
                            <div className='ml-auto'>
                                REV: 1.2.3
                            </div>
                        </div>
                    </div>

                    {/* Testimonial 2 */}
                    <div className='border-l border-white/10 pl-8'>
                        <div className='flex items-center gap-4 mb-4'>
                            <div className='w-2 h-2 bg-white/20 rotate-45'></div>
                            <p className='font-input text-[8px]'>
                                USER TESTIMONIAL
                            </p>
                            <div className='ml-auto text-[8px] font-input text-white/40'>
                                ID:UT-002
                            </div>
                        </div>

                        <div className='border border-white/5 bg-white/5 p-4'>
                            <div className='flex mb-4'>
                                {Array.from(
                                    {length: 5},
                                    (_, index) => (
                                        <span
                                            key={index}
                                            className='text-white/80 text-xl'
                                        >
                                            ★
                                        </span>
                                    )
                                )}
                            </div>
                            <p className='font-sans text-[1rem] font-light leading-[1.4] text-white/60'>
                                "Lost my wedding ring at the
                                beach. One sip of CTRL-Z and I
                                was back in the timeline where I
                                remembered to take it off before
                                swimming. Life-saver!"
                            </p>
                        </div>
                        <div className='w-12 h-[1px] bg-white/10 my-4'></div>
                        <div className='flex items-center gap-2 text-[8px] font-input text-white/40'>
                            <div>HASH: 0xV2W3</div>
                            <div className='ml-auto'>
                                REV: 2.4.1
                            </div>
                        </div>
                    </div>

                    {/* Testimonial 3 */}
                    <div className='border-l border-white/10 pl-8'>
                        <div className='flex items-center gap-4 mb-4'>
                            <div className='w-2 h-2 bg-white/20 rotate-45'></div>
                            <p className='font-input text-[12px]'>
                                USER TESTIMONIAL
                            </p>
                            <div className='ml-auto text-[8px] font-input text-white/40'>
                                ID:UT-003
                            </div>
                        </div>

                        <div className='border border-white/5 bg-white/5 p-4'>
                            <div className='flex mb-4'>
                                {Array.from(
                                    {length: 5},
                                    (_, index) => (
                                        <span
                                            key={index}
                                            className='text-white/80 text-xl'
                                        >
                                            ★
                                        </span>
                                    )
                                )}
                            </div>
                            <p className='font-sans text-[1rem] font-light leading-[1.4] text-white/60'>
                                "Sent an email to the entire
                                company instead of just my team.
                                CTRL-Z helped me find the
                                reality where I double-checked
                                the recipient list. Worth every
                                penny."
                            </p>
                        </div>
                        <div className='w-12 h-[1px] bg-white/10 my-4'></div>
                        <div className='flex items-center gap-2 text-[8px] font-input text-white/40'>
                            <div>HASH: 0xX1Y2</div>
                            <div className='ml-auto'>
                                REV: 1.7.2
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Gradient Overlay */}
            <div
                className='absolute inset-0 z-[5] pointer-events-none'
                style={{
                    background:
                        "linear-gradient(180deg, transparent 0%, transparent 85%, black 100%)",
                }}
            />
        </section>
    )
}

export default Testimonials 