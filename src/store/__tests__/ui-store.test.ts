import { describe, it, expect } from "vitest";
import { useUIStore } from "../ui-store";

describe("UI Store", () => {
  it("manages mobile menu open and toggle states", () => {
    expect(useUIStore.getState().isMobileMenuOpen).toBe(false);

    useUIStore.getState().setMobileMenuOpen(true);
    expect(useUIStore.getState().isMobileMenuOpen).toBe(true);

    useUIStore.getState().toggleMobileMenu();
    expect(useUIStore.getState().isMobileMenuOpen).toBe(false);
  });

  it("manages scrolled indicator state", () => {
    expect(useUIStore.getState().isScrolled).toBe(false);

    useUIStore.getState().setScrolled(true);
    expect(useUIStore.getState().isScrolled).toBe(true);
  });
});
