"use client";

import React from "react";
import { useSession } from "@/components/auth/SessionContextProvider";
import { useNavigate, Link } from "react-router-dom";
import { showError } from "@/utils/toast";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"; // Import Card components
import { Button } from "@/components/ui/button"; // Import Button component
import { Award } from "lucide-react"; // Import Award icon

const CertificatesPage: React.FC = () => {
  const { session, isLoading, profile } = useSession();
  const navigate = useNavigate();

  // VAQTINCHALIK: login talabi o'chirilgan (TODO: qayta yoqish kerak)
  // React.useEffect(() => {
  //   if (!isLoading && !session) {
  //     showError("Bu sahifaga kirish uchun avval tizimga kiring.");
  //     navigate("/login");
  //   }
  // }, [session, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <LoadingSpinner />
      </div>
    );
  }

  // Assuming there's a way to check if a user has certificates.
  // For now, we'll hardcode it to false to show the empty state.
  // In a real application, you would fetch this data from Supabase.
  const hasCertificates = false; // TODO: Implement actual logic to check for certificates

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <Card className="w-full max-w-2xl text-center shadow-lg bg-white">
        <CardHeader className="flex flex-col items-center gap-4">
          <Award className="h-16 w-16 text-ferrari-red" />
          <CardTitle className="text-3xl font-bold tracking-tight text-gray-900">
            Sertifikatlar
          </CardTitle>
          <CardDescription className="text-lg text-gray-600">
            {hasCertificates ? (
              "Bu yerda siz qo'lga kiritgan sertifikatlaringizni ko'rishingiz mumkin."
            ) : (
              "Siz hali hech qanday sertifikatga ega emassiz."
            )}
          </CardDescription>
        </CardHeader>
        {!hasCertificates && (
          <CardContent className="space-y-6 py-6">
            <p className="text-base text-gray-700">
              Kurslarni yakunlab, o'z bilimingizni tasdiqlovchi sertifikatlarga ega bo'ling!
            </p>
            <Button
              onClick={() => navigate("/courses")}
              className="bg-ferrari-red hover:bg-red-700 text-white text-lg px-8 py-3 rounded-lg shadow-md transition-colors"
            >
              Kurslarni ko'rish
            </Button>
          </CardContent>
        )}
        {/* TODO: Add actual certificate listing here when hasCertificates is true */}
      </Card>
    </div>
  );
};

export default CertificatesPage;