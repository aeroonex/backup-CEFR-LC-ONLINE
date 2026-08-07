"use client";

import { Link, useLocation } from "react-router-dom";
import { BookOpen, GraduationCap, Activity, List, Award, User as UserIcon, LayoutDashboard } from "lucide-react"; // Changed History to Activity

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/dashboard/active-courses", label: "Mening faol kurslarim", icon: BookOpen },
    { path: "/dashboard/history", label: "Kurslarim taraqqiyoti", icon: Activity }, // Changed label and icon
    { path: "/courses", label: "Barcha kurslar", icon: List },
    { path: "/dashboard/certificates", label: "Sertifikatlar", icon: Award },
    { path: "/dashboard/profile", label: "Shaxsiy profil", icon: UserIcon },
  ];

  return (
    <div className="hidden border-r bg-[#1a232f] lg:block text-white w-64 flex-shrink-0 flex-col p-4 shadow-2xl">
      <div className="mb-8 p-2">
        <Link to="/" className="text-xl font-bold tracking-wider text-white" relative="path"> {/* Changed text-ferrari-red to text-white for logo */}
          CEFR LC
        </Link>
        <p className="text-sm text-gray-400 mt-1 ml-2">Profil menyusi</p> {/* Adjusted styling */}
      </div>
      
      <nav className="flex-grow">
        <div className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              relative="path" // Added relative="path"
              className={`nav-button-effect ${location.pathname === item.path ? "active" : ""}`}
            >
              <item.icon className="w-5 h-5 mr-3 ml-2" /> {/* Adjusted margin for icon */}
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      <div className="mt-auto pt-8 text-center text-xs text-gray-500"> {/* Added copyright */}
        &copy; 2024 CEFR LC. Barcha huquqlar himoyalangan.
      </div>
    </div>
  );
};

export default Sidebar;