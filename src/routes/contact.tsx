import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell } from "@/components/site/PageShell";
import { SectionEyebrow } from "@/components/site/Section";
import { Phone, Mail, MapPin, MessageCircle, Clock } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — PAUL BILLIONS" },
      { name: "description", content: "Get in touch with PAUL BILLIONS. Phone, WhatsApp, email and our Lagos atelier." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [sent, setSent] = useState(false);
  return (
    <PageShell>
      <section className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 py-20 lg:py-28 grid lg:grid-cols-2 gap-12 lg:gap-20">
        <div>
          <SectionEyebrow>Contact</SectionEyebrow>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl mt-4 leading-[1.05]">
            We'd love to<br /> hear from you.
          </h1>
          <p className="mt-6 text-muted-foreground max-w-md">
            Questions about an order, sizing, or a custom request? Our concierge
            team is available six days a week.
          </p>

          <ul className="mt-10 space-y-5 text-sm">
            <Row icon={Phone} label="Phone" value="+234 800 000 0000" />
            <Row icon={MessageCircle} label="WhatsApp" value="+234 800 000 0000" />
            <Row icon={Mail} label="Email" value="hello@paulbillions.com" />
            <Row icon={MapPin} label="Atelier" value="Victoria Island, Lagos, Nigeria" />
            <Row icon={Clock} label="Hours" value="Mon–Sat · 9am – 7pm WAT" />
          </ul>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
          className="bg-secondary/50 border border-border p-8 sm:p-10"
        >
          <h2 className="font-display text-2xl mb-6">Send us a message</h2>
          {sent ? (
            <p className="text-sm text-gold">
              Thank you — your message has been received. We'll respond within
              24 hours.
            </p>
          ) : (
            <div className="space-y-4">
              <input required placeholder="Full name" className="w-full bg-background border border-border px-4 py-3 text-sm focus:border-gold focus:outline-none" />
              <input required type="email" placeholder="Email address" className="w-full bg-background border border-border px-4 py-3 text-sm focus:border-gold focus:outline-none" />
              <input placeholder="Phone (optional)" className="w-full bg-background border border-border px-4 py-3 text-sm focus:border-gold focus:outline-none" />
              <textarea required rows={5} placeholder="How can we help?" className="w-full bg-background border border-border px-4 py-3 text-sm focus:border-gold focus:outline-none resize-none" />
              <button className="w-full bg-black text-white py-4 text-xs tracking-luxe uppercase font-semibold hover:bg-gold hover:text-black transition-colors">
                Send Message
              </button>
            </div>
          )}
        </form>
      </section>
    </PageShell>
  );
}

function Row({ icon: Icon, label, value }: { icon: typeof Phone; label: string; value: string }) {
  return (
    <li className="flex items-start gap-4">
      <div className="h-10 w-10 grid place-items-center border border-gold/40 text-gold shrink-0">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-[10px] tracking-luxe uppercase text-muted-foreground">{label}</p>
        <p className="text-sm mt-1">{value}</p>
      </div>
    </li>
  );
}
