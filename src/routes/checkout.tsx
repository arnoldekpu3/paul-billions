import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
  head: () => ({ meta: [{ title: "Checkout — Paul Billions" }] }),
});

function CheckoutPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-[1100px] px-4 sm:px-8 py-10 sm:py-14">
        <div className="text-center mb-10">
          <p className="text-[11px] tracking-luxe uppercase text-gold mb-3">Almost there</p>
          <h1 className="font-display text-4xl sm:text-5xl">Checkout</h1>
        </div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-10">
          <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
            <Section title="Contact">
              <Field label="Email" type="email" placeholder="you@example.com" />
              <Field label="Phone" type="tel" placeholder="+234 ..." />
            </Section>

            <Section title="Shipping Address">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="First name" />
                <Field label="Last name" />
              </div>
              <Field label="Address" />
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="City" />
                <Field label="State" />
              </div>
            </Section>

            <Section title="Payment">
              <Field label="Card number" placeholder="•••• •••• •••• ••••" />
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Expiry" placeholder="MM/YY" />
                <Field label="CVC" placeholder="123" />
              </div>
              <p className="text-xs text-foreground/50">Payments are demo-only in this preview.</p>
            </Section>

            <button className="w-full bg-black text-white px-8 py-4 text-xs tracking-luxe uppercase font-semibold hover:bg-gold hover:text-black transition-colors">
              Place order
            </button>
          </form>

          <aside className="bg-muted/40 p-7 h-fit">
            <h2 className="font-display text-xl mb-4">Summary</h2>
            <p className="text-sm text-foreground/70">2 items in your cart</p>
            <div className="border-t border-border my-4" />
            <div className="flex justify-between text-sm py-1.5"><span>Subtotal</span><span>₦450,000</span></div>
            <div className="flex justify-between text-sm py-1.5"><span>Shipping</span><span>Free</span></div>
            <div className="border-t border-border my-3" />
            <div className="flex justify-between font-semibold text-base"><span>Total</span><span>₦450,000</span></div>
            <Link to="/cart" className="mt-5 block text-center text-xs tracking-luxe uppercase text-foreground/60 hover:text-foreground">
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

function Field({ label, type = "text", placeholder }: { label: string; type?: string; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-[10px] tracking-luxe uppercase text-foreground/60 block mb-1.5">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full border border-border px-4 py-3 text-sm focus:border-gold focus:outline-none"
      />
    </label>
  );
}
