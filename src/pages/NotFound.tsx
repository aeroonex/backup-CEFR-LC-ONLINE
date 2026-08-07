import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useSession } from "@/components/auth/SessionContextProvider";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { session, isLoading } = useSession();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
    // If not loading and no session, redirect to login
    if (!isLoading && !session) {
      navigate("/login");
    }
  }, [location.pathname, session, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <img
        src="https://themewagon.github.io/dasher-ui/images/svg/404.svg"
        alt="Page Not Found"
        className="max-w-full h-auto mb-8"
        style={{ maxWidth: '400px' }}
      />
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">Oops! Sahifa topilmadi</p>
        <a href="/" className="text-blue-500 hover:text-blue-700 underline">
          Bosh sahifaga qaytish
        </a>
      </div>
    </div>
  );
};

export default NotFound;