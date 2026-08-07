"use client";

import React from 'react';
import { Card, CardContent, CardTitle } from "@/components/ui/card";

interface AchievementsCardProps {
  level: number;
  xp: number;
}

const AchievementsCard: React.FC<AchievementsCardProps> = ({ level, xp }) => {
  return (
    <Card className="glass-card p-6">
      <CardTitle className="text-red-600 font-semibold">Sizning Yutuqlaringiz</CardTitle>
      <div className="mt-4 flex items-center gap-4">
        <div className="text-4xl font-extrabold text-gray-900">{level}</div>
        <div className="flex-1">
          <div className="w-full bg-red-100 rounded-full h-3">
            <div className="bg-ferrari-red h-3 rounded-full" style={{ width: `${(xp % 100)}%` }}></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">Keyingi levelgacha: <span className="font-medium text-ferrari-red">{100 - (xp % 100)} XP</span></p>
        </div>
      </div>
    </Card>
  );
};

export default AchievementsCard;