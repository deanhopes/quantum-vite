import { useState, useEffect } from "react"
import QuantumPage from "./components/QuantumPage"
import { QuantumLoader } from "./components/QuantumLoader"
import { Leva } from 'leva'

function App() {
    const [isLoading, setIsLoading] = useState(true)

    // Control scroll behavior
    useEffect(() => {
        if (isLoading) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [isLoading])

    return (
        <>
            <Leva />
            <main className='relative'>
                {isLoading && (
                    <QuantumLoader onLoadComplete={() => setIsLoading(false)} />
                )}
                <QuantumPage isLoading={isLoading} />
            </main>
        </>
    )
}

export default App
