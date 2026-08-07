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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";
import { PlusCircle, Edit, Trash2, Loader2, Zap } from 'lucide-react';
import CustomDeleteButton from '@/components/ui/CustomDeleteButton';
import CustomEditButton from '@/components/ui/CustomEditButton';
import { Badge } from '@/components/ui/badge';

interface Tariff {
  id: string;
  title: string;
  price: number;
  description: string | null;
  features: string[];
  type: 'fargona' | 'online';
  gradient_class: string;
  created_at: string;
}

const tariffSchema = z.object({
  title: z.string().min(1, "Sarlavha majburiy"),
  price: z.coerce.number().min(0, "Narx manfiy bo'lishi mumkin emas"),
  description: z.string().nullable(),
  features: z.string().min(1, "Xususiyatlar majburiy (har birini yangi qatordan kiriting)"),
  type: z.enum(['fargona', 'online'], { message: "Tur majburiy" }),
  gradient_class: z.string().min(1, "Gradient klassi majburiy"),
});

const gradientThemes = [
  { label: "Qizil-To'q sariq", value: "bg-gradient-to-br from-red-500 to-orange-500" },
  { label: "Moviy-Yashil", value: "bg-gradient-to-br from-blue-500 to-green-500" },
  { label: "Binafsha-Pushti", value: "bg-gradient-to-br from-purple-500 to-pink-500" },
  { label: "Sariq-Yashil", value: "bg-gradient-to-br from-yellow-500 to-lime-500" },
  { label: "Kulrang-Qora", value: "bg-gradient-to-br from-gray-700 to-gray-900" },
  { label: "Ferrari Qizil", value: "bg-gradient-to-br from-ferrari-red to-red-700" },
];

function TariffManagementPanel() {
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentTariff, setCurrentTariff] = useState<Tariff | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof tariffSchema>>({
    resolver: zodResolver(tariffSchema),
    defaultValues: {
      title: "",
      price: 0,
      description: "",
      features: "",
      type: 'online',
      gradient_class: gradientThemes[0].value, // Default to the first theme
    },
  });

  const fetchTariffs = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('tariffs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Tariflarni yuklashda xato:", error);
      showError("Tariflarni yuklashda xato yuz berdi.");
      setTariffs([]);
    } else {
      setTariffs(data || []);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchTariffs();
  }, [fetchTariffs]);

  const handleAddClick = () => {
    form.reset({
      title: "",
      price: 0,
      description: "",
      features: "",
      type: 'online',
      gradient_class: gradientThemes[0].value, // Default to the first theme
    });
    setCurrentTariff(null);
    setIsAddDialogOpen(true);
  };

  const handleEditClick = (tariff: Tariff) => {
    setCurrentTariff(tariff);
    form.reset({
      title: tariff.title,
      price: tariff.price,
      description: tariff.description,
      features: tariff.features.join('\n'), // Convert array to newline-separated string
      type: tariff.type,
      gradient_class: tariff.gradient_class,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (tariff: Tariff) => {
    setCurrentTariff(tariff);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteTariff = async () => {
    if (!currentTariff) return;

    setIsSubmitting(true);
    const toastId = showLoading(`"${currentTariff.title}" tarifi o'chirilmoqda...`);

    try {
      const { error } = await supabase
        .from('tariffs')
        .delete()
        .eq('id', currentTariff.id);

      if (error) {
        throw error;
      }

      showSuccess(`"${currentTariff.title}" tarifi muvaffaqiyatli o'chirildi!`);
      fetchTariffs();
      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      console.error("Tarifni o'chirishda xato:", error);
      showError(`Tarifni o'chirishda xato: ${error.message || "Noma'lum xato"}`);
    } finally {
      dismissToast(toastId);
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof tariffSchema>) => {
    setIsSubmitting(true);
    const toastId = showLoading(currentTariff ? `"${values.title}" tarifi yangilanmoqda...` : `"${values.title}" tarifi qo'shilmoqda...`);

    try {
      const featuresArray = values.features.split('\n').map(f => f.trim()).filter(f => f.length > 0);

      if (currentTariff) {
        // Update existing tariff
        const { error } = await supabase
          .from('tariffs')
          .update({
            title: values.title,
            price: values.price,
            description: values.description,
            features: featuresArray,
            type: values.type,
            gradient_class: values.gradient_class,
          })
          .eq('id', currentTariff.id);

        if (error) throw error;
        showSuccess(`"${values.title}" tarifi muvaffaqiyatli yangilandi!`);
      } else {
        // Add new tariff
        const { error } = await supabase
          .from('tariffs')
          .insert([
            {
              title: values.title,
              price: values.price,
              description: values.description,
              features: featuresArray,
              type: values.type,
              gradient_class: values.gradient_class,
            },
          ]);

        if (error) throw error;
        showSuccess(`"${values.title}" tarifi muvaffaqiyatli qo'shildi!`);
      }

      fetchTariffs();
      setIsAddDialogOpen(false);
      setIsEditDialogOpen(false);
    } catch (error: any) {
      console.error("Tarifni saqlashda xato:", error);
      showError(`Tarifni saqlashda xato: ${error.message || "Noma'lum xato"}`);
    } finally {
      dismissToast(toastId);
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="shadow-lg bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-foreground">Tariflar Boshqaruvi</CardTitle>
          <CardDescription className="text-muted-foreground">Tariflar yuklanmoqda...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-8 w-8 animate-spin text-ferrari-red" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg bg-card text-card-foreground">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-foreground">Tariflar Boshqaruvi</CardTitle>
        <CardDescription className="text-muted-foreground">
          Platformadagi tariflarni qo'shish, tahrirlash va o'chirish.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleAddClick} className="mb-6 bg-ferrari-red hover:bg-red-700 text-white">
          <PlusCircle className="mr-2 h-4 w-4" /> Yangi tarif qo'shish
        </Button>

        {tariffs.length === 0 ? (
          <p className="text-center text-muted-foreground">Hozircha tariflar mavjud emas.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-800 hover:bg-gray-700">
                  <TableHead className="rounded-tl-lg text-gray-100">Sarlavha</TableHead>
                  <TableHead className="text-gray-100">Narxi</TableHead>
                  <TableHead className="text-gray-100">Turi</TableHead>
                  <TableHead className="text-gray-100">Xususiyatlar</TableHead>
                  <TableHead className="rounded-tr-lg text-right text-gray-100">Amallar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tariffs.map((tariff) => (
                  <TableRow key={tariff.id} className="hover:bg-red-950 transition duration-150">
                    <TableCell className="font-medium text-foreground">{tariff.title}</TableCell>
                    <TableCell className="text-ferrari-red font-bold">{tariff.price.toLocaleString()} UZS</TableCell>
                    <TableCell>
                      <Badge className={tariff.type === 'online' ? 'bg-blue-500' : 'bg-purple-500'}>
                        {tariff.type === 'online' ? 'ONLINE' : 'Farg\'ona'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-xs truncate">
                      {tariff.features.join(', ')}
                    </TableCell>
                    <TableCell className="text-right flex items-center justify-end">
                      <CustomEditButton onClick={() => handleEditClick(tariff)} disabled={isSubmitting} />
                      <CustomDeleteButton onClick={() => handleDeleteClick(tariff)} disabled={isSubmitting} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Add/Edit Tariff Dialog */}
      <Dialog open={isAddDialogOpen || isEditDialogOpen} onOpenChange={isAddDialogOpen ? setIsAddDialogOpen : setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-card text-card-foreground">
          <DialogHeader>
            <DialogTitle className="text-ferrari-red">
              {currentTariff ? "Tarifni Tahrirlash" : "Yangi Tarif Qo'shish"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Tarif ma'lumotlarini kiriting yoki tahrirlang.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sarlavha</FormLabel>
                    <FormControl>
                      <Input placeholder="Masalan: Group English" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Narxi (UZS)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="660000" {...field} disabled={isSubmitting} />
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
                    <FormLabel>Tavsifi (ixtiyoriy)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Tarif haqida qisqacha tavsif..." rows={3} {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="features"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Xususiyatlar (har birini yangi qatordan kiriting)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="12 ta dars&#10;Student's Book va Grammar book" rows={5} {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Turi</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Tarif turini tanlang" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="fargona">Farg'ona</SelectItem>
                        <SelectItem value="online">ONLINE</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gradient_class"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mavzu (Gradient)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Gradient mavzusini tanlang" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {gradientThemes.map((theme) => (
                          <SelectItem key={theme.value} value={theme.value}>
                            <div className="flex items-center">
                              <span className={`w-4 h-4 rounded-full mr-2 ${theme.value}`}></span>
                              {theme.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Tarif kartochkasi uchun rang mavzusini tanlang.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="mt-6">
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={isSubmitting}>Bekor qilish</Button>
                </DialogClose>
                <Button type="submit" className="bg-ferrari-red hover:bg-red-700" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saqlanmoqda...
                    </>
                  ) : (
                    "Saqlash"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Tariff Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-card text-card-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-ferrari-red">Tarifni O'chirishni Tasdiqlaysizmi?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Siz <strong>"{currentTariff?.title}"</strong> tarifini butunlay o'chirib tashlamoqchisiz. Bu amalni qaytarib bo'lmaydi. Ishonchingiz komilmi?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteTariff}
              disabled={isSubmitting}
              className="bg-destructive hover:bg-red-700 text-white"
            >
              {isSubmitting ? "O'chirilmoqda..." : "O'chirish"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

export default TariffManagementPanel;