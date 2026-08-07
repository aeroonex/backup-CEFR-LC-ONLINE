"use client";

import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, GraduationCap, DollarSign } from 'lucide-react'; // Icons for lessons, level, price

interface MarketingCourseCardProps {
  id: string;
  imageSrc: string;
  title: string;
  description: string;
  lessonsCount: string; // e.g., "120 dars"
  level: string; // e.g., "Oliy daraja"
  price: string; // e.g., "450 000 so‘m"
  buttonText: string; // e.g., "Sotib olish"
  onButtonClick: () => void;
}

const MarketingCourseCard: React.FC<MarketingCourseCardProps> = ({
  id,
  imageSrc,
  title,
  description,
  lessonsCount,
  level,
  price,
  buttonText,
  onButtonClick,
}) => {
  return (
    <Card className="overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 bg-white">
      <CardHeader className="p-0">
        <div className="relative h-40 sm:h-48"> {/* Rasm balandligi ixchamlashtirildi */}
          <img src={imageSrc} alt={title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 space-y-2 sm:space-y-3"> {/* Padding va space-y yanada ixchamlashtirildi */}
        <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 leading-tight line-clamp-2">{title}</CardTitle> {/* Sarlavha hajmi yanada ixchamlashtirildi */}
        <p className="text-xs text-gray-600 line-clamp-2">{description}</p> {/* Tavsif hajmi yanada ixchamlashtirildi va 2 qatorga cheklandi */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 text-gray-700"> {/* Gap yanada ixchamlashtirildi */}
          <div className="flex items-center space-x-1"> {/* Space-x yanada ixchamlashtirildi */}
            <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-ferrari-red" /> {/* Icon hajmi yanada ixchamlashtirildi */}
            <span className="font-medium text-xs sm:text-sm">{lessonsCount}</span> {/* Matn hajmi yanada ixchamlashtirildi */}
          </div>
          <div className="flex items-center space-x-1"> {/* Space-x yanada ixchamlashtirildi */}
            <GraduationCap className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" /> {/* Icon hajmi yanada ixchamlashtirildi */}
            <span className="font-medium text-xs sm:text-sm">{level}</span> {/* Matn hajmi yanada ixchamlashtirildi */}
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-3 sm:p-4 border-t flex flex-col space-y-2 sm:space-y-3"> {/* Padding va space-y yanada ixchamlashtirildi */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-1"> {/* Space-x yanada ixchamlashtirildi */}
            <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" /> {/* Icon hajmi yanada ixchamlashtirildi */}
            <span className="text-xl sm:text-2xl font-extrabold text-ferrari-red">{price}</span> {/* Narx hajmi yanada ixchamlashtirildi */}
          </div>
          <Button
            onClick={onButtonClick}
            className="bg-ferrari-red hover:bg-red-700 text-white text-sm px-3 py-1.5 sm:text-base sm:px-4 sm:py-2 rounded-lg shadow-md transition-colors" // Tugma hajmi yanada ixchamlashtirildi
          >
            {buttonText}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default MarketingCourseCard;