import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { ProductCard } from "@/routes/index";
import { categories, products } from "@/lib/mock-products";

type ShopSearch = {
  category?: string;
};

export const Route = createFileRoute("/shop")({
  validateSearch: (s: Record<string, unknown>): ShopSearch => ({
    category: typeof s.category === "string" ? s.category : undefined,
  }),
  component: ShopPage,
  head: () => ({
    meta: [
      { title: "Shop — Paul Billions" },
      { name: "description", content: "Browse our full collection of luxury fashion." },
    ],
  }),
});

const ALL_SIZES = ["XS", "S", "M", "L", "XL", "40", "41", "42", "43", "44", "45", "One Size"];
const ALL_COLORS = ["Black", "White", "Gold", "Brown", "Ivory", "Silver", "Camel", "Charcoal", "Indigo", "Nude"];
const PRICE_BUCKETS = [
  { label: "All prices", min: 0, max: Infinity },
  { label: "Under ₦100k", min: 0, max: 100000 },
  { label: "₦100k – ₦200k", min: 100000, max: 200000 },
  { label: "₦200k – ₦400k", min: 200000, max: 400000 },
  { label: "Above ₦400k", min: 400000, max: Infinity },
];

function ShopPage() {
  const { category } = Route.useSearch();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>(category ?? "all");
  const [size, setSize] = useState<string>("all");
  const [color, setColor] = useState<string>("all");
  const [priceIdx, setPriceIdx] = useState(0);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q.toLowerCase())) return false;
      if (cat !== "all" && p.category !== cat) return false;
      if (size !== "all" && !p.sizes.includes(size)) return false;
      if (color !== "all" && !p.colors.includes(color)) return false;
      const b = PRICE_BUCKETS[priceIdx];
      if (p.price < b.min || p.price > b.max) return false;
      return true;
    });
  }, [q, cat, size, color, priceIdx]);

  return (
    <PageShell>
      <div className="mx-auto max-w-[1400px] px-4 sm:px-8 py-10 sm:py-14">
        <div className="text-center mb-10">
          <p className="text-[11px] tracking-luxe uppercase text-gold mb-3">Shop</p>
          <h1 className="font-display text-4xl sm:text-5xl">All Products</h1>
        </div>

        {/* Search */}
        <div className="relative max-w-xl mx-auto mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/50" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products..."
            className="w-full border border-border pl-11 pr-4 py-3 text-sm focus:border-gold focus:outline-none"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          <Select label="Category" value={cat} onChange={setCat} options={[{ value: "all", label: "All categories" }, ...categories.map((c) => ({ value: c.slug, label: c.name }))]} />
          <Select label="Price" value={String(priceIdx)} onChange={(v) => setPriceIdx(Number(v))} options={PRICE_BUCKETS.map((b, i) => ({ value: String(i), label: b.label }))} />
          <Select label="Size" value={size} onChange={setSize} options={[{ value: "all", label: "All sizes" }, ...ALL_SIZES.map((s) => ({ value: s, label: s }))]} />
          <Select label="Color" value={color} onChange={setColor} options={[{ value: "all", label: "All colors" }, ...ALL_COLORS.map((c) => ({ value: c, label: c }))]} />
        </div>

        <p className="text-xs tracking-luxe uppercase text-foreground/60 mb-6">{filtered.length} products</p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {filtered.map((p) => <ProductCard key={p.slug} p={p} />)}
        </div>

        {filtered.length === 0 && (
          <div className="py-20 text-center text-foreground/60">
            No products match your filters.
          </div>
        )}
      </div>
    </PageShell>
  );
}

function Select({ label, value, onChange, options }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="text-[10px] tracking-luxe uppercase text-foreground/60 block mb-1.5">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-border px-3 py-2.5 text-sm bg-white focus:border-gold focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}
