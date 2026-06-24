import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export type AppRole = "super_admin" | "admin" | "customer";

export interface AuthState {
  user: User | null;
  roles: AppRole[];
  loading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadRoles(uid: string) {
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", uid);
      if (!mounted) return;
      setRoles(((data ?? []) as { role: AppRole }[]).map((r) => r.role));
    }
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setUser(data.user ?? null);
      if (data.user) loadRoles(data.user.id).finally(() => mounted && setLoading(false));
      else setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      setUser(session?.user ?? null);
      if (session?.user) loadRoles(session.user.id);
      else setRoles([]);
    });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, []);

  return {
    user,
    roles,
    loading,
    isAdmin: roles.includes("admin") || roles.includes("super_admin"),
    isSuperAdmin: roles.includes("super_admin"),
  };
}
