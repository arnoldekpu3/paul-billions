import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Download, RefreshCw, Truck } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { supabase } from "@/integrations/supabase/client";
import { formatNaira } from "@/lib/mock-products";
import { useCart } from "@/lib/use-cart";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/order/$id")({
  component: OrderPage,
  head: () => ({ meta: [{ title: "Order — Paul Billions" }] }),
});

function OrderPage() {
  const { id } = Route.useParams();
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { add } = useCart();
  const nav = useNavigate();

  useEffect(() => {
    (async () => {
      const { data: o } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
      const { data: li } = await supabase.from("order_items").select("*").eq("order_id", id);
      setOrder(o);
      setItems(li ?? []);
      setLoading(false);
    })();
  }, [id]);

  async function reorder() {
    for (const it of items) {
      await add(it.product_slug, it.qty, it.size, it.color);
    }
    nav({ to: "/cart" });
  }

  function downloadReceipt() {
    if (!order) return;
    const lines = [
      `PAUL BILLIONS — Receipt`,
      `Order: ${order.order_number}`,
      `Date: ${new Date(order.created_at).toLocaleString()}`,
      `Status: ${order.status} / ${order.payment_status}`,
      ``,
      `Items:`,
      ...items.map(
        (it) =>
          `  ${it.name_snapshot} (${it.size ?? "-"}/${it.color ?? "-"}) x${it.qty}  ${formatNaira(
            (it.unit_price_kobo * it.qty) / 100
          )}`
      ),
      ``,
      `Subtotal: ${formatNaira(order.subtotal_kobo / 100)}`,
      `Shipping: ${formatNaira(order.shipping_kobo / 100)}`,
      `Total:    ${formatNaira(order.total_kobo / 100)}`,
      ``,
      `Ship to: ${order.shipping?.recipient ?? ""}`,
      `${order.shipping?.line1 ?? ""}, ${order.shipping?.city ?? ""}, ${order.shipping?.state ?? ""}`,
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `paul-billions-${order.order_number}.txt`;
    a.click();
  }

  if (loading) return <PageShell><div className="py-32 text-center text-foreground/60">Loading…</div></PageShell>;
  if (!order) throw notFound();

  return (
    <PageShell>
      <div className="mx-auto max-w-3xl px-4 sm:px-8 py-10 sm:py-14">
        <div className="text-center mb-10">
          <p className="text-[11px] tracking-luxe uppercase text-gold mb-3">Thank you</p>
          <h1 className="font-display text-4xl sm:text-5xl">Order Confirmed</h1>
          <p className="text-sm text-foreground/60 mt-3">
            Order number <span className="text-foreground font-medium">{order.order_number}</span>
          </p>
        </div>

        <div className="border border-border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl">Tracking</h2>
            <span className="text-[11px] tracking-luxe uppercase text-gold">{order.status}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-foreground/70">
            <Truck className="h-4 w-4" />
            {order.tracking_number ? (
              <>
                <span>Tracking #: {order.tracking_number}</span>
                {order.tracking_url && (
                  <a href={order.tracking_url} target="_blank" className="text-gold underline">
                    Track package
                  </a>
                )}
              </>
            ) : (
              <span>Your order is being prepared. Tracking will appear here when shipped.</span>
            )}
          </div>
        </div>

        <div className="border border-border divide-y divide-border mb-6">
          {items.map((it) => (
            <div key={it.id} className="flex gap-4 p-4">
              {it.product_image && <img src={it.product_image} className="w-16 h-20 object-cover bg-muted" alt="" />}
              <div className="flex-1">
                <p className="text-sm font-medium">{it.name_snapshot}</p>
                <p className="text-xs text-foreground/60">{it.size ?? "-"} · {it.color ?? "-"} · Qty {it.qty}</p>
              </div>
              <p className="text-sm self-center">{formatNaira((it.unit_price_kobo * it.qty) / 100)}</p>
            </div>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-6 mb-8">
          <div>
            <h3 className="text-[11px] tracking-luxe uppercase text-foreground/60 mb-2">Shipping</h3>
            <p className="text-sm">{order.shipping?.recipient}</p>
            <p className="text-sm text-foreground/70">{order.shipping?.line1}</p>
            <p className="text-sm text-foreground/70">
              {order.shipping?.city}, {order.shipping?.state}
            </p>
          </div>
          <div className="sm:text-right">
            <div className="flex justify-between text-sm"><span>Subtotal</span><span>{formatNaira(order.subtotal_kobo / 100)}</span></div>
            <div className="flex justify-between text-sm"><span>Shipping</span><span>{formatNaira(order.shipping_kobo / 100)}</span></div>
            <div className="flex justify-between font-semibold mt-2"><span>Total</span><span>{formatNaira(order.total_kobo / 100)}</span></div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button onClick={downloadReceipt} className="border border-border px-5 py-3 text-xs tracking-luxe uppercase inline-flex items-center gap-2 hover:border-gold hover:text-gold">
            <Download className="h-3.5 w-3.5" /> Download receipt
          </button>
          <button onClick={reorder} className="border border-border px-5 py-3 text-xs tracking-luxe uppercase inline-flex items-center gap-2 hover:border-gold hover:text-gold">
            <RefreshCw className="h-3.5 w-3.5" /> Reorder
          </button>
          <Link to="/shop" className="bg-black text-white px-5 py-3 text-xs tracking-luxe uppercase hover:bg-gold hover:text-black">
            Continue shopping
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
