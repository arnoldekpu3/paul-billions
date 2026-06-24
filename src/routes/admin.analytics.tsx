import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getOverview } from "@/lib/admin.functions";
import { AdminHeader, Card, Stat, formatNaira } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/analytics")({ component: AnalyticsPage });

function AnalyticsPage() {
  const fn = useServerFn(getOverview);
  const { data } = useQuery({ queryKey: ["analytics-overview"], queryFn: () => fn() });

  if (!data) return <div className="text-white/40 text-sm">Loading…</div>;
  const max = Math.max(...data.chart.map((d: any) => d.total), 1);
  return (
    <>
      <AdminHeader title="Analytics" subtitle="Performance metrics and reports" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Stat label="Revenue (30d)" value={formatNaira(data.revenue)} />
        <Stat label="Orders (total)" value={data.orders} />
        <Stat label="Customers" value={data.customers} />
        <Stat label="Active products" value={data.products} />
      </div>

      <Card className="p-6 mb-6">
        <div className="text-[10px] uppercase tracking-[0.25em] text-white/40 mb-4">Revenue last 30 days</div>
        <div className="flex items-end gap-1 h-48">
          {data.chart.map((d: any) => (
            <div key={d.date} className="flex-1 group relative">
              <div className="bg-gradient-to-t from-gold/60 to-gold/20 hover:from-gold transition" style={{ height: `${(d.total / max) * 180}px` }} />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-black border border-gold/40 text-white text-xs px-2 py-1 whitespace-nowrap">
                {d.date}: {formatNaira(d.total)}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="text-[10px] uppercase tracking-[0.25em] text-white/40 mb-3">Inventory health</div>
          <div className="text-white/80">{data.lowStock.length} low-stock products</div>
        </Card>
        <Card className="p-6">
          <div className="text-[10px] uppercase tracking-[0.25em] text-white/40 mb-3">Traffic</div>
          <div className="text-white/60 text-sm">Connect an analytics provider for traffic reports.</div>
        </Card>
      </div>
    </>
  );
}
