import { trpc } from "@/lib/trpc";
import { ArrowRight, FileText, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import "../membership-requests.css";

function approvalToken() {
  return new URLSearchParams(window.location.search).get("t")?.trim() ?? "";
}

export default function NdaReview() {
  const token = approvalToken();
  const hasValidToken = token.length >= 32;
  const review = trpc.ndaApproval.review.useQuery({ token }, { enabled: hasValidToken, retry: false });
  if (!hasValidToken || review.error) return <main className="membership-admin"><section className="membership-admin-restricted"><FileText size={30} /><p>NDA REVIEW</p><h2>THIS REVIEW LINK IS NOT AVAILABLE.</h2><span>{hasValidToken ? "This NDA review link is invalid or has expired." : "The NDA review link is missing or invalid."}</span></section></main>;
  if (review.isLoading || !review.data) return <main className="membership-admin"><p className="membership-admin-empty">Loading signed NDA…</p></main>;
  return <main className="membership-admin"><header className="membership-admin-header"><div><p>SPORTIX / SECURE REVIEW</p><h1>SIGNED <em>NDA.</em></h1><span>Admin-only document review for {review.data.fullName}.</span></div><ShieldCheck size={34} /></header><section className="membership-admin-table" aria-label="NDA applicant details"><div className="membership-admin-row membership-admin-head"><span>Applicant</span><span>Company</span><span>Job title</span><span>Verified email</span><span>Mobile</span><span>Status</span></div><div className="membership-admin-row"><span><strong>{review.data.fullName}</strong></span><span>{review.data.companyName || "—"}</span><span>{review.data.jobTitle || "—"}</span><span>{review.data.email}</span><span>{review.data.mobileNumber}</span><span><i className="membership-status active">{review.data.ndaStatus}</i></span></div></section><section className="membership-detail-copy" style={{ margin: "24px auto", maxWidth: 1120 }}><span>Uploaded signed NDA</span><iframe title={`Signed NDA for ${review.data.fullName}`} src={review.data.ndaUrl} style={{ width: "100%", height: "72vh", marginTop: 12, border: "1px solid #30352d", background: "#fff" }} /><Link className="partner-primary" href={`/admin/nda-approve?t=${encodeURIComponent(token)}`}>APPROVE NDA &amp; GRANT ACCESS <ArrowRight size={17} /></Link></section></main>;
}
