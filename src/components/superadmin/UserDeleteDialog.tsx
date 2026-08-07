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
import { Loader2 } from 'lucide-react';
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client'; // Supabase importini qo'shish

interface UserDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
  username: string;
  onUserDeleted: () => void;
}

const UserDeleteDialog: React.FC<UserDeleteDialogProps> = ({
  isOpen,
  onClose,
  userId,
  username,
  onUserDeleted,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteUser = async () => {
    if (!userId) {
      showError("Foydalanuvchi ID topilmadi.");
      onClose();
      return;
    }

    setIsDeleting(true);
    const toastId = showLoading(`Foydalanuvchi "${username}" o'chirilmoqda...`);

    try {
      // Call the Edge Function to delete the user
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        throw new Error("Foydalanuvchi sessiyasi topilmadi. Iltimos, qayta kiring.");
      }

      const response = await fetch(`https://bpeyprktacfufxonzjac.supabase.co/functions/v1/delete-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionData.session.access_token}`,
        },
        body: JSON.stringify({ userIdToDelete: userId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Foydalanuvchini o\'chirishda xato yuz berdi.');
      }

      showSuccess(`Foydalanuvchi "${username}" muvaffaqiyatli o'chirildi!`);
      onUserDeleted();
      onClose();
    } catch (error: any) {
      console.error("Foydalanuvchini o'chirishda xato:", error);
      showError(`Foydalanuvchini o'chirishda xato: ${error.message || "Noma'lum xato"}`);
    } finally {
      dismissToast(toastId);
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-card text-card-foreground">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-ferrari-red">Foydalanuvchini O'chirishni Tasdiqlaysizmi?</AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            Siz <strong>"{username}"</strong> foydalanuvchisini butunlay o'chirib tashlamoqchisiz. Bu amalni qaytarib bo'lmaydi. Ishonchingiz komilmi?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Bekor qilish</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteUser}
            disabled={isDeleting}
            className="bg-destructive hover:bg-red-700 text-white"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> O'chirilmoqda...
              </>
            ) : (
              "O'chirish"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default UserDeleteDialog;