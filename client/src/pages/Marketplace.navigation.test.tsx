import React from "react";
import { act, cleanup, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Route, Router, Switch } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import Marketplace from "./Marketplace";
import MarketplaceCart from "./MarketplaceCart";
import MarketplaceCheckout from "./MarketplaceCheckout";
import { MarketplaceCartProvider, useMarketplaceCart } from "./marketplaceCommerce";
import { marketplaceProducts } from "./marketplaceData";

beforeEach(() => {
  vi.stubGlobal("IntersectionObserver", class {
    observe() {}
    unobserve() {}
    disconnect() {}
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  window.sessionStorage.clear();
});

describe("marketplace cart navigation", () => {
  it.each(["available", "blocked", "quota"] as const)("keeps products, quantities and removals across routes when storage is %s", mode => {
    if (mode === "blocked") vi.spyOn(window, "sessionStorage", "get").mockImplementation(() => { throw new DOMException("Blocked", "SecurityError"); });
    if (mode === "quota") vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new DOMException("Full", "QuotaExceededError"); });
    const location = memoryLocation({ path: "/marketplace" });
    render(<MarketplaceCartProvider><Router hook={location.hook}><Switch>
      <Route path="/marketplace" component={Marketplace} />
      <Route path="/marketplace/cart" component={MarketplaceCart} />
      <Route path="/marketplace/checkout" component={MarketplaceCheckout} />
    </Switch></Router></MarketplaceCartProvider>);

    fireEvent.click(screen.getByRole("button", { name: /أضف إلى السلة/ }));
    fireEvent.click(screen.getByRole("button", { name: "فتح السلة، 1 عناصر" }));
    expect(screen.queryByText("سلتك فارغة حالياً.")).toBeNull();
    expect(screen.getByRole("heading", { name: marketplaceProducts[0].name })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: `زيادة كمية ${marketplaceProducts[0].name}` }));
    fireEvent.click(screen.getByRole("button", { name: /إتمام الطلب/ }));
    expect(screen.queryByText("لا يمكن إتمام الطلب بسلة فارغة.")).toBeNull();
    expect(screen.getByText("2×")).toBeTruthy();

    // The brand link must navigate without destroying the in-memory cart.
    fireEvent.click(screen.getByRole("link", { name: /SPORTIX\s*MARKETPLACE/ }));
    fireEvent.click(screen.getByRole("button", { name: "فتح السلة، 2 عناصر" }));
    fireEvent.click(screen.getByRole("button", { name: "إزالة" }));
    expect(screen.getByText("سلتك فارغة حالياً.")).toBeTruthy();
    fireEvent.click(screen.getByRole("link", { name: /SPORTIX\s*MARKETPLACE/ }));
    fireEvent.click(screen.getByRole("button", { name: "فتح السلة، 0 عناصر" }));
    expect(screen.getByText("سلتك فارغة حالياً.")).toBeTruthy();
  });

  it("restores the cart after a provider remount when storage is available", () => {
    const first = renderHook(() => useMarketplaceCart(), { wrapper: MarketplaceCartProvider });
    act(() => first.result.current.addProduct(marketplaceProducts[0]));
    first.unmount();
    const second = renderHook(() => useMarketplaceCart(), { wrapper: MarketplaceCartProvider });
    expect(second.result.current.itemCount).toBe(1);
    expect(second.result.current.subtotal).toBe(marketplaceProducts[0].priceSar);
  });

  it("discards stale saved data after a quota failure instead of resurrecting a removed product", () => {
    const first = renderHook(() => useMarketplaceCart(), { wrapper: MarketplaceCartProvider });
    act(() => first.result.current.addProduct(marketplaceProducts[0]));
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new DOMException("Full", "QuotaExceededError"); });
    act(() => first.result.current.removeProduct(marketplaceProducts[0].id));
    expect(first.result.current.itemCount).toBe(0);
    first.unmount();
    const second = renderHook(() => useMarketplaceCart(), { wrapper: MarketplaceCartProvider });
    expect(second.result.current.itemCount).toBe(0);
  });
});
