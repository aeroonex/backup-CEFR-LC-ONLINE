"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Bell, MailOpen, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/components/auth/SessionContextProvider';
import { showError } from '@/utils/toast';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  created_at: string;
  message: string;
  is_read: boolean;
  user_id: string | null;
  sent_by: string | null;
  profiles?: { username: string | null } | null; // For sent_by user
  recipient_profile?: { username: string | null } | null; // For user_id recipient
}

const notificationSound = new Audio('/sounds/notification.mp3'); // Ovoz fayli joylashuvi

const UserNotifications: React.FC = () => {
  const { user, isLoading: isSessionLoading } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const lastNotificationIdRef = useRef<string | null>(null); // Oxirgi kelgan bildirishnoma ID'sini saqlash uchun

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setIsLoadingNotifications(false);
      return;
    }

    setIsLoadingNotifications(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          profiles!fk_notifications_sent_by(username),
          recipient_profile:profiles!fk_notifications_user_id(username)
        `)
        .or(`user_id.eq.${user.id},user_id.is.null`) // Faqat o'ziga yoki barchaga yuborilganlarni olish
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const fetchedNotifications: Notification[] = data || [];
      const currentUnreadCount = fetchedNotifications.filter(n => !n.is_read).length;
      setNotifications(fetchedNotifications);
      setUnreadCount(currentUnreadCount);

      // Yangi bildirishnoma kelganini tekshirish va ovoz chiqarish
      if (fetchedNotifications.length > 0 && lastNotificationIdRef.current !== fetchedNotifications[0].id) {
        const newUnreadNotifications = fetchedNotifications.filter(n => !n.is_read);
        if (newUnreadNotifications.length > 0) {
          notificationSound.play().catch(e => console.error("Ovozni ijro etishda xato:", e));
        }
        lastNotificationIdRef.current = fetchedNotifications[0].id;
      }

    } catch (error: any) {
      console.error("Bildirishnomalarni yuklashda xato:", error);
      showError(`Bildirishnomalarni yuklashda xato: ${error.message || "Noma'lum xato"}`);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setIsLoadingNotifications(false);
    }
  }, [user]);

  useEffect(() => {
    if (!isSessionLoading && user) {
      fetchNotifications();
      // Har 10 soniyada bildirishnomalarni yangilash
      const interval = setInterval(fetchNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [isSessionLoading, user, fetchNotifications]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user?.id); // Faqat o'zining bildirishnomasini o'qilgan deb belgilash

      if (error) {
        throw error;
      }
      fetchNotifications(); // Yangilangan ro'yxatni olish
    } catch (error: any) {
      console.error("Bildirishnomani o'qilgan deb belgilashda xato:", error);
      showError(`Bildirishnomani o'qilgan deb belgilashda xato: ${error.message || "Noma'lum xato"}`);
    }
  }, [user, fetchNotifications]);

  const markAllAsRead = useCallback(async () => {
    if (!user || unreadCount === 0) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) {
        throw error;
      }
      fetchNotifications();
    } catch (error: any) {
      console.error("Barcha bildirishnomalarni o'qilgan deb belgilashda xato:", error);
      showError(`Barcha bildirishnomalarni o'qilgan deb belgilashda xato: ${error.message || "Noma'lum xato"}`);
    }
  }, [user, unreadCount, fetchNotifications]);

  if (isSessionLoading || !user) {
    return null; // Foydalanuvchi yuklanmaguncha yoki tizimga kirmaguncha ko'rsatmaslik
  }

  return (
    <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-12 w-12 rounded-full p-0 flex-shrink-0">
          <Bell className="h-6 w-6 text-gray-600" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-ferrari-red text-white text-xs">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end" forceMount>
        <DropdownMenuLabel className="font-normal flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-900">Bildirishnomalar</span>
          {unreadCount > 0 && (
            <Button variant="link" size="sm" onClick={markAllAsRead} className="text-ferrari-red hover:text-red-700">
              Hammasini o'qilgan deb belgilash
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[300px]">
          {isLoadingNotifications ? (
            <div className="flex flex-col items-center justify-center h-full py-4">
              <Loader2 className="h-6 w-6 animate-spin text-ferrari-red" />
              <span className="mt-2 text-sm text-gray-600">Yuklanmoqda...</span>
            </div>
          ) : notifications.length === 0 ? (
            <p className="text-center text-gray-500 py-4">Hozircha bildirishnomalar yo'q.</p>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex flex-col items-start p-3 cursor-pointer ${!notification.is_read ? 'bg-red-50/50 hover:bg-red-100' : 'hover:bg-gray-50'}`}
                onClick={() => !notification.is_read && markAsRead(notification.id)}
              >
                <div className="flex justify-between w-full">
                  <p className={`text-sm font-medium ${!notification.is_read ? 'text-ferrari-red' : 'text-gray-800'}`}>
                    {notification.message}
                  </p>
                  {!notification.is_read && <MailOpen className="h-4 w-4 text-ferrari-red flex-shrink-0" />}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: {
                    formatDistance: (token, count, options) => {
                      if (token === 'xSeconds') return `${count} soniya oldin`;
                      if (token === 'xMinutes') return `${count} daqiqa oldin`;
                      if (token === 'xHours') return `${count} soat oldin`;
                      if (token === 'xDays') return `${count} kun oldin`;
                      if (token === 'xMonths') return `${count} oy oldin`;
                      if (token === 'xYears') return `${count} yil oldin`;
                      return `${count} ${token} oldin`;
                    }
                  }})}
                </p>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserNotifications;