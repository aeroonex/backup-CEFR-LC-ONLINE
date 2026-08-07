"use client";

// Soniyalarni Hh Mm Ss formatiga o'tkazish uchun yordamchi funksiya
export const formatTime = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  let formatted = '';
  if (hours > 0) formatted += `${hours} soat `;
  if (minutes > 0) formatted += `${minutes} daqiqa `;
  if (seconds > 0 || formatted === '') formatted += `${seconds} soniya`; // Agar soat/daqiqa bo'lmasa yoki 0 bo'lsa, soniyani ko'rsatish

  return formatted.trim();
};