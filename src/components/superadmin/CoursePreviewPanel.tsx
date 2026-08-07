"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess, showLoading, dismissToast } from '@/utils/toast';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Trash2 } from 'lucide-react'; // Trash2 is now used for icon, not the button itself
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import LoadingSpinner from "@/components/ui/LoadingSpinner"; // Import LoadingSpinner
import CustomDeleteButton from '@/components/ui/CustomDeleteButton'; // Import new custom delete button

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  is_active: boolean; // New field
  sales_count?: number; // New field for sales count
}

const CoursePreviewPanel: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching courses for preview:", error);
      showError("Kurslarni yuklashda xato yuz berdi.");
      setCourses([]);
    } else {
      // Fetch sales count for each course
      const coursesWithSales = await Promise.all((data || []).map(async (course) => {
        const { count, error: countError } = await supabase
          .from('user_courses')
          .select('id', { count: 'exact', head: true })
          .eq('course_id', course.id);

        if (countError) {
          console.error(`Error fetching sales count for course ${course.id}:`, countError);
          return { ...course, sales_count: 0 };
        }
        return { ...course, sales_count: count || 0 };
      }));
      setCourses(coursesWithSales);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleToggleActive = async (courseId: string, currentStatus: boolean) => {
    setIsSubmitting(true);
    const toastId = showLoading(`Kurs holati yangilanmoqda...`);
    try {
      const { error } = await supabase
        .from('courses')
        .update({ is_active: !currentStatus })
        .eq('id', courseId);

      if (error) {
        throw error;
      }

      showSuccess(`Kurs holati muvaffaqiyatli yangilandi!`);
      fetchCourses(); // Refresh the list
    } catch (error: any) {
      console.error("Kurs holatini yangilashda xato:", error);
      showError(`Holatni yangilashda xato: ${error.message || "Noma'lum xato"}`);
    } finally {
      dismissToast(toastId);
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (course: Course) => {
    setCourseToDelete(course);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteCourse = async () => {
    if (!courseToDelete) return;

    setIsSubmitting(true);
    const toastId = showLoading(`"${courseToDelete.title}" kursi o'chirilmoqda...`);

    try {
      // Optionally delete image from storage first
      if (courseToDelete.image_url) {
        const imageUrlParts = courseToDelete.image_url.split('/');
        const fileName = imageUrlParts[imageUrlParts.length - 1];
        const { error: deleteImageError } = await supabase.storage
          .from('course_images')
          .remove([`course_images/${fileName}`]); // Assuming path structure

        if (deleteImageError && deleteImageError.message !== 'The resource was not found') {
          console.warn("Error deleting old course image:", deleteImageError);
          // Don't throw, proceed with course deletion even if image deletion fails
        }
      }

      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseToDelete.id);

      if (error) {
        throw error;
      }

      showSuccess(`"${courseToDelete.title}" kursi muvaffaqiyatli o'chirildi!`);
      fetchCourses(); // Refresh the list
      setIsDeleteDialogOpen(false);
      setCourseToDelete(null);
    } catch (error: any) {
      console.error("Kursni o'chirishda xato:", error);
      showError(`Kursni o'chirishda xato: ${error.message || "Noma'lum xato"}`);
    } finally {
      dismissToast(toastId);
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="shadow-lg bg-card text-card-foreground"> {/* Use semantic colors */}
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-foreground">Yuklangan Kurslar Preview</CardTitle> {/* Use semantic colors */}
          <CardDescription className="text-muted-foreground">Bu bo'limda foydalanuvchilar kurslarni qanday formatda ko'rishlarini kuzatishingiz mumkin.</CardDescription> {/* Use semantic colors */}
        </CardHeader>
        <CardContent className="flex items-center justify-center p-6">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg bg-card text-card-foreground"> {/* Use semantic colors */}
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-foreground">Yuklangan Kurslar Preview</CardTitle> {/* Use semantic colors */}
        <CardDescription className="text-muted-foreground">Bu bo'limda foydalanuvchilar kurslarni qanday formatda ko'rishlarini kuzatishingiz mumkin.</CardDescription> {/* Use semantic colors */}
      </CardHeader>
      <CardContent>
        {courses.length === 0 ? (
          <p className="text-center text-muted-foreground">Hozircha yuklangan kurslar mavjud emas.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card key={course.id} className="overflow-hidden shadow-xl hover:shadow-2xl transition duration-300 border-t-4 border-ferrari-red bg-card text-card-foreground"> {/* Use semantic colors */}
                <img src={course.image_url || "https://placehold.co/400x200/CC0000/ffffff?text=Kurs+Rasmi"} alt={course.title} className="w-full h-40 object-cover" />
                <CardContent className="p-5">
                  <span className="text-xs font-medium text-white px-3 py-1 bg-ferrari-red rounded-full">{course.category}</span>
                  <h4 className="text-xl font-bold text-foreground mt-2 mb-1">{course.title}</h4> {/* Use semantic colors */}
                  <p className="text-muted-foreground text-sm line-clamp-2">{course.description}</p> {/* Use semantic colors */}
                  <div className="flex justify-between items-center mt-4">
                    <p className="text-2xl font-extrabold text-green-500">{course.price.toLocaleString()} UZS</p> {/* Adjusted green shade */}
                    <Button variant="link" className="text-ferrari-red hover:text-red-500 font-semibold text-sm p-0 h-auto">
                      Batafsil ko'rish &rarr;
                    </Button>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border flex justify-between items-center"> {/* Use semantic colors */}
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`active-switch-${course.id}`}
                        checked={course.is_active}
                        onCheckedChange={() => handleToggleActive(course.id, course.is_active)}
                        disabled={isSubmitting}
                        className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-600" /* Adjusted gray shade */
                      />
                      <Label htmlFor={`active-switch-${course.id}`} className="text-sm font-medium text-foreground"> {/* Use semantic colors */}
                        {course.is_active ? "Faol" : "Nofaol"}
                      </Label>
                    </div>
                    <div className="text-sm text-muted-foreground"> {/* Use semantic colors */}
                      Sotuvlar: <span className="font-bold text-ferrari-red">{course.sales_count}</span>
                    </div>
                    <CustomDeleteButton onClick={() => handleDeleteClick(course)} disabled={isSubmitting} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-8 p-4 bg-red-950 border border-red-800 rounded-xl text-ferrari-red"> {/* Darker red background and border */}
          <p className="font-medium">Eslatma:</p>
          <p className="text-sm">Bu joyda siz kurslarning to'liq darsliklar ro'yxatini va modul tuzilishini tekshirishingiz mumkin (foydalanuvchi ko'rinishida).</p>
        </div>
      </CardContent>

      {/* Delete Course Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-card text-card-foreground" aria-describedby="delete-course-description"> {/* Use semantic colors */}
          <AlertDialogHeader>
            <AlertDialogTitle className="text-ferrari-red">Kursni O'chirishni Tasdiqlaysizmi?</AlertDialogTitle>
            <AlertDialogDescription id="delete-course-description" className="text-muted-foreground"> {/* Use semantic colors */}
              Siz <strong>"{courseToDelete?.title}"</strong> kursini butunlay o'chirib tashlamoqchisiz. Bu amalni qaytarib bo'lmaydi. Ishonchingiz komilmi?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteCourse}
              disabled={isSubmitting}
              className="bg-destructive hover:bg-red-700 text-white"
            >
              {isSubmitting ? "O'chirilmoqda..." : "O'chirish"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default CoursePreviewPanel;