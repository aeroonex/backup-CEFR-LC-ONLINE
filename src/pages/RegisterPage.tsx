"use client";

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { showSuccess, showError } from "@/utils/toast";
import { supabase } from '@/integrations/supabase/client';
import { useSession } from "@/components/auth/SessionContextProvider";
import EmailConfirmationDialog from "@/components/auth/EmailConfirmationDialog"; // Import the new dialog

const registerSchema = z.object({
  username: z.string().min(1, "Foydalanuvchi nomi majburiy"),
  email: z.string().email("Noto'g'ri email formati").min(1, "Email majburiy"),
  password: z.string().min(6, "Parol kamida 6 ta belgidan iborat bo'lishi kerak"),
  confirmPassword: z.string().min(6, "Parolni tasdiqlash majburiy"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Parollar mos kelmadi",
  path: ["confirmPassword"],
});

type RegisterFormInputs = z.infer<typeof registerSchema>;

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { session, isLoading, profile } = useSession();
  const [showPassword, setShowPassword] = useState(false); // State for password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // State for confirm password visibility
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false); // State for confirmation dialog
  const [registeredEmail, setRegisteredEmail] = useState(""); // To pass email to dialog

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues, // To get email for dialog
  } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
  });

  useEffect(() => {
    if (!isLoading && session && profile) {
      navigate("/dashboard");
    }
  }, [session, isLoading, navigate, profile]);

  const onSubmit = async (data: RegisterFormInputs) => {
    const { username, email, password } = data;
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username, // Pass username here
            first_name: '',
            last_name: '',
          },
        },
      });

      if (error) {
        showError(`Ro'yxatdan o'tishda xato: ${error.message}`);
      } else {
        setRegisteredEmail(email);
        setIsConfirmationDialogOpen(true); // Open the dialog instead of toast
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      showError(`Kutilmagan xato: ${error.message}`);
    }
  };

  const handleConfirmationDialogClose = () => {
    setIsConfirmationDialogOpen(false);
    navigate("/login"); // Redirect to login after closing dialog
  };

  if (isLoading || (session && !profile)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 content-layer">
        <p className="text-lg text-gray-700">Yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className="ui-root">
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <form className="modern-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="form-title">Ro'yxatdan o'tish</div>

          <div className="form-body">
            <div className="input-group">
              <div className="input-wrapper">
                <svg fill="none" viewBox="0 0 24 24" className="input-icon">
                  <circle
                    strokeWidth="1.5"
                    stroke="currentColor"
                    r="4"
                    cy="8"
                    cx="12"
                  ></circle>
                  <path
                    strokeLinecap="round"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    d="M5 20C5 17.2386 8.13401 15 12 15C15.866 15 19 17.2386 19 20"
                  ></path>
                </svg>
                <input
                  required
                  placeholder="Foydalanuvchi nomi"
                  className={`form-input ${errors.username ? 'invalid' : ''}`}
                  type="text"
                  {...register("username")}
                />
              </div>
              {errors.username && <p className="text-sm text-red-500 mt-1">{errors.username.message}</p>}
            </div>

            <div className="input-group">
              <div className="input-wrapper">
                <svg fill="none" viewBox="0 0 24 24" className="input-icon">
                  <path
                    strokeWidth="1.5"
                    stroke="currentColor"
                    d="M3 8L10.8906 13.2604C11.5624 13.7083 12.4376 13.7083 13.1094 13.2604L21 8M5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19Z"
                  ></path>
                </svg>
                <input
                  required
                  placeholder="Email"
                  className={`form-input ${errors.email ? 'invalid' : ''}`}
                  type="email"
                  {...register("email")}
                />
              </div>
              {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div className="input-group">
              <div className="input-wrapper">
                <svg fill="none" viewBox="0 0 24 24" className="input-icon">
                  <path
                    strokeWidth="1.5"
                    stroke="currentColor"
                    d="M12 10V14M8 6H16C17.1046 6 18 6.89543 18 8V16C18 17.1046 17.1046 18 16 18H8C6.89543 18 6 17.1046 6 16V8C6 6.89543 6.89543 6 8 6Z"
                  ></path>
                </svg>
                <input
                  required
                  placeholder="Parol"
                  className={`form-input ${errors.password ? 'invalid' : ''}`}
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                />
                <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                  <svg fill="none" viewBox="0 0 24 24" className="eye-icon">
                    <path
                      strokeWidth="1.5"
                      stroke="currentColor"
                      d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z"
                    ></path>
                    <circle
                      strokeWidth="1.5"
                      stroke="currentColor"
                      r="3"
                      cy="12"
                      cx="12"
                    ></circle>
                  </svg>
                </button>
              </div>
              {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            <div className="input-group">
              <div className="input-wrapper">
                <svg fill="none" viewBox="0 0 24 24" className="input-icon">
                  <path
                    strokeWidth="1.5"
                    stroke="currentColor"
                    d="M12 10V14M8 6H16C17.1046 6 18 6.89543 18 8V16C18 17.1046 17.1046 18 16 18H8C6.89543 18 6 17.1046 6 16V8C6 6.89543 6.89543 6 8 6Z"
                  ></path>
                </svg>
                <input
                  required
                  placeholder="Parolni tasdiqlash"
                  className={`form-input ${errors.confirmPassword ? 'invalid' : ''}`}
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("confirmPassword")}
                />
                <button type="button" className="password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <svg fill="none" viewBox="0 0 24 24" className="eye-icon">
                    <path
                      strokeWidth="1.5"
                      stroke="currentColor"
                      d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z"
                    ></path>
                    <circle
                      strokeWidth="1.5"
                      stroke="currentColor"
                      r="3"
                      cy="12"
                      cx="12"
                    ></circle>
                  </svg>
                </button>
              </div>
              {errors.confirmPassword && <p className="text-sm text-red-500 mt-1">{errors.confirmPassword.message}</p>}
            </div>
          </div>

          <button className="submit-button" type="submit">
            <span className="button-text">Hisob yaratish</span>
            <div className="button-glow"></div>
          </button>

          <div className="form-footer">
            <Link to="/login" className="login-link">
              Hisobingiz bormi? <span>Kirish</span>
            </Link>
            <div className="mt-2">
              <Link to="/" className="login-link">
                Bosh sahifaga qaytish
              </Link>
            </div>
          </div>
        </form>
      </div>
      <EmailConfirmationDialog
        isOpen={isConfirmationDialogOpen}
        onClose={handleConfirmationDialogClose}
        email={registeredEmail}
      />
    </div>
  );
};

export default RegisterPage;