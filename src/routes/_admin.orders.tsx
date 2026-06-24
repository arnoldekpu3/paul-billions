import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { listOrders, getOrder, updateOrder } from "@/lib/admin.functions";
import { AdminHeader, Card, Table, Td, Tr, Btn, Input, Select, StatusPill, formatNaira, Label, Textarea } from "@/components/admin/ui";

export const Route = createFileRoute("/_admin/orders")({ component: OrdersPage });

const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"];

function OrdersPage() {
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const list = useServerFn(listOrders);
  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin-orders", status, search],
    queryFn: () => list({ data: { status: status || undefined, search: search || undefined } }),
  });

  function exportCsv() {
    const rows = orders ?? [];
    const headers = ["order_number", "email", "status", "payment_status", "total_kobo", "created_at"];
    const csv = [headers.join(",")].concat(rows.map((r: any) => headers.map((h) => JSON.stringify(r[h] ?? "")).join(","))).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `orders-${Date.now()}.csv`; a.click();
  }

  return (
    <>
      <AdminHeader
        title="Orders"
        subtitle={`${orders?.length ?? 0} orders`}
        actions={<Btn onClick={exportCsv}>Export CSV</Btn>}
      />
      <div className="flex flex-wrap gap-3 mb-6">
        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </Select>
        <Input placeholder="Search order # or email…" value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 min-w-[200px]" />
      </div>

      {isLoading ? <div className="text-white/40 text-sm">Loading…</div> : (
        <Card className="p-0">
          <Table headers={["Order", "Email", "Status", "Payment", "Total", "Date", ""]}>
            {(orders ?? []).map((o: any) => (
              <Tr key={o.id}>
                <Td className="text-gold">{o.order_number}</Td>
                <Td>{o.email ?? "—"}</Td>
                <Td><StatusPill status={o.status} /></Td>
                <Td><StatusPill status={o.payment_status} /></Td>
                <Td>{formatNaira(o.total_kobo)}</Td>
                <Td className="text-white/50">{new Date(o.created_at).toLocaleDateString()}</Td>
                <Td><Btn onClick={() => setOpen(o.id)}>View</Btn></Td>
              </Tr>
            ))}
            {(orders ?? []).length === 0 && <Tr><Td className="text-white/40">No orders</Td><Td/><Td/><Td/><Td/><Td/><Td/></Tr>}
          </Table>
        </Card>
      )}

      {open && <OrderModal id={open} onClose={() => setOpen(null)} />}
    </>
  );
}

function OrderModal({ id, onClose }: { id: string; onClose: () => void }) {
  const get = useServerFn(getOrder);
  const update = useServerFn(updateOrder);
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin-order", id], queryFn: () => get({ data: { id } }) });
  const order = data?.order as any;
  const items = (data?.items ?? []) as any[];
  const [busy, setBusy] = useState(false);

  async function save(patch: any) {
    setBusy(true);
    try {
      await update({ data: { id, ...patch } });
      toast.success("Updated");
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      qc.invalidateQueries({ queryKey: ["admin-order", id] });
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0b0b0b] border border-white/10 w-full max-w-2xl p-6 my-8 text-white">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="font-display text-2xl text-gold">{order?.order_number}</div>
            <div className="text-sm text-white/50 mt-1">{order?.email}</div>
          </div>
          <Btn onClick={onClose}>Close</Btn>
        </div>
        {!data ? <div className="text-white/40">Loading…</div> : (
          <>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div><Label>Status</Label>
                <Select disabled={busy} value={order.status} onChange={(e) => save({ status: e.target.value })}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </Select>
              </div>
              <div><Label>Payment</Label>
                <Select disabled={busy} value={order.payment_status} onChange={(e) => save({ payment_status: e.target.value })}>
                  {["unpaid", "paid", "refunded"].map((s) => <option key={s} value={s}>{s}</option>)}
                </Select>
              </div>
            </div>

            <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-2">Items</div>
            <Card className="p-0 mb-6">
              <Table headers={["Product", "Qty", "Unit", "Line"]}>
                {items.map((it) => (
                  <Tr key={it.id}><Td>{it.name_snapshot}</Td><Td>{it.qty}</Td><Td>{formatNaira(it.unit_price_kobo)}</Td><Td>{formatNaira(it.qty * it.unit_price_kobo)}</Td></Tr>
                ))}
              </Table>
            </Card>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-white/60">Subtotal</div><div className="text-right">{formatNaira(order.subtotal_kobo)}</div>
              <div className="text-white/60">Shipping</div><div className="text-right">{formatNaira(order.shipping_kobo)}</div>
              <div className="text-white/60">Discount</div><div className="text-right">-{formatNaira(order.discount_kobo)}</div>
              <div className="text-gold font-medium border-t border-white/10 pt-2">Total</div><div className="text-right text-gold font-medium border-t border-white/10 pt-2">{formatNaira(order.total_kobo)}</div>
            </div>

            <div className="mt-6">
              <Label>Internal notes</Label>
              <Textarea rows={3} defaultValue={order.notes ?? ""} onBlur={(e) => e.target.value !== (order.notes ?? "") && save({ notes: e.target.value })} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
