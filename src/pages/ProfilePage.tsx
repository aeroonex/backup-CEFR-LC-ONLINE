"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSession } from "@/components/auth/SessionContextProvider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess, showLoading, dismissToast } from "@/utils/toast";
import { DollarSign, PlusCircle, Clock, Award, TrendingUp } from "lucide-react"; // Clock, Award, TrendingUp ikonkalarni import qilish
import LoadingSpinner from "@/components/ui/LoadingSpinner"; // Import LoadingSpinner
import { formatTime } from '@/utils/formatters'; // Import formatTime utility

const ProfilePage: React.FC = () => {
  const { user, isLoading: isSessionLoading, profile, refreshProfile } = useSession();
  const [topUpAmount, setTopUpAmount] = useState<number | ''>(50000);
  const [isToppingUp, setIsToppingUp] = useState(false);

  const handleTopUp = async () => {
    if (!user || !profile) {
      showError("Balansni to'ldirish uchun avval tizimga kiring.");
      return;
    }
    if (typeof topUpAmount !== 'number' || topUpAmount <= 0) {
      showError("Iltimos, to'g'ri miqdorni kiriting.");
      return;
    }

    setIsToppingUp(true);
    const toastId = showLoading("Balans to'ldirilmoqda...");

    try {
      const currentBalance = profile.balance || 0;
      const newBalance = currentBalance + topUpAmount;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ balance: newBalance })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      showSuccess(`Balans ${topUpAmount.toLocaleString()} UZS ga to'ldirildi!`);
      await refreshProfile();
      setTopUpAmount(50000);
    } catch (error: any) {
      console.error("Balansni to'ldirishda xato:", error);
      showError(`Balansni to'ldirishda xato: ${error.message || "Noma'lum xato"}`);
    } finally {
      dismissToast(toastId);
      setIsToppingUp(false);
    }
  };

  if (isSessionLoading) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm bg-white p-6">
        <LoadingSpinner />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm bg-white p-6">
        <p className="text-gray-500">Profil ma'lumotlari yo'q (tizimga kirilmagan).</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Shaxsiy profil kartasi */}
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-ferrari-red">
            Shaxsiy profil
          </CardTitle>
          <CardDescription className="text-gray-600">
            Bu yerda siz o'z profilingiz ma'lumotlarini boshqarishingiz mumkin.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="username">Foydalanuvchi nomi</Label>
            <Input id="username" type="text" value={profile.username || "Kiritilmagan"} readOnly />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={user?.email || "Noma'lum"} readOnly />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="balance">Balans</Label>
            <Input id="balance" type="text" value={`${profile.balance.toLocaleString()} UZS`} readOnly className="font-bold text-green-600" />
          </div>
          {/* Umumiy sarflangan vaqt */}
          <div className="grid gap-2">
            <Label htmlFor="time-spent">Umumiy sarflangan vaqt</Label>
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-gray-500" />
              <Input
                id="time-spent"
                type="text"
                value={formatTime(profile.total_time_spent_seconds || 0)}
                readOnly
                className="font-medium text-gray-700"
              />
            </div>
          </div>
          {/* Streak */}
          <div className="grid gap-2">
            <Label htmlFor="streak">Streak</Label>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-gray-500" />
              <Input
                id="streak"
                type="text"
                value={`${profile.streak} kun`}
                readOnly
                className="font-medium text-gray-700"
              />
            </div>
          </div>
          {/* XP */}
          <div className="grid gap-2">
            <Label htmlFor="xp">Tajriba ballari (XP)</Label>
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-gray-500" />
              <Input
                id="xp"
                type="text"
                value={`${profile.xp} XP`}
                readOnly
                className="font-medium text-gray-700"
              />
            </div>
          </div>
          {/* Level */}
          <div className="grid gap-2">
            <Label htmlFor="level">Daraja (Level)</Label>
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-gray-500" />
              <Input
                id="level"
                type="text"
                value={`${profile.level}-level`}
                readOnly
                className="font-medium text-gray-700"
              />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Foydalanuvchi ID: {profile.id}
          </p>
        </CardContent>
      </Card>

      {/* Balansni To'ldirish Qismi */}
      <Card className="w-full max-w-md mx-auto shadow-lg border border-gray-100">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center">
            <DollarSign className="w-6 h-6 mr-2 text-green-500" />
            Balansni To'ldirish
          </CardTitle>
          <CardDescription>Balansingizni tez va oson to'ldiring.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="w-full">
            <Label htmlFor="topUpAmount" className="block text-sm font-medium text-gray-700 mb-1">Miqdorni kiriting (UZS)</Label>
            <Input
              type="number"
              id="topUpAmount"
              value={topUpAmount}
              onChange={(e) => setTopUpAmount(parseFloat(e.target.value) || '')}
              min={1000}
              placeholder="Masalan: 50000"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-ferrari-red focus:border-ferrari-red transition duration-150 shadow-inner text-lg"
              disabled={isToppingUp}
            />
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Button variant="outline" onClick={() => setTopUpAmount(50000)} className="px-2 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors border border-gray-300" disabled={isToppingUp}>50K UZS</Button>
            <Button variant="outline" onClick={() => setTopUpAmount(100000)} className="px-2 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors border border-gray-300" disabled={isToppingUp}>100K UZS</Button>
            <Button variant="outline" onClick={() => setTopUpAmount(500000)} className="px-2 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors border border-gray-300" disabled={isToppingUp}>500K UZS</Button>
            <Button variant="outline" onClick={() => setTopUpAmount(1000000)} className="px-2 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors border border-gray-300" disabled={isToppingUp}>1M UZS</Button>
          </div>

          <Button onClick={handleTopUp} className="w-full px-6 py-3 text-white text-lg font-semibold rounded-lg shadow-md bg-ferrari-red hover:bg-red-700 transition duration-200 flex items-center justify-center mt-4" disabled={isToppingUp}>
            <PlusCircle className="w-6 h-6 mr-2" />
            {isToppingUp ? "To'ldirilmoqda..." : "Balansni To'ldirish"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;