import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell } from "@/components/site/PageShell";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Sign in — Paul Billions" }] }),
});

type Mode = "signin" | "signup" | "forgot";

function LoginPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/account", data: { full_name: fullName } },
        });
        if (error) throw error;
        toast.success("Account created — check your email to verify.");
      } else if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + "/reset-password",
        });
        if (error) throw error;
        toast.success("Reset link sent — check your email.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Signed in");
        await supabase
          .from("login_history")
          .insert({ email, success: true, user_agent: navigator.userAgent } as any);
        nav({ to: "/account" });
      }
    } catch (err: any) {
      toast.error(err.message ?? "Auth failed");
      if (mode === "signin") {
        await supabase
          .from("login_history")
          .insert({ email, success: false, user_agent: navigator.userAgent } as any)
          .then(() => {}, () => {});
      }
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/account" },
    });
    if (error) toast.error(error.message);
  }

  const titles: Record<Mode, string> = {
    signin: "Sign In",
    signup: "Create Account",
    forgot: "Forgot Password",
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-md px-4 sm:px-0 py-16 sm:py-24">
        <div className="text-center mb-10">
          <p className="text-[11px] tracking-luxe uppercase text-gold mb-3">Welcome</p>
          <h1 className="font-display text-4xl">{titles[mode]}</h1>
        </div>

        {mode !== "forgot" && (
          <>
            <button
              onClick={google}
              className="w-full border border-border px-5 py-3.5 text-sm font-medium hover:border-foreground transition flex items-center justify-center gap-3"
            >
              <GoogleIcon /> Continue with Google
            </button>
            <div className="flex items-center gap-3 my-6 text-xs tracking-luxe uppercase text-foreground/50">
              <div className="flex-1 h-px bg-border" /> or <div className="flex-1 h-px bg-border" />
            </div>
          </>
        )}

        <form onSubmit={submit} className="space-y-4">
          {mode === "signup" && (
            <Field label="Full name" value={fullName} onChange={setFullName} type="text" required />
          )}
          <Field label="Email" value={email} onChange={setEmail} type="email" required />
          {mode !== "forgot" && (
            <Field label="Password" value={password} onChange={setPassword} type="password" required />
          )}
          {mode === "signin" && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => setMode("forgot")}
                className="text-xs text-foreground/60 hover:text-gold"
              >
                Forgot password?
              </button>
            </div>
          )}
          <button
            disabled={busy}
            className="w-full bg-black text-white px-8 py-4 text-xs tracking-luxe uppercase font-semibold hover:bg-gold hover:text-black transition-colors disabled:opacity-50"
          >
            {busy
              ? "Please wait…"
              : mode === "signin"
              ? "Sign in"
              : mode === "signup"
              ? "Create account"
              : "Send reset link"}
          </button>
        </form>

        <p className="text-center text-sm text-foreground/70 mt-8">
          {mode === "signin" && (
            <>
              New to Paul Billions?{" "}
              <button onClick={() => setMode("signup")} className="text-gold hover:underline">
                Create one
              </button>
            </>
          )}
          {mode === "signup" && (
            <>
              Already have an account?{" "}
              <button onClick={() => setMode("signin")} className="text-gold hover:underline">
                Sign in
              </button>
            </>
          )}
          {mode === "forgot" && (
            <button onClick={() => setMode("signin")} className="text-gold hover:underline">
              ← Back to sign in
            </button>
          )}
        </p>

        <p className="text-center text-xs text-foreground/50 mt-6">
          <Link to="/" className="hover:text-foreground">
            ← Back to home
          </Link>
        </p>
      </div>
    </PageShell>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  required,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[10px] tracking-luxe uppercase text-foreground/60 block mb-1.5">{label}</span>
      <input
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
        className="w-full border border-border px-4 py-3 text-sm focus:border-gold focus:outline-none"
      />
    </label>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6 29.3 4 24 4 16.3 4 9.7 8.4 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.4-4.5 2.4-7.2 2.4-5.2 0-9.6-3.1-11.3-7.5l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l6.2 5.2C40.9 35.3 44 30.1 44 24c0-1.2-.1-2.4-.4-3.5z" />
    </svg>
  );
}
