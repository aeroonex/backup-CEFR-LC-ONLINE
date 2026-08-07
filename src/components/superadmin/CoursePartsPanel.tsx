"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess, showLoading, dismissToast } from '@/utils/toast';
import { PlusCircle, Edit, Trash2, BookOpen, Video } from 'lucide-react';
import CoursePartForm from './CoursePartForm';
import LessonForm from './LessonForm'; // Import LessonForm
import CustomEditButton from '@/components/ui/CustomEditButton';
import CustomDeleteButton from '@/components/ui/CustomDeleteButton';

interface CoursePart {
  id: string;
  title: string;
  description?: string;
  part_number: number;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  video_url: string;
  description?: string;
  order_index: number;
}

interface CoursePartsPanelProps {
  courseId: string;
}

const CoursePartsPanel: React.FC<CoursePartsPanelProps> = ({ courseId }) => {
  const [courseParts, setCourseParts] = useState<CoursePart[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPartFormOpen, setIsPartFormOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<CoursePart | null>(null);

  const [isLessonFormOpen, setIsLessonFormOpen] = useState(false); // State for LessonForm
  const [selectedPartIdForLesson, setSelectedPartIdForLesson] = useState<string | null>(null); // To know which part to add lesson to
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null); // State for editing lesson

  const fetchCourseParts = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('course_parts')
        .select(`
          id,
          title,
          description,
          part_number,
          lessons (
            id,
            title,
            video_url,
            description,
            order_index
          )
        `)
        .eq('course_id', courseId)
        .order('part_number', { ascending: true })
        .order('order_index', { foreignTable: 'lessons', ascending: true });

      if (error) throw error;
      setCourseParts(data || []);
    } catch (error: any) {
      console.error("Kurs qismlarini yuklashda xato:", error);
      showError(`Kurs qismlarini yuklashda xato: ${error.message || "Noma'lum xato"}`);
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourseParts();
  }, [fetchCourseParts]);

  const handleAddPart = () => {
    setEditingPart(null);
    setIsPartFormOpen(true);
  };

  const handleEditPart = (part: CoursePart) => {
    setEditingPart(part);
    setIsPartFormOpen(true);
  };

  const handleDeletePart = async (partId: string) => {
    const toastId = showLoading("Qism o'chirilmoqda...");
    try {
      const { error } = await supabase
        .from('course_parts')
        .delete()
        .eq('id', partId);

      if (error) throw error;
      showSuccess("Kurs qismi muvaffaqiyatli o'chirildi!");
      fetchCourseParts();
    } catch (error: any) {
      console.error("Kurs qismini o'chirishda xato:", error);
      showError(`O'chirishda xato: ${error.message || "Noma'lum xato"}`);
    } finally {
      dismissToast(toastId);
    }
  };

  const handleAddLesson = (partId: string) => {
    setSelectedPartIdForLesson(partId);
    setEditingLesson(null);
    setIsLessonFormOpen(true);
  };

  const handleEditLesson = (partId: string, lesson: Lesson) => {
    setSelectedPartIdForLesson(partId);
    setEditingLesson(lesson);
    setIsLessonFormOpen(true);
  };

  const handleDeleteLesson = async (lessonId: string) => {
    const toastId = showLoading("Darslik o'chirilmoqda...");
    try {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lessonId);

      if (error) throw error;
      showSuccess("Darslik muvaffaqiyatli o'chirildi!");
      fetchCourseParts();
    } catch (error: any) {
      console.error("Darslikni o'chirishda xato:", error);
      showError(`O'chirishda xato: ${error.message || "Noma'lum xato"}`);
    } finally {
      dismissToast(toastId);
    }
  };

  if (isLoading) {
    return (
      <Card className="shadow-lg bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-foreground">Kurs Qismlari va Darsliklari</CardTitle>
          <CardDescription className="text-muted-foreground">Ma'lumotlar yuklanmoqda...</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">Yuklanmoqda...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg bg-card text-card-foreground">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-semibold text-foreground">Kurs Qismlari va Darsliklari</CardTitle>
        <Button onClick={handleAddPart} className="bg-ferrari-red hover:bg-red-700 text-white">
          <PlusCircle className="h-4 w-4 mr-2" /> Yangi qism qo'shish
        </Button>
      </CardHeader>
      <CardContent>
        {courseParts.length === 0 ? (
          <p className="text-muted-foreground">Bu kurs uchun hali qismlar mavjud emas.</p>
        ) : (
          <Accordion type="multiple" className="w-full">
            {courseParts.map((part) => (
              <AccordionItem key={part.id} value={part.id} className="border-b">
                <AccordionTrigger className="flex justify-between items-center py-4 px-4 text-lg font-semibold text-gray-800 hover:text-ferrari-red transition-colors">
                  <span className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-3 text-blue-500" />
                    {part.part_number}. {part.title}
                  </span>
                  <div className="flex items-center gap-2">
                    <CustomEditButton onClick={(e) => { e.stopPropagation(); handleEditPart(part); }} />
                    <CustomDeleteButton onClick={(e) => { e.stopPropagation(); handleDeletePart(part.id); }} />
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-2 py-2 bg-gray-50 border-t border-gray-100">
                  {part.description && <p className="text-gray-600 mb-4 px-6 text-sm">{part.description}</p>}
                  <div className="space-y-1">
                    {part.lessons.length === 0 ? (
                      <p className="text-gray-500 pl-8 text-sm">Bu bo'limda darsliklar mavjud emas.</p>
                    ) : (
                      part.lessons.map((lesson) => (
                        <div key={lesson.id} className="flex items-center justify-between w-full py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors text-gray-700">
                          <span className="flex items-center">
                            <Video className="h-5 w-5 mr-3 text-green-500" />
                            {lesson.order_index}. {lesson.title}
                          </span>
                          <div className="flex items-center gap-2">
                            <CustomEditButton onClick={() => handleEditLesson(part.id, lesson)} />
                            <CustomDeleteButton onClick={() => handleDeleteLesson(lesson.id)} />
                          </div>
                        </div>
                      ))
                    )}
                    <Button
                      variant="outline"
                      onClick={() => handleAddLesson(part.id)}
                      className="w-full mt-4 border-blue-500 text-blue-500 hover:bg-blue-50 hover:text-blue-600"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" /> Darslik qo'shish
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>

      <CoursePartForm
        isOpen={isPartFormOpen}
        onClose={() => setIsPartFormOpen(false)}
        courseId={courseId}
        part={editingPart}
        onPartSaved={fetchCourseParts}
      />

      <LessonForm
        isOpen={isLessonFormOpen}
        onClose={() => setIsLessonFormOpen(false)}
        courseId={courseId}
        partId={selectedPartIdForLesson || ''}
        lesson={editingLesson}
        onLessonSaved={fetchCourseParts}
      />
    </Card>
  );
};

export default CoursePartsPanel;