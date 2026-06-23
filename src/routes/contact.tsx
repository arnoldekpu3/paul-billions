import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";
import { Mail, Phone, MapPin } from "lucide-react";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "Contact — Paul Billions" },
      { name: "description", content: "Get in touch with Paul Billions. We're here to help." },
    ],
  }),
});

function ContactPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-[1100px] px-4 sm:px-8 py-10 sm:py-16">
        <div className="text-center mb-12">
          <p className="text-[11px] tracking-luxe uppercase text-gold mb-3">We're listening</p>
          <h1 className="font-display text-4xl sm:text-5xl">Contact Us</h1>
          <p className="text-foreground/60 mt-4 max-w-md mx-auto text-sm">
            Questions about an order, sizing, or styling? Reach out — we typically reply within 24 hours.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_320px] gap-10">
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Name" />
              <Field label="Email" type="email" />
            </div>
            <Field label="Subject" />
            <label className="block">
              <span className="text-[10px] tracking-luxe uppercase text-foreground/60 block mb-1.5">Message</span>
              <textarea rows={6} className="w-full border border-border px-4 py-3 text-sm focus:border-gold focus:outline-none resize-none" />
            </label>
            <button className="bg-black text-white px-8 py-4 text-xs tracking-luxe uppercase font-semibold hover:bg-gold hover:text-black transition">
              Send message
            </button>
          </form>

          <aside className="space-y-5 lg:border-l lg:border-border lg:pl-10">
            <ContactItem icon={<Mail className="h-4 w-4" />} label="Email" value="hello@paulbillions.com" />
            <ContactItem icon={<Phone className="h-4 w-4" />} label="Phone" value="+234 800 000 0000" />
            <ContactItem icon={<MapPin className="h-4 w-4" />} label="Address" value="Lagos, Nigeria" />
          </aside>
        </div>
      </div>
    </PageShell>
  );
}

function Field({ label, type = "text" }: { label: string; type?: string }) {
  return (
    <label className="block">
      <span className="text-[10px] tracking-luxe uppercase text-foreground/60 block mb-1.5">{label}</span>
      <input type={type} className="w-full border border-border px-4 py-3 text-sm focus:border-gold focus:outline-none" />
    </label>
  );
}

function ContactItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-gold text-[10px] tracking-luxe uppercase mb-1.5">
        {icon} {label}
      </div>
      <p className="text-foreground text-sm">{value}</p>
    </div>
  );
}
