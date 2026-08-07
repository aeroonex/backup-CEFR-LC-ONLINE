"use client";

import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod"; // Xato tuzatildi: *s o'rniga * as

import { showSuccess, showError } from "@/utils/toast";
import { supabase } from '@/integrations/supabase/client';
import { useSession } from "@/components/auth/SessionContextProvider";

const loginSchema = z.object({
  email: z.string().email("Noto'g'ri email formati").min(1, "Email majburiy"),
  password: z.string().min(6, "Parol kamida 6 ta belgidan iborat bo'lishi kerak"),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { session, isLoading, user, profile } = useSession();
  const [showPassword, setShowPassword] = useState(false); // State for password visibility

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    console.log("[LoginPage useEffect] Session:", session, "User:", user, "Profile:", profile, "isLoading:", isLoading);
    if (!isLoading && session && user && profile) {
      if (profile.role === 'developer') {
        navigate("/superadmin");
      } else {
        navigate("/dashboard");
      }
    }
  }, [session, isLoading, navigate, user, profile]);

  const onSubmit = async (data: LoginFormInputs) => {
    const { email, password } = data;
    console.log("[LoginPage onSubmit] Attempting to sign in with email:", email);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("[LoginPage onSubmit] Supabase signInWithPassword error:", error);
        showError(`Kirishda xato: ${error.message}`);
      } else {
        console.log("[LoginPage onSubmit] Supabase signInWithPassword successful.");
        showSuccess("Muvaffaqiyatli kirish!");
      }
    } catch (error: any) {
      console.error("[LoginPage onSubmit] Unexpected login error:", error);
      showError(`Kutilmagan xato: ${error.message}`);
    }
  };

  // Only show loading if the session context itself is still loading
  if (isLoading) {
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
          <div className="form-title">Kirish</div>

          <div className="form-body">
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
          </div>

          <button className="submit-button" type="submit">
            <span className="button-text">Kirish</span>
            <div className="button-glow"></div>
          </button>

          <div className="form-footer">
            <Link to="/register" className="login-link">
              Hisobingiz yo'qmi? <span>Ro'yxatdan o'tish</span>
            </Link>
            <div className="mt-2">
              <Link to="/" className="login-link">
                Bosh sahifaga qaytish
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;