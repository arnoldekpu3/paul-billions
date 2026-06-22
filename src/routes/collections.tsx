import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/site/ComingSoon";

export const Route = createFileRoute("/collections")({
  head: () => ({
    meta: [
      { title: "Collections — PAUL BILLIONS" },
      { name: "description", content: "Explore curated luxury collections from PAUL BILLIONS." },
    ],
  }),
  component: () => (
    <ComingSoon
      eyebrow="Collections"
      title="Seasonal collections, coming soon."
      description="Capsule drops, editorial collections and special collaborations — all in one place."
    />
  ),
});
