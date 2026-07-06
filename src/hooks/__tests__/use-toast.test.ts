import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useToast, reducer } from "../use-toast";

describe("useToast Hook", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("should initialize with empty toasts", () => {
    const { result } = renderHook(() => useToast());
    expect(result.current.toasts).toEqual([]);
  });

  it("should add a toast and dismiss it", () => {
    const { result } = renderHook(() => useToast());

    let toastRef: any;
    act(() => {
      toastRef = result.current.toast({
        title: "Test Toast",
        description: "This is a description",
      });
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].title).toBe("Test Toast");
    expect(result.current.toasts[0].open).toBe(true);

    act(() => {
      toastRef.dismiss();
    });

    expect(result.current.toasts[0].open).toBe(false);
  });

  it("should update a toast", () => {
    const { result } = renderHook(() => useToast());

    let toastRef: any;
    act(() => {
      toastRef = result.current.toast({
        title: "Initial Title",
      });
    });

    expect(result.current.toasts[0].title).toBe("Initial Title");

    act(() => {
      toastRef.update({
        id: toastRef.id,
        title: "Updated Title",
      });
    });

    expect(result.current.toasts[0].title).toBe("Updated Title");
  });

  it("reducer behaves correctly for dispatch actions", () => {
    const initialState = { toasts: [] };
    const addAction = {
      type: "ADD_TOAST" as const,
      toast: { id: "1", title: "Toast 1", open: true },
    };
    
    let state = reducer(initialState, addAction);
    expect(state.toasts).toHaveLength(1);
    expect(state.toasts[0].title).toBe("Toast 1");

    const updateAction = {
      type: "UPDATE_TOAST" as const,
      toast: { id: "1", title: "Toast 1 Updated" },
    };
    state = reducer(state, updateAction);
    expect(state.toasts[0].title).toBe("Toast 1 Updated");

    const dismissAction = {
      type: "DISMISS_TOAST" as const,
      toastId: "1",
    };
    state = reducer(state, dismissAction);
    expect(state.toasts[0].open).toBe(false);

    const removeAction = {
      type: "REMOVE_TOAST" as const,
      toastId: "1",
    };
    state = reducer(state, removeAction);
    expect(state.toasts).toHaveLength(0);
  });
});
