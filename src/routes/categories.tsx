import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";
import { categories } from "@/lib/mock-products";

export const Route = createFileRoute("/categories")({
  component: CategoriesPage,
  head: () => ({
    meta: [
      { title: "Categories — Paul Billions" },
      { name: "description", content: "Explore our luxury fashion categories." },
    ],
  }),
});

function CategoriesPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-[1400px] px-4 sm:px-8 py-10 sm:py-14">
        <div className="text-center mb-12">
          <p className="text-[11px] tracking-luxe uppercase text-gold mb-3">Browse</p>
          <h1 className="font-display text-4xl sm:text-5xl">All Categories</h1>
        </div>

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
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
                <p className="text-white font-display text-xl sm:text-3xl">{c.name}</p>
                <p className="text-gold text-[11px] tracking-luxe uppercase mt-1.5">Shop now →</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
