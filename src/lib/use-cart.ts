import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { getProduct } from "@/lib/mock-products";

export type CartItem = {
  id: string;
  product_slug: string;
  product_name: string;
  product_image: string;
  unit_price_kobo: number;
  qty: number;
  size: string | null;
  color: string | null;
};

const LS_KEY = "pb_cart_v1";

function readLS(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
  } catch {
    return [];
  }
}
function writeLS(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("pb-cart-changed"));
}

export function useCart() {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (authLoading) return;
    if (!user) {
      setItems(readLS());
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("cart_items")
      .select("id, product_slug, product_name, product_image, unit_price_kobo, qty, size, color")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });
    setItems((data ?? []).map((d: any) => ({ ...d, unit_price_kobo: Number(d.unit_price_kobo) })));
    setLoading(false);
  }, [user, authLoading]);

  useEffect(() => {
    refresh();
    const onChange = () => refresh();
    window.addEventListener("pb-cart-changed", onChange);
    return () => window.removeEventListener("pb-cart-changed", onChange);
  }, [refresh]);

  const add = useCallback(
    async (slug: string, qty: number, size: string | null, color: string | null) => {
      const p = getProduct(slug);
      if (!p) return;
      if (!user) {
        const list = readLS();
        const idx = list.findIndex((i) => i.product_slug === slug && i.size === size && i.color === color);
        if (idx >= 0) list[idx].qty += qty;
        else
          list.push({
            id: crypto.randomUUID(),
            product_slug: slug,
            product_name: p.name,
            product_image: p.image,
            unit_price_kobo: p.price * 100,
            qty,
            size,
            color,
          });
        writeLS(list);
        return;
      }
      const { data: existing } = await supabase
        .from("cart_items")
        .select("id, qty")
        .eq("user_id", user.id)
        .eq("product_slug", slug)
        .eq("size", size ?? "")
        .eq("color", color ?? "")
        .maybeSingle();
      if (existing) {
        await supabase.from("cart_items").update({ qty: (existing as any).qty + qty }).eq("id", (existing as any).id);
      } else {
        await supabase.from("cart_items").insert({
          user_id: user.id,
          product_slug: slug,
          product_name: p.name,
          product_image: p.image,
          unit_price_kobo: p.price * 100,
          qty,
          size: size ?? "",
          color: color ?? "",
        } as any);
      }
      await refresh();
    },
    [user, refresh]
  );

  const updateQty = useCallback(
    async (id: string, qty: number) => {
      if (qty < 1) return;
      if (!user) {
        writeLS(readLS().map((i) => (i.id === id ? { ...i, qty } : i)));
        return;
      }
      await supabase.from("cart_items").update({ qty }).eq("id", id);
      await refresh();
    },
    [user, refresh]
  );

  const remove = useCallback(
    async (id: string) => {
      if (!user) {
        writeLS(readLS().filter((i) => i.id !== id));
        return;
      }
      await supabase.from("cart_items").delete().eq("id", id);
      await refresh();
    },
    [user, refresh]
  );

  const saveForLater = useCallback(
    async (item: CartItem) => {
      if (!user) return remove(item.id);
      await supabase.from("saved_for_later").insert({
        user_id: user.id,
        product_slug: item.product_slug,
        product_name: item.product_name,
        product_image: item.product_image,
        unit_price_kobo: item.unit_price_kobo,
        size: item.size ?? "",
        color: item.color ?? "",
      } as any);
      await remove(item.id);
    },
    [user, remove]
  );

  const clear = useCallback(async () => {
    if (!user) {
      writeLS([]);
      return;
    }
    await supabase.from("cart_items").delete().eq("user_id", user.id);
    await refresh();
  }, [user, refresh]);

  return { items, loading, add, updateQty, remove, saveForLater, clear, refresh };
}

export function useCartCount() {
  const [count, setCount] = useState(0);
  const { user } = useAuth();
  useEffect(() => {
    let active = true;
    async function calc() {
      if (!user) {
        const total = readLS().reduce((s, i) => s + i.qty, 0);
        if (active) setCount(total);
        return;
      }
      const { data } = await supabase.from("cart_items").select("qty").eq("user_id", user.id);
      const total = (data ?? []).reduce((s: number, r: any) => s + Number(r.qty), 0);
      if (active) setCount(total);
    }
    calc();
    const on = () => calc();
    window.addEventListener("pb-cart-changed", on);
    return () => {
      active = false;
      window.removeEventListener("pb-cart-changed", on);
    };
  }, [user]);
  return count;
}
