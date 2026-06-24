
-- =========================================================
-- ROLES
-- =========================================================
do $$ begin
  create type public.app_role as enum ('super_admin', 'admin', 'customer');
exception when duplicate_object then null; end $$;

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  assigned_by uuid references auth.users(id) on delete set null,
  assigned_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.is_admin(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role in ('admin','super_admin')
  )
$$;

create policy "users read own roles" on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.is_admin(auth.uid()));
create policy "super admin manages roles" on public.user_roles for all to authenticated
  using (public.has_role(auth.uid(), 'super_admin'))
  with check (public.has_role(auth.uid(), 'super_admin'));

-- =========================================================
-- updated_at helper
-- =========================================================
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- =========================================================
-- PROFILES
-- =========================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  phone text,
  is_suspended boolean not null default false,
  suspended_at timestamptz,
  suspended_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create policy "users read own profile" on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_admin(auth.uid()));
create policy "users update own profile" on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
create policy "admins update any profile" on public.profiles for update to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "users insert own profile" on public.profiles for insert to authenticated
  with check (id = auth.uid());

create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do nothing;
  insert into public.user_roles (user_id, role) values (new.id, 'customer')
  on conflict do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================================================
-- CATEGORIES
-- =========================================================
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  image_url text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.categories to anon, authenticated;
grant insert, update, delete on public.categories to authenticated;
grant all on public.categories to service_role;
alter table public.categories enable row level security;
create policy "categories public read" on public.categories for select using (is_active or public.is_admin(auth.uid()));
create policy "categories admin write" on public.categories for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create trigger categories_touch before update on public.categories for each row execute function public.touch_updated_at();

-- =========================================================
-- PRODUCTS
-- =========================================================
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  price_kobo bigint not null default 0,
  compare_at_kobo bigint,
  category_id uuid references public.categories(id) on delete set null,
  stock int not null default 0,
  images jsonb not null default '[]'::jsonb,
  sizes jsonb not null default '[]'::jsonb,
  colors jsonb not null default '[]'::jsonb,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant all on public.products to service_role;
alter table public.products enable row level security;
create policy "products public read" on public.products for select
  using ((is_active and deleted_at is null) or public.is_admin(auth.uid()));
create policy "products admin write" on public.products for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create trigger products_touch before update on public.products for each row execute function public.touch_updated_at();
create index if not exists products_category_idx on public.products(category_id);
create index if not exists products_active_idx on public.products(is_active) where deleted_at is null;

-- =========================================================
-- ORDERS
-- =========================================================
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('PB-' || to_char(now(),'YYMMDD') || '-' || substr(replace(gen_random_uuid()::text,'-',''),1,6)),
  user_id uuid references auth.users(id) on delete set null,
  email text,
  status text not null default 'pending', -- pending, processing, shipped, delivered, cancelled, refunded
  payment_status text not null default 'unpaid', -- unpaid, paid, refunded
  subtotal_kobo bigint not null default 0,
  shipping_kobo bigint not null default 0,
  discount_kobo bigint not null default 0,
  total_kobo bigint not null default 0,
  shipping jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.orders to authenticated;
grant all on public.orders to service_role;
alter table public.orders enable row level security;
create policy "orders owner read" on public.orders for select to authenticated
  using (user_id = auth.uid() or public.is_admin(auth.uid()));
create policy "orders owner insert" on public.orders for insert to authenticated
  with check (user_id = auth.uid() or public.is_admin(auth.uid()));
create policy "orders admin write" on public.orders for update to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "orders admin delete" on public.orders for delete to authenticated
  using (public.has_role(auth.uid(),'super_admin'));
create trigger orders_touch before update on public.orders for each row execute function public.touch_updated_at();

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  name_snapshot text not null,
  qty int not null,
  unit_price_kobo bigint not null,
  size text,
  color text
);
grant select, insert on public.order_items to authenticated;
grant all on public.order_items to service_role;
alter table public.order_items enable row level security;
create policy "order_items follow order read" on public.order_items for select to authenticated
  using (exists(select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin(auth.uid()))));
create policy "order_items follow order write" on public.order_items for insert to authenticated
  with check (exists(select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin(auth.uid()))));
create policy "order_items admin update" on public.order_items for update to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "order_items admin delete" on public.order_items for delete to authenticated
  using (public.is_admin(auth.uid()));

-- =========================================================
-- COUPONS
-- =========================================================
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  kind text not null default 'percent', -- percent | fixed
  value numeric not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  max_uses int,
  used_count int not null default 0,
  min_subtotal_kobo bigint,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.coupons to authenticated;
grant insert, update, delete on public.coupons to authenticated;
grant all on public.coupons to service_role;
alter table public.coupons enable row level security;
create policy "coupons admin read" on public.coupons for select to authenticated using (public.is_admin(auth.uid()));
create policy "coupons admin write" on public.coupons for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create trigger coupons_touch before update on public.coupons for each row execute function public.touch_updated_at();

-- =========================================================
-- BANNERS
-- =========================================================
create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(),
  title text,
  subtitle text,
  image_url text,
  link text,
  position text not null default 'hero',
  sort_order int not null default 0,
  is_active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.banners to anon, authenticated;
grant insert, update, delete on public.banners to authenticated;
grant all on public.banners to service_role;
alter table public.banners enable row level security;
create policy "banners public read" on public.banners for select using (is_active or public.is_admin(auth.uid()));
create policy "banners admin write" on public.banners for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create trigger banners_touch before update on public.banners for each row execute function public.touch_updated_at();

-- =========================================================
-- TESTIMONIALS
-- =========================================================
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  author text not null,
  body text not null,
  rating int not null default 5,
  is_approved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.testimonials to anon, authenticated;
grant insert, update, delete on public.testimonials to authenticated;
grant all on public.testimonials to service_role;
alter table public.testimonials enable row level security;
create policy "testimonials public read approved" on public.testimonials for select
  using (is_approved or public.is_admin(auth.uid()));
create policy "testimonials admin write" on public.testimonials for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create trigger testimonials_touch before update on public.testimonials for each row execute function public.touch_updated_at();

-- =========================================================
-- NEWSLETTER
-- =========================================================
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
grant insert on public.newsletter_subscribers to anon, authenticated;
grant select, update, delete on public.newsletter_subscribers to authenticated;
grant all on public.newsletter_subscribers to service_role;
alter table public.newsletter_subscribers enable row level security;
create policy "newsletter anyone subscribe" on public.newsletter_subscribers for insert
  with check (true);
create policy "newsletter admin read" on public.newsletter_subscribers for select to authenticated
  using (public.is_admin(auth.uid()));
create policy "newsletter admin write" on public.newsletter_subscribers for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create table if not exists public.newsletter_campaigns (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  body_html text,
  status text not null default 'draft', -- draft | scheduled | sent
  scheduled_for timestamptz,
  sent_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.newsletter_campaigns to authenticated;
grant all on public.newsletter_campaigns to service_role;
alter table public.newsletter_campaigns enable row level security;
create policy "campaigns admin all" on public.newsletter_campaigns for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create trigger campaigns_touch before update on public.newsletter_campaigns for each row execute function public.touch_updated_at();

-- =========================================================
-- SITE SETTINGS
-- =========================================================
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null,
  is_public boolean not null default false,
  updated_at timestamptz not null default now()
);
grant select on public.site_settings to anon, authenticated;
grant insert, update, delete on public.site_settings to authenticated;
grant all on public.site_settings to service_role;
alter table public.site_settings enable row level security;
create policy "settings public read" on public.site_settings for select using (is_public or public.is_admin(auth.uid()));
create policy "settings admin write" on public.site_settings for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create trigger settings_touch before update on public.site_settings for each row execute function public.touch_updated_at();

-- =========================================================
-- AUDIT + LOGIN HISTORY
-- =========================================================
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity text,
  entity_id text,
  metadata jsonb,
  ip text,
  user_agent text,
  created_at timestamptz not null default now()
);
grant select, insert on public.audit_logs to authenticated;
grant all on public.audit_logs to service_role;
alter table public.audit_logs enable row level security;
create policy "audit admin read" on public.audit_logs for select to authenticated
  using (public.is_admin(auth.uid()));
create policy "audit insert self" on public.audit_logs for insert to authenticated
  with check (actor_id = auth.uid() or public.is_admin(auth.uid()));

create table if not exists public.login_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email text,
  ip text,
  user_agent text,
  success boolean not null default true,
  created_at timestamptz not null default now()
);
grant select, insert on public.login_history to authenticated;
grant all on public.login_history to service_role;
alter table public.login_history enable row level security;
create policy "login admin read all" on public.login_history for select to authenticated
  using (public.is_admin(auth.uid()) or user_id = auth.uid());
create policy "login self insert" on public.login_history for insert to authenticated
  with check (user_id = auth.uid() or user_id is null);

-- =========================================================
-- CLAIM SUPER ADMIN (one-time bootstrap)
-- =========================================================
create or replace function public.claim_super_admin()
returns jsonb language plpgsql security definer set search_path = public as $$
declare existing int; uid uuid;
begin
  uid := auth.uid();
  if uid is null then
    return jsonb_build_object('ok', false, 'error', 'not_authenticated');
  end if;
  select count(*) into existing from public.user_roles where role = 'super_admin';
  if existing > 0 then
    return jsonb_build_object('ok', false, 'error', 'already_claimed');
  end if;
  insert into public.user_roles (user_id, role, assigned_by) values (uid, 'super_admin', uid)
    on conflict (user_id, role) do nothing;
  insert into public.audit_logs (actor_id, action, entity, entity_id, metadata)
    values (uid, 'claim_super_admin', 'user_roles', uid::text, '{}'::jsonb);
  return jsonb_build_object('ok', true);
end $$;
grant execute on function public.claim_super_admin() to authenticated;
grant execute on function public.has_role(uuid, public.app_role) to authenticated;
grant execute on function public.is_admin(uuid) to authenticated;
