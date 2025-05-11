"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Github, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    agreeTerms: false,
  });
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    agreeTerms: "",
  });
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, agreeTerms: checked }));
    if (errors.agreeTerms) {
      setErrors((prev) => ({ ...prev, agreeTerms: "" }));
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { name: "", email: "", password: "", agreeTerms: "" };

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      valid = false;
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
      valid = false;
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      valid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      valid = false;
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = "You must agree to the terms and conditions";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    // Simulate API call
    try {
      // In a real app, this would be an API call to your auth endpoint
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Successful signup
      toast.success("Account created", {
        description: "Your account has been created successfully.",
      });

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      toast.error("Error", {
        description:
          "There was a problem creating your account. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Create an account
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
          Sign up to get started with Skriptor
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="John Doe"
            value={formData.name}
            onChange={handleChange}
            disabled={isLoading}
            className={errors.name ? "border-red-500 dark:border-red-500" : ""}
          />
          {errors.name && (
            <p className="text-xs text-red-500 mt-1">{errors.name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="name@example.com"
            value={formData.email}
            onChange={handleChange}
            disabled={isLoading}
            className={errors.email ? "border-red-500 dark:border-red-500" : ""}
          />
          {errors.email && (
            <p className="text-xs text-red-500 mt-1">{errors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
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
            Password must be at least 8 characters long
          </p>
        </div>

        <div className="flex items-start space-x-2 mt-4">
          <Checkbox
            id="terms"
            checked={formData.agreeTerms}
            onCheckedChange={handleCheckboxChange}
            disabled={isLoading}
            className={
              errors.agreeTerms ? "border-red-500 dark:border-red-500" : ""
            }
          />
          <div className="grid gap-1.5 leading-none">
            <Label
              htmlFor="terms"
              className="text-sm font-normal cursor-pointer"
            >
              I agree to the{" "}
              <Link
                href="/terms"
                className="text-teal-600 dark:text-teal-400 hover:underline"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="text-teal-600 dark:text-teal-400 hover:underline"
              >
                Privacy Policy
              </Link>
            </Label>
            {errors.agreeTerms && (
              <p className="text-xs text-red-500">{errors.agreeTerms}</p>
            )}
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-teal-600 hover:bg-teal-700 text-white dark:bg-teal-600 dark:hover:bg-teal-700 mt-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create account"
          )}
        </Button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-slate-900 px-2 text-slate-500 dark:text-slate-400">
              Or continue with
            </span>
          </div>
        </div>

        <Button variant="outline" className="w-full" disabled={isLoading}>
          <Github className="mr-2 h-4 w-4" />
          GitHub
        </Button>

        <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-6">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="text-teal-600 dark:text-teal-400 hover:underline font-medium"
          >
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
