import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { listRows, upsertRow, deleteRow, createUploadUrl } from "@/lib/admin.functions";
import { supabase } from "@/integrations/supabase/client";
import { AdminHeader, Card, Table, Td, Tr, Btn, Input, Textarea, Select, Label } from "./ui";

export type Field = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "number" | "boolean" | "select" | "datetime-local" | "image";
  required?: boolean;
  options?: string[];
  bucket?: "product-images" | "banners" | "avatars";
};

type Table = "categories" | "coupons" | "banners" | "testimonials" | "newsletter_campaigns" | "site_settings";

export function CrudPage({ title, table, fields, columns }: { title: string; table: Table; fields: Field[]; columns: string[] }) {
  const list = useServerFn(listRows);
  const up = useServerFn(upsertRow);
  const del = useServerFn(deleteRow);
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any | null>(null);
  const { data: rows, isLoading } = useQuery({ queryKey: ["crud", table], queryFn: () => list({ data: { table } }) });

  async function onDelete(id: string) {
    if (!confirm("Delete this item?")) return;
    await del({ data: { table, id } });
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["crud", table] });
  }

  return (
    <>
      <AdminHeader title={title} subtitle={`${rows?.length ?? 0} items`} actions={<Btn variant="gold" onClick={() => setEditing({})}>+ New</Btn>} />

      {isLoading ? <div className="text-white/40 text-sm">Loading…</div> : (
        <Card className="p-0">
          <Table headers={[...columns, ""]}>
            {(rows ?? []).map((r: any) => (
              <Tr key={r.id}>
                {columns.map((c) => (
                  <Td key={c}>{renderCell(r[c])}</Td>
                ))}
                <Td>
                  <div className="flex gap-2 justify-end">
                    <Btn onClick={() => setEditing(r)}>Edit</Btn>
                    <Btn variant="danger" onClick={() => onDelete(r.id)}>Delete</Btn>
                  </div>
                </Td>
              </Tr>
            ))}
            {(rows ?? []).length === 0 && <Tr><Td className="text-white/40">Nothing yet</Td>{columns.slice(1).map((c) => <Td key={c} />)}<Td/></Tr>}
          </Table>
        </Card>
      )}

      {editing && <Editor table={table} fields={fields} row={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); qc.invalidateQueries({ queryKey: ["crud", table] }); }} />}
    </>
  );
}

function renderCell(v: any) {
  if (v === null || v === undefined || v === "") return <span className="text-white/30">—</span>;
  if (typeof v === "boolean") return v ? <span className="text-green-400">✓</span> : <span className="text-white/30">—</span>;
  if (typeof v === "string" && v.length > 60) return v.slice(0, 60) + "…";
  return String(v);
}

function Editor({ table, fields, row, onClose, onSaved }: { table: Table; fields: Field[]; row: any; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<any>(() => {
    const init: any = { ...row };
    for (const f of fields) if (init[f.key] === undefined) init[f.key] = f.type === "boolean" ? false : "";
    return init;
  });
  const up = useServerFn(upsertRow);
  const sign = useServerFn(createUploadUrl);
  const [busy, setBusy] = useState(false);

  async function uploadImage(f: Field, file: File) {
    if (!f.bucket) return;
    const path = `${Date.now()}-${file.name.replace(/[^a-z0-9.]/gi, "_")}`;
    const signed = await sign({ data: { bucket: f.bucket, path } });
    const { error } = await supabase.storage.from(f.bucket).uploadToSignedUrl(signed.path, signed.token, file);
    if (error) throw error;
    setForm((x: any) => ({ ...x, [f.key]: signed.publicUrl }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const payload: any = { ...form };
      for (const f of fields) {
        if (f.type === "number" && payload[f.key] !== "" && payload[f.key] !== null) payload[f.key] = Number(payload[f.key]);
        if (f.type === "datetime-local" && payload[f.key] === "") payload[f.key] = null;
      }
      await up({ data: { table, row: payload } });
      toast.success("Saved");
      onSaved();
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
      <form onSubmit={submit} className="bg-[#0b0b0b] border border-white/10 w-full max-w-xl p-6 my-8">
        <div className="font-display text-2xl mb-6 text-white">{row.id ? "Edit" : "New"}</div>
        <div className="space-y-4">
          {fields.map((f) => (
            <div key={f.key}>
              <Label>{f.label}</Label>
              {f.type === "textarea" ? (
                <Textarea rows={4} required={f.required} value={form[f.key] ?? ""} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} className="w-full" />
              ) : f.type === "boolean" ? (
                <label className="flex items-center gap-2 text-sm text-white"><input type="checkbox" checked={!!form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.checked })} />Enabled</label>
              ) : f.type === "select" ? (
                <Select value={form[f.key] ?? ""} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} className="w-full">
                  <option value="">—</option>
                  {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                </Select>
              ) : f.type === "image" ? (
                <div className="space-y-2">
                  {form[f.key] && <img src={form[f.key]} className="w-32 h-32 object-cover" alt="" />}
                  <Input value={form[f.key] ?? ""} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} placeholder="https://… or upload below" className="w-full" />
                  <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadImage(f, e.target.files[0])} className="text-xs text-white/60" />
                </div>
              ) : (
                <Input
                  type={f.type ?? "text"}
                  required={f.required}
                  value={form[f.key] ?? ""}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  className="w-full"
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn type="submit" variant="gold" disabled={busy}>{busy ? "Saving…" : "Save"}</Btn>
        </div>
      </form>
    </div>
  );
}
