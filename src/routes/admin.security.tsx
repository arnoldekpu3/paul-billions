import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { listAuditLogs, listLoginHistory } from "@/lib/admin.functions";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { AdminHeader, Card, Table, Td, Tr, Btn } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/security")({ component: SecurityPage });

function SecurityPage() {
  const { isSuperAdmin } = useAuth();
  const [tab, setTab] = useState<"audit" | "logins" | "mfa">(isSuperAdmin ? "audit" : "mfa");
  const audit = useServerFn(listAuditLogs);
  const logins = useServerFn(listLoginHistory);
  const { data: auditRows } = useQuery({ queryKey: ["audit"], queryFn: () => audit(), enabled: isSuperAdmin && tab === "audit" });
  const { data: loginRows } = useQuery({ queryKey: ["logins"], queryFn: () => logins(), enabled: isSuperAdmin && tab === "logins" });

  return (
    <>
      <AdminHeader title="Security" subtitle={isSuperAdmin ? "Audit logs, login history, and two-factor auth" : "Two-factor authentication for your account"} />
      <div className="flex gap-1 mb-6 border border-white/10 w-fit">
        {(isSuperAdmin ? (["audit", "logins", "mfa"] as const) : (["mfa"] as const)).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-[11px] uppercase tracking-[0.2em] ${tab === t ? "bg-gold text-black" : "text-white/60"}`}>
            {t === "audit" ? "Audit log" : t === "logins" ? "Login history" : "Two-factor auth"}
          </button>
        ))}
      </div>

      {tab === "audit" && isSuperAdmin && (
        <Card className="p-0">
          <Table headers={["When", "Actor", "Action", "Entity", "Metadata"]}>
            {(auditRows ?? []).map((r: any) => (
              <Tr key={r.id}>
                <Td className="text-white/50">{new Date(r.created_at).toLocaleString()}</Td>
                <Td className="text-white/60 font-mono text-xs">{r.actor_id?.slice(0, 8) ?? "—"}</Td>
                <Td className="text-gold">{r.action}</Td>
                <Td>{r.entity}{r.entity_id ? ` · ${r.entity_id.slice(0, 8)}` : ""}</Td>
                <Td className="text-white/40 text-xs font-mono">{r.metadata ? JSON.stringify(r.metadata).slice(0, 60) : ""}</Td>
              </Tr>
            ))}
            {(auditRows ?? []).length === 0 && <Tr><Td className="text-white/40">No audit events yet</Td><Td/><Td/><Td/><Td/></Tr>}
          </Table>
        </Card>
      )}

      {tab === "logins" && isSuperAdmin && (
        <Card className="p-0">
          <Table headers={["When", "Email", "Success", "User Agent"]}>
            {(loginRows ?? []).map((r: any) => (
              <Tr key={r.id}>
                <Td className="text-white/50">{new Date(r.created_at).toLocaleString()}</Td>
                <Td>{r.email}</Td>
                <Td>{r.success ? <span className="text-green-400">✓</span> : <span className="text-red-400">✗</span>}</Td>
                <Td className="text-white/40 text-xs truncate max-w-xs">{r.user_agent}</Td>
              </Tr>
            ))}
            {(loginRows ?? []).length === 0 && <Tr><Td className="text-white/40">No logins recorded</Td><Td/><Td/><Td/></Tr>}
          </Table>
        </Card>
      )}

      {tab === "mfa" && <MfaPanel />}
    </>
  );
}

function MfaPanel() {
  const [enrolling, setEnrolling] = useState<{ qr: string; secret: string; factorId: string } | null>(null);
  const [code, setCode] = useState("");

  async function start() {
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp" });
    if (error) return toast.error(error.message);
    setEnrolling({ qr: data.totp.qr_code, secret: data.totp.secret, factorId: data.id });
  }
  async function verify() {
    if (!enrolling) return;
    const { data: ch, error: chErr } = await supabase.auth.mfa.challenge({ factorId: enrolling.factorId });
    if (chErr) return toast.error(chErr.message);
    const { error } = await supabase.auth.mfa.verify({ factorId: enrolling.factorId, challengeId: ch.id, code });
    if (error) return toast.error(error.message);
    toast.success("Two-factor auth enabled");
    setEnrolling(null);
  }
  async function unenrollAll() {
    const { data } = await supabase.auth.mfa.listFactors();
    for (const f of [...(data?.totp ?? []), ...(data?.phone ?? [])]) {
      await supabase.auth.mfa.unenroll({ factorId: f.id });
    }
    toast.success("All factors removed");
  }

  return (
    <Card className="p-6">
      <div className="text-white/80 text-sm mb-4">Enroll a TOTP authenticator (Google Authenticator, 1Password, Authy) for an extra layer of security.</div>
      {!enrolling ? (
        <div className="flex gap-2">
          <Btn variant="gold" onClick={start}>Enroll authenticator</Btn>
          <Btn variant="danger" onClick={unenrollAll}>Remove all factors</Btn>
        </div>
      ) : (
        <div className="space-y-4">
          <img src={enrolling.qr} alt="QR" className="bg-white p-2 w-48" />
          <div className="text-xs text-white/50">Or enter secret manually: <span className="font-mono text-gold">{enrolling.secret}</span></div>
          <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="6-digit code" className="bg-black border border-white/15 text-white px-3 py-2 text-sm" />
          <div className="flex gap-2"><Btn variant="gold" onClick={verify}>Verify & enable</Btn><Btn onClick={() => setEnrolling(null)}>Cancel</Btn></div>
        </div>
      )}
    </Card>
  );
}
