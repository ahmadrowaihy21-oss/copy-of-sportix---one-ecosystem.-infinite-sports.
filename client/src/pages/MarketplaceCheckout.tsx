import { ArrowLeft, BadgeCheck, CreditCard, MapPin, Minus, ShieldCheck, ShoppingBag, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { calculateCheckoutTotals, getRedeemablePoints, MEMBER_POINTS_BALANCE, useMarketplaceCart } from "./marketplaceCommerce";
import "./marketplaceCommerce.css";

const logoUrl = "/manus-storage/sportix-ecosystem-approved-logo_e0eb06c5.png";
const formatSar = (amount: number) => `${amount.toLocaleString("ar-SA")} ر.س`;

export default function MarketplaceCheckout() {
  const [, setLocation] = useLocation();
  const { items, subtotal, clearCart } = useMarketplaceCart();
  const [usePoints, setUsePoints] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const redeemablePoints = getRedeemablePoints(subtotal, MEMBER_POINTS_BALANCE, MEMBER_POINTS_BALANCE);
  const totals = calculateCheckoutTotals(items, MEMBER_POINTS_BALANCE, usePoints ? redeemablePoints : 0);

  if (!items.length && !isComplete) {
    return <div className="marketplace-page market-flow-page" dir="rtl"><header className="market-flow-header"><Link className="market-brand" href="/marketplace"><img src={logoUrl} alt="SPORTIX" /><span>MARKETPLACE</span></Link></header><main className="market-flow-main market-shell"><section className="market-cart-empty"><ShoppingBag size={32} /><h2>لا يمكن إتمام الطلب بسلة فارغة.</h2><button type="button" onClick={() => setLocation("/marketplace")}>العودة إلى المنتجات <ArrowLeft size={17} /></button></section></main></div>;
  }

  if (isComplete) {
    return <div className="marketplace-page market-flow-page" dir="rtl"><header className="market-flow-header"><Link className="market-brand" href="/marketplace"><img src={logoUrl} alt="SPORTIX" /><span>MARKETPLACE</span></Link></header><main className="market-flow-main market-shell"><section className="market-order-success"><div><BadgeCheck size={37} /></div><p className="market-eyebrow">SPORTIX / PROTOTYPE ORDER</p><h1>تم تسجيل<br /><em>طلبك التجريبي.</em></h1><p>لم يتم تنفيذ أي عملية دفع أو خصم فعلي للنقاط. هذه الشاشة تشرح رحلة إتمام الطلب المقترحة للمستخدم.</p><button type="button" onClick={() => setLocation("/marketplace")}>العودة إلى المتجر <ArrowLeft size={17} /></button></section></main></div>;
  }

  return (
    <div className="marketplace-page market-flow-page" dir="rtl">
      <header className="market-flow-header"><Link className="market-brand" href="/marketplace"><img src={logoUrl} alt="SPORTIX" /><span>MARKETPLACE</span></Link><button className="market-flow-back" type="button" onClick={() => setLocation("/marketplace/cart")}><ArrowLeft size={17} /> العودة إلى السلة</button></header>
      <main className="market-flow-main market-shell">
        <div className="market-flow-kicker"><CreditCard size={17} /><span>إتمام الطلب / الدفع التجريبي</span></div>
        <div className="market-flow-heading"><div><p className="market-eyebrow">SPORTIX / CHECKOUT</p><h1>أتمم طلبك<br /><em>بوضوح.</em></h1></div><p>استخدم رصيد نقاط العضو قبل اختيار وسيلة الدفع، ثم راجع القيمة المتبقية بالريال السعودي.</p></div>
        <div className="market-checkout-layout">
          <section className="market-checkout-form" aria-label="بيانات إتمام الطلب">
            <div className="market-checkout-step"><span>01</span><div><p>معلومات التسليم</p><h2>أين يصل طلبك؟</h2></div><MapPin size={22} /></div>
            <div className="market-checkout-fields"><label>الاسم الكامل<input placeholder="اسم العضو" /></label><label>رقم الجوال<input inputMode="tel" placeholder="05X XXX XXXX" /></label><label>المدينة<input placeholder="الرياض" /></label><label>العنوان<input placeholder="الحي، الشارع، المبنى" /></label></div>
            <div className="market-checkout-step market-payment-step"><span>02</span><div><p>طريقة الدفع</p><h2>القيمة المتبقية</h2></div><CreditCard size={22} /></div>
            <div className="market-payment-card"><CreditCard size={21} /><div><b>بطاقة مدى أو بطاقة ائتمانية</b><span>تُربط بوابة الدفع الفعلية عند تحويل البروتوتايب إلى متجر متصل.</span></div><i /></div>
          </section>
          <aside className="market-checkout-summary">
            <p className="market-eyebrow">ملخص إتمام الطلب</p>
            <div className="market-checkout-products">{items.map((item) => <div key={item.product.id}><span>{item.quantity}×</span><p>{item.product.name}<small>{item.product.store}</small></p><b>{formatSar(item.product.priceSar * item.quantity)}</b></div>)}</div>
            <div className="market-points-panel"><div><Sparkles size={20} /><span>نقاط العضو المتاحة</span><b>{MEMBER_POINTS_BALANCE.toLocaleString("ar-SA")} نقطة</b></div><p>كل 1,000 نقطة = 5 ر.س</p><label className="market-points-toggle"><span><b>استخدم {redeemablePoints.toLocaleString("ar-SA")} نقطة</b><small>خصم بقيمة {formatSar((redeemablePoints / 1000) * 5)}</small></span><button type="button" role="switch" aria-checked={usePoints} className={usePoints ? "is-on" : ""} onClick={() => setUsePoints((current) => !current)}><i /></button></label></div>
            <div className="market-totals"><div><span>إجمالي المنتجات</span><b>{formatSar(totals.subtotal)}</b></div><div className="market-discount"><span>خصم النقاط</span><b><Minus size={13} /> {formatSar(totals.pointsDiscountSar)}</b></div><div className="market-total-due"><span>الإجمالي المستحق</span><b>{formatSar(totals.totalSar)}</b></div><p>سيبقى في الرصيد {totals.remainingPoints.toLocaleString("ar-SA")} نقطة بعد الاستبدال التجريبي.</p></div>
            <button className="market-complete-order" type="button" onClick={() => { clearCart(); setIsComplete(true); }}><ShieldCheck size={18} /> تأكيد الطلب التجريبي</button><small className="market-checkout-disclaimer">لن يتم تحصيل مبلغ أو خصم نقاط فعلية في هذا البروتوتايب.</small>
          </aside>
        </div>
      </main>
    </div>
  );
}
