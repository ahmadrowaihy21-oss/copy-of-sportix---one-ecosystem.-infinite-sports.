import { startLogin } from "@/const";
import { LockKeyhole } from "lucide-react";
import "../partner-auth.css";

function safeReturnPath(value: string | null) {
  return value?.startsWith("/admin/") ? value : "/admin/memberships";
}

export default function AdminApprovalLogin() {
  const search = new URLSearchParams(window.location.search);
  const returnTo = safeReturnPath(search.get("returnTo"));
  return <main className="partner-gateway"><div className="partner-gateway-grid" aria-hidden="true" /><section className="partner-gateway-shell"><section className="partner-gateway-panel"><div className="partner-gateway-stage"><LockKeyhole size={28} className="partner-gateway-icon" /><p className="partner-gateway-kicker">SPORTIX / ADMINISTRATOR</p><h2>ADMIN<br /><em>LOGIN.</em></h2><p className="partner-gateway-copy">This NDA request is restricted to authenticated SPORTIX administrators. Sign in to resume the review and approval request.</p><button type="button" className="partner-primary" onClick={() => startLogin(returnTo)}>SIGN IN AS ADMIN <span>→</span></button></div></section></section></main>;
}
