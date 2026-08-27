import { describe, expect, it } from "vitest";
import { addCartProduct, calculateCheckoutTotals, getRedeemablePoints, POINTS_REDEMPTION_STEP, SAR_PER_POINTS_STEP, setCartProductQuantity } from "./marketplaceCommerce";
import { marketplaceProducts } from "./marketplaceData";

describe("marketplace checkout calculations", () => {
  const watch = marketplaceProducts.find((product) => product.id === "xtra-watch")!;
  const headphones = marketplaceProducts.find((product) => product.id === "xtra-audio")!;

  it("converts only complete 1,000-point blocks into 5 SAR discounts", () => {
    expect(POINTS_REDEMPTION_STEP).toBe(1000);
    expect(SAR_PER_POINTS_STEP).toBe(5);
    expect(getRedeemablePoints(100, 1240, 1240)).toBe(1000);
    expect(getRedeemablePoints(4, 5000, 5000)).toBe(0);
  });

  it("calculates member points redemption without allowing a negative cash total", () => {
    const totals = calculateCheckoutTotals([{ product: watch, quantity: 1 }, { product: headphones, quantity: 2 }], 2240, 2240);
    expect(totals.subtotal).toBe(897);
    expect(totals.redeemedPoints).toBe(2000);
    expect(totals.pointsDiscountSar).toBe(10);
    expect(totals.totalSar).toBe(887);
    expect(totals.remainingPoints).toBe(240);
  });

  it("adds, updates, and removes cart quantities without mutating a prior cart state", () => {
    const initial = [];
    const withWatch = addCartProduct(initial, watch);
    const withMoreWatch = addCartProduct(withWatch, watch);
    const withTwoProducts = addCartProduct(withMoreWatch, headphones);
    const updated = setCartProductQuantity(withTwoProducts, watch.id, 3);
    const removed = setCartProductQuantity(updated, headphones.id, 0);

    expect(initial).toEqual([]);
    expect(withMoreWatch.find((item) => item.product.id === watch.id)?.quantity).toBe(2);
    expect(updated.find((item) => item.product.id === watch.id)?.quantity).toBe(3);
    expect(removed).toEqual([{ product: watch, quantity: 3 }]);
  });
});
