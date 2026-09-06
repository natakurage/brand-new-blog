import { useEffect, useRef, useCallback } from "react";

export default function useTimeout(callback: () => void, delay: number) {
  
  const savedCallback = useRef(callback);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const set = useCallback(() => {
    clear();
    timerRef.current = setTimeout(() => {
      savedCallback.current();
    }, delay);
  }, [delay, clear]);

  useEffect(() => {
    return clear;
  }, [clear]);

  return { set, clear };
};