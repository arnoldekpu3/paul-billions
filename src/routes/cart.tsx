import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, X, BookmarkPlus } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { formatNaira } from "@/lib/mock-products";
import { useCart } from "@/lib/use-cart";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/cart")({
  component: CartPage,
  head: () => ({ meta: [{ title: "Cart — Paul Billions" }] }),
});

function CartPage() {
  const { items, updateQty, remove, saveForLater, loading } = useCart();
  const { user } = useAuth();

  const subtotalKobo = items.reduce((s, i) => s + i.unit_price_kobo * i.qty, 0);
  const subtotal = subtotalKobo / 100;
  const shipping = subtotal > 150000 ? 0 : 5000;
  const total = subtotal + shipping;

  return (
    <PageShell>
      <div className="mx-auto max-w-[1100px] px-4 sm:px-8 py-10 sm:py-14">
        <div className="text-center mb-10">
          <p className="text-[11px] tracking-luxe uppercase text-gold mb-3">Your bag</p>
          <h1 className="font-display text-4xl sm:text-5xl">Shopping Cart</h1>
        </div>

        {loading ? (
          <div className="py-20 text-center text-foreground/60">Loading…</div>
        ) : items.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-foreground/60 mb-6">Your cart is empty.</p>
            <Link to="/shop" className="inline-block bg-black text-white px-8 py-4 text-xs tracking-luxe uppercase">
              Continue shopping
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_360px] gap-10">
            <div className="divide-y divide-border border-t border-b border-border">
              {items.map((it) => (
                <div key={it.id} className="py-5 flex gap-4 sm:gap-6">
                  <Link
                    to="/product/$slug"
                    params={{ slug: it.product_slug }}
                    className="w-24 sm:w-28 aspect-[3/4] bg-muted overflow-hidden shrink-0"
                  >
                    <img src={it.product_image} alt={it.product_name} className="w-full h-full object-cover" />
                  </Link>
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between gap-3">
                      <div>
                        <h3 className="font-medium text-sm sm:text-base">{it.product_name}</h3>
                        <p className="text-xs text-foreground/60 mt-1">
                          {it.size || "—"} · {it.color || "—"}
                        </p>
                      </div>
                      <button onClick={() => remove(it.id)} aria-label="Remove" className="text-foreground/50 hover:text-foreground">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-auto flex flex-wrap items-end justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="inline-flex items-center border border-border">
                          <button
                            onClick={() => updateQty(it.id, Math.max(1, it.qty - 1))}
                            className="p-2 hover:bg-muted"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-10 text-center text-sm">{it.qty}</span>
                          <button onClick={() => updateQty(it.id, it.qty + 1)} className="p-2 hover:bg-muted">
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        {user && (
                          <button
                            onClick={() => saveForLater(it)}
                            className="text-[11px] tracking-luxe uppercase text-foreground/60 hover:text-gold inline-flex items-center gap-1"
                          >
                            <BookmarkPlus className="h-3 w-3" /> Save for later
                          </button>
                        )}
                      </div>
                      <p className="text-sm font-medium">{formatNaira((it.unit_price_kobo * it.qty) / 100)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <aside className="bg-muted/40 p-7 h-fit">
              <h2 className="font-display text-xl mb-6">Order Summary</h2>
              <Row label="Subtotal" value={formatNaira(subtotal)} />
              <Row label="Shipping" value={shipping === 0 ? "Free" : formatNaira(shipping)} />
              <div className="border-t border-border my-4" />
              <Row label="Total" value={formatNaira(total)} bold />
              <Link
                to="/checkout"
                className="mt-6 block text-center bg-black text-white px-8 py-4 text-xs tracking-luxe uppercase font-semibold hover:bg-gold hover:text-black transition-colors"
              >
                Checkout
              </Link>
              <Link
                to="/shop"
                className="mt-3 block text-center text-xs tracking-luxe uppercase text-foreground/60 hover:text-foreground"
              >
                Continue shopping
              </Link>
              {!user && (
                <p className="mt-5 text-center text-xs text-foreground/60">
                  <Link to="/login" className="text-gold underline">
                    Sign in
                  </Link>{" "}
                  to save your cart across devices.
                </p>
              )}
            </aside>
          </div>
        )}
      </div>
    </PageShell>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between text-sm py-1.5 ${bold ? "font-semibold text-base" : "text-foreground/80"}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
