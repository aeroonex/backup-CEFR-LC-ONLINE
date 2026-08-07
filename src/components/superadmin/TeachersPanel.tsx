"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const TeachersPanel: React.FC = () => {
  const teachers = [
    { id: '1', name: 'Alisher Bobojonov', subject: 'Ingliz tili (IELTS)', courses: 12, revenue: '32M UZS' },
    { id: '2', name: 'Mubina Alimova', subject: 'Matematika (SAT)', courses: 7, revenue: '18M UZS' },
    // Add more mock teachers as needed
  ];

  return (
    <Card className="shadow-lg bg-card text-card-foreground"> {/* Use semantic colors */}
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-foreground">Platformadagi Ustozlar Ro'yxati</CardTitle> {/* Use semantic colors */}
        <CardDescription className="text-muted-foreground">Ustozlar va ularning platformadagi faoliyati haqida ma'lumot.</CardDescription> {/* Use semantic colors */}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {teachers.map((teacher) => (
            <div key={teacher.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-xl shadow-md transition hover:bg-gray-700 border border-gray-700"> {/* Darker background and border */}
              <div className="flex items-center space-x-4">
                <Avatar className="w-12 h-12 bg-ferrari-red flex items-center justify-center text-white font-bold text-xl">
                  <AvatarFallback>{teacher.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-lg font-medium text-foreground">{teacher.name}</p> {/* Use semantic colors */}
                  <p className="text-sm text-muted-foreground">{teacher.subject}</p> {/* Use semantic colors */}
                </div>
              </div>
              <div className="text-right">
                <p className="text-green-500 font-semibold">{teacher.courses} ta Kurs</p> {/* Adjusted green shade */}
                <p className="text-sm text-muted-foreground">Jami daromadi: {teacher.revenue}</p> {/* Use semantic colors */}
              </div>
            </div>
          ))}
          <p className="text-center pt-4 text-gray-400">Ustozlarga qo'shimcha statistikani ko'rish uchun ularning ismiga bosing.</p> {/* Adjusted text color */}
        </div>
      </CardContent>
    </Card>
  );
};

export default TeachersPanel;