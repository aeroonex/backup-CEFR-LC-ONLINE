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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { PlusCircle, Send, Trash2, Loader2, User as UserIcon, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import CustomDeleteButton from '@/components/ui/CustomDeleteButton';
import { useSession } from '@/components/auth/SessionContextProvider';
import { format } from 'date-fns';

interface Notification {
  id: string;
  created_at: string;
  user_id: string | null;
  message: string;
  is_read: boolean;
  sent_by: string | null;
  profiles?: { username: string | null } | null; // For sent_by user
  recipient_profile?: { username: string | null } | null; // For user_id recipient
}

interface UserOption {
  id: string;
  username: string;
  email: string;
}

const NotificationManagementPanel: React.FC = () => {
  const { user: adminUser } = useSession();
  const [message, setMessage] = useState('');
  const [recipientType, setRecipientType] = useState<'all' | 'specific'>('all');
  const [selectedRecipientId, setSelectedRecipientId] = useState<string | null>(null);
  const [userOptions, setUserOptions] = useState<UserOption[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<Notification | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUsersAndNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch all non-developer users for recipient options
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, username')
        .neq('role', 'developer');

      if (usersError) throw usersError;
      const mappedUsers: UserOption[] = (usersData || []).map(p => ({
        id: p.id,
        username: p.username || 'Noma\'lum',
        email: '', // Email not needed for this panel, but keeping type consistent
      }));
      setUserOptions(mappedUsers);

      // Fetch all notifications sent by this admin or all if admin has permission
      const { data: notificationsData, error: notificationsError } = await supabase
        .from('notifications')
        .select(`
          *,
          profiles!fk_notifications_sent_by(username),
          recipient_profile:profiles!fk_notifications_user_id(username)
        `)
        .order('created_at', { ascending: false });

      if (notificationsError) throw notificationsError;
      setNotifications(notificationsData || []);

    } catch (error: any) {
      console.error("Ma'lumotlarni yuklashda xato:", error);
      showError(`Ma'lumotlarni yuklashda xato: ${error.message || "Noma'lum xato"}`);
      setUserOptions([]);
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsersAndNotifications();
  }, [fetchUsersAndNotifications]);

  const handleSendMessage = async () => {
    if (!adminUser?.id) {
      showError("Bildirishnoma yuborish uchun tizimga kiring.");
      return;
    }
    if (!message.trim()) {
      showError("Iltimos, xabar matnini kiriting.");
      return;
    }
    if (recipientType === 'specific' && !selectedRecipientId) {
      showError("Iltimos, xabar yuborish uchun foydalanuvchini tanlang.");
      return;
    }

    setIsSending(true);
    const toastId = showLoading("Bildirishnoma yuborilmoqda...");

    try {
      const notificationData = {
        message: message.trim(),
        user_id: recipientType === 'specific' ? selectedRecipientId : null,
        sent_by: adminUser.id,
      };

      const { error } = await supabase
        .from('notifications')
        .insert([notificationData]);

      if (error) {
        throw error;
      }

      showSuccess("Bildirishnoma muvaffaqiyatli yuborildi!");
      setMessage('');
      setSelectedRecipientId(null);
      setRecipientType('all');
      fetchUsersAndNotifications(); // Refresh the list
    } catch (error: any) {
      console.error("Bildirishnoma yuborishda xato:", error);
      showError(`Bildirishnoma yuborishda xato: ${error.message || "Noma'lum xato"}`);
    } finally {
      dismissToast(toastId);
      setIsSending(false);
    }
  };

  const handleDeleteClick = (notification: Notification) => {
    setNotificationToDelete(notification);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteNotification = async () => {
    if (!notificationToDelete) return;

    setIsDeleting(true);
    const toastId = showLoading("Bildirishnoma o'chirilmoqda...");

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationToDelete.id);

      if (error) {
        throw error;
      }

      showSuccess("Bildirishnoma muvaffaqiyatli o'chirildi!");
      fetchUsersAndNotifications();
      setIsDeleteDialogOpen(false);
      setNotificationToDelete(null);
    } catch (error: any) {
      console.error("Bildirishnomani o'chirishda xato:", error);
      showError(`Bildirishnomani o'chirishda xato: ${error.message || "Noma'lum xato"}`);
    } finally {
      dismissToast(toastId);
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="shadow-lg bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-foreground">Bildirishnomalarni Boshqarish</CardTitle>
          <CardDescription className="text-muted-foreground">Ma'lumotlar yuklanmoqda...</CardDescription>
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
        <CardTitle className="text-2xl font-semibold text-foreground">Bildirishnomalarni Boshqarish</CardTitle>
        <CardDescription className="text-muted-foreground">
          Foydalanuvchilarga bildirishnomalar yuboring va yuborilgan xabarlarni boshqaring.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-8 p-6 border rounded-lg bg-gray-800">
          <h3 className="text-xl font-semibold text-foreground mb-4">Yangi bildirishnoma yuborish</h3>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="message">Xabar matni</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Foydalanuvchilarga yubormoqchi bo'lgan xabaringizni kiriting..."
                rows={4}
                disabled={isSending}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="recipient-type">Qabul qiluvchi</Label>
              <Select value={recipientType} onValueChange={(value: 'all' | 'specific') => setRecipientType(value)} disabled={isSending}>
                <SelectTrigger id="recipient-type">
                  <SelectValue placeholder="Qabul qiluvchini tanlang" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Barcha foydalanuvchilarga</SelectItem>
                  <SelectItem value="specific">Ma'lum bir foydalanuvchiga</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {recipientType === 'specific' && (
              <div className="grid gap-2">
                <Label htmlFor="specific-user">Foydalanuvchini tanlang</Label>
                <Select value={selectedRecipientId || ''} onValueChange={setSelectedRecipientId} disabled={isSending}>
                  <SelectTrigger id="specific-user">
                    <SelectValue placeholder="Foydalanuvchini qidirish..." />
                  </SelectTrigger>
                  <SelectContent>
                    {userOptions.length === 0 ? (
                      <SelectItem value="no-users" disabled>Foydalanuvchilar topilmadi</SelectItem>
                    ) : (
                      userOptions.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.username}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
            <Button onClick={handleSendMessage} disabled={isSending} className="bg-ferrari-red hover:bg-red-700 text-white">
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Yuborilmoqda...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" /> Bildirishnoma yuborish
                </>
              )}
            </Button>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-foreground mb-4">Yuborilgan bildirishnomalar</h3>
        {notifications.length === 0 ? (
          <p className="text-center text-muted-foreground">Hozircha yuborilgan bildirishnomalar mavjud emas.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-800 hover:bg-gray-700">
                  <TableHead className="rounded-tl-lg text-gray-100">Xabar</TableHead>
                  <TableHead className="text-gray-100">Qabul qiluvchi</TableHead>
                  <TableHead className="text-gray-100">Yuboruvchi</TableHead>
                  <TableHead className="text-gray-100">Sana</TableHead>
                  <TableHead className="rounded-tr-lg text-right text-gray-100">Amallar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.map((notification) => (
                  <TableRow key={notification.id} className="hover:bg-red-950 transition duration-150">
                    <TableCell className="font-medium text-foreground max-w-xs truncate">{notification.message}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {notification.user_id ? (
                        <span className="flex items-center gap-1">
                          <UserIcon className="h-4 w-4" /> {notification.recipient_profile?.username || 'Noma\'lum foydalanuvchi'}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" /> Barchaga
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{notification.profiles?.username || 'Noma\'lum admin'}</TableCell>
                    <TableCell className="text-muted-foreground">{format(new Date(notification.created_at), 'dd.MM.yyyy HH:mm')}</TableCell>
                    <TableCell className="text-right">
                      <CustomDeleteButton onClick={() => handleDeleteClick(notification)} disabled={isDeleting} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Delete Notification Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-card text-card-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-ferrari-red">Bildirishnomani O'chirishni Tasdiqlaysizmi?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Siz ushbu bildirishnomani butunlay o'chirib tashlamoqchisiz. Bu amalni qaytarib bo'lmaydi. Ishonchingiz komilmi?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteNotification}
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

export default NotificationManagementPanel;