"use client";

import React from 'react';
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface CourseStatsCardProps {
  purchasedCoursesCount: number;
}

const CourseStatsCard: React.FC<CourseStatsCardProps> = ({ purchasedCoursesCount }) => {
  const navigate = useNavigate();
  return (
    <Card className="glass-card p-6 oval flex flex-col items-center justify-center">
      <CardTitle className="text-red-600 font-semibold">Kurslar Statistikasi</CardTitle>
      <div className="text-5xl font-extrabold mt-2 text-gray-900">{purchasedCoursesCount}</div>
      <Button variant="link" className="mt-4 pill text-white bg-ferrari-red hover:bg-red-700" onClick={() => navigate("/courses")}>
        Ko‘rish &rarr;
      </Button>
    </Card>
  );
};

export default CourseStatsCard;