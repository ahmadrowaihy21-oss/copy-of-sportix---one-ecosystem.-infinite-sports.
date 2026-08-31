import { trpc } from "@/lib/trpc";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { Check, CircleAlert, Eye, LogOut, ShieldAlert, X } from "lucide-react";
import { useMemo, useState } from "react";
import "../membership-requests.css";
import "../admin-logout.css";

const statusLabels = {
  email_unverified: "Email unverified",
  approved: "Approved",
  active: "Active",
  rejected: "Rejected",
  suspended: "Suspended",
  disabled: "Disabled",
} as const;

type FilterStatus = keyof typeof statusLabels | "all";

export default function MembershipRequests() {
  const [filter, setFilter] = useState<FilterStatus>("active");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const { logout: logoutProjectAdmin, loading: isProjectLogoutPending } = useAuth();
  const query = trpc.membership.list.useQuery(filter === "all" ? undefined : { status: filter });
  const utils = trpc.useUtils();
  const decide = trpc.membership.decide.useMutation({ onSuccess: () => { setSelectedId(null); setNote(""); utils.membership.list.invalidate(); } });
  const selected = useMemo(() => query.data?.find(item => item.id === selectedId) ?? null, [query.data, selectedId]);
  const error = query.error?.message || decide.error?.message;
  const isForbidden = !query.isLoading && (!query.data || Boolean(query.error && (query.error.message.includes("10002") || query.error.data?.code === "FORBIDDEN")));

  const perform = (decision: "approve" | "reject" | "suspend") => {
    if (!selected) return;
    decide.mutate({ accountId: selected.id, decision, note: note || undefined });
  };

  const handleProjectLogout = async () => {
    await logoutProjectAdmin();
    window.location.assign("/");
  };

  return <main className="membership-admin">
    <header className="membership-admin-header"><div><p>SPORTIX / CONTROL ROOM</p><h1>MEMBERSHIP <em>REQUESTS.</em></h1><span>Review verified partner profiles and control platform access.</span></div><div className="membership-admin-header-actions"><button type="button" className="membership-admin-logout" onClick={() => void handleProjectLogout()} disabled={isProjectLogoutPending}><LogOut size={15} /> {isProjectLogoutPending ? "SIGNING OUT…" : "LOG OUT"}</button><ShieldAlert size={34} /></div></header>
    <nav className="membership-admin-filters" aria-label="Membership filters">{(["active", "rejected", "suspended", "all"] as FilterStatus[]).map(item => <button key={item} onClick={() => { setFilter(item); setSelectedId(null); }} className={filter === item ? "active" : ""}>{item === "all" ? "All records" : statusLabels[item]}</button>)}</nav>
    {isForbidden ? <section className="membership-admin-restricted"><ShieldAlert size={28} /><p>ADMIN ACCESS REQUIRED</p><h2>THIS CONTROL ROOM IS RESTRICTED.</h2><span>Only authorised SPORTIX administrators can review member records or make membership decisions.</span><button type="button" onClick={() => startLogin()}>SIGN IN AS PROJECT ADMIN <span>→</span></button></section> : <>{error && <p className="membership-admin-error"><CircleAlert size={16} /> {error}</p>}
    {query.isLoading ? <p className="membership-admin-empty">Loading protected membership records…</p> : <section className="membership-admin-table" aria-label="Protected membership requests"><div className="membership-admin-row membership-admin-head"><span>Applicant</span><span>Verification</span><span>Organisation</span><span>Registered</span><span>Status</span><span /></div>{query.data?.map(account => <button key={account.id} className="membership-admin-row" onClick={() => setSelectedId(account.id)}><span><strong>{account.fullName}</strong><small>{account.email}<br />{account.mobileNumber}</small></span><span>{account.emailVerifiedAt ? <b className="verified"><Check size={14} /> Email verified</b> : <b>Unverified</b>}</span><span>{account.companyName || "—"}<small>{account.jobTitle || ""}</small></span><span>{new Date(account.createdAt).toLocaleDateString()}</span><span><i className={`membership-status ${account.status}`}>{statusLabels[account.status]}</i></span><span><Eye size={17} /></span></button>)}</section>}
    {!query.isLoading && !query.data?.length && <p className="membership-admin-empty">No membership records match this filter.</p>}</>}
    {selected && <div className="membership-admin-modal" role="dialog" aria-modal="true" aria-label="Membership request detail"><section><button className="membership-close" onClick={() => setSelectedId(null)} aria-label="Close"><X size={20} /></button><p>SPORTIX / MEMBER PROFILE</p><h2>{selected.fullName}</h2><div className="membership-detail-grid"><div><span>Email</span><strong>{selected.email}</strong></div><div><span>Mobile</span><strong>{selected.mobileNumber || "—"}</strong></div><div><span>Company</span><strong>{selected.companyName || "—"}</strong></div><div><span>Job title</span><strong>{selected.jobTitle || "—"}</strong></div><div><span>Age / gender</span><strong>{selected.age || "—"} / {selected.gender || "—"}</strong></div><div><span>Weekly activity</span><strong>{selected.weeklySportFrequency || "—"}</strong></div></div><div className="membership-detail-copy"><span>Challenge to solve</span><p>{selected.sportsChallenges || "—"}</p><span>Proposed solution</span><p>{selected.sportsSolutionIdea || "—"}</p></div><label className="membership-note">Decision / more-information note <small>OPTIONAL</small><textarea value={note} maxLength={500} onChange={event => setNote(event.target.value)} /></label>{["active", "approved"].includes(selected.status) && <div className="membership-actions"><button className="reject" disabled={decide.isPending} onClick={() => perform("suspend")}><ShieldAlert size={16} /> Suspend access</button></div>}</section></div>}
  </main>;
}
