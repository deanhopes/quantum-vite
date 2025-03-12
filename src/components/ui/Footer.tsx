import {MagneticButton} from "../MagneticButton"

const Footer = () => {
    return (
        <div className='absolute bottom-0 w-full border-t border-white/10 z-10'>
            <div className='container mx-auto px-16 py-24'>
                <div className='grid grid-cols-12 gap-16'>
                    {/* Logo Column */}
                    <div className='col-span-3 space-y-8'>
                        <img
                            src='/ctrlz-logo.svg'
                            alt='CTRL-Z'
                            className='w-32 opacity-80'
                        />
                        <p className='font-input text-[10px] text-white/40 leading-relaxed'>
                            QUANTUM STATE MANIPULATION SYSTEM v2.0.38
                            <br />
                            APPROVED FOR CIVILIAN TIME-STREAM NAVIGATION
                        </p>
                    </div>

                    {/* Navigation Columns */}
                    <div className='col-span-6 grid grid-cols-3 gap-8'>
                        {/* Products */}
                        <div className='flex flex-col'>
                            <div className='flex items-center gap-2 mb-6'>
                                <div className='w-1 h-1 bg-white/20 rotate-45'></div>
                                <p className='font-input text-[10px] text-white/60'>
                                    PRODUCTS
                                </p>
                            </div>
                            <div className='flex flex-col gap-4'>
                                <div className='relative group cursor-pointer inline-block'>
                                    <div className='relative inline-block'>
                                        <span className='font-input text-[10px] text-white/40 group-hover:text-white/90 transition-colors'>
                                            QUANTUM SHIFT
                                        </span>
                                        <span className='absolute bottom-0 right-0 w-0 h-[1px] bg-white/40 group-hover:w-full transition-all duration-300 origin-right'></span>
                                    </div>
                                </div>
                                <div className='relative group cursor-pointer inline-block'>
                                    <div className='relative inline-block'>
                                        <span className='font-input text-[10px] text-white/40 group-hover:text-white/90 transition-colors'>
                                            TIMELINE SYNC
                                        </span>
                                        <span className='absolute bottom-0 right-0 w-0 h-[1px] bg-white/40 group-hover:w-full transition-all duration-300 origin-right'></span>
                                    </div>
                                </div>
                                <div className='relative group cursor-pointer inline-block'>
                                    <div className='relative inline-block'>
                                        <span className='font-input text-[10px] text-white/40 group-hover:text-white/90 transition-colors'>
                                            REALITY ANCHOR
                                        </span>
                                        <span className='absolute bottom-0 right-0 w-0 h-[1px] bg-white/40 group-hover:w-full transition-all duration-300 origin-right'></span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Company */}
                        <div className='flex flex-col'>
                            <div className='flex items-center gap-2 mb-6'>
                                <div className='w-1 h-1 bg-white/20 rotate-45'></div>
                                <p className='font-input text-[10px] text-white/60'>
                                    COMPANY
                                </p>
                            </div>
                            <div className='flex flex-col gap-4'>
                                <div className='relative group cursor-pointer inline-block'>
                                    <div className='relative inline-block'>
                                        <span className='font-input text-[10px] text-white/40 group-hover:text-white/90 transition-colors'>
                                            ABOUT US
                                        </span>
                                        <span className='absolute bottom-0 right-0 w-0 h-[1px] bg-white/40 group-hover:w-full transition-all duration-300 origin-right'></span>
                                    </div>
                                </div>
                                <div className='relative group cursor-pointer inline-block'>
                                    <div className='relative inline-block'>
                                        <span className='font-input text-[10px] text-white/40 group-hover:text-white/90 transition-colors'>
                                            CAREERS
                                        </span>
                                        <span className='absolute bottom-0 right-0 w-0 h-[1px] bg-white/40 group-hover:w-full transition-all duration-300 origin-right'></span>
                                    </div>
                                </div>
                                <div className='relative group cursor-pointer inline-block'>
                                    <div className='relative inline-block'>
                                        <span className='font-input text-[10px] text-white/40 group-hover:text-white/90 transition-colors'>
                                            CONTACT
                                        </span>
                                        <span className='absolute bottom-0 right-0 w-0 h-[1px] bg-white/40 group-hover:w-full transition-all duration-300 origin-right'></span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Legal */}
                        <div className='flex flex-col'>
                            <div className='flex items-center gap-2 mb-6'>
                                <div className='w-1 h-1 bg-white/20 rotate-45'></div>
                                <p className='font-input text-[10px] text-white/60'>
                                    LEGAL
                                </p>
                            </div>
                            <div className='flex flex-col gap-4'>
                                <div className='relative group cursor-pointer inline-block'>
                                    <div className='relative inline-block'>
                                        <span className='font-input text-[10px] text-white/40 group-hover:text-white/90 transition-colors'>
                                            PRIVACY
                                        </span>
                                        <span className='absolute bottom-0 right-0 w-0 h-[1px] bg-white/40 group-hover:w-full transition-all duration-300 origin-right'></span>
                                    </div>
                                </div>
                                <div className='relative group cursor-pointer inline-block'>
                                    <div className='relative inline-block'>
                                        <span className='font-input text-[10px] text-white/40 group-hover:text-white/90 transition-colors'>
                                            TERMS
                                        </span>
                                        <span className='absolute bottom-0 right-0 w-0 h-[1px] bg-white/40 group-hover:w-full transition-all duration-300 origin-right'></span>
                                    </div>
                                </div>
                                <div className='relative group cursor-pointer inline-block'>
                                    <div className='relative inline-block'>
                                        <span className='font-input text-[10px] text-white/40 group-hover:text-white/90 transition-colors'>
                                            TIMELINE POLICY
                                        </span>
                                        <span className='absolute bottom-0 right-0 w-0 h-[1px] bg-white/40 group-hover:w-full transition-all duration-300 origin-right'></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CTA Column */}
                    <div className='col-span-3 space-y-8'>
                        <div className='flex items-center gap-2'>
                            <div className='w-1 h-1 bg-white/20 rotate-45'></div>
                            <p className='font-input text-[10px] text-white/60'>
                                INITIATE CONTACT
                            </p>
                        </div>
                        <MagneticButton
                            className='cta-button hover-highlight group relative w-full'
                            strength={0.5}
                            radius={100}
                        >
                            <span className='relative z-10 text-white/90 text-[10px]'>
                                REQUEST ACCESS
                            </span>
                        </MagneticButton>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className='mt-24 pt-8 border-t border-white/5 flex justify-between items-center'>
                    <div className='font-input text-[8px] text-white/40'>
                        © 2038 CTRL-Z. ALL TIMELINES RESERVED.
                    </div>
                    <div className='flex items-center gap-2 text-[8px] font-input text-white/40'>
                        <div>HASH: 0xZ9Y8</div>
                        <div className='ml-4'>REV: 5.0.1</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Footer
