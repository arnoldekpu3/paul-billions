import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/site/PageShell";
import { formatNaira } from "@/lib/mock-products";
import { useCart } from "@/lib/use-cart";
import { useAuth } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
  head: () => ({ meta: [{ title: "Checkout — Paul Billions" }] }),
});

type Form = {
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  billing_same: boolean;
  b_line1: string;
  b_city: string;
  b_state: string;
};

function CheckoutPage() {
  const { user } = useAuth();
  const { items, clear } = useCart();
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<Form>({
    email: user?.email ?? "",
    phone: "",
    first_name: "",
    last_name: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "Nigeria",
    billing_same: true,
    b_line1: "",
    b_city: "",
    b_state: "",
  });

  useEffect(() => {
    if (user?.email && !form.email) setForm((f) => ({ ...f, email: user.email! }));
  }, [user]);

  // Prefill default address for signed-in users
  useEffect(() => {
    if (!user) return;
    supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_default", true)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        const a: any = data;
        setForm((f) => ({
          ...f,
          phone: a.phone ?? f.phone,
          first_name: a.recipient?.split(" ")[0] ?? f.first_name,
          last_name: a.recipient?.split(" ").slice(1).join(" ") ?? f.last_name,
          line1: a.line1 ?? "",
          line2: a.line2 ?? "",
          city: a.city ?? "",
          state: a.state ?? "",
          postal_code: a.postal_code ?? "",
          country: a.country ?? "Nigeria",
        }));
      });
  }, [user]);

  const subtotalKobo = items.reduce((s, i) => s + i.unit_price_kobo * i.qty, 0);
  const shippingKobo = subtotalKobo > 150000 * 100 ? 0 : 5000 * 100;
  const totalKobo = subtotalKobo + shippingKobo;

  function set<K extends keyof Form>(k: K, v: Form[K]) {
    setForm({ ...form, [k]: v });
  }

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) return toast.error("Your cart is empty");
    setBusy(true);
    try {
      const order_number = "PB" + Date.now().toString().slice(-8);
      const shipping = {
        recipient: `${form.first_name} ${form.last_name}`.trim(),
        line1: form.line1,
        line2: form.line2,
        city: form.city,
        state: form.state,
        postal_code: form.postal_code,
        country: form.country,
      };
      const billing = form.billing_same
        ? shipping
        : { recipient: `${form.first_name} ${form.last_name}`.trim(), line1: form.b_line1, city: form.b_city, state: form.b_state, country: form.country };

      const { data: order, error } = await supabase
        .from("orders")
        .insert({
          order_number,
          user_id: user?.id ?? null,
          email: form.email,
          phone: form.phone,
          status: "pending",
          payment_status: "pending",
          subtotal_kobo: subtotalKobo,
          shipping_kobo: shippingKobo,
          discount_kobo: 0,
          total_kobo: totalKobo,
          shipping,
          billing,
        } as any)
        .select("id, order_number")
        .single();
      if (error) throw error;

      const lineItems = items.map((it) => ({
        order_id: (order as any).id,
        product_slug: it.product_slug,
        name_snapshot: it.product_name,
        product_image: it.product_image,
        qty: it.qty,
        unit_price_kobo: it.unit_price_kobo,
        size: it.size,
        color: it.color,
      }));
      const { error: liErr } = await supabase.from("order_items").insert(lineItems as any);
      if (liErr) throw liErr;

      if (user) {
        await supabase.from("notifications").insert({
          user_id: user.id,
          type: "order",
          title: `Order ${(order as any).order_number} received`,
          body: "We'll email you when your order ships.",
          link: `/order/${(order as any).id}`,
        } as any);
      }

      await clear();
      toast.success("Order placed!");
      nav({ to: "/order/$id", params: { id: (order as any).id } });
    } catch (err: any) {
      toast.error(err.message ?? "Could not place order");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-[1100px] px-4 sm:px-8 py-10 sm:py-14">
        <div className="text-center mb-10">
          <p className="text-[11px] tracking-luxe uppercase text-gold mb-3">Almost there</p>
          <h1 className="font-display text-4xl sm:text-5xl">Checkout</h1>
        </div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-10">
          <form className="space-y-8" onSubmit={placeOrder}>
            <Section title="Contact">
              <Field label="Email" type="email" value={form.email} onChange={(v) => set("email", v)} required />
              <Field label="Phone" type="tel" value={form.phone} onChange={(v) => set("phone", v)} required />
            </Section>

            <Section title="Shipping Address">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="First name" value={form.first_name} onChange={(v) => set("first_name", v)} required />
                <Field label="Last name" value={form.last_name} onChange={(v) => set("last_name", v)} required />
              </div>
              <Field label="Address" value={form.line1} onChange={(v) => set("line1", v)} required />
              <Field label="Apartment, suite (optional)" value={form.line2} onChange={(v) => set("line2", v)} />
              <div className="grid sm:grid-cols-3 gap-4">
                <Field label="City" value={form.city} onChange={(v) => set("city", v)} required />
                <Field label="State" value={form.state} onChange={(v) => set("state", v)} required />
                <Field label="Postal code" value={form.postal_code} onChange={(v) => set("postal_code", v)} />
              </div>
            </Section>

            <Section title="Billing">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.billing_same}
                  onChange={(e) => set("billing_same", e.target.checked)}
                />
                Same as shipping address
              </label>
              {!form.billing_same && (
                <div className="space-y-4 pt-2">
                  <Field label="Billing address" value={form.b_line1} onChange={(v) => set("b_line1", v)} required />
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="City" value={form.b_city} onChange={(v) => set("b_city", v)} required />
                    <Field label="State" value={form.b_state} onChange={(v) => set("b_state", v)} required />
                  </div>
                </div>
              )}
            </Section>

            <Section title="Payment">
              <p className="text-sm text-foreground/70">
                Pay on delivery is enabled. Card payments will be available soon.
              </p>
            </Section>

            <button
              disabled={busy || items.length === 0}
              className="w-full bg-black text-white px-8 py-4 text-xs tracking-luxe uppercase font-semibold hover:bg-gold hover:text-black transition-colors disabled:opacity-50"
            >
              {busy ? "Placing order…" : "Place order"}
            </button>
          </form>

          <aside className="bg-muted/40 p-7 h-fit">
            <h2 className="font-display text-xl mb-4">Summary</h2>
            <p className="text-sm text-foreground/70">
              {items.length} item{items.length === 1 ? "" : "s"}
            </p>
            <div className="border-t border-border my-4" />
            <div className="flex justify-between text-sm py-1.5">
              <span>Subtotal</span>
              <span>{formatNaira(subtotalKobo / 100)}</span>
            </div>
            <div className="flex justify-between text-sm py-1.5">
              <span>Shipping</span>
              <span>{shippingKobo === 0 ? "Free" : formatNaira(shippingKobo / 100)}</span>
            </div>
            <div className="border-t border-border my-3" />
            <div className="flex justify-between font-semibold text-base">
              <span>Total</span>
              <span>{formatNaira(totalKobo / 100)}</span>
            </div>
            <Link
              to="/cart"
              className="mt-5 block text-center text-xs tracking-luxe uppercase text-foreground/60 hover:text-foreground"
            >
              ← Back to cart
            </Link>
          </aside>
        </div>
      </div>
    </PageShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-display text-xl mb-4">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  type = "text",
  value,
  onChange,
  required,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[10px] tracking-luxe uppercase text-foreground/60 block mb-1.5">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full border border-border px-4 py-3 text-sm focus:border-gold focus:outline-none"
      />
    </label>
  );
}
