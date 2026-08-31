/* Kinetic Intelligence: cinematic SPORTIX platform story, using black space, editorial type, and electric-green only as a rare signal. */
import React, { useEffect, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import "../brand-refinement.css";
import { trpc } from "@/lib/trpc";
import SportixBrandMark from "../components/SportixBrandMark";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  Activity,
  ArrowDownLeft,
  ArrowDownRight,
  ArrowRight,
  ArrowUpLeft,
  ArrowUpRight,
  Award,
  Bike,
  Building2,
  Camera,
  Check,
  ChevronRight,
  Crosshair,
  Crown,
  Dumbbell,
  Footprints,
  Gamepad2,
  HeartHandshake,
  Landmark,
  Menu,
  MessageCircle,
  QrCode,
  Route,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  Timer,
  Trophy,
  Users,
  X,
} from "lucide-react";

const heroImage = "/manus-storage/sportix-runner-cinematic_f1ab034b.jpg";
export const loopFilmUrl = "/manus-storage/SPORTIX_Strategic_Vision_Film_Audio_Corrected_1_b02780c3.mp4";

type HeaderNavigationItem = { href: string; label: string };

export const headerNavigationItems: Record<"english" | "arabic", ReadonlyArray<HeaderNavigationItem>> = {
  english: [],
  arabic: [],
};

export function shouldShowHeaderLogout(isProjectAdmin: boolean, hasPartnerSession: boolean, hasIndividualAccess = false) {
  return isProjectAdmin || hasPartnerSession || hasIndividualAccess;
}

const participationLoop = [
  {
    number: "01",
    title: "MOVE",
    label: "YOUR SPORT, YOUR WAY",
    copy: "Walk, run, ride, train, or play within a SPORTIX community.",
    icon: Activity,
  },
  {
    number: "02",
    title: "CHECK IN",
    label: "QR-GOVERNED PARTICIPATION",
    copy: "A partner QR check-in records a qualifying moment of participation.",
    icon: QrCode,
  },
  {
    number: "03",
    title: "BUILD ID",
    label: "ONE SPORT ID",
    copy: "Every approved participation record adds context to your sports journey.",
    icon: Award,
  },
  {
    number: "04",
    title: "CONNECT",
    label: "COMMUNITY IN MOTION",
    copy: "Meet athletes, build a room, or turn a shared interest into a real sports moment.",
    icon: Users,
  },
  {
    number: "05",
    title: "EARN & RETURN",
    label: "SPORTIX POINTS",
    copy: "Use one governed reward layer for value, impact, and your next reason to move.",
    icon: Sparkles,
  },
];

const entrySports = [
  { label: "WALK", descriptor: "COMMUNITY MOMENTUM", icon: Footprints },
  { label: "RUN", descriptor: "RHYTHM & EVENTS", icon: Route },
  { label: "RIDE", descriptor: "CLUBS & ROUTES", icon: Bike },
  { label: "TRAIN", descriptor: "GYM & STRENGTH", icon: Dumbbell },
];

const partnerSignals = [
  {
    title: "A REAL PRIZE",
    copy: "Products, coupons, subscriptions, training, or services provided by an approved store.",
  },
  {
    title: "THREE PER REGION",
    copy: "Weekly Legends recognises three athletes under published SPORTIX criteria—not a paid placement.",
  },
  {
    title: "LOYALTY WITH RECEIPTS",
    copy: "The store funds the prize; SPORTIX governs the selection, record, and community experience.",
  },
];

const marketplacePaths = [
  {
    number: "01",
    title: "PRODUCTS",
    label: "EQUIP THE MOVE",
    copy: "Discover sports products and services when they are relevant to the way you play.",
    icon: ShoppingBag,
  },
  {
    number: "02",
    title: "COUPONS & SUBSCRIPTIONS",
    label: "USE WHAT YOU EARN",
    copy: "Access clear offers, subscriptions, and sports value without fragmenting your identity.",
    icon: Store,
  },
  {
    number: "03",
    title: "SPORTIX IMPACT",
    label: "MOVE VALUE FORWARD",
    copy: "Volunteer, donate, or direct chosen SPORTIX Points to verified charitable initiatives.",
    icon: HeartHandshake,
  },
];

const maturitySteps = [
  {
    number: "01",
    title: "GOVERN PARTICIPATION",
    copy: "QR establishes a clear, auditable first record of activity.",
    icon: ShieldCheck,
  },
  {
    number: "02",
    title: "GROW THE ID",
    copy: "Records, rooms, community, and SPORTIX Points create a connected sports history.",
    icon: Award,
  },
  {
    number: "03",
    title: "RECOGNISE GROWTH",
    copy: "Sport-specific signals can become a Legend, a development target, or a clearer next step.",
    icon: Crown,
  },
  {
    number: "04",
    title: "ADVISE, LEARN, ADAPT",
    copy: "Opt-in Computer Vision and AI later help interpret sport-specific progress—always with human review.",
    icon: Camera,
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

type ContactDraft = {
  fullName: string;
  contactEmail: string;
  mobileNumber: string;
  companyName: string;
  jobTitle: string;
  subject: string;
  message: string;
};

const emptyContactDraft: ContactDraft = { fullName: "", contactEmail: "", mobileNumber: "", companyName: "", jobTitle: "", subject: "", message: "" };
const neonRedErrorStyle = { color: "#ff5c68" } as const;

export function validateContactDraft(draft: ContactDraft, requiredError: string, messageError: string, emailError: string, mobileError: string) {
  const nextErrors: Partial<Record<keyof ContactDraft, string>> = {};
  (Object.keys(draft) as Array<keyof ContactDraft>).forEach((field) => {
    if (!draft[field].trim()) nextErrors[field] = requiredError;
  });
  if (draft.message.trim() && draft.message.trim().length < 10) nextErrors.message = messageError;
  if (draft.contactEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.contactEmail.trim())) nextErrors.contactEmail = emailError;
  if (draft.mobileNumber.trim() && !/^\+?[0-9][0-9\s().-]{5,30}$/.test(draft.mobileNumber.trim())) nextErrors.mobileNumber = mobileError;
  return nextErrors;
}

/** Premium public contact capture: validated client-side and persisted through the backend-ready tRPC mutation. */
export function ContactForm({ isArabic = false }: { isArabic?: boolean }) {
  const [draft, setDraft] = useState<ContactDraft>(emptyContactDraft);
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof ContactDraft, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof ContactDraft, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState("");
  const submission = trpc.contact.submit.useMutation();

  const copy = isArabic ? {
    eyebrow: "تواصل مع SPORTIX",
    title: <>ابنِ الحوار<br /><em>الرياضي القادم.</em></>,
    intro: "أخبرنا كيف يمكن لـ SPORTIX دعم فكرتك أو مؤسستك أو مسارك الرياضي القادم.",
    fullName: "الاسم الكامل",
    contactEmail: "البريد الإلكتروني",
    mobileNumber: "رقم الجوال",
    companyName: "اسم الشركة",
    jobTitle: "المسمى الوظيفي",
    subject: "الموضوع",
    message: "الرسالة",
    placeholder: "أخبرنا بالمزيد عن فكرتك أو شراكتك أو احتياجك...",
    submit: "أرسل إلى SPORTIX",
    sending: "جارٍ الإرسال...",
    received: "شكراً لك. وصلت رسالتك إلى SPORTIX.",
    receivedNote: "سنراجع التفاصيل ونتواصل معك عبر القناة المناسبة.",
    reset: "إرسال رسالة أخرى",
    required: "هذا الحقل مطلوب.",
    emailError: "يرجى إدخال بريد إلكتروني صحيح.",
    mobileError: "يرجى إدخال رقم جوال صحيح.",
    messageError: "يرجى كتابة رسالة من 10 أحرف على الأقل.",
    serverError: "تعذّر الإرسال حالياً. يرجى المحاولة مرة أخرى.",
  } : {
    eyebrow: "CONTACT SPORTIX",
    title: <>BUILD THE NEXT<br /><em>SPORTING ID.</em></>,
    intro: "Tell us how SPORTIX can support your organisation, partnership, or next sports opportunity.",
    fullName: "Full Name",
    contactEmail: "Email Address",
    mobileNumber: "Mobile Number",
    companyName: "Company Name",
    jobTitle: "Job Title",
    subject: "Subject",
    message: "Message",
    placeholder: "Tell us about your idea, partnership, or opportunity...",
    submit: "SEND TO SPORTIX",
    sending: "SENDING...",
    received: "Thank you. Your message has been received by SPORTIX.",
    receivedNote: "Our team will review the details and follow up through the appropriate channel.",
    reset: "SEND ANOTHER MESSAGE",
    required: "This field is required.",
    emailError: "Please enter a valid email address.",
    mobileError: "Please enter a valid mobile number.",
    messageError: "Please enter a message of at least 10 characters.",
    serverError: "Your message could not be sent right now. Please try again.",
  };

  const validateField = (field: keyof ContactDraft, value: string) => {
    if (!value.trim()) return copy.required;
    if (field === "message" && value.trim().length < 10) return copy.messageError;
    if (field === "contactEmail" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return copy.emailError;
    if (field === "mobileNumber" && !/^\+?[0-9][0-9\s().-]{5,30}$/.test(value.trim())) return copy.mobileError;
    return undefined;
  };

  const updateField = (field: keyof ContactDraft, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
    if (serverError) setServerError("");
    if (touched[field] || errors[field]) setErrors((current) => ({ ...current, [field]: validateField(field, value) }));
  };

  const touchField = (field: keyof ContactDraft) => {
    setTouched((current) => ({ ...current, [field]: true }));
    setErrors((current) => ({ ...current, [field]: validateField(field, draft[field]) }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateContactDraft(draft, copy.required, copy.messageError, copy.emailError, copy.mobileError);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setServerError("");
    submission.mutate({ ...draft, language: isArabic ? "ar" : "en", website }, {
      onSuccess: (result) => {
        if (!result.success || !result.emailId) {
          setServerError(copy.serverError);
          return;
        }
        setSubmitted(true);
        setDraft(emptyContactDraft);
        setWebsite("");
        setErrors({});
        setTouched({});
      },
      onError: () => setServerError(copy.serverError),
    });
  };

  if (submitted) {
    return (
      <section id="contact" className="contact-section contact-section-form" aria-live="polite">
        <div className="contact-confirmation section-shell">
          <div className="contact-confirmation-signal"><Check size={28} /></div>
          <p className="eyebrow">SPORTIX / MESSAGE RECEIVED</p>
          <h2>{copy.received}</h2>
          <p>{copy.receivedNote}</p>
          <button className="contact-reset" type="button" onClick={() => { setSubmitted(false); setServerError(""); }}>{copy.reset} <ArrowUpRight size={17} /></button>
        </div>
      </section>
    );
  }

  const fieldProps = (field: keyof ContactDraft) => ({
    value: draft[field],
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => updateField(field, event.target.value),
    onBlur: () => touchField(field),
    "aria-invalid": Boolean(errors[field]),
    "aria-describedby": errors[field] ? `contact-${field}-error` : undefined,
  });

  return (
    <section id="contact" className="contact-section contact-section-form">
      <div className="contact-form-shell section-shell">
        <div className="contact-form-intro">
          <SportixBrandMark className="logo-kinetic" alt="SPORTIX" />
          <p className="eyebrow">{copy.eyebrow}</p>
          <h2>{copy.title}</h2>
          <p>{copy.intro}</p>
          <div className="contact-form-rail" aria-hidden="true"><i /><span>SPORTIX / PARTNERSHIPS / OPPORTUNITY</span></div>
        </div>
        <form className="sportix-contact-form" noValidate onSubmit={handleSubmit}>
          <div className="contact-form-grid">
            <label className={errors.fullName ? "field-error" : ""}><span>{copy.fullName}</span><input {...fieldProps("fullName")} autoComplete="name" />{errors.fullName && <small id="contact-fullName-error" role="alert" style={neonRedErrorStyle}>{errors.fullName}</small>}</label>
            <label className={errors.contactEmail ? "field-error" : ""}><span>{copy.contactEmail}</span><input {...fieldProps("contactEmail")} type="email" inputMode="email" autoComplete="email" />{errors.contactEmail && <small id="contact-contactEmail-error" role="alert" style={neonRedErrorStyle}>{errors.contactEmail}</small>}</label>
            <label className={errors.mobileNumber ? "field-error" : ""}><span>{copy.mobileNumber}</span><input {...fieldProps("mobileNumber")} type="tel" inputMode="tel" autoComplete="tel" />{errors.mobileNumber && <small id="contact-mobileNumber-error" role="alert" style={neonRedErrorStyle}>{errors.mobileNumber}</small>}</label>
            <label className={errors.companyName ? "field-error" : ""}><span>{copy.companyName}</span><input {...fieldProps("companyName")} autoComplete="organization" />{errors.companyName && <small id="contact-companyName-error" role="alert" style={neonRedErrorStyle}>{errors.companyName}</small>}</label>
            <label className={errors.jobTitle ? "field-error" : ""}><span>{copy.jobTitle}</span><input {...fieldProps("jobTitle")} autoComplete="organization-title" />{errors.jobTitle && <small id="contact-jobTitle-error" role="alert" style={neonRedErrorStyle}>{errors.jobTitle}</small>}</label>
            <label className={errors.subject ? "field-error" : ""}><span>{copy.subject}</span><input {...fieldProps("subject")} />{errors.subject && <small id="contact-subject-error" role="alert" style={neonRedErrorStyle}>{errors.subject}</small>}</label>
          </div>
          <label className={`contact-message-field ${errors.message ? "field-error" : ""}`}><span>{copy.message}</span><textarea {...fieldProps("message")} placeholder={copy.placeholder} />{errors.message && <small id="contact-message-error" role="alert" style={neonRedErrorStyle}>{errors.message}</small>}</label>
          <label aria-hidden="true" style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }}>
            <span>Website</span>
            <input tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} />
          </label>
          {(submission.error || serverError) && <p className="contact-server-error" role="alert" style={neonRedErrorStyle}>{serverError || copy.serverError}</p>}
          <button className="contact-submit" type="submit" disabled={submission.isPending}>{submission.isPending ? copy.sending : copy.submit} <ArrowUpRight size={18} /></button>
        </form>
      </div>
    </section>
  );
}

/** Kinetic Intelligence, Arabic edition: right-to-left editorial SPORTIX experience with controlled lime signals and black cinematic space. */
function ArabicHome({ onSwitch, onLogout, isProjectAdmin, hasIndividualAccess }: { onSwitch: () => void; onLogout: () => void; isProjectAdmin: boolean; hasIndividualAccess: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="sportix-site sportix-ar" dir="rtl" lang="ar">
      <div className="site-grain" aria-hidden="true" />
      <header className="permanent-header">
        <a className="site-logo logo-dynamic" href="#top" onClick={closeMenu} aria-label="الرئيسية">
          <SportixBrandMark alt="SPORTIX" />
        </a>
        <div className="ar-header-actions">
          {isProjectAdmin ? <a className="language-switch partner-profile-link" href="/admin/memberships">الإدارة</a> : hasIndividualAccess ? <span className="language-switch partner-profile-link">وصول معتمد</span> : null}
          <button className="language-switch" type="button" onClick={onSwitch} aria-label="Switch to English">EN</button>
          <button className="language-switch" type="button" onClick={onLogout} aria-label="تسجيل الخروج">خروج</button>
          <button className="mobile-menu" onClick={() => setMenuOpen((open) => !open)} aria-label="فتح القائمة" aria-expanded={menuOpen}>
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
        <nav className={`permanent-nav ${menuOpen ? "open" : ""}`} aria-label="التنقل الرئيسي">
          {headerNavigationItems.arabic.map(item => <a key={item.href} href={item.href} onClick={closeMenu}>{item.label}</a>)}
          <a className="nav-cta" href="#contact" onClick={closeMenu}>ابدأ الحوار <ArrowUpLeft size={14} /></a>
        </nav>
      </header>

      <main id="top">
        <section className="hero-permanent ar-hero">
          <div className="hero-image-wrap" aria-hidden="true"><img src={heroImage} alt="" /><div className="hero-shade" /><div className="hero-trace"><span /></div></div>
          <div className="hero-coordinates top-left">SPORTIX / المملكة العربية السعودية / متعدد الرياضات</div>
          <div className="hero-coordinates top-right"><span className="live-dot" /> منظومة رياضية ذكية / قيد الحركة</div>
          <motion.div className="hero-copy" initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.82, ease: [0.23, 1, 0.32, 1] }}>
            <p className="eyebrow">المنصة الاجتماعية للرياضة</p>
            <h1>هوية واحدة.<br /><em>كل حركة.</em></h1>
            <p className="hero-lede">تحوّل SPORTIX المشاركة الرياضية الحقيقية إلى هوية رياضية واحدة، ثم تبني حول كل خطوة مجتمعاً وقيمةً وفرصةً ومساراً أوضح للتطور.</p>
            <div className="hero-actions">
              <a className="primary-action" href="#journey">اكتشف المسار <ArrowDownLeft size={17} /></a>
              <a className="secondary-action" href="#football">مسار كرة القدم <ArrowDownLeft size={17} /></a>
            </div>
          </motion.div>
          <div className="hero-bottomline"><span>تحرك ← شارك ← ابنِ هويتك ← تواصل ← تقدّم</span><span>هوية واحدة. لكل رياضة.</span></div>
        </section>

        <section className="thesis-strip ar-thesis" aria-label="رؤية سبورتكس"><p>رياضتك فصل من قصتك. <b>وهويتك الرياضية هي المسار.</b></p><span>01 / مبدأ SPORTIX</span></section>

        <section id="film" className="sportix-film-section" aria-label="فيلم SPORTIX">
          <div className="section-shell sportix-film-layout">
            <div className="sportix-film-intro"><p className="eyebrow">SPORTIX / الفيلم</p><h2>حركة واحدة.<br /><em>فرص أكبر.</em></h2><p>فيلم SPORTIX عن المشاركة والتطور والتوجيه الإنساني والمسار المتصل الذي يمنح كل خطوة معنى وفرصة.</p></div>
            <div className="sportix-film-rail" aria-hidden="true"><span>01:40</span><i /><span>شاهد الفيلم كاملاً</span></div>
          </div>
          <div className="sportix-film-frame">
            <video className="sportix-film-player" controls preload="metadata" playsInline poster={heroImage}><source src={loopFilmUrl} type="video/mp4" />المتصفح لا يدعم تشغيل الفيديو.</video>
            <div className="sportix-film-caption" aria-hidden="true"><span>SPORTIX / متعدد الرياضات / بإشراف إنساني</span><b>منظومة واحدة. رياضات بلا حدود.</b></div>
          </div>
        </section>

        <section id="journey" className="ar-journey-section section-shell">
          <div className="ar-section-heading"><p className="eyebrow">مسار SPORTIX</p><h2>تحرك.<br /><em>وابنِ قصتك.</em></h2><p>تبدأ SPORTIX من لحظة رياضية حقيقية، وتربطها بهوية تقدمك ومجتمعك وفرصك التالية.</p></div>
          <div className="ar-journey-grid">
            {[['01','تحرك','مارس رياضتك بطريقتك.'],['02','سجّل المشاركة','حوّل اللحظة المؤهلة إلى سجل واضح.'],['03','ابنِ SPORT ID','تتراكم المشاركة والتقدم في هوية رياضية واحدة.'],['04','تواصل','ابحث عن الناس والفرق والفعاليات التي تدفعك للأمام.'],['05','تقدّم','استفد من القيمة والفرص وفق مسارك الرياضي.']].map(([n,title,copy]) => <article key={n}><span>{n}</span><h3>{title}</h3><p>{copy}</p></article>)}
          </div>
          <p className="ar-rule"><ShieldCheck size={18} /> قاعدة SPORTIX: ترتبط القيمة بمشاركة حقيقية وسياق واضح، وليس بمجرد التفاعل الرقمي.</p>
        </section>

        <section className="sport-id-section ar-sport-id">
          <div className="section-shell sport-id-layout">
            <div className="sport-id-copy"><p className="eyebrow">SPORT ID / هوية تنمو معك</p><h2>كل مشاركة<br />تبني <em>سياقاً أوضح.</em></h2><p>SPORT ID ليست بطاقة ثابتة. إنها سجل رياضي متطور يربط المشاركة والتقدم والإنجاز والسياق عبر مختلف الرياضات.</p><div className="sport-id-rules"><div><Check size={17} /><span>هوية واحدة للرياضي عبر الرياضات والمجتمعات.</span></div><div><Check size={17} /><span>طبقة قيمة موحّدة مرتبطة بالمشاركة المؤهلة.</span></div><div><Check size={17} /><span>مسار واضح من الحضور إلى التطور والفرصة.</span></div></div></div>
            <div className="sport-id-card"><div className="id-card-top"><span>SPORT ID / سجل حي</span><span className="id-status"><i /> نشط</span></div><div className="id-name">سجل<br /><em>الرياضي</em></div><div className="id-scanline" /><div className="id-entry"><div className="id-entry-icon"><QrCode size={22} /></div><div><span>مشاركة مؤهلة</span><strong>جلسة تدريب رياضي</strong><small>سجل واضح / شريك معتمد</small></div><Check size={18} /></div><div className="id-points"><span>نقاط SPORTIX</span><strong>+20</strong><em>مشاركة مؤهلة</em></div><p className="id-note">تبدأ الهوية من المشاركة. وتأتي التفاصيل التحليلية فقط عندما يكون سياق الرياضة والحوكمة جاهزين.</p></div>
          </div>
        </section>

        <section id="football" className="football-section ar-football">
          <div className="section-shell football-header"><div><p className="eyebrow">كرة القدم / المسار الاستراتيجي</p><h2>لاعب واحد.<br /><em>مسار متكامل.</em></h2></div><p>في كرة القدم، تتعمق SPORTIX في الهوية الرياضية من المشاركة الأولى إلى الأكاديميات والأندية والفرص التي يقودها القرار الإنساني.</p></div>
          <div className="section-shell football-stage"><div className="football-field"><span className="field-label field-label-top">هوية كرة القدم / سجل التطور</span><span className="field-label field-label-bottom">أدلة ← سياق ← قرار إنساني</span><div className="field-half" /><div className="field-circle" /><div className="field-box field-box-left" /><div className="field-box field-box-right" /><div className="football-signal signal-one"><span>01</span><p>اللعب<br /><b>يُرى</b></p></div><div className="football-signal signal-two"><span>02</span><p>التطور<br /><b>يُفهم</b></p></div><div className="football-signal signal-three"><span>03</span><p>الفرص<br /><b>تقترب</b></p></div></div><div className="football-path"><article><span>01</span><div><p>هوية كرة القدم</p><h3>سجل واحد.<br />لكل مرحلة.</h3><small>سياق متصل للمشاركة والتطور وفق ضوابط واضحة.</small></div></article><article><span>02</span><div><p>الأكاديميات والأندية</p><h3>تطور<br />بإتجاه.</h3><small>أهداف وبرامج ومراجعات مفهومة للرياضي ومن يوجّهه.</small></div></article><article><span>03</span><div><p>المواهب والفرص</p><h3>التطور<br />يفتح الأبواب.</h3><small>فرص اختيارية ومفسّرة، وليست قراراً آلياً أو وعداً.</small></div></article></div></div>
          <div className="section-shell football-rule"><Crosshair size={18} /><p><strong>قاعدة كرة القدم:</strong> تنظّم SPORTIX الأدلة والسياق والفرص، لكن المدربين والأندية والاتحادات والرياضيين هم من يقررون.</p></div>
        </section>

        <section id="ecosystem" className="ar-ecosystem-section section-shell">
          <div className="ar-section-heading"><p className="eyebrow">منظومة واحدة / كل الرياضات</p><h2>كل رياضة.<br /><em>كل رياضي.</em></h2><p>تخدم SPORTIX الرياضيين بمختلف مستوياتهم، والمدربين، والأكاديميات، والأندية والمنشآت، والمدارس والجامعات، والاتحادات، والجهات الحكومية، والرعاة والعلامات التجارية.</p></div>
          <div className="ar-ecosystem-roles"><article><Users size={24} /><h3>الرياضيون والمجتمعات</h3><p>مشاركة وهوية ومسارات حقيقية للحركة والتطور.</p></article><article><Building2 size={24} /><h3>الأكاديميات والأندية</h3><p>سياق أوضح للتطوير والتواصل مع الرياضيين.</p></article><article><Landmark size={24} /><h3>المؤسسات والجهات</h3><p>منظومة قابلة للحوكمة تربط المشاركة بالأثر والفرصة.</p></article><article><ShoppingBag size={24} /><h3>الشركاء والعلامات</h3><p>قيمة وخدمات مرتبطة بلحظة رياضية حقيقية.</p></article></div>
        </section>

        <section className="ar-opportunity-section"><div className="section-shell ar-opportunity-layout"><div><p className="eyebrow">فجوة الموهبة غير المرئية</p><h2>كل موهبة<br /><em>تستحق أن تُرى.</em></h2><p>تربط SPORTIX المشاركة والتطور وإشارات الأداء والسياق الموثق لمساعدة الخبراء على رؤية الرياضيين الواعدين قبل أن تضيع فرصهم.</p></div><div className="ar-pathway"><span>المشاركة</span><i /><span>التطور</span><i /><span>SPORT ID</span><i /><span>إشارات واضحة</span><i /><strong>قرار إنساني</strong></div></div></section>

        <ContactForm isArabic />
      </main>
      <footer className="permanent-footer"><SportixBrandMark className="logo-kinetic" alt="SPORTIX" /><span>هوية رياضية واحدة. لكل رياضة.</span><span>© 2026 SPORTIX · المملكة العربية السعودية</span></footer>
    </div>
  );
}

export default function Home({ isProjectAdmin = false, hasIndividualAccess = false }: { isProjectAdmin?: boolean; hasIndividualAccess?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isArabic, setIsArabic] = useState(() => new URLSearchParams(window.location.search).get("lang") === "ar");
  const closeMenu = () => setMenuOpen(false);
  const partnerLogout = trpc.partnerAuth.logout.useMutation({ onSuccess: () => window.location.assign("/") });
  const partnerProfile = trpc.partnerAuth.session.useQuery();
  const { logout: logoutProjectAdmin, loading: isProjectLogoutPending } = useAuth();
  const logout = () => {
    if (isProjectAdmin || hasIndividualAccess) {
      void logoutProjectAdmin();
      return;
    }
    partnerLogout.mutate();
  };
  const isLogoutPending = isProjectAdmin || hasIndividualAccess ? isProjectLogoutPending : partnerLogout.isPending;

  useEffect(() => {
    document.documentElement.lang = isArabic ? "ar" : "en";
    document.documentElement.dir = isArabic ? "rtl" : "ltr";
    return () => { document.documentElement.lang = "en"; document.documentElement.dir = "ltr"; };
  }, [isArabic]);

  if (isArabic) return <ArabicHome onSwitch={() => setIsArabic(false)} onLogout={logout} isProjectAdmin={isProjectAdmin} hasIndividualAccess={hasIndividualAccess} />;

  return (
    <div className="sportix-site">
      <div className="site-grain" aria-hidden="true" />

      <header className="permanent-header">
        <a className="site-logo logo-dynamic" href="#top" onClick={closeMenu} aria-label="SPORTIX home">
          <SportixBrandMark alt="SPORTIX" />
        </a>

        <div className="header-actions">
          {!isProjectAdmin && partnerProfile.data && <div className="partner-account-chip" title="Verified SPORTIX Partners profile">
            {partnerProfile.data.profileImageUrl ? <img src={partnerProfile.data.profileImageUrl} alt="" /> : <span>{partnerProfile.data.fullName.slice(0, 1).toUpperCase()}</span>}
            <b>{partnerProfile.data.fullName}</b>
          </div>}
          {isProjectAdmin ? <a className="language-switch partner-profile-link" href="/admin/memberships">CONTROL ROOM</a> : hasIndividualAccess ? <span className="language-switch partner-profile-link">ACCESS ACTIVE</span> : <a className="language-switch partner-profile-link" href="/profile">PROFILE</a>}
          <button className="language-switch" type="button" onClick={() => setIsArabic(true)} aria-label="التبديل إلى العربية">العربية</button>
          {shouldShowHeaderLogout(isProjectAdmin, Boolean(partnerProfile.data), hasIndividualAccess) && <button className="language-switch" type="button" onClick={logout} disabled={isLogoutPending} aria-label="Log out">{isLogoutPending ? "…" : "LOG OUT"}</button>}
          <button
            className="mobile-menu"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>

        <nav className={`permanent-nav ${menuOpen ? "open" : ""}`} aria-label="Primary navigation">
          {headerNavigationItems.english.map(item => <a key={item.href} href={item.href} onClick={closeMenu}>{item.label}</a>)}
          <a className="nav-cta" href="#contact" onClick={closeMenu}>
            START A CONVERSATION <ArrowUpRight size={14} />
          </a>
        </nav>
      </header>

      <main id="top">
        <section className="hero-permanent">
          <div className="hero-image-wrap" aria-hidden="true">
            <img src={heroImage} alt="" />
            <div className="hero-shade" />
            <div className="hero-trace"><span /></div>
          </div>
          <div className="hero-coordinates top-left">SPORTIX / SAUDI ARABIA / MULTI-SPORT</div>
          <div className="hero-coordinates top-right"><span className="live-dot" /> FOOTBALL TRANSFORMATION / LIVE</div>

          <motion.div
            className="hero-copy"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.82, ease: [0.23, 1, 0.32, 1] }}
          >
            <p className="eyebrow">THE SOCIAL SPORTS PLATFORM</p>
            <h1>ONE ID.<br /><em>EVERY MOVE.</em></h1>
            <p className="hero-lede">
              SPORTIX turns real participation into one sports identity—then builds community, value, opportunity, and Football Transformation around every next move.
            </p>
            <div className="hero-actions">
              <a className="primary-action" href="#loop">SEE THE LOOP <ArrowDownRight size={17} /></a>
              <a className="secondary-action" href="#football">FOOTBALL TRANSFORMATION <ArrowDownRight size={17} /></a>
            </div>
          </motion.div>

          <div className="hero-bottomline">
            <span>MOVE → VERIFY → BUILD ID → CONNECT → RETURN</span>
            <span>ONE ID. FOOTBALL, ESPORTS & BEYOND.</span>
          </div>
        </section>

        <section className="thesis-strip" aria-label="SPORTIX thesis">
          <p>YOUR SPORT IS A CHAPTER. <b>YOUR ID IS THE STORY.</b></p>
          <span>01 / THE SPORTIX PRINCIPLE</span>
        </section>

        <section id="film" className="sportix-film-section" aria-label="SPORTIX Loop brand film">
          <div className="section-shell sportix-film-layout">
            <div className="sportix-film-intro">
              <p className="eyebrow">SPORTIX LOOP / BRAND FILM</p>
              <h2>ONE MOVE.<br /><em>MORE POSSIBLE.</em></h2>
              <p>
                A 100-second SPORTIX film about participation, development, human guidance, and the connected path that gives every next move more meaning.
              </p>
            </div>
            <div className="sportix-film-rail" aria-hidden="true"><span>01:40</span><i /><span>WATCH IN FULL</span></div>
          </div>
          <div className="sportix-film-frame">
            <video className="sportix-film-player" controls preload="metadata" playsInline poster={heroImage}>
              <source src={loopFilmUrl} type="video/mp4" />
              Your browser does not support HTML video.
            </video>
            <div className="sportix-film-caption" aria-hidden="true">
              <span>SPORTIX / MULTI-SPORT / HUMAN-GOVERNED</span>
              <b>ONE ECOSYSTEM. INFINITE SPORTS.</b>
            </div>
          </div>
        </section>

        <section id="loop" className="loop-section section-shell">
          <div className="section-intro loop-intro">
            <div>
              <p className="eyebrow">THE SPORTIX LOOP</p>
              <h2>MOVE. GET<br /><em>COUNTED. RETURN.</em></h2>
            </div>
            <p>
              SPORTIX begins with one clear behaviour: a real sports moment becomes a trusted record. From there, it can build your SPORT ID, connect you to people, and give you a reason to return.
            </p>
          </div>

          <div className="loop-architecture" aria-label="SPORTIX participation loop">
            {participationLoop.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.article
                  className="loop-row"
                  key={step.title}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  variants={fadeUp}
                  transition={{ duration: 0.5, delay: index * 0.06 }}
                >
                  <div className="loop-number">{step.number}</div>
                  <div className="loop-icon"><Icon size={22} strokeWidth={1.5} /></div>
                  <div className="loop-main"><p>{step.label}</p><h3>{step.title}</h3></div>
                  <p className="loop-copy">{step.copy}</p>
                  <ChevronRight className="loop-arrow" size={22} />
                </motion.article>
              );
            })}
          </div>

          <div className="platform-rule">
            <ShieldCheck size={19} />
            <p><strong>SPORTIX RULE:</strong> points are earned through qualifying participation and contributions, then used for value, impact, and your next move—not as a partner-owned currency.</p>
          </div>
        </section>

        <section id="sport-id" className="sport-id-section">
          <div className="section-shell sport-id-layout">
            <motion.div
              className="sport-id-copy"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.25 }}
              variants={fadeUp}
              transition={{ duration: 0.62 }}
            >
              <p className="eyebrow">SPORT ID / ONE RECORD, MANY SPORTS</p>
              <h2>THE RECORD<br />COMES <em>BEFORE THE READOUT.</em></h2>
              <p>
                SPORT ID starts by recognising a qualifying presence. A dynamic partner QR check-in creates a clear participation record before SPORTIX ever claims to measure performance.
              </p>
              <div className="sport-id-rules">
                <div><Check size={17} /><span>One athlete identity across communities and sports.</span></div>
                <div><Check size={17} /><span>One governed points ledger, not separate sport currencies.</span></div>
                <div><Check size={17} /><span>One progression path from participation to detailed achievement.</span></div>
              </div>
            </motion.div>

            <motion.div
              className="sport-id-card"
              initial={{ opacity: 0, y: 28, rotate: 1.4 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
            >
              <div className="id-card-top"><span>SPORT ID / LIVE RECORD</span><span className="id-status"><i /> ACTIVE</span></div>
              <div className="id-name">ATHLETE<br /><em>RECORD</em></div>
              <div className="id-scanline" />
              <div className="id-entry">
                <div className="id-entry-icon"><QrCode size={22} /></div>
                <div><span>PARTICIPATION CHECK-IN</span><strong>GYM STUDIO 07</strong><small>09:14 / PARTNER QR</small></div>
                <Check size={18} />
              </div>
              <div className="id-points"><span>SPORTIX POINTS</span><strong>+20</strong><em>QUALIFYING PARTICIPATION</em></div>
              <p className="id-note">A governed participation record. Performance detail arrives only when sport-specific analysis is ready.</p>
            </motion.div>
          </div>
        </section>

        <section id="football" className="football-section">
          <div className="section-shell football-header">
            <div><p className="eyebrow">FOOTBALL TRANSFORMATION / STRATEGIC VERTICAL</p><h2>ONE PLAYER.<br /><em>A COMPLETE PATH.</em></h2></div>
            <p>Football is where SPORTIX takes one identity deeper: from a player&apos;s first verified moment to an academy pathway, a club opportunity, and better-supported human decisions.</p>
          </div>
          <div className="football-brand-ceremony" aria-hidden="true"><SportixBrandMark className="logo-kinetic" alt="" /></div>
          <div className="section-shell football-stage">
            <div className="football-field" aria-label="Football Transformation pathway visual">
              <span className="field-label field-label-top">FOOTBALL ID / PROGRESSION RECORD</span>
              <span className="field-label field-label-bottom">EVIDENCE → EXPLANATION → HUMAN DECISION</span>
              <div className="field-half" /><div className="field-circle" /><div className="field-box field-box-left" /><div className="field-box field-box-right" />
              <div className="football-signal signal-one"><span>01</span><p>PLAY<br /><b>IS SEEN</b></p></div>
              <div className="football-signal signal-two"><span>02</span><p>GROWTH<br /><b>IS MAPPED</b></p></div>
              <div className="football-signal signal-three"><span>03</span><p>DOORS<br /><b>OPEN</b></p></div>
              <div className="football-id-panel"><span>FOOTBALL ID</span><strong>ATHLETE<br />PATHWAY</strong><div><i /><p>VERIFIED MOMENTS<br /><b>DEVELOPMENT CONTEXT</b></p></div><div><i /><p>OPT-IN OPPORTUNITIES<br /><b>HUMAN REVIEW</b></p></div></div>
            </div>
            <div className="football-path">
              <article><span>01</span><div><p>FOOTBALL ID</p><h3>ONE RECORD.<br />EVERY PHASE.</h3><small>A shared player record for participation, context, and approved progress.</small></div></article>
              <article><span>02</span><div><p>ACADEMY & CLUB PATHWAY</p><h3>DEVELOPMENT<br />WITH DIRECTION.</h3><small>Goals, programmes, and review points that are clear to the athlete and the people guiding them.</small></div></article>
              <article><span>03</span><div><p>SCOUTS & OPPORTUNITIES</p><h3>GROWTH<br />OPENS DOORS.</h3><small>Explained, opt-in opportunities—not automatic selection or promises.</small></div></article>
              <article><span>04</span><div><p>FOOTBALL INTELLIGENCE</p><h3>FIRST PROVE.<br />THEN ADVISE.</h3><small>Sport-specific signals and decision support arrive only with consent, evidence, and human review.</small></div></article>
            </div>
          </div>
          <div className="section-shell football-rule"><Crosshair size={18} /><p><strong>FOOTBALL TRANSFORMATION RULE:</strong> SPORTIX organises evidence and opportunity; coaches, clubs, federations, and players remain the people who decide.</p></div>
        </section>

        <section className="sports-section section-shell">
          <div className="sports-heading">
            <p className="eyebrow">MULTI-SPORT BY DESIGN</p>
            <h2>START WITH A<br /><em>MOVEMENT. NOT A SILO.</em></h2>
          </div>
          <div className="sports-grid">
            {entrySports.map((sport, index) => {
              const Icon = sport.icon;
              return (
                <article className="sport-marker" key={sport.label}>
                  <span>0{index + 1}</span>
                  <Icon size={30} strokeWidth={1.4} />
                  <strong>{sport.label}</strong>
                  <p>{sport.descriptor}</p>
                </article>
              );
            })}
          </div>
          <p className="sports-rule">WALK. RUN. RIDE. TRAIN. <b>ONE SPORT ID. ONE SPORTIX POINTS LAYER.</b></p>
        </section>

        <section id="community" className="community-section">
          <div className="section-shell community-layout">
            <div className="community-copy">
              <p className="eyebrow">COMMUNITY / FROM DISCOVERY TO DOING</p>
              <h2>DON&apos;T JUST<br /><em>FOLLOW SPORT.</em></h2>
              <p>
                Find your people, send a message, and create the next real moment. SPORTIX turns shared interest into a room, a team, an event, or a community that keeps moving.
              </p>
              <div className="community-signals">
                <div><MessageCircle size={18} /><span>DISCOVER + DM</span></div>
                <div><Users size={18} /><span>CREATE A ROOM</span></div>
                <div><Activity size={18} /><span>MOVE TOGETHER</span></div>
              </div>
              <p className="community-rail">PUBLIC DISCOVERY. PRIVATE CONNECTION. REAL-WORLD PLAY.</p>
            </div>
            <div className="room-grid" aria-label="Match Room choices">
              <article className="room-card room-card-play"><span>01 / PLAY ROOM</span><h3>FIND<br />THE <em>PLAYERS.</em></h3><p>Fill a match or practice with the right people, place, and pace.</p></article>
              <article className="room-card room-card-community"><span>02 / COMMUNITY ROOM</span><h3>BUILD<br />THE <em>GROUP.</em></h3><p>Turn one shared sport, place, or goal into a lasting community.</p></article>
              <article className="room-card room-card-tournament"><span>03 / TOURNAMENT ROOM</span><h3>OWN<br />THE <em>BRACKET.</em></h3><p>Organise registrations, rounds, and results in one clear competitive flow.</p></article>
              <article className="room-card room-card-event"><span>04 / EVENT ROOM</span><h3>MAKE<br />IT <em>REAL.</em></h3><p>Bring a Walk Day, open day, camp, or local sports moment to life.</p></article>
            </div>
          </div>
          <div className="community-rule section-shell"><span>COMMUNITY RULE</span><p>From public discovery to private connection is always optional. A room becomes a record only when a real, eligible sports moment happens.</p></div>
        </section>

        <section id="esports" className="esports-section">
          <div className="section-shell esports-layout">
            <div className="esports-copy">
              <p className="eyebrow">ESPORTS GATEWAY / A CONNECTED ENTRY ENVIRONMENT</p>
              <h2>TEAM UP.<br /><em>LEVEL UP.</em></h2>
              <p>Esports is a natural next environment for SPORTIX: player identity, teams, tournament rooms, community recognition, and sponsorship can work together without treating every game as the same sport.</p>
              <p className="esports-note">Each game earns its own rules, records, Legends, and measurement model. SPORTIX never assumes game data or skill signals without the right context and permission.</p>
            </div>
            <div className="esports-grid" aria-label="Esports Gateway capabilities">
              <article><span>01</span><Gamepad2 size={29} strokeWidth={1.35} /><p>ESPORTS ID</p><h3>ONE PLAYER.<br />MANY ARENAS.</h3></article>
              <article><span>02</span><Trophy size={29} strokeWidth={1.35} /><p>TOURNAMENT ROOMS</p><h3>BRACKET.<br />BELONGING.</h3></article>
              <article><span>03</span><Crown size={29} strokeWidth={1.35} /><p>GAME-SPECIFIC LEGENDS</p><h3>SKILL WITH<br />A STORY.</h3></article>
              <article className="esports-grid-rule"><span>SPORTIX RULE</span><p>Build the community first. Add game-specific intelligence only when evidence, rights, and governance are ready.</p></article>
            </div>
          </div>
        </section>

        <section id="marketplace" className="marketplace-section section-shell">
          <div className="marketplace-heading">
            <div><p className="eyebrow">MARKETPLACE / VALUE WITH A PURPOSE</p><h2>VALUE THAT<br /><em>KEEPS MOVING.</em></h2></div>
            <p>SPORTIX makes rewards useful. Discover what supports your sports life, then choose whether your next action creates value for you, your community, or a verified cause.</p>
          </div>
          <div className="marketplace-grid">
            {marketplacePaths.map((path, index) => {
              const Icon = path.icon;
              return (
                <motion.article
                  className="marketplace-card"
                  key={path.title}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  variants={fadeUp}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                >
                  <div className="marketplace-card-top"><span>{path.number}</span><Icon size={25} strokeWidth={1.4} /></div>
                  <p>{path.label}</p><h3>{path.title}</h3><div className="marketplace-card-line" /><span className="marketplace-copy">{path.copy}</span>
                </motion.article>
              );
            })}
          </div>
          <div className="impact-line"><HeartHandshake size={18} /><p><strong>SPORTIX IMPACT</strong> is the sustainability arm for verified charities: volunteer, donate, or direct chosen SPORTIX Points towards a meaningful initiative.</p></div>
        </section>

        <section id="partners" className="partner-qr-section">
          <div className="section-shell partner-qr-layout">
            <div className="partner-qr-copy">
              <p className="eyebrow">PARTNER LOOP / SELL WHERE SPORT HAPPENS</p>
              <h2>BE THERE<br />WHEN <em>SPORT HAPPENS.</em></h2>
              <p>
                From a product and a subscription to a court and a training session, partners sell inside the moment an athlete needs them—Marketplace, GO SPORTIX, or Match Room.
              </p>
              <a className="text-action" href="#contact">BECOME A PARTNER <ArrowUpRight size={16} /></a>
            </div>

            <div className="qr-journey" aria-label="Partner QR journey">
              <div className="qr-visual"><QrCode size={94} strokeWidth={1.1} /><span className="qr-corner corner-a" /><span className="qr-corner corner-b" /><span className="qr-corner corner-c" /><span className="qr-corner corner-d" /></div>
              <div className="qr-caption"><span>SPORTIX PARTNER CHECK-IN</span><strong>SHOW. SELL. SERVE.</strong></div>
              <div className="qr-flow">
                <div><span>01</span><p>ATHLETE<br /><b>SELECTS</b></p></div>
                <i />
                <div><span>02</span><p>PARTNER<br /><b>DELIVERS</b></p></div>
                <i />
                <div><span>03</span><p>REVIEW<br /><b>GOVERNS</b></p></div>
              </div>
              <p className="qr-detail"><Building2 size={16} /> A verified experience earns an honest review, SPORTIX Points for the athlete, and a Partner Performance Score for the service.</p>
            </div>
          </div>
        </section>

        <section className="campaign-section section-shell">
          <div className="campaign-header">
            <p className="eyebrow">WEEKLY LEGENDS / PARTNER-POWERED LOYALTY</p>
            <h2>REWARD<br /><em>THE REGION.</em></h2>
          </div>
          <div className="campaign-layout">
            <div className="campaign-proposition">
              <span>WEEKLY LEGENDS / EVERY REGION</span>
              <h3>Three athletes. One region. A real prize, presented to the community by the store that made it possible.</h3>
              <p>SPORTIX governs eligibility and the winner record. The store funds a product, coupon, subscription, training, or service that gives the moment real value.</p>
            </div>
            <div className="signal-board">
              {partnerSignals.map((signal, index) => (
                <div className="signal-line" key={signal.title}>
                  <span>0{index + 1}</span>
                  <div><strong>{signal.title}</strong><p>{signal.copy}</p></div>
                </div>
              ))}
              <div className="signal-footer"><Timer size={16} /><span>CAMPAIGNS ARE LIMITED, DISCLOSED, AND MEASURED.</span></div>
            </div>
          </div>
          <div className="weekly-legends-card"><Trophy size={23} /><div><span>WEEKLY LEGENDS</span><strong>WINNER 01 / PRODUCT REWARD</strong></div><p>PRESENTED BY <b>STORE NAME</b> DIRECTLY</p></div>
        </section>

        <section className="opportunity-section">
          <div className="section-shell opportunity-layout">
            <div className="opportunity-visual"><Landmark size={38} strokeWidth={1.15} /><div className="opportunity-orbit orbit-one" /><div className="opportunity-orbit orbit-two" /><span>SPORT ID<br />TO OPPORTUNITY</span></div>
            <div className="opportunity-copy">
              <p className="eyebrow">FOOTBALL OPPORTUNITIES / CLUBS, SCOUTS & FEDERATIONS</p>
              <h2>LET FOOTBALL<br /><em>GROWTH OPEN DOORS.</em></h2>
              <p>When a football path shows real, sustained progress, SPORTIX can explain the signal and suggest the right next opportunity—club, academy, scout, federation, sponsor, or development programme.</p>
              <div className="opportunity-steps"><div><span>01</span><p>GROWTH<br /><b>IS SEEN</b></p></div><i /><div><span>02</span><p>ATHLETE<br /><b>CHOOSES</b></p></div><i /><div><span>03</span><p>HUMANS<br /><b>DECIDE</b></p></div></div>
              <p className="opportunity-note">A football opportunity recommendation is explained and opt-in. It is never an automatic selection, contract, or verdict on talent.</p>
              <a className="opportunity-demo-link" href="/opportunity">VIEW THE OPPORTUNITY FLOW <ArrowRight size={15} /></a>
            </div>
          </div>
        </section>

        <section className="maturity-section">
          <div className="section-shell">
            <div className="maturity-title"><p className="eyebrow">THE INTELLIGENCE SEQUENCE</p><h2>FIRST PROVE.<br /><em>THEN ADVISE.</em></h2></div>
            <div className="maturity-grid">
              {maturitySteps.map((step) => {
                const Icon = step.icon;
                return (
                  <article key={step.title}>
                    <span>{step.number}</span>
                    <Icon size={24} strokeWidth={1.45} />
                    <h3>{step.title}</h3>
                    <p>{step.copy}</p>
                  </article>
                );
              })}
            </div>
            <p className="maturity-statement">QR records a qualifying moment. <b>Computer Vision and AI later add sport-specific detail, Legends, and decision support—only with consent, tested accuracy, and human governance.</b></p>
          </div>
        </section>

        <ContactForm />
      </main>

      <footer className="permanent-footer">
        <SportixBrandMark className="logo-kinetic" alt="SPORTIX" />
        <span>ONE SPORT ID. EVERY SPORT.</span>
        <span>© 2026 SPORTIX · SAUDI ARABIA</span>
      </footer>
    </div>
  );
}
