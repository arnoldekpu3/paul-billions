import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/unauthorized")({
  ssr: false,
  component: UnauthorizedPage,
});

function UnauthorizedPage() {
  const { user, roles } = useAuth();
  const from = useRouterState({ select: (s) => s.location.search as any })?.from as string | undefined;

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full border border-white/10 p-10 text-center">
        <ShieldAlert className="h-10 w-10 text-gold mx-auto mb-4" />
        <h1 className="font-display text-2xl mb-2">Access denied</h1>
        <p className="text-sm text-white/60 mb-2">
          You don't have permission to view this page.
        </p>
        {from && <p className="text-[11px] uppercase tracking-[0.2em] text-white/30 mb-4 truncate">Tried: {from}</p>}
        <div className="text-[11px] uppercase tracking-[0.2em] text-white/40 mb-6">
          {user ? (
            <>Signed in as <span className="text-gold">{user.email}</span>
            {roles.length > 0 && <> · {roles.join(", ").replace(/_/g, " ")}</>}</>
          ) : "Not signed in"}
        </div>
        <div className="flex gap-2">
          <Link to="/" className="flex-1 text-center text-xs uppercase tracking-[0.25em] border border-white/15 px-4 py-3 hover:border-gold hover:text-gold">
            Home
          </Link>
          {!user && (
            <Link to="/login" className="flex-1 text-center text-xs uppercase tracking-[0.25em] bg-gold text-black px-4 py-3 hover:bg-white transition">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
