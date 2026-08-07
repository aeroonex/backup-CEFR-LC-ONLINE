"use client";

import { useEffect, useState } from 'react';
import { differenceInSeconds, addDays } from 'date-fns';

interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

export const useCountdown = (purchasedAt: string | undefined, durationDays: number): Countdown => {
  const calculateTimeLeft = () => {
    if (!purchasedAt || !durationDays) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
    }

    const purchaseDate = new Date(purchasedAt);
    const expirationDate = addDays(purchaseDate, durationDays);
    const now = new Date();

    const totalSeconds = differenceInSeconds(expirationDate, now);

    if (totalSeconds <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
    }

    const days = Math.floor(totalSeconds / (60 * 60 * 24));
    const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    return { days, hours, minutes, seconds, isExpired: false };
  };

  const [timeLeft, setTimeLeft] = useState<Countdown>(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [purchasedAt, durationDays]);

  return timeLeft;
};