import QuantumPage from "./components/QuantumPage"
import { Leva } from 'leva'

function App() {
    return (
        <>
            <Leva hidden />
            <main className='relative'>
                <QuantumPage />
            </main>
        </>
    )
}

export default App
