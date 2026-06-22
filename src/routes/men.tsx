import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/site/ComingSoon";

export const Route = createFileRoute("/men")({
  head: () => ({
    meta: [
      { title: "Men's Fashion — PAUL BILLIONS" },
      { name: "description", content: "Premium men's clothing, watches and accessories in Nigeria." },
    ],
  }),
  component: () => (
    <ComingSoon
      eyebrow="Men"
      title="Tailored for the modern gentleman."
      description="Suiting, outerwear, footwear and accessories — the complete men's edit is on its way."
    />
  ),
});
