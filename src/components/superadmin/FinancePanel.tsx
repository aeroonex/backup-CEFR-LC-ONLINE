"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Clock } from "lucide-react"; // Icons for trends and Clock
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';
import LoadingSpinner from "@/components/ui/LoadingSpinner"; // Import LoadingSpinner
import { formatTime } from '@/utils/formatters'; // Import formatTime utility

interface FinancialData {
  totalRevenue: number;
  totalSales: number;
}

const FinancePanel: React.FC = () => {
  const [currentMonthData, setCurrentMonthData] = useState<FinancialData | null>(null);
  const [previousMonthData, setPreviousMonthData] = useState<FinancialData | null>(null);
  const [totalUsersTimeSpent, setTotalUsersTimeSpent] = useState<number>(0); // Yangi state
  const [isLoading, setIsLoading] = useState(true);

  const fetchFinancialData = useCallback(async () => {
    setIsLoading(true);
    try {
      const today = new Date();

      // Current Month
      const currentMonthStart = startOfMonth(today);
      const currentMonthEnd = endOfMonth(today);
      const currentMonthStartISO = format(currentMonthStart, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");
      const currentMonthEndISO = format(currentMonthEnd, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");

      const { data: currentData, error: currentError } = await supabase
        .from('user_courses')
        .select('price_at_purchase')
        .gte('purchased_at', currentMonthStartISO)
        .lt('purchased_at', currentMonthEndISO);

      if (currentError) throw currentError;

      const currentTotalRevenue = currentData.reduce((sum, item) => sum + (item.price_at_purchase || 0), 0);
      const currentTotalSales = currentData.length;
      setCurrentMonthData({ totalRevenue: currentTotalRevenue, totalSales: currentTotalSales });

      // Previous Month
      const previousMonth = subMonths(today, 1);
      const previousMonthStart = startOfMonth(previousMonth);
      const previousMonthEnd = endOfMonth(previousMonth);
      const previousMonthStartISO = format(previousMonthStart, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");
      const previousMonthEndISO = format(previousMonthEnd, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");

      const { data: previousData, error: previousError } = await supabase
        .from('user_courses')
        .select('price_at_purchase')
        .gte('purchased_at', previousMonthStartISO)
        .lt('purchased_at', previousMonthEndISO);

      if (previousError) throw previousError;

      const previousTotalRevenue = previousData.reduce((sum, item) => sum + (item.price_at_purchase || 0), 0);
      const previousTotalSales = previousData.length;
      setPreviousMonthData({ totalRevenue: previousTotalRevenue, totalSales: previousTotalSales });

      // Fetch total time spent by all non-developer users
      const { data: profilesTimeData, error: profilesTimeError } = await supabase
        .from('profiles')
        .select('total_time_spent_seconds')
        .neq('role', 'developer'); // Developer bo'lmagan foydalanuvchilarni tanlash

      if (profilesTimeError) throw profilesTimeError;

      const totalTime = profilesTimeData.reduce((sum, profile) => sum + (profile.total_time_spent_seconds || 0), 0);
      setTotalUsersTimeSpent(totalTime);

    } catch (error: any) {
      console.error("Moliyaviy ma'lumotlarni yuklashda xato:", error);
      showError(`Moliyaviy ma'lumotlarni yuklashda xato: ${error.message || "Noma'lum xato"}`);
      setCurrentMonthData({ totalRevenue: 0, totalSales: 0 });
      setPreviousMonthData({ totalRevenue: 0, totalSales: 0 });
      setTotalUsersTimeSpent(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFinancialData();
  }, [fetchFinancialData]);

  const revenueChangePercentage = previousMonthData?.totalRevenue !== 0
    ? ((currentMonthData?.totalRevenue || 0) - (previousMonthData?.totalRevenue || 0)) / (previousMonthData?.totalRevenue || 1) * 100
    : (currentMonthData?.totalRevenue || 0) > 0 ? 100 : 0;

  const salesChangePercentage = previousMonthData?.totalSales !== 0
    ? ((currentMonthData?.totalSales || 0) - (previousMonthData?.totalSales || 0)) / (previousMonthData?.totalSales || 1) * 100
    : (currentMonthData?.totalSales || 0) > 0 ? 100 : 0;

  const averagePrice = (currentMonthData?.totalSales || 0) > 0
    ? (currentMonthData?.totalRevenue || 0) / (currentMonthData?.totalSales || 1)
    : 0;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-b-4 border-green-500 shadow-lg bg-card text-card-foreground"> {/* Use semantic colors */}
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-500 uppercase tracking-wider"> {/* Adjusted green shade */}
              JAMI TUSHUM
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center p-6">
            <LoadingSpinner />
          </CardContent>
        </Card>
        <Card className="border-b-4 border-ferrari-red shadow-lg bg-card text-card-foreground"> {/* Use semantic colors */}
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-ferrari-red uppercase tracking-wider">
              SOTUVLAR SONI
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center p-6">
            <LoadingSpinner />
          </CardContent>
        </Card>
        <Card className="border-b-4 border-blue-500 shadow-lg bg-card text-card-foreground"> {/* Use semantic colors */}
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-500 uppercase tracking-wider"> {/* Adjusted blue shade */}
              O'RTACHA NARX
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center p-6">
            <LoadingSpinner />
          </CardContent>
        </Card>
        <Card className="border-b-4 border-purple-500 shadow-lg bg-card text-card-foreground"> {/* Use semantic colors */}
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-500 uppercase tracking-wider"> {/* Adjusted purple shade */}
              UMUMIY SARFLAGAN VAQT
            </CardTitle>
            <Clock className="h-5 w-5 text-purple-500" /> {/* Adjusted purple shade */}
          </CardHeader>
          <CardContent className="flex items-center justify-center p-6">
            <LoadingSpinner />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* JAMI TUSHUM KARTASI */}
      <Card className="border-b-4 border-green-500 shadow-lg bg-card text-card-foreground"> {/* Use semantic colors */}
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-500 uppercase tracking-wider"> {/* Adjusted green shade */}
            JAMI TUSHUM
          </CardTitle>
          {/* Adjusted green shade */}
          {revenueChangePercentage >= 0 ? (
            <ArrowUp className="h-5 w-5 text-green-500" />
          ) : (
            <ArrowDown className="h-5 w-5 text-ferrari-red" />
          )}
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-extrabold text-foreground">{(currentMonthData?.totalRevenue || 0).toLocaleString()} UZS</div> {/* Use semantic colors */}
          <p className={`mt-1 text-sm ${revenueChangePercentage >= 0 ? 'text-green-500' : 'text-ferrari-red'}`}> {/* Adjusted green shade */}
            {revenueChangePercentage.toFixed(1)}% o'tgan oydan
          </p>
        </CardContent>
      </Card>

      {/* SOTUVLAR SONI KARTASI */}
      <Card className="border-b-4 border-ferrari-red shadow-lg bg-card text-card-foreground"> {/* Use semantic colors */}
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-ferrari-red uppercase tracking-wider">
            SOTUVLAR SONI
          </CardTitle>
          {/* Adjusted green shade */}
          {salesChangePercentage >= 0 ? (
            <ArrowUp className="h-5 w-5 text-green-500" />
          ) : (
            <ArrowDown className="h-5 w-5 text-ferrari-red" />
          )}
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-extrabold text-foreground">{(currentMonthData?.totalSales || 0).toLocaleString()} ta</div> {/* Use semantic colors */}
          <p className={`mt-1 text-sm ${salesChangePercentage >= 0 ? 'text-green-500' : 'text-ferrari-red'}`}> {/* Adjusted green shade */}
            {salesChangePercentage.toFixed(1)}% o'tgan oydan
          </p>
        </CardContent>
      </Card>

      {/* O'rtacha Kurs Narxi KARTASI */}
      <Card className="border-b-4 border-blue-500 shadow-lg bg-card text-card-foreground"> {/* Use semantic colors */}
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-500 uppercase tracking-wider"> {/* Adjusted blue shade */}
            O'RTACHA NARX
          </CardTitle>
          <ArrowUp className="h-5 w-5 text-blue-500" /> {/* Adjusted blue shade */}
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-extrabold text-foreground">{averagePrice.toLocaleString(undefined, { maximumFractionDigits: 0 })} UZS</div> {/* Use semantic colors */}
          <p className="mt-1 text-sm text-muted-foreground"> {/* Use semantic colors */}
            Joriy oy uchun o'rtacha narx
          </p>
        </CardContent>
      </Card>

      {/* Umumiy Sarflangan Vaqt Kartasi (Yangi) */}
      <Card className="border-b-4 border-purple-500 shadow-lg bg-card text-card-foreground"> {/* Use semantic colors */}
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-500 uppercase tracking-wider"> {/* Adjusted purple shade */}
            UMUMIY SARFLAGAN VAQT
          </CardTitle>
          <Clock className="h-5 w-5 text-purple-500" /> {/* Adjusted purple shade */}
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-extrabold text-foreground">{formatTime(totalUsersTimeSpent)}</div> {/* Use semantic colors */}
          <p className="mt-1 text-sm text-muted-foreground"> {/* Use semantic colors */}
            Barcha foydalanuvchilarning platformada sarflagan umumiy vaqti.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancePanel;