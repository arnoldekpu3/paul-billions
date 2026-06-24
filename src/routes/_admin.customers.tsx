import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { listUsers, suspendUser, setUserRole, adminResetPassword, adminDeleteUser, getCustomerDetail } from "@/lib/admin.functions";
import { AdminHeader, Card, Table, Td, Tr, Btn, Input, formatNaira } from "@/components/admin/ui";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/_admin/customers")({ component: CustomersPage });

function CustomersPage() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const list = useServerFn(listUsers);
  const suspend = useServerFn(suspendUser);
  const qc = useQueryClient();
  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-customers", search],
    queryFn: () => list({ data: { search: search || undefined, role: "customer" } }),
  });

  async function toggleSuspend(u: any) {
    const reason = u.is_suspended ? "" : prompt("Reason for suspension?") ?? "";
    await suspend({ data: { userId: u.id, suspend: !u.is_suspended, reason } });
    toast.success(u.is_suspended ? "Reactivated" : "Suspended");
    qc.invalidateQueries({ queryKey: ["admin-customers"] });
  }

  return (
    <>
      <AdminHeader title="Customers" subtitle={`${users?.length ?? 0} customers`} />
      <div className="mb-6"><Input placeholder="Search by email or name…" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
      {isLoading ? <div className="text-white/40 text-sm">Loading…</div> : (
        <Card className="p-0">
          <Table headers={["Email", "Name", "Phone", "Joined", "Status", ""]}>
            {(users ?? []).map((u: any) => (
              <Tr key={u.id}>
                <Td className="text-white">{u.email}</Td>
                <Td>{u.full_name ?? "—"}</Td>
                <Td className="text-white/50">{u.phone ?? "—"}</Td>
                <Td className="text-white/50">{new Date(u.created_at).toLocaleDateString()}</Td>
                <Td>{u.is_suspended ? <span className="text-red-400 text-[10px] uppercase">Suspended</span> : <span className="text-green-400 text-[10px] uppercase">Active</span>}</Td>
                <Td>
                  <div className="flex gap-2 justify-end">
                    <Btn onClick={() => setOpen(u.id)}>View</Btn>
                    <Btn variant={u.is_suspended ? "default" : "danger"} onClick={() => toggleSuspend(u)}>{u.is_suspended ? "Reactivate" : "Suspend"}</Btn>
                  </div>
                </Td>
              </Tr>
            ))}
            {(users ?? []).length === 0 && <Tr><Td className="text-white/40">No customers</Td><Td/><Td/><Td/><Td/><Td/></Tr>}
          </Table>
        </Card>
      )}
      {open && <CustomerModal id={open} onClose={() => setOpen(null)} />}
    </>
  );
}

function CustomerModal({ id, onClose }: { id: string; onClose: () => void }) {
  const get = useServerFn(getCustomerDetail);
  const reset = useServerFn(adminResetPassword);
  const del = useServerFn(adminDeleteUser);
  const { isSuperAdmin } = useAuth();
  const { data } = useQuery({ queryKey: ["customer-detail", id], queryFn: () => get({ data: { userId: id } }) });
  const profile = data?.profile as any;
  const orders = (data?.orders ?? []) as any[];

  async function onReset() {
    if (!confirm("Reset password and generate a temporary one?")) return;
    const r = await reset({ data: { userId: id } });
    prompt("Temporary password (share securely):", r.tempPassword);
  }
  async function onDelete() {
    if (!confirm("Permanently delete this user? This cannot be undone.")) return;
    await del({ data: { userId: id } });
    toast.success("User deleted");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0b0b0b] border border-white/10 w-full max-w-2xl p-6 my-8 text-white">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="font-display text-2xl">{profile?.full_name ?? profile?.email ?? "—"}</div>
            <div className="text-sm text-white/50 mt-1">{profile?.email}</div>
          </div>
          <Btn onClick={onClose}>Close</Btn>
        </div>
        {!data ? <div className="text-white/40">Loading…</div> : (
          <>
            <div className="grid grid-cols-2 gap-4 text-sm mb-6">
              <div><span className="text-white/50">Phone:</span> {profile?.phone ?? "—"}</div>
              <div><span className="text-white/50">Joined:</span> {new Date(profile?.created_at).toLocaleDateString()}</div>
              <div><span className="text-white/50">Roles:</span> {data.roles.join(", ") || "customer"}</div>
              <div><span className="text-white/50">Status:</span> {profile?.is_suspended ? "Suspended" : "Active"}</div>
            </div>

            <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-2">Order history ({orders.length})</div>
            <Card className="p-0 mb-6">
              <Table headers={["Order", "Status", "Total", "Date"]}>
                {orders.map((o) => <Tr key={o.id}><Td className="text-gold">{o.order_number}</Td><Td>{o.status}</Td><Td>{formatNaira(o.total_kobo)}</Td><Td className="text-white/50">{new Date(o.created_at).toLocaleDateString()}</Td></Tr>)}
                {orders.length === 0 && <Tr><Td className="text-white/40">No orders</Td><Td/><Td/><Td/></Tr>}
              </Table>
            </Card>

            {isSuperAdmin && (
              <div className="flex gap-2">
                <Btn onClick={onReset}>Reset password</Btn>
                <Btn variant="danger" onClick={onDelete}>Delete user</Btn>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
