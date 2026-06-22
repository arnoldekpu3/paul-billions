import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";
import { SectionEyebrow } from "@/components/site/Section";
import { ArrowRight } from "lucide-react";

export function ComingSoon({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <PageShell>
      <section className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 py-24 lg:py-40 min-h-[60vh] flex">
        <div className="max-w-2xl">
          <SectionEyebrow>{eyebrow}</SectionEyebrow>
          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl mt-4 leading-[1.05]">
            {title}
          </h1>
          <p className="mt-6 text-muted-foreground max-w-lg leading-relaxed">
            {description}
          </p>
          <Link
            to="/"
            className="mt-10 inline-flex items-center gap-2 bg-gold text-black px-8 py-4 text-xs tracking-luxe uppercase font-semibold hover:bg-black hover:text-white transition-colors"
          >
            Back to home <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </PageShell>
  );
}

// Marker to satisfy bundler; this file exports no route.
export const Route = createFileRoute as never;
