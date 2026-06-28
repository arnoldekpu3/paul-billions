import { redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { can, type Permission } from "@/lib/permissions";
import type { AppRole } from "@/lib/use-auth";

// Route-level RBAC guard. Use inside `beforeLoad` so unauthorized users are
// redirected BEFORE the route component (or its loader) ever runs — even when
// they paste the URL directly. UI still hides links via permissions.ts, and
// the server still enforces via assertAdmin / RLS. This is defense-in-depth.

export async function requirePermission(
  permission: Permission,
  fromPath: string,
): Promise<{ roles: AppRole[]; userId: string }> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    throw redirect({ to: "/login", search: { redirect: fromPath } as any });
  }
  const { data: rows } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", auth.user.id);
  const roles = ((rows ?? []) as { role: AppRole }[]).map((r) => r.role);

  // Customers always have shop permissions; admin/super get extra.
  if (!can(roles, permission)) {
    // Special case: first-run super-admin claim. If no super admin exists
    // and this is an admin-area permission, let the admin layout render
    // its ClaimScreen instead of bouncing the developer to /unauthorized.
    if (permission === "admin.access") {
      const { count } = await supabase
        .from("user_roles")
        .select("user_id", { count: "exact", head: true })
        .eq("role", "super_admin");
      if ((count ?? 0) === 0) return { roles, userId: auth.user.id };
    }
    throw redirect({ to: "/unauthorized", search: { from: fromPath } as any });
  }
  return { roles, userId: auth.user.id };
}
