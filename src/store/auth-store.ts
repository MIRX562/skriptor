import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  company?: string;
  bio?: string;
  website?: string;
  createdAt: string;
  plan: "free" | "pro" | "enterprise";
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  updatePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  checkVerificationStatus: (email: string) => Promise<boolean>;
  resendVerificationEmail: (email: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        login: async (email, password, remember = false) => {
          set({ isLoading: true, error: null });

          try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1500));

            // Mock successful login
            const user: User = {
              id: "usr_12345678",
              name: "John Doe",
              email,
              createdAt: "2023-05-15T00:00:00Z",
              plan: "pro",
            };

            set({ user, isAuthenticated: true, isLoading: false });
          } catch (error) {
            set({
              error: "Invalid email or password. Please try again.",
              isLoading: false,
            });
            throw error;
          }
        },

        signup: async (name, email, password) => {
          set({ isLoading: true, error: null });

          try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1500));

            // In a real app, we would create the user here
            // For now, we'll just set isLoading to false
            set({ isLoading: false });
          } catch (error) {
            set({
              error:
                "There was a problem creating your account. Please try again.",
              isLoading: false,
            });
            throw error;
          }
        },

        logout: () => {
          set({ user: null, isAuthenticated: false });
        },

        updateProfile: async (data) => {
          set({ isLoading: true, error: null });

          try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1500));

            const currentUser = get().user;
            if (!currentUser) throw new Error("Not authenticated");

            const updatedUser = { ...currentUser, ...data };
            set({ user: updatedUser, isLoading: false });
          } catch (error) {
            set({
              error: "Failed to update profile. Please try again.",
              isLoading: false,
            });
            throw error;
          }
        },

        updatePassword: async (currentPassword, newPassword) => {
          set({ isLoading: true, error: null });

          try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1500));

            set({ isLoading: false });
          } catch (error) {
            set({
              error: "Failed to update password. Please try again.",
              isLoading: false,
            });
            throw error;
          }
        },

        resetPassword: async (token, password) => {
          set({ isLoading: true, error: null });

          try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1500));

            set({ isLoading: false });
          } catch (error) {
            set({
              error:
                "There was a problem resetting your password. Please try again.",
              isLoading: false,
            });
            throw error;
          }
        },

        sendPasswordResetEmail: async (email) => {
          set({ isLoading: true, error: null });

          try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1500));

            set({ isLoading: false });
          } catch (error) {
            set({
              error: "Failed to send reset link. Please try again.",
              isLoading: false,
            });
            throw error;
          }
        },

        verifyEmail: async (token) => {
          set({ isLoading: true, error: null });

          try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1500));

            set({ isLoading: false });
          } catch (error) {
            set({
              error: "Verification failed. Please try again.",
              isLoading: false,
            });
            throw error;
          }
        },

        checkVerificationStatus: async (email) => {
          set({ isLoading: true, error: null });

          try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1500));

            // Mock verification status
            const isVerified = true;

            set({ isLoading: false });
            return isVerified;
          } catch (error) {
            set({
              error: "Failed to check verification status. Please try again.",
              isLoading: false,
            });
            throw error;
          }
        },

        resendVerificationEmail: async (email) => {
          set({ isLoading: true, error: null });

          try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1500));

            set({ isLoading: false });
          } catch (error) {
            set({
              error: "Failed to resend verification email. Please try again.",
              isLoading: false,
            });
            throw error;
          }
        },
      }),
      {
        name: "auth-storage",
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    )
  )
);
