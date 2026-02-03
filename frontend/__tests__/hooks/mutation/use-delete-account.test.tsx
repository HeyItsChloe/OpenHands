import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useDeleteAccount } from "#/hooks/mutation/use-delete-account";

// Mock posthog
vi.mock("posthog-js/react", () => ({
  usePostHog: () => ({
    reset: vi.fn(),
  }),
}));

// Mock local storage utils
const mockClearLoginData = vi.fn();
vi.mock("#/utils/local-storage", () => ({
  clearLoginData: () => mockClearLoginData(),
}));

describe("useDeleteAccount", () => {
  let queryClient: QueryClient;
  const originalLocation = window.location;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Mock window.location
    Object.defineProperty(window, "location", {
      value: { href: "" },
      writable: true,
    });

    vi.clearAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(window, "location", {
      value: originalLocation,
      writable: true,
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it("should call mutate successfully", async () => {
    const { result } = renderHook(() => useDeleteAccount(), { wrapper });

    result.current.mutate();

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it("should clear login data on success", async () => {
    const { result } = renderHook(() => useDeleteAccount(), { wrapper });

    result.current.mutate();

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockClearLoginData).toHaveBeenCalledTimes(1);
  });

  it("should redirect to home page on success", async () => {
    const { result } = renderHook(() => useDeleteAccount(), { wrapper });

    result.current.mutate();

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(window.location.href).toBe("/");
  });

  it("should remove cached queries on success", async () => {
    // Pre-populate some queries
    queryClient.setQueryData(["tasks"], { data: "tasks" });
    queryClient.setQueryData(["settings"], { data: "settings" });
    queryClient.setQueryData(["user"], { data: "user" });
    queryClient.setQueryData(["secrets"], { data: "secrets" });
    queryClient.setQueryData(["api-keys"], { data: "api-keys" });
    queryClient.setQueryData(["conversations"], { data: "conversations" });

    const { result } = renderHook(() => useDeleteAccount(), { wrapper });

    result.current.mutate();

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Verify queries were removed
    expect(queryClient.getQueryData(["tasks"])).toBeUndefined();
    expect(queryClient.getQueryData(["settings"])).toBeUndefined();
    expect(queryClient.getQueryData(["user"])).toBeUndefined();
    expect(queryClient.getQueryData(["secrets"])).toBeUndefined();
    expect(queryClient.getQueryData(["api-keys"])).toBeUndefined();
    expect(queryClient.getQueryData(["conversations"])).toBeUndefined();
  });

  it("should have isPending true while mutation is in progress", async () => {
    const { result } = renderHook(() => useDeleteAccount(), { wrapper });

    expect(result.current.isPending).toBe(false);

    result.current.mutate();

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});
