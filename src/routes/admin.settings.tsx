import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { listRows, upsertRow, deleteRow } from "@/lib/admin.functions";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { AdminHeader, Card, Table, Td, Tr, Btn, Input, Label } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/settings")({ component: SettingsPage });

const DEFAULT_KEYS = [
  { key: "store_name", label: "Store name", default: "PAUL BILLIONS" },
  { key: "store_email", label: "Contact email", default: "info@paulbillions.com" },
  { key: "store_phone", label: "Contact phone", default: "+234 800 000 0000" },
  { key: "currency", label: "Currency", default: "NGN" },
  { key: "shipping_flat_kobo", label: "Flat shipping (kobo)", default: "200000" },
  { key: "instagram", label: "Instagram URL", default: "" },
  { key: "whatsapp", label: "WhatsApp number", default: "" },
];

function SettingsPage() {
  const list = useServerFn(listRows);
  const up = useServerFn(upsertRow);
  const del = useServerFn(deleteRow);
  const qc = useQueryClient();
  const { isSuperAdmin } = useAuth();
  const { data: rows } = useQuery({ queryKey: ["settings"], queryFn: () => list({ data: { table: "site_settings" } }) });
  const byKey: Record<string, any> = {};
  for (const r of rows ?? []) byKey[(r as any).key] = (r as any).value;

  async function save(key: string, value: any, isPublic = true) {
    await up({ data: { table: "site_settings", row: { key, value, is_public: isPublic } } });
    toast.success("Saved");
    qc.invalidateQueries({ queryKey: ["settings"] });
  }

  return (
    <>
      <AdminHeader title="Website Settings" subtitle="Configure storefront details" />

      <Card className="p-6 mb-6">
        <div className="text-[11px] uppercase tracking-[0.2em] text-white/60 mb-4">General</div>
        <div className="grid sm:grid-cols-2 gap-4">
          {DEFAULT_KEYS.map((k) => (
            <SettingField key={k.key} k={k} value={byKey[k.key]} onSave={(v) => save(k.key, v)} />
          ))}
        </div>
      </Card>

      {isSuperAdmin && <ClaimCard hasSuper={!!byKey["__not_used__"]} />}
    </>
  );
}

function SettingField({ k, value, onSave }: { k: { key: string; label: string; default: string }; value: any; onSave: (v: any) => void }) {
  const [v, setV] = useState(value ?? k.default);
  return (
    <div>
      <Label>{k.label}</Label>
      <div className="flex gap-2">
        <Input value={v} onChange={(e) => setV(e.target.value)} className="flex-1" />
        <Btn onClick={() => onSave(v)}>Save</Btn>
      </div>
    </div>
  );
}

function ClaimCard({ hasSuper }: { hasSuper: boolean }) {
  async function claim() {
    const { data, error } = await supabase.rpc("claim_super_admin");
    if (error) return toast.error(error.message);
    if ((data as any)?.ok) toast.success("Claimed");
    else toast.error("A super admin already exists");
  }
  return (
    <Card className="p-6">
      <div className="text-[11px] uppercase tracking-[0.2em] text-white/60 mb-2">Bootstrap</div>
      <p className="text-sm text-white/60 mb-4">Claim the super-admin role if none exists yet.</p>
      <Btn onClick={claim}>Claim super admin</Btn>
    </Card>
  );
}
