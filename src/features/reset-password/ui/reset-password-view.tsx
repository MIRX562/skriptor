"use client";

import type React from "react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

interface ResetPasswordViewProps {
  dict: any;
}

export function ResetPasswordView({ dict }: ResetPasswordViewProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({
    password: "",
    confirmPassword: "",
  });
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { password: "", confirmPassword: "" };

    if (!formData.password) {
      newErrors.password = dict.auth.resetPassword.password.required;
      valid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = dict.auth.resetPassword.password.minLength;
      valid = false;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = dict.auth.resetPassword.confirmPassword.required;
      valid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = dict.auth.resetPassword.confirmPassword.match;
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (!token) {
      toast.error(dict.auth.resetPassword.messages.errorTitle, {
        description: dict.auth.resetPassword.messages.invalidToken,
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await authClient.resetPassword({
        newPassword: formData.password,
      });

      if (error) {
        throw error;
      }

      toast.success(dict.auth.resetPassword.messages.successTitle, {
        description: dict.auth.resetPassword.messages.successDescription,
      });

      router.push("/sign-in");
    } catch (err: any) {
      console.error("Reset password error:", err);
      toast.error(dict.auth.resetPassword.messages.errorTitle, {
        description: dict.auth.resetPassword.messages.errorDescription,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {dict.auth.resetPassword.title}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
          {dict.auth.resetPassword.description}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">{dict.auth.resetPassword.password.label}</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder={dict.auth.resetPassword.password.placeholder}
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              className={
                errors.password
                  ? "border-red-500 dark:border-red-500 pr-10"
                  : "pr-10"
              }
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-500 mt-1">{errors.password}</p>
          )}
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {dict.auth.resetPassword.password.hint}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">{dict.auth.resetPassword.confirmPassword.label}</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder={dict.auth.resetPassword.confirmPassword.placeholder}
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={isLoading}
              className={
                errors.confirmPassword
                  ? "border-red-500 dark:border-red-500 pr-10"
                  : "pr-10"
              }
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-red-500 mt-1">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-teal-600 hover:bg-teal-700 text-white dark:bg-teal-600 dark:hover:bg-teal-700 mt-4"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {dict.auth.resetPassword.messages.resetting}
            </>
          ) : (
            dict.auth.resetPassword.submit
          )}
        </Button>
      </form>
    </div>
  );
}
