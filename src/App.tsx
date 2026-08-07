import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import DashboardOverview from "./pages/DashboardOverview";
import ActiveCoursesPage from "./pages/ActiveCoursesPage";
import Courses from "./pages/Courses";
import NotFound from "./pages/NotFound";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CourseHistoryPage from "./pages/CourseHistoryPage";
import CertificatesPage from "./pages/CertificatesPage";
import ProfilePage from "./pages/ProfilePage";
import SuperAdminPage from "./pages/SuperAdminPage";
import CourseDetailsPage from "./pages/CourseDetailsPage";
import { SessionContextProvider } from "./components/auth/SessionContextProvider";
import NotificationDialog from "./components/ui/NotificationDialog";
import LoadingIndicator from "./components/ui/LoadingIndicator";
import { useState } from "react";
import { setNotificationHandlers, setLoadingHandlers } from "./utils/toast";
import ClickSpark from './components/ClickSpark'; // ClickSpark komponentini saqlab qolish

const queryClient = new QueryClient();

const App = () => {
  const [notification, setNotification] = useState<{
    isOpen: boolean;
    message: string;
    title: string;
    type: "success" | "error";
  }>({ isOpen: false, message: "", title: "", type: "success" });

  const [loadingMessages, setLoadingMessages] = useState<Map<string | number, string>>(new Map());

  // Set handlers for toast utility
  setNotificationHandlers(setNotification);
  setLoadingHandlers(setLoadingMessages);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          {/* ClickSpark komponentini bu yerda qoldiramiz */}
          <ClickSpark /> 
          <SessionContextProvider>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/dashboard" element={<MainLayout><DashboardOverview /></MainLayout>} />
              <Route path="/dashboard/active-courses" element={<MainLayout><ActiveCoursesPage /></MainLayout>} />
              <Route path="/dashboard/history" element={<MainLayout><CourseHistoryPage /></MainLayout>} />
              <Route path="/dashboard/certificates" element={<MainLayout><CertificatesPage /></MainLayout>} />
              <Route path="/dashboard/profile" element={<MainLayout><ProfilePage /></MainLayout>} />
              <Route path="/courses" element={<MainLayout><Courses /></MainLayout>} />
              <Route path="/courses/:courseId" element={<MainLayout><CourseDetailsPage /></MainLayout>} />
              <Route path="/superadmin" element={<SuperAdminPage />} />
              {/* Barcha maxsus marshrutlarni "*" marshruti ustiga qo'shing */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </SessionContextProvider>
        </BrowserRouter>
        <NotificationDialog
          isOpen={notification.isOpen}
          onClose={() => setNotification({ ...notification, isOpen: false })}
          message={notification.message}
          title={notification.title}
          type={notification.type}
        />
        <LoadingIndicator messages={loadingMessages} />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;