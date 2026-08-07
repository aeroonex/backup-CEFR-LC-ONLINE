"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { showSuccess, showError } from "@/utils/toast";
import { useSession } from "@/components/auth/SessionContextProvider";
import AdminLayout from '@/components/superadmin/AdminLayout';
import LoadingSpinner from "@/components/ui/LoadingSpinner"; // Import LoadingSpinner

// No need to import supabase here, as profile is from context

const SuperAdminPage: React.FC = () => {
  const { session, isLoading, user, profile } = useSession(); // Get profile from context
  const navigate = useNavigate();

  // VAQTINCHALIK: login/rol talabi o'chirilgan (TODO: qayta yoqish kerak)
  // useEffect(() => {
  //   if (isLoading) return;
  //   if (!session) {
  //     showError("Super admin paneliga kirish uchun avval tizimga kiring.");
  //     navigate("/login");
  //     return;
  //   }
  //   if (profile?.role === 'developer') {
  //     showSuccess("Super admin paneliga xush kelibsiz!");
  //   } else {
  //     showError("Sizda Super Admin paneliga kirish huquqi yo'q.");
  //     navigate("/dashboard");
  //   }
  // }, [session, isLoading, navigate, profile]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100">
        <LoadingSpinner />
      </div>
    );
  }

  return <AdminLayout />;
};

export default SuperAdminPage;