"use client";

import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Phone, User as UserIcon, Send, Loader2, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';
import { useSession } from '@/components/auth/SessionContextProvider';

const applicationSchema = z.object({
  name: z.string().min(1, "Ism majburiy"),
  phone: z.string().min(9, "Telefon raqami kamida 9 ta raqamdan iborat bo'lishi kerak").regex(/^\+?\d{9,15}$/, "Noto'g'ri telefon raqami formati"),
  message: z.string().min(10, "Xabar kamida 10 ta belgidan iborat bo'lishi kerak").max(500, "Xabar 500 ta belgidan oshmasligi kerak"),
});

type ApplicationFormInputs = z.infer<typeof applicationSchema>;

const ApplicationForm: React.FC = () => {
  const { user } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ApplicationFormInputs>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      name: "",
      phone: "",
      message: "",
    },
  });

  const onSubmit = async (data: ApplicationFormInputs) => {
    setIsSubmitting(true);
    const toastId = showLoading("Arizangiz yuborilmoqda...");

    try {
      const { name, phone, message } = data;
      const userId = user?.id || null;

      const { error } = await supabase
        .from('applications')
        .insert([
          {
            user_id: userId,
            name: name,
            phone: phone,
            message: message,
            status: 'pending',
          },
        ]);

      if (error) {
        throw error;
      }

      showSuccess("Arizangiz muvaffaqiyatli yuborildi! Tez orada siz bilan bog'lanamiz.");
      form.reset();
    } catch (error: any) {
      console.error("Ariza yuborishda xato:", error);
      showError(`Ariza yuborishda xato: ${error.message || "Noma'lum xato"}`);
    } finally {
      dismissToast(toastId);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-2xl w-full h-full flex flex-col justify-center"> {/* max-w-md mx-auto olib tashlandi */}
      <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Savollar qoldimi?</h3>
      <p className="text-gray-600 mb-6 text-center">Biz bilan bog'laning, biz sizga yordam beramiz!</p>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <Label htmlFor="name" className="sr-only">Ismingiz</Label>
          <div className="relative">
            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="name"
              placeholder="Ismingiz"
              {...form.register("name")}
              className="pl-10 py-2.5 border-gray-300 focus:border-ferrari-red focus:ring-ferrari-red"
              disabled={isSubmitting}
            />
          </div>
          {form.formState.errors.name && (
            <p className="text-sm text-red-500 mt-1">{form.formState.errors.name.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="phone" className="sr-only">Telefon raqamingiz</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="phone"
              placeholder="Telefon raqamingiz"
              {...form.register("phone")}
              className="pl-10 py-2.5 border-gray-300 focus:border-ferrari-red focus:ring-ferrari-red"
              disabled={isSubmitting}
            />
          </div>
          {form.formState.errors.phone && (
            <p className="text-sm text-red-500 mt-1">{form.formState.errors.phone.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="message" className="sr-only">Xabaringiz</Label>
          <div className="relative">
            <MessageSquare className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Textarea
              id="message"
              placeholder="Xabaringizni kiriting..."
              {...form.register("message")}
              className="pl-10 py-2.5 border-gray-300 focus:border-ferrari-red focus:ring-ferrari-red min-h-[100px]"
              disabled={isSubmitting}
            />
          </div>
          {form.formState.errors.message && (
            <p className="text-sm text-red-500 mt-1">{form.formState.errors.message.message}</p>
          )}
        </div>
        <Button
          type="submit"
          className="w-full bg-ferrari-red hover:bg-red-700 text-white py-2.5 text-lg font-semibold rounded-lg shadow-md transition-colors flex items-center justify-center"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Yuborilmoqda...
            </>
          ) : (
            <>
              <Send className="mr-2 h-5 w-5" /> Yuborish
            </>
          )}
        </Button>
      </form>
    </div>
  );
};

export default ApplicationForm;