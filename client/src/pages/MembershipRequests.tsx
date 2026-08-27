import { trpc } from "@/lib/trpc";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { Check, CircleAlert, Eye, LogOut, ShieldAlert, UserRoundCheck, X } from "lucide-react";
import { useMemo, useState } from "react";
import "../membership-requests.css";
import "../admin-logout.css";

const statusLabels = {
  email_unverified: "Email unverified",
  nda_pending: "NDA pending",
  company_authority_pending: "Authority pending",
  company_nda_pending: "Company NDA pending",
  pending_approval: "Pending approval",
  pending_admin_approval: "Pending admin approval",
  approved: "Approved",
  active: "Active",
  rejected: "Rejected",
  suspended: "Suspended",
  pending: "Legacy pending",
  disabled: "Disabled",
} as const;

type FilterStatus = keyof typeof statusLabels | "all";

export default function MembershipRequests() {
  const [filter, setFilter] = useState<FilterStatus>("pending_approval");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [accessLevel, setAccessLevel] = useState<"level_1" | "level_2" | "level_3">("level_1");
  const { logout: logoutProjectAdmin, loading: isProjectLogoutPending } = useAuth();
  const query = trpc.membership.list.useQuery(filter === "all" ? undefined : { status: filter });
  const legal = trpc.membership.ndaDetail.useQuery({ accountId: selectedId ?? 0 }, { enabled: selectedId !== null });
  const utils = trpc.useUtils();
  const decide = trpc.membership.decide.useMutation({ onSuccess: () => { setSelectedId(null); setNote(""); utils.membership.list.invalidate(); } });
  const requestMore = trpc.membership.requestMoreInformation.useMutation({ onSuccess: () => { setNote(""); utils.membership.list.invalidate(); } });
  const selected = useMemo(() => query.data?.find(item => item.id === selectedId) ?? null, [query.data, selectedId]);
  const error = query.error?.message || decide.error?.message;
  const isForbidden = !query.isLoading && (!query.data || Boolean(query.error && (query.error.message.includes("10002") || query.error.data?.code === "FORBIDDEN")));

  const perform = (decision: "approve" | "reject" | "suspend") => {
    if (!selected) return;
    decide.mutate({ accountId: selected.id, decision, accessLevel: decision === "approve" ? accessLevel : undefined, note: note || undefined });
  };
  const askForMore = () => { if (selected && note.trim().length >= 4) requestMore.mutate({ accountId: selected.id, note: note.trim() }); };

  const handleProjectLogout = async () => {
    await logoutProjectAdmin();
    window.location.assign("/");
  };

  return <main className="membership-admin">
    <header className="membership-admin-header"><div><p>SPORTIX / CONTROL ROOM</p><h1>MEMBERSHIP <em>REQUESTS.</em></h1><span>Review verified partner profiles and control platform access.</span></div><div className="membership-admin-header-actions"><button type="button" className="membership-admin-logout" onClick={() => void handleProjectLogout()} disabled={isProjectLogoutPending}><LogOut size={15} /> {isProjectLogoutPending ? "SIGNING OUT…" : "LOG OUT"}</button><ShieldAlert size={34} /></div></header>
    <nav className="membership-admin-filters" aria-label="Membership filters">{(["pending_approval", "active", "rejected", "suspended", "email_unverified", "all"] as FilterStatus[]).map(item => <button key={item} onClick={() => { setFilter(item); setSelectedId(null); }} className={filter === item ? "active" : ""}>{item === "all" ? "All records" : statusLabels[item]}</button>)}</nav>
    {isForbidden ? <section className="membership-admin-restricted"><ShieldAlert size={28} /><p>ADMIN ACCESS REQUIRED</p><h2>THIS CONTROL ROOM IS RESTRICTED.</h2><span>Only authorised SPORTIX administrators can review member records or make membership decisions.</span><button type="button" onClick={() => startLogin()}>SIGN IN AS PROJECT ADMIN <span>→</span></button></section> : <>{error && <p className="membership-admin-error"><CircleAlert size={16} /> {error}</p>}
    {query.isLoading ? <p className="membership-admin-empty">Loading protected membership records…</p> : <section className="membership-admin-table" aria-label="Protected membership requests"><div className="membership-admin-row membership-admin-head"><span>Applicant</span><span>Verification</span><span>Organisation</span><span>Registered</span><span>Status</span><span /></div>{query.data?.map(account => <button key={account.id} className="membership-admin-row" onClick={() => setSelectedId(account.id)}><span><strong>{account.fullName}</strong><small>{account.email}<br />{account.mobileNumber}</small></span><span>{account.emailVerifiedAt ? <b className="verified"><Check size={14} /> Email verified</b> : <b>Unverified</b>}</span><span>{account.companyName || "—"}<small>{account.jobTitle || ""}</small></span><span>{new Date(account.createdAt).toLocaleDateString()}</span><span><i className={`membership-status ${account.status}`}>{statusLabels[account.status]}</i></span><span><Eye size={17} /></span></button>)}</section>}
    {!query.isLoading && !query.data?.length && <p className="membership-admin-empty">No membership records match this filter.</p>}</>}
    {selected && <div className="membership-admin-modal" role="dialog" aria-modal="true" aria-label="Membership request detail"><section><button className="membership-close" onClick={() => setSelectedId(null)} aria-label="Close"><X size={20} /></button><p>SPORTIX / MEMBER PROFILE</p><h2>{selected.fullName}</h2><div className="membership-detail-grid"><div><span>Email</span><strong>{selected.email}</strong></div><div><span>Mobile</span><strong>{selected.mobileNumber || "—"}</strong></div><div><span>Company</span><strong>{selected.companyName || "—"}</strong></div><div><span>Job title</span><strong>{selected.jobTitle || "—"}</strong></div><div><span>Age / gender</span><strong>{selected.age || "—"} / {selected.gender || "—"}</strong></div><div><span>Weekly activity</span><strong>{selected.weeklySportFrequency || "—"}</strong></div></div><div className="membership-detail-copy"><span>Challenge to solve</span><p>{selected.sportsChallenges || "—"}</p><span>Proposed solution</span><p>{selected.sportsSolutionIdea || "—"}</p></div><div className="membership-detail-copy"><span>NDA acceptance</span><p>{legal.data ? <>Authority: <b>{legal.data.authority || "awaiting declaration"}</b><br />Accepted: {new Date(legal.data.acceptedAt).toLocaleString()}<br />{legal.data.evidenceUrl && <a href={legal.data.evidenceUrl}>Open immutable PDF evidence</a>} {legal.data.companyNdaUrl && <><br /><a href={legal.data.companyNdaUrl}>Open signed Company NDA</a></>}</> : "No NDA record available yet."}</p></div><label className="membership-note">Decision / more-information note <small>OPTIONAL</small><textarea value={note} maxLength={500} onChange={event => setNote(event.target.value)} /></label>{["pending_approval", "pending_admin_approval"].includes(selected.status) && <><label className="membership-note">Approved access level<select value={accessLevel} onChange={event => setAccessLevel(event.target.value as typeof accessLevel)}><option value="level_1">Level 1</option><option value="level_2">Level 2</option><option value="level_3">Level 3 — restricted approval</option></select></label><div className="membership-actions"><button className="approve" disabled={decide.isPending} onClick={() => perform("approve")}><UserRoundCheck size={16} /> Approve membership</button><button className="reject" disabled={decide.isPending} onClick={() => perform("reject")}><X size={16} /> Reject</button><button disabled={requestMore.isPending || note.trim().length < 4} onClick={askForMore}>Request more information</button></div></>}{["active", "approved"].includes(selected.status) && <div className="membership-actions"><button className="reject" disabled={decide.isPending} onClick={() => perform("suspend")}><ShieldAlert size={16} /> Suspend access</button></div>}</section></div>}
  </main>;
}
