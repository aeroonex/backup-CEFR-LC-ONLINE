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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';

interface UserBalanceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
  username: string;
  currentBalance: number;
  onBalanceUpdated: () => void;
}

const UserBalanceDialog: React.FC<UserBalanceDialogProps> = ({
  isOpen,
  onClose,
  userId,
  username,
  currentBalance,
  onBalanceUpdated,
}) => {
  const [amount, setAmount] = useState<number | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setAmount(''); // Reset amount when dialog closes
    }
  }, [isOpen]);

  const handleBalanceUpdate = async (type: 'topup' | 'deduct') => {
    if (!userId || typeof amount !== 'number' || amount <= 0) {
      showError("Iltimos, to'g'ri miqdorni kiriting.");
      return;
    }

    setIsSubmitting(true);
    const toastId = showLoading(type === 'topup' ? "Balans to'ldirilmoqda..." : "Balansdan yechib olinmoqda...");

    try {
      let newBalance = currentBalance;
      if (type === 'topup') {
        newBalance += amount;
      } else {
        if (currentBalance < amount) {
          showError("Foydalanuvchi balansida yetarli mablag' mavjud emas.");
          dismissToast(toastId);
          setIsSubmitting(false);
          return;
        }
        newBalance -= amount;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ balance: newBalance })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      showSuccess(`Foydalanuvchi "${username}" balansi muvaffaqiyatli yangilandi! Yangi balans: ${newBalance.toLocaleString()} UZS`);
      onBalanceUpdated();
      onClose();
    } catch (error: any) {
      console.error("Balansni yangilashda xato:", error);
      showError(`Balansni yangilashda xato: ${error.message || "Noma'lum xato"}`);
    } finally {
      dismissToast(toastId);
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle className="text-ferrari-red">
            "{username}" balansini boshqarish
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Foydalanuvchining joriy balansini to'ldiring yoki yechib oling.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <Label className="text-gray-700">Joriy Balans:</Label>
            <span className="text-xl font-bold text-green-600">{currentBalance.toLocaleString()} UZS</span>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="amount" className="text-gray-700">Miqdor (UZS)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || '')}
              min={1}
              placeholder="Masalan: 50000"
              disabled={isSubmitting}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Bekor qilish
          </Button>
          <Button
            onClick={() => handleBalanceUpdate('deduct')}
            disabled={isSubmitting || typeof amount !== 'number' || amount <= 0 || currentBalance < amount}
            className="bg-destructive hover:bg-red-700 text-white"
          >
            {isSubmitting && amount && amount > 0 ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Yechilmoqda...
              </>
            ) : (
              "Yechib olish"
            )}
          </Button>
          <Button
            onClick={() => handleBalanceUpdate('topup')}
            disabled={isSubmitting || typeof amount !== 'number' || amount <= 0}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isSubmitting && amount && amount > 0 ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> To'ldirilmoqda...
              </>
            ) : (
              "To'ldirish"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserBalanceDialog;