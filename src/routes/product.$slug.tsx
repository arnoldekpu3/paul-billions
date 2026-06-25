import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart, ShoppingBag, Minus, Plus, Star } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { ProductCard } from "@/routes/index";
import { getProduct, products, formatNaira, type Product } from "@/lib/mock-products";
import { useCart } from "@/lib/use-cart";
import { useAuth } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const { add } = useCart();
  const { user } = useAuth();
  const [adding, setAdding] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);

  const related = products.filter((p) => p.category === product.category && p.slug !== product.slug).slice(0, 4);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("wishlist_items")
      .select("id")
      .eq("user_id", user.id)
      .eq("product_slug", product.slug)
      .maybeSingle()
      .then(({ data }) => setInWishlist(!!data));
  }, [user, product.slug]);

  async function addToCart() {
    setAdding(true);
    await add(product.slug, qty, size, color);
    setAdding(false);
    toast.success(`${product.name} added to cart`);
  }

  async function toggleWishlist() {
    if (!user) return toast.error("Sign in to use your wishlist");
    if (inWishlist) {
      await supabase.from("wishlist_items").delete().eq("user_id", user.id).eq("product_slug", product.slug);
      setInWishlist(false);
      toast.success("Removed from wishlist");
    } else {
      await supabase.from("wishlist_items").insert({
        user_id: user.id,
        product_slug: product.slug,
        product_name: product.name,
        product_image: product.image,
        unit_price_kobo: product.price * 100,
      } as any);
      setInWishlist(true);
      toast.success("Added to wishlist");
    }
  }

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

          <div className="lg:py-6">
            <p className="text-[11px] tracking-luxe uppercase text-gold mb-3">{product.category}</p>
            <h1 className="font-display text-3xl sm:text-4xl mb-3">{product.name}</h1>
            <p className="text-2xl text-foreground mb-8">{formatNaira(product.price)}</p>

            <div className="mb-6">
              <p className="text-[11px] tracking-luxe uppercase text-foreground/70 mb-3">Size</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button key={s} onClick={() => setSize(s)} className={`min-w-12 px-4 py-2.5 text-sm border transition ${size === s ? "bg-black text-white border-black" : "border-border hover:border-foreground"}`}>{s}</button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <p className="text-[11px] tracking-luxe uppercase text-foreground/70 mb-3">Color: <span className="text-foreground">{color}</span></p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button key={c} onClick={() => setColor(c)} className={`px-4 py-2.5 text-sm border transition ${color === c ? "bg-black text-white border-black" : "border-border hover:border-foreground"}`}>{c}</button>
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
              <button onClick={addToCart} disabled={adding} className="flex-1 bg-black text-white px-8 py-4 text-xs tracking-luxe uppercase font-semibold hover:bg-gold hover:text-black transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-50">
                <ShoppingBag className="h-4 w-4" /> {adding ? "Adding…" : "Add to cart"}
              </button>
              <button onClick={toggleWishlist} className={`border px-6 py-4 text-xs tracking-luxe uppercase font-semibold transition inline-flex items-center justify-center gap-2 ${inWishlist ? "border-gold text-gold" : "border-border hover:border-gold hover:text-gold"}`}>
                <Heart className={`h-4 w-4 ${inWishlist ? "fill-gold" : ""}`} /> {inWishlist ? "Saved" : "Wishlist"}
              </button>
            </div>

            <div className="mt-10 pt-8 border-t border-border space-y-3 text-sm text-foreground/70">
              <p>· Complimentary delivery on orders over ₦150,000</p>
              <p>· Easy 14-day returns</p>
              <p>· Authentic luxury, hand-finished</p>
            </div>
          </div>
        </div>

        <ReviewsSection slug={product.slug} />

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

function ReviewsSection({ slug }: { slug: string }) {
  const { user } = useAuth();
  const [list, setList] = useState<any[]>([]);
  const [mine, setMine] = useState<any | null>(null);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  async function refresh() {
    const { data } = await supabase.from("reviews").select("*").eq("product_slug", slug).order("created_at", { ascending: false });
    setList(data ?? []);
    if (user) {
      const m = (data ?? []).find((r: any) => r.user_id === user.id);
      setMine(m ?? null);
      if (m) { setRating(m.rating); setTitle(m.title ?? ""); setBody(m.body ?? ""); }
    }
  }
  useEffect(() => { refresh(); }, [slug, user]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return toast.error("Sign in to write a review");
    const payload = { user_id: user.id, product_slug: slug, rating, title, body };
    if (mine) {
      const { error } = await supabase.from("reviews").update(payload).eq("id", mine.id);
      if (error) return toast.error(error.message);
    } else {
      const { error } = await supabase.from("reviews").insert(payload as any);
      if (error) return toast.error(error.message);
    }
    toast.success("Thanks for your review");
    refresh();
  }

  async function del() {
    if (!mine) return;
    await supabase.from("reviews").delete().eq("id", mine.id);
    setMine(null); setTitle(""); setBody(""); setRating(5);
    refresh();
  }

  const avg = list.length ? list.reduce((s, r) => s + r.rating, 0) / list.length : 0;

  return (
    <section className="mt-20 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl">Reviews</h2>
        {list.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => <Star key={s} className={`h-4 w-4 ${s <= Math.round(avg) ? "fill-gold text-gold" : "text-foreground/30"}`} />)}
            </div>
            <span className="text-foreground/70">{avg.toFixed(1)} · {list.length}</span>
          </div>
        )}
      </div>

      {user ? (
        <form onSubmit={submit} className="border border-border p-5 mb-8 space-y-3">
          <p className="text-xs tracking-luxe uppercase text-foreground/60">{mine ? "Edit your review" : "Write a review"}</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button type="button" key={s} onClick={() => setRating(s)}>
                <Star className={`h-5 w-5 ${s <= rating ? "fill-gold text-gold" : "text-foreground/30"}`} />
              </button>
            ))}
          </div>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="w-full border border-border px-3 py-2 text-sm focus:border-gold focus:outline-none" />
          <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Your thoughts…" rows={3} className="w-full border border-border px-3 py-2 text-sm focus:border-gold focus:outline-none" />
          <div className="flex gap-3">
            <button className="bg-black text-white px-5 py-2.5 text-xs tracking-luxe uppercase hover:bg-gold hover:text-black">{mine ? "Update" : "Submit"}</button>
            {mine && <button type="button" onClick={del} className="text-xs tracking-luxe uppercase text-foreground/60 hover:text-red-600">Delete</button>}
          </div>
        </form>
      ) : (
        <p className="text-sm text-foreground/60 mb-8"><Link to="/login" className="text-gold underline">Sign in</Link> to write a review.</p>
      )}

      <div className="space-y-5">
        {list.map((r) => (
          <div key={r.id} className="border-b border-border pb-5">
            <div className="flex gap-0.5 mb-1">
              {[1, 2, 3, 4, 5].map((s) => <Star key={s} className={`h-3.5 w-3.5 ${s <= r.rating ? "fill-gold text-gold" : "text-foreground/30"}`} />)}
            </div>
            {r.title && <p className="text-sm font-medium">{r.title}</p>}
            <p className="text-sm text-foreground/70 mt-1">{r.body}</p>
            <p className="text-xs text-foreground/50 mt-1">{new Date(r.created_at).toLocaleDateString()}</p>
          </div>
        ))}
        {list.length === 0 && <p className="text-sm text-foreground/60">No reviews yet — be the first.</p>}
      </div>
    </section>
  );
}
