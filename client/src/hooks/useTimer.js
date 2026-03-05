import { useState, useEffect, useRef, useCallback } from 'react';

export function useTimer(startImmediately = false) {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(startImmediately);
  const startTimeRef = useRef(null);
  const intervalRef = useRef(null);

  const start = useCallback(() => {
    startTimeRef.current = Date.now() - elapsed;
    setRunning(true);
  }, [elapsed]);

  const stop = useCallback(() => {
    setRunning(false);
  }, []);

  const reset = useCallback(() => {
    setRunning(false);
    setElapsed(0);
    startTimeRef.current = null;
  }, []);

  const startFrom = useCallback((serverStartTime) => {
    startTimeRef.current = serverStartTime;
    setElapsed(Date.now() - serverStartTime);
    setRunning(true);
  }, []);

  useEffect(() => {
    if (running) {
      if (startTimeRef.current === null) {
        startTimeRef.current = Date.now();
      }
      intervalRef.current = setInterval(() => {
        setElapsed(Date.now() - startTimeRef.current);
      }, 100);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  return { elapsed, running, start, stop, reset, startFrom };
}
