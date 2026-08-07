"use client";

import React from 'react';
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { User as UserIcon } from "lucide-react";
import { Profile } from "@/components/auth/SessionContextProvider"; // Import Profile type

interface ProfileInfoCardProps {
  username: string | null;
  email: string | null;
  balance: number;
}

const ProfileInfoCard: React.FC<ProfileInfoCardProps> = ({ username, email, balance }) => {
  return (
    <Card className="glass-card p-5">
      <div className="flex justify-between items-start">
        <CardTitle className="text-red-600 font-semibold">Mening Profilim</CardTitle>
        <UserIcon className="h-6 w-6 text-ferrari-red" />
      </div>
      <ul className="mt-3 text-sm text-gray-700 space-y-2">
        <li><span className="font-medium text-gray-600">Foydalanuvchi nomi:</span> {username || "Kiritilmagan"}</li>
        <li><span className="font-medium text-gray-600">Email:</span> {email || "Noma'lum"}</li>
        <li><span className="font-medium text-gray-600">Balans:</span> <span className="text-green-600 font-bold">{balance.toLocaleString()} UZS</span></li>
      </ul>
    </Card>
  );
};

export default ProfileInfoCard;