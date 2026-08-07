"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from 'lucide-react';

interface EmailConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

const EmailConfirmationDialog: React.FC<EmailConfirmationDialogProps> = ({ isOpen, onClose, email }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] p-6 text-center bg-white rounded-lg shadow-xl" aria-describedby="email-confirmation-description">
        <DialogHeader className="flex flex-col items-center space-y-4">
          <CheckCircle2 className="h-16 w-16 text-green-500 animate-bounce-in" />
          <DialogTitle className="text-3xl font-bold text-gray-900">Muvaffaqiyatli!</DialogTitle>
          <DialogDescription id="email-confirmation-description" className="text-lg text-gray-700">
            <div className="mb-2">Ro'yxatdan o'tish uchun elektron pochta yuborildi.</div>
            <div className="font-semibold text-green-600">Iltimos, <strong>{email}</strong> manzilingizni tekshiring va hisobingizni faollashtirish uchun havolani bosing.</div>
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6">
          <Button onClick={onClose} className="w-full bg-ferrari-red hover:bg-red-700 text-white text-lg py-2.5 rounded-lg shadow-md transition-colors">
            Tushundim
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmailConfirmationDialog;