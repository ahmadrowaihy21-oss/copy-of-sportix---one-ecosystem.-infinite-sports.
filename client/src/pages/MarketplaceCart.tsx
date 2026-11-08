import { ArrowLeft, ArrowUpLeft, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { MEMBER_POINTS_BALANCE, useMarketplaceCart } from "./marketplaceCommerce";
import "./marketplaceCommerce.css";

const logoUrl = "/manus-storage/sportix-ecosystem-approved-logo_e0eb06c5.png";
const formatSar = (amount: number) => `${amount.toLocaleString("ar-SA")} ر.س`;

export default function MarketplaceCart() {
  const [, setLocation] = useLocation();
  const { items, itemCount, subtotal, setQuantity, removeProduct } = useMarketplaceCart();

  return (
    <div className="marketplace-page market-flow-page" dir="rtl">
      <header className="market-flow-header">
        <Link className="market-brand" href="/marketplace"><img src={logoUrl} alt="SPORTIX" /><span>MARKETPLACE</span></Link>
        <button className="market-flow-back" type="button" onClick={() => setLocation("/marketplace")}><ArrowLeft size={17} /> متابعة التسوق</button>
      </header>
      <main className="market-flow-main market-shell">
        <div className="market-flow-kicker"><ShoppingBag size={17} /><span>السلة / {itemCount.toString().padStart(2, "0")} عناصر</span></div>
        <div className="market-flow-heading"><div><p className="market-eyebrow">SPORTIX / CART</p><h1>سلة <em>حركتك.</em></h1></div><p>راجع اختياراتك قبل الانتقال إلى صفحة إتمام الطلب واستخدام نقاط العضو.</p></div>
        {items.length === 0 ? (
          <section className="market-cart-empty"><ShoppingBag size={32} /><h2>سلتك فارغة حالياً.</h2><p>اكتشف منتجات المتاجر الشريكة وأضف ما يناسب مسارك الرياضي.</p><button type="button" onClick={() => setLocation("/marketplace")}>استكشف المنتجات <ArrowUpLeft size={17} /></button></section>
        ) : (
          <div className="market-cart-layout">
            <section className="market-cart-items" aria-label="عناصر سلة التسوق">
              {items.map((item) => <article key={item.product.id} className="market-cart-item">
                <div className={`market-cart-thumb market-visual-${item.product.visual}`} aria-hidden="true"><i /></div>
                <div className="market-cart-item-info"><span>{item.product.store}</span><h2>{item.product.name}</h2><p>{item.product.category}</p><strong>{formatSar(item.product.priceSar)}</strong></div>
                <div className="market-cart-item-actions"><div className="market-quantity-control"><button type="button" onClick={() => setQuantity(item.product.id, item.quantity - 1)} aria-label={`تقليل كمية ${item.product.name}`}><Minus size={14} /></button><b>{item.quantity}</b><button type="button" onClick={() => setQuantity(item.product.id, item.quantity + 1)} aria-label={`زيادة كمية ${item.product.name}`}><Plus size={14} /></button></div><button className="market-remove" type="button" onClick={() => removeProduct(item.product.id)}><Trash2 size={16} /> إزالة</button></div>
              </article>)}
            </section>
            <aside className="market-order-summary">
              <p className="market-eyebrow">ملخص الطلب</p><div className="market-summary-line"><span>إجمالي المنتجات</span><b>{formatSar(subtotal)}</b></div><div className="market-summary-line market-summary-points"><span>رصيد نقاط العضو</span><b>{MEMBER_POINTS_BALANCE.toLocaleString("ar-SA")} نقطة</b></div><p className="market-summary-rule">كل 1,000 نقطة تمنحك خصماً بقيمة 5 ر.س عند إتمام الطلب.</p><div className="market-summary-total"><span>الإجمالي قبل الخصم</span><b>{formatSar(subtotal)}</b></div><button type="button" onClick={() => setLocation("/marketplace/checkout")}>إتمام الطلب <ArrowUpLeft size={18} /></button><small>الأسعار، الرصيد، والدفع هنا لأغراض العرض التجريبي فقط.</small>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
