"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";
import { Headphones, BookOpen, Pencil, Mic } from 'lucide-react'; // Pencil is now used for icon, not the button itself
import CustomDeleteButton from '@/components/ui/CustomDeleteButton'; // Import new custom delete button
import CustomEditButton from '@/components/ui/CustomEditButton'; // Import new custom edit button

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  user_id: string;
  duration_days: number;
  discount_percentage: number; // New field
  created_at: string;
}

const courseCategories = [
  { name: 'LISTENING', icon: Headphones },
  { name: 'READING', icon: BookOpen },
  { name: 'WRITING', icon: Pencil }, // Reusing Pencil for Writing
  { name: 'SPEAKING', icon: Mic },
  { name: 'GENERAL', icon: BookOpen }, // General category
];

const courseEditSchema = z.object({
  title: z.string().min(1, "Kurs nomi majburiy"),
  description: z.string().min(1, "Tavsif majburiy"),
  price: z.coerce.number().min(0, "Narx manfiy bo'lishi mumkin emas"),
  category: z.string().min(1, "Kategoriya majburiy"),
  duration_days: z.coerce.number().min(1, "Amal qilish muddati kamida 1 kun bo'lishi kerak"),
  discount_percentage: z.coerce.number().min(0, "Chegirma foizi manfiy bo'lishi mumkin emas").max(100, "Chegirma foizi 100% dan oshmasligi kerak"), // New field
  image_file: z.any().optional(), // For new image upload
});

const EditCoursesPanel: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof courseEditSchema>>({
    resolver: zodResolver(courseEditSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      category: "",
      duration_days: 30,
      discount_percentage: 0, // Default value
    },
  });

  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching courses:", error);
      showError("Kurslarni yuklashda xato yuz berdi.");
      setCourses([]);
    } else {
      setCourses(data || []);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleEditClick = (course: Course) => {
    setCurrentCourse(course);
    form.reset({
      title: course.title,
      description: course.description,
      price: course.price,
      category: course.category,
      duration_days: course.duration_days,
      discount_percentage: course.discount_percentage, // Set existing discount
      image_file: undefined, // Reset file input
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (course: Course) => {
    setCurrentCourse(course);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteCourse = async () => {
    if (!currentCourse) return;

    setIsSubmitting(true);
    const toastId = showLoading(`"${currentCourse.title}" kursi o'chirilmoqda...`);

    try {
      // Optionally delete image from storage first
      if (currentCourse.image_url) {
        const imageUrlParts = currentCourse.image_url.split('/');
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
        .eq('id', currentCourse.id);

      if (error) {
        throw error;
      }

      showSuccess(`"${currentCourse.title}" kursi muvaffaqiyatli o'chirildi!`);
      fetchCourses(); // Refresh the list
      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      console.error("Kursni o'chirishda xato:", error);
      showError(`Kursni o'chirishda xato: ${error.message || "Noma'lum xato"}`);
    } finally {
      dismissToast(toastId);
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof courseEditSchema>) => {
    if (!currentCourse) return;

    setIsSubmitting(true);
    const toastId = showLoading(`"${values.title}" kursi yangilanmoqda...`);

    try {
      let newImageUrl = currentCourse.image_url;

      // Handle image upload if a new file is selected
      if (values.image_file && values.image_file.length > 0) {
        const imageFile = values.image_file[0];
        const fileExtension = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExtension}`;
        const filePath = `course_images/${fileName}`;

        // Upload new image
        const { error: uploadError } = await supabase.storage
          .from('course_images')
          .upload(filePath, imageFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          throw uploadError;
        }
        newImageUrl = supabase.storage.from('course_images').getPublicUrl(filePath).data.publicUrl;

        // Optionally delete old image if it exists and is different
        if (currentCourse.image_url && currentCourse.image_url !== newImageUrl) {
          const oldImageUrlParts = currentCourse.image_url.split('/');
          const oldFileName = oldImageUrlParts[oldImageUrlParts.length - 1];
          const { error: deleteOldImageError } = await supabase.storage
            .from('course_images')
            .remove([`course_images/${oldFileName}`]);
          if (deleteOldImageError && deleteOldImageError.message !== 'The resource was not found') {
            console.warn("Error deleting old course image:", deleteOldImageError);
          }
        }
      }

      const { error } = await supabase
        .from('courses')
        .update({
          title: values.title,
          description: values.description,
          price: values.price,
          category: values.category,
          duration_days: values.duration_days,
          discount_percentage: values.discount_percentage, // Save discount percentage
          image_url: newImageUrl,
        })
        .eq('id', currentCourse.id);

      if (error) {
        throw error;
      }

      showSuccess(`"${values.title}" kursi muvaffaqiyatli yangilandi!`);
      fetchCourses(); // Refresh the list
      setIsEditDialogOpen(false);
    } catch (error: any) {
      console.error("Kursni yangilashda xato:", error);
      showError(`Kursni yangilashda xato: ${error.message || "Noma'lum xato"}`);
    } finally {
      dismissToast(toastId);
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="shadow-lg bg-card text-card-foreground"> {/* Use semantic colors */}
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-foreground">Yuklangan Kurslarni Tahrirlash</CardTitle> {/* Use semantic colors */}
          <CardDescription className="text-muted-foreground">Kurs ma'lumotlari yuklanmoqda...</CardDescription> {/* Use semantic colors */}
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">Kurslar yuklanmoqda...</p> {/* Use semantic colors */}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg bg-card text-card-foreground"> {/* Use semantic colors */}
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-foreground">Yuklangan Kurslarni Tahrirlash</CardTitle> {/* Use semantic colors */}
        <CardDescription className="text-muted-foreground">Platformadagi barcha kurslarni tahrirlash yoki o'chirish.</CardDescription> {/* Use semantic colors */}
      </CardHeader>
      <CardContent>
        {courses.length === 0 ? (
          <p className="text-center text-muted-foreground">Hozircha yuklangan kurslar mavjud emas.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-800 hover:bg-gray-700">
                  <TableHead className="rounded-tl-lg text-gray-100">Rasm</TableHead><TableHead className="text-gray-100">Nomi</TableHead><TableHead className="text-gray-100">Kategoriya</TableHead><TableHead className="text-gray-100">Narxi</TableHead><TableHead className="text-gray-100">Muddati (kun)</TableHead><TableHead className="text-gray-100">Chegirma (%)</TableHead><TableHead className="rounded-tr-lg text-right text-gray-100">Amallar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course) => (
                  <TableRow key={course.id} className="hover:bg-red-950 transition duration-150">
                    <TableCell>
                      <img src={course.image_url || "https://placehold.co/50x30/FF2800/FFFFFF?text=Kurs"} alt={course.title} className="w-12 h-8 object-cover rounded" />
                    </TableCell>
                    <TableCell className="font-medium text-foreground">{course.title}</TableCell>
                    <TableCell className="text-muted-foreground">{course.category}</TableCell>
                    <TableCell className="text-ferrari-red font-bold">{course.price.toLocaleString()} UZS</TableCell>
                    <TableCell className="text-muted-foreground">{course.duration_days} kun</TableCell>
                    <TableCell className="text-green-500 font-bold">{course.discount_percentage}%</TableCell> {/* Display discount */}
                    <TableCell className="text-right flex items-center justify-end">
                      <CustomEditButton onClick={() => handleEditClick(course)} disabled={isSubmitting} />
                      <CustomDeleteButton onClick={() => handleDeleteClick(course)} disabled={isSubmitting} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Edit Course Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-card text-card-foreground" aria-describedby="edit-course-description"> {/* Use semantic colors */}
          <DialogHeader>
            <DialogTitle className="text-ferrari-red">Kursni Tahrirlash</DialogTitle>
            <DialogDescription id="edit-course-description" className="text-muted-foreground"> {/* Use semantic colors */}
              "{currentCourse?.title}" kursining ma'lumotlarini o'zgartiring.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kurs Nomi</FormLabel>
                    <FormControl>
                      <Input placeholder="Masalan: IELTS Listening 7.0+" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tavsifi</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Kurs haqida qisqacha, jozibali tavsif kiriting..." rows={4} {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Narxi (UZS)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="250000" {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="duration_days"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amal qilish muddati (kun)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="30" {...field} min={1} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="discount_percentage" // New field for discount
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chegirma foizi (%)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} min={0} max={100} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategoriya</FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {courseCategories.map((cat) => (
                          <Button
                            key={cat.name}
                            type="button"
                            variant={field.value === cat.name ? "default" : "outline"}
                            className={field.value === cat.name ? "bg-ferrari-red hover:bg-red-700 text-white" : "hover:bg-gray-800"} /* Adjusted hover color */
                            onClick={() => field.onChange(cat.name)}
                            disabled={isSubmitting}
                          >
                            <cat.icon className="w-4 h-4 mr-2" /> {cat.name}
                          </Button>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="image_file"
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem>
                    <FormLabel>Kurs Rasmi (JPG/PNG)</FormLabel>
                    <FormControl>
                      <Input
                        {...fieldProps}
                        type="file"
                        accept="image/*"
                        onChange={(event) => onChange(event.target.files)}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    {currentCourse?.image_url && !value?.length && (
                      <p className="text-sm text-muted-foreground">Joriy rasm: <a href={currentCourse.image_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">ko'rish</a></p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="mt-6">
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={isSubmitting}>Bekor qilish</Button>
                </DialogClose>
                <Button type="submit" className="bg-ferrari-red hover:bg-red-700" disabled={isSubmitting}>
                  {isSubmitting ? "Yangilanmoqda..." : "Saqlash"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Course Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-card text-card-foreground" aria-describedby="delete-course-confirmation-description"> {/* Use semantic colors */}
          <DialogHeader>
            <DialogTitle className="text-ferrari-red">Kursni O'chirishni Tasdiqlaysizmi?</DialogTitle>
            <DialogDescription id="delete-course-confirmation-description" className="text-muted-foreground"> {/* Use semantic colors */}
              Siz <strong>"{currentCourse?.title}"</strong> kursini butunlay o'chirib tashlamoqchisiz. Bu amalni qaytarib bo'lmaydi. Ishonchingiz komilmi?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isSubmitting}>Bekor qilish</Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDeleteCourse}
              disabled={isSubmitting}
            >
              {isSubmitting ? "O'chirilmoqda..." : "O'chirish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default EditCoursesPanel;