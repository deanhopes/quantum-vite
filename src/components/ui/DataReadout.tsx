interface DataReadoutProps {
    label: string
    value: string
}

export function DataReadout({label, value}: DataReadoutProps) {
    return (
        <div className='text-center'>
            <div className='technical-readout text-[10px] tracking-[0.5em] text-white/40 mb-4'>
                {label}
            </div>
            <div className='text-white/90 font-mono text-2xl'>{value}</div>
        </div>
    )
}
