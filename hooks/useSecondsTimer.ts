import { useEffect, useRef, useState } from "react";

const useSecondsTimer = (start: number): [number, () => void, () => void] => {
  const [seconds, setSeconds] = useState(start);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    startTimer();

    // Cleanup on unmount
    return () => stopTimer();
  }, []);

  useEffect(() => {
    if (seconds === 0) {
      stopTimer();
    }
  }, [seconds]);

  const startTimer = () => {
    stopTimer(); // Prevent multiple intervals
    intervalRef.current = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const resetTimer = () => {
    stopTimer();
    setSeconds(start);
    startTimer();
  };

  return [seconds, resetTimer, stopTimer];
};

export default useSecondsTimer;
