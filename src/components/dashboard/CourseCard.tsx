"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Info, Star } from 'lucide-react'; // Added Star icon
// PurchaseCourseDialog endi CourseCard dan chaqirilmaydi
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useNavigate } from 'react-router-dom';
import { format, addDays } from 'date-fns';
import { useCountdown } from '@/hooks/useCountdown';
import { Badge } from "@/components/ui/badge";
import ReviewFormDialog from '../courses/ReviewFormDialog'; // Import ReviewFormDialog

interface CourseCardProps {
  id: string;
  imageSrc: string;
  title: string;
  description: string;
  category: string;
  level?: string;
  instructor?: string;
  progress?: number;
  lessonsCompleted?: number;
  totalLessons?: number;
  price: number;
  isPurchased?: boolean;
  purchasedAt?: string;
  durationDays?: number;
  partsCount?: number;
  lessonsCount?: number;
  averageRating?: number; // New prop for average rating
  reviewCount?: number; // New prop for review count
  discountPercentage?: number; // New prop for discount percentage
  onPurchaseSuccess?: () => void;
  onReviewSubmitted?: () => void; // New prop for review submission callback
  hasUserReviewed?: boolean; // NEW: Prop to indicate if the user has already reviewed
}

const CourseCard: React.FC<CourseCardProps> = ({
  id,
  imageSrc,
  title,
  description,
  category,
  level,
  instructor,
  progress = 0,
  lessonsCompleted = 0,
  totalLessons = 0,
  price,
  isPurchased = false,
  purchasedAt,
  durationDays = 30,
  partsCount,
  lessonsCount,
  averageRating = 0, // Default to 0
  reviewCount = 0, // Default to 0
  discountPercentage = 0, // Default to 0
  onPurchaseSuccess,
  onReviewSubmitted,
  hasUserReviewed = false, // Default to false
}) => {
  // isPurchaseDialogOpen state endi bu yerda ishlatilmaydi
  const [isDescriptionDialogOpen, setIsDescriptionDialogOpen] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false); // State for review dialog
  const navigate = useNavigate();

  const { days, hours, minutes, seconds, isExpired } = useCountdown(purchasedAt, durationDays);

  const expirationDateFormatted = purchasedAt && durationDays
    ? format(addDays(new Date(purchasedAt), durationDays), 'dd.MM.yyyy')
    : null;

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-4 w-4 ${i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
        />
      );
    }
    return stars;
  };

  const discountedPrice = discountPercentage > 0 ? price * (1 - discountPercentage / 100) : price;

  return (
    <Card className="relative group overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
      <CardHeader className="p-0">
        <div className="relative h-40">
          <img src={imageSrc || "https://placehold.co/400x160/FF2800/FFFFFF?text=Kurs+Rasmi"} alt={title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent group-hover:from-black/70 transition-all duration-300"></div>
          <div className="absolute bottom-4 left-4">
            <span className="text-xs font-medium text-white px-3 py-1 bg-ferrari-red rounded-full">{category}</span>
          </div>
          {discountPercentage > 0 && (
            <div className="absolute top-4 right-4 bg-yellow-400 text-gray-900 text-sm font-bold px-3 py-1 rounded-full shadow-md">
              -{discountPercentage}%
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <CardTitle className="text-xl font-bold text-gray-800 leading-tight line-clamp-2">{title}</CardTitle>
        <p className="text-sm text-gray-600 line-clamp-3">{description}</p>

        {/* Rating and Review Count */}
        <div className="flex items-center mt-2">
          <div className="flex items-center">
            {renderStars(Math.round(averageRating))}
            <span className="ml-2 text-sm font-semibold text-gray-700">{averageRating.toFixed(1)}</span>
          </div>
          <span className="ml-3 text-sm text-gray-500">({reviewCount} izoh)</span>
        </div>

        {!isPurchased && (
          <div className="mt-2">
            {discountPercentage > 0 && (
              <p className="text-sm text-gray-500 line-through">{price.toLocaleString()} UZS</p>
            )}
            <p className="text-3xl font-extrabold text-ferrari-red">
              {discountedPrice.toLocaleString()} UZS
            </p>
          </div>
        )}
        {isPurchased && (
          <div className="space-y-2 mt-2">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Darslar: <span className="font-semibold">{lessonsCompleted}/{totalLessons}</span></span>
              <span>Progress: <span className="font-semibold">{progress}%</span></span>
            </div>
            <Progress value={progress} className="h-2 bg-gray-200 [&::-webkit-progress-bar]:bg-ferrari-red [&::-webkit-progress-value]:bg-ferrari-red" />
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 border-t flex flex-col space-y-3">
        {isPurchased ? (
          <>
            <div className="flex justify-between w-full items-center">
              <Badge className="bg-green-500 text-white text-sm px-3 py-1 rounded-full">Sotib olingan!</Badge>
              <div className="flex space-x-2">
                <Button variant="outline" size="icon" className="border-ferrari-red text-ferrari-red hover:bg-ferrari-red hover:text-white" onClick={() => setIsDescriptionDialogOpen(true)}>
                  <Info className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className={`${hasUserReviewed ? 'border-gray-400 text-gray-400 bg-gray-100 cursor-not-allowed' : 'border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white'}`}
                  onClick={() => !hasUserReviewed && setIsReviewDialogOpen(true)}
                  disabled={hasUserReviewed}
                >
                  <Star className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <Button
              className="w-full py-2.5 text-white font-semibold rounded-lg bg-ferrari-red hover:bg-red-700 transition duration-200 text-base"
              onClick={() => navigate(`/courses/${id}`)}
              disabled={isExpired}
            >
              {progress > 0 ? "Davom Ettirish" : "Boshlash"}
            </Button>
          </>
        ) : (
          <Button
            className="w-full py-2.5 text-white font-semibold rounded-lg bg-ferrari-red hover:bg-red-700 transition duration-200 text-base"
            onClick={() => navigate(`/courses/${id}`)} // Kurs tafsilotlari sahifasiga o'tish
          >
            Kursni ko'rish
          </Button>
        )}
      </CardFooter>

      {/* PurchaseCourseDialog endi bu yerda ishlatilmaydi */}

      <ReviewFormDialog
        isOpen={isReviewDialogOpen}
        onClose={() => setIsReviewDialogOpen(false)}
        courseId={id}
        courseTitle={title}
        onReviewSubmitted={() => {
          onReviewSubmitted?.(); // Call the callback to refresh course data
        }}
      />

      <Dialog open={isDescriptionDialogOpen} onOpenChange={setIsDescriptionDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-ferrari-red">{title} haqida</DialogTitle>
            <DialogDescription>
              Kursning to'liq tavsifi.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-700 whitespace-pre-wrap">{description}</p>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default CourseCard;