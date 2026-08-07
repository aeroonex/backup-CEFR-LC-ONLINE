"use client";

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  Users,
  Upload,
  BookOpen,
  GraduationCap,
  Menu as MenuIcon,
  X,
  Edit,
  MessageSquareText,
  Image as ImageIcon,
  FileText,
  Tag,
  BellRing, // NEW: Icon for notifications
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import FinancePanel from './FinancePanel';
import TeachersPanel from './TeachersPanel';
import UploadCoursePanel from './UploadCoursePanel';
import CoursePreviewPanel from './CoursePreviewPanel';
import UsersPanel from './UsersPanel';
import EditCoursesPanel from './EditCoursesPanel';
import ReviewModerationPanel from './ReviewModerationPanel';
import ResultsImagesPanel from './ResultsImagesPanel';
import ApplicationsPanel from './ApplicationsPanel';
import TariffManagementPanel from './TariffManagementPanel';
import NotificationManagementPanel from './NotificationManagementPanel'; // NEW: Import NotificationManagementPanel

const AdminLayout: React.FC = () => {
  const [activePanel, setActivePanel] = useState('finance');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'finance', label: 'MOLIYA & SOTUV', icon: DollarSign, component: <FinancePanel /> },
    { id: 'teachers', label: 'USTOZLAR PANELI', icon: Users, component: <TeachersPanel /> },
    { id: 'upload-course', label: 'YANGI KURS YUKLASH', icon: Upload, component: <UploadCoursePanel /> },
    { id: 'course-preview', label: 'YUKLANGAN KURSLAR', icon: BookOpen, component: <CoursePreviewPanel /> },
    { id: 'edit-courses', label: 'KURSLARNI TAHRIRLASH', icon: Edit, component: <EditCoursesPanel /> },
    { id: 'review-moderation', label: 'IZOHLAR MODERATSIYASI', icon: MessageSquareText, component: <ReviewModerationPanel /> },
    { id: 'results-images', label: 'NATIJALAR RASMLARI', icon: ImageIcon, component: <ResultsImagesPanel /> },
    { id: 'applications', label: 'ARIZALAR', icon: FileText, component: <ApplicationsPanel /> },
    { id: 'tariffs', label: 'TARIFLARNI BOSHQARISH', icon: Tag, component: <TariffManagementPanel /> },
    { id: 'notifications', label: 'BILDIRISHNOMALAR', icon: BellRing, component: <NotificationManagementPanel /> }, // NEW: Notifications Panel
    { id: 'users', label: 'FOYDALANUVCHILAR', icon: Users, component: <UsersPanel /> },
  ];

  const getPanelTitle = (panelId: string) => {
    const item = navItems.find(item => item.id === panelId);
    return item ? `${item.label} Boshqaruvi` : 'Boshqaruv Paneli';
  };

  return (
    <div className="min-h-screen flex antialiased dark bg-background text-foreground">
      {/* Sidebar for larger screens */}
      <aside className="hidden md:block bg-gray-900 border-r border-gray-700 w-64 space-y-6 py-7 px-2 shadow-xl">
        <Link to="/" className="flex items-center space-x-2 px-4 mb-8">
          <GraduationCap className="h-10 w-10 text-ferrari-red" />
          <span className="text-xl font-bold text-ferrari-red">CEFR LC</span>
          <span className="text-xl font-bold text-gray-100">Admin</span>
        </Link>

        <nav className="space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePanel(item.id)}
              className={`nav-button-effect ${activePanel === item.id ? 'active' : ''}`}
            >
              <item.icon className="w-5 h-5 mr-3 ml-2" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main content area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <header className="flex justify-between items-center pb-6 border-b border-gray-700 mb-6">
          <h1 className="text-3xl font-extrabold text-foreground">{getPanelTitle(activePanel)}</h1>
          {/* Mobile menu toggle */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <MenuIcon className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 bg-gray-900 p-0">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between px-4 py-7 border-b border-gray-700">
                  <Link to="/" className="flex items-center space-x-2">
                    <GraduationCap className="h-10 w-10 text-ferrari-red" />
                    <span className="text-xl font-bold text-ferrari-red">CEFR LC</span>
                    <span className="text-xl font-bold text-gray-100">Admin</span>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                    <X className="h-6 w-6 text-gray-400" />
                  </Button>
                </div>
                <nav className="flex-1 py-4 px-2 space-y-3">
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActivePanel(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`nav-button-effect ${activePanel === item.id ? 'active' : ''}`}
                    >
                      <item.icon className="w-5 h-5 mr-3 ml-2" />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </header>

        <div id="content-container">
          {navItems.find(item => item.id === activePanel)?.component}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;