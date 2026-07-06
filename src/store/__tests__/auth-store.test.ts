import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useAuthStore } from "../auth-store";

describe("Auth Store", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("login sets loading state, resolves simulated timer, and sets user info", async () => {
    const promise = useAuthStore.getState().login("test@example.com", "password");
    
    expect(useAuthStore.getState().isLoading).toBe(true);

    vi.advanceTimersByTime(1500);
    await promise;

    const state = useAuthStore.getState();
    expect(state.isLoading).toBe(false);
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.email).toBe("test@example.com");
  });

  it("signup runs successfully", async () => {
    const promise = useAuthStore.getState().signup("Test User", "test@example.com", "password");
    vi.advanceTimersByTime(1500);
    await promise;

    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  it("logout clears user state", () => {
    useAuthStore.setState({
      user: { id: "1", name: "J", email: "j@e.com", createdAt: "", plan: "free" },
      isAuthenticated: true,
    });

    useAuthStore.getState().logout();

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
  });

  it("updateProfile updates user profile settings", async () => {
    useAuthStore.setState({
      user: { id: "1", name: "John", email: "j@e.com", createdAt: "", plan: "free" },
      isAuthenticated: true,
    });

    const promise = useAuthStore.getState().updateProfile({ name: "Johnny" });
    vi.advanceTimersByTime(1500);
    await promise;

    expect(useAuthStore.getState().user?.name).toBe("Johnny");
  });

  it("updatePassword completes successfully", async () => {
    const promise = useAuthStore.getState().updatePassword("current", "new");
    vi.advanceTimersByTime(1500);
    await promise;
    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  it("resetPassword completes successfully", async () => {
    const promise = useAuthStore.getState().resetPassword("token", "new-password");
    vi.advanceTimersByTime(1500);
    await promise;
    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  it("sendPasswordResetEmail completes successfully", async () => {
    const promise = useAuthStore.getState().sendPasswordResetEmail("test@example.com");
    vi.advanceTimersByTime(1500);
    await promise;
    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  it("verifyEmail completes successfully", async () => {
    const promise = useAuthStore.getState().verifyEmail("token");
    vi.advanceTimersByTime(1500);
    await promise;
    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  it("checkVerificationStatus returns verified status", async () => {
    const promise = useAuthStore.getState().checkVerificationStatus("test@example.com");
    vi.advanceTimersByTime(1500);
    const verified = await promise;
    expect(verified).toBe(true);
    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  it("resendVerificationEmail completes successfully", async () => {
    const promise = useAuthStore.getState().resendVerificationEmail("test@example.com");
    vi.advanceTimersByTime(1500);
    await promise;
    expect(useAuthStore.getState().isLoading).toBe(false);
  });
});
