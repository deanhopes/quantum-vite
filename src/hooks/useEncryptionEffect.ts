import { useCallback } from 'react';

export function useEncryptionEffect() {
  const createEncryptionEffect = useCallback((
    element: HTMLDivElement,
    onComplete: () => void
  ) => {
    const originalText = element.textContent || "";
    const glitchChars = "!<>-_\\/[]{}—=+*^?#_$%&@";
    const encryptionSpeed = 20;
    let iterations = 0;

    const interval = setInterval(() => {
      element.textContent = originalText
        .split("")
        .map((char, index) => {
          if (index < iterations) return originalText[index];
          return glitchChars[Math.floor(Math.random() * glitchChars.length)];
        })
        .join("");

      iterations += 1 / 2;

      if (iterations >= originalText.length) {
        clearInterval(interval);
        element.textContent = originalText;
        onComplete();
      }
    }, encryptionSpeed);

    return () => clearInterval(interval);
  }, []);

  return { createEncryptionEffect };
} 