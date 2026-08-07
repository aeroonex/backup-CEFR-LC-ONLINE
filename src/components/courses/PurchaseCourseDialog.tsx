"use client";

import React, { useState } from 'react';
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
import { Button } from "@/components/ui/button";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";
import { supabase } from '@/integrations/supabase/client';
import { useSession } from "@/components/auth/SessionContextProvider";
import { BookOpen, Video } from 'lucide-react'; // Import icons

interface PurchaseCourseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle: string;
  coursePrice: number;
  coursePartsCount?: number; // New prop
  courseLessonsCount?: number; // New prop
  onPurchaseSuccess: () => void;
}

const PurchaseCourseDialog: React.FC<PurchaseCourseDialogProps> = ({
  isOpen,
  onClose,
  courseId,
  courseTitle,
  coursePrice,
  coursePartsCount, // Destructure new prop
  courseLessonsCount, // Destructure new prop
  onPurchaseSuccess,
}) => {
  const { user } = useSession();
  const [isPurchasing, setIsPurchasing] = useState(false);

  const handlePurchase = async () => {
    if (!user) {
      showError("Kurs sotib olish uchun avval tizimga kiring.");
      onClose();
      return;
    }

    setIsPurchasing(true);
    const toastId = showLoading("Kurs sotib olinmoqda...");

    try {
      // 1. Check if user already owns the course
      const { data: existingPurchase, error: checkError } = await supabase
        .from('user_courses')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means "no rows found"
        throw checkError;
      }

      if (existingPurchase) {
        showError("Siz bu kursni allaqachon sotib olgansiz.");
        onClose();
        return;
      }

      // 2. Fetch user's current balance
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', user.id)
        .single();

      if (profileError) {
        throw profileError;
      }

      const currentBalance = profileData?.balance || 0;

      // 3. Check if user has sufficient balance
      if (currentBalance < coursePrice) {
        showError("Balansingizda yetarli mablag' mavjud emas.");
        onClose();
        return;
      }

      // 4. Perform the transaction: Deduct balance and record purchase
      const newBalance = currentBalance - coursePrice;

      const { error: updateBalanceError } = await supabase
        .from('profiles')
        .update({ balance: newBalance })
        .eq('id', user.id);

      if (updateBalanceError) {
        throw updateBalanceError;
      }

      const { error: insertPurchaseError } = await supabase
        .from('user_courses')
        .insert([
          {
            user_id: user.id,
            course_id: courseId,
            price_at_purchase: coursePrice,
          },
        ]);

      if (insertPurchaseError) {
        // If purchase record fails, try to revert balance (basic rollback)
        await supabase.from('profiles').update({ balance: currentBalance }).eq('id', user.id);
        throw insertPurchaseError;
      }

      showSuccess(`"${courseTitle}" kursi muvaffaqiyatli sotib olindi!`);
      onPurchaseSuccess(); // Notify parent component to refresh data
      onClose();
    } catch (error: any) {
      console.error("Kurs sotib olishda xato:", error);
      showError(`Sotib olishda xato: ${error.message || "Noma'lum xato"}`);
    } finally {
      dismissToast(toastId);
      setIsPurchasing(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent aria-describedby="purchase-description">
        <AlertDialogHeader>
          <AlertDialogTitle>Kursni sotib olishni tasdiqlaysizmi?</AlertDialogTitle>
          <AlertDialogDescription id="purchase-description">
            Siz <strong>"{courseTitle}"</strong> kursini <strong>{coursePrice.toLocaleString()} UZS</strong> evaziga sotib olmoqchisiz. Balansingizdan ushbu summa yechib olinadi.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-4 py-4"> {/* Moved outside AlertDialogDescription */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Kurs haqida ma'lumot:</h4>
            <div className="flex items-center text-gray-700 mb-2">
              <BookOpen className="h-5 w-5 mr-2 text-blue-500" />
              <span>Qismlar soni: <strong className="text-ferrari-red">{coursePartsCount || 0}</strong> ta</span>
            </div>
            <div className="flex items-center text-gray-700">
              <Video className="h-5 w-5 mr-2 text-green-500" />
              <span>Video darsliklar soni: <strong className="text-ferrari-red">{courseLessonsCount || 0}</strong> ta</span>
            </div>
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPurchasing}>Bekor qilish</AlertDialogCancel>
          <AlertDialogAction
            onClick={handlePurchase}
            disabled={isPurchasing}
            className="bg-ferrari-red hover:bg-red-700 text-white"
          >
            {isPurchasing ? "Sotib olinmoqda..." : "Tasdiqlash"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default PurchaseCourseDialog;