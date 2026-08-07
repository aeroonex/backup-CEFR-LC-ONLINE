"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import { formatTime } from '@/utils/formatters'; // Import formatTime utility

const SAVE_INTERVAL_SECONDS = 30; // Ma'lumotlar bazasiga har 30 soniyada saqlash

export const useTimeTracker = (userId: string | undefined | null) => {
  const [sessionTime, setSessionTime] = useState(0); // Joriy sessiyada sarflangan vaqt (soniyalarda)
  const intervalRef = useRef<number | null>(null);
  const lastSavedTimeRef = useRef(0); // Oxirgi saqlangan vaqtdan beri o'tgan vaqtni kuzatish

  const saveTimeToDatabase = useCallback(async (timeToAdd: number) => {
    // Ensure we have a userId and time to add
    if (!userId || timeToAdd <= 0) {
      // console.log("[useTimeTracker] Vaqt saqlanmadi: Foydalanuvchi ID mavjud emas yoki vaqt 0.");
      return;
    }

    // Get the current authenticated user from Supabase to ensure RLS context is valid
    const { data: { user: authenticatedUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !authenticatedUser || authenticatedUser.id !== userId) {
      // This means the user is no longer authenticated or the ID doesn't match the current session.
      // We should not attempt to save time for a logged-out user.
      console.warn(`[useTimeTracker] Vaqt saqlanmadi: Foydalanuvchi ${userId} tizimga kirmagan yoki ID mos kelmadi. Auth error: ${authError?.message}`);
      return;
    }

    try {
      // Joriy umumiy sarflangan vaqtni olish
      const { data: profileData, error: fetchError } = await supabase
        .from('profiles')
        .select('total_time_spent_seconds')
        .eq('id', userId)
        .single();

      if (fetchError) {
        // If profile not found (PGRST116) or other fetch error, log it but don't block.
        // The SessionContextProvider should ensure a profile exists for authenticated users.
        console.error(`[useTimeTracker] Profilni yuklashda xato (userId: ${userId}):`, fetchError);
        // If it's a "no rows found" error, it means the profile somehow disappeared or RLS blocked it.
        // We should probably just stop here.
        return;
      }

      const currentTotalTime = profileData?.total_time_spent_seconds || 0;
      const newTotalTime = currentTotalTime + timeToAdd;

      // console.log(`[useTimeTracker] Foydalanuvchi ${userId} uchun vaqt yangilanmoqda: ${timeToAdd} soniya. Eski umumiy: ${currentTotalTime}, Yangi umumiy: ${newTotalTime}`);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ total_time_spent_seconds: newTotalTime, last_seen_at: new Date().toISOString() }) // Also update last_seen_at here
        .eq('id', userId);

      if (updateError) {
        console.error(`[useTimeTracker] Vaqtni ma'lumotlar bazasiga saqlashda xato (userId: ${userId}, newTotalTime: ${newTotalTime}):`, updateError);
        throw updateError;
      }
      lastSavedTimeRef.current = sessionTime; // Oxirgi saqlangan vaqtni yangilash
      // console.log(`[useTimeTracker] Foydalanuvchi ${userId} uchun vaqt muvaffaqiyatli saqlandi: ${timeToAdd} soniya. Yangi umumiy: ${newTotalTime}`);
    } catch (error: any) {
      console.error("[useTimeTracker] Vaqtni ma'lumotlar bazasiga saqlashda kutilmagan xato:", error);
      // showError(`Vaqtni saqlashda xato: ${error.message || "Noma'lum xato"}`); // Removed intrusive toast for background task
    }
  }, [userId, sessionTime]);

  useEffect(() => {
    if (!userId) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setSessionTime(0);
      lastSavedTimeRef.current = 0;
      return;
    }

    if (!intervalRef.current) {
      intervalRef.current = window.setInterval(() => { // Explicitly use window.setInterval and cast to number
        setSessionTime((prevTime) => prevTime + 1);
      }, 1000) as unknown as number;
    }

    const handleBeforeUnload = async () => {
      const unsavedTime = sessionTime - lastSavedTimeRef.current;
      if (unsavedTime > 0) {
        await saveTimeToDatabase(unsavedTime);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      const unsavedTime = sessionTime - lastSavedTimeRef.current;
      if (unsavedTime > 0) {
        saveTimeToDatabase(unsavedTime);
      }
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [userId, sessionTime, saveTimeToDatabase]);

  useEffect(() => {
    const unsavedTime = sessionTime - lastSavedTimeRef.current;
    if (unsavedTime >= SAVE_INTERVAL_SECONDS) {
      saveTimeToDatabase(unsavedTime);
    }
  }, [sessionTime, saveTimeToDatabase]);

  return sessionTime;
};