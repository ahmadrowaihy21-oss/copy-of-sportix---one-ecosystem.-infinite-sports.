import { describe, expect, it } from "vitest";
import { filterMarketplaceProducts, marketplaceOffers, marketplaceProducts, offerCopyText } from "./marketplaceData";

describe("marketplace data helpers", () => {
  it("filters products by category and Arabic search term", () => {
    const electronicsProducts = filterMarketplaceProducts(marketplaceProducts, "إلكترونيات", "");
    const xtraProducts = filterMarketplaceProducts(marketplaceProducts, "الكل", "إكسترا");

    expect(electronicsProducts.map((product) => product.id)).toEqual(["xtra-watch", "xtra-audio"]);
    expect(xtraProducts.map((product) => product.id)).toEqual(["xtra-watch", "xtra-audio"]);
  });

  it("composes the store filter with the active category and search term", () => {
    const adidasProducts = filterMarketplaceProducts(marketplaceProducts, "الكل", "", "adidas");
    const sportixSearch = filterMarketplaceProducts(marketplaceProducts, "ملابس رياضية", "جاكيت", "SPORTIX");
    const incompatibleFilters = filterMarketplaceProducts(marketplaceProducts, "أحذية رياضية", "", "إكسترا");

    expect(adidasProducts.map((product) => product.id)).toEqual(["adidas-run", "adidas-court"]);
    expect(sportixSearch.map((product) => product.id)).toEqual(["sportix-shell"]);
    expect(incompatibleFilters).toEqual([]);
  });

  it("returns a reusable offer copy string for coupon and membership states", () => {
    const coupon = marketplaceOffers.find((offer) => offer.id === "car-shine");
    const membership = marketplaceOffers.find((offer) => offer.id === "gym-month");

    expect(offerCopyText(coupon!)).toContain("SHINE");
    expect(offerCopyText(membership!)).toContain("عضوية شهرية");
  });
});
