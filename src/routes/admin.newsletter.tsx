import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { listSubscribers } from "@/lib/admin.functions";
import { CrudPage } from "@/components/admin/crud";
import { AdminHeader, Card, Table, Td, Tr, Btn } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/newsletter")({ component: NewsletterPage });

function NewsletterPage() {
  const [tab, setTab] = useState<"campaigns" | "subscribers">("campaigns");
  return (
    <>
      <div className="flex gap-1 mb-6 border border-white/10 w-fit">
        <button onClick={() => setTab("campaigns")} className={`px-4 py-2 text-[11px] uppercase tracking-[0.2em] ${tab === "campaigns" ? "bg-gold text-black" : "text-white/60"}`}>Campaigns</button>
        <button onClick={() => setTab("subscribers")} className={`px-4 py-2 text-[11px] uppercase tracking-[0.2em] ${tab === "subscribers" ? "bg-gold text-black" : "text-white/60"}`}>Subscribers</button>
      </div>
      {tab === "campaigns" ? (
        <CrudPage
          title="Newsletter Campaigns"
          table="newsletter_campaigns"
          fields={[
            { key: "subject", label: "Subject", required: true },
            { key: "body_html", label: "Body (HTML)", type: "textarea" },
            { key: "status", label: "Status", type: "select", options: ["draft", "scheduled", "sent"] },
            { key: "scheduled_for", label: "Scheduled for", type: "datetime-local" },
          ]}
          columns={["subject", "status", "scheduled_for", "sent_at"]}
        />
      ) : <Subscribers />}
    </>
  );
}

function Subscribers() {
  const fn = useServerFn(listSubscribers);
  const { data, isLoading } = useQuery({ queryKey: ["subscribers"], queryFn: () => fn() });
  function exportCsv() {
    const rows = data ?? [];
    const csv = "email,created_at\n" + rows.map((r: any) => `${r.email},${r.created_at}`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "subscribers.csv"; a.click();
  }
  return (
    <>
      <AdminHeader title="Subscribers" subtitle={`${data?.length ?? 0} subscribers`} actions={<Btn onClick={exportCsv}>Export CSV</Btn>} />
      {isLoading ? <div className="text-white/40 text-sm">Loading…</div> : (
        <Card className="p-0">
          <Table headers={["Email", "Status", "Subscribed"]}>
            {(data ?? []).map((s: any) => <Tr key={s.id}><Td>{s.email}</Td><Td>{s.is_active ? "Active" : "Inactive"}</Td><Td className="text-white/50">{new Date(s.created_at).toLocaleDateString()}</Td></Tr>)}
            {(data ?? []).length === 0 && <Tr><Td className="text-white/40">No subscribers yet</Td><Td/><Td/></Tr>}
          </Table>
        </Card>
      )}
    </>
  );
}
