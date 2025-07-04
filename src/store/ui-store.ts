import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface UIState {
  isMobileMenuOpen: boolean;
  isScrolled: boolean;

  // Actions
  setMobileMenuOpen: (isOpen: boolean) => void;
  toggleMobileMenu: () => void;
  setScrolled: (isScrolled: boolean) => void;
}

export const useUIStore = create<UIState>()(
  devtools((set, get) => ({
    isMobileMenuOpen: false,
    isScrolled: false,

    setMobileMenuOpen: (isOpen) => set({ isMobileMenuOpen: isOpen }),
    toggleMobileMenu: () =>
      set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
    setScrolled: (isScrolled) => set({ isScrolled }),
  }))
);
