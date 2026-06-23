# Paul Billions — Redesign + Backend Plan

This is a large scope, so I'll execute in 3 phases. Each phase ends in a working preview you can review before the next.

## Phase 1 — Simplify & Redesign (frontend only)

Strip the site down to the 9 pages you listed. Black / white / gold, Apple-like minimal, Zara/H&M energy.

**Pages kept:** Home, Shop, Categories, Product Details, Cart, Checkout, Login/Sign Up, My Account, Contact.
**Pages removed:** About, New Arrivals (as standalone), Collections, Men, Women, Accessories (these collapse into Shop with filters).

**Nav:** Home · Shop · Categories · Contact · Account (mobile hamburger + cart icon).

**Home:**
- Hero: full-bleed image, big headline "Paul Billions Clothings & Accessories", sub "Luxury Fashion, Delivered to Your Door", two CTAs "Shop Men" / "Shop Women".
- Category cards (6): Men's Wear, Women's Wear, Shoes, Bags, Watches, Accessories.
- New Arrivals strip (horizontal scroll on mobile).
- Best Sellers grid.
- Customer Reviews (3-up testimonials).
- Minimal footer.

**Shop:** search bar, filters (category / price / size / color), responsive product grid.
**Categories:** clean grid of all category tiles.
**Product Details:** gallery, name, price, size, color, qty, Add to Cart, Add to Wishlist, related products.
**Cart:** list, qty controls, total, checkout CTA.
**Checkout:** single-page (shipping → payment → review) — stubbed until Phase 3.
**Login / Sign Up:** email + Google buttons.
**My Account:** profile, orders, wishlist tabs.
**Contact:** keep existing, simplify.

**Design system:**
- Black `#000`, White `#fff`, Gold `#D4AF37`, Dark gray `#1B1B1B`.
- Typography: Playfair Display (display) + Inter (body), generous spacing.
- Remove marquee, flash-sale countdown, Instagram gallery, WhatsApp float, brand-story section — all clutter.

## Phase 2 — Database + Auth

Lovable Cloud tables:
- `categories` (slug, name, image)
- `products` (name, slug, description, price, category_id, sizes[], colors[], images[], is_featured, is_new)
- `profiles` (user_id → auth.users, full_name, avatar_url, phone)
- `orders` + `order_items`
- `reviews` (product_id, user_id, rating, body)
- `wishlists` (user_id, product_id)

Storage buckets: `product-images` (public), `avatars` (public).
Auth: email/password + Google (managed). RLS on everything; `service_role` grants; `anon` SELECT only on products/categories/reviews.

Wire Shop, Product Details, Categories, Account, Wishlist, Reviews to the DB. Seed a handful of demo products.

## Phase 3 — Checkout & Orders

Cart persistence (local for guests, DB for signed-in), checkout creates an order, "My Orders" shows history. Real payment provider (Stripe/Paddle) is optional — say the word and I'll wire it.

---

## What I need from you

1. **Start with Phase 1 now?** (Yes = I redesign the frontend this turn. Phase 2 + 3 follow in later turns so each is reviewable.)
2. **Google login** — confirm you want it enabled in Phase 2 (managed OAuth, no setup needed from you).
3. **Real payments in Phase 3?** Stripe / Paddle / skip for now.

Reply "go" to start Phase 1 with the defaults above.
