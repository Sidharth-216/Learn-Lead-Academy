import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { authApi, coursesApi, clearTokens, setTokens } from "@/lib/api";

describe("API client", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("adds bearer token to protected requests", async () => {
    setTokens("test-access", "test-refresh");

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ items: [], total: 0, page: 1, pageSize: 12, totalPages: 0 }),
    });

    global.fetch = fetchMock as unknown as typeof fetch;

    await coursesApi.getAll({ page: 1, pageSize: 12 });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect((options.headers as Record<string, string>).Authorization).toBe("Bearer test-access");
  });

  it("refreshes token once on 401 and retries request", async () => {
    setTokens("expired-access", "valid-refresh");

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: "expired" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ accessToken: "new-access", refreshToken: "new-refresh" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ items: [], total: 0, page: 1, pageSize: 12, totalPages: 0 }),
      });

    global.fetch = fetchMock as unknown as typeof fetch;

    const result = await coursesApi.getAll({ page: 1, pageSize: 12 });

    expect(result.items).toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(localStorage.getItem("ll_access_token")).toBe("new-access");
  });

  it("returns friendly message for 429 rate limit", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      json: async () => ({ error: "Too many requests." }),
    }) as unknown as typeof fetch;

    await expect(coursesApi.getAll({ page: 1, pageSize: 12 })).rejects.toThrow(
      "Too many requests. Please wait a moment and retry.",
    );
  });

  it("returns friendly timeout message", async () => {
    global.fetch = vi.fn().mockRejectedValue(new DOMException("Aborted", "AbortError")) as unknown as typeof fetch;

    await expect(coursesApi.getAll()).rejects.toThrow("Request timed out. Please try again.");
  });

  it("authApi logout always clears local tokens", async () => {
    setTokens("a", "b");

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
      json: async () => ({}),
    }) as unknown as typeof fetch;

    await authApi.logout();

    expect(localStorage.getItem("ll_access_token")).toBeNull();
    expect(localStorage.getItem("ll_refresh_token")).toBeNull();
  });

  it("clearTokens helper removes persisted auth state", () => {
    setTokens("x", "y");
    localStorage.setItem("ll_user", "{}");

    clearTokens();

    expect(localStorage.getItem("ll_access_token")).toBeNull();
    expect(localStorage.getItem("ll_refresh_token")).toBeNull();
    expect(localStorage.getItem("ll_user")).toBeNull();
  });
});
