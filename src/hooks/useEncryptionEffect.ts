import { useCallback } from "react";

export function useEncryptionEffect() {
  const createEncryptionEffect = useCallback(
    (element: HTMLDivElement, onComplete: () => void) => {
      const originalText = element.textContent || "";
      const glitchChars = "⌭⎔⌬⌇⍡⌸⌹⌺⌻⌼⌽⌾⌿⍀⍁⍂⍃⍄⍅⍆⍇⍈⍉⍊⍋⍌⍍⍎⍏⍐⍑⍒⍓⍔⍕⍖⍗⍘⍙⍚⍛⍜⍝⍞⍟⍠⍡⍢⍣⍤⍥⍦⍧⍨⍩⍪⍫⍬⍭⍮⍯⍰⍱⍲⍳⍴⍵⍶⍷⍸⍹⍺⎈⎌⎍⎎⎏⎐⎑⎒⎓⎔⎕";
      const encryptionSpeed = Math.random() * 15 + 10;
      let iterations = 0;

      const interval = setInterval(() => {
        element.textContent = originalText
          .split("")
          .map((char, index) => {
            if (index < iterations) return originalText[index];
            if (Math.random() > 0.7) {
              return glitchChars[Math.floor(Math.random() * glitchChars.length)];
            }
            return char;
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
    },
    []
  );

  return { createEncryptionEffect };
}
