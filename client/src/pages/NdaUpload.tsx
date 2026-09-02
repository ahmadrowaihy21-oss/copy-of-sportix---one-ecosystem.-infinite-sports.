import { trpc } from "@/lib/trpc";
import { ArrowRight, CircleAlert, FileUp, LogOut, ShieldCheck } from "lucide-react";
import { ChangeEvent, FormEvent, useState } from "react";
import "../partner-auth.css";

type NdaFile = { base64: string; fileName: string; size: number };

export default function NdaUpload() {
  const [nda, setNda] = useState<NdaFile | null>(null);
  const [message, setMessage] = useState("");
  const utils = trpc.useUtils();
  const upload = trpc.partnerAuth.uploadSignedNda.useMutation({ onSuccess: async () => { await utils.partnerAuth.session.invalidate(); window.location.assign("/partner-access/pending"); }, onError: error => setMessage(error.message || "The signed NDA could not be submitted.") });
  const logout = trpc.partnerAuth.logout.useMutation({ onSuccess: () => { void utils.partnerAuth.session.invalidate(); window.location.assign("/partner-access"); } });
  const selectFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf" || file.size > 10 * 1024 * 1024) { setNda(null); setMessage("Upload a signed PDF document no larger than 10 MB."); event.target.value = ""; return; }
    const reader = new FileReader();
    reader.onload = () => { const value = typeof reader.result === "string" ? reader.result.split(",")[1] : ""; if (!value) { setMessage("The signed NDA could not be read."); return; } setNda({ base64: value, fileName: file.name, size: file.size }); setMessage(""); };
    reader.readAsDataURL(file);
  };
  const submit = (event: FormEvent) => { event.preventDefault(); if (!nda) { setMessage("Upload your signed NDA PDF before continuing."); return; } setMessage(""); upload.mutate({ base64: nda.base64, fileName: nda.fileName }); };
  return <main className="partner-gateway"><div className="partner-gateway-grid" aria-hidden="true" /><section className="partner-gateway-shell"><section className="partner-gateway-panel"><form className="partner-gateway-stage" onSubmit={submit}><FileUp size={28} className="partner-gateway-icon" /><p className="partner-gateway-kicker">SPORTIX / ACCESS REQUIREMENT</p><h2>UPLOAD<br />SIGNED <em>NDA.</em></h2><p className="partner-gateway-copy">Your company email is verified. Upload your signed NDA PDF to submit your SPORTIX access request. No protected content is available until an administrator approves it.</p><label className="partner-profile-image"><span><FileUp size={17} /> Signed NDA <small>PDF ONLY · 10 MB MAX</small></span><input type="file" accept="application/pdf,.pdf" onChange={selectFile} required />{nda && <span className="partner-image-preview"><ShieldCheck size={18} />{nda.fileName} · {(nda.size / 1024 / 1024).toFixed(2)} MB</span>}</label><button className="partner-primary" disabled={upload.isPending}>{upload.isPending ? "SUBMITTING…" : <>SUBMIT NDA FOR APPROVAL <ArrowRight size={17} /></>}</button><button type="button" className="partner-secondary" disabled={logout.isPending} onClick={() => logout.mutate()}><LogOut size={16} /> SIGN OUT</button>{message && <p className="partner-gateway-message" role="alert"><CircleAlert size={15} /> {message}</p>}</form></section></section></main>;
}
