import { trpc } from "@/lib/trpc";
import { Check, CircleAlert, ShieldAlert, UserRoundCheck, X } from "lucide-react";
import React, { useMemo, useState } from "react";
import "../registered-users.css";

const statusLabels = {
  pending: "Pending approval",
  approved: "Access approved",
  rejected: "Access rejected",
  suspended: "Access suspended",
} as const;

type UserAccessStatus = keyof typeof statusLabels | "all";

export default function RegisteredUsers() {
  const [filter, setFilter] = useState<UserAccessStatus>("pending");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const utils = trpc.useUtils();
  const users = trpc.userAccess.list.useQuery(filter === "all" ? undefined : { status: filter });
  const decide = trpc.userAccess.decide.useMutation({ onSuccess: () => { setSelectedId(null); utils.userAccess.list.invalidate(); } });
  const selected = useMemo(() => users.data?.find(user => user.id === selectedId) ?? null, [selectedId, users.data]);
  const error = users.error?.message || decide.error?.message;
  const isForbidden = !users.isLoading && Boolean(users.error?.data?.code === "FORBIDDEN");

  const choose = (decision: "approve" | "reject" | "suspend") => {
    if (selected) decide.mutate({ userId: selected.id, decision });
  };

  return <main className="registered-users-admin">
    <header className="registered-users-header">
      <div><p>SPORTIX / CONTROL ROOM</p><h1>USER <em>ACCESS.</em></h1><span>Approve or restrict registered individuals before they enter SPORTIX.</span></div>
      <a href="/admin/memberships">MEMBERSHIPS <span>↗</span></a>
    </header>
    <nav className="registered-users-filters" aria-label="Registered user filters">
      {(["pending", "approved", "rejected", "suspended", "all"] as UserAccessStatus[]).map(status => <button type="button" key={status} className={filter === status ? "active" : ""} onClick={() => { setFilter(status); setSelectedId(null); }}>{status === "all" ? "All users" : statusLabels[status]}</button>)}
    </nav>
    {isForbidden ? <section className="registered-users-restricted"><ShieldAlert size={28} /><p>ADMIN ACCESS REQUIRED</p><span>Only SPORTIX administrators can manage registered-user access.</span></section> : <>
      {error && <p className="registered-users-error"><CircleAlert size={16} /> {error}</p>}
      {users.isLoading ? <p className="registered-users-empty">Loading registered users…</p> : <section className="registered-users-table" aria-label="Registered user access">
        <div className="registered-users-row registered-users-head"><span>User</span><span>Sign-in provider</span><span>Registered</span><span>Access</span><span /></div>
        {users.data?.map(user => <button type="button" key={user.id} className="registered-users-row" onClick={() => setSelectedId(user.id)}><span><strong>{user.name || "Unnamed user"}</strong><small>{user.email || user.openId}</small></span><span>{user.loginMethod || "Manus"}</span><span>{new Date(user.createdAt).toLocaleDateString()}</span><span><i className={`registered-user-status ${user.accessStatus}`}>{statusLabels[user.accessStatus]}</i></span><span>VIEW ↗</span></button>)}
      </section>}
      {!users.isLoading && !users.data?.length && <p className="registered-users-empty">No registered users match this filter.</p>}
    </>}
    {selected && <div className="registered-users-modal" role="dialog" aria-modal="true" aria-label="Registered user access detail"><section><button type="button" className="registered-users-close" onClick={() => setSelectedId(null)} aria-label="Close"><X size={20} /></button><p>REGISTERED USER</p><h2>{selected.name || "Unnamed user"}</h2><dl><div><dt>Email</dt><dd>{selected.email || "Not shared"}</dd></div><div><dt>Sign-in provider</dt><dd>{selected.loginMethod || "Manus"}</dd></div><div><dt>Current access</dt><dd>{statusLabels[selected.accessStatus]}</dd></div><div><dt>Registered</dt><dd>{new Date(selected.createdAt).toLocaleString()}</dd></div></dl><p className="registered-users-note">Only an approved user can enter SPORTIX. Rejecting or suspending access returns the user to the access page.</p><div className="registered-users-actions">{selected.accessStatus !== "approved" && <button type="button" className="approve" disabled={decide.isPending} onClick={() => choose("approve")}><UserRoundCheck size={16} /> Approve access</button>}{selected.accessStatus !== "rejected" && <button type="button" className="reject" disabled={decide.isPending} onClick={() => choose("reject")}><X size={16} /> Reject</button>}{selected.accessStatus === "approved" && <button type="button" className="suspend" disabled={decide.isPending} onClick={() => choose("suspend")}><ShieldAlert size={16} /> Suspend</button>}</div></section></div>}
  </main>;
}
