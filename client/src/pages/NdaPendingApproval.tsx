import { Clock3, LogOut, ShieldCheck } from "lucide-react";
import { trpc } from "@/lib/trpc";
import "../partner-auth.css";

export default function NdaPendingApproval() {
  const utils = trpc.useUtils();
  const logout = trpc.partnerAuth.logout.useMutation({ onSuccess: () => { void utils.partnerAuth.session.invalidate(); window.location.assign("/partner-access"); } });
  return <main className="partner-gateway"><div className="partner-gateway-grid" aria-hidden="true" /><section className="partner-gateway-shell"><section className="partner-gateway-panel"><div className="partner-gateway-stage"><Clock3 size={28} className="partner-gateway-icon" /><p className="partner-gateway-kicker">SPORTIX / ACCESS REVIEW</p><h2>REQUEST<br /><em>PENDING.</em></h2><p className="partner-gateway-copy">Your signed NDA has been submitted and your account is pending SPORTIX administrator approval. Protected content remains unavailable until access is granted.</p><p className="partner-gateway-signal"><ShieldCheck size={15} /> NDA STATUS / PENDING APPROVAL</p><button type="button" className="partner-secondary" disabled={logout.isPending} onClick={() => logout.mutate()}><LogOut size={16} /> {logout.isPending ? "SIGNING OUT…" : "SIGN OUT"}</button></div></section></section></main>;
}
