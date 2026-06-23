import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, ShoppingBag, Minus, Plus } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { ProductCard } from "@/routes/index";
import { getProduct, products, formatNaira, type Product } from "@/lib/mock-products";

export const Route = createFileRoute("/product/$slug")({
  loader: ({ params }) => {
    const product = getProduct(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  component: ProductPage,
  notFoundComponent: () => (
    <PageShell>
      <div className="py-32 text-center">
        <h1 className="font-display text-4xl mb-4">Product not found</h1>
        <Link to="/shop" className="text-gold underline">Back to shop</Link>
      </div>
    </PageShell>
  ),
  errorComponent: ({ error }) => (
    <PageShell>
      <div className="py-32 text-center">
        <h1 className="font-display text-3xl mb-3">Something went wrong</h1>
        <p className="text-foreground/60 text-sm">{error.message}</p>
      </div>
    </PageShell>
  ),
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.product.name ?? "Product"} — Paul Billions` },
      { name: "description", content: `Shop ${loaderData?.product.name} at Paul Billions.` },
    ],
  }),
});

function ProductPage() {
  const { product } = Route.useLoaderData() as { product: Product };
  const [size, setSize] = useState(product.sizes[0]);
  const [color, setColor] = useState(product.colors[0]);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);

  const related = products.filter((p) => p.category === product.category && p.slug !== product.slug).slice(0, 4);

  return (
    <PageShell>
      <div className="mx-auto max-w-[1400px] px-4 sm:px-8 py-8 sm:py-12">
        <nav className="text-xs text-foreground/60 mb-6 tracking-luxe uppercase">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/shop" className="hover:text-foreground">Shop</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Gallery */}
          <div>
            <div className="aspect-[4/5] bg-muted overflow-hidden">
              <img src={product.images[activeImg]} alt={product.name} className="w-full h-full object-cover" />
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2 mt-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`aspect-square overflow-hidden border ${i === activeImg ? "border-gold" : "border-transparent"}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="lg:py-6">
            <p className="text-[11px] tracking-luxe uppercase text-gold mb-3">{product.category}</p>
            <h1 className="font-display text-3xl sm:text-4xl mb-3">{product.name}</h1>
            <p className="text-2xl text-foreground mb-8">{formatNaira(product.price)}</p>

            <div className="mb-6">
              <p className="text-[11px] tracking-luxe uppercase text-foreground/70 mb-3">Size</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`min-w-12 px-4 py-2.5 text-sm border transition ${
                      size === s ? "bg-black text-white border-black" : "border-border hover:border-foreground"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <p className="text-[11px] tracking-luxe uppercase text-foreground/70 mb-3">Color: <span className="text-foreground">{color}</span></p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`px-4 py-2.5 text-sm border transition ${
                      color === c ? "bg-black text-white border-black" : "border-border hover:border-foreground"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <p className="text-[11px] tracking-luxe uppercase text-foreground/70 mb-3">Quantity</p>
              <div className="inline-flex items-center border border-border">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-3 hover:bg-muted"><Minus className="h-4 w-4" /></button>
                <span className="w-12 text-center text-sm">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="p-3 hover:bg-muted"><Plus className="h-4 w-4" /></button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button className="flex-1 bg-black text-white px-8 py-4 text-xs tracking-luxe uppercase font-semibold hover:bg-gold hover:text-black transition-colors inline-flex items-center justify-center gap-2">
                <ShoppingBag className="h-4 w-4" /> Add to cart
              </button>
              <button className="border border-border px-6 py-4 text-xs tracking-luxe uppercase font-semibold hover:border-gold hover:text-gold transition inline-flex items-center justify-center gap-2">
                <Heart className="h-4 w-4" /> Wishlist
              </button>
            </div>

            <div className="mt-10 pt-8 border-t border-border space-y-3 text-sm text-foreground/70">
              <p>· Complimentary delivery on orders over ₦150,000</p>
              <p>· Easy 14-day returns</p>
              <p>· Authentic luxury, hand-finished</p>
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-24">
            <h2 className="font-display text-2xl sm:text-3xl mb-8 text-center">You may also like</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {related.map((p) => <ProductCard key={p.slug} p={p} />)}
            </div>
          </section>
        )}
      </div>
    </PageShell>
  );
}
