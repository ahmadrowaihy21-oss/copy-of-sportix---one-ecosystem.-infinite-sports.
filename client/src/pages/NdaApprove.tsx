import { trpc } from "@/lib/trpc";
import { CheckCircle2, CircleAlert, ShieldCheck } from "lucide-react";
import { useEffect, useRef } from "react";
import "../partner-auth.css";

function approvalToken() {
  return new URLSearchParams(window.location.search).get("t")?.trim() ?? "";
}

export default function NdaApprove() {
  const token = approvalToken();
  const hasValidToken = token.length >= 32;
  const started = useRef(false);
  const approval = trpc.ndaApproval.approve.useMutation();
  const retryEmail = trpc.ndaApproval.resendApprovalEmail.useMutation();
  useEffect(() => { if (hasValidToken && !started.current) { started.current = true; approval.mutate({ token }); } }, [approval, hasValidToken, token]);
  const title = approval.isSuccess ? <>ACCESS <em>GRANTED.</em></> : approval.isError || !hasValidToken ? <>APPROVAL <em>UNAVAILABLE.</em></> : <>APPROVING<br /><em>ACCESS.</em></>;
  const copy = approval.isSuccess ? approval.data.approvalEmailStatus === "sent" ? `${approval.data.fullName}'s NDA has been approved. Their account is approved, access has been granted, and an approval email has been sent to their verified company email.` : `${approval.data.fullName}'s NDA has been approved and access has been granted. The approval email was not delivered; retry it below.` : approval.isError ? approval.error.message : "The approval link is missing or invalid.";
  return <main className="partner-gateway"><div className="partner-gateway-grid" aria-hidden="true" /><section className="partner-gateway-shell"><section className="partner-gateway-panel"><div className="partner-gateway-stage">{approval.isSuccess ? <CheckCircle2 size={30} className="partner-gateway-icon" /> : approval.isError || !hasValidToken ? <CircleAlert size={30} className="partner-gateway-icon" /> : <ShieldCheck size={30} className="partner-gateway-icon" />}<p className="partner-gateway-kicker">SPORTIX / ADMIN APPROVAL</p><h2>{title}</h2><p className="partner-gateway-copy">{copy}</p>{approval.isError && hasValidToken && <button type="button" className="partner-primary" onClick={() => approval.mutate({ token })}>RETRY APPROVAL</button>}{approval.isSuccess && approval.data.approvalEmailStatus === "failed" && <button type="button" className="partner-primary" disabled={retryEmail.isPending} onClick={() => retryEmail.mutate({ token })}>{retryEmail.isPending ? "RETRYING EMAIL…" : retryEmail.isSuccess ? "EMAIL SENT" : "RETRY APPROVAL EMAIL"}</button>}{retryEmail.isError && <p className="partner-gateway-message" role="alert"><CircleAlert size={15} /> {retryEmail.error.message}</p>}</div></section></section></main>;
}
