import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { exportBackup, restoreBackup } from "@/lib/admin.functions";
import { AdminHeader, Card, Btn, Input, Textarea, Label } from "@/components/admin/ui";
import { useAuth } from "@/lib/use-auth";

import { requirePermission } from "@/lib/route-guards";

export const Route = createFileRoute("/admin/backups")({
  beforeLoad: async ({ location }) => { await requirePermission("backups.manage", location.pathname); },
  component: BackupsPage,
});

function BackupsPage() {
  const exp = useServerFn(exportBackup);
  const res = useServerFn(restoreBackup);
  const { isSuperAdmin } = useAuth();
  const [json, setJson] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  if (!isSuperAdmin) return <div className="text-white/60">Super admin access only.</div>;

  async function download() {
    setBusy(true);
    try {
      const snap = await exp();
      const blob = new Blob([JSON.stringify(snap, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `paul-billions-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      toast.success("Backup exported");
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  }

  async function restore() {
    if (confirm !== "RESTORE") return toast.error('Type RESTORE to confirm');
    setBusy(true);
    try {
      const snapshot = JSON.parse(json);
      await res({ data: { snapshot, confirm } });
      toast.success("Restore complete");
      setJson(""); setConfirm("");
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  }

  return (
    <>
      <AdminHeader title="Backups" subtitle="Export and restore your store's data" />
      <Card className="p-6 mb-6">
        <div className="text-[11px] uppercase tracking-[0.2em] text-white/60 mb-2">Export</div>
        <p className="text-sm text-white/60 mb-4">Download a JSON snapshot of all admin-managed tables (products, orders, categories, etc.).</p>
        <Btn variant="gold" onClick={download} disabled={busy}>Download backup</Btn>
      </Card>

      <Card className="p-6">
        <div className="text-[11px] uppercase tracking-[0.2em] text-white/60 mb-2">Restore</div>
        <p className="text-sm text-white/60 mb-4">Paste a previously exported snapshot. Existing records with the same IDs will be overwritten.</p>
        <div className="mb-3"><Label>Snapshot JSON</Label><Textarea rows={6} value={json} onChange={(e) => setJson(e.target.value)} className="w-full font-mono text-xs" /></div>
        <div className="mb-3"><Label>Type RESTORE to confirm</Label><Input value={confirm} onChange={(e) => setConfirm(e.target.value)} className="w-full" /></div>
        <Btn variant="danger" onClick={restore} disabled={busy || confirm !== "RESTORE"}>Restore from backup</Btn>
      </Card>
    </>
  );
}
