import { useState, Suspense } from 'react';
import { QuantumLoader } from './components/QuantumLoader';
import PageContent from './components/PageContent';
import QuantumScene from './components/QuantumScene';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);

  // Handle the loading sequence
  const handleLoadComplete = () => {
    setIsLoading(false);
    // Scene starts fading in
    setSceneReady(true);
    // Add a delay before showing content to allow scene animation
    setTimeout(() => setShowContent(true), 4000);
  };

  return (
    <main className="relative w-full h-screen">
      {/* Quantum Scene (fixed background) */}
      <div className={`fixed inset-0 z-0 transition-opacity duration-1000 
                ${sceneReady ? 'opacity-100' : 'opacity-0'}`}>
        <Suspense fallback={null}>
          <QuantumScene />
        </Suspense>
      </div>

      {/* Loader */}
      <div className={`fixed inset-0 z-50 transition-opacity duration-500
                ${isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <QuantumLoader onLoadComplete={handleLoadComplete}>
          <div /> {/* Empty div as children */}
        </QuantumLoader>
      </div>

      {/* Page Content */}
      <div className={`relative z-10 transition-all duration-1000 
                ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
                ${showContent ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <PageContent />
      </div>
      {/* Prevent scroll during loading */}
      <style jsx global>{`
        body {
          overflow: ${showContent ? 'auto' : 'hidden'};
          margin: 0;
          padding: 0;
        }
      `}</style>
    </main>
  );
}
