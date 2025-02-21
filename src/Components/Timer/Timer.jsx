
import React, { useEffect, useState } from "react";

const Timer = ({ timmer }) => {
  const [timeLeft, setTimeLeft] = useState("");
  useEffect(() => {
    if (timmer) {
      const targetTime = timmer * 1000; // Convert seconds to milliseconds

      const interval = setInterval(() => {
        const now = new Date().getTime(); // Current time in milliseconds
        const distance = targetTime - now; // Calculate the distance

        if (distance < 0) {
          clearInterval(interval);
          setTimeLeft("EXPIRED");
          return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        const formattedTime = `${days}D:${hours}H:${minutes}M:${seconds}S`;
        setTimeLeft(formattedTime);
      }, 1000);

      return () => clearInterval(interval); // Cleanup on unmount
    }
  }, [timmer]);
  return <div>{timeLeft}</div>;
};

export default Timer;
