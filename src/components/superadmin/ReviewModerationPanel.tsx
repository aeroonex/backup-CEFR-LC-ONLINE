"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Star, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { format } from 'date-fns';

interface ProfileData {
  username: string;
}

interface CourseData {
  title: string;
}

interface Review {
  id: string;
  created_at: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  profiles: ProfileData | null;
  courses: CourseData | null;
}

// Define a raw data interface to match Supabase's direct return
interface RawReviewItem {
  id: string;
  created_at: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  profiles: { username: string | null } | null; // Corrected to be a single object or null
  courses: { title: string | null } | null;     // Corrected to be a single object or null
}

const ReviewModerationPanel: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('course_reviews')
        .select(`
          id,
          created_at,
          rating,
          comment,
          status,
          profiles (username),
          courses (title)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }
      
      // Map the raw data to the Review interface to ensure correct types
      const mappedReviews: Review[] = (data as any[] || []).map((item: any) => ({
        id: item.id,
        created_at: item.created_at,
        rating: item.rating,
        comment: item.comment,
        status: item.status,
        profiles: item.profiles ? { username: item.profiles.username || 'Noma\'lum foydalanuvchi' } : null,
        courses: item.courses ? { title: item.courses.title || 'Noma\'lum kurs' } : null,
      }));
      setReviews(mappedReviews);
    } catch (error: any) {
      console.error("Izohlarni yuklashda xato:", error);
      showError(`Izohlarni yuklashda xato: ${error.message || "Noma'lum xato"}`);
      setReviews([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleUpdateReviewStatus = async (reviewId: string, newStatus: 'approved' | 'rejected') => {
    setIsUpdating(true);
    const toastId = showLoading(`Izoh holati yangilanmoqda...`);
    try {
      const { error } = await supabase
        .from('course_reviews')
        .update({ status: newStatus })
        .eq('id', reviewId);

      if (error) {
        throw error;
      }
      showSuccess(`Izoh muvaffaqiyatli ${newStatus === 'approved' ? 'tasdiqlandi' : 'rad etildi'}!`);
      fetchReviews(); // Refresh the list
    } catch (error: any) {
      console.error("Izoh holatini yangilashda xato:", error);
      showError(`Holatni yangilashda xato: ${error.message || "Noma'lum xato"}`);
    } finally {
      dismissToast(toastId);
      setIsUpdating(false);
    }
  };

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

  if (isLoading) {
    return (
      <Card className="shadow-lg bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-foreground">Izohlarni Moderatsiya Qilish</CardTitle>
          <CardDescription className="text-muted-foreground">Izohlar yuklanmoqda...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-6">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg bg-card text-card-foreground">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-foreground">Izohlarni Moderatsiya Qilish</CardTitle>
        <CardDescription className="text-muted-foreground">
          Foydalanuvchilar tomonidan qoldirilgan kurs izohlarini ko'rib chiqing va tasdiqlang yoki rad eting.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {reviews.length === 0 ? (
          <p className="text-center text-muted-foreground">Hozircha izohlar mavjud emas.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-800 hover:bg-gray-700">
                  <TableHead className="rounded-tl-lg text-gray-100">Kurs</TableHead>
                  <TableHead className="text-gray-100">Foydalanuvchi</TableHead>
                  <TableHead className="text-gray-100">Reyting</TableHead>
                  <TableHead className="text-gray-100">Izoh</TableHead>
                  <TableHead className="text-gray-100">Holat</TableHead>
                  <TableHead className="text-gray-100">Sana</TableHead>
                  <TableHead className="rounded-tr-lg text-right text-gray-100">Amallar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.map((review) => (
                  <TableRow key={review.id} className="hover:bg-red-950 transition duration-150">
                    <TableCell className="font-medium text-foreground">{review.courses?.title || 'Noma\'lum kurs'}</TableCell>
                    <TableCell className="text-muted-foreground">{review.profiles?.username || 'Noma\'lum foydalanuvchi'}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {renderStars(review.rating)}
                        <span className="ml-2 text-sm text-gray-600">{review.rating}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-xs truncate">{review.comment}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          review.status === 'approved'
                            ? 'bg-green-500'
                            : review.status === 'rejected'
                            ? 'bg-red-500'
                            : 'bg-orange-500'
                        }
                      >
                        {review.status === 'approved' ? 'Tasdiqlangan' : review.status === 'rejected' ? 'Rad etilgan' : 'Kutilmoqda'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{format(new Date(review.created_at), 'dd.MM.yyyy HH:mm')}</TableCell>
                    <TableCell className="text-right flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleUpdateReviewStatus(review.id, 'approved')}
                        disabled={isUpdating || review.status === 'approved'}
                        className="text-green-500 hover:bg-green-100"
                      >
                        <CheckCircle2 className="h-5 w-5" />
                        <span className="sr-only">Tasdiqlash</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleUpdateReviewStatus(review.id, 'rejected')}
                        disabled={isUpdating || review.status === 'rejected'}
                        className="text-red-500 hover:bg-red-100"
                      >
                        <XCircle className="h-5 w-5" />
                        <span className="sr-only">Rad etish</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReviewModerationPanel;