"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, PlusCircle, XCircle, Trash2, Edit, Music } from 'lucide-react'; // NEW: Music icon
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface LessonFormProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  partId: string;
  lesson?: {
    id: string;
    title: string;
    video_url: string;
    description?: string;
    order_index: number;
  } | null;
  onLessonSaved: () => void;
}

interface Exercise {
  id?: string; // id is optional for new exercises
  question_text: string;
  type: 'multiple_choice' | 'open_ended' | 'listening'; // NEW: Added 'listening' type
  options: string[];
  correct_answer: string;
  order_index: number;
  audio_url?: string; // NEW: Optional audio URL for listening exercises
  audio_file?: File | null; // NEW: Optional audio file for upload
}

const LessonForm: React.FC<LessonFormProps> = ({
  isOpen,
  onClose,
  courseId,
  partId,
  lesson,
  onLessonSaved,
}) => {
  const [title, setTitle] = useState(lesson?.title || '');
  const [videoUrl, setVideoUrl] = useState(lesson?.video_url || '');
  const [description, setDescription] = useState(lesson?.description || '');
  const [orderIndex, setOrderIndex] = useState<number | ''>(lesson?.order_index || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isFetchingExercises, setIsFetchingExercises] = useState(false);

  const isEditing = !!lesson;

  const fetchExercises = useCallback(async (lessonId: string) => {
    setIsFetchingExercises(true);
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      // Map fetched data to include audio_file as null initially
      setExercises(data?.map(ex => ({ ...ex, audio_file: null })) || []);
    } catch (error: any) {
      console.error("Mashqlarni yuklashda xato:", error);
      showError("Mashqlarni yuklashda xato yuz berdi.");
    } finally {
      setIsFetchingExercises(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTitle(lesson?.title || '');
      setVideoUrl(lesson?.video_url || '');
      setDescription(lesson?.description || '');
      setOrderIndex(lesson?.order_index || '');
      setExercises([]); // Clear exercises when dialog opens
      if (lesson?.id) {
        fetchExercises(lesson.id);
      }
    }
  }, [isOpen, lesson, fetchExercises]);

  const handleAddExercise = () => {
    setExercises(prev => [
      ...prev,
      { question_text: '', type: 'multiple_choice', options: ['', '', '', ''], correct_answer: '', order_index: prev.length, audio_file: null },
    ]);
  };

  const handleExerciseChange = (index: number, field: keyof Exercise, value: any) => {
    const newExercises = [...exercises];
    if (field === 'options' && typeof value === 'string') {
      // Assuming options are edited as a comma-separated string
      newExercises[index][field] = value.split(',').map(s => s.trim());
    } else if (field === 'audio_file') {
      newExercises[index].audio_file = value;
    }
    else {
      (newExercises[index] as any)[field] = value;
    }
    setExercises(newExercises);
  };

  const handleRemoveExercise = (index: number) => {
    setExercises(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title || !videoUrl || typeof orderIndex !== 'number' || orderIndex < 0) {
      showError("Iltimos, barcha majburiy maydonlarni to'ldiring.");
      return;
    }

    setIsSubmitting(true);
    const toastId = showLoading(isEditing ? "Darslik yangilanmoqda..." : "Darslik yaratilmoqda...");

    try {
      let lessonId = lesson?.id;
      if (isEditing) {
        const { error } = await supabase
          .from('lessons')
          .update({
            title,
            video_url: videoUrl,
            description,
            order_index: orderIndex,
          })
          .eq('id', lesson.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('lessons')
          .insert({
            part_id: partId,
            title,
            video_url: videoUrl,
            description,
            order_index: orderIndex,
          })
          .select('id')
          .single();

        if (error) throw error;
        lessonId = data.id;
      }

      // Handle exercises
      if (lessonId) {
        // Delete existing exercises not in the current list
        const existingExerciseIds = exercises.filter(ex => ex.id).map(ex => ex.id);
        const { data: oldExercises, error: fetchOldError } = await supabase
          .from('exercises')
          .select('id, audio_url')
          .eq('lesson_id', lessonId);

        if (fetchOldError) throw fetchOldError;

        const exercisesToDelete = oldExercises
          .filter(oldEx => !existingExerciseIds.includes(oldEx.id))
          .map(oldEx => oldEx.id);

        if (exercisesToDelete.length > 0) {
          // Also delete audio files from storage if they exist
          const audioFilesToDelete = oldExercises
            .filter(oldEx => exercisesToDelete.includes(oldEx.id) && oldEx.audio_url)
            .map(oldEx => oldEx.audio_url!.split('/').pop()); // Extract file name

          if (audioFilesToDelete.length > 0) {
            const { error: deleteAudioError } = await supabase.storage
              .from('exercise_audios')
              .remove(audioFilesToDelete.map(f => `exercise_audios/${f}`));
            if (deleteAudioError && deleteAudioError.message !== 'The resource was not found') {
              console.warn("Error deleting old exercise audio files:", deleteAudioError);
            }
          }

          const { error: deleteError } = await supabase
            .from('exercises')
            .delete()
            .in('id', exercisesToDelete);
          if (deleteError) throw deleteError;
        }

        // Upsert (insert/update) current exercises
        for (const ex of exercises) {
          let audioUrl = ex.audio_url;
          if (ex.type === 'listening' && ex.audio_file) {
            const fileExtension = ex.audio_file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExtension}`;
            const filePath = `exercise_audios/${fileName}`;

            const { error: uploadError } = await supabase.storage
              .from('exercise_audios')
              .upload(filePath, ex.audio_file, {
                cacheControl: '3600',
                upsert: false,
              });

            if (uploadError) {
              throw uploadError;
            }
            audioUrl = supabase.storage.from('exercise_audios').getPublicUrl(filePath).data.publicUrl;

            // If updating an existing exercise and a new audio file is uploaded, delete the old one
            if (ex.id && ex.audio_url && ex.audio_url !== audioUrl) {
              const oldAudioFileName = ex.audio_url.split('/').pop();
              const { error: deleteOldAudioError } = await supabase.storage
                .from('exercise_audios')
                .remove([`exercise_audios/${oldAudioFileName}`]);
              if (deleteOldAudioError && deleteOldAudioError.message !== 'The resource was not found') {
                console.warn("Error deleting old exercise audio file:", deleteOldAudioError);
              }
            }
          }

          const { error: exerciseError } = await supabase
            .from('exercises')
            .upsert({
              id: ex.id, // Will update if id exists, insert if not
              lesson_id: lessonId,
              question_text: ex.question_text,
              type: ex.type,
              options: ex.type === 'multiple_choice' || ex.type === 'listening' ? ex.options : null, // Options for listening too
              correct_answer: ex.correct_answer,
              order_index: ex.order_index,
              audio_url: audioUrl, // Store audio URL
            }, { onConflict: 'id' }); // Conflict on 'id' to handle updates

          if (exerciseError) throw exerciseError;
        }
      }

      showSuccess(isEditing ? "Darslik muvaffaqiyatli yangilandi!" : "Darslik muvaffaqiyatli yaratildi!");
      onLessonSaved();
      onClose();
    } catch (error: any) {
      console.error("Darslikni saqlashda xato:", error);
      showError(`Darslikni saqlashda xato: ${error.message || "Noma'lum xato"}`);
    } finally {
      dismissToast(toastId);
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] bg-card text-card-foreground max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-ferrari-red">{isEditing ? "Darslikni tahrirlash" : "Yangi darslik yaratish"}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Darslik ma'lumotlarini kiriting va unga mashqlar qo'shing.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">Sarlavha</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
              disabled={isSubmitting}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="videoUrl" className="text-right">Video URL</Label>
            <Input
              id="videoUrl"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="col-span-3"
              disabled={isSubmitting}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">Tavsif</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              disabled={isSubmitting}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="orderIndex" className="text-right">Tartib raqami</Label>
            <Input
              id="orderIndex"
              type="number"
              value={orderIndex}
              onChange={(e) => setOrderIndex(parseFloat(e.target.value) || '')}
              className="col-span-3"
              min={0}
              disabled={isSubmitting}
            />
          </div>

          <h3 className="text-xl font-semibold mt-6 mb-4 text-ferrari-red">Mashqlar</h3>
          {isFetchingExercises ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              <span className="ml-2 text-gray-600">Mashqlar yuklanmoqda...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {exercises.map((exercise, index) => (
                <Card key={exercise.id || `new-${index}`} className="p-4 border-l-4 border-blue-400 relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    onClick={() => handleRemoveExercise(index)}
                    disabled={isSubmitting}
                  >
                    <XCircle className="h-5 w-5" />
                  </Button>
                  <div className="grid gap-2">
                    <Label htmlFor={`ex-question-${index}`}>Savol matni</Label>
                    <Input
                      id={`ex-question-${index}`}
                      value={exercise.question_text}
                      onChange={(e) => handleExerciseChange(index, 'question_text', e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="grid gap-2 mt-2">
                    <Label htmlFor={`ex-type-${index}`}>Mashq turi</Label>
                    <Select
                      value={exercise.type}
                      onValueChange={(value: 'multiple_choice' | 'open_ended' | 'listening') => handleExerciseChange(index, 'type', value)}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger id={`ex-type-${index}`}>
                        <SelectValue placeholder="Mashq turini tanlang" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="multiple_choice">Ko'p tanlovli</SelectItem>
                        <SelectItem value="open_ended">Ochiq javobli</SelectItem>
                        <SelectItem value="listening">Listening</SelectItem> {/* NEW: Listening option */}
                      </SelectContent>
                    </Select>
                  </div>
                  {(exercise.type === 'multiple_choice' || exercise.type === 'listening') && ( // Options for listening too
                    <div className="grid gap-2 mt-2">
                      <Label htmlFor={`ex-options-${index}`}>Variantlar (vergul bilan ajrating)</Label>
                      <Input
                        id={`ex-options-${index}`}
                        value={exercise.options.join(', ')}
                        onChange={(e) => handleExerciseChange(index, 'options', e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                  )}
                  <div className="grid gap-2 mt-2">
                    <Label htmlFor={`ex-correct-${index}`}>To'g'ri javob</Label>
                    <Input
                      id={`ex-correct-${index}`}
                      value={exercise.correct_answer}
                      onChange={(e) => handleExerciseChange(index, 'correct_answer', e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  {exercise.type === 'listening' && ( // NEW: Audio file input for listening exercises
                    <div className="grid gap-2 mt-2">
                      <Label htmlFor={`ex-audio-${index}`}>Audio Fayl (MP3, WAV)</Label>
                      <Input
                        type="file"
                        id={`ex-audio-${index}`}
                        accept="audio/*"
                        onChange={(e) => handleExerciseChange(index, 'audio_file', e.target.files ? e.target.files[0] : null)}
                        disabled={isSubmitting}
                      />
                      {exercise.audio_file && <p className="text-sm text-muted-foreground">Tanlangan fayl: {exercise.audio_file.name}</p>}
                      {exercise.audio_url && !exercise.audio_file && (
                        <p className="text-sm text-muted-foreground">Joriy audio: <a href={exercise.audio_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">tinglash</a></p>
                      )}
                    </div>
                  )}
                  <div className="grid gap-2 mt-2">
                    <Label htmlFor={`ex-order-${index}`}>Tartib raqami</Label>
                    <Input
                      id={`ex-order-${index}`}
                      type="number"
                      value={exercise.order_index}
                      onChange={(e) => handleExerciseChange(index, 'order_index', parseFloat(e.target.value) || 0)}
                      min={0}
                      disabled={isSubmitting}
                    />
                  </div>
                </Card>
              ))}
              <Button
                variant="outline"
                onClick={handleAddExercise}
                className="w-full mt-4 border-blue-500 text-blue-500 hover:bg-blue-50 hover:text-blue-600"
                disabled={isSubmitting}
              >
                <PlusCircle className="h-4 w-4 mr-2" /> Mashq qo'shish
              </Button>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Bekor qilish
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-ferrari-red hover:bg-red-700 text-white">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saqlanmoqda...
              </>
            ) : (
              isEditing ? "Yangilash" : "Yaratish"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LessonForm;