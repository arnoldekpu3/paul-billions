import type { AppRole } from "@/lib/use-auth";

// Centralized RBAC permission catalog. Server-side enforcement still lives in
// admin.functions.ts (assertAdmin / requireSuper) + Supabase RLS via has_role().
// These client helpers are for UI gating only — never trust them for security.

export type Permission =
  // Storefront / customer
  | "shop.browse"
  | "cart.manage"
  | "checkout.place_order"
  | "account.manage"
  | "reviews.write"
  | "wishlist.manage"
  // Business admin
  | "admin.access"
  | "products.manage"
  | "categories.manage"
  | "orders.manage"
  | "customers.view"
  | "coupons.manage"
  | "banners.manage"
  | "testimonials.manage"
  | "newsletter.manage"
  | "analytics.view"
  | "settings.manage"
  | "mfa.self"
  // Super-admin only (developer / system)
  | "admins.manage"
  | "audit.view"
  | "backups.manage"
  | "users.hard_delete"
  | "products.hard_delete"
  | "roles.assign";

const CUSTOMER: Permission[] = [
  "shop.browse", "cart.manage", "checkout.place_order",
  "account.manage", "reviews.write", "wishlist.manage",
];

const ADMIN: Permission[] = [
  ...CUSTOMER,
  "admin.access", "products.manage", "categories.manage", "orders.manage",
  "customers.view", "coupons.manage", "banners.manage", "testimonials.manage",
  "newsletter.manage", "analytics.view", "settings.manage", "mfa.self",
];

const SUPER_ADMIN: Permission[] = [
  ...ADMIN,
  "admins.manage", "audit.view", "backups.manage",
  "users.hard_delete", "products.hard_delete", "roles.assign",
];

const MATRIX: Record<AppRole, Permission[]> = {
  customer: CUSTOMER,
  admin: ADMIN,
  super_admin: SUPER_ADMIN,
};

export function permissionsFor(roles: AppRole[]): Set<Permission> {
  const set = new Set<Permission>(CUSTOMER); // every signed-in user is at least a customer
  for (const r of roles) for (const p of MATRIX[r] ?? []) set.add(p);
  return set;
}

export function can(roles: AppRole[], permission: Permission): boolean {
  return permissionsFor(roles).has(permission);
}
