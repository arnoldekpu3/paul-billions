
# Super Admin (Developer) Role — Plan

Goal: layer a secure role-based admin system on top of the existing Paul Billions site without touching any current page, style, route, or behavior. Everything is additive.

## 1. Database (single migration)

New tables in `public` (each with proper GRANTs + RLS):

- `app_role` enum: `super_admin`, `admin`, `customer`
- `user_roles` (user_id → auth.users, role, assigned_by, assigned_at) — roles never live on profiles
- `profiles` (id → auth.users, full_name, avatar_url, phone, is_suspended, suspended_at, suspended_reason) — auto-created on signup via trigger
- `categories` (slug, name, description, image_url, sort_order, is_active)
- `products` (slug, name, description, price_kobo, compare_at_kobo, category_id, stock, images jsonb, is_featured, is_active, deleted_at) — soft delete
- `orders` (user_id, status, total_kobo, shipping jsonb, payment_status, notes)
- `order_items` (order_id, product_id, qty, unit_price_kobo, name_snapshot)
- `coupons` (code, kind, value, starts_at, ends_at, max_uses, used_count, is_active)
- `banners` (title, image_url, link, position, sort_order, is_active)
- `testimonials` (author, body, rating, is_approved)
- `newsletter_campaigns` (subject, body_html, status, scheduled_for, sent_at)
- `audit_logs` (actor_id, action, entity, entity_id, metadata jsonb, ip, user_agent, created_at)
- `login_history` (user_id, ip, user_agent, success, created_at)

Security-definer function `public.has_role(_user_id uuid, _role app_role)` — used in all admin policies to avoid recursive RLS.

RLS pattern:
- Public read (anon + authenticated) on `categories`, `products` (where `is_active and deleted_at is null`), approved `testimonials`, active `banners`.
- Owner-only on `profiles`, `orders`, `order_items`.
- `has_role(auth.uid(),'super_admin')` → full access on every table including `user_roles`, `audit_logs`, `login_history`.
- `admin` role → same as super_admin EXCEPT cannot touch `user_roles`, cannot delete other admins, cannot edit super_admins.

Triggers: `updated_at`, auto-create profile on signup, audit-log trigger on sensitive tables.

## 2. Bootstrapping the first Super Admin

A one-time server function `claimSuperAdmin` that promotes the currently signed-in user **only if no super_admin exists yet**. After the developer signs in once and clicks "Claim", the function is permanently inert. No hardcoded emails, no env-based bypass.

## 3. Server functions (`src/lib/admin.functions.ts`)

All guarded by `requireSupabaseAuth` + role check via `has_role`. Includes:

- Users/admins: list, search, get, set role, suspend/reactivate, reset password (Auth Admin API), delete admin
- Products: create, update, soft-delete, restore, hard-delete (super_admin only), bulk stock update
- Orders: list, update status, cancel, refund (status only — payment integration deferred), export CSV
- Coupons, banners, testimonials, newsletter: full CRUD
- Analytics: revenue by day/month, top products, low-stock, customer counts, traffic counters
- Audit/login logs: list with filters
- Backup: export full JSON snapshot of admin-managed tables; restore from JSON (super_admin only, behind a typed confirmation)

Service-role client (`client.server`) is dynamically imported only inside handlers that need Auth Admin API.

## 4. Storage

Buckets created in migration:
- `product-images` (public read, super_admin/admin write)
- `avatars` (public read, owner write)
- `banners` (public read, admin write)

## 5. Routes — additive only

New protected subtree under `src/routes/_admin/` with its own pathless layout that:
- Redirects to `/login` if not signed in
- Redirects to `/` if signed-in user lacks `admin` or `super_admin` role
- Renders a dedicated dark luxury admin shell (sidebar + topbar) — distinct from the storefront, but reusing existing tokens (black/white/gold, Playfair + Inter)

Pages:

```
/_admin/                  → Overview (KPIs, revenue chart, recent orders, low stock)
/_admin/products          → table, search, filters, bulk actions
/_admin/products/new
/_admin/products/$id
/_admin/products/trash    → soft-deleted, restore/hard-delete
/_admin/categories
/_admin/orders            → table + filters + CSV export
/_admin/orders/$id        → details, status, refund, cancel
/_admin/customers
/_admin/customers/$id     → profile, orders, suspend/reactivate, reset password
/_admin/admins            → super_admin only: list admins, invite, change role, remove
/_admin/coupons
/_admin/banners
/_admin/testimonials
/_admin/newsletter
/_admin/analytics         → revenue, products, customers, inventory, traffic tabs
/_admin/security          → audit logs, login history, 2FA toggle (TOTP enrollment via Supabase MFA)
/_admin/backups           → export/restore JSON
/_admin/settings          → site settings (store name, currency, contact, social), claim-super-admin button when applicable
```

None of the existing public routes change.

## 6. UI

- Dedicated `AdminShell` component (collapsible sidebar, breadcrumb, topbar with user menu)
- All tables: shadcn `Table` + search + pagination + skeleton loading
- Forms: shadcn `Form` + Zod validation
- Charts: `recharts` (already in shadcn stack) for revenue/analytics
- Toasts for every mutation; confirmation dialogs for destructive actions
- Premium styling using existing tokens — no new global CSS, no font changes
- Storefront header gains a discreet "Admin" link visible only when `has_role` returns admin/super_admin (server-checked, not a localStorage flag)

## 7. Security

- Every mutation server-side via `createServerFn` with `requireSupabaseAuth` + role gate (defense in depth on top of RLS)
- All sensitive actions append to `audit_logs`
- Login attempts append to `login_history` via root `onAuthStateChange`
- 2FA: enrollment + verification pages using Supabase MFA (TOTP); admin/super_admin can require MFA before sensitive operations
- Password reset for customers uses Auth Admin API (super_admin only)
- No service-role key ever reaches the client

## 8. Out of scope (explicit)

- Real payment refunds (only order-status refund flag; wiring Stripe/Paddle is a separate phase you previously deferred)
- Email sending for newsletter (campaign is stored; actual send is a future phase, will need an email provider)
- File-system DB backups — backup is a JSON export of admin-managed `public` tables only

## Approval

Reply "go" to start. I will implement in this order:
1. Migration + storage buckets + bootstrap function
2. Admin shell, layout guard, "Claim Super Admin" flow
3. Products / categories / orders / customers
4. Admins / coupons / banners / testimonials / newsletter
5. Analytics / security (audit + 2FA) / backups / settings
