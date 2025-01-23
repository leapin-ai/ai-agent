import { useState, useEffect } from 'react';

const Countdown = ({ time, onComplete }) => {
  const [current, setCurrent] = useState(time || 60);
  const minute = Math.max(Math.floor(current / 60), 0),
    second = Math.max(current % 60, 0);
  useEffect(() => {
    const nextTick = () => {
      setCurrent(current => {
        if (current <= 0) {
          clearInterval(timer);
          onComplete && onComplete();
          return current;
        }
        return current - 1;
      });
    };
    const timer = setInterval(nextTick, 1000);
    return () => {
      clearInterval(timer);
    };
  }, []);
  return `${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`;
};

export default Countdown;
