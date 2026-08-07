"use client";

import React from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useSession } from "@/components/auth/SessionContextProvider";
import { useNavigate } from "react-router-dom";
import { showError } from "@/utils/toast";
import { useTimeTracker } from '@/hooks/useTimeTracker';
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { session, isLoading, user, profile } = useSession();
  const navigate = useNavigate();

  useTimeTracker(user?.id);

  // VAQTINCHALIK: login talabi o'chirilgan (TODO: qayta yoqish kerak)
  // React.useEffect(() => {
  //   if (!isLoading) {
  //     if (!session) {
  //       console.log("[MainLayout] No session found, redirecting to /login.");
  //       showError("Bu sahifaga kirish uchun avval tizimga kiring.");
  //       navigate("/login");
  //     } else if (!profile) {
  //       console.error("[MainLayout] User logged in but profile data missing. Session exists, but profile is null. Redirecting to /login.");
  //       showError("Profil ma'lumotlaringiz yuklanmadi. Iltimos, qayta kiring.");
  //       navigate("/login");
  //     }
  //   }
  // }, [session, isLoading, navigate, profile]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="antialiased relative min-h-screen">
      {/* WebGLParticleBackground bu yerdan olib tashlandi */}
      <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr] content-layer">
        <Sidebar />
        <div className="flex flex-col bg-background">
          <Header />
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;