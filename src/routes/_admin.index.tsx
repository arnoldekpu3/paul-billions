import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getOverview } from "@/lib/admin.functions";
import { AdminHeader, Card, Stat, Table, Td, Tr, StatusPill, formatNaira } from "@/components/admin/ui";

export const Route = createFileRoute("/_admin/")({ component: OverviewPage });

function OverviewPage() {
  const fn = useServerFn(getOverview);
  const { data, isLoading } = useQuery({ queryKey: ["admin-overview"], queryFn: () => fn() });

  return (
    <>
      <AdminHeader title="Overview" subtitle="Real-time snapshot of your store" />
      {isLoading || !data ? <div className="text-white/40 text-sm">Loading…</div> : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Stat label="Revenue (30d)" value={formatNaira(data.revenue)} />
            <Stat label="Orders" value={data.orders} />
            <Stat label="Customers" value={data.customers} />
            <Stat label="Products" value={data.products} />
          </div>

          <Card className="p-6 mb-8">
            <div className="text-[10px] uppercase tracking-[0.25em] text-white/40 mb-4">Revenue last 30 days</div>
            <RevenueChart data={data.chart} />
          </Card>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="p-0">
              <div className="px-5 py-4 border-b border-white/10 text-[11px] uppercase tracking-[0.2em] text-white/60">Recent Orders</div>
              <Table headers={["Order", "Email", "Total", "Status"]}>
                {data.recentOrders.length === 0 && <Tr><Td className="text-white/40">No orders yet</Td><Td /><Td /><Td /></Tr>}
                {data.recentOrders.map((o: any) => (
                  <Tr key={o.id}>
                    <Td className="text-gold">{o.order_number}</Td>
                    <Td>{o.email ?? "—"}</Td>
                    <Td>{formatNaira(o.total_kobo)}</Td>
                    <Td><StatusPill status={o.status} /></Td>
                  </Tr>
                ))}
              </Table>
            </Card>
            <Card className="p-0">
              <div className="px-5 py-4 border-b border-white/10 text-[11px] uppercase tracking-[0.2em] text-white/60">Low Stock</div>
              <Table headers={["Product", "Stock"]}>
                {data.lowStock.length === 0 && <Tr><Td className="text-white/40">All stocked</Td><Td /></Tr>}
                {data.lowStock.map((p: any) => (
                  <Tr key={p.id}><Td>{p.name}</Td><Td className="text-red-400">{p.stock}</Td></Tr>
                ))}
              </Table>
            </Card>
          </div>
        </>
      )}
    </>
  );
}

function RevenueChart({ data }: { data: { date: string; total: number }[] }) {
  if (!data.length) return <div className="text-white/40 text-sm">No data yet</div>;
  const max = Math.max(...data.map((d) => d.total), 1);
  return (
    <div className="flex items-end gap-1 h-32">
      {data.map((d) => (
        <div key={d.date} title={`${d.date}: ${formatNaira(d.total)}`} className="flex-1 bg-gradient-to-t from-gold/60 to-gold/20 hover:from-gold hover:to-gold/40 transition" style={{ height: `${(d.total / max) * 100}%` }} />
      ))}
    </div>
  );
}
