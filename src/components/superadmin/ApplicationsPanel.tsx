"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Phone, User as UserIcon, Loader2, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import CustomDeleteButton from '@/components/ui/CustomDeleteButton'; // Import CustomDeleteButton

interface Application {
  id: string;
  created_at: string;
  user_id: string | null;
  name: string;
  phone: string;
  message: string;
  status: 'pending' | 'contacted' | 'rejected';
}

const ApplicationsPanel: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false); // State for delete dialog
  const [applicationToDelete, setApplicationToDelete] = useState<Application | null>(null); // State for application to delete
  const [isDeleting, setIsDeleting] = useState(false); // State for delete loading

  const fetchApplications = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }
      setApplications(data || []);
    } catch (error: any) {
      console.error("Arizalarni yuklashda xato:", error);
      showError(`Arizalarni yuklashda xato: ${error.message || "Noma'lum xato"}`);
      setApplications([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleUpdateApplicationStatus = async (applicationId: string, newStatus: 'pending' | 'contacted' | 'rejected') => {
    setIsUpdating(true);
    const toastId = showLoading(`Ariza holati yangilanmoqda...`);
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status: newStatus })
        .eq('id', applicationId);

      if (error) {
        throw error;
      }
      showSuccess(`Ariza holati muvaffaqiyatli ${newStatus === 'contacted' ? 'bog\'lanildi' : newStatus === 'rejected' ? 'rad etildi' : 'kutilmoqda'} deb yangilandi!`);
      fetchApplications(); // Refresh the list
    } catch (error: any) {
      console.error("Ariza holatini yangilashda xato:", error);
      showError(`Holatni yangilashda xato: ${error.message || "Noma'lum xato"}`);
    } finally {
      dismissToast(toastId);
      setIsUpdating(false);
    }
  };

  const handleViewMessage = (message: string) => {
    setCurrentMessage(message);
    setIsMessageDialogOpen(true);
  };

  const handleDeleteClick = (application: Application) => {
    setApplicationToDelete(application);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteApplication = async () => {
    if (!applicationToDelete) return;

    setIsDeleting(true);
    const toastId = showLoading(`"${applicationToDelete.name}" arizasi o'chirilmoqda...`);

    try {
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', applicationToDelete.id);

      if (error) {
        throw error;
      }

      showSuccess(`"${applicationToDelete.name}" arizasi muvaffaqiyatli o'chirildi!`);
      fetchApplications(); // Refresh the list
      setIsDeleteDialogOpen(false);
      setApplicationToDelete(null);
    } catch (error: any) {
      console.error("Arizani o'chirishda xato:", error);
      showError(`Arizani o'chirishda xato: ${error.message || "Noma'lum xato"}`);
    } finally {
      dismissToast(toastId);
      setIsDeleting(false);
    }
  };

  const getStatusBadgeVariant = (status: Application['status']) => {
    switch (status) {
      case 'contacted':
        return 'bg-green-500 hover:bg-green-600';
      case 'rejected':
        return 'bg-red-500 hover:bg-red-600';
      case 'pending':
      default:
        return 'bg-orange-500 hover:bg-orange-600';
    }
  };

  if (isLoading) {
    return (
      <Card className="shadow-lg bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-foreground">Arizalar Boshqaruvi</CardTitle>
          <CardDescription className="text-muted-foreground">Arizalar yuklanmoqda...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-6">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg bg-card text-card-foreground">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-foreground">Arizalar Boshqaruvi</CardTitle>
        <CardDescription className="text-muted-foreground">
          Foydalanuvchilar tomonidan yuborilgan barcha arizalarni ko'rib chiqing va ularning holatini boshqaring.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {applications.length === 0 ? (
          <p className="text-center text-muted-foreground">Hozircha arizalar mavjud emas.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-800 hover:bg-gray-700">
                  <TableHead className="rounded-tl-lg text-gray-100">Ism</TableHead>
                  <TableHead className="text-gray-100">Telefon</TableHead>
                  <TableHead className="text-gray-100">Xabar</TableHead>
                  <TableHead className="text-gray-100">Holat</TableHead>
                  <TableHead className="text-gray-100">Yuborilgan sana</TableHead>
                  <TableHead className="rounded-tr-lg text-right text-gray-100">Amallar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((application) => (
                  <TableRow key={application.id} className="hover:bg-red-950 transition duration-150">
                    <TableCell className="font-medium text-foreground flex items-center gap-2">
                      <UserIcon className="h-4 w-4 text-gray-500" />
                      {application.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <a href={`tel:${application.phone}`} className="text-blue-400 hover:underline">{application.phone}</a>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewMessage(application.message)}
                        className="flex items-center gap-1 text-blue-400 hover:text-blue-500 border-blue-400 hover:border-blue-500"
                      >
                        <MessageSquare className="h-4 w-4" /> Ko'rish
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeVariant(application.status)}>
                        {application.status === 'pending' ? 'Kutilmoqda' : application.status === 'contacted' ? 'Bog\'lanildi' : 'Rad etilgan'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{format(new Date(application.created_at), 'dd.MM.yyyy HH:mm')}</TableCell>
                    <TableCell className="text-right flex items-center justify-end space-x-2">
                      <Select
                        onValueChange={(value: 'pending' | 'contacted' | 'rejected') => handleUpdateApplicationStatus(application.id, value)}
                        value={application.status}
                        disabled={isUpdating}
                      >
                        <SelectTrigger className="w-[180px] bg-gray-700 text-white border-gray-600 hover:border-gray-500">
                          <SelectValue placeholder="Holatni o'zgartirish" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 text-white border-gray-700">
                          <SelectItem value="pending">Kutilmoqda</SelectItem>
                          <SelectItem value="contacted">Bog'lanildi</SelectItem>
                          <SelectItem value="rejected">Rad etilgan</SelectItem>
                        </SelectContent>
                      </Select>
                      <CustomDeleteButton onClick={() => handleDeleteClick(application)} disabled={isDeleting} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Message View Dialog */}
      <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card text-card-foreground">
          <DialogHeader>
            <DialogTitle className="text-ferrari-red">Foydalanuvchi Xabari</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Foydalanuvchi tomonidan yuborilgan xabar matni.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-foreground whitespace-pre-wrap">{currentMessage}</p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Yopish</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Application Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-card text-card-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-ferrari-red">Arizani O'chirishni Tasdiqlaysizmi?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Siz <strong>"{applicationToDelete?.name}"</strong> tomonidan yuborilgan arizani butunlay o'chirib tashlamoqchisiz. Bu amalni qaytarib bo'lmaydi. Ishonchingiz komilmi?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteApplication}
              disabled={isDeleting}
              className="bg-destructive hover:bg-red-700 text-white"
            >
              {isDeleting ? "O'chirilmoqda..." : "O'chirish"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default ApplicationsPanel;