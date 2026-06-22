import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";
import { SectionEyebrow } from "@/components/site/Section";
import storyImg from "@/assets/story.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — PAUL BILLIONS" },
      { name: "description", content: "More than fashion — a statement of confidence. Discover the story, mission and values behind PAUL BILLIONS." },
      { property: "og:title", content: "About PAUL BILLIONS" },
      { property: "og:description", content: "More than fashion, a statement of confidence." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <PageShell>
      <section className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 py-20 lg:py-28 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <div>
          <SectionEyebrow>About PAUL BILLIONS</SectionEyebrow>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl mt-4 leading-[1.05]">
            More than fashion,<br />
            a statement of <span className="italic text-gold">confidence</span>.
          </h1>
          <p className="mt-6 text-muted-foreground leading-relaxed">
            PAUL BILLIONS Clothing & Accessories was founded on a single belief:
            that true luxury isn't about a logo — it's about how a piece makes
            you feel the moment you put it on. We curate clothing, watches and
            accessories that combine craftsmanship, comfort and modern
            sophistication.
          </p>
        </div>
        <img
          src={storyImg}
          alt="PAUL BILLIONS atelier"
          width={1400}
          height={1024}
          loading="lazy"
          className="w-full aspect-[4/5] object-cover"
        />
      </section>

      <section className="bg-secondary/50 border-y border-border">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 py-20 grid md:grid-cols-3 gap-px bg-border">
          {[
            { t: "Mission", d: "To deliver world-class luxury fashion at fair, accessible prices for the modern Nigerian wardrobe." },
            { t: "Vision", d: "To become Africa's most loved luxury fashion house — known for craftsmanship, integrity and timeless style." },
            { t: "Values", d: "Quality without compromise. Honest pricing. A customer experience as considered as the clothes themselves." },
          ].map((v) => (
            <div key={v.t} className="bg-background p-8 sm:p-10">
              <p className="text-[11px] tracking-luxe uppercase text-gold mb-3">{v.t}</p>
              <p className="font-display text-xl leading-relaxed">{v.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl text-center px-4 sm:px-6 lg:px-10 py-20 lg:py-28">
        <SectionEyebrow>Why customers trust us</SectionEyebrow>
        <h2 className="font-display text-3xl sm:text-4xl mt-3 leading-tight">
          Considered quality. Honest pricing. Real care.
        </h2>
        <p className="mt-6 text-muted-foreground">
          Every order is hand-inspected before it leaves our atelier. Every
          customer has direct access to our team. And every piece is backed by
          a transparent returns policy. That's the PAUL BILLIONS promise.
        </p>
        <Link
          to="/shop"
          className="mt-10 inline-block bg-gold text-black px-8 py-4 text-xs tracking-luxe uppercase font-semibold hover:bg-black hover:text-white transition-colors"
        >
          Explore the Collection
        </Link>
      </section>
    </PageShell>
  );
}
