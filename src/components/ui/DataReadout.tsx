import React from 'react'

interface DataReadoutProps {
    label: string
    value: string
}

export const DataReadout: React.FC<DataReadoutProps> = ({ label, value }) => (
    <div className='technical-readout text-center group'>
        <div className='relative'>
            <div className='absolute -top-1 -left-1 w-2 h-2 border-t border-l border-white/20 transform scale-0 group-hover:scale-100 transition-transform duration-300'></div>
            <div className='absolute -top-1 -right-1 w-2 h-2 border-t border-r border-white/20 transform scale-0 group-hover:scale-100 transition-transform duration-300'></div>
            <div className='text-[10px] mb-2 opacity-60 tracking-[0.3em] uppercase relative'>
                {label}
                <div className='absolute left-0 bottom-0 w-0 h-[1px] bg-white/20 group-hover:w-full transition-all duration-500'></div>
            </div>
        </div>
        <div className='text-xl tracking-widest relative overflow-hidden group-hover:text-white/90 transition-colors duration-300'>
            {value}
            <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000'></div>
        </div>
    </div>
) 