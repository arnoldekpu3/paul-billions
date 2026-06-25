import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/site/PageShell";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
  head: () => ({ meta: [{ title: "Reset password — Paul Billions" }] }),
});

function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    // Supabase puts a recovery token in the URL hash; the client picks it up
    // automatically and emits PASSWORD_RECOVERY. We just need a live session.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) return toast.error("Use at least 8 characters");
    if (password !== confirm) return toast.error("Passwords do not match");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated");
    nav({ to: "/account" });
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-md px-4 sm:px-0 py-16 sm:py-24">
        <div className="text-center mb-10">
          <p className="text-[11px] tracking-luxe uppercase text-gold mb-3">Security</p>
          <h1 className="font-display text-4xl">Reset password</h1>
        </div>
        {!ready ? (
          <p className="text-center text-sm text-foreground/70">
            Open the reset link from your email to continue. <br />
            <Link to="/login" className="text-gold underline mt-3 inline-block">Back to sign in</Link>
          </p>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <Field label="New password" type="password" value={password} onChange={setPassword} />
            <Field label="Confirm password" type="password" value={confirm} onChange={setConfirm} />
            <button
              disabled={busy}
              className="w-full bg-black text-white px-8 py-4 text-xs tracking-luxe uppercase font-semibold hover:bg-gold hover:text-black transition-colors disabled:opacity-50"
            >
              {busy ? "Updating…" : "Update password"}
            </button>
          </form>
        )}
      </div>
    </PageShell>
  );
}

function Field({ label, type, value, onChange }: { label: string; type: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-[10px] tracking-luxe uppercase text-foreground/60 block mb-1.5">{label}</span>
      <input
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
        className="w-full border border-border px-4 py-3 text-sm focus:border-gold focus:outline-none"
      />
    </label>
  );
}
