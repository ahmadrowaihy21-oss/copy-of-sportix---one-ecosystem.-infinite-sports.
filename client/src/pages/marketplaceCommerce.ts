import { useCallback, useMemo, useState } from "react";
import type { MarketplaceProduct } from "./marketplaceData";
import { readSessionValue, writeSessionValue } from "@/lib/sessionStorage";

export const MEMBER_POINTS_BALANCE = 1240;
export const POINTS_REDEMPTION_STEP = 1000;
export const SAR_PER_POINTS_STEP = 5;

export type CartItem = { product: MarketplaceProduct; quantity: number };

export type CheckoutTotals = {
  subtotal: number;
  redeemedPoints: number;
  pointsDiscountSar: number;
  totalSar: number;
  remainingPoints: number;
};

const CART_STORAGE_KEY = "sportix-marketplace-cart-v1";

export function readStoredCart(): CartItem[] {
  try {
    const parsed = JSON.parse(readSessionValue(CART_STORAGE_KEY) ?? "[]") as CartItem[];
    return Array.isArray(parsed)
      ? parsed.filter((item) => item?.product?.id && Number.isInteger(item.quantity) && item.quantity > 0)
      : [];
  } catch {
    return [];
  }
}

function storeCart(items: CartItem[]) {
  writeSessionValue(CART_STORAGE_KEY, JSON.stringify(items));
}

export function getCartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.product.priceSar * item.quantity, 0);
}

export function addCartProduct(items: CartItem[], product: MarketplaceProduct): CartItem[] {
  const existing = items.find((item) => item.product.id === product.id);
  return existing
    ? items.map((item) => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
    : [...items, { product, quantity: 1 }];
}

export function setCartProductQuantity(items: CartItem[], productId: string, quantity: number): CartItem[] {
  return quantity < 1
    ? items.filter((item) => item.product.id !== productId)
    : items.map((item) => item.product.id === productId ? { ...item, quantity } : item);
}

export function getRedeemablePoints(subtotal: number, memberPoints: number, requestedPoints: number): number {
  const eligibleByBalance = Math.floor(Math.max(memberPoints, 0) / POINTS_REDEMPTION_STEP) * POINTS_REDEMPTION_STEP;
  const eligibleByOrder = Math.floor(Math.max(subtotal, 0) / SAR_PER_POINTS_STEP) * POINTS_REDEMPTION_STEP;
  const wholeRequestedBlocks = Math.floor(Math.max(requestedPoints, 0) / POINTS_REDEMPTION_STEP) * POINTS_REDEMPTION_STEP;
  return Math.min(eligibleByBalance, eligibleByOrder, wholeRequestedBlocks);
}

export function calculateCheckoutTotals(items: CartItem[], memberPoints: number, requestedPoints: number): CheckoutTotals {
  const subtotal = getCartSubtotal(items);
  const redeemedPoints = getRedeemablePoints(subtotal, memberPoints, requestedPoints);
  const pointsDiscountSar = (redeemedPoints / POINTS_REDEMPTION_STEP) * SAR_PER_POINTS_STEP;
  return {
    subtotal,
    redeemedPoints,
    pointsDiscountSar,
    totalSar: Math.max(subtotal - pointsDiscountSar, 0),
    remainingPoints: Math.max(memberPoints - redeemedPoints, 0),
  };
}

export function useMarketplaceCart() {
  const [items, setItems] = useState<CartItem[]>(readStoredCart);

  const updateItems = useCallback((recipe: (current: CartItem[]) => CartItem[]) => {
    setItems((current) => {
      const next = recipe(current);
      storeCart(next);
      return next;
    });
  }, []);

  const addProduct = useCallback((product: MarketplaceProduct) => {
    updateItems((current) => addCartProduct(current, product));
  }, [updateItems]);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    updateItems((current) => setCartProductQuantity(current, productId, quantity));
  }, [updateItems]);

  const removeProduct = useCallback((productId: string) => {
    updateItems((current) => current.filter((item) => item.product.id !== productId));
  }, [updateItems]);

  const clearCart = useCallback(() => updateItems(() => []), [updateItems]);

  const itemCount = useMemo(() => items.reduce((count, item) => count + item.quantity, 0), [items]);
  const subtotal = useMemo(() => getCartSubtotal(items), [items]);
  return { items, itemCount, subtotal, addProduct, setQuantity, removeProduct, clearCart };
}
