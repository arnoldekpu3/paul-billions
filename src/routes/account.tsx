import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart, Star, Trash2, Plus, Check, Bell, Package, LogOut } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { formatNaira } from "@/lib/mock-products";
import { toast } from "sonner";

export const Route = createFileRoute("/account")({
  component: AccountPage,
  head: () => ({ meta: [{ title: "My Account — Paul Billions" }] }),
});

const TABS = [
  "Profile",
  "Orders",
  "Addresses",
  "Wishlist",
  "Reviews",
  "Notifications",
  "Security",
] as const;
type Tab = (typeof TABS)[number];

function AccountPage() {
  const { user, loading } = useAuth();
  const [tab, setTab] = useState<Tab>("Profile");
  const nav = useNavigate();

  if (loading) {
    return (
      <PageShell>
        <div className="py-32 text-center text-foreground/60">Loading…</div>
      </PageShell>
    );
  }

  if (!user) {
    return (
      <PageShell>
        <div className="mx-auto max-w-md px-4 py-24 text-center">
          <h1 className="font-display text-4xl mb-3">My Account</h1>
          <p className="text-sm text-foreground/60 mb-8">Please sign in to view your account.</p>
          <Link
            to="/login"
            className="inline-block bg-black text-white px-8 py-4 text-xs tracking-luxe uppercase font-semibold hover:bg-gold hover:text-black transition-colors"
          >
            Sign in
          </Link>
        </div>
      </PageShell>
    );
  }

  async function signOut() {
    await supabase.auth.signOut();
    toast.success("Signed out");
    nav({ to: "/" });
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-[1100px] px-4 sm:px-8 py-10 sm:py-14">
        <div className="mb-10 flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] tracking-luxe uppercase text-gold mb-3">Welcome back</p>
            <h1 className="font-display text-4xl sm:text-5xl">My Account</h1>
            <p className="text-sm text-foreground/60 mt-3">{user.email}</p>
          </div>
          <button
            onClick={signOut}
            className="text-xs tracking-luxe uppercase text-foreground/70 hover:text-gold inline-flex items-center gap-1.5"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>

        <div className="flex gap-6 border-b border-border mb-10 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-4 text-xs tracking-luxe uppercase whitespace-nowrap ${
                tab === t ? "border-b-2 border-gold text-foreground -mb-px" : "text-foreground/60"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "Profile" && <ProfileTab userId={user.id} email={user.email!} />}
        {tab === "Orders" && <OrdersTab userId={user.id} />}
        {tab === "Addresses" && <AddressesTab userId={user.id} />}
        {tab === "Wishlist" && <WishlistTab userId={user.id} />}
        {tab === "Reviews" && <ReviewsTab userId={user.id} />}
        {tab === "Notifications" && <NotificationsTab userId={user.id} />}
        {tab === "Security" && <SecurityTab email={user.email!} />}
      </div>
    </PageShell>
  );
}

/* ---------------- Profile ---------------- */
function ProfileTab({ userId, email }: { userId: string; email: string }) {
  const [profile, setProfile] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle().then(({ data }) => setProfile(data ?? { id: userId, email, full_name: "", phone: "", avatar_url: "" }));
  }, [userId, email]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: profile.full_name, phone: profile.phone, avatar_url: profile.avatar_url })
      .eq("id", userId);
    setBusy(false);
    if (error) toast.error(error.message);
    else toast.success("Profile updated");
  }

  async function uploadAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const path = `${userId}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (error) return toast.error(error.message);
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    setProfile({ ...profile, avatar_url: data.publicUrl });
    toast.success("Image uploaded — click Save to apply");
  }

  async function updateEmail() {
    const next = prompt("New email address", profile?.email ?? email);
    if (!next || next === email) return;
    const { error } = await supabase.auth.updateUser({ email: next });
    if (error) toast.error(error.message);
    else toast.success("Confirmation email sent to " + next);
  }

  if (!profile) return <p className="text-sm text-foreground/60">Loading…</p>;

  return (
    <form onSubmit={save} className="max-w-lg space-y-5">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-muted overflow-hidden border border-border">
          {profile.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : null}
        </div>
        <label className="text-xs tracking-luxe uppercase text-foreground/70 cursor-pointer border border-border px-4 py-2.5 hover:border-gold hover:text-gold">
          Change photo
          <input type="file" accept="image/*" className="hidden" onChange={uploadAvatar} />
        </label>
      </div>
      <Field label="Full name" value={profile.full_name ?? ""} onChange={(v) => setProfile({ ...profile, full_name: v })} />
      <div>
        <label className="block">
          <span className="text-[10px] tracking-luxe uppercase text-foreground/60 block mb-1.5">Email</span>
          <div className="flex gap-2">
            <input value={email} disabled className="flex-1 border border-border px-4 py-3 text-sm bg-muted/40" />
            <button type="button" onClick={updateEmail} className="text-xs tracking-luxe uppercase border border-border px-4 hover:border-gold hover:text-gold">
              Change
            </button>
          </div>
        </label>
      </div>
      <Field label="Phone" type="tel" value={profile.phone ?? ""} onChange={(v) => setProfile({ ...profile, phone: v })} />
      <button
        disabled={busy}
        className="bg-black text-white px-8 py-3.5 text-xs tracking-luxe uppercase font-semibold hover:bg-gold hover:text-black transition disabled:opacity-50"
      >
        {busy ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}

/* ---------------- Orders ---------------- */
function OrdersTab({ userId }: { userId: string }) {
  const [orders, setOrders] = useState<any[]>([]);
  useEffect(() => {
    supabase
      .from("orders")
      .select("id, order_number, status, payment_status, total_kobo, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .then(({ data }) => setOrders(data ?? []));
  }, [userId]);

  if (orders.length === 0)
    return (
      <div className="text-center py-16 text-foreground/60">
        <Package className="mx-auto h-10 w-10 mb-4 opacity-40" />
        No orders yet. <Link to="/shop" className="text-gold underline ml-1">Start shopping</Link>.
      </div>
    );

  return (
    <div className="border-t border-border divide-y divide-border">
      {orders.map((o) => (
        <Link
          key={o.id}
          to="/order/$id"
          params={{ id: o.id }}
          className="flex flex-wrap items-center justify-between gap-3 py-5 hover:bg-muted/30 px-2"
        >
          <div>
            <p className="text-sm font-medium">{o.order_number}</p>
            <p className="text-xs text-foreground/60">{new Date(o.created_at).toLocaleDateString()}</p>
          </div>
          <div className="text-xs tracking-luxe uppercase text-gold">{o.status}</div>
          <div className="text-sm font-medium">{formatNaira(o.total_kobo / 100)}</div>
        </Link>
      ))}
    </div>
  );
}

/* ---------------- Addresses ---------------- */
function AddressesTab({ userId }: { userId: string }) {
  const [list, setList] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);

  async function refresh() {
    const { data } = await supabase.from("addresses").select("*").eq("user_id", userId).order("created_at");
    setList(data ?? []);
  }
  useEffect(() => {
    refresh();
  }, [userId]);

  async function save(form: any) {
    if (form.id) {
      const { error } = await supabase.from("addresses").update(form).eq("id", form.id);
      if (error) return toast.error(error.message);
    } else {
      const { error } = await supabase.from("addresses").insert({ ...form, user_id: userId });
      if (error) return toast.error(error.message);
    }
    if (form.is_default) {
      await supabase.from("addresses").update({ is_default: false }).eq("user_id", userId).neq("id", form.id ?? "00000000-0000-0000-0000-000000000000");
    }
    setEditing(null);
    refresh();
    toast.success("Address saved");
  }
  async function remove(id: string) {
    await supabase.from("addresses").delete().eq("id", id);
    refresh();
  }

  return (
    <div>
      <button
        onClick={() => setEditing({ recipient: "", line1: "", city: "", state: "", country: "Nigeria", is_default: false })}
        className="mb-6 inline-flex items-center gap-2 border border-border px-5 py-2.5 text-xs tracking-luxe uppercase hover:border-gold hover:text-gold"
      >
        <Plus className="h-3.5 w-3.5" /> Add address
      </button>
      <div className="grid sm:grid-cols-2 gap-4">
        {list.map((a) => (
          <div key={a.id} className="border border-border p-5">
            <div className="flex justify-between mb-2">
              <p className="text-sm font-medium">{a.recipient}</p>
              {a.is_default && <span className="text-[10px] tracking-luxe uppercase text-gold">Default</span>}
            </div>
            <p className="text-sm text-foreground/70">{a.line1}{a.line2 ? `, ${a.line2}` : ""}</p>
            <p className="text-sm text-foreground/70">{a.city}, {a.state} {a.postal_code ?? ""}</p>
            <p className="text-sm text-foreground/70">{a.country}</p>
            <p className="text-xs text-foreground/60 mt-1">{a.phone}</p>
            <div className="flex gap-3 mt-3">
              <button onClick={() => setEditing(a)} className="text-xs tracking-luxe uppercase hover:text-gold">Edit</button>
              <button onClick={() => remove(a.id)} className="text-xs tracking-luxe uppercase text-foreground/60 hover:text-red-600">Delete</button>
            </div>
          </div>
        ))}
        {list.length === 0 && <p className="text-sm text-foreground/60">No saved addresses.</p>}
      </div>

      {editing && <AddressDialog initial={editing} onClose={() => setEditing(null)} onSave={save} />}
    </div>
  );
}

function AddressDialog({ initial, onClose, onSave }: { initial: any; onClose: () => void; onSave: (v: any) => void }) {
  const [f, setF] = useState(initial);
  return (
    <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => { e.preventDefault(); onSave(f); }}
        className="bg-white max-w-lg w-full p-7 max-h-[90vh] overflow-auto"
      >
        <h3 className="font-display text-xl mb-5">{initial.id ? "Edit address" : "New address"}</h3>
        <div className="space-y-4">
          <Field label="Recipient" value={f.recipient ?? ""} onChange={(v) => setF({ ...f, recipient: v })} />
          <Field label="Phone" value={f.phone ?? ""} onChange={(v) => setF({ ...f, phone: v })} />
          <Field label="Address" value={f.line1 ?? ""} onChange={(v) => setF({ ...f, line1: v })} />
          <Field label="Apartment" value={f.line2 ?? ""} onChange={(v) => setF({ ...f, line2: v })} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="City" value={f.city ?? ""} onChange={(v) => setF({ ...f, city: v })} />
            <Field label="State" value={f.state ?? ""} onChange={(v) => setF({ ...f, state: v })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Postal" value={f.postal_code ?? ""} onChange={(v) => setF({ ...f, postal_code: v })} />
            <Field label="Country" value={f.country ?? "Nigeria"} onChange={(v) => setF({ ...f, country: v })} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={!!f.is_default} onChange={(e) => setF({ ...f, is_default: e.target.checked })} />
            Make default
          </label>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button type="button" onClick={onClose} className="text-xs tracking-luxe uppercase text-foreground/60 hover:text-foreground">
            Cancel
          </button>
          <button className="bg-black text-white px-6 py-3 text-xs tracking-luxe uppercase hover:bg-gold hover:text-black">
            Save
          </button>
        </div>
      </form>
    </div>
  );
}

/* ---------------- Wishlist ---------------- */
function WishlistTab({ userId }: { userId: string }) {
  const [items, setItems] = useState<any[]>([]);
  async function refresh() {
    const { data } = await supabase.from("wishlist_items").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    setItems(data ?? []);
  }
  useEffect(() => { refresh(); }, [userId]);

  async function remove(id: string) {
    await supabase.from("wishlist_items").delete().eq("id", id);
    refresh();
  }

  if (items.length === 0)
    return (
      <div className="text-center py-16 text-foreground/60">
        <Heart className="mx-auto h-10 w-10 mb-4 opacity-40" />
        Your wishlist is empty.
      </div>
    );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map((w) => (
        <div key={w.id} className="group">
          <Link to="/product/$slug" params={{ slug: w.product_slug }} className="block aspect-[3/4] bg-muted overflow-hidden">
            <img src={w.product_image} alt={w.product_name} className="w-full h-full object-cover group-hover:scale-105 transition" />
          </Link>
          <div className="pt-2 flex justify-between">
            <div>
              <p className="text-sm font-medium">{w.product_name}</p>
              {w.unit_price_kobo && <p className="text-xs text-foreground/70">{formatNaira(w.unit_price_kobo / 100)}</p>}
            </div>
            <button onClick={() => remove(w.id)} aria-label="Remove" className="text-foreground/40 hover:text-red-500">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- Reviews ---------------- */
function ReviewsTab({ userId }: { userId: string }) {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("reviews").select("*").eq("user_id", userId).order("created_at", { ascending: false }).then(({ data }) => setItems(data ?? []));
  }, [userId]);

  if (items.length === 0)
    return (
      <div className="text-center py-16 text-foreground/60">
        <Star className="mx-auto h-10 w-10 mb-4 opacity-40" />
        You haven't written any reviews yet. Visit a product page to leave one.
      </div>
    );

  return (
    <div className="divide-y divide-border border-t border-border">
      {items.map((r) => (
        <div key={r.id} className="py-5">
          <Link to="/product/$slug" params={{ slug: r.product_slug }} className="text-sm font-medium hover:text-gold">
            {r.title || r.product_slug}
          </Link>
          <div className="flex gap-1 my-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className={`h-3.5 w-3.5 ${s <= r.rating ? "fill-gold text-gold" : "text-foreground/30"}`} />
            ))}
          </div>
          <p className="text-sm text-foreground/70">{r.body}</p>
        </div>
      ))}
    </div>
  );
}

/* ---------------- Notifications ---------------- */
function NotificationsTab({ userId }: { userId: string }) {
  const [list, setList] = useState<any[]>([]);
  async function refresh() {
    const { data } = await supabase.from("notifications").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    setList(data ?? []);
  }
  useEffect(() => { refresh(); }, [userId]);

  async function markAllRead() {
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", userId).eq("is_read", false);
    refresh();
  }

  if (list.length === 0)
    return (
      <div className="text-center py-16 text-foreground/60">
        <Bell className="mx-auto h-10 w-10 mb-4 opacity-40" />
        No notifications yet.
      </div>
    );

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={markAllRead} className="text-xs tracking-luxe uppercase text-foreground/70 hover:text-gold inline-flex items-center gap-1">
          <Check className="h-3.5 w-3.5" /> Mark all read
        </button>
      </div>
      <div className="divide-y divide-border border-t border-border">
        {list.map((n) => (
          <div key={n.id} className={`py-4 ${!n.is_read ? "bg-muted/30 px-3" : ""}`}>
            <div className="flex justify-between gap-3">
              <p className="text-sm font-medium">{n.title}</p>
              <span className="text-[10px] tracking-luxe uppercase text-foreground/50">{new Date(n.created_at).toLocaleDateString()}</span>
            </div>
            {n.body && <p className="text-sm text-foreground/70 mt-1">{n.body}</p>}
            {n.link && <Link to={n.link as any} className="text-xs text-gold hover:underline">View</Link>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Security ---------------- */
function SecurityTab({ email }: { email: string }) {
  const [pwd, setPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  async function change(e: React.FormEvent) {
    e.preventDefault();
    if (pwd.length < 8) return toast.error("Use at least 8 characters");
    if (pwd !== confirm) return toast.error("Passwords do not match");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pwd });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated");
    setPwd(""); setConfirm("");
  }

  async function sendReset() {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/reset-password",
    });
    if (error) toast.error(error.message);
    else toast.success("Reset link sent to " + email);
  }

  return (
    <div className="max-w-lg space-y-10">
      <form onSubmit={change} className="space-y-4">
        <h2 className="font-display text-xl">Change password</h2>
        <Field label="New password" type="password" value={pwd} onChange={setPwd} />
        <Field label="Confirm password" type="password" value={confirm} onChange={setConfirm} />
        <button
          disabled={busy}
          className="bg-black text-white px-8 py-3.5 text-xs tracking-luxe uppercase font-semibold hover:bg-gold hover:text-black transition disabled:opacity-50"
        >
          {busy ? "Updating…" : "Update password"}
        </button>
      </form>

      <div className="border-t border-border pt-8 space-y-3">
        <h2 className="font-display text-xl">Account security</h2>
        <p className="text-sm text-foreground/70">
          Forgot your password? We'll send a reset link to your inbox.
        </p>
        <button onClick={sendReset} className="border border-border px-5 py-2.5 text-xs tracking-luxe uppercase hover:border-gold hover:text-gold">
          Send reset email
        </button>
      </div>
    </div>
  );
}

/* ---------------- shared ---------------- */
function Field({
  label, value, onChange, type = "text",
}: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="text-[10px] tracking-luxe uppercase text-foreground/60 block mb-1.5">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-border px-4 py-3 text-sm focus:border-gold focus:outline-none"
      />
    </label>
  );
}
