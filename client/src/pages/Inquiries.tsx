import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { ArrowLeft, MailCheck, ShieldAlert } from "lucide-react";
import React, { useMemo, useState } from "react";
import { Link } from "wouter";

type InquiryStatus = "all" | "new" | "reviewed" | "responded";
export type InquiryOrder = "newest" | "oldest" | "status";

type SortableInquiry = { id: number; createdAt: Date; status: Exclude<InquiryStatus, "all"> };
type InquiryListRow = SortableInquiry & {
  subject: string;
  fullName: string;
  companyName: string;
  emailDeliveryStatus: string;
};

export function sortInquiries<T extends SortableInquiry>(inquiries: T[], order: InquiryOrder) {
  return [...inquiries].sort((left, right) => {
    if (order === "status") return left.status.localeCompare(right.status) || right.createdAt.getTime() - left.createdAt.getTime();
    const timeDelta = left.createdAt.getTime() - right.createdAt.getTime();
    return order === "oldest" ? timeDelta : -timeDelta;
  });
}

export function InquiryRows({
  inquiries,
  order,
  selectedId,
  onSelect,
}: {
  inquiries: InquiryListRow[];
  order: InquiryOrder;
  selectedId?: number | null;
  onSelect: (id: number) => void;
}) {
  return (
    <>
      {sortInquiries(inquiries, order).map(inquiry => (
        <button data-inquiry-id={inquiry.id} key={inquiry.id} type="button" onClick={() => onSelect(inquiry.id)} className={`block w-full px-5 py-4 text-left transition-colors hover:bg-muted/40 ${selectedId === inquiry.id ? "bg-muted/60" : ""}`}>
          <div className="flex items-start justify-between gap-3"><div><p className="font-medium">{inquiry.subject}</p><p className="mt-1 text-sm text-muted-foreground">{inquiry.fullName} · {inquiry.companyName}</p></div><Badge variant={statusTone[inquiry.status]}>{inquiry.status}</Badge></div>
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground"><MailCheck size={14} className={inquiry.emailDeliveryStatus === "accepted" ? "text-primary" : ""} /> {inquiry.emailDeliveryStatus} · {format(new Date(inquiry.createdAt), "PP p")}</div>
        </button>
      ))}
    </>
  );
}

const statusTone: Record<Exclude<InquiryStatus, "all">, "default" | "secondary" | "outline"> = {
  new: "default",
  reviewed: "secondary",
  responded: "outline",
};

export default function Inquiries() {
  const { user, loading } = useAuth();
  const [status, setStatus] = useState<InquiryStatus>("all");
  const [order, setOrder] = useState<InquiryOrder>("newest");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const listInput = useMemo(() => status === "all" ? undefined : { status }, [status]);
  const inquiries = trpc.contact.list.useQuery(listInput, { enabled: Boolean(user?.role === "admin") });
  const utils = trpc.useUtils();
  const updateStatus = trpc.contact.updateStatus.useMutation({
    onSuccess: () => inquiries.refetch().then(() => utils.contact.list.invalidate()),
  });
  const orderedInquiries = useMemo(() => sortInquiries(inquiries.data ?? [], order), [inquiries.data, order]);
  const selected = orderedInquiries.find(inquiry => inquiry.id === selectedId) ?? orderedInquiries[0];

  if (loading) return <div className="min-h-screen bg-black" />;

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-black px-6 py-24 text-white">
        <div className="mx-auto max-w-xl border border-white/10 bg-zinc-950 p-8">
          <ShieldAlert className="mb-5 text-lime-300" size={28} />
          <p className="text-xs tracking-[0.2em] text-zinc-500">SPORTIX / RESTRICTED</p>
          <h1 className="mt-3 text-3xl font-semibold">Inquiry access is limited to SPORTIX administrators.</h1>
          <Link href="/" className="mt-7 inline-flex items-center gap-2 text-sm text-lime-300"><ArrowLeft size={16} /> Return to SPORTIX</Link>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-7 text-foreground">
        <header className="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-medium tracking-[0.2em] text-primary">SPORTIX / PRIVATE OPERATIONS</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Contact inquiries</h1>
            <p className="mt-2 text-sm text-muted-foreground">Server-stored submissions with provider acceptance status. Customer messages are visible only to authenticated administrators.</p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
            <Select value={status} onValueChange={(value) => setStatus(value as InquiryStatus)}>
              <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Filter status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="responded">Responded</SelectItem>
              </SelectContent>
            </Select>
            <Select value={order} onValueChange={(value) => setOrder(value as InquiryOrder)}>
              <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Sort inquiries" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <section className="overflow-hidden border border-border bg-card">
            <div className="border-b border-border px-5 py-4 text-sm text-muted-foreground">{orderedInquiries.length} inquiry{orderedInquiries.length === 1 ? "" : "ies"} · {order === "newest" ? "newest first" : order === "oldest" ? "oldest first" : "grouped by status"}</div>
            <div className="divide-y divide-border">
              {inquiries.isLoading && <p className="p-5 text-sm text-muted-foreground">Loading protected inquiry data…</p>}
              {!inquiries.isLoading && !orderedInquiries.length && <p className="p-5 text-sm text-muted-foreground">No inquiries match this view.</p>}
              <InquiryRows inquiries={orderedInquiries} order={order} selectedId={selected?.id} onSelect={setSelectedId} />
            </div>
          </section>

          <aside className="border border-border bg-card p-6">
            {selected ? <>
              <div className="flex items-start justify-between gap-4"><div><p className="text-xs tracking-[0.16em] text-muted-foreground">INQUIRY #{selected.id}</p><h2 className="mt-2 text-xl font-semibold">{selected.subject}</h2></div><Badge variant={statusTone[selected.status]}>{selected.status}</Badge></div>
              <dl className="mt-6 grid gap-4 text-sm"><div><dt className="text-muted-foreground">Contact</dt><dd className="mt-1 font-medium">{selected.fullName}</dd></div><div><dt className="text-muted-foreground">Email</dt><dd className="mt-1 break-all">{selected.contactEmail ?? "—"}</dd></div><div><dt className="text-muted-foreground">Mobile</dt><dd className="mt-1">{selected.mobileNumber ?? "—"}</dd></div><div><dt className="text-muted-foreground">Organisation</dt><dd className="mt-1">{selected.companyName} · {selected.jobTitle}</dd></div><div><dt className="text-muted-foreground">Submitted</dt><dd className="mt-1">{format(new Date(selected.createdAt), "PPPP p")}</dd></div><div><dt className="text-muted-foreground">Provider delivery</dt><dd className="mt-1 break-all">{selected.emailDeliveryStatus}{selected.resendEmailId ? ` · ${selected.resendEmailId}` : ""}</dd></div></dl>
              <div className="mt-6 border-t border-border pt-5"><p className="text-xs tracking-[0.16em] text-muted-foreground">MESSAGE</p><p className="mt-3 whitespace-pre-wrap text-sm leading-6">{selected.message}</p></div>
              <div className="mt-7 flex flex-wrap gap-2">{(["new", "reviewed", "responded"] as const).map(nextStatus => <Button key={nextStatus} type="button" variant={selected.status === nextStatus ? "default" : "outline"} size="sm" disabled={updateStatus.isPending} onClick={() => updateStatus.mutate({ id: selected.id, status: nextStatus })}>{nextStatus}</Button>)}</div>
            </> : <p className="text-sm text-muted-foreground">Select an inquiry to inspect its protected details.</p>}
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
}
