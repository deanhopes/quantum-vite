import { lazy, Suspense } from 'react';

const Scene = lazy(() => import('./Scene'));

export default function QuantumScene() {
  return (
    <Suspense fallback={<div className="fixed inset-0 bg-quantum-black" />}>
      <Scene />
    </Suspense>
  );
} 