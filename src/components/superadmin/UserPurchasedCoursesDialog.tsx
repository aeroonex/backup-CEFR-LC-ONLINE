"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import { format } from 'date-fns';

interface CourseDetails {
  id: string;
  title: string;
  image_url: string | null;
  price: number;
}

// New interface to explicitly define the expected structure from Supabase select
interface SupabaseUserCourseData {
  purchased_at: string;
  price_at_purchase: number;
  courses: CourseDetails | null; // Corrected to be a single object or null
}

interface Course {
  id: string;
  title: string;
  image_url: string;
  price: number;
  purchased_at: string;
}

interface UserPurchasedCoursesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
  username: string;
}

const UserPurchasedCoursesDialog: React.FC<UserPurchasedCoursesDialogProps> = ({
  isOpen,
  onClose,
  userId,
  username,
}) => {
  const [purchasedCourses, setPurchasedCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPurchasedCourses = useCallback(async () => {
    if (!userId) {
      setPurchasedCourses([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_courses')
        .select(`
          purchased_at,
          price_at_purchase,
          courses (
            id,
            title,
            image_url,
            price
          )
        `)
        .eq('user_id', userId)
        .order('purchased_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Explicitly cast data to any[] before filtering and mapping
      const rawData: any[] | null = data;

      const courses = (rawData || [])
        .filter((item): item is SupabaseUserCourseData & { courses: CourseDetails } => item.courses !== null)
        .map(item => ({
          id: item.courses.id,
          title: item.courses.title,
          image_url: item.courses.image_url || "https://placehold.co/100x60/FF2800/FFFFFF?text=Kurs",
          price: item.price_at_purchase, // Use price_at_purchase for historical accuracy
          purchased_at: item.purchased_at,
        }));
      setPurchasedCourses(courses);
    } catch (error: any) {
      console.error("Foydalanuvchi kurslarini yuklashda xato:", error);
      showError(`Kurslarni yuklashda xato: ${error.message || "Noma'lum xato"}`);
      setPurchasedCourses([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (isOpen) {
      fetchPurchasedCourses();
    }
  }, [isOpen, fetchPurchasedCourses]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col" aria-describedby="purchased-courses-description">
        <DialogHeader>
          <DialogTitle className="text-ferrari-red">{username} sotib olgan kurslar</DialogTitle>
          <DialogDescription id="purchased-courses-description">
            Bu foydalanuvchi tomonidan sotib olingan barcha kurslar ro'yxati.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 pr-4 -mr-4"> {/* ScrollArea for content */}
          <div className="py-4 space-y-4">
            {isLoading ? (
              <p className="text-center text-gray-500">Kurslar yuklanmoqda...</p>
            ) : purchasedCourses.length === 0 ? (
              <p className="text-center text-gray-500">Bu foydalanuvchi hali kurs sotib olmagan.</p>
            ) : (
              purchasedCourses.map((course) => (
                <Card key={course.id} className="flex items-center p-3 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <img src={course.image_url} alt={course.title} className="w-20 h-12 object-cover rounded-md mr-4 flex-shrink-0" />
                  <div className="flex-grow">
                    <CardTitle className="text-base font-semibold text-gray-900">{course.title}</CardTitle>
                    <p className="text-sm text-gray-600">Narxi: <span className="font-bold text-ferrari-red">{course.price.toLocaleString()} UZS</span></p>
                    <p className="text-xs text-gray-500">Sotib olingan: {format(new Date(course.purchased_at), 'dd.MM.yyyy HH:mm')}</p>
                  </div>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default UserPurchasedCoursesDialog;