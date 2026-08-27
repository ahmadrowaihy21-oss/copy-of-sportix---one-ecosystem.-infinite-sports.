import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Check,
  ChevronDown,
  CircleCheck,
  Eye,
  FileText,
  LockKeyhole,
  Send,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import "./opportunity-experience.css";

const logoUrl = "/manus-storage/sportix-ecosystem-approved-logo_e0eb06c5.png";

type View = "sender" | "athlete";

export default function Opportunity() {
  const [, navigate] = useLocation();
  const [view, setView] = useState<View>("sender");
  const [offerSent, setOfferSent] = useState(false);
  const [decision, setDecision] = useState<"idle" | "accepted" | "declined">("idle");
  const [scope, setScope] = useState({ highlights: true, development: true, contact: false });

  const submitOffer = () => {
    setOfferSent(true);
    toast.success("Opportunity sent for athlete review", {
      description: "No private SPORT ID data is shared until the athlete gives consent.",
    });
  };

  const respondToOffer = (response: "accepted" | "declined") => {
    setDecision(response);
    toast(response === "accepted" ? "Consent recorded" : "Opportunity declined", {
      description: response === "accepted" ? "Only the selected data scope is shared with the verified sender." : "No additional data has been shared.",
    });
  };

  return (
    <main className="opportunity-experience">
      <div className="opportunity-grain" aria-hidden="true" />
      <header className="opportunity-topbar">
        <button className="back-link" onClick={() => navigate("/")}><ArrowLeft size={16} /> BACK TO SPORTIX</button>
        <img className="opportunity-logo" src={logoUrl} alt="SPORTIX Ecosystem" />
        <span className="top-status"><i /> PROTECTED OPPORTUNITY FLOW</span>
      </header>

      <section className="opportunity-hero">
        <div>
          <p className="op-eyebrow">SPORTIX OPPORTUNITIES / FOOTBALL</p>
          <h1>RIGHT FIT.<br /><em>CLEAR YES.</em></h1>
          <p>SPORTIX turns a possible next step into a structured opportunity—where the sender explains the fit and the athlete remains in control of every share.</p>
        </div>
        <div className="opportunity-signal" aria-label="Opportunity flow">
          <span>01</span><i /> <span>02</span><i /> <span>03</span>
          <p>EXPLAINED OFFER → ATHLETE CONSENT → SELECTED SHARE</p>
        </div>
      </section>

      <section className="opportunity-shell">
        <div className="view-toggle" role="tablist" aria-label="Opportunity view">
          <button className={view === "sender" ? "active" : ""} onClick={() => setView("sender")} role="tab" aria-selected={view === "sender"}>CLUB / SCOUT VIEW</button>
          <button className={view === "athlete" ? "active" : ""} onClick={() => setView("athlete")} role="tab" aria-selected={view === "athlete"}>ATHLETE VIEW</button>
        </div>

        {view === "sender" ? (
          <div className="opportunity-grid sender-grid">
            <section className="offer-form-panel">
              <div className="panel-kicker"><span>VERIFIED SENDER</span><ShieldCheck size={16} /></div>
              <h2>MAKE THE<br /><em>OFFER CLEAR.</em></h2>
              <p className="panel-intro">A good opportunity states the purpose, the pathway, and the information it requests before the athlete ever sees a consent action.</p>

              <div className="sender-profile"><span className="sender-mark">NA</span><div><strong>NORTHLINE ACADEMY</strong><small>ACADEMY / FOOTBALL DEVELOPMENT</small></div><CircleCheck size={17} /></div>

              <label className="op-field"><span>OPPORTUNITY TYPE</span><button>DEVELOPMENT PROGRAMME <ChevronDown size={15} /></button></label>
              <label className="op-field"><span>FOR</span><button>FOOTBALL ID / ELIGIBLE ATHLETE <ChevronDown size={15} /></button></label>
              <label className="op-field"><span>WHY THIS ATHLETE</span><textarea defaultValue="Sustained verified development, positive progression context, and a pathway that matches our next intake." /></label>
              <label className="op-field"><span>WHAT HAPPENS NEXT</span><input defaultValue="Introduction call, programme review, and optional trial planning." /></label>

              <button className="send-offer" onClick={submitOffer} disabled={offerSent}>{offerSent ? <><Check size={17} /> SENT FOR REVIEW</> : <><Send size={17} /> SEND TO ATHLETE REVIEW</>}</button>
              <p className="form-note"><LockKeyhole size={15} /> Sending an offer does not unlock private SPORT ID records, contact details, or a commitment.</p>
            </section>

            <aside className="consent-gate">
              <p className="op-eyebrow">THE CONSENT GATE</p>
              <h3>THE ATHLETE<br />DECIDES <em>THE SHARE.</em></h3>
              <div className="consent-steps">
                <article><span>01</span><div><strong>OFFER ARRIVES</strong><p>The athlete sees the sender, purpose, requested scope, and next step.</p></div></article>
                <article><span>02</span><div><strong>ATHLETE REVIEWS</strong><p>They can accept, decline, or share only a selected scope.</p></div></article>
                <article><span>03</span><div><strong>ACCESS IS LIMITED</strong><p>The sender receives only what was approved, for this stated opportunity.</p></div></article>
              </div>
              <div className="consent-rule"><Eye size={17} /><p><b>VISIBILITY RULE</b> The sender can never infer a rejection from hidden data or bypass the athlete&apos;s decision.</p></div>
            </aside>
          </div>
        ) : (
          <div className="opportunity-grid athlete-grid">
            <section className="athlete-offer-panel">
              <div className="panel-kicker"><span>NEW OPPORTUNITY / FOOTBALL</span><Sparkles size={16} /></div>
              <h2>YOUR NEXT STEP.<br /><em>YOUR DECISION.</em></h2>
              <div className="athlete-offer-head"><span className="sender-mark">NA</span><div><span>FROM VERIFIED SENDER</span><strong>NORTHLINE ACADEMY</strong><small>DEVELOPMENT PROGRAMME</small></div><Award size={24} /></div>
              <div className="why-card"><span>WHY YOU WERE SURFACED</span><p>Your verified football pathway shows sustained progression and context relevant to this programme.</p><small>SPORTIX explains the signal. It does not decide your next step.</small></div>
              <div className="next-card"><FileText size={20} /><div><span>WHAT HAPPENS NEXT</span><p>Introduction call, programme review, and optional trial planning.</p></div></div>
            </section>

            <aside className="athlete-consent-panel">
              <p className="op-eyebrow">YOUR CONSENT</p>
              <h3>CHOOSE WHAT<br /><em>THEY CAN SEE.</em></h3>
              <p className="consent-copy">Nothing beyond your existing public highlights is shared until you choose it below. You can decline without affecting your SPORT ID or future opportunities.</p>
              <div className="scope-list">
                <ScopeRow label="Public highlights & verified achievements" detail="The visible football moments already selected for your profile." checked={scope.highlights} onToggle={() => setScope({ ...scope, highlights: !scope.highlights })} />
                <ScopeRow label="Development pathway context" detail="Approved progression milestones related to this opportunity." checked={scope.development} onToggle={() => setScope({ ...scope, development: !scope.development })} />
                <ScopeRow label="Direct contact details" detail="Enable a direct reply after you approve this opportunity." checked={scope.contact} onToggle={() => setScope({ ...scope, contact: !scope.contact })} />
              </div>
              {decision === "idle" ? <div className="consent-actions"><button className="decline-action" onClick={() => respondToOffer("declined")}><X size={16} /> DECLINE</button><button className="approve-action" onClick={() => respondToOffer("accepted")}><Check size={16} /> REVIEW & SHARE SELECTED</button></div> : <div className={`decision-state ${decision}`}><CircleCheck size={19} /><div><strong>{decision === "accepted" ? "CONSENT RECORDED" : "NO DATA SHARED"}</strong><p>{decision === "accepted" ? "The verified sender can now see only your chosen scope." : "You can continue using SPORTIX as normal."}</p></div></div>}
              <p className="form-note"><LockKeyhole size={15} /> This is an illustrative interface. A real opportunity requires verified parties, explicit terms, and the athlete&apos;s consent.</p>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}

function ScopeRow({ label, detail, checked, onToggle }: { label: string; detail: string; checked: boolean; onToggle: () => void }) {
  return <button className={`scope-row ${checked ? "selected" : ""}`} onClick={onToggle} aria-pressed={checked}><span className="scope-check">{checked && <Check size={14} />}</span><span><strong>{label}</strong><small>{detail}</small></span></button>;
}
