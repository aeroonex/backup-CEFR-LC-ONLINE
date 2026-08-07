"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, BookOpen, GraduationCap, User as UserIcon, LayoutDashboard, Activity, List, Award, DollarSign } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from '@/integrations/supabase/client';
import { useSession } from "@/components/auth/SessionContextProvider";
import { showSuccess, showError } from "@/utils/toast";
import { Card } from "@/components/ui/card";
import DateTimeCard from "./DateTimeCard";
import UserNotifications from "./UserNotifications"; // Import UserNotifications

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoading: isSessionLoading, profile, refreshProfile } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/dashboard/active-courses", label: "Mening faol kurslarim", icon: BookOpen },
    { path: "/dashboard/history", label: "Kurslarim taraqqiyoti", icon: Activity },
    { path: "/courses", label: "Barcha kurslar", icon: List },
    { path: "/dashboard/certificates", label: "Sertifikatlar", icon: Award },
    { path: "/dashboard/profile", label: "Shaxsiy profil", icon: UserIcon },
  ];

  const handleLogout = async () => {
    console.log("[Header] Logout button clicked. Attempting to sign out.");
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("[Header] Supabase signOut error:", error);
        showError(`Chiqishda xato: ${error.message}`);
      } else {
        console.log("[Header] Supabase signOut successful. Navigating to /login.");
        showSuccess("Muvaffaqiyatli chiqish!");
        navigate("/login");
      }
    } catch (error: any) {
      console.error("[Header] Unexpected logout error:", error);
      showError(`Kutilmagan xato: ${error.message}`);
    }
  };

  if (isSessionLoading || !user || !profile) {
    return null;
  }

  return (
    <header className="glass-card p-4 md:p-6 mb-6 md:mb-8 sticky top-0 z-40">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden text-gray-800 p-2 rounded-lg hover:bg-gray-100 transition-colors mb-4"> {/* Changed md:hidden to lg:hidden */}
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 bg-[#1a232f] text-white p-4 flex flex-col">
            <div className="flex items-center justify-between px-4 py-7 border-b border-gray-700">
              <Link to="/" relative="path" className="text-xl font-bold tracking-wider text-white">CEFR LC</Link>
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)} className="text-white hover:text-gray-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </Button>
            </div>
            <nav className="flex-grow">
              <div className="space-y-2">
                <p className="px-3 py-2 text-sm font-medium text-gray-400">Profil menyusi</p>
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    relative="path"
                    className={`nav-button-effect ${location.pathname === item.path ? "active" : ""}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon className="w-5 h-5 mr-3 ml-2" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            </nav>
          </SheetContent>
        </Sheet>
        
        <div className="flex-1 text-center md:text-left mb-4 md:mb-0">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Assalomu alaykum, {profile?.username || user?.email?.split('@')[0] || "Foydalanuvchi"}!</h2>
          <p className="text-xs sm:text-sm text-gray-700">Profil va balansni boshqarish paneli</p>
        </div>
        
        <div className="flex flex-wrap items-center space-x-2 sm:space-x-4 w-full md:w-auto justify-center md:justify-end mt-4 md:mt-0"> {/* Changed space-x-4 to space-x-2, added flex-wrap */}
          <DateTimeCard />
          <Card className="dark-gradient-card flex items-center p-2 w-full sm:w-48 h-12"> {/* Changed w-48 to w-full sm:w-48 */}
            <DollarSign className="h-5 w-5 text-green-400 mr-2" />
            <div>
              <p className="text-xs text-gray-300 font-medium">Joriy Balans</p>
              <p className="text-base font-bold text-green-300">
                {profile?.balance.toLocaleString() || "0"} UZS
              </p>
            </div>
          </Card>
          <UserNotifications /> {/* NEW: UserNotifications component */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-12 w-12 rounded-full p-0 border-2 border-ferrari-red flex-shrink-0">
                <Avatar className="h-full w-full">
                  <AvatarImage src="/placeholder-user.jpg" alt="@shadcn" />
                  <AvatarFallback>
                    <UserIcon className="h-6 w-6 text-gray-600" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{profile?.username || user?.email || "Guest"}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {profile && (
                <DropdownMenuItem className="flex justify-between items-center">
                  <span>Balans:</span>
                  <span className="font-bold text-green-600">{profile.balance.toLocaleString()} UZS</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="hover:bg-gray-100 hover:text-ferrari-red cursor-pointer" onClick={() => navigate("/dashboard/profile")}>Profil</DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-gray-100 hover:text-ferrari-red cursor-pointer">Sozlamalar</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="p-0"
              >
                <div className="Btn">
                  <div className="sign">
                    <svg viewBox="0 0 512 512">
                      <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"></path>
                    </svg>
                  </div>
                  <div className="text-logout">Chiqish</div>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;