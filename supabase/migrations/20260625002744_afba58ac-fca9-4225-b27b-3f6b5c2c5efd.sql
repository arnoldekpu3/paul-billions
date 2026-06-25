
ALTER TABLE public.cart_items ALTER COLUMN product_id DROP NOT NULL;
ALTER TABLE public.cart_items ADD COLUMN IF NOT EXISTS product_slug text;
ALTER TABLE public.cart_items ADD COLUMN IF NOT EXISTS product_name text;
ALTER TABLE public.cart_items ADD COLUMN IF NOT EXISTS product_image text;
ALTER TABLE public.cart_items ADD COLUMN IF NOT EXISTS unit_price_kobo bigint;

ALTER TABLE public.saved_for_later ALTER COLUMN product_id DROP NOT NULL;
ALTER TABLE public.saved_for_later ADD COLUMN IF NOT EXISTS product_slug text;
ALTER TABLE public.saved_for_later ADD COLUMN IF NOT EXISTS product_name text;
ALTER TABLE public.saved_for_later ADD COLUMN IF NOT EXISTS product_image text;
ALTER TABLE public.saved_for_later ADD COLUMN IF NOT EXISTS unit_price_kobo bigint;

ALTER TABLE public.wishlist_items ALTER COLUMN product_id DROP NOT NULL;
ALTER TABLE public.wishlist_items ADD COLUMN IF NOT EXISTS product_slug text;
ALTER TABLE public.wishlist_items ADD COLUMN IF NOT EXISTS product_name text;
ALTER TABLE public.wishlist_items ADD COLUMN IF NOT EXISTS product_image text;
ALTER TABLE public.wishlist_items ADD COLUMN IF NOT EXISTS unit_price_kobo bigint;
ALTER TABLE public.wishlist_items DROP CONSTRAINT IF EXISTS wishlist_items_user_id_product_id_key;
CREATE UNIQUE INDEX IF NOT EXISTS wishlist_user_slug_uq ON public.wishlist_items (user_id, product_slug);

ALTER TABLE public.reviews ALTER COLUMN product_id DROP NOT NULL;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS product_slug text;
ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS reviews_user_id_product_id_key;
CREATE UNIQUE INDEX IF NOT EXISTS reviews_user_slug_uq ON public.reviews (user_id, product_slug);

ALTER TABLE public.order_items ALTER COLUMN product_id DROP NOT NULL;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS product_slug text;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS product_image text;
