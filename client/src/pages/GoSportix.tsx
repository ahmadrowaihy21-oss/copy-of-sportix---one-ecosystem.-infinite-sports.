import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowUpLeft, CalendarDays, Check, ChevronLeft, CircleDot, Clock3, MapPin, Menu, Minus, Plus, Search, Sparkles, Ticket, UsersRound, X } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import "./goSportix.css";
import { calculateBookingTotal, filterGoActivities, goActivities, goSportFilters, type GoActivity, type GoSport } from "./goSportixData";

const logoUrl = "/manus-storage/sportix-ecosystem-approved-logo_e0eb06c5.png";

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

function ActivityVisual({ visual }: { visual: GoActivity["visual"] }) {
  return <div className={`go-activity-visual go-visual-${visual}`} aria-hidden="true"><i /><b /><span /></div>;
}

export default function GoSportix() {
  const [, setLocation] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [sport, setSport] = useState<GoSport>("الكل");
  const [query, setQuery] = useState("");
  const [selectedActivity, setSelectedActivity] = useState<GoActivity>(goActivities[0]);
  const [attendees, setAttendees] = useState(1);
  const [selectedTime, setSelectedTime] = useState("هذا الأسبوع");

  const activities = useMemo(() => filterGoActivities(goActivities, sport, query), [sport, query]);
  const total = calculateBookingTotal(selectedActivity, attendees);

  useEffect(() => {
    document.title = "GO SPORTIX — تحرّك واكتشف";
    document.documentElement.lang = "ar";
    document.documentElement.dir = "rtl";
    return () => { document.documentElement.lang = "en"; document.documentElement.dir = "ltr"; };
  }, []);

  useEffect(() => {
    if (activities.length && !activities.some((activity) => activity.id === selectedActivity.id)) setSelectedActivity(activities[0]);
  }, [activities, selectedActivity.id]);

  const chooseActivity = (activity: GoActivity) => { setSelectedActivity(activity); setAttendees(1); };
  const confirmBooking = () => toast.success(`تم حفظ ${selectedActivity.title} ضمن خطتك`, { description: total === 0 ? "هذه تجربة مفتوحة في البروتوتايب ولا تتطلب دفعاً." : `المبلغ التوضيحي: ${total} ر.س. لا يتم تنفيذ حجز أو دفع فعلي.` });

  return (
    <div className="go-page" dir="rtl">
      <div className="go-noise" aria-hidden="true" />
      <header className="go-header">
        <a className="go-brand" href="/"><img src={logoUrl} alt="SPORTIX" /><span>GO SPORTIX</span></a>
        <nav className={`go-nav ${menuOpen ? "is-open" : ""}`} aria-label="التنقل في GO SPORTIX">
          <a href="#go-discover" onClick={() => setMenuOpen(false)}>اكتشف</a>
          <a href="#go-plan" onClick={() => setMenuOpen(false)}>خطتك</a>
          <button type="button" onClick={() => setLocation("/marketplace")}>Marketplace</button>
          <a href="/">المنصة <ArrowLeft size={15} /></a>
        </nav>
        <button className="go-menu" type="button" aria-label="فتح القائمة" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? <X size={21} /> : <Menu size={21} />}</button>
      </header>

      <main>
        <section className="go-hero" aria-labelledby="go-title">
          <div className="go-hero-orbit orbit-one" aria-hidden="true" /><div className="go-hero-orbit orbit-two" aria-hidden="true" />
          <motion.div className="go-hero-copy" initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: .7, ease: [0.23, 1, 0.32, 1] }}>
            <p className="go-eyebrow"><i /> GO SPORTIX / DISCOVER</p>
            <h1 id="go-title">اخرج.<br /><em>وتحرّك.</em></h1>
            <p>اكتشف التجارب الرياضية القريبة، اختر وقتك، ثم اجعل الحركة القادمة جزءاً من مسارك الرياضي.</p>
            <div className="go-hero-actions"><a href="#go-discover">اكتشف الأنشطة <ArrowUpLeft size={18} /></a><span><CircleDot size={15} /> تجارب منظمة</span></div>
          </motion.div>
          <motion.aside className="go-hero-signal" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .6, delay: .16 }}><span>LIVE PATH</span><strong>05</strong><p>أنشطة قريبة<br />تنتظرك هذا الأسبوع.</p><i /><small>اختر المسار المناسب لك</small></motion.aside>
          <footer><span>GO / BOOK / MOVE / RETURN</span><span>كل تجربة تبني سياقاً جديداً.</span></footer>
        </section>

        <section id="go-discover" className="go-discover">
          <div className="go-shell">
            <div className="go-section-heading"><div><p className="go-eyebrow">01 / DISCOVER</p><h2>ابحث عن<br /><em>حركتك التالية.</em></h2></div><p>نموذج للاكتشاف والحجز داخل المنصة، بحيث تبقى التجربة الرياضية واضحة قبل الالتزام بها.</p></div>
            <div className="go-time-rail" role="tablist" aria-label="اختيار وقت النشاط">{["اليوم", "غداً", "هذا الأسبوع"].map((time) => <button key={time} type="button" role="tab" aria-selected={selectedTime === time} className={selectedTime === time ? "is-active" : ""} onClick={() => setSelectedTime(time)}>{time}</button>)}<span><CalendarDays size={16} /> {selectedTime}</span></div>
            <div className="go-controls"><label><Search size={18} /><span className="go-sr-only">ابحث عن نشاط</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث حسب الرياضة أو المكان" /></label><div role="tablist" aria-label="فلترة الأنشطة الرياضية">{goSportFilters.map((item) => <button key={item} type="button" role="tab" aria-selected={sport === item} className={sport === item ? "is-active" : ""} onClick={() => setSport(item)}>{item}</button>)}</div></div>
            <div className="go-discovery-layout">
              <div className="go-activity-list">{activities.map((activity, index) => <motion.button key={activity.id} className={`go-activity-card ${selectedActivity.id === activity.id ? "is-selected" : ""}`} type="button" onClick={() => chooseActivity(activity)} initial="hidden" whileInView="visible" viewport={{ once: true, amount: .15 }} variants={fadeUp} transition={{ duration: .42, delay: index * .05 }}><ActivityVisual visual={activity.visual} /><div><span>{activity.partner}</span><h3>{activity.title}</h3><p><MapPin size={14} /> {activity.location} <i /> <Clock3 size={14} /> {activity.schedule}</p></div><strong>{activity.priceSar === 0 ? "مفتوح" : `${activity.priceSar} ر.س`}</strong></motion.button>)}{activities.length === 0 && <div className="go-empty"><Search size={24} /><p>لا توجد تجربة تطابق بحثك حالياً.</p><button type="button" onClick={() => { setSport("الكل"); setQuery(""); }}>إعادة الضبط</button></div>}</div>
              <aside id="go-plan" className="go-booking-panel"><div className="go-booking-top"><span>خطتك التالية</span><Ticket size={19} /></div><ActivityVisual visual={selectedActivity.visual} /><p className="go-eyebrow">{selectedActivity.partner}</p><h3>{selectedActivity.title}</h3><p className="go-booking-note">{selectedActivity.note}</p><div className="go-booking-meta"><span><MapPin size={15} /> {selectedActivity.location}</span><span><Clock3 size={15} /> {selectedActivity.duration}</span><span><UsersRound size={15} /> {selectedActivity.remainingPlaces} أماكن متاحة</span></div><div className="go-attendees"><span>عدد المشاركين</span><div><button type="button" onClick={() => setAttendees((count) => Math.max(1, count - 1))} aria-label="تقليل المشاركين"><Minus size={14} /></button><b>{attendees}</b><button type="button" onClick={() => setAttendees((count) => Math.min(selectedActivity.remainingPlaces, count + 1))} aria-label="زيادة المشاركين"><Plus size={14} /></button></div></div><div className="go-booking-total"><span>القيمة التوضيحية</span><b>{total === 0 ? "تجربة مفتوحة" : `${total} ر.س`}</b></div><button className="go-book-action" type="button" onClick={confirmBooking}><Check size={17} /> أضف إلى خطتي <ChevronLeft size={17} /></button><small>لا ينشئ هذا البروتوتايب حجزاً أو دفعة فعلية.</small></aside>
            </div>
          </div>
        </section>

        <section className="go-route-section"><div className="go-shell go-route-layout"><div><p className="go-eyebrow">GO SPORTIX / ROUTES</p><h2>المكان قريب.<br /><em>والخطوة محسوبة.</em></h2><p>يحوّل GO SPORTIX النشاط القريب إلى تجربة قابلة للاكتشاف ثم إلى مشاركة واضحة ضمن مسارك الرياضي.</p><a href="#go-discover">شاهد الأنشطة <ArrowUpLeft size={17} /></a></div><div className="go-route-map" aria-label="رسم توضيحي لمسار رياضي"><span className="go-map-label label-a">ابدأ</span><span className="go-map-label label-b">تحرّك</span><span className="go-map-label label-c">شارك</span><i className="go-route-line" /><b className="go-map-point point-a" /><b className="go-map-point point-b" /><b className="go-map-point point-c" /><footer><MapPin size={17} /> رياضة قريبة / مجتمع متحرك</footer></div></div></section>
      </main>
    </div>
  );
}
