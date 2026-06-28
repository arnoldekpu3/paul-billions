import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { listUsers, setUserRole, suspendUser, adminDeleteUser } from "@/lib/admin.functions";
import { AdminHeader, Card, Table, Td, Tr, Btn, Input, Select, Label } from "@/components/admin/ui";
import { useAuth } from "@/lib/use-auth";

import { requirePermission } from "@/lib/route-guards";

export const Route = createFileRoute("/admin/admins")({
  beforeLoad: async ({ location }) => { await requirePermission("admins.manage", location.pathname); },
  component: AdminsPage,
});

function AdminsPage() {
  const [search, setSearch] = useState("");
  const list = useServerFn(listUsers);
  const setRole = useServerFn(setUserRole);
  const suspend = useServerFn(suspendUser);
  const del = useServerFn(adminDeleteUser);
  const qc = useQueryClient();
  const { user: me, isSuperAdmin } = useAuth();

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users-all", search],
    queryFn: () => list({ data: { search: search || undefined } }),
  });

  const admins = (users ?? []).filter((u: any) => u.roles.includes("admin") || u.roles.includes("super_admin"));
  const others = (users ?? []).filter((u: any) => !u.roles.includes("admin") && !u.roles.includes("super_admin"));

  async function grant(userId: string, role: "admin" | "super_admin") {
    if (!confirm(`Grant ${role.replace("_", " ")} to this user?`)) return;
    await setRole({ data: { userId, role, grant: true } });
    toast.success("Role granted");
    qc.invalidateQueries({ queryKey: ["admin-users-all"] });
  }
  async function revoke(userId: string, role: "admin" | "super_admin") {
    if (!confirm(`Revoke ${role.replace("_", " ")}?`)) return;
    await setRole({ data: { userId, role, grant: false } });
    toast.success("Role revoked");
    qc.invalidateQueries({ queryKey: ["admin-users-all"] });
  }

  if (!isSuperAdmin) return <div className="text-white/60">Super admin access only.</div>;

  return (
    <>
      <AdminHeader title="Admins & Roles" subtitle="Grant, revoke, and manage admin accounts" />

      <Card className="p-0 mb-8">
        <div className="px-5 py-4 border-b border-white/10 text-[11px] uppercase tracking-[0.2em] text-white/60">Current admins</div>
        <Table headers={["Email", "Name", "Roles", "Status", ""]}>
          {admins.map((u: any) => (
            <Tr key={u.id}>
              <Td className="text-white">{u.email}{u.id === me?.id && <span className="text-gold ml-2 text-[10px]">(you)</span>}</Td>
              <Td>{u.full_name ?? "—"}</Td>
              <Td>{u.roles.map((r: string) => <span key={r} className="inline-block px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] border border-gold/40 text-gold mr-1">{r.replace("_", " ")}</span>)}</Td>
              <Td>{u.is_suspended ? <span className="text-red-400 text-[10px] uppercase">Suspended</span> : <span className="text-green-400 text-[10px] uppercase">Active</span>}</Td>
              <Td>
                <div className="flex gap-2 justify-end flex-wrap">
                  {u.id !== me?.id && (
                    <>
                      {u.roles.includes("super_admin") ? <Btn variant="danger" onClick={() => revoke(u.id, "super_admin")}>Revoke Super</Btn> : <Btn onClick={() => grant(u.id, "super_admin")}>Make Super</Btn>}
                      {u.roles.includes("admin") ? <Btn variant="danger" onClick={() => revoke(u.id, "admin")}>Revoke Admin</Btn> : <Btn onClick={() => grant(u.id, "admin")}>Make Admin</Btn>}
                    </>
                  )}
                </div>
              </Td>
            </Tr>
          ))}
          {admins.length === 0 && <Tr><Td className="text-white/40">No admins yet</Td><Td/><Td/><Td/><Td/></Tr>}
        </Table>
      </Card>

      <AdminHeader title="Promote a user" subtitle="Search any customer and grant admin access" />
      <div className="mb-4"><Input placeholder="Search by email…" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
      {isLoading ? <div className="text-white/40 text-sm">Loading…</div> : (
        <Card className="p-0">
          <Table headers={["Email", "Name", ""]}>
            {others.slice(0, 50).map((u: any) => (
              <Tr key={u.id}>
                <Td>{u.email}</Td>
                <Td>{u.full_name ?? "—"}</Td>
                <Td><div className="flex gap-2 justify-end"><Btn onClick={() => grant(u.id, "admin")}>Make Admin</Btn></div></Td>
              </Tr>
            ))}
          </Table>
        </Card>
      )}
    </>
  );
}
