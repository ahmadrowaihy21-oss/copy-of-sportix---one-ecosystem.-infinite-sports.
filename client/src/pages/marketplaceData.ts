export type ProductCategory = "الكل" | "إلكترونيات" | "ملابس رياضية" | "أحذية رياضية" | "معدات تدريب";

export type MarketplaceProduct = {
  id: string;
  name: string;
  category: Exclude<ProductCategory, "الكل">;
  store: string;
  description: string;
  priceSar: number;
  points: number;
  label: string;
  visual: "shoe" | "kit" | "jacket" | "band" | "watch" | "headphones";
};

export const productCategories: ProductCategory[] = ["الكل", "إلكترونيات", "ملابس رياضية", "أحذية رياضية", "معدات تدريب"];

export const partnerStores = [
  { name: "إكسترا", category: "إلكترونيات" },
  { name: "SPORTIX", category: "ملابس رياضية" },
  { name: "adidas", category: "أحذية رياضية" },
  { name: "متاجر شريكة", category: "معدات تدريب" },
] as const;

export type StoreFilter = "الكل" | (typeof partnerStores)[number]["name"];

export const marketplaceProducts: MarketplaceProduct[] = [
  { id: "xtra-watch", name: "ساعة لياقة ذكية", category: "إلكترونيات", store: "إكسترا", description: "تقنية قابلة للارتداء لمتابعة نشاطك وجلسات التمرين اليومية.", priceSar: 399, points: 320, label: "تقنية للحركة", visual: "watch" },
  { id: "xtra-audio", name: "سماعات رياضية", category: "إلكترونيات", store: "إكسترا", description: "سماعات لاسلكية للتمرين، الجري، والتنقل بين المسارات.", priceSar: 249, points: 210, label: "صوت الحركة", visual: "headphones" },
  { id: "sportix-shell", name: "جاكيت SPORTIX للحركة", category: "ملابس رياضية", store: "SPORTIX", description: "طبقة رياضية خفيفة للحركة قبل التدريب وبعده.", priceSar: 189, points: 190, label: "ملابس SPORTIX", visual: "jacket" },
  { id: "sportix-band", name: "طقم تمرين SPORTIX", category: "ملابس رياضية", store: "SPORTIX", description: "قطعة أساسية للتمرين المرن داخل الصالة وخارجها.", priceSar: 129, points: 150, label: "اختيار التدريب", visual: "band" },
  { id: "adidas-run", name: "حذاء adidas للجري", category: "أحذية رياضية", store: "adidas", description: "حذاء رياضي ضمن مسار الجري والتدريب اليومي.", priceSar: 549, points: 280, label: "مسار الجري", visual: "shoe" },
  { id: "adidas-court", name: "حذاء adidas للملعب", category: "أحذية رياضية", store: "adidas", description: "خيار أحذية رياضية لتجربة اللعب والتدريب المنظمة.", priceSar: 469, points: 260, label: "مسار الملعب", visual: "shoe" },
  { id: "field-kit", name: "حقيبة أدوات التدريب", category: "معدات تدريب", store: "متاجر شريكة", description: "تجميعة أدوات أولية للإحماء والتنقل إلى الملعب أو الصالة.", priceSar: 159, points: 145, label: "معدات الحركة", visual: "kit" },
  { id: "form-band", name: "مجموعة مقاومة", category: "معدات تدريب", store: "متاجر شريكة", description: "أدوات مقاومة عملية للروتين القصير في أي مكان.", priceSar: 79, points: 95, label: "تحرّك", visual: "band" },
];

export type MarketplaceOffer = {
  id: string;
  type: "coupon" | "membership";
  eyebrow: string;
  title: string;
  description: string;
  code?: string;
  points: number;
  status: string;
};

export const marketplaceOffers: MarketplaceOffer[] = [
  { id: "car-shine", type: "coupon", eyebrow: "خدمات السيارات / تلميع", title: "كوبون تلميع السيارة", description: "تصميم لمسار حفظ واسترداد عرض تلميع السيارة بعد اعتماد مقدم الخدمة.", code: "SHINE", points: 40, status: "كوبون تجريبي" },
  { id: "hotel-stay", type: "coupon", eyebrow: "الضيافة / فنادق", title: "كوبون إقامة فندقية", description: "عرض مقترح للإقامات الرياضية والرحلات القصيرة عبر فندق شريك معتمد.", code: "STAY", points: 80, status: "كوبون تجريبي" },
  { id: "leisure-trip", type: "coupon", eyebrow: "الترفيه / رحلات", title: "كوبون رحلة ترفيهية", description: "واجهة لعرض الرحلات والأنشطة الترفيهية مع شروط الاستخدام الواضحة.", code: "TRIP", points: 95, status: "كوبون تجريبي" },
  { id: "gym-month", type: "membership", eyebrow: "PASS / GYM", title: "اشتراك جيم شهري", description: "عضوية شهرية للجيم تُعرض بقيمتها ونقاطها قبل تفعيل الاشتراك.", points: 220, status: "عضوية شهرية" },
  { id: "gym-quarter", type: "membership", eyebrow: "PASS / GYM", title: "اشتراك جيم ربع سنوي", description: "تصميم لعضوية جيم ممتدة مع توضيح مدة الاستخدام ومزايا الوصول.", points: 540, status: "عضوية ربع سنوية" },
];

export type ImpactInitiative = {
  id: string;
  title: string;
  eyebrow: string;
  description: string;
  verification: string;
  mode: string;
};

export const impactInitiatives: ImpactInitiative[] = [
  { id: "orphans", title: "ادعم الأيتام", eyebrow: "IMPACT / التكافل", description: "مسار تبرع تصوري لدعم الأيتام عبر جهة خيرية معتمدة وطريقة صرف واضحة.", verification: "يتطلب اعتماد الجهة وآلية الصرف", mode: "وجّه نقاطك" },
  { id: "mosque", title: "ساهم في بناء مسجد", eyebrow: "IMPACT / الوقف", description: "مسار مساهمة تصوري لمشروع بناء مسجد بعد التحقق من الجهة المنفذة ونطاق المشروع.", verification: "يتطلب اعتماد المشروع والجهة", mode: "ساهم بالمبادرة" },
  { id: "homes", title: "رمّم بيوت الأسر المتعففة", eyebrow: "IMPACT / السكن", description: "مسار أثر تصوري لدعم ترميم المنازل بالتعاون مع جهة موثقة وتقرير احتياج واضح.", verification: "يتطلب توثيق الاحتياج والجهة", mode: "ادعم الترميم" },
];

export function filterMarketplaceProducts(
  products: MarketplaceProduct[],
  category: ProductCategory,
  query: string,
  store: StoreFilter = "الكل",
): MarketplaceProduct[] {
  const normalizedQuery = query.trim().toLocaleLowerCase("ar");

  return products.filter((product) => {
    const inCategory = category === "الكل" || product.category === category;
    const inStore = store === "الكل" || product.store === store;
    const searchable = `${product.name} ${product.store} ${product.category} ${product.description}`.toLocaleLowerCase("ar");
    return inCategory && inStore && (!normalizedQuery || searchable.includes(normalizedQuery));
  });
}

export function offerCopyText(offer: MarketplaceOffer): string {
  return offer.code ? `${offer.title} — رمز العرض: ${offer.code}` : `${offer.title} — ${offer.status}`;
}
