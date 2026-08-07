"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star, Loader2 } from 'lucide-react'; // Star icon will no longer be used directly for rendering
import { supabase } from '@/integrations/supabase/client';
import { useSession } from "@/components/auth/SessionContextProvider";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";

interface ReviewFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle: string;
  onReviewSubmitted: () => void;
}

const ReviewFormDialog: React.FC<ReviewFormDialogProps> = ({
  isOpen,
  onClose,
  courseId,
  courseTitle,
  onReviewSubmitted,
}) => {
  const { user } = useSession();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingReview, setExistingReview] = useState<{ id: string; rating: number; comment: string; status: string } | null>(null);
  const [isLoadingReview, setIsLoadingReview] = useState(true);

  const fetchExistingReview = async () => {
    if (!user || !courseId) return;
    setIsLoadingReview(true);
    try {
      const { data, error } = await supabase
        .from('course_reviews')
        .select('id, rating, comment, status')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 means "no rows found"
        throw error;
      }
      if (data) {
        setExistingReview(data);
        setRating(data.rating);
        setComment(data.comment || "");
      } else {
        setExistingReview(null);
        setRating(0);
        setComment("");
      }
    } catch (error: any) {
      console.error("Existing reviewni yuklashda xato:", error);
      showError(`Mavjud izohni yuklashda xato: ${error.message || "Noma'lum xato"}`);
    } finally {
      setIsLoadingReview(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchExistingReview();
    }
  }, [isOpen, user, courseId]);

  const handleSubmitReview = async () => {
    if (!user) {
      showError("Izoh qoldirish uchun avval tizimga kiring.");
      onClose();
      return;
    }
    if (rating === 0) {
      showError("Iltimos, kursga reyting bering (1-5 yulduz).");
      return;
    }
    if (comment.trim().length < 10) {
      showError("Izoh kamida 10 ta belgidan iborat bo'lishi kerak.");
      return;
    }

    setIsSubmitting(true);
    const toastId = showLoading(existingReview ? "Izoh yangilanmoqda..." : "Izoh yuborilmoqda...");

    try {
      if (existingReview) {
        // Update existing review
        const { error } = await supabase
          .from('course_reviews')
          .update({
            rating,
            comment: comment.trim(),
            status: 'pending', // Reset status to pending on update
          })
          .eq('id', existingReview.id)
          .eq('user_id', user.id); // Ensure user can only update their own review

        if (error) throw error;
        showSuccess("Izohingiz muvaffaqiyatli yangilandi va moderatsiyaga yuborildi!");
      } else {
        // Insert new review
        const { error } = await supabase
          .from('course_reviews')
          .insert({
            user_id: user.id,
            course_id: courseId,
            rating,
            comment: comment.trim(),
            status: 'pending', // Default status
          });

        if (error) throw error;
        showSuccess("Izohingiz muvaffaqiyatli yuborildi va moderatsiyaga yuborildi!");
      }
      onReviewSubmitted(); // Notify parent to refresh course data
      onClose();
    } catch (error: any) {
      console.error("Izoh yuborishda xato:", error);
      showError(`Izoh yuborishda xato: ${error.message || "Noma'lum xato"}`);
    } finally {
      dismissToast(toastId);
      setIsSubmitting(false);
    }
  };

  const renderStarsInput = () => {
    return (
      <div className="radio">
        {[5, 4, 3, 2, 1].map((starValue) => (
          <React.Fragment key={starValue}>
            <input
              id={`rating-${starValue}`}
              type="radio"
              name="rating"
              value={starValue}
              checked={rating === starValue}
              onChange={() => setRating(starValue)}
            />
            <label htmlFor={`rating-${starValue}`} title={`${starValue} stars`}>
              <svg viewBox="0 0 576 512" height="1em" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z"
                ></path>
              </svg>
            </label>
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]" aria-describedby="review-description">
        <DialogHeader>
          <DialogTitle className="text-ferrari-red">
            {existingReview ? "Izohni tahrirlash" : "Izoh qoldirish"}
          </DialogTitle>
          <DialogDescription id="review-description">
            "{courseTitle}" kursi uchun reyting va izoh qoldiring. Sizning fikringiz biz uchun muhim!
          </DialogDescription>
        </DialogHeader>
        {isLoadingReview ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-ferrari-red" />
            <p className="ml-2 text-gray-600">Mavjud izoh yuklanmoqda...</p>
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rating" className="text-right">
                Reyting
              </Label>
              <div className="col-span-3 flex items-center">
                {renderStarsInput()}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="comment" className="text-right">
                Izoh
              </Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Kurs haqida fikringizni yozing..."
                className="col-span-3"
                rows={4}
              />
            </div>
            {existingReview && existingReview.status === 'pending' && (
              <p className="text-sm text-orange-500 text-center">
                Sizning izohingiz moderatsiyada. Yangilash uni qayta moderatsiyaga yuboradi.
              </p>
            )}
            {existingReview && existingReview.status === 'rejected' && (
              <p className="text-sm text-red-500 text-center">
                Sizning avvalgi izohingiz rad etilgan. Iltimos, o'zgartirish kiritib, qayta yuboring.
              </p>
            )}
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Bekor qilish
          </Button>
          <Button
            type="submit"
            onClick={handleSubmitReview}
            disabled={isSubmitting || isLoadingReview}
            className="bg-ferrari-red hover:bg-red-700 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Yuborilmoqda...
              </>
            ) : existingReview ? (
              "Yangilash"
            ) : (
              "Yuborish"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewFormDialog;