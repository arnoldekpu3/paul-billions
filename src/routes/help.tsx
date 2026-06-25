import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";

export const Route = createFileRoute("/help")({
  component: HelpPage,
  head: () => ({
    meta: [
      { title: "Help & FAQ — Paul Billions" },
      { name: "description", content: "Answers to common questions, shipping, returns, and how to contact Paul Billions support." },
    ],
  }),
});

const FAQ = [
  { q: "How long does shipping take?", a: "Standard delivery is 2–5 business days within Nigeria. International shipping is 7–14 days." },
  { q: "What is your return policy?", a: "We offer easy 14-day returns on unworn items in original condition. Contact support to start a return." },
  { q: "How do I track my order?", a: "Sign in and visit My Account → Orders. Tracking details appear when your order ships, and we'll email you as well." },
  { q: "Do you accept Pay on Delivery?", a: "Yes. Pay on Delivery is available for orders within Nigeria. Card payments are coming soon." },
  { q: "Are your products authentic?", a: "Every Paul Billions piece is hand-finished and authenticated by our atelier before shipping." },
  { q: "How do I change my email or password?", a: "Open My Account → Profile to change your email, and My Account → Security to update your password." },
  { q: "Can I cancel my order?", a: "Yes, contact support within 24 hours of placing your order and we will cancel it free of charge." },
];

function HelpPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-3xl px-4 sm:px-8 py-14 sm:py-20">
        <div className="text-center mb-12">
          <p className="text-[11px] tracking-luxe uppercase text-gold mb-3">Help Center</p>
          <h1 className="font-display text-4xl sm:text-5xl">How can we help?</h1>
          <p className="text-sm text-foreground/60 mt-4">
            Browse frequently asked questions or{" "}
            <Link to="/contact" className="text-gold underline">contact our team</Link>.
          </p>
        </div>

        <div className="divide-y divide-border border-t border-b border-border">
          {FAQ.map((f, i) => (
            <details key={i} className="group py-5 cursor-pointer">
              <summary className="flex justify-between items-center list-none">
                <span className="text-sm font-medium pr-4">{f.q}</span>
                <span className="text-gold text-xl group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="text-sm text-foreground/70 mt-3 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-foreground/70 mb-4">Still need help?</p>
          <Link
            to="/contact"
            className="inline-block bg-black text-white px-8 py-4 text-xs tracking-luxe uppercase font-semibold hover:bg-gold hover:text-black transition"
          >
            Contact support
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
