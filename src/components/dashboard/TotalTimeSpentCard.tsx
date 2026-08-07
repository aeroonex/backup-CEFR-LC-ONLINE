"use client";

import React from 'react';
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { formatTime } from '@/utils/formatters'; // Import formatTime utility

interface TotalTimeSpentCardProps {
  totalTimeSpentSeconds: number;
}

const TotalTimeSpentCard: React.FC<TotalTimeSpentCardProps> = ({ totalTimeSpentSeconds }) => {
  return (
    <Card className="glass-card p-6">
      <CardTitle className="text-red-600 font-semibold">Umumiy Sarflangan Vaqt</CardTitle>
      <p className="text-5xl font-extrabold mt-4 text-gray-900">{formatTime(totalTimeSpentSeconds || 0)}</p>
      <CardDescription className="text-sm text-gray-600 mt-2">Platformada o'tkazgan umumiy vaqtingiz.</CardDescription>
    </Card>
  );
};

export default TotalTimeSpentCard;