import { useEffect, useState, useCallback } from "react";

export function useKeyboard({ enabled = true, preventDefault = true } = {}) {
  const [pressedKeys, setPressedKeys] = useState<string[]>([]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;
    if (preventDefault) e.preventDefault();
    const key = e.key.toLowerCase();
    setPressedKeys(prev => prev.includes(key) ? prev : [...prev, key]);
  }, [enabled, preventDefault]);

  const reset = useCallback(() => setPressedKeys([]), []);
  const removeKey = useCallback((k: string) => setPressedKeys(prev => prev.filter(x => x !== k)), []);

  useEffect(() => {
    if (!enabled) return;
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled, handleKeyDown]);

  return { pressedKeys, setPressedKeys, reset, removeKey };
}
