"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "@/components/auth/SessionContextProvider";
import { showError } from "@/utils/toast";
import ContactCards from "@/components/dashboard/ContactCards";
import DailyCheckinCard from "@/components/dashboard/DailyCheckinCard";
import ProfileInfoCard from "@/components/dashboard/ProfileInfoCard";
import TotalTimeSpentCard from "@/components/dashboard/TotalTimeSpentCard";
import AchievementsCard from "@/components/dashboard/AchievementsCard";
import CourseStatsCard from "@/components/dashboard/CourseStatsCard";
import UserStreakCard from "@/components/dashboard/UserStreakCard";
import { supabase } from '@/integrations/supabase/client'; // Import supabase for fetching course counts

const DashboardOverview: React.FC = () => {
  const { session, isLoading: isSessionLoading, user, profile } = useSession();
  const navigate = useNavigate();
  const [purchasedCoursesCount, setPurchasedCoursesCount] = useState(0);

  // VAQTINCHALIK: login talabi o'chirilgan (TODO: qayta yoqish kerak)
  // useEffect(() => {
  //   if (!isSessionLoading && !session) {
  //     showError("Bu sahifaga kirish uchun avval tizimga kiring.");
  //     navigate("/login");
  //   }
  // }, [session, isSessionLoading, navigate]);

  // Fetch purchased courses count
  useEffect(() => {
    const fetchCourseCounts = async () => {
      if (!user) return;
      const { count, error } = await supabase
        .from('user_courses')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (error) {
        console.error("Error fetching purchased courses count:", error);
        setPurchasedCoursesCount(0);
      } else {
        setPurchasedCoursesCount(count || 0);
      }
    };
    if (user) {
      fetchCourseCounts();
    }
  }, [user]);

  if (isSessionLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <p className="text-lg text-gray-700">Yuklanmoqda...</p>
      </div>
    );
  }

  // VAQTINCHALIK: tizimga kirilmagan bo'lsa ham namoyish uchun bo'sh profil
  const displayProfile = profile ?? {
    username: "Mehmon",
    balance: 0,
    total_time_spent_seconds: 0,
    level: 0,
    xp: 0,
    streak: 0,
  };

  return (
    <div className="ui-root">
      {/* WebGLParticleBackground bu yerdan olib tashlandi */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10">
        <div className="text-center md:text-left mb-8">
          <h2 className="text-4xl font-extrabold tracking-tight text-gray-900">Assalomu alaykum, <span className="text-ferrari-red">{displayProfile.username || user?.email?.split('@')[0]}</span>!</h2>
          <p className="text-lg text-gray-600 mt-2">Bu sizning shaxsiy boshqaruv panelingiz. O'z taraqqiyotingizni kuzatib boring.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Profil ma'lumotlari kartasi */}
          <ProfileInfoCard
            username={displayProfile.username}
            email={user?.email || null}
            balance={displayProfile.balance}
          />

          {/* Umumiy sarflangan vaqt kartasi */}
          <TotalTimeSpentCard
            totalTimeSpentSeconds={displayProfile.total_time_spent_seconds || 0}
          />

          {/* Daily Check-in kartasi */}
          <DailyCheckinCard />

          {/* Sizning Yutuqlaringiz kartasi */}
          <AchievementsCard
            level={displayProfile.level || 0}
            xp={displayProfile.xp || 0}
          />

          {/* Kurslar Statistikasi kartasi */}
          <CourseStatsCard
            purchasedCoursesCount={purchasedCoursesCount}
          />

          {/* Streak kartasi */}
          <UserStreakCard
            streak={displayProfile.streak || 0}
          />

          {/* Yangi ContactCards komponenti */}
          <div className="col-span-full">
            <ContactCards />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;