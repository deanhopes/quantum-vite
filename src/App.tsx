import { Suspense } from 'react';
import { QuantumLoader } from './components/QuantumLoader';
import QuantumScene from './components/QuantumScene';

function App() {
  return (
    <main className="w-full min-h-screen">
      <QuantumLoader>
        <Suspense fallback={<div className="fixed inset-0 bg-quantum-black" />}>
          <QuantumScene />
        </Suspense>
      </QuantumLoader>
    </main>
  );
}

export default App;
