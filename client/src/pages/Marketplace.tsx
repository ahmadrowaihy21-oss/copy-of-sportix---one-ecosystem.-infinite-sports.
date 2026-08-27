import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowUpLeft,
  BadgeCheck,
  ChevronLeft,
  CircleGauge,
  Copy,
  Heart,
  HeartHandshake,
  Leaf,
  Menu,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Ticket,
  UsersRound,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import "./marketplace.css";
import { useMarketplaceCart } from "./marketplaceCommerce";
import {
  filterMarketplaceProducts,
  impactInitiatives,
  marketplaceOffers,
  marketplaceProducts,
  offerCopyText,
  partnerStores,
  productCategories,
  type ImpactInitiative,
  type MarketplaceOffer,
  type MarketplaceProduct,
  type ProductCategory,
  type StoreFilter,
} from "./marketplaceData";

const logoUrl = "/manus-storage/sportix-ecosystem-approved-logo_e0eb06c5.png";

type BenefitView = "coupon" | "membership";
type MarketplaceSection = "products" | "benefits" | "impact";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function ProductVisual({ visual }: { visual: MarketplaceProduct["visual"] }) {
  return (
    <div className={`market-product-visual market-visual-${visual}`} aria-hidden="true">
      <i className="market-visual-shadow" />
      <span className="market-visual-object" />
      <b className="market-visual-grid" />
    </div>
  );
}

function copyOffer(offer: MarketplaceOffer) {
  const text = offerCopyText(offer);
  void navigator.clipboard?.writeText(text);
  toast.success(offer.code ? `تم نسخ الرمز ${offer.code}` : "تم حفظ تفاصيل العضوية", {
    description: "هذه تجربة أولية ولا تتضمن عملية شراء أو استرداداً مباشراً.",
  });
}

export default function Marketplace() {
  const [, setLocation] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<MarketplaceSection>("products");
  const [category, setCategory] = useState<ProductCategory>("الكل");
  const [storeFilter, setStoreFilter] = useState<StoreFilter>("الكل");
  const [query, setQuery] = useState("");
  const [benefitView, setBenefitView] = useState<BenefitView>("coupon");
  const [favourites, setFavourites] = useState<Set<string>>(() => new Set());
  const [selectedProduct, setSelectedProduct] = useState<MarketplaceProduct>(marketplaceProducts[0]);
  const [selectedImpact, setSelectedImpact] = useState<ImpactInitiative>(impactInitiatives[0]);
  const { itemCount, addProduct } = useMarketplaceCart();

  const visibleProducts = useMemo(
    () => filterMarketplaceProducts(marketplaceProducts, category, query, storeFilter),
    [category, query, storeFilter],
  );

  const visibleOffers = useMemo(
    () => marketplaceOffers.filter((offer) => offer.type === benefitView),
    [benefitView],
  );

  useEffect(() => {
    document.title = "SPORTIX Marketplace — القيمة تتحرك معك";
    document.documentElement.lang = "ar";
    document.documentElement.dir = "rtl";
    return () => {
      document.documentElement.lang = "en";
      document.documentElement.dir = "ltr";
    };
  }, []);

  useEffect(() => {
    if (visibleProducts.length && !visibleProducts.some((product) => product.id === selectedProduct.id)) {
      setSelectedProduct(visibleProducts[0]);
    }
  }, [selectedProduct.id, visibleProducts]);

  const scrollToSection = (section: MarketplaceSection) => {
    setActiveSection(section);
    setMenuOpen(false);
    document.getElementById(`market-${section}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const toggleFavourite = (productId: string) => {
    setFavourites((current) => {
      const next = new Set(current);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  };

  const selectProduct = (product: MarketplaceProduct) => {
    setSelectedProduct(product);
  };

  const addToCart = (product: MarketplaceProduct) => {
    addProduct(product);
    toast.success(`تمت إضافة ${product.name} إلى السلة`, { description: "يمكنك مراجعة الكمية واستبدال نقاط العضو قبل إتمام الطلب." });
  };

  return (
    <div className="marketplace-page" dir="rtl">
      <div className="market-noise" aria-hidden="true" />
      <header className="market-header">
        <a className="market-brand" href="/" aria-label="العودة إلى SPORTIX">
          <img src={logoUrl} alt="SPORTIX" />
          <span>MARKETPLACE</span>
        </a>
        <nav className={`market-nav ${menuOpen ? "is-open" : ""}`} aria-label="أقسام السوق">
          <button className={activeSection === "products" ? "is-active" : ""} type="button" onClick={() => scrollToSection("products")}>المنتجات</button>
          <button className={activeSection === "benefits" ? "is-active" : ""} type="button" onClick={() => scrollToSection("benefits")}>الكوبونات والعضويات</button>
          <button className={activeSection === "impact" ? "is-active" : ""} type="button" onClick={() => scrollToSection("impact")}>SPORTIX Impact</button>
          <a href="/" className="market-back-link">المنصة <ArrowLeft size={15} /></a>
        </nav>
        <div className="market-header-actions">
          <button className="market-bag-status" type="button" onClick={() => setLocation("/marketplace/cart")} aria-label={`فتح السلة، ${itemCount} عناصر`}><ShoppingBag size={16} /> <span>{itemCount}</span><b>السلة</b></button>
          <button className="market-menu-button" type="button" aria-label="فتح القائمة" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      <main>
        <section className="market-hero" aria-labelledby="market-title">
          <div className="market-hero-grid" aria-hidden="true"><i /><i /><i /><i /></div>
          <motion.div className="market-hero-copy" initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}>
            <p className="market-eyebrow"><span /> SPORTIX / MARKETPLACE / 01</p>
            <h1 id="market-title">قيمةٌ تتحرك<br /><em>معك.</em></h1>
            <p>مساحة واحدة لاكتشاف ما يدعم حركتك، من التجهيز والاشتراكات إلى خيارات الأثر التي تمنح نقاطك معنى إضافياً.</p>
            <div className="market-hero-actions">
              <button type="button" onClick={() => scrollToSection("products")}>استكشف المنتجات <ArrowUpLeft size={18} /></button>
              <span>نموذج تجربة <BadgeCheck size={15} /></span>
            </div>
          </motion.div>
          <motion.aside className="market-hero-meter" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.22 }}>
            <p>SPORTIX POINTS</p>
            <strong>1,240</strong>
            <span>رصيد تجريبي متاح للاكتشاف</span>
            <div className="market-meter-line"><i /></div>
            <footer><span><Sparkles size={15} /> قيمة</span><span><HeartHandshake size={15} /> أثر</span></footer>
          </motion.aside>
          <div className="market-hero-footer"><span>03 مسارات قيمة</span><i /><span>منتجات / وصول / أثر</span></div>
        </section>

        <section id="market-products" className="market-section market-products" aria-labelledby="products-title">
          <div className="market-shell">
            <div className="market-section-heading">
              <div><p className="market-eyebrow">01 / PRODUCTS</p><h2 id="products-title">اختر ما يُبقي<br /><em>حركتك مستمرة.</em></h2></div>
              <p>كتالوج تجريبي يجمع متاجر التقنية والملابس والأحذية ومعدات التدريب في مسار واحد للحركة.</p>
            </div>

            <div className="market-store-rail market-store-filter" role="tablist" aria-label="تصفية المنتجات حسب المتجر">
              <p>تصفية حسب المتجر</p>
              <button type="button" role="tab" aria-selected={storeFilter === "الكل"} className={storeFilter === "الكل" ? "is-active" : ""} onClick={() => setStoreFilter("الكل")}><strong>الكل</strong><span>جميع المتاجر</span></button>
              {partnerStores.map((store) => <button key={store.name} type="button" role="tab" aria-selected={storeFilter === store.name} className={storeFilter === store.name ? "is-active" : ""} onClick={() => setStoreFilter(store.name)}><strong>{store.name}</strong><span>{store.category}</span></button>)}
              <small>أسماء المتاجر والعروض هنا أمثلة مرئية للبروتوتايب، وليست شراكات أو عروضاً مؤكدة.</small>
            </div>

            <div className="market-controls" aria-label="فلترة المنتجات">
              <label className="market-search"><Search size={18} /><span className="sr-only">ابحث في المنتجات</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث عن تجهيزك التالي" /></label>
              <div className="market-filter-row" role="tablist" aria-label="تصنيفات المنتجات">
                {productCategories.map((item) => <button key={item} type="button" role="tab" aria-selected={category === item} className={category === item ? "is-active" : ""} onClick={() => setCategory(item)}>{item}</button>)}
              </div>
              <p className="market-results">{visibleProducts.length.toString().padStart(2, "0")} عناصر في المسار</p>
            </div>

            <div className="market-products-layout">
              <div className="market-product-grid">
                {visibleProducts.map((product, index) => (
                  <motion.article className={`market-product-card ${selectedProduct.id === product.id ? "is-selected" : ""}`} key={product.id} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} variants={fadeUp} transition={{ duration: 0.42, delay: index * 0.04 }}>
                    <button className="market-favourite" type="button" onClick={() => toggleFavourite(product.id)} aria-label={favourites.has(product.id) ? `إزالة ${product.name} من المحفوظات` : `حفظ ${product.name}`}>
                      <Heart size={16} fill={favourites.has(product.id) ? "currentColor" : "none"} />
                    </button>
                    <button className="market-product-select" type="button" onClick={() => selectProduct(product)} aria-label={`عرض ${product.name}`}>
                      <ProductVisual visual={product.visual} />
                      <span className="market-product-store">{product.store}</span>
                      <span className="market-product-tag">{product.label}</span>
                      <h3>{product.name}</h3>
                      <p>{product.description}</p>
                      <footer><span>{product.category}</span><strong>{product.priceSar} ر.س</strong></footer>
                    </button>
                  </motion.article>
                ))}
                {visibleProducts.length === 0 && <div className="market-empty"><Search size={24} /><p>لا توجد عناصر تطابق بحثك حالياً.</p><button type="button" onClick={() => { setCategory("الكل"); setStoreFilter("الكل"); setQuery(""); }}>إعادة الضبط</button></div>}
              </div>

              <aside className="market-product-detail" aria-label="تفاصيل المنتج المختار">
                <div className="market-detail-top"><span>اختيارك التالي</span><CircleGauge size={20} /></div>
                <ProductVisual visual={selectedProduct.visual} />
                <p className="market-eyebrow">{selectedProduct.label}</p>
                <h3>{selectedProduct.name}</h3>
                <p>{selectedProduct.description}</p>
                <div className="market-detail-data"><span>المتجر <b>{selectedProduct.store}</b></span><span>الفئة <b>{selectedProduct.category}</b></span><span>السعر <b>{selectedProduct.priceSar} ر.س</b></span></div>
                <button type="button" onClick={() => addToCart(selectedProduct)}>أضف إلى السلة <ChevronLeft size={18} /></button>
              </aside>
            </div>
          </div>
        </section>

        <section id="market-benefits" className="market-section market-benefits" aria-labelledby="benefits-title">
          <div className="market-shell">
            <div className="market-section-heading market-section-heading-contrast">
              <div><p className="market-eyebrow">02 / ACCESS</p><h2 id="benefits-title">استخدم ما<br /><em>تكسبه.</em></h2></div>
              <p>الكوبونات والعضويات جزء من الهوية الرياضية نفسها، مع قيمة واضحة ومسار استعمال مفهوم.</p>
            </div>
            <div className="market-benefit-switch" role="tablist" aria-label="أنواع الوصول">
              <button type="button" role="tab" aria-selected={benefitView === "coupon"} className={benefitView === "coupon" ? "is-active" : ""} onClick={() => setBenefitView("coupon")}><Ticket size={17} /> الكوبونات</button>
              <button type="button" role="tab" aria-selected={benefitView === "membership"} className={benefitView === "membership" ? "is-active" : ""} onClick={() => setBenefitView("membership")}><UsersRound size={17} /> العضويات</button>
            </div>
            <div className="market-offer-grid">
              {visibleOffers.map((offer, index) => (
                <motion.article className="market-offer-card" key={offer.id} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp} transition={{ duration: 0.45, delay: index * 0.08 }}>
                  <div className="market-offer-top"><span>{offer.eyebrow}</span><span>{offer.type === "coupon" ? <Ticket size={18} /> : <ShieldCheck size={18} />}</span></div>
                  <h3>{offer.title}</h3>
                  <p>{offer.description}</p>
                  <div className="market-offer-code"><span>{offer.code ?? offer.status}</span><button type="button" onClick={() => copyOffer(offer)} aria-label={`نسخ تفاصيل ${offer.title}`}><Copy size={17} /></button></div>
                  <footer><span>{offer.status}</span><strong>{offer.points} نقطة</strong></footer>
                </motion.article>
              ))}
            </div>
            <p className="market-prototype-note"><BadgeCheck size={16} /> واجهة نموذجية: تُعرَض قيمة العرض بوضوح قبل تفعيل الاسترداد أو العضوية في النسخة المتصلة.</p>
          </div>
        </section>

        <section id="market-impact" className="market-section market-impact" aria-labelledby="impact-title">
          <div className="market-shell">
            <div className="market-impact-intro">
              <div><p className="market-eyebrow">03 / SPORTIX IMPACT</p><h2 id="impact-title">دَع القيمة<br /><em>تصل أبعد.</em></h2></div>
              <div className="market-impact-signal"><Leaf size={21} /><p>التطوع والدعم وتوجيه النقاط تتحول إلى مسارات أثر واضحة، بعد التحقق من الجهة والمبادرة.</p></div>
            </div>
            <div className="market-impact-layout">
              <div className="market-impact-list">
                {impactInitiatives.map((initiative, index) => (
                  <button key={initiative.id} type="button" className={`market-impact-card ${selectedImpact.id === initiative.id ? "is-selected" : ""}`} onClick={() => setSelectedImpact(initiative)}>
                    <span>0{index + 1}</span><div><p>{initiative.eyebrow}</p><h3>{initiative.title}</h3></div><ChevronLeft size={20} />
                  </button>
                ))}
              </div>
              <aside className="market-impact-detail">
                <div className="market-impact-detail-icon"><HeartHandshake size={31} /></div>
                <p>{selectedImpact.eyebrow}</p>
                <h3>{selectedImpact.title}</h3>
                <span>{selectedImpact.description}</span>
                <p className="market-impact-verification"><ShieldCheck size={16} /> {selectedImpact.verification}</p>
                <button type="button" onClick={() => toast.message("تم اختيار مسار الأثر", { description: "سيُستكمل التوجيه الحقيقي بعد ربط المبادرات المعتمدة ودفتر النقاط." })}>{selectedImpact.mode} <ArrowUpLeft size={17} /></button>
              </aside>
            </div>
          </div>
        </section>

        <section className="market-closing">
          <div className="market-shell market-closing-inner"><p className="market-eyebrow">SPORTIX / GOVERNED VALUE</p><h2>تتحرّك.<br /><em>وتختار المعنى.</em></h2><p>هذا البروتوتايب يضع المنتج والوصول والأثر في تجربة واحدة، مع فصل واضح بين الاستكشاف التجريبي وأي عملية شراء أو استرداد فعلية.</p><a href="/">العودة إلى SPORTIX <ArrowLeft size={17} /></a></div>
        </section>
      </main>
    </div>
  );
}
