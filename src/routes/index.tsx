import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  CreditCard,
  Headphones,
  Sparkles,
  Undo2,
  Heart,
  Eye,
  Star,
} from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { SectionHeading, SectionEyebrow } from "@/components/site/Section";

import hero from "@/assets/hero.jpg";
import catMen from "@/assets/cat-men.jpg";
import catWomen from "@/assets/cat-women.jpg";
import catWatches from "@/assets/cat-watches.jpg";
import catShoes from "@/assets/cat-shoes.jpg";
import catBags from "@/assets/cat-bags.jpg";
import catBelts from "@/assets/cat-belts.jpg";
import catJewelry from "@/assets/cat-jewelry.jpg";
import catAccessories from "@/assets/cat-accessories.jpg";
import storyImg from "@/assets/story.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PAUL BILLIONS — Luxury Clothing & Accessories Nigeria" },
      {
        name: "description",
        content:
          "Discover premium clothing, luxury watches and fashion accessories. PAUL BILLIONS delivers affordable luxury across Nigeria.",
      },
      {
        property: "og:title",
        content: "PAUL BILLIONS — Wear Confidence. Define Your Style.",
      },
      {
        property: "og:description",
        content:
          "Premium clothing and accessories crafted for individuals who appreciate quality, elegance, and timeless style.",
      },
    ],
  }),
  component: Home,
});

const CATEGORIES = [
  { name: "Men's Fashion", img: catMen, to: "/men" },
  { name: "Women's Fashion", img: catWomen, to: "/women" },
  { name: "Watches", img: catWatches, to: "/shop" },
  { name: "Shoes", img: catShoes, to: "/shop" },
  { name: "Bags", img: catBags, to: "/shop" },
  { name: "Belts", img: catBelts, to: "/shop" },
  { name: "Jewelry", img: catJewelry, to: "/shop" },
  { name: "Accessories", img: catAccessories, to: "/accessories" },
];

const PRODUCTS = [
  { id: 1, name: "Onyx Double-Breasted Blazer", price: 185000, was: 220000, img: catMen, rating: 5, tag: "Bestseller" },
  { id: 2, name: "Midnight Silk Evening Gown", price: 240000, was: null, img: catWomen, rating: 5, tag: "New" },
  { id: 3, name: "Imperial Gold Automatic Watch", price: 320000, was: 380000, img: catWatches, rating: 5, tag: "-16%" },
  { id: 4, name: "Noir Leather Oxfords", price: 95000, was: null, img: catShoes, rating: 4, tag: null },
  { id: 5, name: "Atelier Tote — Black & Gold", price: 145000, was: 175000, img: catBags, rating: 5, tag: "-17%" },
  { id: 6, name: "Signature Gold-Buckle Belt", price: 48000, was: null, img: catBelts, rating: 5, tag: null },
  { id: 7, name: "Sovereign Chain Necklace", price: 72000, was: 89000, img: catJewelry, rating: 4, tag: "Limited" },
  { id: 8, name: "Heritage Cufflinks Set", price: 35000, was: null, img: catAccessories, rating: 5, tag: null },
];

const REVIEWS = [
  {
    name: "Adaeze O.",
    city: "Lagos",
    text: "The quality is undeniable. My Paul Billions blazer turns heads every single time. Worth every naira.",
  },
  {
    name: "Chuka E.",
    city: "Abuja",
    text: "Delivery was lightning fast and the watch is even more beautiful in person. This is my new go-to brand.",
  },
  {
    name: "Tomi A.",
    city: "Port Harcourt",
    text: "Luxury without the absurd markup. The fit, the finish, the packaging — everything feels considered.",
  },
];

function Home() {
  return (
    <PageShell>
      <Hero />
      <BrandStrip />
      <Categories />
      <WhyChoose />
      <BestSellers />
      <FlashSale />
      <BrandStory />
      <Testimonials />
      <InstagramGallery />
    </PageShell>
  );
}

/* ---------- HERO ---------- */
function Hero() {
  return (
    <section className="relative bg-black text-white overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={hero}
          alt="PAUL BILLIONS luxury fashion editorial"
          width={1536}
          height={1920}
          className="h-full w-full object-cover object-center opacity-70 lg:opacity-90"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/20 lg:via-black/40" />
      </div>

      <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 py-24 sm:py-32 lg:py-44 min-h-[80vh] flex items-center">
        <div className="max-w-2xl fade-up">
          <p className="text-[11px] tracking-luxe uppercase text-gold mb-6">
            Luxury Fashion & Accessories
          </p>
          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl leading-[1.02] font-semibold">
            Wear Confidence.<br />
            <span className="italic text-gold font-normal">Define</span> Your Style.
          </h1>
          <p className="mt-6 text-sm sm:text-base text-white/80 max-w-xl leading-relaxed">
            Discover premium clothing and accessories crafted for individuals
            who appreciate quality, elegance, and timeless style. From statement
            watches to fashionable apparel, PAUL BILLIONS delivers sophistication
            to every wardrobe.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link
              to="/shop"
              className="group inline-flex items-center justify-center gap-2 bg-gold text-black px-8 py-4 text-xs tracking-luxe uppercase font-semibold hover:bg-white transition-colors"
            >
              Shop Collection
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/new-arrivals"
              className="inline-flex items-center justify-center gap-2 border border-white/70 text-white px-8 py-4 text-xs tracking-luxe uppercase hover:bg-white hover:text-black transition-colors"
            >
              Explore New Arrivals
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- BRAND STRIP (marquee) ---------- */
function BrandStrip() {
  const items = [
    "AFFORDABLE LUXURY",
    "CRAFTED IN DETAIL",
    "TIMELESS ELEGANCE",
    "NATIONWIDE DELIVERY",
    "AUTHENTIC QUALITY",
    "BLACK · GOLD · WHITE",
  ];
  return (
    <div className="bg-black text-white py-4 overflow-hidden border-y border-white/10">
      <div className="flex whitespace-nowrap marquee-track">
        {[...items, ...items].map((t, i) => (
          <span
            key={i}
            className="mx-8 text-[11px] tracking-luxe uppercase text-white/70 flex items-center gap-8"
          >
            {t}
            <span className="text-gold">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------- CATEGORIES ---------- */
function Categories() {
  return (
    <section className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 py-20 lg:py-28">
      <SectionHeading
        eyebrow="Curated Categories"
        title="Shop By Category"
        description="Eight curated worlds of luxury — built for the man and woman who refuse to blend in."
      />

      <div className="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {CATEGORIES.map((c) => (
          <Link
            to={c.to}
            key={c.name}
            className="group relative aspect-[3/4] overflow-hidden bg-muted block"
          >
            <img
              src={c.img}
              alt={c.name}
              width={800}
              height={1024}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover hover-zoom-img"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 text-white">
              <p className="text-[10px] tracking-luxe uppercase text-gold mb-1">
                Shop
              </p>
              <h3 className="font-display text-lg sm:text-xl">{c.name}</h3>
              <div className="mt-2 inline-flex items-center gap-1 text-xs opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
                Explore <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ---------- WHY CHOOSE ---------- */
function WhyChoose() {
  const items = [
    { icon: Sparkles, title: "Premium Quality", desc: "Hand-selected fabrics and finishes." },
    { icon: Truck, title: "Nationwide Delivery", desc: "Fast, tracked shipping across Nigeria." },
    { icon: CreditCard, title: "Secure Payments", desc: "Encrypted checkout you can trust." },
    { icon: Headphones, title: "Trusted Service", desc: "Concierge-level customer care." },
    { icon: ShieldCheck, title: "Affordable Luxury", desc: "Designer quality, fairer prices." },
    { icon: Undo2, title: "Easy Returns", desc: "7-day hassle-free returns policy." },
  ];
  return (
    <section className="bg-secondary/50 border-y border-border">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 py-20 lg:py-28">
        <SectionHeading
          eyebrow="Why PAUL BILLIONS"
          title="Luxury Meets Quality"
          description="We carefully select premium fashion pieces that combine quality, comfort, and sophistication — to help you express confidence through timeless style."
        />
        <div className="mt-12 grid grid-cols-2 lg:grid-cols-3 gap-px bg-border">
          {items.map((it) => (
            <div
              key={it.title}
              className="bg-background p-6 sm:p-8 flex flex-col items-start gap-3 hover-lift"
            >
              <div className="h-12 w-12 grid place-items-center border border-gold/40 text-gold">
                <it.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg">{it.title}</h3>
              <p className="text-sm text-muted-foreground">{it.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- BEST SELLERS ---------- */
function BestSellers() {
  return (
    <section className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 py-20 lg:py-28">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
        <div>
          <SectionEyebrow>Best Sellers</SectionEyebrow>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl mt-2 leading-tight">
            Most loved this season.
          </h2>
        </div>
        <Link
          to="/shop"
          className="text-xs tracking-luxe uppercase border-b border-foreground pb-1 hover:text-gold hover:border-gold transition-colors self-start sm:self-auto"
        >
          View All →
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {PRODUCTS.map((p) => (
          <ProductCard key={p.id} p={p} />
        ))}
      </div>
    </section>
  );
}

function ProductCard({ p }: { p: (typeof PRODUCTS)[number] }) {
  return (
    <div className="group">
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        <img
          src={p.img}
          alt={p.name}
          width={800}
          height={1024}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover hover-zoom-img"
        />
        {p.tag && (
          <span className="absolute top-3 left-3 bg-gold text-black text-[10px] tracking-luxe uppercase px-2 py-1 font-semibold">
            {p.tag}
          </span>
        )}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button aria-label="Wishlist" className="h-9 w-9 bg-white/95 hover:bg-gold hover:text-black grid place-items-center text-foreground transition">
            <Heart className="h-4 w-4" />
          </button>
          <button aria-label="Quick view" className="h-9 w-9 bg-white/95 hover:bg-gold hover:text-black grid place-items-center text-foreground transition">
            <Eye className="h-4 w-4" />
          </button>
        </div>
        <button className="absolute inset-x-3 bottom-3 bg-black text-white text-xs tracking-luxe uppercase py-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all hover:bg-gold hover:text-black">
          Add to Cart
        </button>
      </div>
      <div className="pt-4">
        <div className="flex items-center gap-0.5 text-gold mb-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={["h-3 w-3", i < p.rating ? "fill-current" : "opacity-30"].join(" ")}
            />
          ))}
        </div>
        <h3 className="text-sm font-medium leading-snug">{p.name}</h3>
        <p className="mt-1 text-sm">
          <span className="font-semibold">₦{p.price.toLocaleString()}</span>
          {p.was && (
            <span className="ml-2 text-muted-foreground line-through text-xs">
              ₦{p.was.toLocaleString()}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

/* ---------- FLASH SALE ---------- */
function FlashSale() {
  const [t, setT] = useState({ h: 12, m: 0, s: 0 });
  useEffect(() => {
    const target = Date.now() + (12 * 60 * 60 + 0 * 60 + 0) * 1000;
    const id = setInterval(() => {
      const diff = Math.max(0, target - Date.now());
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1000);
      setT({ h, m, s });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const Block = ({ v, l }: { v: number; l: string }) => (
    <div className="text-center">
      <div className="font-display text-3xl sm:text-5xl text-gold tabular-nums">
        {String(v).padStart(2, "0")}
      </div>
      <div className="text-[10px] tracking-luxe uppercase text-white/60 mt-1">{l}</div>
    </div>
  );

  return (
    <section className="bg-black text-white">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 py-20 lg:py-28 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <SectionEyebrow>Flash Sale · Today Only</SectionEyebrow>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl mt-3 leading-[1.05]">
            Up to <span className="text-gold">40% off</span><br />
            select luxury pieces.
          </h2>
          <p className="mt-5 text-white/70 max-w-md text-sm sm:text-base">
            A limited selection of our best-loved silhouettes, available at exceptional prices for the next few hours only.
          </p>
          <Link
            to="/shop"
            className="mt-8 inline-flex items-center gap-2 bg-gold text-black px-8 py-4 text-xs tracking-luxe uppercase font-semibold hover:bg-white transition-colors"
          >
            Shop the Sale <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="bg-white/5 border border-white/10 p-8 sm:p-12 backdrop-blur">
          <p className="text-[11px] tracking-luxe uppercase text-gold mb-6 text-center">
            Sale Ends In
          </p>
          <div className="grid grid-cols-3 gap-4 sm:gap-8">
            <Block v={t.h} l="Hours" />
            <Block v={t.m} l="Minutes" />
            <Block v={t.s} l="Seconds" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- BRAND STORY ---------- */
function BrandStory() {
  return (
    <section className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 py-20 lg:py-28 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
      <div className="relative order-2 lg:order-1">
        <img
          src={storyImg}
          alt="PAUL BILLIONS brand story"
          width={1400}
          height={1024}
          loading="lazy"
          className="w-full aspect-[4/5] object-cover"
        />
        <div className="hidden lg:block absolute -bottom-6 -right-6 h-40 w-40 border-2 border-gold -z-10" />
      </div>
      <div className="order-1 lg:order-2">
        <SectionEyebrow>Our Story</SectionEyebrow>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl mt-3 leading-tight">
          The story behind<br />
          <span className="italic text-gold">PAUL BILLIONS.</span>
        </h2>
        <p className="mt-6 text-muted-foreground leading-relaxed">
          PAUL BILLIONS Clothing & Accessories was created for individuals who
          believe style is an expression of confidence. We provide premium
          clothing and accessories designed to elevate everyday fashion and
          inspire timeless elegance.
        </p>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          From statement watches to sharply tailored apparel, every piece is
          chosen with intention — to help you look, and feel, like the most
          composed person in the room.
        </p>
        <Link
          to="/about"
          className="mt-8 inline-flex items-center gap-2 border-b border-foreground pb-1 text-xs tracking-luxe uppercase hover:text-gold hover:border-gold"
        >
          Read Our Story <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

/* ---------- TESTIMONIALS ---------- */
function Testimonials() {
  return (
    <section className="bg-secondary/50 border-y border-border">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 py-20 lg:py-28">
        <SectionHeading
          eyebrow="Client Voices"
          title="Loved by tastemakers."
        />
        <div className="mt-14 grid md:grid-cols-3 gap-6">
          {REVIEWS.map((r) => (
            <figure
              key={r.name}
              className="bg-background border border-border p-8 hover-lift"
            >
              <div className="flex gap-0.5 text-gold mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <blockquote className="font-display text-lg leading-relaxed">
                “{r.text}”
              </blockquote>
              <figcaption className="mt-6 text-xs tracking-luxe uppercase text-muted-foreground">
                {r.name} · {r.city}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- INSTAGRAM ---------- */
function InstagramGallery() {
  const imgs = [catMen, catWatches, catWomen, catBags, catShoes, catJewelry];
  return (
    <section className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 py-20 lg:py-28">
      <SectionHeading
        eyebrow="@paulbillions"
        title="Follow the journal."
        description="Real-time looks, behind-the-scenes, and styling inspiration from the PAUL BILLIONS community."
      />
      <div className="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {imgs.map((src, i) => (
          <a
            key={i}
            href="#"
            className="group relative aspect-square overflow-hidden bg-muted"
          >
            <img
              src={src}
              alt={`Instagram post ${i + 1}`}
              width={400}
              height={400}
              loading="lazy"
              className="h-full w-full object-cover hover-zoom-img"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
          </a>
        ))}
      </div>
    </section>
  );
}
