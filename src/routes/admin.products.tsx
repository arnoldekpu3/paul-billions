import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { listProductsAdmin, upsertProduct, softDeleteProduct, hardDeleteProduct, listRows, createUploadUrl } from "@/lib/admin.functions";
import { AdminHeader, Card, Table, Td, Tr, Btn, Input, Textarea, Select, Label, formatNaira } from "@/components/admin/ui";
import { useAuth } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/products")({ component: ProductsPage });

function ProductsPage() {
  const [tab, setTab] = useState<"active" | "trash">("active");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<any | null>(null);
  const list = useServerFn(listProductsAdmin);
  const del = useServerFn(softDeleteProduct);
  const hardDel = useServerFn(hardDeleteProduct);
  const cats = useServerFn(listRows);
  const qc = useQueryClient();
  const { isSuperAdmin } = useAuth();

  const { data: products, isLoading } = useQuery({
    queryKey: ["admin-products", tab, search],
    queryFn: () => list({ data: { trash: tab === "trash", search } }),
  });
  const { data: categories } = useQuery({ queryKey: ["cats"], queryFn: () => cats({ data: { table: "categories" } }) });

  async function onDelete(id: string, restore = false) {
    if (!confirm(restore ? "Restore this product?" : "Move to trash?")) return;
    await del({ data: { id, restore } });
    toast.success(restore ? "Restored" : "Moved to trash");
    qc.invalidateQueries({ queryKey: ["admin-products"] });
  }
  async function onHard(id: string) {
    if (!confirm("Permanently delete? This cannot be undone.")) return;
    await hardDel({ data: { id } });
    toast.success("Deleted permanently");
    qc.invalidateQueries({ queryKey: ["admin-products"] });
  }

  return (
    <>
      <AdminHeader
        title="Products"
        subtitle={`${products?.length ?? 0} ${tab === "trash" ? "in trash" : "products"}`}
        actions={<Btn variant="gold" onClick={() => setEditing({})}>+ New Product</Btn>}
      />

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex border border-white/10">
          <button onClick={() => setTab("active")} className={`px-4 py-2 text-[11px] uppercase tracking-[0.2em] ${tab === "active" ? "bg-gold text-black" : "text-white/60"}`}>Active</button>
          <button onClick={() => setTab("trash")} className={`px-4 py-2 text-[11px] uppercase tracking-[0.2em] ${tab === "trash" ? "bg-gold text-black" : "text-white/60"}`}>Trash</button>
        </div>
        <Input placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 min-w-[180px]" />
      </div>

      {isLoading ? <div className="text-white/40 text-sm">Loading…</div> : (
        <Card className="p-0">
          <Table headers={["", "Name", "Category", "Price", "Stock", "Status", ""]}>
            {(products ?? []).map((p: any) => (
              <Tr key={p.id}>
                <Td>
                  {p.images?.[0] ? <img src={p.images[0]} className="w-10 h-10 object-cover" alt="" /> : <div className="w-10 h-10 bg-white/5" />}
                </Td>
                <Td className="text-white">{p.name}</Td>
                <Td className="text-white/50">{p.categories?.name ?? "—"}</Td>
                <Td>{formatNaira(p.price_kobo)}</Td>
                <Td className={p.stock < 5 ? "text-red-400" : ""}>{p.stock}</Td>
                <Td>{p.is_active ? <span className="text-green-400 text-[10px] uppercase">Active</span> : <span className="text-white/40 text-[10px] uppercase">Hidden</span>}</Td>
                <Td>
                  <div className="flex gap-2 justify-end">
                    {tab === "active" ? (
                      <>
                        <Btn onClick={() => setEditing(p)}>Edit</Btn>
                        <Btn variant="danger" onClick={() => onDelete(p.id)}>Trash</Btn>
                      </>
                    ) : (
                      <>
                        <Btn onClick={() => onDelete(p.id, true)}>Restore</Btn>
                        {isSuperAdmin && <Btn variant="danger" onClick={() => onHard(p.id)}>Delete</Btn>}
                      </>
                    )}
                  </div>
                </Td>
              </Tr>
            ))}
            {(products ?? []).length === 0 && <Tr><Td className="text-white/40">No products</Td><Td/><Td/><Td/><Td/><Td/><Td/></Tr>}
          </Table>
        </Card>
      )}

      {editing && <ProductEditor product={editing} categories={categories ?? []} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); qc.invalidateQueries({ queryKey: ["admin-products"] }); }} />}
    </>
  );
}

function ProductEditor({ product, categories, onClose, onSaved }: { product: any; categories: any[]; onClose: () => void; onSaved: () => void }) {
  const isNew = !product.id;
  const [form, setForm] = useState({
    id: product.id,
    name: product.name ?? "",
    slug: product.slug ?? "",
    description: product.description ?? "",
    price_kobo: product.price_kobo ?? 0,
    compare_at_kobo: product.compare_at_kobo ?? "",
    category_id: product.category_id ?? "",
    stock: product.stock ?? 0,
    images: product.images ?? [],
    sizes: (product.sizes ?? []).join(","),
    colors: (product.colors ?? []).join(","),
    is_featured: !!product.is_featured,
    is_active: product.is_active !== false,
  });
  const save = useServerFn(upsertProduct);
  const sign = useServerFn(createUploadUrl);
  const [busy, setBusy] = useState(false);

  async function upload(file: File) {
    const path = `${Date.now()}-${file.name.replace(/[^a-z0-9.]/gi, "_")}`;
    const signed = await sign({ data: { bucket: "product-images", path } });
    const { error } = await supabase.storage.from("product-images").uploadToSignedUrl(signed.path, signed.token, file);
    if (error) throw error;
    return signed.publicUrl;
  }

  async function onFiles(files: FileList | null) {
    if (!files) return;
    setBusy(true);
    try {
      const urls: string[] = [];
      for (const f of Array.from(files)) urls.push(await upload(f));
      setForm((f) => ({ ...f, images: [...f.images, ...urls] }));
      toast.success(`${urls.length} image(s) uploaded`);
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = {
        ...form,
        slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
        sizes: form.sizes.split(",").map((s: string) => s.trim()).filter(Boolean),
        colors: form.colors.split(",").map((s: string) => s.trim()).filter(Boolean),
        compare_at_kobo: form.compare_at_kobo === "" ? null : Number(form.compare_at_kobo),
      };
      await save({ data: payload });
      toast.success(isNew ? "Product created" : "Product saved");
      onSaved();
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
      <form onSubmit={submit} className="bg-[#0b0b0b] border border-white/10 w-full max-w-2xl p-6 my-8">
        <div className="font-display text-2xl mb-6 text-white">{isNew ? "New Product" : "Edit Product"}</div>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2"><Label>Name</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="col-span-2"><Label>Slug (URL)</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated from name" /></div>
          <div className="col-span-2"><Label>Description</Label><Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div><Label>Price (kobo)</Label><Input type="number" required value={form.price_kobo} onChange={(e) => setForm({ ...form, price_kobo: Number(e.target.value) })} /></div>
          <div><Label>Compare at (kobo)</Label><Input type="number" value={form.compare_at_kobo as any} onChange={(e) => setForm({ ...form, compare_at_kobo: e.target.value as any })} /></div>
          <div><Label>Stock</Label><Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} /></div>
          <div><Label>Category</Label>
            <Select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
              <option value="">— none —</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </div>
          <div><Label>Sizes (comma-separated)</Label><Input value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} placeholder="S, M, L, XL" /></div>
          <div><Label>Colors (comma-separated)</Label><Input value={form.colors} onChange={(e) => setForm({ ...form, colors: e.target.value })} placeholder="Black, Gold" /></div>
          <div className="col-span-2">
            <Label>Images</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {form.images.map((u: string, i: number) => (
                <div key={i} className="relative">
                  <img src={u} className="w-20 h-20 object-cover" alt="" />
                  <button type="button" onClick={() => setForm((f) => ({ ...f, images: f.images.filter((_: any, j: number) => j !== i) }))}
                    className="absolute top-0 right-0 bg-red-500 text-white w-5 h-5 text-xs">×</button>
                </div>
              ))}
            </div>
            <input type="file" accept="image/*" multiple onChange={(e) => onFiles(e.target.files)} className="text-xs text-white/60" />
          </div>
          <label className="flex items-center gap-2 text-sm text-white"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />Active</label>
          <label className="flex items-center gap-2 text-sm text-white"><input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} />Featured</label>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn type="submit" variant="gold" disabled={busy}>{busy ? "Saving…" : "Save"}</Btn>
        </div>
      </form>
    </div>
  );
}
