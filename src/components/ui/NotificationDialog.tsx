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
import { CheckCircle2, XCircle } from 'lucide-react';

interface NotificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  title: string;
  type: "success" | "error";
}

const NotificationDialog: React.FC<NotificationDialogProps> = ({ isOpen, onClose, message, title, type }) => {
  const isSuccess = type === "success";
  const icon = isSuccess ? <CheckCircle2 className="h-16 w-16 text-green-500 animate-bounce-in" /> : <XCircle className="h-16 w-16 text-red-500 animate-bounce-in" />;
  const cardClass = isSuccess ? "success" : "error";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] p-6 text-center bg-white rounded-lg shadow-xl" aria-describedby="notification-description">
        <DialogHeader className="flex flex-col items-center space-y-4">
          {icon}
          <DialogTitle className="text-3xl font-bold text-gray-900">{title}</DialogTitle>
          <DialogDescription id="notification-description" className="text-lg text-gray-700">
            {/* Changed from <p> to <span> to avoid nesting <p> inside <p> */}
            <span className="block mb-2">{message}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6">
          <Button onClick={onClose} className={`w-full text-white text-lg py-2.5 rounded-lg shadow-md transition-colors ${isSuccess ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
            Tushundim
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationDialog;