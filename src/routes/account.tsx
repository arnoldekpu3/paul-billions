import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell } from "@/components/site/PageShell";
import { ProductCard } from "@/routes/index";
import { products } from "@/lib/mock-products";

export const Route = createFileRoute("/account")({
  component: AccountPage,
  head: () => ({ meta: [{ title: "My Account — Paul Billions" }] }),
});

const TABS = ["Profile", "Orders", "Wishlist"] as const;

function AccountPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Profile");

  return (
    <PageShell>
      <div className="mx-auto max-w-[1100px] px-4 sm:px-8 py-10 sm:py-14">
        <div className="mb-10">
          <p className="text-[11px] tracking-luxe uppercase text-gold mb-3">Welcome back</p>
          <h1 className="font-display text-4xl sm:text-5xl">My Account</h1>
          <p className="text-sm text-foreground/60 mt-3">
            Not signed in?{" "}
            <Link to="/login" className="text-gold underline">Sign in</Link>
          </p>
        </div>

        <div className="flex gap-6 border-b border-border mb-10 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-4 text-xs tracking-luxe uppercase whitespace-nowrap ${
                tab === t ? "border-b-2 border-gold text-foreground -mb-px" : "text-foreground/60"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "Profile" && (
          <form className="max-w-lg space-y-4" onSubmit={(e) => e.preventDefault()}>
            <Field label="Full name" defaultValue="Guest User" />
            <Field label="Email" type="email" defaultValue="" />
            <Field label="Phone" type="tel" />
            <button className="bg-black text-white px-8 py-3.5 text-xs tracking-luxe uppercase font-semibold hover:bg-gold hover:text-black transition">
              Save changes
            </button>
          </form>
        )}

        {tab === "Orders" && (
          <div className="py-12 text-center text-foreground/60">
            You haven't placed any orders yet.{" "}
            <Link to="/shop" className="text-gold underline">Start shopping</Link>
          </div>
        )}

        {tab === "Wishlist" && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.slice(0, 4).map((p) => <ProductCard key={p.slug} p={p} />)}
          </div>
        )}
      </div>
    </PageShell>
  );
}

function Field({ label, type = "text", defaultValue }: { label: string; type?: string; defaultValue?: string }) {
  return (
    <label className="block">
      <span className="text-[10px] tracking-luxe uppercase text-foreground/60 block mb-1.5">{label}</span>
      <input type={type} defaultValue={defaultValue} className="w-full border border-border px-4 py-3 text-sm focus:border-gold focus:outline-none" />
    </label>
  );
}
