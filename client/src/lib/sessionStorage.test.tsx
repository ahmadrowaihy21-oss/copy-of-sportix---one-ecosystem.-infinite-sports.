import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getSessionStorage, readSessionValue, removeSessionValue, writeSessionValue } from "./sessionStorage";
import { useMarketplaceCart } from "../pages/marketplaceCommerce";
import { marketplaceProducts } from "../pages/marketplaceData";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  window.sessionStorage.clear();
});

describe("optional browser session storage", () => {
  it("reads, writes, and removes recovery data when storage is available", () => {
    writeSessionValue("pending", "member@example.com");
    expect(readSessionValue("pending")).toBe("member@example.com");
    removeSessionValue("pending");
    expect(readSessionValue("pending")).toBeNull();
  });

  it("keeps the cart usable when the browser blocks access to storage", () => {
    vi.spyOn(window, "sessionStorage", "get").mockImplementation(() => { throw new DOMException("Blocked", "SecurityError"); });
    expect(getSessionStorage()).toBeUndefined();
    expect(readSessionValue("pending")).toBeNull();
    expect(() => writeSessionValue("pending", "member@example.com")).not.toThrow();
    expect(() => removeSessionValue("pending")).not.toThrow();
    const { result } = renderHook(() => useMarketplaceCart());
    act(() => result.current.addProduct(marketplaceProducts[0]));
    expect(result.current.itemCount).toBe(1);
    expect(result.current.subtotal).toBe(marketplaceProducts[0].priceSar);
  });

  it("keeps cart changes in memory when storage quota is exhausted", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new DOMException("Full", "QuotaExceededError"); });
    const { result } = renderHook(() => useMarketplaceCart());
    act(() => result.current.addProduct(marketplaceProducts[0]));
    expect(result.current.itemCount).toBe(1);
    act(() => result.current.clearCart());
    expect(result.current.itemCount).toBe(0);
  });

  it("ignores stored values that cannot be read", () => {
    expect(readSessionValue("pending", { getItem() { throw new Error("Unavailable"); } })).toBeNull();
  });
});
