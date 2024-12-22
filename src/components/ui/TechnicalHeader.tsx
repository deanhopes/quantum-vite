import React from 'react'

interface TechnicalHeaderProps {
    text: string
}

export const TechnicalHeader: React.FC<TechnicalHeaderProps> = ({ text }) => (
    <div className='technical-readout text-[10px] tracking-[0.5em] text-white/40 mb-8 group relative px-8'>
        <div className='absolute -left-2 top-1/2 w-2 h-[1px] bg-white/20 transform -translate-y-1/2 scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100 transition-all duration-300'></div>
        <span className='relative'>
            {text}
            <div className='absolute left-0 bottom-0 w-0 h-[1px] bg-white/20 opacity-0 group-hover:w-full group-hover:opacity-100 transition-all duration-500 delay-200'></div>
        </span>
    </div>
) 