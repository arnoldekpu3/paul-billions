import { ReactNode } from "react";

export function AdminHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-8 flex-wrap">
      <div>
        <h1 className="font-display text-3xl text-white">{title}</h1>
        {subtitle && <p className="text-sm text-white/50 mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`border border-white/10 bg-white/[0.02] ${className}`}>{children}</div>;
}

export function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <Card className="p-5">
      <div className="text-[10px] uppercase tracking-[0.25em] text-white/40">{label}</div>
      <div className="font-display text-3xl text-white mt-2">{value}</div>
      {hint && <div className="text-[11px] text-white/40 mt-1">{hint}</div>}
    </Card>
  );
}

export function Table({ headers, children }: { headers: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto border border-white/10">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 bg-white/[0.03]">
            {headers.map((h) => (
              <th key={h} className="text-left text-[10px] uppercase tracking-[0.2em] text-white/40 px-4 py-3 font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Td({ children, className = "" }: { children?: ReactNode; className?: string }) {
  return <td className={`px-4 py-3 text-white/80 border-b border-white/5 ${className}`}>{children}</td>;
}

export function Tr({ children }: { children: ReactNode }) {
  return <tr className="hover:bg-white/[0.03]">{children}</tr>;
}

export function Btn({ children, onClick, variant = "default", type = "button", disabled, className = "" }: {
  children: ReactNode; onClick?: () => void; variant?: "default" | "gold" | "danger" | "ghost"; type?: "button" | "submit"; disabled?: boolean; className?: string;
}) {
  const styles = {
    default: "border border-white/15 text-white hover:border-white/40",
    gold: "bg-gold text-black hover:bg-white",
    danger: "border border-red-500/40 text-red-400 hover:bg-red-500/10",
    ghost: "text-white/60 hover:text-white",
  }[variant];
  return (
    <button type={type} disabled={disabled} onClick={onClick}
      className={`px-4 py-2 text-[11px] uppercase tracking-[0.2em] font-medium transition disabled:opacity-50 ${styles} ${className}`}>
      {children}
    </button>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`bg-black border border-white/15 text-white px-3 py-2 text-sm focus:border-gold focus:outline-none ${props.className ?? ""}`} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`bg-black border border-white/15 text-white px-3 py-2 text-sm focus:border-gold focus:outline-none ${props.className ?? ""}`} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`bg-black border border-white/15 text-white px-3 py-2 text-sm focus:border-gold focus:outline-none ${props.className ?? ""}`} />;
}

export function Label({ children }: { children: ReactNode }) {
  return <div className="text-[10px] uppercase tracking-[0.2em] text-white/50 mb-1.5">{children}</div>;
}

export function formatNaira(kobo: number | string | null | undefined) {
  const n = Number(kobo || 0) / 100;
  return "₦" + n.toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
    processing: "bg-blue-500/15 text-blue-300 border-blue-500/30",
    shipped: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
    delivered: "bg-green-500/15 text-green-300 border-green-500/30",
    cancelled: "bg-red-500/15 text-red-300 border-red-500/30",
    refunded: "bg-orange-500/15 text-orange-300 border-orange-500/30",
    paid: "bg-green-500/15 text-green-300 border-green-500/30",
    unpaid: "bg-white/10 text-white/60 border-white/20",
  };
  const cls = map[status] ?? "bg-white/10 text-white/60 border-white/20";
  return <span className={`inline-block px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] border ${cls}`}>{status}</span>;
}
