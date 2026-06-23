import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";
import { categories, products, formatNaira } from "@/lib/mock-products";
import heroImg from "@/assets/hero.jpg";
import { Star } from "lucide-react";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "Paul Billions Clothings & Accessories — Luxury Fashion" },
      { name: "description", content: "Luxury fashion, delivered to your door. Shop premium clothing, shoes, bags, watches and accessories." },
    ],
  }),
});

function HomePage() {
  const newArrivals = products.filter((p) => p.isNew).slice(0, 6);
  const bestSellers = products.filter((p) => p.isBest).slice(0, 4);

  return (
    <PageShell>
      {/* HERO */}
      <section className="relative h-[88vh] min-h-[560px] w-full overflow-hidden">
        <img src={heroImg} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/70" />
        <div className="relative h-full mx-auto max-w-[1400px] px-4 sm:px-8 flex flex-col justify-center text-white">
          <p className="text-[11px] tracking-luxe uppercase text-gold mb-5 fade-up">Est. Lagos · Nigeria</p>
          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl leading-[1.05] max-w-3xl fade-up">
            Paul Billions Clothings<br /><span className="text-gold">& Accessories</span>
          </h1>
          <p className="mt-6 text-base sm:text-lg text-white/85 max-w-xl fade-up">
            Luxury fashion, delivered to your door.
          </p>
          <div className="mt-9 flex flex-wrap gap-3 fade-up">
            <Link
              to="/shop"
              search={{ category: "men" } as never}
              className="bg-white text-black px-8 py-4 text-xs tracking-luxe uppercase font-semibold hover:bg-gold transition-colors"
            >
              Shop Men
            </Link>
            <Link
              to="/shop"
              search={{ category: "women" } as never}
              className="border border-white text-white px-8 py-4 text-xs tracking-luxe uppercase font-semibold hover:bg-white hover:text-black transition-colors"
            >
              Shop Women
            </Link>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <Section
        eyebrow="Shop by category"
        title="Curated Collections"
      >
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
          {categories.map((c) => (
            <Link
              key={c.slug}
              to="/shop"
              search={{ category: c.slug } as never}
              className="group relative aspect-[4/5] overflow-hidden bg-muted"
            >
              <img src={c.image} alt={c.name} className="absolute inset-0 w-full h-full object-cover hover-zoom-img" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                <p className="text-white font-display text-lg sm:text-2xl">{c.name}</p>
                <p className="text-gold text-[11px] tracking-luxe uppercase mt-1">Shop now →</p>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* NEW ARRIVALS */}
      <Section eyebrow="Just in" title="New Arrivals">
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 lg:grid-cols-6 snap-x">
          {newArrivals.map((p) => (
            <ProductCard key={p.slug} p={p} className="min-w-[60%] sm:min-w-0 snap-start" />
          ))}
        </div>
      </Section>

      {/* BEST SELLERS */}
      <Section eyebrow="Loved by clients" title="Best Sellers">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {bestSellers.map((p) => (
            <ProductCard key={p.slug} p={p} />
          ))}
        </div>
      </Section>

      {/* REVIEWS */}
      <Section eyebrow="Customer reviews" title="What our clients say">
        <div className="grid md:grid-cols-3 gap-5">
          {REVIEWS.map((r, i) => (
            <div key={i} className="border border-border p-7">
              <div className="flex gap-0.5 text-gold mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="text-foreground/80 leading-relaxed text-sm">"{r.body}"</p>
              <p className="mt-5 text-[11px] tracking-luxe uppercase text-foreground/60">— {r.name}</p>
            </div>
          ))}
        </div>
      </Section>

      <div className="h-10" />
    </PageShell>
  );
}

const REVIEWS = [
  { name: "Adaeze O.", body: "Impeccable tailoring and the delivery was seamless. The suit fits like it was made for me." },
  { name: "Tunde A.", body: "The watch is genuinely beautiful — feels luxurious in hand. Worth every naira." },
  { name: "Chioma E.", body: "I get compliments every single time I wear the gown. Paul Billions is now my go-to." },
];

function Section({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-[1400px] px-4 sm:px-8 py-16 sm:py-24">
      <div className="mb-10 sm:mb-14 text-center">
        <p className="text-[11px] tracking-luxe uppercase text-gold mb-3">{eyebrow}</p>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export function ProductCard({ p, className = "" }: { p: typeof products[number]; className?: string }) {
  return (
    <Link
      to="/product/$slug"
      params={{ slug: p.slug }}
      className={`group block ${className}`}
    >
      <div className="relative aspect-[3/4] bg-muted overflow-hidden mb-3">
        <img src={p.image} alt={p.name} className="absolute inset-0 w-full h-full object-cover hover-zoom-img" />
        {p.isNew && (
          <span className="absolute top-3 left-3 bg-gold text-black text-[10px] tracking-luxe uppercase px-2 py-1 font-semibold">
            New
          </span>
        )}
      </div>
      <h3 className="text-sm font-medium text-foreground line-clamp-1">{p.name}</h3>
      <p className="text-sm text-foreground/70 mt-1">{formatNaira(p.price)}</p>
    </Link>
  );
}
