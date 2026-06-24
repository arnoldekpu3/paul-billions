import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(supabase: any, userId: string, requireSuper = false) {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const roles = (data ?? []).map((r: { role: string }) => r.role);
  const isAdmin = roles.includes("admin") || roles.includes("super_admin");
  const isSuper = roles.includes("super_admin");
  if (!isAdmin) throw new Error("Forbidden");
  if (requireSuper && !isSuper) throw new Error("Super admin required");
  return { isAdmin, isSuper };
}

async function audit(supabase: any, actorId: string, action: string, entity?: string, entityId?: string, metadata?: any) {
  await supabase.from("audit_logs").insert({
    actor_id: actorId, action, entity, entity_id: entityId, metadata: metadata ?? {},
  });
}

// =========== OVERVIEW / ANALYTICS ===========
export const getOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const [{ count: customers }, { count: products }, { count: orders }, { data: revRows }, { data: lowStock }, { data: recentOrders }] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("products").select("*", { count: "exact", head: true }).is("deleted_at", null),
      supabase.from("orders").select("*", { count: "exact", head: true }),
      supabase.from("orders").select("total_kobo, created_at, status").gte("created_at", new Date(Date.now() - 30 * 86400000).toISOString()),
      supabase.from("products").select("id, name, stock").is("deleted_at", null).lte("stock", 5).order("stock").limit(8),
      supabase.from("orders").select("id, order_number, total_kobo, status, created_at, email").order("created_at", { ascending: false }).limit(8),
    ]);
    const revenue = (revRows ?? []).filter((r: any) => r.status !== "cancelled").reduce((s: number, r: any) => s + Number(r.total_kobo || 0), 0);
    const byDay: Record<string, number> = {};
    for (const r of revRows ?? []) {
      const d = new Date(r.created_at).toISOString().slice(0, 10);
      byDay[d] = (byDay[d] || 0) + (r.status === "cancelled" ? 0 : Number(r.total_kobo || 0));
    }
    const chart = Object.entries(byDay).sort().map(([date, total]) => ({ date, total }));
    return { customers: customers ?? 0, products: products ?? 0, orders: orders ?? 0, revenue, chart, lowStock: lowStock ?? [], recentOrders: recentOrders ?? [] };
  });

// =========== CUSTOMERS / ADMINS ===========
export const listUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { search?: string; role?: string } | undefined) => d ?? {})
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    let q = supabase.from("profiles").select("id, email, full_name, avatar_url, phone, is_suspended, created_at").order("created_at", { ascending: false }).limit(500);
    if (data.search) q = q.or(`email.ilike.%${data.search}%,full_name.ilike.%${data.search}%`);
    const { data: profs, error } = await q;
    if (error) throw error;
    const ids = (profs ?? []).map((p: any) => p.id);
    const { data: roleRows } = ids.length ? await supabase.from("user_roles").select("user_id, role").in("user_id", ids) : { data: [] };
    const byUser: Record<string, string[]> = {};
    for (const r of roleRows ?? []) (byUser[(r as any).user_id] ||= []).push((r as any).role);
    let out = (profs ?? []).map((p: any) => ({ ...p, roles: byUser[p.id] ?? [] }));
    if (data.role) out = out.filter((u) => u.roles.includes(data.role!));
    return out;
  });

export const setUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string; role: "super_admin" | "admin" | "customer"; grant: boolean }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId, true);
    if (data.grant) {
      await supabase.from("user_roles").upsert({ user_id: data.userId, role: data.role, assigned_by: userId });
    } else {
      await supabase.from("user_roles").delete().eq("user_id", data.userId).eq("role", data.role);
    }
    await audit(supabase, userId, data.grant ? "grant_role" : "revoke_role", "user_roles", data.userId, { role: data.role });
    return { ok: true };
  });

export const suspendUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string; suspend: boolean; reason?: string }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    await supabase.from("profiles").update({
      is_suspended: data.suspend,
      suspended_at: data.suspend ? new Date().toISOString() : null,
      suspended_reason: data.reason ?? null,
    }).eq("id", data.userId);
    await audit(supabase, userId, data.suspend ? "suspend_user" : "reactivate_user", "profiles", data.userId);
    return { ok: true };
  });

export const adminResetPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId, true);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const tmp = "PB-" + Math.random().toString(36).slice(2, 10) + "Aa1!";
    await supabaseAdmin.auth.admin.updateUserById(data.userId, { password: tmp });
    await audit(supabase, userId, "reset_password", "auth.users", data.userId);
    return { ok: true, tempPassword: tmp };
  });

export const adminDeleteUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId, true);
    if (data.userId === userId) throw new Error("Cannot delete yourself");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.auth.admin.deleteUser(data.userId);
    await audit(supabase, userId, "delete_user", "auth.users", data.userId);
    return { ok: true };
  });

export const getCustomerDetail = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const [{ data: profile }, { data: roleRows }, { data: orders }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", data.userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", data.userId),
      supabase.from("orders").select("id, order_number, status, total_kobo, created_at").eq("user_id", data.userId).order("created_at", { ascending: false }),
    ]);
    return { profile, roles: (roleRows ?? []).map((r: any) => r.role), orders: orders ?? [] };
  });

// =========== ORDERS ===========
export const listOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { status?: string; search?: string } | undefined) => d ?? {})
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    let q = supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(500);
    if (data.status) q = q.eq("status", data.status);
    if (data.search) q = q.or(`order_number.ilike.%${data.search}%,email.ilike.%${data.search}%`);
    const { data: rows, error } = await q;
    if (error) throw error;
    return rows ?? [];
  });

export const getOrder = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const [{ data: order }, { data: items }] = await Promise.all([
      supabase.from("orders").select("*").eq("id", data.id).maybeSingle(),
      supabase.from("order_items").select("*").eq("order_id", data.id),
    ]);
    return { order, items: items ?? [] };
  });

export const updateOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; status?: string; payment_status?: string; notes?: string }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const patch: any = {};
    if (data.status) patch.status = data.status;
    if (data.payment_status) patch.payment_status = data.payment_status;
    if (data.notes !== undefined) patch.notes = data.notes;
    await supabase.from("orders").update(patch).eq("id", data.id);
    await audit(supabase, userId, "update_order", "orders", data.id, patch);
    return { ok: true };
  });

// =========== PRODUCTS ===========
export const listProductsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { trash?: boolean; search?: string } | undefined) => d ?? {})
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    let q = supabase.from("products").select("*, categories(name)").order("created_at", { ascending: false }).limit(500);
    q = data.trash ? q.not("deleted_at", "is", null) : q.is("deleted_at", null);
    if (data.search) q = q.ilike("name", `%${data.search}%`);
    const { data: rows, error } = await q;
    if (error) throw error;
    return rows ?? [];
  });

export const upsertProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: any) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const row: any = {
      slug: data.slug, name: data.name, description: data.description ?? null,
      price_kobo: Math.round(Number(data.price_kobo || 0)),
      compare_at_kobo: data.compare_at_kobo ? Math.round(Number(data.compare_at_kobo)) : null,
      category_id: data.category_id || null, stock: Math.max(0, Number(data.stock || 0)),
      images: data.images ?? [], sizes: data.sizes ?? [], colors: data.colors ?? [],
      is_featured: !!data.is_featured, is_active: data.is_active !== false,
    };
    if (data.id) {
      await supabase.from("products").update(row).eq("id", data.id);
      await audit(supabase, userId, "update_product", "products", data.id);
      return { ok: true, id: data.id };
    }
    const { data: ins, error } = await supabase.from("products").insert(row).select("id").single();
    if (error) throw error;
    await audit(supabase, userId, "create_product", "products", ins.id);
    return { ok: true, id: ins.id };
  });

export const softDeleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; restore?: boolean }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    await supabase.from("products").update({ deleted_at: data.restore ? null : new Date().toISOString() }).eq("id", data.id);
    await audit(supabase, userId, data.restore ? "restore_product" : "soft_delete_product", "products", data.id);
    return { ok: true };
  });

export const hardDeleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId, true);
    await supabase.from("products").delete().eq("id", data.id);
    await audit(supabase, userId, "hard_delete_product", "products", data.id);
    return { ok: true };
  });

// =========== GENERIC CRUD for simple tables ===========
const SIMPLE_TABLES = ["categories", "coupons", "banners", "testimonials", "newsletter_campaigns", "site_settings"] as const;
type SimpleTable = (typeof SIMPLE_TABLES)[number];

export const listRows = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { table: SimpleTable }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    if (!SIMPLE_TABLES.includes(data.table)) throw new Error("Bad table");
    const orderCol = data.table === "site_settings" ? "key" : "created_at";
    const { data: rows, error } = await supabase.from(data.table).select("*").order(orderCol, { ascending: false }).limit(500);
    if (error) throw error;
    return rows ?? [];
  });

export const upsertRow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { table: SimpleTable; row: any }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    if (!SIMPLE_TABLES.includes(data.table)) throw new Error("Bad table");
    const { error } = await supabase.from(data.table).upsert(data.row);
    if (error) throw error;
    await audit(supabase, userId, "upsert", data.table, data.row.id || data.row.key);
    return { ok: true };
  });

export const deleteRow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { table: SimpleTable; id: string }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    if (!SIMPLE_TABLES.includes(data.table)) throw new Error("Bad table");
    const keyCol = data.table === "site_settings" ? "key" : "id";
    await (supabase as any).from(data.table).delete().eq(keyCol, data.id);
    await audit(supabase, userId, "delete", data.table, data.id);
    return { ok: true };
  });

// =========== NEWSLETTER subscribers ===========
export const listSubscribers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { data } = await supabase.from("newsletter_subscribers").select("*").order("created_at", { ascending: false }).limit(2000);
    return data ?? [];
  });

// =========== SECURITY ===========
export const listAuditLogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { data } = await supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(500);
    return data ?? [];
  });

export const listLoginHistory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { data } = await supabase.from("login_history").select("*").order("created_at", { ascending: false }).limit(500);
    return data ?? [];
  });

// =========== BACKUPS ===========
export const exportBackup = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId, true);
    const tables = ["categories", "products", "orders", "order_items", "coupons", "banners", "testimonials", "newsletter_campaigns", "newsletter_subscribers", "site_settings", "user_roles", "profiles"];
    const snapshot: Record<string, any> = { _meta: { exportedAt: new Date().toISOString(), version: 1 } };
    for (const t of tables) {
      const { data } = await (supabase as any).from(t).select("*");
      snapshot[t] = data ?? [];
    }
    await audit(supabase, userId, "export_backup", "system", null as any, { tables: tables.length });
    return snapshot;
  });

export const restoreBackup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { snapshot: Record<string, any[]>; confirm: string }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId, true);
    if (data.confirm !== "RESTORE") throw new Error("Confirmation required");
    const order = ["categories", "products", "coupons", "banners", "testimonials", "newsletter_campaigns", "newsletter_subscribers", "site_settings"];
    for (const t of order) {
      const rows = data.snapshot[t];
      if (!Array.isArray(rows) || rows.length === 0) continue;
      await (supabase as any).from(t).upsert(rows);
    }
    await audit(supabase, userId, "restore_backup", "system", null as any);
    return { ok: true };
  });

// =========== Storage signed upload URL ===========
export const createUploadUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { bucket: "product-images" | "banners" | "avatars"; path: string }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { data: signed, error } = await supabase.storage.from(data.bucket).createSignedUploadUrl(data.path);
    if (error) throw error;
    const { data: pub } = supabase.storage.from(data.bucket).getPublicUrl(data.path);
    return { signedUrl: signed.signedUrl, token: signed.token, path: signed.path, publicUrl: pub.publicUrl };
  });
