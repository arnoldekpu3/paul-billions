import { Link, Outlet, useRouterState, useNavigate, createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  LayoutDashboard, Package, ShoppingCart, Users, ShieldCheck, Tag, Image as ImageIcon,
  MessageSquare, Mail, FolderTree, BarChart3, Lock, Database, Settings, LogOut, Crown,
} from "lucide-react";
import { useAuth, type AppRole } from "@/lib/use-auth";
import { can, type Permission } from "@/lib/permissions";
import { supabase } from "@/integrations/supabase/client";
import { requirePermission } from "@/lib/route-guards";

export const Route = createFileRoute("/admin")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    await requirePermission("admin.access", location.pathname);
  },
  component: AdminLayout,
});

type NavItem = { to: string; label: string; icon: any; permission: Permission };
const NAV: NavItem[] = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, permission: "admin.access" },
  { to: "/admin/products", label: "Products", icon: Package, permission: "products.manage" },
  { to: "/admin/categories", label: "Categories", icon: FolderTree, permission: "categories.manage" },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart, permission: "orders.manage" },
  { to: "/admin/customers", label: "Customers", icon: Users, permission: "customers.view" },
  { to: "/admin/admins", label: "Admins", icon: ShieldCheck, permission: "admins.manage" },
  { to: "/admin/coupons", label: "Coupons", icon: Tag, permission: "coupons.manage" },
  { to: "/admin/banners", label: "Banners", icon: ImageIcon, permission: "banners.manage" },
  { to: "/admin/testimonials", label: "Testimonials", icon: MessageSquare, permission: "testimonials.manage" },
  { to: "/admin/newsletter", label: "Newsletter", icon: Mail, permission: "newsletter.manage" },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3, permission: "analytics.view" },
  { to: "/admin/security", label: "Security", icon: Lock, permission: "mfa.self" },
  { to: "/admin/backups", label: "Backups", icon: Database, permission: "backups.manage" },
  { to: "/admin/settings", label: "Settings", icon: Settings, permission: "settings.manage" },
];


function AdminLayout() {
  const { user, loading, isAdmin, isSuperAdmin, roles } = useAuth();
  const nav = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (loading || !user) return;
    if (isAdmin) return;
    // Customer signed in but no admin role — check if super admin can be claimed
    supabase.from("user_roles").select("user_id", { count: "exact", head: true }).eq("role", "super_admin")
      .then(({ count }) => {
        if ((count ?? 0) === 0) return; // show ClaimScreen below
        nav({ to: "/unauthorized", search: { from: pathname } as any });
      });
  }, [loading, user, isAdmin, nav, pathname]);

  if (loading) {
    return <div className="min-h-screen bg-[#0b0b0b] text-white flex items-center justify-center text-sm">Loading admin…</div>;
  }

  // No admin role yet — show claim screen (gated by RPC; safe if already claimed)
  if (user && !isAdmin) {
    return <ClaimScreen email={user.email ?? ""} />;
  }

  const items = NAV.filter((n) => can(roles, n.permission));

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white flex">
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-white/10 bg-black">
        <div className="px-6 py-6 border-b border-white/10">
          <div className="font-display text-lg tracking-tight">PAUL BILLIONS</div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-gold mt-1 flex items-center gap-1.5">
            {isSuperAdmin && <Crown className="h-3 w-3" />} {isSuperAdmin ? "Super Admin" : "Admin"}
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          {items.map((n) => {
            const active = pathname === n.to || (n.to !== "/admin" && pathname.startsWith(n.to));
            return (
              <Link
                key={n.to}
                to={n.to as any}
                className={[
                  "flex items-center gap-3 px-6 py-2.5 text-[13px] transition-colors",
                  active ? "text-gold bg-white/5 border-l-2 border-gold" : "text-white/60 hover:text-white hover:bg-white/5 border-l-2 border-transparent",
                ].join(" ")}
              >
                <n.icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/10 p-4">
          <div className="text-[11px] text-white/40 mb-2 truncate">{user?.email}</div>
          <div className="flex gap-2">
            <Link to="/" className="flex-1 text-center text-[11px] uppercase tracking-[0.2em] border border-white/15 px-3 py-2 hover:border-gold hover:text-gold">
              Site
            </Link>
            <button onClick={async () => { await supabase.auth.signOut(); nav({ to: "/" }); }}
              className="flex-1 text-center text-[11px] uppercase tracking-[0.2em] border border-white/15 px-3 py-2 hover:border-red-500 hover:text-red-400 flex items-center justify-center gap-1.5">
              <LogOut className="h-3 w-3" /> Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* mobile topbar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 bg-black border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="font-display text-sm">PB Admin</div>
        <select
          value={pathname}
          onChange={(e) => nav({ to: e.target.value as any })}
          className="bg-black border border-white/15 text-white text-xs px-2 py-1.5"
        >
          {items.map((n) => <option key={n.to} value={n.to}>{n.label}</option>)}
        </select>
      </div>

      <main className="flex-1 min-w-0 lg:pl-0 pt-14 lg:pt-0">
        <div className="max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-10">
          <Outlet />
        </div>
        <RoleBadge roles={roles} />
      </main>
    </div>
  );
}

function RoleBadge({ roles }: { roles: AppRole[] }) {
  return null;
}

function ClaimScreen({ email }: { email: string }) {
  const nav = useNavigate();
  async function claim() {
    const { data, error } = await supabase.rpc("claim_super_admin");
    if (error) return alert(error.message);
    if ((data as any)?.ok) {
      window.location.reload();
    } else {
      alert("Super admin already exists. Contact the developer to grant you access.");
      nav({ to: "/" });
    }
  }
  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full border border-white/10 p-10 text-center">
        <Crown className="h-8 w-8 text-gold mx-auto mb-4" />
        <h1 className="font-display text-2xl mb-2">Claim Super Admin</h1>
        <p className="text-sm text-white/60 mb-6">
          You are signed in as <span className="text-gold">{email}</span>. If no super admin exists yet, claim this role now. It will be permanently assigned to your account.
        </p>
        <button onClick={claim} className="w-full bg-gold text-black px-6 py-3 text-xs uppercase tracking-[0.25em] font-semibold hover:bg-white transition">
          Claim Super Admin
        </button>
        <Link to="/" className="block mt-4 text-xs uppercase tracking-[0.25em] text-white/40 hover:text-white">
          ← Back to site
        </Link>
      </div>
    </div>
  );
}
