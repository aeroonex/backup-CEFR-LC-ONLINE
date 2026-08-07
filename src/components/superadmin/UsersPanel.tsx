"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import { formatDistanceToNowStrict, isWithinInterval, subMinutes } from 'date-fns';
import { CircleDot, CircleOff, DollarSign, BookOpen, Wallet, Trash2 } from 'lucide-react'; // Add Wallet and Trash2 icons
import UserPurchasedCoursesDialog from './UserPurchasedCoursesDialog';
import UserBalanceDialog from './UserBalanceDialog'; // Import UserBalanceDialog
import UserDeleteDialog from './UserDeleteDialog'; // Import UserDeleteDialog
import CustomEditButton from '@/components/ui/CustomEditButton'; // Import CustomEditButton
import CustomDeleteButton from '@/components/ui/CustomDeleteButton'; // Import CustomDeleteButton

interface UserProfile {
  id: string;
  username: string;
  email: string;
  created_at: string;
  total_time_spent_seconds: number;
  last_seen_at: string | null;
  role: string;
  balance: number;
  total_spent: number;
  purchased_courses_count: number;
}

const UsersPanel: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCoursesDialogOpen, setIsCoursesDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUsername, setSelectedUsername] = useState<string>('');
  const [selectedUserBalance, setSelectedUserBalance] = useState<number>(0); // State for selected user's balance

  const [isBalanceDialogOpen, setIsBalanceDialogOpen] = useState(false); // State for balance dialog
  const [isUserDeleteDialogOpen, setIsUserDeleteDialogOpen] = useState(false); // State for user delete dialog

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        throw new Error("Foydalanuvchi sessiyasi topilmadi.");
      }

      const { data, error } = await supabase.functions.invoke('list-users', {
        headers: {
          'Authorization': `Bearer ${sessionData.session.access_token}`,
        },
      });

      if (error) {
        throw error;
      }

      setUsers(data as UserProfile[]);
    } catch (error: any) {
      console.error("Foydalanuvchilarni yuklashda xato:", error);
      showError(`Foydalanuvchilarni yuklashda xato: ${error.message || "Noma'lum xato"}`);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    // Har 30 soniyada foydalanuvchilar ro'yxatini yangilash
    const interval = setInterval(fetchUsers, 30000);
    return () => clearInterval(interval);
  }, [fetchUsers]);

  // Soniyalarni Hh Mm Ss formatiga o'tkazish uchun yordamchi funksiya
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    let formatted = '';
    if (hours > 0) formatted += `${hours} soat `;
    if (minutes > 0) formatted += `${minutes} daqiqa `;
    if (seconds > 0 || formatted === '') formatted += `${seconds} soniya`;

    return formatted.trim();
  };

  const isOnline = (lastSeenAt: string | null) => {
    if (!lastSeenAt) return false;
    const lastSeenDate = new Date(lastSeenAt);
    // Oxirgi 1 daqiqa ichida faol bo'lsa, onlayn hisoblaymiz
    return isWithinInterval(lastSeenDate, { start: subMinutes(new Date(), 1), end: new Date() });
  };

  const handleUserRowClick = (userId: string, username: string) => {
    setSelectedUserId(userId);
    setSelectedUsername(username);
    setIsCoursesDialogOpen(true);
  };

  const handleManageBalanceClick = (user: UserProfile) => {
    setSelectedUserId(user.id);
    setSelectedUsername(user.username || user.email.split('@')[0]);
    setSelectedUserBalance(user.balance);
    setIsBalanceDialogOpen(true);
  };

  const handleDeleteUserClick = (user: UserProfile) => {
    setSelectedUserId(user.id);
    setSelectedUsername(user.username || user.email.split('@')[0]);
    setIsUserDeleteDialogOpen(true);
  };

  if (isLoading) {
    return (
      <Card className="shadow-lg bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-foreground">Foydalanuvchilar Ro'yxati</CardTitle>
          <CardDescription className="text-muted-foreground">Foydalanuvchi ma'lumotlari yuklanmoqda...</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">Foydalanuvchilar yuklanmoqda...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg bg-card text-card-foreground">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-foreground">Faol Foydalanuvchilar (O'quvchilar) Ro'yxati</CardTitle>
        <CardDescription className="text-muted-foreground">Platformadagi barcha ro'yxatdan o'tgan foydalanuvchilar haqida ma'lumot.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-800 hover:bg-gray-700">
                <TableHead className="rounded-tl-lg text-gray-100">Ism-Sharif / Email</TableHead>
                <TableHead className="text-gray-100">Umumiy Sarflangan Vaqt</TableHead>
                <TableHead className="text-gray-100">Balans</TableHead>
                <TableHead className="text-gray-100">Sarflangan</TableHead>
                <TableHead className="text-gray-100">Kurslar</TableHead>
                <TableHead className="text-gray-100">Holat</TableHead>
                <TableHead className="text-gray-100">Ro'yxatdan O'tgan</TableHead>
                <TableHead className="rounded-tr-lg text-right text-gray-100">Amallar</TableHead> {/* New column */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">Hozircha foydalanuvchilar mavjud emas.</TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id} className="hover:bg-red-950 transition duration-150">
                    <TableCell className="font-medium text-foreground cursor-pointer" onClick={() => handleUserRowClick(user.id, user.username || user.email.split('@')[0])}>
                      <p>{user.username}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </TableCell>
                    <TableCell className="text-ferrari-red font-bold">{formatTime(user.total_time_spent_seconds)}</TableCell>
                    <TableCell className="text-green-500 font-bold">{user.balance.toLocaleString()} UZS</TableCell>
                    <TableCell className="text-foreground font-bold">{user.total_spent.toLocaleString()} UZS</TableCell>
                    <TableCell className="text-blue-500 font-bold cursor-pointer" onClick={() => handleUserRowClick(user.id, user.username || user.email.split('@')[0])}>
                      {user.purchased_courses_count} ta
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {isOnline(user.last_seen_at) ? (
                          <>
                            <CircleDot className="h-4 w-4 text-green-500 fill-green-500" />
                            <span className="text-green-500">Onlayn</span>
                          </>
                        ) : (
                          <>
                            <CircleOff className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-400">
                              {user.last_seen_at ? `${formatDistanceToNowStrict(new Date(user.last_seen_at), { addSuffix: true })} oflayn` : 'Noma\'lum'}
                            </span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Noma\'lum'}</TableCell>
                    <TableCell className="text-right flex items-center justify-end">
                      <CustomEditButton onClick={() => handleManageBalanceClick(user)} icon={<Wallet className="h-4 w-4" />} />
                      <CustomDeleteButton onClick={() => handleDeleteUserClick(user)} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-6 flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Jami faol foydalanuvchilar: {users.length}</span>
        </div>
      </CardContent>

      <UserPurchasedCoursesDialog
        isOpen={isCoursesDialogOpen}
        onClose={() => setIsCoursesDialogOpen(false)}
        userId={selectedUserId}
        username={selectedUsername}
      />

      <UserBalanceDialog
        isOpen={isBalanceDialogOpen}
        onClose={() => setIsBalanceDialogOpen(false)}
        userId={selectedUserId}
        username={selectedUsername}
        currentBalance={selectedUserBalance}
        onBalanceUpdated={fetchUsers} // Refresh user list after balance update
      />

      <UserDeleteDialog
        isOpen={isUserDeleteDialogOpen}
        onClose={() => setIsUserDeleteDialogOpen(false)}
        userId={selectedUserId}
        username={selectedUsername}
        onUserDeleted={fetchUsers} // Refresh user list after user deletion
      />
    </Card>
  );
};

export default UsersPanel;